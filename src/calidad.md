---
title: Calidad por comunidad autónoma
toc: false
---

<span class="eyebrow">Calidad · INCLASNS / CMBD</span>

# Calidad hospitalaria por comunidad autónoma

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
import * as Plot from "npm:@observablehq/plot";
import {geoConicConformalSpain} from "npm:d3-composite-projections";

const ccaaFeatures = topojson.feature(spain, spain.objects.autonomous_regions);
const ccaaName = new Map(ccaaFeatures.features.map(f => [String(f.id), f.properties.name]));
const SEX_LABEL = {mujer: "Mujeres", hombre: "Hombres"};
const LOW_N = new Set(["18", "19"]); // Ceuta y Melilla: muy pocos casos, cifras inestables
const qp = (typeof location !== "undefined") ? new URLSearchParams(location.search) : new URLSearchParams();
const ccaaSel = Mutable(qp.get("ccaa") || null);  // CCAA resaltada (deep-link / clic)
const setCcaa = (c) => { ccaaSel.value = (ccaaSel.value === c ? null : c); };

// Map INCLASNS indicators onto clinical areas (the "by specialty" dimension that
// open regional data supports today; per-hospital outcomes await the CMBD request).
// #133/#330 son indicadores sensibles a atención primaria (evitables), no resultados
// del hospital que ingresa.
const SPECIALTIES = {
  "Todas las áreas": null,
  "Cardiología": [129, 127],
  "Traumatología y ortopedia": [128, 119, 121],
  "Neurología (ictus)": [332, 331],
  "Neumología / respiratorio": [132],
  "Cirugía general y digestiva": [114, 91, 337],
  "Seguridad del paciente": [121, 337],
  "Atención primaria / evitables": [133, 330],
  "Visión global": [125],
};
```

<div class="filtros">
<h2>Filtros</h2>

```js
const area = view(Inputs.select(Object.keys(SPECIALTIES), {
  label: "Área clínica / especialidad",
  value: "Todas las áreas"
}));
```

```js
const indOptions = SPECIALTIES[area]
  ? inclasns.indicators.filter(d => SPECIALTIES[area].includes(d.id))
  : inclasns.indicators;
const indicator = view(Inputs.select(indOptions, {
  label: "Indicador",
  format: d => d.name,
  value: indOptions.find(d => String(d.id) === qp.get("ind")) ?? indOptions[0]
}));
```

```js
const sexo = view(Inputs.radio(indicator.sexes, {
  label: "Sexo",
  format: s => SEX_LABEL[s] ?? s,
  value: indicator.sexes.includes(qp.get("sexo")) ? qp.get("sexo") : (indicator.sexes.includes("mujer") ? "mujer" : indicator.sexes[0])
}));
```

```js
const yearsAvail = Object.keys(indicator.values[sexo] ?? {}).sort();
const anio = view(Inputs.select(yearsAvail, {
  label: "Año",
  value: yearsAvail.includes(qp.get("anio")) ? qp.get("anio") : (indicator.latestYear[sexo] ?? yearsAvail[yearsAvail.length - 1])
}));
```

</div>


```js
// Sincroniza la URL con la vista (deep-link). replaceState: no rompe el botón "atrás".
{
  const p = new URLSearchParams({ind: indicator.id, sexo, anio});
  if (ccaaSel) p.set("ccaa", ccaaSel);
  if (typeof history !== "undefined") history.replaceState(null, "", location.pathname + "?" + p.toString());
}
```

```js
// Botones de compartir: se renderizan más abajo, junto a los datos.
```

```js
const vals = (indicator.values[sexo] ?? {})[anio] ?? {};
const national = vals.ES;
const ccaaEntries = Object.entries(vals).filter(([k]) => k !== "ES");
// Escala acotada a p5–p95 (excluyendo N bajo) para que los extremos no laven el resto.
const reliable = ccaaEntries.filter(([k]) => !LOW_N.has(k)).map(d => d[1]).sort((a, b) => a - b);
const dom = reliable.length >= 4
  ? [d3.quantile(reliable, 0.05), d3.quantile(reliable, 0.95)]
  : d3.extent(ccaaEntries, d => d[1]);
