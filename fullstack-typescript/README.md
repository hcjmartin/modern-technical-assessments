# Take-home: Generate UI (quick fix)

**Time:** 30–40 minutes. Please don't spend any longer. Use AI tools as much as you like.

## Context
This mock app lets a creator type a prompt and get caption ideas. Generating takes about 8 seconds and sometimes fails. Users think the app is broken while they wait, and could leave before it finishes or click Generate again.

## Your task
1. Run the app and API (below) and try it.
2. You must introduce a quick fix while a longer-term solution is identified by the team. Generation can't be made faster (don't change the timing in `server/model.ts`), but you can change anything else, including the UI and the API. And if generation fails, the user should not lose their prompt.
3. Include a short `NOTES.md` (bullets are fine) in the root folder of your submission: what you changed and why. This part should not be AI-generated and will be discussed.

## Run it
Requires Node 20+.
```bash
npm install
npm run server   # terminal 1: API on http://localhost:8787
npm run dev      # terminal 2: app on http://localhost:5173
```
A prompt containing the word "fail" always fails, so you can test that path.

## What to submit (via email)
A zip or repo link with your changes and `NOTES.md`. Make sure the app still runs on submission. A short screen recording of the waiting experience (e.g. a Loom link or MP4) is welcome but not required.

Focus on decisions you can explain rather than polish. If you need any adjustments to the format or timing, just let us know.
