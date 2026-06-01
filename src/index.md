---
title: Hospitales de España
toc: false
head: '<link rel="canonical" href="https://mapasalud-es.vercel.app/"><meta property="og:url" content="https://mapasalud-es.vercel.app/">'
---

<div class="hero-band">
  <div class="brand">
    <svg class="brand-mark" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="#0c5c63"/>
      <rect x="5" y="5" width="7" height="7" rx="1.6" fill="#9ad6d4"/><rect x="13.5" y="5" width="7" height="7" rx="1.6" fill="#e7f4f3"/><rect x="22" y="5" width="7" height="7" rx="1.6" fill="#e8a23d"/>
      <rect x="5" y="13.5" width="7" height="7" rx="1.6" fill="#cdeae8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" fill="#fff"/><rect x="22" y="13.5" width="7" height="7" rx="1.6" fill="#5fb8b4"/>
      <rect x="5" y="22" width="7" height="7" rx="1.6" fill="#2f9a96"/><rect x="13.5" y="22" width="7" height="7" rx="1.6" fill="#86cdc9"/><rect x="22" y="22" width="7" height="7" rx="1.6" fill="#bce5e2"/>
    </svg>
    <span class="brand-name">MapaSalud</span>
    <span class="brand-tag">datos abiertos de sanidad</span>
  </div>
  <h1>Los hospitales de España, con su fuente.</h1>
  <p>Indicadores de calidad por comunidad (INCLASNS / CMBD), listas de espera quirúrgica,
  buscador de hospitales y verificación de colegiación. Abierto, citado y sin ánimo de lucro.</p>
</div>

<div class="ejes muted">Medimos <b>acceso</b> (esperas) y <b>resultado</b> (mortalidad, tasas crudas), no reputación · por comunidad, no por hospital. <a href="./metodologia">Qué mide cada cosa →</a></div>

<style>
.ejes { font-size:.9rem; margin:.2rem 0 1rem; }
.brand { display:flex; align-items:center; gap:.6rem; margin-bottom:1.1rem; }
.brand-mark { width:30px; height:30px; flex:none; }
.brand-name { font-weight:700; font-size:1.18rem; letter-spacing:-.01em; }
.brand-tag { font-family:var(--mono); font-size:.7rem; text-transform:uppercase; letter-spacing:.1em; color:var(--muted); border-left:1px solid var(--line); padding-left:.6rem; }
.hero-cta { display:flex; align-items:center; gap:.5rem; margin:.1rem 0 1.3rem; font-size:.98rem; flex-wrap:wrap; }
.hero-cta label { font-weight:600; }
.hero-cta select { font-family:var(--sans-serif); font-size:.95rem; padding:.4rem .55rem; border:1px solid var(--ms); border-radius:8px; background:#fff; color:var(--ink); cursor:pointer; }
</style>

```js
import * as topojson from "npm:topojson-client";
import * as d3 from "npm:d3";
import {geoConicConformalSpain} from "npm:d3-composite-projections";

const hospitals = await FileAttachment("data/hospitals.geojson").json();
const spain = await FileAttachment("data/provincias.json").json();
const inclasns = await FileAttachment("data/inclasns.json").json();
const total = hospitals.features.length;
```

```js
const ccaaList = topojson.feature(spain, spain.objects.autonomous_regions).features
  .filter(f => String(f.id) !== "20")
  .map(f => ({code: String(f.id), name: f.properties.name}))
  .sort((a, b) => a.name.localeCompare(b.name, "es"));
display(html`<div class="hero-cta">
  <label for="cta-ccaa">Mira tu comunidad:</label>
  <select id="cta-ccaa" onchange=${(e) => { if (e.target.value) location.href = "./esperas?ccaa=" + e.target.value; }}>
    <option value="">Elige una comunidad…</option>
    ${ccaaList.map(c => html`<option value=${c.code}>${c.name}</option>`)}
  </select>
</div>`);
```

<div class="features">
  <a class="feature" href="./calidad"><div class="ic">01</div><h3>Calidad por región</h3>
    <p>Mortalidad, seguridad y procesos por comunidad y por área clínica, con su fuente.</p>
    <span class="go">Ver indicadores →</span></a>
  <a class="feature" href="./esperas"><div class="ic">02</div><h3>Listas de espera</h3>
    <p>Tiempos de espera quirúrgica por comunidad (SISLE) — lo que de verdad notas.</p>
    <span class="go">Ver esperas →</span></a>
  <a class="feature" href="./buscar"><div class="ic">03</div><h3>Buscar hospital</h3>
    <p>Encuentra cualquier hospital y mira los indicadores de calidad de su comunidad.</p>
    <span class="go">Buscar →</span></a>
  <a class="feature" href="./verificacion"><div class="ic">04</div><h3>Verificar un médico</h3>
    <p>Comprueba la colegiación oficial de un facultativo. No es un ranking.</p>
    <span class="go">Verificar →</span></a>
</div>

<div class="statrow">
  <div><h2>Hospitales localizados</h2><span class="big">${total.toLocaleString("es-ES")}</span><div class="muted">vía OSM · por centro: en preparación</div></div>
  <div><h2>Indicadores de calidad</h2><span class="big">${inclasns.indicators.length}</span><div class="muted">por comunidad (INCLASNS)</div></div>
  <div><h2>Cobertura</h2><span class="big">17·52</span><div class="muted">comunidades · provincias</div></div>
  <div><h2>Fuentes</h2><span class="big">5</span><div class="muted"><a href="./referencias">abiertas y citadas →</a></div></div>
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
  svg.append("g").attr("fill", "#0c6b73").attr("fill-opacity", 0.82).attr("stroke", "#fff").attr("stroke-width", 0.35)
    .selectAll("circle").data(hospitals.features.filter(d => projection(d.geometry.coordinates))).join("circle")
      .attr("transform", d => `translate(${projection(d.geometry.coordinates)})`).attr("r", 2.6)
      .style("cursor", "pointer")
      .on("click", (e, d) => { location.href = "./buscar?ccaa=" + (d.properties.ccaa || ""); })
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
calidad se muestra **por comunidad autónoma**. Medimos **acceso** (esperas) y **resultado**
(mortalidad, hoy en tasas crudas), no reputación — [qué mide cada cosa](./metodologia). Sin
valoraciones opacas, sin *scraping* de reseñas, estrictamente no comercial. **No es consejo médico.**

</div>
