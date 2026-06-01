---
title: Buscar hospital
toc: false
---

# 🔎 Buscar hospital

<div class="hero">

Busca cualquier hospital de España y consulta su ficha. Hoy se muestran los
**indicadores de calidad de su comunidad autónoma** (datos regionales de INCLASNS,
base CMBD/i-CMBD): los **datos por hospital** requieren la solicitud de microdatos
CMBD (en trámite). Útil para situar un hospital en el contexto de calidad de su región.

</div>

```js
import * as topojson from "npm:topojson-client";
import * as d3 from "npm:d3";

const hospitals = await FileAttachment("data/hospitals.geojson").json();
const inclasns = await FileAttachment("data/inclasns.json").json();
const spain = await FileAttachment("data/provincias.json").json();
```

```js
const ccaaFeatures = topojson.feature(spain, spain.objects.autonomous_regions);
const ccaaName = new Map(ccaaFeatures.features.map(f => [String(f.id), f.properties.name]));
const SEX_LABEL = {mujer: "Mujeres", hombre: "Hombres"};

function tipoOf(ot) {
  ot = (ot || "").toLowerCase();
  if (/priv/.test(ot)) return /(non_profit|religious|ngo)/.test(ot) ? "Privado (no lucrativo)" : "Privado";
  if (/(public|government|consortium)/.test(ot)) return "Público";
  return ot ? "Otro" : "—";
}

// Assign each hospital to its autonomous community by point-in-polygon (100% coverage
// from coordinates, vs sparse address tags).
const hospRows = hospitals.features.map(f => {
  const [lon, lat] = f.geometry.coordinates;
  let code = null;
  for (const cf of ccaaFeatures.features) {
    if (d3.geoContains(cf, [lon, lat])) { code = String(cf.id); break; }
  }
  const p = f.properties;
  return {
    nombre: p.name,
    municipio: p.city || "",
    comunidad: code ? ccaaName.get(code) : "—",
    ccaaCode: code,
    titularidad: tipoOf(p.operator_type),
    urgencias: p.emergency === "yes" ? "Sí" : (p.emergency === "no" ? "No" : "—"),
    web: p.website || "",
  };
}).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
```

```js
const ccaaOptions = ["Todas las comunidades",
  ...Array.from(new Set(hospRows.map(r => r.comunidad))).filter(c => c && c !== "—")
    .sort((a, b) => a.localeCompare(b, "es"))];
const comunidad = view(Inputs.select(ccaaOptions, {label: "Comunidad autónoma", value: "Todas las comunidades"}));
```

```js
const baseRows = comunidad === "Todas las comunidades"
  ? hospRows : hospRows.filter(r => r.comunidad === comunidad);
const buscados = view(Inputs.search(baseRows, {
  placeholder: `Buscar entre ${baseRows.length.toLocaleString("es-ES")} hospitales…`,
  columns: ["nombre", "municipio", "comunidad"]
}));
```

```js
const seleccion = view(Inputs.table(buscados, {
  columns: ["nombre", "comunidad", "municipio", "titularidad", "urgencias"],
  header: {nombre: "Hospital", comunidad: "Comunidad", municipio: "Municipio", titularidad: "Titularidad", urgencias: "Urgencias"},
  required: false,
  rows: 13,
  width: {nombre: 300}
}));
```

```js
// headline indicators for the per-hospital regional context card
const HEADLINE = [125, 129, 128, 132, 114];
const indById = new Map(inclasns.indicators.map(d => [d.id, d]));
const fmtN = v => v == null ? "—" : v.toLocaleString("es-ES", {maximumFractionDigits: 2});

function fichaRegional(code) {
  const rows = HEADLINE.map(id => {
    const ind = indById.get(id);
    if (!ind) return null;
    const sex = ind.sexes.includes("total") ? "total" : ind.sexes[0];
    const yr = ind.latestYear[sex];
    const vals = (ind.values[sex] || {})[yr] || {};
    const v = vals[code], es = vals.ES;
    const better = ind.betterWhen;
    const cmp = (v != null && es != null)
      ? (Math.abs(v - es) < 0.005 ? "≈ media"
        : ((v < es) === (better === "lower") ? "mejor que la media" : "peor que la media"))
      : "";
    const cls = cmp.startsWith("mejor") ? "good" : cmp.startsWith("peor") ? "bad" : "";
    return html`<tr>
      <td>${ind.name}</td>
      <td style="text-align:right;font-variant-numeric:tabular-nums"><b>${fmtN(v)}</b></td>
      <td style="text-align:right;color:var(--theme-foreground-muted)">${fmtN(es)}</td>
      <td class="${cls}">${cmp}</td>
      <td style="text-align:right;color:var(--theme-foreground-muted)">${yr}</td></tr>`;
  }).filter(Boolean);
  return html`<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="text-align:left;border-bottom:1px solid var(--theme-foreground-faint)">
      <th>Indicador (de la comunidad)</th><th style="text-align:right">CCAA</th>
      <th style="text-align:right">España</th><th></th><th style="text-align:right">Año</th></tr></thead>
    <tbody>${rows}</tbody></table>`;
}

function ficha(h) {
  if (!h) return html`<div class="muted">Marca un hospital en la tabla (casilla izquierda) para ver su ficha.</div>`;
  return html`<div class="ficha card">
    <h2>${h.nombre}</h2>
    <div class="meta">${[h.municipio, h.comunidad].filter(Boolean).join(" · ")}
      ${h.titularidad !== "—" ? html`· <span class="pill">${h.titularidad}</span>` : ""}
      ${h.urgencias === "Sí" ? html`· <span class="pill">Urgencias</span>` : ""}
      ${h.web ? html`· <a href="${h.web}" target="_blank" rel="noopener">web ↗</a>` : ""}</div>
    <p class="muted" style="margin:.5rem 0">Indicadores de <b>${h.comunidad}</b> — regionales y
      <b>tasas crudas (mujeres)</b>, no de este hospital. Los datos por hospital están en trámite
      (solicitud CMBD).</p>
    ${h.ccaaCode ? fichaRegional(h.ccaaCode) : html`<div class="muted">Comunidad no determinada para este punto.</div>`}
    <div class="meta" style="margin-top:.6rem">¿Es real el médico que te atiende? <a href="./verificacion">Verifica su colegiación →</a></div>
  </div>`;
}

display(ficha(Array.isArray(seleccion) ? seleccion[seleccion.length - 1] : seleccion));
```

<div class="note">

**Cómo leer esto.** El cruce hospital→comunidad se calcula desde las coordenadas del
hospital. Los indicadores mostrados son **de la comunidad autónoma**, útiles como
contexto, **no son el resultado de este hospital concreto** — eso llegará con los
microdatos CMBD por centro (anonimizados, en trámite). La titularidad y las urgencias
proceden de OpenStreetMap y solo constan para ~3 de cada 10 hospitales (por eso ves «—»).
**No es consejo médico.**

</div>

<style>
.ficha h2 { margin: 0 0 .25rem; font-size: 1.15rem; }
.meta { font-size: .9rem; color: var(--theme-foreground-muted); }
</style>
