// Asigna a cada hospital su comunidad autónoma Y su provincia (códigos INE) por
// point-in-polygon, en build, para no recalcular en cada carga. Fallback por centroide
// más cercano para puntos costeros/fronterizos. Escribe ccaa/ccaaName y provincia/provinciaName.
// Nota: la calidad sigue siendo REGIONAL (CCAA); la provincia solo sirve para filtrar /buscar.
import { feature } from "topojson-client";
import { geoContains, geoCentroid, geoDistance } from "d3-geo";
import fs from "node:fs";

const HOSP = "src/data/hospitals.geojson";
const spain = JSON.parse(fs.readFileSync("src/data/provincias.json"));
const hosp = JSON.parse(fs.readFileSync(HOSP));

function layer(obj, dropIds = []) {
  const feats = feature(spain, spain.objects[obj]).features.filter(f => !dropIds.includes(String(f.id)));
  return {
    feats,
    nameByCode: new Map(feats.map(f => [String(f.id), f.properties.name])),
    centroids: feats.map(f => ({ code: String(f.id), c: geoCentroid(f) })),
  };
}
const cc = layer("autonomous_regions", ["20"]); // sin Gibraltar
const pv = layer("provinces", ["20"]);

function assign(pt, L) {
  for (const f of L.feats) if (geoContains(f, pt)) return { code: String(f.id), exact: true };
  let best = null, bd = Infinity;
  for (const k of L.centroids) { const d = geoDistance(pt, k.c); if (d < bd) { bd = d; best = k; } }
  return { code: best ? best.code : null, exact: false };
}

let ccExact = 0, ccNear = 0;
for (const f of hosp.features) {
  const pt = f.geometry.coordinates;
  const a = assign(pt, cc), p = assign(pt, pv);
  a.exact ? ccExact++ : ccNear++;
  f.properties.ccaa = a.code;
  f.properties.ccaaName = a.code ? cc.nameByCode.get(a.code) : null;
  f.properties.provincia = p.code;
  f.properties.provinciaName = p.code ? pv.nameByCode.get(p.code) : null;
}

fs.writeFileSync(HOSP, JSON.stringify(hosp, null, 1) + "\n");
console.log(`assign_ccaa: CCAA ${ccExact} por polígono + ${ccNear} por centroide; provincia asignada a ${hosp.features.length}`);
