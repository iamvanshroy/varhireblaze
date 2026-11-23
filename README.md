# VarHireBlaze — Free AI Resume Checker

Free browser games for job seekers (incl. the original Neon Series with coins, skins, achievements and global leaderboards), an ATS resume checker, resume templates and 3D desktop & phone wallpapers. No login, no payment — share to unlock wallpapers and templates.

- `index.html` — the whole site (scoring runs in the browser)
- `api/analyze.js` — AI feedback (Groq), runs on Vercel so the key stays secret
- `privacy.html` — privacy & cookies page (needed for AdSense)

## Go live (Vercel)
1. vercel.com → sign in with GitHub → **Add New → Project** → import this repo → Deploy.
2. Project → **Settings → Environment Variables** → add `GROQ_API_KEY` = your Groq key → Redeploy.

## Edit
Top of the `<script>` in `index.html` → `CONFIG`: your email and the site link people share.
