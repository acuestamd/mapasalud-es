// Post-procesa la salida de Observable Framework:
//  - copia estáticos no referenciados (og.png, robots.txt, favicon.svg) y las fuentes
//  - añade lang="es" al <html> (WCAG 3.1.1) y permite el zoom (quita maximum-scale)
//  - quita las fuentes de Google (cero terceros)
//  - genera sitemap.xml recorriendo dist (incluye legales y las 19 páginas por comunidad)
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const SRC = "src";
const BASE = "https://mapasalud-es.vercel.app";

for (const f of ["og.png", "robots.txt", "favicon.svg"]) {
  const s = path.join(SRC, f);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(DIST, f));
}
const fontsSrc = path.join(SRC, "fonts");
if (fs.existsSync(fontsSrc)) {
  fs.mkdirSync(path.join(DIST, "fonts"), { recursive: true });
  for (const f of fs.readdirSync(fontsSrc)) fs.copyFileSync(path.join(fontsSrc, f), path.join(DIST, "fonts", f));
}

let patched = 0;
const pages = [];
function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html")) {
      let h = fs.readFileSync(p, "utf8");
      const before = h;
      h = h.replace(/<html(?![^>]*\blang=)/i, '<html lang="es"');
      h = h.replace(/(<meta name="viewport"[^>]*content=")([^"]*)(")/i, (_m, a, c, z) =>
        a + c.replace(/\s*,?\s*maximum-scale=[^,"]*/i, "").replace(/\s*,?\s*user-scalable=[^,"]*/i, "") + z);
      h = h.replace(/<link[^>]*(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>\s*/gi, "");
      if (h !== before) { fs.writeFileSync(p, h); patched++; }
      // ruta limpia para el sitemap
      let rel = path.relative(DIST, p).replace(/\\/g, "/").replace(/\.html$/, "");
      if (rel === "index") rel = "";
      else rel = rel.replace(/\/index$/, "");
      if (rel !== "404") pages.push(rel);
    }
  }
}
walk(DIST);

pages.sort();
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  pages.map(r => `  <url><loc>${BASE}/${r}</loc></url>`).join("\n") +
  `\n</urlset>\n`;
fs.writeFileSync(path.join(DIST, "sitemap.xml"), sitemap);

console.log(`postbuild: lang/viewport en ${patched} páginas · sitemap con ${pages.length} URLs`);
