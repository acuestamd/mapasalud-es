// Post-procesa la salida de Observable Framework:
//  - copia estáticos no referuenciados (og.png, robots.txt, sitemap.xml) a la raíz
//  - añade lang="es" al <html> (WCAG 3.1.1) y permite el zoom (quita maximum-scale)
import fs from "node:fs";
import path from "node:path";

const DIST = "dist";
const SRC = "src";

for (const f of ["og.png", "robots.txt", "sitemap.xml"]) {
  const s = path.join(SRC, f);
  if (fs.existsSync(s)) fs.copyFileSync(s, path.join(DIST, f));
}

let patched = 0;
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
      if (h !== before) { fs.writeFileSync(p, h); patched++; }
    }
  }
}
walk(DIST);
console.log(`postbuild: estáticos copiados; lang/viewport corregidos en ${patched} páginas`);
