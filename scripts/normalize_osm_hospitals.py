#!/usr/bin/env python3
"""Normalize the raw OSM hospital snapshot into a stable, git-diffable GeoJSON.
v0.1 LOCATION source = OpenStreetMap (ODbL). Authoritative registry join
(Catalogo Nacional de Hospitales) + quality metrics (i-CMBD/INCLASNS) are the
next ingest. Output is sorted deterministically so diffs reflect real changes."""
import json, pathlib, re

RAW = pathlib.Path("data-raw/osm_hospitals_es.json")
OUT = pathlib.Path("src/data/hospitals.geojson")

def clean(s):
    return re.sub(r"\s+", " ", s).strip() if s else None


def tidy_name(name):
    """Quita numeración/viñetas iniciales tipo '8- ' o '· ' sin tocar nombres legítimos
    que empiezan por número (p. ej. '12 de Octubre')."""
    out = re.sub(r"^\s*\d+\s*[-–—.)]\s+", "", name)        # '8- ', '8. ', '8) '
    out = re.sub(r"^[\s·•*\-–—]+", "", out).strip()         # viñetas/guiones iniciales
    return out or name

def main():
    data = json.loads(RAW.read_text())
    feats = []
    for e in data.get("elements", []):
        t = e.get("tags", {})
        name = clean(t.get("name"))
        if not name:
            continue
        name = tidy_name(name)
        lat = e.get("lat") or (e.get("center") or {}).get("lat")
        lon = e.get("lon") or (e.get("center") or {}).get("lon")
        if lat is None or lon is None:
            continue
        beds = t.get("beds")
        try:
            beds = int(beds) if beds is not None else None
        except ValueError:
            beds = None
        feats.append({
            "type": "Feature",
            "geometry": {"type": "Point", "coordinates": [round(float(lon), 6), round(float(lat), 6)]},
            "properties": {
                "id": f"{e['type']}/{e['id']}",
                "name": name,
                "city": clean(t.get("addr:city")),
                "province": clean(t.get("addr:province")),
                "postcode": clean(t.get("addr:postcode")),
                "operator": clean(t.get("operator")),
                "operator_type": clean(t.get("operator:type")),  # public/private hint
                "beds": beds,
                "emergency": t.get("emergency"),
                "healthcare_speciality": clean(t.get("healthcare:speciality")),
                "website": clean(t.get("website") or t.get("contact:website")),
                "source": "OpenStreetMap",
            },
        })
    feats.sort(key=lambda f: (f["properties"]["name"].lower(), f["properties"]["id"]))
    fc = {
        "type": "FeatureCollection",
        "metadata": {
            "title": "Spanish hospitals — locations (v0.1 seed)",
            "location_source": "OpenStreetMap contributors (ODbL)",
            "note": "Locations only. Quality metrics (i-CMBD/INCLASNS) and the authoritative Catalogo Nacional de Hospitales join are pending — see DATA-LICENSES.md.",
            "count": len(feats),
        },
        "features": feats,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(fc, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote {OUT} with {len(feats)} hospitals")

if __name__ == "__main__":
    main()
