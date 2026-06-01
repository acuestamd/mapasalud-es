#!/usr/bin/env python3
"""Fetch a curated set of hospital-quality indicators from INCLASNS (Indicadores
Clave del SNS, Ministerio de Sanidad) via its keyless chart endpoint and normalize
them into a compact, git-diffable JSON keyed by autonomous-community INE code.

Source: https://inclasns.sanidad.gob.es/  (open data, RD 1495/2011).
Underlying data: CMBD / i-CMBD. Granularity is regional (CCAA), not per-hospital.

Output: src/data/inclasns.json
"""
import json
import pathlib
import sys
import time
import urllib.request

OUT = pathlib.Path("src/data/inclasns.json")
BASE = "https://inclasns.sanidad.gob.es/export/data?indicators="
UA = "mapasalud-es/0.1 (open hospital map of Spain; github.com/acuestamd)"

# Curated quality indicators: id -> (name, better-direction). Direction is set from
# clinical meaning (mortality lower is better), not the source's flag, which is
# inconsistent for some indicators.
INDICATORS = {
    125: ("Mortalidad intrahospitalaria global (por 100 altas)", "lower"),
    129: ("Mortalidad intrahospitalaria tras infarto agudo de miocardio (por 100 altas por IAM)", "lower"),
    128: ("Mortalidad intrahospitalaria tras fractura de cadera (por 100 altas)", "lower"),
    127: ("Mortalidad intrahospitalaria tras angioplastia coronaria (por 100 altas)", "lower"),
    132: ("Mortalidad intrahospitalaria por neumonía (por 100 altas)", "lower"),
    331: ("Mortalidad intrahospitalaria por ictus hemorrágico (por 100 altas)", "lower"),
    332: ("Mortalidad intrahospitalaria por ictus isquémico (por 100 altas)", "lower"),
    119: ("Fractura de cadera intervenida en las primeras 48 h (%)", "higher"),
    91: ("Cirugía ambulatoria en el SNS (%)", "higher"),
    114: ("Colecistectomía por laparoscopia (%)", "higher"),
    121: ("Fractura de cadera en pacientes ingresados (seguridad del paciente)", "lower"),
    133: ("Amputación de miembro inferior en personas con diabetes (evitable, sensible a primaria)", "lower"),
    330: ("Hospitalización por complicaciones agudas de la diabetes (evitable, sensible a primaria)", "lower"),
    337: ("Sepsis postquirúrgica", "lower"),
}

# INCLASNS area slug -> INE autonomous-community code (matches es-atlas geometry id).
CCAA = {
    "andalucia": "01", "aragon": "02", "asturias": "03", "baleares": "04",
    "canarias": "05", "cantabria": "06", "castillayleon": "07", "castillalamancha": "08",
    "cataluna": "09", "comunidadvalenciana": "10", "extremadura": "11", "galicia": "12",
    "madrid": "13", "murcia": "14", "navarra": "15", "paisvasco": "16", "riojala": "17",
    "ceuta": "18", "melilla": "19",
}


def num(v):
    try:
        f = float(v)
        return f if f == f else None  # drop NaN
    except (TypeError, ValueError):
        return None


def fetch(ind_id):
    req = urllib.request.Request(BASE + str(ind_id), headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=90) as r:
        return json.loads(r.read())


def main():
    out_indicators = []
    for ind_id, (name, better) in INDICATORS.items():
        try:
            payload = fetch(ind_id)
        except Exception as e:  # noqa: BLE001
            print(f"  WARN indicator {ind_id} failed: {e}", file=sys.stderr)
            continue
        block = payload[0]
        meta = block["indicator"]
        rows = block["data"]
        # values[sex][year][ineCodeOrES] = float
        values = {}
        sexes, years = set(), set()
        for r in rows:
            v = num(r.get("value"))
            if v is None:
                continue
            sex = r["sex"]["name"]
            yr = r["year"]["name"].replace("year", "")
            area = r["areaCode"]["name"]
            key = "ES" if area == "espana" else CCAA.get(area)
            if key is None:
                continue
            values.setdefault(sex, {}).setdefault(yr, {})[key] = round(v, 2)
            sexes.add(sex)
            years.add(yr)
        latest = {}
        for sex in sexes:
            ys = [y for y in values[sex] if any(k != "ES" for k in values[sex][y])]
            if ys:
                latest[sex] = max(ys)
        out_indicators.append({
            "id": ind_id,
            "name": name,
            "group": meta.get("largeGroup") or meta.get("tags"),
            "betterWhen": better,
            "format": meta.get("numberFormat", "0.00"),
            "sourceUrl": (meta.get("sourceUrl") or "").split("\n")[0]
                         .replace("mscbs.gob.es", "sanidad.gob.es").replace("msssi.es", "sanidad.gob.es")
                         or "https://inclasns.sanidad.gob.es/",
            "sexes": sorted(sexes, key=lambda s: {"total": 0, "mujer": 1, "hombre": 2}.get(s, 3)),
            "latestYear": latest,
            "values": values,
        })
        print(f"  ok {ind_id}: {name[:48]} | sexes={sorted(sexes)} | latest={latest}")
        time.sleep(1)

    doc = {
        "title": "Indicadores de calidad hospitalaria por comunidad autónoma",
        "source": "INCLASNS — Indicadores Clave del SNS, Ministerio de Sanidad (RD 1495/2011). "
                  "Datos de base: CMBD / i-CMBD. Granularidad regional (CCAA), no por hospital.",
        "sourceHome": "https://inclasns.sanidad.gob.es/",
        "ccaa": CCAA,
        "indicators": out_indicators,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote {OUT} with {len(out_indicators)} indicators")


if __name__ == "__main__":
    main()
