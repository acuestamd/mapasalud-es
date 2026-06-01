---
title: Calidad por comunidad autónoma
toc: false
---

# 📊 Calidad hospitalaria por comunidad autónoma

<div class="hero">

Indicadores de calidad del Sistema Nacional de Salud por **comunidad autónoma**,
con la fuente y el año enlazados. Son cifras **regionales** (no de un hospital
concreto) procedentes de **INCLASNS** (Ministerio de Sanidad), con datos de base del
**CMBD / i-CMBD**. Léelas como **preguntas que llevar a tu médico, no como un veredicto**.

</div>

```js
const inclasns = await FileAttachment("data/inclasns.json").json();
const spain = await FileAttachment("data/provincias.json").json();
```

```js
import * as topojson from "npm:topojson-client";
import * as d3 from "npm:d3";
import {geoConicConformalSpain} from "npm:d3-composite-projections";

const ccaaFeatures = topojson.feature(spain, spain.objects.autonomous_regions);
const ccaaName = new Map(ccaaFeatures.features.map(f => [String(f.id), f.properties.name]));
const SEX_LABEL = {total: "Total", mujer: "Mujeres", hombre: "Hombres"};
```

```js
const indicator = view(Inputs.select(inclasns.indicators, {
  label: "Indicador",
  format: d => d.name,
  value: inclasns.indicators[0]
}));
```

```js
const sexo = view(Inputs.radio(indicator.sexes, {
  label: "Sexo",
  format: s => SEX_LABEL[s] ?? s,
  value: indicator.sexes.includes("mujer") ? "mujer" : indicator.sexes[0]
}));
```

```js
const yearsAvail = Object.keys(indicator.values[sexo] ?? {}).sort();
const anio = view(Inputs.select(yearsAvail, {
  label: "Año",
  value: indicator.latestYear[sexo] ?? yearsAvail[yearsAvail.length - 1]
}));
```

```js
const vals = (indicator.values[sexo] ?? {})[anio] ?? {};
const national = vals.ES;
const ccaaEntries = Object.entries(vals).filter(([k]) => k !== "ES");
const extent = d3.extent(ccaaEntries, d => d[1]);
const interp = indicator.betterWhen === "lower" ? d3.interpolateReds : d3.interpolateGreens;
const color = d3.scaleSequential(extent, interp);
const fmtN = v => v == null ? "—" : v.toLocaleString("es-ES", {maximumFractionDigits: 2});
```

<div class="grid grid-cols-2" style="grid-template-columns: 1.4fr 1fr; align-items:start;">
<div class="card">

```js
function mapa(width) {
  const height = Math.round(width * 0.66);
  const projection = geoConicConformalSpain().fitSize([width, height], ccaaFeatures);
  const path = d3.geoPath(projection);
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]).attr("width", width)
    .attr("style", "max-width:100%;height:auto;font:11px var(--sans-serif);");

  svg.append("g").selectAll("path")
    .data(ccaaFeatures.features).join("path")
      .attr("d", path)
      .attr("fill", f => { const v = vals[String(f.id)]; return v == null ? "#e9e9e9" : color(v); })
      .attr("stroke", "#fff").attr("stroke-width", 0.7)
    .append("title")
      .text(f => `${f.properties.name}: ${vals[String(f.id)] == null ? "sin datos" : fmtN(vals[String(f.id)])}`);

  svg.append("path").attr("d", projection.getCompositionBorders())
      .attr("fill", "none").attr("stroke", "#9aa6ad").attr("stroke-width", 0.8);
  return svg.node();
}

display(resize(width => mapa(width)));
```

