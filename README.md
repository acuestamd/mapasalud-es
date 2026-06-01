# MapaSalud — open map of Spain's hospitals

An open, **source-cited** map of the Spanish hospital system: where the hospitals
are, and — as the data is integrated — how they compare on **public quality
indicators by specialty**. Plus a doctor layer that does one honest thing:
**verify official credentials** (link to the colegiado/REPS record), not rank people.

No black-box scores. No scraped reviews. Strictly non-commercial. Every number is
meant to trace back to its primary source and dataset version.

**Why this exists.** The US has CMS Care Compare and US News *Best Hospitals*. Spain
has no open, objective, source-traceable equivalent — the existing rankings are
closed and survey-based. Spain *does* publish the raw material under an open licence
(Catálogo Nacional de Hospitales, RAE-CMBD/i-CMBD, INCLASNS). This turns it into a map.

## Status — v0.4

- ✅ **Locations**: 1,025+ hospitals seeded from OpenStreetMap (real coordinates, ODbL).
- ✅ **Base map**: provinces/CCAA from the Instituto Geográfico Nacional (CC-BY), rendered
  with `geoConicConformalSpain` so the **Canary Islands sit in an inset** from day one.
- ✅ **Quality by region**: 14 INCLASNS indicators by autonomous community — condition-specific
  in-hospital mortality (AMI, hip fracture, angioplasty, pneumonia, stroke), patient-safety
  (in-hospital hip fractures, post-surgical sepsis, lower-limb amputation in diabetics,
  avoidable diabetic admissions), and process measures (hip-fracture surgery <48h, ambulatory
  surgery, laparoscopic cholecystectomy) — choropleth + ranking, every figure linked to its
  source (datos de base CMBD/i-CMBD).
- ✅ **By specialty**: a clinical-area filter on the quality map (Cardiología, Traumatología,
  Neurología/ictus, Neumología, Cirugía, Atención primaria/evitables, Seguridad del paciente) that
  narrows the indicators to that area.
- ✅ **Per-hospital search** (`/buscar`): search all 1,025 hospitals; each is matched to its
  autonomous community by point-in-polygon, and its community's quality indicators are shown
  as context (per-hospital outcomes flagged as pending the CMBD request).
- ✅ **References**: cite-only links to external benchmarks (Newsweek/Statista, IQVIA TOP 20,
  Merco MRS, IDIS) and official open sources — never reproduced.
- ✅ **Doctor credential verification** — link-out to CGCOM colegiado + REPS (no scraping,
  no scores).
- ✅ **Self-running**: a scheduled GitHub Action refreshes the data and commits only real
  diffs (git-diffable history); Vercel rebuilds and redeploys on every push.
- ⏳ **Per-hospital** outcomes (i-CMBD microdata request) and the authoritative
  **Catálogo Nacional de Hospitales** join — next. Today's quality layer is regional (CCAA).

See `DATA-LICENSES.md` for every source, its licence, and how it's used.

## How it works

```
scripts/fetch_osm_hospitals.py     # fetch raw snapshot  -> data-raw/
scripts/normalize_osm_hospitals.py # normalize + sort    -> src/data/hospitals.geojson
src/index.md                       # Observable Framework page: d3 + composite projection
```

- Static site, **zero backend**, deployed to **Vercel** (mapasalud-es.vercel.app),
  auto-deployed from GitHub on every push.
- Key-free basemap (boundaries only — no tile provider, no API keys).
- Built with [Observable Framework](https://observablehq.com/framework/).

## Run locally

```bash
npm install
npm run data     # refresh hospital data (optional; committed data already present)
npm run dev      # preview at http://localhost:3000
npm run build    # build static site to dist/
```

## Roadmap

Shipped: INCLASNS quality by region (+ clinical-area filter + time series), SISLE waiting times
(+ per-community pages), hospital search, doctor credential verification (link-out), CCAA comparator,
CSV / open data, deep-links and source-cited share cards.

Next:
1. **Per-hospital** outcomes (risk-adjusted, with confidence intervals) — pending the free **i-CMBD**
   microdata request, joined via the **Catálogo Nacional de Hospitales / REGCESS** (CCN key).
2. Own domain (mapasalud.es), press kit + citation/DOI, security headers, CI.
3. MapLibre GL + PMTiles basemap once a per-municipio choropleth has real data.

## Disclaimer

These are **indicators to inform the questions you ask your doctor — not verdicts**,
and **not medical advice**. The quality figures shown today are **crude** regional rates
(not risk-adjusted); risk adjustment (GRD-APR) will arrive with the per-hospital i-CMBD
microdata. Low-volume regions are flagged and kept out of the colour scale.

## Licence

Code: **MIT** © Armando Cuesta. Data: see `DATA-LICENSES.md` (open government data
under RD 1495/2011 and CC-BY; proprietary rankings are cited/linked, never republished).
