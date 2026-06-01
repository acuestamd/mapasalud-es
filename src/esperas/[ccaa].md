---
title: Listas de espera por comunidad
toc: false
---

```js
const sisle = await FileAttachment("../data/sisle.json").json();
const spain = await FileAttachment("../data/provincias.json").json();
```

```js
import * as topojson from "npm:topojson-client";
const code = observable.params.ccaa;
const ccaaName = new Map(topojson.feature(spain, spain.objects.autonomous_regions).features.map(f => [String(f.id), f.properties.name]));
const nombre = ccaaName.get(code) ?? code;
const fmtN = v => v == null ? "—" : v.toLocaleString("es-ES", {maximumFractionDigits: 2});
const dias = sisle.indicators.find(i => i.id === "espera_dias");
const pct = sisle.indicators.find(i => i.id === "pct_mas_6m");
if (typeof document !== "undefined") document.title = `Listas de espera quirúrgica en ${nombre} — MapaSalud`;
```

<span class="eyebrow">Listas de espera · SISLE-SNS</span>

```js
display(html`<h1>Listas de espera quirúrgica en ${nombre}</h1>`);
```

```js
display(html`<div class="hero">A 31 de diciembre de 2025, la espera media para una intervención
quirúrgica no urgente en <b>${nombre}</b> fue de <b>${fmtN(dias.values[code])} días</b>
(media de España: ${fmtN(dias.values.ES)}). Pacientes esperando más de 6 meses:
<b>${fmtN(pct.values[code])}%</b> (España: ${fmtN(pct.values.ES)}%). Fuente: SISLE-SNS, Ministerio de Sanidad.</div>`);
```

```js
display(html`<div class="statrow">
  <div><h2>Espera media</h2><span class="big">${fmtN(dias.values[code])}</span><div class="muted">días · España ${fmtN(dias.values.ES)}</div></div>
  <div><h2>Más de 6 meses</h2><span class="big">${fmtN(pct.values[code])}%</span><div class="muted">España ${fmtN(pct.values.ES)}%</div></div>
  <div><h2>En lista por 1.000 hab.</h2><span class="big">${fmtN(sisle.indicators.find(i=>i.id==="tasa_1000").values[code])}</span><div class="muted">España ${fmtN(sisle.indicators.find(i=>i.id==="tasa_1000").values.ES)}</div></div>
</div>`);
```

```js
display(html`<p><a class="btn" href="../esperas?ccaa=${code}">Ver el mapa y el ranking de todas las comunidades →</a></p>`);
```

<div class="note">

Tiempo medio de espera **estructural** para cirugía no urgente, por comunidad autónoma. Depende
de la información que aporta cada comunidad. Es un dato de **acceso**, no de resultado clínico.
**No es consejo médico.** Ver [metodología](../metodologia).

</div>

<style>
.statrow { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); border-top:1px solid var(--line); border-bottom:1px solid var(--line); margin:1.4rem 0; }
.statrow > div { padding:.9rem 1.4rem .9rem 0; }
.statrow h2 { font-family:var(--mono); font-size:.68rem; font-weight:500; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:0 0 .5rem; }
</style>
