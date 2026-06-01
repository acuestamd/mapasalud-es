// MapaSalud — Observable Framework config
const DESC =
  "El mapa abierto de los hospitales de España: indicadores de calidad por comunidad " +
  "con su fuente (INCLASNS/CMBD), buscador de hospitales y verificación de colegiación. " +
  "Datos abiertos, sin ánimo de lucro.";
const OG = "https://mapasalud-es.vercel.app/og.png";

export default {
  root: "src",
  title: "MapaSalud",
  dynamicPaths: ["01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19"].map(c => `/esperas/${c}`),
  pages: [
    {name: "Hospitales", path: "/index"},
    {name: "Buscar hospital", path: "/buscar"},
    {name: "Calidad por región", path: "/calidad"},
    {name: "Listas de espera", path: "/esperas"},
    {name: "Comparar comunidades", path: "/comparar"},
    {name: "Verificar un médico", path: "/verificacion"},
    {name: "Datos abiertos", path: "/datos"},
    {name: "Referencias", path: "/referencias"},
  ],
  head: `
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#0c6b73">
<meta property="og:type" content="website">
<meta property="og:title" content="MapaSalud — Hospitales de España">
<meta property="og:description" content="${DESC}">
<meta property="og:image" content="${OG}">
<meta property="og:url" content="https://mapasalud-es.vercel.app/">
<link rel="canonical" href="https://mapasalud-es.vercel.app/">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="MapaSalud — Hospitales de España">
<meta name="twitter:description" content="${DESC}">
<meta name="twitter:image" content="${OG}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>
@font-face{font-family:"Plex Sans";src:url(/fonts/plex-sans-400.woff2) format("woff2");font-weight:400;font-style:normal;font-display:swap}
@font-face{font-family:"Plex Sans";src:url(/fonts/plex-sans-600.woff2) format("woff2");font-weight:600;font-style:normal;font-display:swap}
@font-face{font-family:"Plex Sans";src:url(/fonts/plex-sans-700.woff2) format("woff2");font-weight:700;font-style:normal;font-display:swap}
@font-face{font-family:"Plex Mono";src:url(/fonts/plex-mono-500.woff2) format("woff2");font-weight:500;font-style:normal;font-display:swap}

:root {
  --theme-foreground-focus:#0c6b73; --ms:#0c6b73; --ms-dark:#084f55; --ms-soft:#e4f0ef;
  --ink:#16222e; --muted:#5a6b78; --line:#e4e7ea;
  --sans-serif:"Plex Sans", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --serif:var(--sans-serif);
  --mono:"Plex Mono", ui-monospace, "SF Mono", Menlo, monospace;
}
html, body { background:#fcfcfb; }
body { font-family:var(--sans-serif); color:var(--ink); -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility; }
#observablehq-main { font-family:var(--sans-serif); line-height:1.6; color:var(--ink); }
#observablehq-main h1, #observablehq-main h2, #observablehq-main h3 { font-family:var(--sans-serif); letter-spacing:-.015em; color:var(--ink); }
#observablehq-main h1 { font-weight:700; font-size:2.4rem; line-height:1.08; }
#observablehq-sidebar a[aria-current="page"], .observablehq-link-active > a { color:var(--ms) !important; font-weight:700; }

/* etiqueta superior (kicker) en monoespaciada — sello editorial */
.eyebrow { font-family:var(--mono); font-weight:500; font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; color:var(--ms); display:block; margin-bottom:.5rem; }
.hero { font-size:1.08rem; max-width:50rem; color:var(--muted); line-height:1.55; }
.hero b { color:var(--ink); }
.muted { color:var(--muted); }

/* tarjetas: plano, línea fina, sin sombra */
.card { border:1px solid var(--line); border-radius:10px; box-shadow:none; background:#fff; }
.card h2 { margin-top:0; }

/* masthead (home) — plano y editorial, sin degradado ni emoji */
.hero-band { background:none; color:inherit; border:none; border-bottom:1px solid var(--line); border-radius:0; padding:.3rem 0 1.2rem; margin:0 0 1.5rem; }
.hero-band h1 { color:var(--ink); font-size:2.8rem; line-height:1.04; margin:.1rem 0 .6rem; border:none; font-weight:700; max-width:20ch; }
.hero-band p { font-size:1.14rem; max-width:42rem; margin:0; color:var(--muted); line-height:1.5; }
.hero-band .badge { font-family:var(--mono); background:none; padding:0; color:var(--ms); font-size:.72rem; letter-spacing:.12em; text-transform:uppercase; font-weight:500; }

/* índice de secciones — sustituye las tarjetas con emoji por una lista editorial */
.features { display:grid; grid-template-columns:repeat(auto-fit,minmax(230px,1fr)); gap:0 1.6rem; margin:1.5rem 0; border-top:1px solid var(--line); }
.feature { display:flex; flex-direction:column; padding:1.05rem 0 1.1rem; border-bottom:1px solid var(--line); text-decoration:none; color:inherit; transition:opacity .15s; }
.feature:hover { opacity:.62; }
.feature .ic { font-family:var(--mono); font-size:.78rem; color:var(--ms); letter-spacing:.08em; margin-bottom:.5rem; }
.feature h3 { margin:0 0 .3rem; font-size:1.1rem; font-weight:700; }
.feature p { margin:0 0 .55rem; font-size:.9rem; color:var(--muted); flex:1; }
.feature .go { color:var(--ms); font-weight:600; font-size:.84rem; }

/* cifras grandes en monoespaciada */
.statrow { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); border-top:1px solid var(--line); border-bottom:1px solid var(--line); margin:1.5rem 0; }
.statrow > div { padding:.9rem 1.4rem .9rem 0; }
.big { font-family:var(--mono); font-size:1.9rem; font-weight:500; line-height:1; display:block; color:var(--ink); font-variant-numeric:tabular-nums; }
.statrow h2 { font-family:var(--mono); font-size:.68rem; font-weight:500; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin:0 0 .5rem; }

/* botones y etiquetas */
.btn { display:inline-block; padding:.5rem .9rem; background:var(--ms); color:#fff !important; border-radius:7px; text-decoration:none; font-weight:600; }
.btn:hover { background:var(--ms-dark); }
.feature:focus-visible, .btn:focus-visible, a:focus-visible { outline:2px solid var(--ms); outline-offset:2px; border-radius:5px; }
.pill { font-family:var(--mono); background:var(--ms-soft); color:var(--ms-dark); padding:1px 7px; border-radius:4px; font-size:.74em; font-weight:500; }

/* tablas construidas a mano dentro de .card — estilo editorial */
.card table { font-variant-numeric:tabular-nums; width:100%; }
.card table thead th { font-family:var(--mono); color:var(--muted); font-weight:500; font-size:.68rem; text-transform:uppercase; letter-spacing:.05em; border-bottom:1px solid var(--ink); padding-bottom:.35rem; }
.card table tbody tr:hover { background:var(--ms-soft); }
.card table td, .card table th { padding:.32rem .45rem; }

/* notas y fuente */
.note { max-width:52rem; border-left:2px solid var(--ms); padding:.1rem 0 .1rem 1rem; margin-top:1.6rem; font-size:.92rem; background:none; line-height:1.6; color:var(--muted); }
.note b { color:var(--ink); }
.src { font-family:var(--mono); max-width:52rem; font-size:.74rem; color:var(--muted); margin-top:.5rem; letter-spacing:.01em; }
td.good { color:#1a7a3c; font-weight:600; } td.bad { color:#c0392b; font-weight:600; }
</style>
<script type="application/ld+json">${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: "MapaSalud — Hospitales de España",
  description: DESC,
  url: "https://mapasalud-es.vercel.app/",
  license: "https://opensource.org/licenses/MIT",
  isAccessibleForFree: true,
  inLanguage: "es",
  creator: { "@type": "Person", name: "Armando Cuesta" },
  spatialCoverage: { "@type": "Place", name: "España" },
  keywords: ["hospitales", "calidad asistencial", "INCLASNS", "CMBD", "sanidad", "España", "datos abiertos"],
})}</script>`,
  footer: `Datos hospitalarios © OpenStreetMap (ODbL) · Límites © IGN (CC-BY 4.0) ·
    Calidad: INCLASNS / CMBD, Ministerio de Sanidad (RD 1495/2011) · fechas por fuente (ver cada página). ·
    Proyecto independiente, sin financiación ni patrocinio. Información para preguntar mejor a tu médico, no un veredicto. No es consejo médico.<br>
    <a href="/metodologia">Metodología</a> · <a href="/privacidad">Privacidad</a> ·
    <a href="/aviso-legal">Aviso legal</a> ·
    <a href="https://github.com/acuestamd/mapasalud-es">Código y datos (MIT)</a>`,
  pager: false,
  toc: false,
  theme: "light",
  cleanUrls: true,
};