// Una sola rampa apta para daltonismo (amarillo→rojo, sin verde), orientada por
// "bondad": rojo = peor, amarillo claro = mejor, en TODOS los indicadores.
const norm = v => Math.max(0, Math.min(1, (v - dom[0]) / ((dom[1] - dom[0]) || 1)));
const badness = v => indicator.betterWhen === "lower" ? norm(v) : 1 - norm(v);
const colorScale = v => d3.interpolateYlOrRd(0.12 + 0.78 * badness(v));
const goodFrac = v => 1 - badness(v);
const NODATA = "#cbd5db";
const fmtN = v => v == null ? "—" : v.toLocaleString("es-ES", {maximumFractionDigits: 2});
```

```js
display(html`<div class="vizhead">
  <b>${indicator.name}</b>
  <span class="chip chip-sex">${SEX_LABEL[sexo] ?? sexo}</span>
  <span class="chip">${anio}</span>
  <span class="chip">${indicator.betterWhen === "lower" ? "menor = mejor" : "mayor = mejor"}</span>
</div>
<div class="muted vizsub">Tasas <b>crudas</b> (no ajustadas por riesgo). INCLASNS publica este
indicador por sexo: estás viendo <b>${(SEX_LABEL[sexo] ?? sexo).toLowerCase()}</b> — cambia el sexo arriba.</div>`);
```

```js
display((() => {
  const lugar = ccaaSel ? `${ccaaName.get(ccaaSel)}: ${fmtN(vals[ccaaSel])}` : `España: ${fmtN(national)}`;
  const texto = `${indicator.name} — ${lugar} (${SEX_LABEL[sexo] ?? sexo}, ${anio}). Tasas crudas, no es ranking. Datos abiertos:`;
  const xurl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(location.href)}`;
  return html`<div class="actions">
    <button class="copylink" onclick=${(e)=>{navigator.clipboard?.writeText(location.href);const b=e.currentTarget,t=b.textContent;b.textContent="Enlace copiado";setTimeout(()=>b.textContent=t,1500);}}>Copiar enlace</button>
    <a class="copylink sharex" href=${xurl} target="_blank" rel="noopener">Compartir en X</a>
  </div>`;
})());
```

<div class="calidad-split">
<div class="card">

```js
function mapa(width) {
  const height = Math.round(width * 0.66);
  const footerH = 15;
  const projection = geoConicConformalSpain().fitSize([width, height - footerH], ccaaFeatures);
  const path = d3.geoPath(projection);
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]).attr("width", width)
    .attr("role", "img")
    .attr("aria-label", `Mapa de España por comunidad autónoma: ${indicator.name} (${SEX_LABEL[sexo] ?? sexo}, ${anio}). Los valores de cada comunidad están en la tabla adjunta.`)
    .attr("style", "max-width:100%;height:auto;font:11px var(--sans-serif);");

  svg.append("g").selectAll("path")
    .data(ccaaFeatures.features).join("path")
      .attr("d", path)
      .attr("fill", f => { const v = vals[String(f.id)]; return v == null ? NODATA : colorScale(v); })
      .attr("stroke", f => String(f.id) === ccaaSel ? "#16222e" : (LOW_N.has(String(f.id)) ? "#7a1d12" : "#fff"))
      .attr("stroke-width", f => String(f.id) === ccaaSel ? 2.4 : (LOW_N.has(String(f.id)) ? 1.1 : 0.7))
      .attr("stroke-dasharray", f => LOW_N.has(String(f.id)) ? "3,2" : null)
      .style("cursor", "pointer")
      .on("click", (e, f) => setCcaa(String(f.id)))
    .append("title")
      .text(f => { const v = vals[String(f.id)]; const ln = LOW_N.has(String(f.id)) ? " · bajo N (poco fiable)" : "";
        return `${f.properties.name}: ${v == null ? "sin datos" : fmtN(v)}${ln}`; });

  // Etiqueta de valor en cada comunidad con suficiente área (señal no cromática para táctil)
  svg.append("g").attr("pointer-events", "none").attr("text-anchor", "middle")
      .attr("font-size", Math.max(7, width / 95)).attr("font-weight", 600)
    .selectAll("text")
    .data(ccaaFeatures.features.filter(f => vals[String(f.id)] != null && path.area(f) > 240))
    .join("text")
      .attr("transform", f => `translate(${path.centroid(f)})`).attr("dy", "0.32em")
      .attr("fill", "#1a1a1a").attr("stroke", "#fff")
      .attr("stroke-width", Math.max(1.6, width / 520)).attr("paint-order", "stroke")
      .text(f => fmtN(vals[String(f.id)]));

  svg.append("path").attr("d", projection.getCompositionBorders())
      .attr("fill", "none").attr("stroke", "#9aa6ad").attr("stroke-width", 0.8);
  svg.append("text").attr("x", 1).attr("y", height - 3).attr("font-size", 9).attr("fill", "#7a8a96")
     .text("Tasas crudas · no ajustadas por riesgo · no es un ranking · Fuente: M. Sanidad/INCLASNS · MapaSalud");
  return svg.node();
}

display(resize(width => mapa(width)));
```

```js
// legend
display((() => {
  const w = 240, h = 58;
  const svg = d3.create("svg").attr("width", w).attr("height", h)
    .attr("role", "img").attr("aria-label", "Leyenda: rojo = peor, amarillo claro = mejor")
    .attr("style", "overflow:visible;font:10px var(--sans-serif)");
  const id = "grad-cal";
  const defs = svg.append("defs").append("linearGradient").attr("id", id);
  d3.range(0, 1.01, 0.1).forEach(t => defs.append("stop").attr("offset", `${t * 100}%`)
    .attr("stop-color", colorScale(dom[0] + t * (dom[1] - dom[0]))));
  svg.append("rect").attr("y", 6).attr("width", w).attr("height", 10).attr("fill", `url(#${id})`).attr("rx", 2);
  const x = d3.scaleLinear(dom, [0, w]).clamp(true);
  svg.append("g").attr("transform", "translate(0,16)")
    .call(d3.axisBottom(x).ticks(4).tickSize(4).tickFormat(d => fmtN(d)))
    .call(g => g.select(".domain").remove());
  if (national != null) {
    svg.append("line").attr("x1", x(national)).attr("x2", x(national)).attr("y1", 3).attr("y2", 19)
      .attr("stroke", "#111").attr("stroke-width", 1.5);
    svg.append("text").attr("x", x(national)).attr("y", 2).attr("text-anchor", "middle")
      .attr("font-weight", 700).text(`España ${fmtN(national)}`);
  }
  svg.append("text").attr("x", 0).attr("y", 42).attr("fill", "var(--theme-foreground-muted)")
    .text(indicator.betterWhen === "lower" ? "← mejor   ·   peor →" : "← peor   ·   mejor →");
  svg.append("rect").attr("x", 0).attr("y", 48).attr("width", 10).attr("height", 10).attr("fill", NODATA).attr("rx", 2);
  svg.append("text").attr("x", 14).attr("y", 56).attr("fill", "var(--theme-foreground-muted)").text("sin datos");
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
  const rows = sorted.map(([code, v]) => html`<tr class=${code === ccaaSel ? "rowsel" : ""} style="cursor:pointer" onclick=${() => setCcaa(code)}>
    <td>${ccaaName.get(code) ?? code}${LOW_N.has(code) ? html` <span class="lown">bajo N</span>` : ""}</td>
    <td style="text-align:right;font-variant-numeric:tabular-nums"><b>${fmtN(v)}</b></td>
    <td style="width:90px" title="distancia a la media regional"><span style="display:inline-block;height:10px;width:${Math.round(6 + 74 * goodFrac(v))}px;background:${colorScale(v)}"></span></td>
  </tr>`);
  return html`<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="text-align:left;border-bottom:1px solid var(--theme-foreground-faint)">
      <th>Comunidad autónoma</th><th style="text-align:right">Valor</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="border-top:1px solid var(--theme-foreground-faint)">
      <td><b>España</b></td><td style="text-align:right"><b>${fmtN(national)}</b></td><td></td></tr></tfoot>
  </table>
  <div class="muted" style="margin-top:.5rem">${indicator.betterWhen === "lower"
    ? "Menor es mejor." : "Mayor es mejor."} ${SEX_LABEL[sexo] ?? sexo}, ${anio} · ordenado por valor (no es un ranking de calidad).</div>`;
})());
```
</div>
</div>

```js
// Serie temporal: evolución del indicador por año (CCAA seleccionada vs España)
display((() => {
  const byYear = indicator.values[sexo] ?? {};
  const series = [];
  for (const [y, m] of Object.entries(byYear)) {
    if (m.ES != null) series.push({anio: +y, valor: m.ES, serie: "España"});
    if (ccaaSel && m[ccaaSel] != null) series.push({anio: +y, valor: m[ccaaSel], serie: ccaaName.get(ccaaSel)});
  }
  if (series.length < 4) return html``;
  const dom = ccaaSel ? [ccaaName.get(ccaaSel), "España"] : ["España"];
  return html`<div class="card" style="margin-top:1rem;padding:1rem">
    <div class="vizhead" style="margin-bottom:.3rem">Evolución por año${ccaaSel ? " · " + ccaaName.get(ccaaSel) + " vs España" : " · España"}</div>
    ${resize((width) => Plot.plot({
      width, height: 240, marginLeft: 46, marginRight: 12,
      x: {tickFormat: "d", label: null}, y: {grid: true, label: null},
      color: {legend: true, domain: dom, range: ["#0c6b73", "#9aa6ad"]},
      marks: [
        Plot.lineY(series, {x: "anio", y: "valor", stroke: "serie", strokeWidth: 2, curve: "monotone-x"}),
        Plot.dot(series, {x: "anio", y: "valor", stroke: "serie", fill: "white", r: 2.4}),
        Plot.tip(series, Plot.pointer({x: "anio", y: "valor", stroke: "serie", title: d => `${d.serie} ${d.anio}: ${fmtN(d.valor)}`}))
      ]
    }))}
    <div class="muted" style="font-size:.8rem;margin-top:.3rem">Selecciona una comunidad (clic en el mapa o la tabla) para compararla con España. ${SEX_LABEL[sexo] ?? sexo}, tasas crudas. Fuente: INCLASNS.</div>
  </div>`;
})());
```

```js
display(html`<div class="src">
  Origen de los datos: Ministerio de Sanidad ·
  <a href="${indicator.sourceUrl}" target="_blank" rel="noopener">INCLASNS — indicador ${indicator.id}</a>
  · datos de base CMBD / i-CMBD · ${SEX_LABEL[sexo] ?? sexo} · ${anio}.
</div>`);
```

<div class="note">

**Cómo leer esto.** Son cifras **por comunidad autónoma**, no por hospital — útiles para
ver patrones regionales, no para juzgar un centro concreto. Son **tasas crudas, no
ajustadas por riesgo**: las diferencias entre comunidades reflejan en parte la
**casuística y la edad** de cada población, no solo la calidad asistencial. El ajuste por
riesgo (GRD-APR) y los intervalos de confianza llegarán con los microdatos i-CMBD por
centro (en trámite). Comunidades pequeñas como **Ceuta y Melilla** tienen muy pocos casos
y sus cifras oscilan mucho: se marcan como **bajo N** y no deben leerse como un ranking.
INCLASNS publica estos indicadores **por sexo**. **No es consejo médico** ni una medida
validada de la calidad de un profesional. Metodología y fuentes:
[`DATA-LICENSES.md`](https://github.com/acuestamd/mapasalud-es/blob/main/DATA-LICENSES.md).

</div>

<style>
.src { font-size: 0.85rem; }
.vizhead { font-size: 1.05rem; margin: .2rem 0 .15rem; }
.vizsub { font-size: .85rem; margin-bottom: .7rem; }
.chip { display:inline-block; background: var(--theme-foreground-faintest); border-radius: 999px; padding: 1px 9px; font-size: .8rem; font-weight: 600; margin-left: .35rem; }
.chip-sex { background:var(--ms); color:#fff; }
.lown { background:#fdecea; color:#b3261e; border-radius:999px; padding:0 7px; font-size:.72rem; font-weight:600; white-space:nowrap; }
.calidad-split { display:grid; gap:1rem; grid-template-columns:1fr; align-items:start; }
@media (min-width:680px){ .calidad-split { grid-template-columns:1.5fr 1fr; } }
.filtros { border:1px solid var(--theme-foreground-faint); border-radius:12px; padding:.7rem 1rem .9rem; margin:.4rem 0 1rem; }
.filtros > h2 { font-size:.8rem; text-transform:uppercase; letter-spacing:.04em; color:var(--theme-foreground-muted); margin:0 0 .4rem; }
.copylink { font-family:var(--mono); font-size:.74rem; background:none; border:1px solid var(--line); color:var(--ms); padding:.3rem .7rem; border-radius:6px; cursor:pointer; margin:.2rem 0 .7rem; }
.copylink:hover { background:var(--ms-soft); }
.actions { display:flex; gap:.5rem; flex-wrap:wrap; margin:.1rem 0 .8rem; }
a.copylink { text-decoration:none; display:inline-block; }
.sharex { background:var(--ms); color:#fff; border-color:var(--ms); }
.sharex:hover { background:var(--ms-dark); }
.rowsel td { background:#d8ebe9 !important; font-weight:600; }
</style>
