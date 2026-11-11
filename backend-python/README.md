# Take-home: ingest service

**Time:** 30–40 minutes. Please don't spend any longer. Use AI tools as much as you like.

## Context
This service accepts small events from clients and writes each one to SQLite. Traffic has grown sharply, and under load many writes are now rejected and never stored.

## Your task
1. Run the service and the load test (below) to see the problem.
2. Implement a quick fix in the API so that no writes are dropped, without making p95 latency worse than it is now. Compare the load test output before and after.
3. Constraints: no new servers or infrastructure (no Redis, Kafka, Postgres or extra processes). The fix must live in this API, with SQLite as the store.
4. Include a short `NOTES.md` (bullets are fine) in the root folder of your submission: what you changed in this quick fix and why. This part should not be AI-generated.

## Run it
```bash
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --port 8000     # terminal 1
python loadtest.py                   # terminal 2
```
Delete `events.db` between runs if you want a clean start.

## What to send back
A zip or repo link with your changes and `NOTES.md`. Focus on decisions you can explain rather than polish. If you need any adjustments to the format or timing, just let us know.
