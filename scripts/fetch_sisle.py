#!/usr/bin/env python3
"""Extrae las listas de espera QUIRÚRGICAS por comunidad autónoma del informe SISLE-SNS
(Ministerio de Sanidad, RD 605/2003), publicado en PDF.

Auto-descubre el último informe desde la página de SISLE (no usa URL fija), parsea la
tabla "Distribución por comunidades autónomas" (texto, no imagen) con validación estricta
—si no salen ~todas las CCAA + el total nacional, aborta— y toma la fecha del propio PDF.

Salida: src/data/sisle.json  (snapshot: data-raw/sisle.pdf)
"""
import json
import pathlib
import re
import sys
import unicodedata
import urllib.parse
import urllib.request

LANDING = "https://www.sanidad.gob.es/estadEstudios/estadisticas/inforRecopilaciones/listaEspera.htm"
# Respaldo por si la página cambia de formato y no se puede descubrir el enlace.
FALLBACK_URL = "https://www.sanidad.gob.es/estadEstudios/estadisticas/inforRecopilaciones/docs/LISTAS_PUBLICACION_Dic_2025.pdf"
PDF = pathlib.Path("data-raw/sisle.pdf")
OUT = pathlib.Path("src/data/sisle.json")
HIST = pathlib.Path("src/data/sisle-history.json")
UA = "mapasalud-es/0.4 (open hospital map of Spain; github.com/acuestamd)"

KEYMAP = [
    ("ANDALUC", "01"), ("ARAGON", "02"), ("ASTURIAS", "03"), ("BALEAR", "04"),
    ("CANARIA", "05"), ("CANTABRIA", "06"), ("MANCHA", "08"), ("CASTILLA Y", "07"),
    ("LEON", "07"), ("CATALU", "09"), ("VALENCIANA", "10"), ("EXTREMADURA", "11"),
    ("GALICIA", "12"), ("MADRID", "13"), ("MURCIA", "14"), ("NAVARRA", "15"),
    ("VASCO", "16"), ("RIOJA", "17"), ("CEUTA", "18"), ("MELILLA", "19"), ("TOTAL", "ES"),
]
MONTHS_ABBR = {"ene": 1, "feb": 2, "mar": 3, "abr": 4, "may": 5, "jun": 6,
               "jul": 7, "ago": 8, "sep": 9, "oct": 10, "nov": 11, "dic": 12}
MONTHS_FULL = {"enero": 1, "febrero": 2, "marzo": 3, "abril": 4, "mayo": 5, "junio": 6,
               "julio": 7, "agosto": 8, "septiembre": 9, "octubre": 10, "noviembre": 11, "diciembre": 12}


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


def period_key(url):
    """(año, mes) a partir del nombre del fichero, para elegir el informe más reciente."""
    fn = url.lower()
    y = re.search(r"(20\d{2})", fn)
    year = int(y.group(1)) if y else 0
    month = next((n for ab, n in MONTHS_ABBR.items() if ab in fn), 0)
    return (year, month)


def discover_url():
    try:
        req = urllib.request.Request(LANDING, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=60) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:  # noqa: BLE001
        print(f"  WARN: no se pudo leer la página de SISLE ({e}); uso respaldo", file=sys.stderr)
        return FALLBACK_URL
    hrefs = re.findall(r'href="([^"]*LISTAS_PUBLICACION[^"]*\.pdf)"', html, re.I)
    cands = [(period_key(urllib.parse.urljoin(LANDING, h)), urllib.parse.urljoin(LANDING, h)) for h in hrefs]
    if not cands:
        print("  WARN: no se halló enlace LISTAS_PUBLICACION; uso respaldo", file=sys.stderr)
        return FALLBACK_URL
    cands.sort()
    url = cands[-1][1]
    print(f"  informe descubierto: {url}")
    return url


def download(url):
    PDF.parent.mkdir(parents=True, exist_ok=True)
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r:
        PDF.write_bytes(r.read())


def parse():
    import pdfplumber
    with pdfplumber.open(PDF) as pdf:
        page_text, full = None, []
        for pg in pdf.pages:
            t = pg.extract_text() or ""
            full.append(t)
            if "comunidades autónomas" in t.lower() and "QUIRÚRGICA" in t.upper() and not page_text:
                page_text = t
    if not page_text:
        raise SystemExit("ERROR SISLE: no se encontró la tabla por comunidades autónomas")

    # fecha del propio informe: "DATOS A 31 DE DICIEMBRE DE 2025"
    version = None
    md = re.search(r"DATOS A (\d{1,2}) DE (\w+) DE (\d{4})", "\n".join(full), re.I)
    if md and md.group(2).lower() in MONTHS_FULL:
        version = f"{md.group(3)}-{MONTHS_FULL[md.group(2).lower()]:02d}-{int(md.group(1)):02d}"

    pat = re.compile(r"^([A-ZÁÉÍÓÚÑ.\-\s]+?)\s+([\d.]+)\s+(\d+,\d+)\s+.*?\s+(\d+,\d+)\s+(\d+)(?:\s|$)")
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

    ccaa_codes = {c for c in dias if c != "ES"}
    if len(ccaa_codes) < 18 or "ES" not in dias:
        raise SystemExit(f"ERROR SISLE: solo {len(ccaa_codes)} CCAA + {'ES' if 'ES' in dias else 'sin total'}; aborto")
    if not (30 <= dias["ES"] <= 400):
        raise SystemExit(f"ERROR SISLE: tiempo medio nacional fuera de rango: {dias['ES']}")
    return version, dias, pct6m, tasa, total


def main():
    url = discover_url()
    download(url)
    version, dias, pct6m, tasa, total = parse()
    if not version:
        yr = period_key(url)[0]
        version = str(yr) if yr else "desconocida"
    doc = {
        "title": "Listas de espera quirúrgicas del SNS por comunidad autónoma",
        "source": "SISLE-SNS — Sistema de Información de Listas de Espera, Ministerio de Sanidad (RD 605/2003).",
        "sourceUrl": url,
        "version": version,
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
    print(f"wrote {OUT}: {len(dias)-1} CCAA + total · {version} · nacional {dias['ES']} días")

    # Histórico: acumula cada informe por versión (se amplía con cada publicación semestral).
    hist = json.loads(HIST.read_text()) if HIST.exists() else {
        "title": "Histórico SISLE por versión (espera quirúrgica)", "periods": {}}
    hist["periods"][version] = {"espera_dias": dias, "pct_mas_6m": pct6m, "tasa_1000": tasa}
    HIST.write_text(json.dumps(hist, ensure_ascii=False, indent=1) + "\n")
    print(f"histórico: {len(hist['periods'])} periodo(s) en {HIST}")


if __name__ == "__main__":
    main()
