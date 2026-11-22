// Vercel serverless function: public view counter.
//   GET  /api/views  -> { views }   (read only)
//   POST /api/views  -> { views }   (adds one view, then returns the total)
// Needs an Upstash Redis database connected in Vercel → Storage. Vercel then adds
// KV_REST_API_URL + KV_REST_API_TOKEN (or UPSTASH_REDIS_REST_URL + _TOKEN) automatically.

const KEY = "varhireblaze:views";

export default async function handler(req, res) {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  res.setHeader("Cache-Control", "no-store");
  if (!url || !token) return res.status(503).json({ error: "Counter not set up yet." });
  if (req.method !== "GET" && req.method !== "POST")
    return res.status(405).json({ error: "Use GET or POST" });

  const cmd = req.method === "POST" ? `incr/${KEY}` : `get/${KEY}`;
  try {
    const r = await fetch(`${url.replace(/\/$/, "")}/${cmd}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await r.json();
    if (!r.ok) throw new Error(data.error || "Redis error");
    return res.status(200).json({ views: Number(data.result) || 0 });
  } catch (e) {
    return res.status(502).json({ error: "Counter unavailable." });
  }
}
