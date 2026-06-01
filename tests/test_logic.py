"""Tests de la LÓGICA pura del pipeline (no solo del JSON ya generado). Importa las
funciones de los scripts sin ejecutar su main (las importaciones pesadas como pdfplumber
son perezosas dentro de parse(), así que importar el módulo es seguro y sin red).
Ejecuta: python3 -m pytest -q"""
import importlib
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent.parent / "scripts"))
sisle = importlib.import_module("fetch_sisle")
norm = importlib.import_module("normalize_osm_hospitals")
incl = importlib.import_module("fetch_inclasns")


def test_code_for_distingue_castillas():
    assert sisle.code_for("CASTILLA-LA MANCHA") == "08"
    assert sisle.code_for("CASTILLA Y LEON") == "07"
    assert sisle.code_for("ANDALUCÍA") == "01"
    assert sisle.code_for("PAÍS VASCO") == "16"
    assert sisle.code_for("C. FORAL DE NAVARRA") == "15"
    assert sisle.code_for("MELILLA") == "19"
    assert sisle.code_for("TOTAL") == "ES"
    assert sisle.code_for("PALABRA RARA") is None


def test_to_float_formato_es():
    assert sisle.to_float("199.950") == 199950.0
    assert sisle.to_float("23,51") == 23.51
    assert sisle.to_float("121") == 121.0


def test_period_key():
    assert sisle.period_key("x/LISTAS_PUBLICACION_Dic_2025.pdf") == (2025, 12)
    assert sisle.period_key("x/listas_dic2024.pdf") == (2024, 12)
    assert sisle.period_key("x/LISTAS_jun_2025.pdf") == (2025, 6)


def test_tidy_name_quita_numeracion_no_nombres():
    assert norm.tidy_name("8- (CEMCAT)") == "(CEMCAT)"
    assert norm.tidy_name("· Hospital X") == "Hospital X"
    # No debe romper nombres que empiezan por número legítimo
    assert norm.tidy_name("Hospital 12 de Octubre") == "Hospital 12 de Octubre"
    assert norm.tidy_name("12 de Octubre") == "12 de Octubre"


def test_num_inclasns_descarta_nan():
    assert incl.num("8.12") == 8.12
    assert incl.num("NaN") is None
    assert incl.num("") is None
    assert incl.num(None) is None
