---
title: Comparar comunidades
toc: false
---

<span class="eyebrow">Comparador</span>

# Comparar comunidades

<div class="hero">

Elige un indicador y las comunidades que quieras comparar. Las cifras son **regionales**
y **tasas crudas** (no ajustadas por riesgo): sirven para ver patrones, no como ranking.

</div>

```js
import * as Plot from "npm:@observablehq/plot";
import * as topojson from "npm:topojson-client";
const inclasns = await FileAttachment("data/inclasns.json").json();
const spain = await FileAttachment("data/provincias.json").json();
const ccaaName = new Map(topojson.feature(spain, spain.objects.autonomous_regions).features.map(f => [String(f.id), f.properties.name]));
const SEX_LABEL = {mujer: "Mujeres", hombre: "Hombres"};
const fmtN = v => v == null ? "—" : v.toLocaleString("es-ES", {maximumFractionDigits: 2});
```

<div class="filtros">
<h2>Comparar</h2>

```js
const indicator = view(Inputs.select(inclasns.indicators, {label: "Indicador", format: d => d.name, value: inclasns.indicators[0]}));
```

```js
const sexo = view(Inputs.radio(indicator.sexes, {label: "Sexo", format: s => SEX_LABEL[s] ?? s, value: indicator.sexes.includes("mujer") ? "mujer" : indicator.sexes[0]}));
```

```js
const anio = indicator.latestYear[sexo];
const valsAll = (indicator.values[sexo] ?? {})[anio] ?? {};
const ccaaAll = Object.keys(valsAll).filter(k => k !== "ES").map(c => ({code: c, name: ccaaName.get(c) ?? c})).sort((a, b) => a.name.localeCompare(b.name, "es"));
const seleccion = view(Inputs.checkbox(ccaaAll, {label: "Comunidades", format: c => c.name, value: ccaaAll.filter(c => ["13", "09", "01"].includes(c.code))}));
```

</div>

```js
display((() => {
  const rows = seleccion.map(c => ({comunidad: c.name, valor: valsAll[c.code]})).filter(r => r.valor != null);
  rows.push({comunidad: "España", valor: valsAll.ES});
  const better = indicator.betterWhen;
  const sorted = [...rows].sort((a, b) => better === "lower" ? a.valor - b.valor : b.valor - a.valor);
  if (rows.length < 2) return html`<div class="muted">Elige al menos una comunidad.</div>`;
  return html`<div class="card" style="padding:1rem">
    <div class="vizhead" style="margin-bottom:.3rem">${indicator.name} · ${SEX_LABEL[sexo] ?? sexo} · ${anio}</div>
    ${resize((width) => Plot.plot({
      width, height: 40 + sorted.length * 34, marginLeft: 150, marginRight: 44,
      x: {grid: true, label: null}, y: {label: null},
      marks: [
        Plot.barX(sorted, {y: "comunidad", x: "valor", sort: {y: "x", reverse: better !== "lower"},
          fill: d => d.comunidad === "España" ? "#9aa6ad" : "#0c6b73"}),
        Plot.text(sorted, {y: "comunidad", x: "valor", text: d => fmtN(d.valor), dx: 14, fontWeight: 600}),
        Plot.ruleX([0])
      ]
    }))}
    <div class="muted" style="font-size:.8rem;margin-top:.3rem">${better === "lower" ? "Menor es mejor." : "Mayor es mejor."} Tasas crudas. Fuente: INCLASNS, M. Sanidad.</div>
  </div>`;
})());
```

<div class="note">

Comparar comunidades por **tasas crudas** no es un ranking de calidad: las diferencias reflejan
en parte la **casuística y la edad** de cada población. Ver [qué mide cada cosa](./metodologia).
**No es consejo médico.**

</div>

<style>
.filtros { border:1px solid var(--line); border-radius:12px; padding:.7rem 1rem .9rem; margin:.4rem 0 1rem; }
.filtros > h2 { font-size:.8rem; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); margin:0 0 .4rem; }
.vizhead { font-size:1.02rem; }
</style>
