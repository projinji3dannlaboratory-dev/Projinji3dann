"""Direct API smoke test - tries multiple key/auth combinations."""
import os
import sys
from pathlib import Path

import httpx
from dotenv import load_dotenv

REPO_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(REPO_ROOT / ".env.local")

raw_key = os.environ["EDINET_API_KEY"]
print(f"raw key: {raw_key}  (len {len(raw_key)})")

# strip an `edb_` prefix if present
stripped = raw_key.removeprefix("edb_")
print(f"stripped: {stripped}  (len {len(stripped)})")

url = "https://api.edinet-fsa.go.jp/api/v2/documents.json"

attempts = [
    ("query Subscription-Key (raw)",        {"params": {"date": "2025-06-30", "type": "2", "Subscription-Key": raw_key}, "headers": {}}),
    ("query Subscription-Key (stripped)",   {"params": {"date": "2025-06-30", "type": "2", "Subscription-Key": stripped}, "headers": {}}),
    ("header Ocp-Apim-Subscription-Key (raw)",      {"params": {"date": "2025-06-30", "type": "2"}, "headers": {"Ocp-Apim-Subscription-Key": raw_key}}),
    ("header Ocp-Apim-Subscription-Key (stripped)", {"params": {"date": "2025-06-30", "type": "2"}, "headers": {"Ocp-Apim-Subscription-Key": stripped}}),
    ("query api-key (raw)",      {"params": {"date": "2025-06-30", "type": "2", "api-key": raw_key}, "headers": {}}),
    ("query api-key (stripped)", {"params": {"date": "2025-06-30", "type": "2", "api-key": stripped}, "headers": {}}),
]

for label, kwargs in attempts:
    try:
        r = httpx.get(url, timeout=30.0, **kwargs)
        body = r.text[:140].replace("\n", " ")
        print(f"[{r.status_code}] {label}\n   -> {body}")
    except Exception as e:
        print(f"[ERR] {label}: {e}")
