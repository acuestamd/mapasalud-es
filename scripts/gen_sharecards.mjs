// Genera sharecards (1200×630 PNG) por comunidad para /esperas/<code>, usando el Chrome
// headless local y la tipografía Plex real. Se ejecutan LOCALMENTE y se comitean como assets
// estáticos (src/sharecards/) — cero dependencias nativas en el build de Vercel. Regenerar
// cuando cambie sisle.json:  node scripts/gen_sharecards.mjs            (todas)
//                            node scripts/gen_sharecards.mjs 13         (solo una, a /tmp)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const ROOT = process.cwd();
const FONTS = path.join(ROOT, "src/fonts");
const sisle = JSON.parse(fs.readFileSync("src/data/sisle.json"));
const V = (id) => (sisle.indicators.find((i) => i.id === id) || {}).values || {};
const dias = V("espera_dias"), pct = V("pct_mas_6m");
const fmt = (v) => v == null ? "—" : v.toLocaleString("es-ES", { maximumFractionDigits: 1 });

const NAMES = {
  "01": "Andalucía", "02": "Aragón", "03": "Asturias", "04": "Illes Balears", "05": "Canarias",
  "06": "Cantabria", "07": "Castilla y León", "08": "Castilla-La Mancha", "09": "Cataluña",
  "10": "Comunitat Valenciana", "11": "Extremadura", "12": "Galicia", "13": "Madrid",
  "14": "Murcia", "15": "Navarra", "16": "País Vasco", "17": "La Rioja", "18": "Ceuta", "19": "Melilla",
};

const fontFace = (file, family, weight) =>
  `@font-face{font-family:"${family}";src:url("file://${path.join(FONTS, file)}") format("woff2");font-weight:${weight};font-style:normal}`;

const MARK = `<svg viewBox="0 0 32 32" width="46" height="46" aria-hidden="true">
  <rect width="32" height="32" rx="7" fill="#0c5c63"/>
  <rect x="5" y="5" width="7" height="7" rx="1.6" fill="#9ad6d4"/><rect x="13.5" y="5" width="7" height="7" rx="1.6" fill="#e7f4f3"/><rect x="22" y="5" width="7" height="7" rx="1.6" fill="#e8a23d"/>
  <rect x="5" y="13.5" width="7" height="7" rx="1.6" fill="#cdeae8"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.6" fill="#fff"/><rect x="22" y="13.5" width="7" height="7" rx="1.6" fill="#5fb8b4"/>
  <rect x="5" y="22" width="7" height="7" rx="1.6" fill="#2f9a96"/><rect x="13.5" y="22" width="7" height="7" rx="1.6" fill="#86cdc9"/><rect x="22" y="22" width="7" height="7" rx="1.6" fill="#bce5e2"/>
</svg>`;

function cardHTML(code) {
  const name = NAMES[code];
  const d = dias[code], p = pct[code], es = dias.ES;
  const nameSize = name.length > 16 ? 56 : name.length > 11 ? 66 : 76;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
${fontFace("plex-sans-400.woff2", "Plex Sans", 400)}
${fontFace("plex-sans-600.woff2", "Plex Sans", 600)}
${fontFace("plex-sans-700.woff2", "Plex Sans", 700)}
${fontFace("plex-mono-500.woff2", "Plex Mono", 500)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px}
body{font-family:"Plex Sans",sans-serif;background:#fcfcfb;color:#16222e;padding:62px 70px;
  display:flex;flex-direction:column;position:relative;overflow:hidden}
body::before{content:"";position:absolute;left:0;top:0;bottom:0;width:10px;background:#0c6b73}
.top{display:flex;align-items:center;gap:14px}
.brand{font-weight:700;font-size:25px;letter-spacing:-.01em}
.tag{font-family:"Plex Mono",monospace;font-size:14px;text-transform:uppercase;letter-spacing:.14em;
  color:#5a6b78;border-left:1px solid #d7dde0;padding-left:14px}
.eyebrow{font-family:"Plex Mono",monospace;font-size:21px;text-transform:uppercase;letter-spacing:.14em;
  color:#0c6b73;font-weight:500;margin-top:54px}
.name{font-weight:700;font-size:${nameSize}px;line-height:1.02;letter-spacing:-.02em;margin-top:6px}
.hero{display:flex;align-items:baseline;gap:18px;margin-top:8px}
.num{font-weight:700;font-size:150px;line-height:.9;color:#0c6b73;font-variant-numeric:tabular-nums;letter-spacing:-.03em}
.unit{font-size:46px;font-weight:600;color:#16222e}
.sub{font-size:27px;color:#5a6b78;margin-top:14px;max-width:1000px;line-height:1.35}
.sub b{color:#16222e;font-weight:600}
.spacer{flex:1}
.foot{display:flex;justify-content:space-between;align-items:flex-end;font-family:"Plex Mono",monospace;
  font-size:16px;color:#5a6b78;border-top:1px solid #e4e7ea;padding-top:16px}
.foot .r{text-align:right;line-height:1.5}
.foot b{color:#0c6b73;font-weight:500}
.dis{font-size:13px;color:#9aa6ad;margin-top:6px}
</style></head><body>
  <div class="top">${MARK}<span class="brand">MapaSalud</span><span class="tag">Datos abiertos de sanidad</span></div>
  <div class="eyebrow">Listas de espera quirúrgica</div>
  <div class="name">${name}</div>
  <div class="hero"><span class="num">${fmt(d)}</span><span class="unit">días de espera media</span></div>
  <div class="sub">Cirugía no urgente · media de España <b>${fmt(es)} días</b>${p != null ? ` · <b>${fmt(p)}%</b> espera más de 6 meses` : ""}</div>
  <div class="spacer"></div>
  <div class="foot">
    <div>Fuente: SISLE-SNS<br>Ministerio de Sanidad</div>
    <div class="r"><b>mapasalud-es.vercel.app/esperas/${code}</b><br>vía @acuestaMD · Tasas oficiales, no es consejo médico</div>
  </div>
</body></html>`;
}

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
function render(code, outPng) {
  const html = cardHTML(code);
  const tmp = path.join(os.tmpdir(), `card-${code}.html`);
  fs.writeFileSync(tmp, html);
  execFileSync(CHROME, [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
    "--window-size=1200,630", "--default-background-color=00000000",
    `--screenshot=${outPng}`, `file://${tmp}`,
  ], { stdio: "ignore" });
}

const arg = process.argv[2];
if (arg && arg !== "all") {
  const out = path.join(os.tmpdir(), `sharecard-${arg}.png`);
  render(arg, out);
  console.log("rendered test card:", out);
} else {
  const dir = path.join(ROOT, "src/sharecards");
  fs.mkdirSync(dir, { recursive: true });
  let n = 0;
  for (const code of Object.keys(NAMES)) {
    if (dias[code] == null) continue;
    render(code, path.join(dir, `esperas-${code}.png`));
    n++;
  }
  console.log(`gen_sharecards: ${n} tarjetas en src/sharecards/`);
}