```js
// legend
display((() => {
  const w = 240, h = 44;
  const svg = d3.create("svg").attr("width", w).attr("height", h).attr("style","overflow:visible;font:10px var(--sans-serif)");
  const id = "grad-cal";
  const defs = svg.append("defs").append("linearGradient").attr("id", id);
  d3.range(0, 1.01, 0.1).forEach(t => defs.append("stop").attr("offset", `${t*100}%`)
    .attr("stop-color", interp(t)));
  svg.append("rect").attr("width", w).attr("height", 10).attr("fill", `url(#${id})`);
  const x = d3.scaleLinear(extent, [0, w]);
  svg.append("g").attr("transform", "translate(0,10)")
    .call(d3.axisBottom(x).ticks(4).tickSize(4).tickFormat(d => fmtN(d)))
    .call(g => g.select(".domain").remove());
  if (national != null) {
    svg.append("line").attr("x1", x(national)).attr("x2", x(national)).attr("y1", -3).attr("y2", 13)
      .attr("stroke", "#111").attr("stroke-width", 1.5);
    svg.append("text").attr("x", x(national)).attr("y", 30).attr("text-anchor", "middle")
      .attr("font-weight", 700).text(`España ${fmtN(national)}`);
  }
  const note = svg.append("text").attr("x", 0).attr("y", 42).attr("fill", "var(--theme-foreground-muted)");
  note.text(indicator.betterWhen === "lower" ? "← mejor   ·   peor →" : "← peor   ·   mejor →");
  return svg.node();
})());
```
</div>
<div class="card">

```js
// ranked table (best first)
display((() => {
  const sorted = [...ccaaEntries].sort((a, b) =>
    indicator.betterWhen === "lower" ? a[1] - b[1] : b[1] - a[1]);
  const rows = sorted.map(([code, v], i) => html`<tr>
    <td style="text-align:right;color:var(--theme-foreground-muted)">${i + 1}</td>
    <td>${ccaaName.get(code) ?? code}</td>
    <td style="text-align:right;font-variant-numeric:tabular-nums"><b>${fmtN(v)}</b></td>
    <td style="width:90px"><span style="display:inline-block;height:10px;width:${national?Math.max(4,80*v/d3.max(ccaaEntries,d=>d[1])):0}px;background:${color(v)}"></span></td>
  </tr>`);
  return html`<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="text-align:left;border-bottom:1px solid var(--theme-foreground-faint)">
      <th></th><th>Comunidad autónoma</th><th style="text-align:right">Valor</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="border-top:1px solid var(--theme-foreground-faint)">
      <td></td><td><b>España</b></td><td style="text-align:right"><b>${fmtN(national)}</b></td><td></td></tr></tfoot>
  </table>
  <div class="muted" style="margin-top:.5rem">${indicator.betterWhen === "lower"
    ? "Menor es mejor." : "Mayor es mejor."} ${SEX_LABEL[sexo]}, ${anio}.</div>`;
})());
```
</div>
</div>

```js
display(html`<div class="src">
  <b>Fuente:</b> Origen de los datos: Ministerio de Sanidad —
  <a href="${indicator.sourceUrl}" target="_blank" rel="noopener">INCLASNS, indicador #${indicator.id}</a>
  · datos de base CMBD / i-CMBD · ${SEX_LABEL[sexo]} · ${anio}.
</div>`);
```

<div class="note">

**Cómo leer esto.** Son cifras **por comunidad autónoma**, no por hospital — útiles para
ver patrones regionales, no para juzgar un centro concreto. La mortalidad intrahospitalaria
debería interpretarse **ajustada por riesgo** (gravedad/casuística): el i-CMBD aplica
ajuste GRD-APR, pero comunidades pequeñas como **Ceuta y Melilla** tienen pocos casos y sus
cifras oscilan mucho (cautela con los extremos). INCLASNS publica estos indicadores **por
sexo**. **No es consejo médico** ni una medida validada de la calidad de un profesional.
Metodología y fuentes: [`DATA-LICENSES.md`](https://github.com/acuestamd/mapasalud-es/blob/main/DATA-LICENSES.md).

</div>

<style>
.hero { font-size: 1.05rem; max-width: 54rem; }
.muted { color: var(--theme-foreground-muted); font-size: 0.85rem; }
.src { max-width: 54rem; font-size: 0.85rem; color: var(--theme-foreground-muted); margin-top: 0.5rem; }
.note { max-width: 54rem; border-left: 3px solid #0b6fb8; padding-left: 1rem; margin-top: 1.25rem; font-size: 0.92rem; }
</style>
