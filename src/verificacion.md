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
  label: "Nombre a verificar",
  placeholder: "Nombre y apellidos del médico",
  width: 360
}));
```

```js
display(nombre && nombre.trim()
  ? html`<div class="copy">Vas a buscar: <b>${nombre.trim()}</b> — ábrelo en un registro oficial e introdúcelo allí.</div>`
  : html`<div class="muted">Escribe un nombre arriba (opcional) y abre uno de los registros oficiales.</div>`);
```

<div class="grid grid-cols-2">
  <div class="card">
    <h2>CGCOM · Registro de Colegiados</h2>
    <p>Registro central de médicos colegiados de España (datos aportados por los
    colegios provinciales). La colegiación es <b>obligatoria</b> para ejercer, así
    que es la comprobación principal.</p>
    <p><a class="btn" href="https://www.cgcom.es/servicios/consulta-publica-de-colegiados" target="_blank" rel="noopener">Abrir consulta pública del CGCOM →</a></p>
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
su registro oficial.** Para contexto agregado —cuántos colegiados hay por especialidad
y provincia— existe el dato abierto de
[profesionales sanitarios colegiados](https://datos.gob.es/es/catalogo?q=profesionales+sanitarios+colegiados)
(solo recuentos, sin nombres). Ver [`DATA-LICENSES.md`](https://github.com/acuestamd/mapasalud-es/blob/main/DATA-LICENSES.md).

</div>

<style>.copy { margin: 0.5rem 0 1rem; padding: 0.6rem 0.9rem; background: var(--theme-foreground-faintest); border-radius: 8px; }</style>
