---
title: Listas de espera
toc: false
---

<span class="eyebrow">Listas de espera · SISLE-SNS</span>

# Listas de espera quirúrgicas por comunidad autónoma

<div class="hero">

Tiempos de espera para **cirugía no urgente** en el SNS, por comunidad autónoma, según
el **SISLE-SNS** (Ministerio de Sanidad). Cada cifra enlaza a su informe. Es lo que de
verdad notas como paciente — y un dato que ningún ranking cerrado publica abierto.

</div>

```js
import * as topojson from "npm:topojson-client";
import * as d3 from "npm:d3";
import {geoConicConformalSpain} from "npm:d3-composite-projections";

const sisle = await FileAttachment("data/sisle.json").json();
const spain = await FileAttachment("data/provincias.json").json();
const ccaaFeatures = topojson.feature(spain, spain.objects.autonomous_regions);
const ccaaName = new Map(ccaaFeatures.features.map(f => [String(f.id), f.properties.name]));
const qp = (typeof location !== "undefined") ? new URLSearchParams(location.search) : new URLSearchParams();
const ccaaSel = Mutable(qp.get("ccaa") || null);
const setCcaa = (c) => { ccaaSel.value = (ccaaSel.value === c ? null : c); };
```

<div class="filtros">
<h2>Indicador</h2>

```js
const indicator = view(Inputs.select(sisle.indicators, {label: "Mostrar", format: d => d.name, value: sisle.indicators.find(d => d.id === qp.get("ind")) ?? sisle.indicators[0]}));
```

</div>

```js
{
  const p = new URLSearchParams({ind: indicator.id});
  if (ccaaSel) p.set("ccaa", ccaaSel);
  if (typeof history !== "undefined") history.replaceState(null, "", location.pathname + "?" + p.toString());
}
```

```js
// Botones de compartir: se renderizan más abajo, junto a los datos.
```

```js
const vals = indicator.values;
const national = vals.ES;
const ccaaEntries = Object.entries(vals).filter(([k]) => k !== "ES");
const dom = d3.extent(ccaaEntries, d => d[1]);
const norm = v => Math.max(0, Math.min(1, (v - dom[0]) / ((dom[1] - dom[0]) || 1)));
const badness = v => indicator.betterWhen === "lower" ? norm(v) : 1 - norm(v);
const colorScale = v => d3.interpolateYlOrRd(0.12 + 0.78 * badness(v));
const goodFrac = v => 1 - badness(v);
const NODATA = "#cbd5db";
const unit = indicator.unit ? " " + indicator.unit : "";
const fmtN = v => v == null ? "—" : v.toLocaleString("es-ES", {maximumFractionDigits: 2});
const fmtU = v => v == null ? "—" : fmtN(v) + unit;
```

