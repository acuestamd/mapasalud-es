# Data sources & licences

This project separates **open, reusable** data (the analytical backbone) from
**proprietary** rankings (cited and linked only, never republished). Every figure
shown on the site is meant to link to its primary source and dataset version.

## In use (v0.1)

| Source | Use | Licence | Attribution / notes |
|---|---|---|---|
| **OpenStreetMap** (Overpass) | Hospital **locations** (seed for v0.1) | **ODbL** | © OpenStreetMap contributors. Locations only — not a quality measure. |
| **es-atlas** (martgnz), from **IGN** | Province / autonomous-region boundaries | data **CC-BY 4.0** (IGN); code MIT | Used with `geoConicConformalSpain` for the Canary Islands inset. Preferred over GADM (non-commercial). |
| **INCLASNS** (Indicadores Clave del SNS), Ministerio de Sanidad | **Quality indicators by CCAA**: condition-specific in-hospital mortality (AMI, hip fracture, angioplasty, pneumonia, stroke), hip-fracture surgery <48h, ambulatory surgery | open, **RD 1495/2011** | "Origen de los datos: Ministerio de Sanidad." Pulled via the site's keyless chart endpoint (`/export/data`). Datos de base: CMBD/i-CMBD. Regional, not per-hospital. |

## Integrating next — open government data (RD 1495/2011, commercial reuse with attribution)

Attribution required: **"Origen de los datos: Ministerio de Sanidad."**

| Source | Use | Access | Notes |
|---|---|---|---|
| **Catálogo Nacional de Hospitales / REGCESS** | Registry of record; join key for everything | Portal is JS/session-gated — needs a headless browser; annual (Jan) | No coordinates → geocode via CartoCiudad. |
| **INCLASNS** (Indicadores Clave del SNS) | Condition-specific in-hospital mortality (AMI, angioplasty, hip fracture, pneumonia, stroke) by CCAA | **Documented API + bulk export** — most automatable; do first | National/CCAA granularity. |
| **RAE-CMBD / i-CMBD** | Risk-adjusted (GRD-APR) mortality, readmissions, infection, complications, LOS, surgical volume | Free public aggregates; identified hospital×specialty rows via **free microdata request** (icmbd@sanidad.gob.es, anonymized) | Portal has a TLS quirk on automated fetch — use a headless browser. (RD 69/2015) |
| **SISLE-SNS** | Surgical & specialist waiting times by CCAA/specialty | PDF-first + tables; twice-yearly | (RD 605/2003) |
| **datos.gob.es — Profesionales Sanitarios Colegiados** | Aggregate doctor counts by specialty/province | Open bulk download | Aggregate only — no names, no ratings. |

## Geocoding & geometry (open)

| Source | Use | Licence |
|---|---|---|
| **CartoCiudad** (IGN) | Geocode hospital addresses → coordinates | returned data **CC-BY 4.0**; free, no key |
| **Recursos Sanitarios WFS** (CSIC/SIGMAYORES, INSPIRE) | Geocoding **fallback** for unmatched addresses | open (INSPIRE) |

## Doctor registries — verification only (link-out, never scraped or stored)

| Source | Use | Notes |
|---|---|---|
| **CGCOM** colegiado search | Confirm a doctor's nº de colegiado / specialty | Form-only, no API → on-demand deep-link. Collegiation is legally required. |
| **REPS** (Registro Estatal de Profesionales Sanitarios) | Secondary credential check | Incomplete — absence ≠ no credentials. |

## Cited / linked only — DO NOT scrape or republish

All rights reserved by their owners; used as external **validation benchmarks** via
link only (no tables, scores, or badges copied):

- Newsweek / Statista — *World's Best Hospitals (Spain)*
- IQVIA — *TOP 20*
- Merco — *Monitor de Reputación Sanitaria (MRS)*
- Forbes; Instituto para el Desarrollo e Integración de la Sanidad (IEH)

## Hard rules

- No black-box scores — methodology is published and reproducible.
- No raw Google/Doctoralia review scraping; no operator-authored doctor scores.
- Strictly non-commercial; no paid placement (it would void both the legal basis and
  the credibility).
- Current quality figures are **crude** regional (CCAA) in-hospital rates — **not**
  risk-adjusted. Inter-regional differences partly reflect case-mix/age.
- Small-N discipline: low-volume regions (Ceuta, Melilla) are flagged "bajo N" and kept
  out of the colour scale's domain so they don't distort it. Confidence intervals,
  low-denominator suppression and GRD-APR risk-adjustment are **planned** with the
  per-hospital i-CMBD microdata (not yet implemented).
