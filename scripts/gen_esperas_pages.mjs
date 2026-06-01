// Genera 19 páginas ESTÁTICAS /esperas/<code> (una por comunidad) con título, canonical, og
// y H1+cifras como HTML indexable (SEO real), a partir de src/data/sisle.json. Se ejecuta en
// build (prebuild) y no se commitea (gitignored): siempre refleja el último sisle.json.
import fs from "node:fs";

const BASE = "https://mapasalud-es.vercel.app";
const sisle = JSON.parse(fs.readFileSync("src/data/sisle.json"));
const val = (id) => (sisle.indicators.find((i) => i.id === id) || {}).values || {};
const dias = val("espera_dias"), pct = val("pct_mas_6m"), tasa = val("tasa_1000");
const fmt = (v) => v == null ? "—" : v.toLocaleString("es-ES", { maximumFractionDigits: 2 });

const NAMES = {
  "01": "Andalucía", "02": "Aragón", "03": "Asturias", "04": "Baleares", "05": "Canarias",
  "06": "Cantabria", "07": "Castilla y León", "08": "Castilla-La Mancha", "09": "Cataluña",
  "10": "Comunitat Valenciana", "11": "Extremadura", "12": "Galicia", "13": "Madrid",
  "14": "Murcia", "15": "Navarra", "16": "País Vasco", "17": "La Rioja", "18": "Ceuta", "19": "Melilla",
};

const dir = "src/esperas";
fs.mkdirSync(dir, { recursive: true });
let n = 0;
for (const [code, name] of Object.entries(NAMES)) {
  const d = dias[code];
  if (d == null) continue;
  const title = `Listas de espera quirúrgica en ${name}`;
  // Sin `head` en front-matter: en Framework eso reemplazaría el head global (fuentes, og:image,
  // JSON-LD, tema). El canonical/og:url por página los pone observablehq.config.js (head como función).
  const md = `---
title: ${title}
toc: false
---

<span class="eyebrow">Listas de espera · SISLE-SNS</span>

# ${title}

<div class="hero">A 31 de diciembre de 2025, la espera media para una intervención quirúrgica no urgente en <b>${name}</b> fue de <b>${fmt(d)} días</b> (media de España: ${fmt(dias.ES)}). Pacientes esperando más de 6 meses: <b>${fmt(pct[code])}%</b> (España: ${fmt(pct.ES)}%). Fuente: SISLE-SNS, Ministerio de Sanidad.</div>

<div class="statrow">
  <div><h2>Espera media</h2><span class="big">${fmt(d)}</span><div class="muted">días · España ${fmt(dias.ES)}</div></div>
  <div><h2>Más de 6 meses</h2><span class="big">${fmt(pct[code])}%</span><div class="muted">España ${fmt(pct.ES)}%</div></div>
  <div><h2>En lista por 1.000 hab.</h2><span class="big">${fmt(tasa[code])}</span><div class="muted">España ${fmt(tasa.ES)}</div></div>
</div>

<p><a class="btn" href="../esperas?ccaa=${code}">Ver el mapa y el ranking de todas las comunidades →</a></p>

<div class="note">

Tiempo medio de espera **estructural** para cirugía no urgente, por comunidad autónoma. Depende de la información que aporta cada comunidad. Es un dato de **acceso**, no de resultado clínico. **No es consejo médico.** Ver [metodología](../metodologia).

</div>

<style>
.statrow { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); border-top:1px solid var(--line); border-bottom:1px solid var(--line); margin:1.4rem 0; }
.statrow > div { padding:.9rem 1.4rem .9rem 0; }
.statrow h2 { font-family:var(--mono); font-size:.68rem; font-weight:500; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:0 0 .5rem; }
</style>
`;
  fs.writeFileSync(`${dir}/${code}.md`, md);
  n++;
}
console.log(`gen_esperas_pages: ${n} páginas estáticas por comunidad`);
