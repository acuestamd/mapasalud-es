---
title: Hospitales de España
toc: false
---

# 🏥 MapaSalud — Hospitales de España

<div class="hero">

Mapa abierto y **trazable a su fuente** del sistema hospitalario español.
Esta versión (**v0.1**) muestra la **localización** de los hospitales; los
**indicadores de calidad por especialidad** (i-CMBD, INCLASNS) y el cruce con el
**Catálogo Nacional de Hospitales** están en integración.

</div>

```js
import * as topojson from "npm:topojson-client";
import * as d3 from "npm:d3";
import {geoConicConformalSpain} from "npm:d3-composite-projections";

const hospitals = await FileAttachment("data/hospitals.geojson").json();
const spain = await FileAttachment("data/provincias.json").json();
```

```js
const total = hospitals.features.length;
```

<div class="grid grid-cols-3">
  <div class="card"><h2>Hospitales mapeados</h2><span class="big">${total.toLocaleString("es-ES")}</span></div>
  <div class="card"><h2>Provincias</h2><span class="big">52</span></div>
  <div class="card"><h2>Fuente de localización</h2><span class="big">OSM</span><div class="muted">© OpenStreetMap (ODbL)</div></div>
</div>

```js
function spainMap(width) {
  const height = Math.round(width * 0.6);
  const provinces = topojson.feature(spain, spain.objects.provinces);
  const borders = topojson.mesh(spain, spain.objects.provinces, (a, b) => a !== b);

  const projection = geoConicConformalSpain().fitSize([width, height], provinces);
  const path = d3.geoPath(projection);

  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height])
    .attr("width", width)
    .attr("style", "max-width:100%;height:auto;background:transparent;font:10px var(--sans-serif);");

  // Provincia fills (neutral) + internal borders
  svg.append("g")
    .selectAll("path").data(provinces.features).join("path")
      .attr("d", path).attr("fill", "var(--theme-foreground-faintest, #eef2f4)").attr("stroke", "none");
  svg.append("path").datum(borders)
      .attr("d", path).attr("fill", "none").attr("stroke", "#c4ccd2").attr("stroke-width", 0.6);

  // Composition border = Canary Islands inset frame (right from day one)
  svg.append("path")
      .attr("d", projection.getCompositionBorders())
      .attr("fill", "none").attr("stroke", "#9aa6ad").attr("stroke-width", 0.8);

  // Hospital points
  svg.append("g")
      .attr("fill", "#0b6fb8").attr("fill-opacity", 0.65)
      .attr("stroke", "#fff").attr("stroke-width", 0.3)
    .selectAll("circle")
    .data(hospitals.features.filter(d => projection(d.geometry.coordinates)))
    .join("circle")
      .attr("transform", d => `translate(${projection(d.geometry.coordinates)})`)
      .attr("r", 2.3)
    .append("title")
      .text(d => `${d.properties.name}${d.properties.city ? " — " + d.properties.city : ""}`);

  return svg.node();
}
```

<div class="card map-card">
  ${resize((width) => spainMap(width))}
</div>

<div class="note">

**Estado y método.** v0.1 es una capa de **localización** sembrada desde OpenStreetMap
(real, con coordenadas, licencia ODbL). La hoja de ruta —cada número enlazado a su
fuente primaria y versión— es:

1. Cruce con el **Catálogo Nacional de Hospitales** (registro oficial, RD 1495/2011).
2. **INCLASNS** — mortalidad hospitalaria por proceso, por CCAA (API + descarga masiva).
3. **i-CMBD** — indicadores ajustados por riesgo (GRD-APR): mortalidad, reingresos,
   infección, complicaciones, estancia, volumen quirúrgico.
4. **SISLE** — listas de espera por especialidad.
5. **Verificación de médicos** (no ranking): enlace al colegiado oficial (CGCOM) y REPS.

Sin valoraciones opacas. Sin *scraping* de reseñas. Estrictamente no comercial.
Ver [`DATA-LICENSES.md`](https://github.com/acuestamd/mapasalud-es/blob/main/DATA-LICENSES.md).

</div>

<style>
.hero { font-size: 1.05rem; max-width: 52rem; }
.big { font-size: 2.2rem; font-weight: 700; line-height: 1; display:block; }
.muted { color: var(--theme-foreground-muted); font-size: 0.8rem; }
.map-card { padding: 0.5rem; }
.note { max-width: 52rem; border-left: 3px solid #0b6fb8; padding-left: 1rem; margin-top: 1.5rem; }
</style>
