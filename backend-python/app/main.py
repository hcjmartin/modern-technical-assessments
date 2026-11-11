"""Event ingest service.

Clients POST small events; each one is written straight to SQLite.
"""
import os
import sqlite3
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

DB_PATH = os.environ.get("DB_PATH", "events.db")
SQLITE_TIMEOUT_S = 0.05  # keep requests snappy


class Event(BaseModel):
    event_id: str
    source: str
    ts: float
    payload: dict[str, Any] = {}


def connect() -> sqlite3.Connection:
    return sqlite3.connect(DB_PATH, timeout=SQLITE_TIMEOUT_S)


def init_db() -> None:
    conn = connect()
    conn.execute(
        """CREATE TABLE IF NOT EXISTS events (
               id INTEGER PRIMARY KEY AUTOINCREMENT,
               event_id TEXT NOT NULL,
               source TEXT NOT NULL,
               ts REAL NOT NULL,
               payload TEXT NOT NULL
           )"""
    )
    conn.execute("CREATE INDEX IF NOT EXISTS idx_events_source_ts ON events (source, ts)")
    conn.commit()
    conn.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="Ingest service", lifespan=lifespan)


@app.post("/events", status_code=201)
def ingest(event: Event):
    conn = connect()
    try:
        conn.execute(
            "INSERT INTO events (event_id, source, ts, payload) VALUES (?, ?, ?, ?)",
            (event.event_id, event.source, event.ts, event.model_dump_json(include={"payload"})),
        )
        conn.commit()
    except sqlite3.OperationalError as exc:
        raise HTTPException(status_code=503, detail=f"write failed: {exc}")
    finally:
        conn.close()
    return {"status": "stored"}


@app.get("/stats")
def stats():
    conn = connect()
    try:
        (rows,) = conn.execute("SELECT COUNT(*) FROM events").fetchone()
    finally:
        conn.close()
    return {"rows": rows}
