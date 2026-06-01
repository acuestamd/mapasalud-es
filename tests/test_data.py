"""Validación de esquema de los datos publicados (evita publicar datos rotos).
Ejecuta: python3 -m pytest -q"""
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent


def load(rel):
    return json.loads((ROOT / rel).read_text(encoding="utf-8"))


def test_inclasns_schema():
    d = load("src/data/inclasns.json")
    inds = d["indicators"]
    assert len(inds) == 14, f"esperados 14 indicadores, hay {len(inds)}"
    assert d.get("dataYear"), "falta dataYear"
    for i in inds:
        assert i["betterWhen"] in ("lower", "higher"), i["id"]
        assert i["sexes"], i["id"]
        sx = i["sexes"][0]
        yr = i["latestYear"][sx]
        codes = set(i["values"][sx][yr]) - {"ES"}
        assert len(codes) >= 15, f"indicador {i['id']}: solo {len(codes)} CCAA en {yr}"


def test_inclasns_no_dead_domain():
    d = load("src/data/inclasns.json")
    for i in d["indicators"]:
        assert "mscbs.gob.es" not in i["sourceUrl"], i["id"]
        assert "msssi.es" not in i["sourceUrl"], i["id"]


def test_hospitals_ccaa_assigned():
    d = load("src/data/hospitals.geojson")
    feats = d["features"]
    assert len(feats) > 900, f"pocos hospitales: {len(feats)}"
    sin_ccaa = [f for f in feats if not f["properties"].get("ccaa")]
    assert not sin_ccaa, f"{len(sin_ccaa)} hospitales sin CCAA asignada"


def test_hospital_names_clean():
    d = load("src/data/hospitals.geojson")
    bad = [f["properties"]["name"] for f in d["features"]
           if re.match(r"^\s*\d+\s*[-–—.)]\s", f["properties"]["name"])
           or f["properties"]["name"][:1] in "-–—·•*"]
    assert not bad, f"nombres con prefijo raro: {bad[:5]}"
