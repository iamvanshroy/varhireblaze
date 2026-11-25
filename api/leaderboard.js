// Vercel serverless function: global leaderboards for VarHireBlaze games.
//   GET  /api/leaderboard?game=photon          -> { top: [{ name, score }] }   (top 10)
//   POST /api/leaderboard { game, name, score } -> { top, rank }
//   GET  /api/leaderboard?game=all             -> { records: { game: { name, score } } }  (VB World Records)
//   Daily boards (survival, brain) also take ?day=YYYY-MM-DD / { day } and reset every day.
// Uses the same Upstash Redis database as /api/views (KV_REST_API_URL + KV_REST_API_TOKEN).
// One entry per nickname per game; only a player's best score is kept.

const GAMES = {
  // max believable score per game (anything above is rejected)
  photon: 200000, apex: 500000, pulse: 500000, rope: 100000, gradient: 200000, horde: 500000, drift: 1000000, flip: 200000, boss: 500000, jam: 200000, wfh: 500000, grind: 200000,
  racer: 100000, surfers: 500000, cricket: 10000, flight: 100000, cart: 100000, football: 10000, flappy: 5000, rush: 10000, pong: 1000,
  snake: 100000, breakout: 1000000, invaders: 1000000, salary: 10000000, memory: 100000, catch: 100000,
  wake: 200000, metro: 200000, stairs: 100000, shop: 500000,
  survival: 36000, brain: 3000,
};
const DAILY = { survival: 1, brain: 1 };

// a daily board accepts today's date, or yesterday/tomorrow so every time zone works
function dayKey(game, raw) {
  if (!DAILY[game]) return `vhb:lb:${game}`;
  const d = String(raw || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
  const diff = Math.abs(Date.parse(d + "T12:00:00Z") - Date.now());
  if (!(diff < 40 * 3600 * 1000)) return null;
  return `vhb:lb:${game}:${d}`;
}
const BAD = ["fuck", "shit", "bitch", "cunt", "dick", "pussy", "nigg", "fag", "rape", "porn", "sex", "chut", "bhosd", "madar", "behen", "lund", "gaand", "randi", "chod"];

function cleanName(raw) {
  const n = String(raw || "").replace(/[^A-Za-z0-9 _.-]/g, "").replace(/\s+/g, " ").trim().slice(0, 14);
  if (n.length < 2) return null;
  const low = n.toLowerCase().replace(/[^a-z]/g, "");
  if (BAD.some((w) => low.includes(w))) return null;
  return n;
}

async function redis(cmds) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw Object.assign(new Error("not set up"), { code: 503 });
  const r = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(cmds),
  });
  const data = await r.json();
  if (!r.ok) throw new Error("redis");
  return data.map((d) => d.result);
}

function parseTop(flat) {
  const out = [];
  for (let i = 0; i + 1 < (flat || []).length; i += 2) out.push({ name: flat[i], score: Number(flat[i + 1]) || 0 });
  return out;
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  try {
    if (req.method === "GET") {
      const game = String(req.query.game || "");
      if (game === "all") {
        const keys = Object.keys(GAMES).filter((g) => !DAILY[g]);
        const rows = await redis(keys.map((g) => ["ZREVRANGE", `vhb:lb:${g}`, "0", "0", "WITHSCORES"]));
        const records = {};
        keys.forEach((g, i) => { const t = parseTop(rows[i]); if (t.length) records[g] = t[0]; });
        res.setHeader("Cache-Control", "public, s-maxage=30");
        return res.status(200).json({ records });
      }
      if (!GAMES[game]) return res.status(400).json({ error: "Unknown game" });
      const k = dayKey(game, req.query.day);
      if (!k) return res.status(400).json({ error: "Bad day" });
      const [flat] = await redis([["ZREVRANGE", k, "0", "9", "WITHSCORES"]]);
      return res.status(200).json({ top: parseTop(flat) });
    }
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
      const game = String(body.game || "");
      const score = Math.floor(Number(body.score));
      const name = cleanName(body.name);
      if (!GAMES[game]) return res.status(400).json({ error: "Unknown game" });
      if (!name) return res.status(400).json({ error: "Pick a nickname (2–14 letters or numbers, nothing rude)." });
      if (!Number.isFinite(score) || score <= 0 || score > GAMES[game]) return res.status(400).json({ error: "Score not accepted." });

      // light rate limit: one submission per IP per game every 5 seconds
      const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
      const [ok] = await redis([["SET", `vhb:rl:${game}:${ip}`, "1", "NX", "EX", "5"]]);
      if (ok !== "OK") return res.status(429).json({ error: "Slow down a little and try again." });

      const key = dayKey(game, body.day);
      if (!key) return res.status(400).json({ error: "That daily round has ended." });
      const cmds = [
        ["ZADD", key, "GT", String(score), name],
        ["ZREVRANK", key, name],
        ["ZREVRANGE", key, "0", "9", "WITHSCORES"],
        ["ZREMRANGEBYRANK", key, "0", "-501"],
      ];
      if (DAILY[game]) cmds.push(["EXPIRE", key, String(9 * 86400)]);
      const [, rank, flat] = await redis(cmds);
      return res.status(200).json({ top: parseTop(flat), rank: rank == null ? null : Number(rank) + 1 });
    }
    return res.status(405).json({ error: "Use GET or POST" });
  } catch (e) {
    if (e.code === 503) return res.status(503).json({ error: "Leaderboard not set up yet." });
    return res.status(502).json({ error: "Leaderboard unavailable right now." });
  }
}
