---
title: Verificar un médico
toc: false
---

<span class="eyebrow">Verificación de credenciales</span>

# Verificar un médico

<div class="hero">

Esto **no es un ranking** de médicos ni recoge opiniones. Hace una sola cosa, de
forma honesta: ayudarte a **comprobar las credenciales oficiales** de un facultativo
—que está colegiado y habilitado para ejercer— enlazando a los **registros públicos
oficiales**. No guardamos ni copiamos datos personales; los enlaces te llevan al
registro de origen para que hagas la consulta tú.

</div>

```js
const nombre = view(Inputs.text({
  label: "Nombre del médico",
  placeholder: "Nombre y apellidos",
  width: 360,
  submit: false
}));
```

```js
display(html`<div class="verif-action">
  <button class="btn" disabled=${!(nombre && nombre.trim())} onclick=${async (e) => {
    const n = (nombre || "").trim();
    try { await navigator.clipboard.writeText(n); } catch (_) {}
    window.open("https://www.cgcom.es/consulta-publica-colegiados", "_blank", "noopener");
    const b = e.currentTarget; b.textContent = "Nombre copiado · pégalo (Cmd/Ctrl+V) en el buscador";
    setTimeout(() => { b.textContent = "Copiar nombre y abrir el buscador del CGCOM"; }, 3000);
  }}>Copiar nombre y abrir el buscador del CGCOM</button>
  <div class="muted" style="font-size:.85rem;margin-top:.4rem">El buscador oficial no permite pasar el nombre por enlace,
  así que lo copiamos a tu portapapeles (en local, no se envía a ninguna parte) para que solo tengas que pegarlo.</div>
</div>`);
```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>CGCOM · Registro de Colegiados</h2>
    <p>Registro central de médicos colegiados de España (datos aportados por los
    colegios provinciales). La colegiación es <b>obligatoria</b> para ejercer, así
    que es la comprobación principal.</p>
    <p><a class="btn" href="https://www.cgcom.es/consulta-publica-colegiados" target="_blank" rel="noopener">Abrir consulta pública del CGCOM →</a></p>
  </div>
  <div class="card">
    <h2>REPS · Registro Estatal de Profesionales Sanitarios</h2>
    <p>Registro oficial del Ministerio de Sanidad: titulación, especialidad y centros
    donde ejerce. Comprobación secundaria — aún <b>no está completo</b>, así que no
    encontrar a alguien no significa que no esté habilitado.</p>
    <p><a class="btn" href="https://reps.sanidad.gob.es/" target="_blank" rel="noopener">Abrir buscador del REPS →</a></p>
  </div>
</div>

<div class="note">

**Por qué solo verificación (y no puntuaciones).** Puntuar a médicos con nombre y
apellidos a partir de reseñas es, a la vez, **inválido** (las estrellas miden
satisfacción, no calidad clínica, y con pocas reseñas el resultado se dispara) y
**jurídicamente arriesgado** en la UE (RGPD, derecho al honor, doctrina *jameda*).
Por eso este proyecto se queda en lo defendible: **credencial verificada, enlazada a
su registro oficial.** **Por qué no se integra la búsqueda aquí:** el buscador del CGCOM
exige un reCAPTCHA ligado a su dominio y el REPS no ofrece API pública; replicarlos sería
eludir una medida anti‑automatización y tratar datos personales sin base. MapaSalud **no
consulta, no recibe ni almacena** datos de colegiados: solo te abre el registro oficial y
la consulta la haces tú contra la fuente. Para contexto agregado —cuántos colegiados hay por especialidad
y provincia— existe el dato abierto de
[profesionales sanitarios colegiados](https://datos.gob.es/es/catalogo?q=profesionales+sanitarios+colegiados)
(solo recuentos, sin nombres). Ver [`DATA-LICENSES.md`](https://github.com/acuestamd/mapasalud-es/blob/main/DATA-LICENSES.md).

</div>

<style>.verif-action { margin: 0.4rem 0 1.3rem; } .verif-action .btn[disabled] { opacity:.45; pointer-events:none; }</style>
