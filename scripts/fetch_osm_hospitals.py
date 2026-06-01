#!/usr/bin/env python3
"""Fetch Spanish hospital locations from OpenStreetMap (Overpass) into a raw,
git-diffable snapshot. Locations only — quality metrics come from official
sources later. Tries several Overpass mirrors; sends a descriptive User-Agent.

Output: data-raw/osm_hospitals_es.json
"""
import json
import pathlib
import sys
import time
import urllib.parse
import urllib.request

OUT = pathlib.Path("data-raw/osm_hospitals_es.json")
UA = "mapasalud-es/0.1 (open hospital map of Spain; contact via github.com/acuestamd)"

# Spain (relation 1311341) -> Overpass area id 3600000000 + id
QUERY = """
[out:json][timeout:120];
area(3601311341)->.es;
(
  node["amenity"="hospital"](area.es);
  way["amenity"="hospital"](area.es);
  relation["amenity"="hospital"](area.es);
);
out tags center;
"""

MIRRORS = [
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass-api.de/api/interpreter",
    "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
]


def fetch():
    body = urllib.parse.urlencode({"data": QUERY}).encode()
    last_err = None
    for ep in MIRRORS:
        try:
            req = urllib.request.Request(ep, data=body, headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=150) as r:
                raw = r.read()
            data = json.loads(raw)
            if len(data.get("elements", [])) > 100:
                print(f"fetched {len(data['elements'])} elements from {ep}")
                return data
            last_err = f"too few elements from {ep}"
        except Exception as e:  # noqa: BLE001 - report and try next mirror
            last_err = f"{ep}: {e}"
            print("  retrying:", last_err, file=sys.stderr)
            time.sleep(3)
    raise SystemExit(f"all Overpass mirrors failed: {last_err}")


def main():
    data = fetch()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    # Stable ordering so the raw snapshot diffs cleanly.
    data["elements"].sort(key=lambda e: (e.get("type", ""), e.get("id", 0)))
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=0) + "\n")
    print(f"wrote {OUT}")


if __name__ == "__main__":
    main()
