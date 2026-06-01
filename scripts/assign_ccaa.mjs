// Asigna a cada hospital su comunidad autónoma (código INE) por point-in-polygon,
// en tiempo de build, para no recalcular 1025×20 en cada carga de /buscar.
// Fallback por centroide más cercano para puntos costeros/fronterizos. Escribe
// `ccaa` y `ccaaName` en las propiedades de hospitals.geojson.
import { feature } from "topojson-client";
import { geoContains, geoCentroid, geoDistance } from "d3-geo";
import fs from "node:fs";

const HOSP = "src/data/hospitals.geojson";
const spain = JSON.parse(fs.readFileSync("src/data/provincias.json"));
const hosp = JSON.parse(fs.readFileSync(HOSP));

const cc = feature(spain, spain.objects.autonomous_regions);
// Gibraltar (id 20) no es CCAA española: lo excluimos de la asignación.
const features = cc.features.filter((f) => String(f.id) !== "20");
const nameByCode = new Map(features.map((f) => [String(f.id), f.properties.name]));
const centroids = features.map((f) => ({ code: String(f.id), c: geoCentroid(f) }));

let byPolygon = 0;
let byNearest = 0;
for (const f of hosp.features) {
  const pt = f.geometry.coordinates;
  let code = null;
  for (const cf of features) {
    if (geoContains(cf, pt)) { code = String(cf.id); break; }
  }
  if (!code) {
    let best = null, bd = Infinity;
    for (const k of centroids) { const d = geoDistance(pt, k.c); if (d < bd) { bd = d; best = k; } }
    code = best && best.code;
    byNearest++;
  } else {
    byPolygon++;
  }
  f.properties.ccaa = code || null;
  f.properties.ccaaName = code ? nameByCode.get(code) : null;
}

fs.writeFileSync(HOSP, JSON.stringify(hosp, null, 1) + "\n");
console.log(`assign_ccaa: ${byPolygon} por polígono, ${byNearest} por centroide más cercano`);
