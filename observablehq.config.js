// MapaSalud — Observable Framework config
const DESC =
  "El mapa abierto de los hospitales de España: indicadores de calidad por comunidad " +
  "con su fuente (INCLASNS/CMBD), buscador de hospitales y verificación de colegiación. " +
  "Datos abiertos, sin ánimo de lucro.";
const OG = "https://mapasalud-es.vercel.app/og.png";

export default {
  title: "MapaSalud",
  pages: [
    {name: "Hospitales", path: "/index"},
    {name: "Buscar hospital", path: "/buscar"},
    {name: "Calidad por región", path: "/calidad"},
    {name: "Verificar un médico", path: "/verificacion"},
    {name: "Referencias", path: "/referencias"},
  ],
  head: `
<meta name="description" content="${DESC}">
<meta name="theme-color" content="#0b6fb8">
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
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230b6fb8'/%3E%3Cpath d='M14 7h4v7h7v4h-7v7h-4v-7H7v-4h7z' fill='white'/%3E%3C/svg%3E">
<style>
:root { --theme-foreground-focus:#0b6fb8; --ms:#0b6fb8; --ms-dark:#095a96; }
body { -webkit-font-smoothing:antialiased; }
#observablehq-header, #observablehq-main h1 { letter-spacing:-.4px; }
.hero { font-size:1.06rem; max-width:54rem; color:var(--theme-foreground-muted); }
.hero b { color:var(--theme-foreground); }
.muted { color:var(--theme-foreground-muted); }

/* hero band */
.hero-band { background:linear-gradient(135deg,#0b3d63,#0b6fb8 60%,#1597c9); color:#fff;
  border-radius:16px; padding:1.8rem 2rem; margin:.4rem 0 1.4rem; }
.hero-band h1 { color:#fff; font-size:2rem; margin:.1rem 0 .4rem; border:none; }
.hero-band p { font-size:1.08rem; max-width:46rem; margin:0; opacity:.97; line-height:1.4; }
.hero-band .badge { display:inline-block; background:rgba(255,255,255,.18); padding:4px 12px;
  border-radius:999px; font-size:.78rem; font-weight:600; }

/* feature cards */
.features { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin:1.25rem 0; }
.feature { display:block; padding:1.05rem 1.15rem; border:1px solid var(--theme-foreground-faint);
  border-radius:14px; text-decoration:none; color:inherit; transition:transform .15s,box-shadow .15s,border-color .15s; }
.feature:hover { border-color:var(--ms); transform:translateY(-2px); box-shadow:0 6px 22px rgba(11,111,184,.13); }
.feature .ic { font-size:1.7rem; line-height:1; }
.feature h3 { margin:.5rem 0 .25rem; font-size:1.05rem; }
.feature p { margin:0 0 .5rem; font-size:.88rem; color:var(--theme-foreground-muted); }
.feature .go { color:var(--ms); font-weight:600; font-size:.88rem; }

/* stat + content cards */
.big { font-size:2.1rem; font-weight:800; line-height:1; display:block; color:var(--ms); }
.card h2 { margin-top:0; }

/* buttons & pills */
.btn { display:inline-block; padding:.5rem .9rem; background:var(--ms); color:#fff !important;
  border-radius:9px; text-decoration:none; font-weight:600; }
.btn:hover { background:var(--ms-dark); }
.feature:focus-visible, .btn:focus-visible, a:focus-visible { outline:2px solid var(--ms); outline-offset:2px; border-radius:4px; }
.pill { background:var(--theme-foreground-faintest); padding:1px 9px; border-radius:999px; font-size:.85em; }

/* notes & source */
.note { max-width:54rem; border-left:3px solid var(--ms); padding:.6rem 0 .6rem 1rem; margin-top:1.4rem;
  font-size:.92rem; background:var(--theme-foreground-faintest); border-radius:0 8px 8px 0; }
.src { max-width:54rem; font-size:.85rem; color:var(--theme-foreground-muted); margin-top:.5rem; }
td.good { color:#137333; font-weight:600; } td.bad { color:#b3261e; font-weight:600; }
</style>`,
  footer: `Datos hospitalarios © OpenStreetMap (ODbL) · Límites © IGN (CC-BY 4.0) ·
    Calidad: INCLASNS / CMBD, Ministerio de Sanidad (RD 1495/2011) · último dato 2024. ·
    Información para orientar tus preguntas al médico, no un veredicto. No es consejo médico.<br>
    <a href="/metodologia">Metodología</a> · <a href="/privacidad">Privacidad</a> ·
    <a href="/aviso-legal">Aviso legal</a> ·
    <a href="https://github.com/acuestamd/mapasalud-es">Código y datos (MIT)</a>`,
  pager: false,
  toc: false,
  theme: "light",
  cleanUrls: true,
};
