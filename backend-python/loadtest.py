"""Simulates a burst of clients sending events. Standard library only.

Usage: python loadtest.py [--requests 4000] [--concurrency 100] [--url http://127.0.0.1:8000]
"""
import argparse
import json
import time
import urllib.error
import urllib.request
import uuid
from collections import Counter
from concurrent.futures import ThreadPoolExecutor


def get_rows(url: str) -> int:
    with urllib.request.urlopen(f"{url}/stats", timeout=10) as r:
        return json.load(r)["rows"]


def send(url: str, i: int) -> tuple[int, float]:
    body = json.dumps({
        "event_id": str(uuid.uuid4()),
        "source": f"device-{i % 50}",
        "ts": time.time(),
        "payload": {"seq": i, "value": i * 0.5},
    }).encode()
    req = urllib.request.Request(f"{url}/events", data=body, method="POST",
                                 headers={"Content-Type": "application/json"})
    t0 = time.perf_counter()
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            code = r.status
    except urllib.error.HTTPError as e:
        code = e.code
    except Exception:
        code = 0  # connection error / timeout
    return code, (time.perf_counter() - t0) * 1000


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--url", default="http://127.0.0.1:8000")
    p.add_argument("--requests", type=int, default=4000)
    p.add_argument("--concurrency", type=int, default=100)
    p.add_argument("--settle", type=float, default=3.0, help="seconds to wait before counting rows")
    a = p.parse_args()

    before = get_rows(a.url)
    start = time.time()
    with ThreadPoolExecutor(a.concurrency) as pool:
        results = list(pool.map(lambda i: send(a.url, i), range(a.requests)))
    codes = Counter(c for c, _ in results)
    lat = sorted(ms for _, ms in results)
    elapsed = time.time() - start
    time.sleep(a.settle)
    stored = get_rows(a.url) - before

    accepted = sum(n for c, n in codes.items() if 200 <= c < 300)
    print(f"sent:      {a.requests} in {elapsed:.1f}s ({a.requests / elapsed:.0f} req/s)")
    print(f"responses: {dict(sorted(codes.items()))}  (0 = connection error/timeout)")
    print(f"latency:   p50 {lat[len(lat) // 2]:.0f} ms, p95 {lat[int(len(lat) * 0.95)]:.0f} ms")
    print(f"accepted:  {accepted}")
    print(f"stored:    {stored}")
    print(f"dropped:   {a.requests - stored}  (sent but not stored)")
    print(f"lost:      {max(accepted - stored, 0)}  (accepted by the API but not stored)")


if __name__ == "__main__":
    main()
