// Vercel serverless function: POST /api/analyze  { text, jd }
// The Groq key lives ONLY in Vercel → Settings → Environment Variables as GROQ_API_KEY.

const MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const key = process.env.GROQ_API_KEY;
  if (!key) return res.status(503).json({ error: "Detailed AI feedback is taking a short break. Your score, missing skills and fixes above are complete, so you can use those right away." });

  const { text = "", jd = "" } = req.body || {};
  if (typeof text !== "string" || text.trim().length < 80)
    return res.status(400).json({ error: "Resume text is empty." });

  const resume = text.slice(0, 12000);
  const job = String(jd).slice(0, 4000);

  const system =
    "You are a strict but friendly resume reviewer and ATS expert. " +
    "Give feedback in plain text (no markdown tables), max ~250 words, in this order:\n" +
    "1. One-line overall verdict.\n2. Top 3 strengths.\n3. Top 5 fixes, each with a rewritten example bullet.\n" +
    (job ? "4. Keywords from the job description that are missing.\n" : "") +
    "Be specific to THIS resume. Never invent experience the person does not have.";

  const user = `RESUME:\n${resume}` + (job ? `\n\nJOB DESCRIPTION:\n${job}` : "");

  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.4,
        max_tokens: 900,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
      }),
    });
    const data = await r.json();
    if (!r.ok) return res.status(502).json({ error: "AI is busy right now. Try again in a minute." });
    const feedback = (data.choices?.[0]?.message?.content || "").trim();
    return res.status(200).json({ feedback: feedback || "No feedback returned. Try again." });
  } catch {
    return res.status(502).json({ error: "AI is busy right now. Try again in a minute." });
  }
}
