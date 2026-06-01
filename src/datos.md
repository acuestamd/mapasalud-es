---
title: Datos abiertos
toc: false
---

<span class="eyebrow">Datos abiertos</span>

# Datos abiertos

<div class="hero">

Todo lo que ves en MapaSalud sale de **fuentes públicas oficiales** y se publica **citado**.
Aquí puedes descargar los datos normalizados (CSV) y consultar su licencia. El código y el
*pipeline* son abiertos (MIT).

</div>

```js
import * as d3 from "npm:d3";
const inclasns = await FileAttachment("data/inclasns.json").json();
const sisle = await FileAttachment("data/sisle.json").json();

function downloadCSV(name, rows) {
  const blob = new Blob([d3.csvFormat(rows)], {type: "text/csv;charset=utf-8"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob); a.download = name; a.click();
  URL.revokeObjectURL(a.href);
}

const inclasnsRows = [];
for (const ind of inclasns.indicators)
  for (const [sexo, years] of Object.entries(ind.values))
    for (const [anio, areas] of Object.entries(years))
      for (const [ccaa, valor] of Object.entries(areas))
        inclasnsRows.push({indicador_id: ind.id, indicador: ind.name, mejor_cuando: ind.betterWhen, sexo, anio, ccaa, valor});

const sisleRows = [];
for (const ind of sisle.indicators)
  for (const [ccaa, valor] of Object.entries(ind.values))
    sisleRows.push({indicador: ind.name, unidad: ind.unit, ccaa, valor, version: sisle.version});
```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>Calidad por comunidad — INCLASNS</h2>
    <p class="muted">${inclasns.indicators.length} indicadores · datos de base CMBD/i-CMBD · por CCAA y año.
    Origen: Ministerio de Sanidad (RD 1495/2011). Tasas crudas, no ajustadas por riesgo.</p>

```js
display(html`<button class="btn" onclick=${() => downloadCSV("mapasalud-calidad-inclasns.csv", inclasnsRows)}>Descargar CSV (${inclasnsRows.length.toLocaleString("es-ES")} filas)</button>`);
```

  </div>
  <div class="card">
    <h2>Listas de espera — SISLE</h2>
    <p class="muted">Espera quirúrgica por CCAA (informe a ${sisle.version}). Origen: Ministerio de
    Sanidad, SISLE-SNS (RD 605/2003).</p>

```js
display(html`<button class="btn" onclick=${() => downloadCSV("mapasalud-esperas-sisle.csv", sisleRows)}>Descargar CSV (${sisleRows.length.toLocaleString("es-ES")} filas)</button>`);
```

  </div>
</div>

## Fuentes y licencias

| Capa | Fuente | Licencia |
|---|---|---|
| Localización de hospitales | OpenStreetMap | ODbL |
| Límites geográficos | Instituto Geográfico Nacional (vía es-atlas) | CC-BY 4.0 |
| Calidad por comunidad | INCLASNS / CMBD, Ministerio de Sanidad | RD 1495/2011 (reutilización con atribución) |
| Listas de espera | SISLE-SNS, Ministerio de Sanidad | RD 605/2003 |

Atribución requerida: **"Origen de los datos: Ministerio de Sanidad."** Detalle completo en
[`DATA-LICENSES.md`](https://github.com/acuestamd/mapasalud-es/blob/main/DATA-LICENSES.md) ·
código y *pipeline*: [github.com/acuestamd/mapasalud-es](https://github.com/acuestamd/mapasalud-es).

<div class="note">

Los CSV se generan **en tu navegador** a partir de los mismos datos que pinta el sitio. Las
clasificaciones de terceros (Newsweek, IQVIA, Merco) **no** se incluyen: son propietarias y solo
se enlazan. **No es consejo médico.**

</div>
