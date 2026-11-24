// Vercel serverless function: global leaderboards for VarHireBlaze games.
//   GET  /api/leaderboard?game=photon          -> { top: [{ name, score }] }   (top 10)
//   POST /api/leaderboard { game, name, score } -> { top, rank }
// Uses the same Upstash Redis database as /api/views (KV_REST_API_URL + KV_REST_API_TOKEN).
// One entry per nickname per game; only a player's best score is kept.

const GAMES = {
  // max believable score per game (anything above is rejected)
  photon: 200000, apex: 500000, pulse: 500000, rope: 100000, gradient: 200000, horde: 500000, drift: 1000000, flip: 200000, boss: 500000, jam: 200000, wfh: 500000, grind: 200000,
  racer: 100000, surfers: 500000, cricket: 10000, flight: 100000, cart: 100000, football: 10000, flappy: 5000, rush: 10000, pong: 1000,
  snake: 100000, breakout: 1000000, invaders: 1000000, salary: 10000000, memory: 100000, catch: 100000,
};
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
      if (!GAMES[game]) return res.status(400).json({ error: "Unknown game" });
      const [flat] = await redis([["ZREVRANGE", `vhb:lb:${game}`, "0", "9", "WITHSCORES"]]);
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

      const key = `vhb:lb:${game}`;
      const [, rank, flat] = await redis([
        ["ZADD", key, "GT", String(score), name],
        ["ZREVRANK", key, name],
        ["ZREVRANGE", key, "0", "9", "WITHSCORES"],
        ["ZREMRANGEBYRANK", key, "0", "-501"],
      ]);
      return res.status(200).json({ top: parseTop(flat), rank: rank == null ? null : Number(rank) + 1 });
    }
    return res.status(405).json({ error: "Use GET or POST" });
  } catch (e) {
    if (e.code === 503) return res.status(503).json({ error: "Leaderboard not set up yet." });
    return res.status(502).json({ error: "Leaderboard unavailable right now." });
  }
}
