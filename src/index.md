---
title: Hospitales de España
toc: false
---

<div class="hero-band">
  <span class="badge">Datos abiertos · sin ánimo de lucro</span>
  <h1>🏥 MapaSalud</h1>
  <p>El mapa abierto de los hospitales de España: calidad <b>con su fuente</b>, no opiniones.
  Indicadores por comunidad (INCLASNS / CMBD), buscador de hospitales y verificación de colegiación.</p>
</div>

```js
import * as topojson from "npm:topojson-client";
import * as d3 from "npm:d3";
import {geoConicConformalSpain} from "npm:d3-composite-projections";

const hospitals = await FileAttachment("data/hospitals.geojson").json();
const spain = await FileAttachment("data/provincias.json").json();
const inclasns = await FileAttachment("data/inclasns.json").json();
const total = hospitals.features.length;
```

<div class="features">
  <a class="feature" href="./buscar"><div class="ic">🔎</div><h3>Buscar hospital</h3>
    <p>Encuentra cualquier hospital y mira los indicadores de calidad de su comunidad.</p>
    <span class="go">Buscar →</span></a>
  <a class="feature" href="./calidad"><div class="ic">📊</div><h3>Calidad por región</h3>
    <p>Mortalidad, seguridad y procesos por comunidad y por área clínica, con su fuente.</p>
    <span class="go">Ver indicadores →</span></a>
  <a class="feature" href="./esperas"><div class="ic">⏳</div><h3>Listas de espera</h3>
    <p>Tiempos de espera quirúrgica por comunidad (SISLE) — lo que de verdad notas.</p>
    <span class="go">Ver esperas →</span></a>
  <a class="feature" href="./verificacion"><div class="ic">🩺</div><h3>Verificar un médico</h3>
    <p>Comprueba la colegiación oficial de un facultativo. No es un ranking.</p>
    <span class="go">Verificar →</span></a>
</div>

<div class="grid grid-cols-4">
  <div class="card"><h2>Hospitales mapeados</h2><span class="big">${total.toLocaleString("es-ES")}</span><div class="muted">localización (OSM)</div></div>
  <div class="card"><h2>Indicadores de calidad</h2><span class="big">${inclasns.indicators.length}</span><div class="muted">por comunidad (INCLASNS)</div></div>
  <div class="card"><h2>Cobertura</h2><span class="big">17 · 52</span><div class="muted">comunidades · provincias</div></div>
  <div class="card"><h2>Fuentes</h2><span class="big">5</span><div class="muted"><a href="./referencias">abiertas y citadas →</a></div></div>
</div>

<div class="card" style="padding:.6rem">

```js
function spainMap(width) {
  const height = Math.round(width * 0.56);
  const provinces = topojson.feature(spain, spain.objects.provinces);
  const borders = topojson.mesh(spain, spain.objects.provinces, (a, b) => a !== b);
  const projection = geoConicConformalSpain().fitSize([width, height], provinces);
  const path = d3.geoPath(projection);
  const svg = d3.create("svg")
    .attr("viewBox", [0, 0, width, height]).attr("width", width)
    .attr("role", "img")
    .attr("aria-label", `Mapa de España con la localización de ${total.toLocaleString("es-ES")} hospitales. Búscalos en la página Buscar hospital.`)
    .attr("style", "max-width:100%;height:auto;background:transparent;font:10px var(--sans-serif);");
  svg.append("g").selectAll("path").data(provinces.features).join("path")
      .attr("d", path).attr("fill", "var(--theme-foreground-faintest, #eef2f4)").attr("stroke", "none");
  svg.append("path").datum(borders).attr("d", path).attr("fill", "none").attr("stroke", "#c4ccd2").attr("stroke-width", 0.6);
  svg.append("path").attr("d", projection.getCompositionBorders()).attr("fill", "none").attr("stroke", "#9aa6ad").attr("stroke-width", 0.8);
  svg.append("g").attr("fill", "#0b6fb8").attr("fill-opacity", 0.8).attr("stroke", "#fff").attr("stroke-width", 0.35)
    .selectAll("circle").data(hospitals.features.filter(d => projection(d.geometry.coordinates))).join("circle")
      .attr("transform", d => `translate(${projection(d.geometry.coordinates)})`).attr("r", 2.6)
    .append("title").text(d => `${d.properties.name}${d.properties.city ? " — " + d.properties.city : ""}`);
  return svg.node();
}
display(resize(width => spainMap(width)));
```

<div class="muted" style="font-size:.85rem;margin-top:.3rem">Cada punto es un hospital · pasa el cursor (o toca) para ver el nombre · busca cualquiera en <a href="./buscar">Buscar hospital</a>.</div>

</div>

<div class="note">

**Qué es esto.** Un proyecto abierto (MIT) que reúne datos públicos del sistema hospitalario
español en un mapa, **enlazando cada cifra a su fuente**. La capa de localización parte de
OpenStreetMap; la de calidad, de INCLASNS (datos de base CMBD/i-CMBD). Los datos **por hospital
y por especialidad** llegarán con la solicitud de microdatos CMBD (en trámite); de momento la
calidad se muestra **por comunidad autónoma**. Sin valoraciones opacas, sin *scraping* de reseñas,
estrictamente no comercial. **No es consejo médico.**

</div>