```js
display((() => {
  const lugar = ccaaSel ? `${ccaaName.get(ccaaSel)}: ${fmtU(vals[ccaaSel])}` : `España: ${fmtU(national)}`;
  const texto = `${indicator.name} — ${lugar}. Fuente: SISLE-SNS. Datos abiertos:`;
  const xurl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(texto)}&url=${encodeURIComponent(location.href)}`;
  return html`<div class="actions">
    <button class="copylink" onclick=${(e)=>{navigator.clipboard?.writeText(location.href);const b=e.currentTarget,t=b.textContent;b.textContent="Enlace copiado";setTimeout(()=>b.textContent=t,1500);}}>Copiar enlace</button>
    <a class="copylink sharex" href=${xurl} target="_blank" rel="noopener">Compartir en X</a>
  </div>`;
})());
```

<div class="esperas-split">
<div class="card">

```js
function mapa(width) {
  const height = Math.round(width * 0.66);
  const footerH = 15;
  const projection = geoConicConformalSpain().fitSize([width, height - footerH], ccaaFeatures);
  const path = d3.geoPath(projection);
  const svg = d3.create("svg").attr("viewBox", [0, 0, width, height]).attr("width", width)
    .attr("role", "img").attr("aria-label", `Mapa de España por comunidad autónoma: ${indicator.name}. Valores en la tabla adjunta.`)
    .attr("style", "max-width:100%;height:auto;font:11px var(--sans-serif);");
  svg.append("g").selectAll("path").data(ccaaFeatures.features).join("path")
      .attr("d", path)
      .attr("fill", f => { const v = vals[String(f.id)]; return v == null ? NODATA : colorScale(v); })
      .attr("stroke", f => String(f.id) === ccaaSel ? "#16222e" : "#fff")
      .attr("stroke-width", f => String(f.id) === ccaaSel ? 2.4 : 0.7)
      .style("cursor", "pointer")
      .on("click", (e, f) => setCcaa(String(f.id)))
    .append("title").text(f => `${f.properties.name}: ${vals[String(f.id)] == null ? "sin datos" : fmtU(vals[String(f.id)])}`);
  svg.append("g").attr("pointer-events", "none").attr("text-anchor", "middle")
      .attr("font-size", Math.max(7, width / 95)).attr("font-weight", 600)
    .selectAll("text").data(ccaaFeatures.features.filter(f => vals[String(f.id)] != null && path.area(f) > 240))
    .join("text").attr("transform", f => `translate(${path.centroid(f)})`).attr("dy", "0.32em")
      .attr("fill", "#1a1a1a").attr("stroke", "#fff").attr("stroke-width", Math.max(1.6, width / 520)).attr("paint-order", "stroke")
      .text(f => fmtN(vals[String(f.id)]));
  svg.append("path").attr("d", projection.getCompositionBorders()).attr("fill", "none").attr("stroke", "#9aa6ad").attr("stroke-width", 0.8);
  svg.append("text").attr("x", 1).attr("y", height - 3).attr("font-size", 9).attr("fill", "#5a6b78")
     .text("Listas de espera quirúrgica · Fuente: SISLE-SNS, M. Sanidad · MapaSalud");
  return svg.node();
}
display(resize(width => mapa(width)));
```

```js
display((() => {
  const w = 240, h = 44;
  const svg = d3.create("svg").attr("width", w).attr("height", h).attr("role", "img")
    .attr("aria-label", "Leyenda: rojo = más espera, amarillo = menos").attr("style", "overflow:visible;font:10px var(--sans-serif)");
  const defs = svg.append("defs").append("linearGradient").attr("id", "grad-esp");
  d3.range(0, 1.01, 0.1).forEach(t => defs.append("stop").attr("offset", `${t*100}%`).attr("stop-color", colorScale(dom[0] + t * (dom[1] - dom[0]))));
  svg.append("rect").attr("y", 6).attr("width", w).attr("height", 10).attr("fill", "url(#grad-esp)").attr("rx", 2);
  const x = d3.scaleLinear(dom, [0, w]).clamp(true);
  svg.append("g").attr("transform", "translate(0,16)").call(d3.axisBottom(x).ticks(4).tickSize(4).tickFormat(d => fmtN(d))).call(g => g.select(".domain").remove());
  if (national != null) {
    svg.append("line").attr("x1", x(national)).attr("x2", x(national)).attr("y1", 3).attr("y2", 19).attr("stroke", "#111").attr("stroke-width", 1.5);
    svg.append("text").attr("x", x(national)).attr("y", 2).attr("text-anchor", "middle").attr("font-weight", 700).text(`España ${fmtN(national)}`);
  }
  return svg.node();
})());
```
</div>
<div class="card">

```js
display((() => {
  const sorted = [...ccaaEntries].sort((a, b) => indicator.betterWhen === "lower" ? a[1] - b[1] : b[1] - a[1]);
  const rows = sorted.map(([code, v], i) => html`<tr class=${code === ccaaSel ? "rowsel" : ""} style="cursor:pointer" onclick=${() => setCcaa(code)}>
    <td style="text-align:right;color:var(--theme-foreground-muted)">${i + 1}</td>
    <td>${ccaaName.get(code) ?? code}</td>
    <td style="text-align:right;font-variant-numeric:tabular-nums"><b>${fmtN(v)}</b></td>
    <td style="width:90px"><span style="display:inline-block;height:10px;width:${Math.round(6 + 74 * goodFrac(v))}px;background:${colorScale(v)}"></span></td>
  </tr>`);
  return html`<table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="text-align:left;border-bottom:1px solid var(--theme-foreground-faint)">
      <th></th><th>Comunidad autónoma</th><th style="text-align:right">${indicator.unit ?? "Valor"}</th><th></th></tr></thead>
    <tbody>${rows}</tbody>
    <tfoot><tr style="border-top:1px solid var(--theme-foreground-faint)"><td></td><td><b>España</b></td><td style="text-align:right"><b>${fmtN(national)}</b></td><td></td></tr></tfoot>
  </table><div class="muted" style="margin-top:.5rem">Menor es mejor. Datos a 31-dic-2025.</div>`;
})());
```
</div>
</div>

```js
display(html`<div class="src">Origen de los datos: Ministerio de Sanidad ·
  <a href="${sisle.sourceUrl}" target="_blank" rel="noopener">SISLE-SNS (informe a ${sisle.version})</a> · RD 605/2003.</div>`);
```

<div class="note">

**Cómo leer esto.** Tiempo medio de espera **estructural** para intervención quirúrgica no
urgente, por comunidad autónoma. El contenido depende de la información que aporta cada
comunidad, por lo que los criterios pueden variar entre territorios. Es un dato de **acceso**
(cuánto se espera), no de resultado clínico. **No es consejo médico.**

</div>

<style>
.esperas-split { display:grid; gap:1rem; grid-template-columns:1fr; align-items:start; }
@media (min-width:680px){ .esperas-split { grid-template-columns:1.5fr 1fr; } }
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
