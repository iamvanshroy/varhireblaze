// Vercel serverless function: POST /api/gamemaster { game, name, best, mood }
// VB Game Master: asks Groq (GROQ_API_KEY, already used by /api/analyze) for one short, fun
// challenge for a VarHireBlaze game. Only the game name, the player's best score and a mood word
// are sent: no personal data. Rate limited per IP with the same Upstash Redis as the leaderboard.
// If AI is unavailable the browser falls back to its own built-in challenge generator.

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";
const MOODS = ["chill", "spicy", "chaotic", "pro"];

async function rateOk(ip) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return true;
  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/pipeline`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([["INCR", `vhb:gm:${ip}`], ["EXPIRE", `vhb:gm:${ip}`, "3600", "NX"]]),
    });
    const d = await r.json();
    return Number(d?.[0]?.result || 0) <= 20; // 20 challenges per hour per IP
  } catch { return true; }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });
  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ error: "offline" });

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  const game = String(body.name || "").replace(/[^A-Za-z0-9 &'-]/g, "").slice(0, 40);
  const best = Math.max(0, Math.min(10000000, Math.floor(Number(body.best) || 0)));
  const unit = String(body.unit || "points").replace(/[^a-z ]/gi, "").slice(0, 16);
  const mood = MOODS.includes(body.mood) ? body.mood : "spicy";
  if (!game) return res.status(400).json({ error: "Pick a game" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "anon";
  if (!(await rateOk(ip))) return res.status(429).json({ error: "The Game Master needs a break. Try again later." });

  const system =
    "You are the VB Game Master for VarHireBlaze, a free browser game site for job seekers. " +
    "Write ONE short, playful challenge for the named game. Keep it clean, friendly, and suitable for all ages. " +
    "Reply ONLY with JSON: {\"title\": string (max 5 words), \"text\": string (max 28 words, second person, witty, may joke about job hunting or office life), \"target\": integer}. " +
    "target is the score to beat in one run, in the game's unit. Base it on the player's best: chill ≈ 70-90% of best, spicy ≈ 100-120%, chaotic ≈ 120-150%, pro ≈ 150-200%. If best is 0, pick a modest beginner target.";
  const user = `Game: ${game}\nUnit: ${unit}\nPlayer best: ${best}\nMood: ${mood}`;

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL, temperature: 0.9, max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: "busy" });
    const j = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    const title = String(j.title || "").slice(0, 48);
    const text = String(j.text || "").slice(0, 220);
    let target = Math.floor(Number(j.target));
    if (!title || !text || !Number.isFinite(target) || target < 1) return res.status(502).json({ error: "busy" });
    target = Math.min(target, Math.max(10, best * 3 || 50));
    return res.status(200).json({ title, text, target, ai: true });
  } catch {
    return res.status(502).json({ error: "busy" });
  }
}
