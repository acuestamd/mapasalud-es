#!/usr/bin/env python3
"""Extrae las listas de espera QUIRÚRGICAS por comunidad autónoma del informe SISLE-SNS
(Ministerio de Sanidad, RD 605/2003), publicado en PDF. Parseo de la tabla "Distribución
por comunidades autónomas" (texto extraíble, no imagen) con validación estricta: si no se
obtienen ~todas las CCAA + el total nacional, aborta (no se publica nada parcial).

Pin del informe (semestral; al salir uno nuevo, actualizar URL + VERSION):
  Datos a 31-dic-2025.
Salida: src/data/sisle.json  (snapshot: data-raw/sisle.pdf)
"""
import json
import pathlib
import re
import sys
import unicodedata
import urllib.request

URL = "https://www.sanidad.gob.es/estadEstudios/estadisticas/inforRecopilaciones/docs/LISTAS_PUBLICACION_Dic_2025.pdf"
VERSION = "2025-12-31"
PDF = pathlib.Path("data-raw/sisle.pdf")
OUT = pathlib.Path("src/data/sisle.json")
UA = "mapasalud-es/0.4 (open hospital map of Spain; github.com/acuestamd)"

# Palabra clave (sin acentos, mayúsculas) -> código INE de CCAA. Orden importa.
KEYMAP = [
    ("ANDALUC", "01"), ("ARAGON", "02"), ("ASTURIAS", "03"), ("BALEAR", "04"),
    ("CANARIA", "05"), ("CANTABRIA", "06"), ("MANCHA", "08"), ("CASTILLA Y", "07"),
    ("LEON", "07"), ("CATALU", "09"), ("VALENCIANA", "10"), ("EXTREMADURA", "11"),
    ("GALICIA", "12"), ("MADRID", "13"), ("MURCIA", "14"), ("NAVARRA", "15"),
    ("VASCO", "16"), ("RIOJA", "17"), ("CEUTA", "18"), ("MELILLA", "19"), ("TOTAL", "ES"),
]


def deburr(s):
    return "".join(c for c in unicodedata.normalize("NFD", s) if not unicodedata.combining(c)).upper()


def code_for(name):
    up = deburr(name)
    for kw, code in KEYMAP:
        if kw in up:
            return code
    return None


def to_float(tok):
    return float(tok.replace(".", "").replace(",", "."))


def download():
    PDF.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(URL, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        PDF.write_bytes(r.read())


def parse():
    import pdfplumber
    # Localiza la página con la "Distribución por comunidades autónomas" quirúrgica.
    with pdfplumber.open(PDF) as pdf:
        page_text = None
        for pg in pdf.pages:
            t = pg.extract_text() or ""
            if "comunidades autónomas" in t.lower() and "QUIRÚRGICA" in t.upper():
                page_text = t
                break
    if not page_text:
        raise SystemExit("ERROR SISLE: no se encontró la tabla por comunidades autónomas")

    # name  total  tasa  (>6m ruidoso)  %  tiempo_medio_dias  (texto suelto al final)
    pat = re.compile(
        r"^([A-ZÁÉÍÓÚÑ.\-\s]+?)\s+([\d.]+)\s+(\d+,\d+)\s+.*?\s+(\d+,\d+)\s+(\d+)(?:\s|$)")
    dias, pct6m, tasa, total = {}, {}, {}, {}
    for line in page_text.split("\n"):
        m = pat.match(line.strip())
        if not m:
            continue
        code = code_for(m.group(1))
        if not code:
            continue
        total[code] = round(to_float(m.group(2)))
        tasa[code] = to_float(m.group(3))
        pct6m[code] = to_float(m.group(4))
        dias[code] = int(m.group(5))

    # Validación: deben estar las 17 CCAA + Ceuta/Melilla + TOTAL (ES), y rangos plausibles.
    ccaa_codes = {c for c in dias if c != "ES"}
    if len(ccaa_codes) < 18 or "ES" not in dias:
        raise SystemExit(f"ERROR SISLE: solo {len(ccaa_codes)} CCAA + {'ES' if 'ES' in dias else 'sin total'}; aborto")
    if not (30 <= dias["ES"] <= 400):
        raise SystemExit(f"ERROR SISLE: tiempo medio nacional fuera de rango: {dias['ES']}")
    return dias, pct6m, tasa, total


def main():
    download()
    dias, pct6m, tasa, total = parse()
    doc = {
        "title": "Listas de espera quirúrgicas del SNS por comunidad autónoma",
        "source": "SISLE-SNS — Sistema de Información de Listas de Espera, Ministerio de Sanidad (RD 605/2003).",
        "sourceUrl": URL,
        "version": VERSION,
        "indicators": [
            {"id": "espera_dias", "name": "Tiempo medio de espera quirúrgica (días)",
             "betterWhen": "lower", "unit": "días", "values": dias},
            {"id": "pct_mas_6m", "name": "Pacientes en espera quirúrgica > 6 meses (%)",
             "betterWhen": "lower", "unit": "%", "values": pct6m},
            {"id": "tasa_1000", "name": "Pacientes en lista de espera quirúrgica por 1.000 hab.",
             "betterWhen": "lower", "unit": "‰", "values": tasa},
        ],
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(doc, ensure_ascii=False, indent=1) + "\n")
    print(f"wrote {OUT}: {len(dias)-1} CCAA + total · nacional {dias['ES']} días")


if __name__ == "__main__":
    main()
