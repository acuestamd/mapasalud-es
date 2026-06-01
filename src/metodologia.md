---
title: Metodología
toc: false
---

# 🧭 Metodología y propósito

<div class="hero">

MapaSalud reúne datos públicos del sistema hospitalario español en un mapa,
**enlazando cada cifra a su fuente**. Es un proyecto abierto, sin ánimo de lucro.

</div>

## Quién y por qué
Lo mantengo yo, **Armando Cuesta, médico**. La sanidad pública española publica datos
de calidad valiosos pero dispersos y poco legibles; no existe un equivalente abierto,
objetivo y trazable a las clasificaciones cerradas o de reputación. Este proyecto los
pone en un mapa, con su origen siempre a la vista, para informar —no para sustituir— el
criterio clínico.

## Qué datos uso y cómo
- **Localización de hospitales** — OpenStreetMap (ODbL). Da el "dónde"; no es una medida
  de calidad. La titularidad y las urgencias proceden de OSM y solo constan para ~3 de
  cada 10 hospitales.
- **Límites geográficos** — Instituto Geográfico Nacional (CC-BY 4.0), con la proyección
  `geoConicConformalSpain` (Canarias en recuadro).
- **Indicadores de calidad** — **INCLASNS** (Indicadores Clave del SNS, Ministerio de
  Sanidad; RD 1495/2011), con datos de base del **CMBD / i-CMBD**, obtenidos del punto de
  acceso público de la propia herramienta. Cada indicador enlaza a su ficha y año.
- **Verificación de médicos** — enlace a los registros oficiales (CGCOM, REPS). Sin
  puntuaciones, sin reseñas: solo comprobación de credenciales.

## Límites (importantes)
- Los indicadores de calidad son **por comunidad autónoma, no por hospital**.
- Son **tasas crudas, no ajustadas por riesgo**: las diferencias entre comunidades
  reflejan en parte la casuística y la edad de cada población.
- Comunidades con pocos casos (**Ceuta, Melilla**) tienen cifras inestables: se marcan
  como **bajo N** y se dejan fuera de la escala de color.
- INCLASNS publica estos indicadores **por sexo** (no hay un dato combinado): elige
  mujeres u hombres.
- Los **datos por hospital y por especialidad** llegarán con la solicitud de microdatos
  i-CMBD (anonimizados, en trámite), junto con el ajuste por riesgo y los intervalos de
  confianza.

## Independencia y reproducibilidad
Estrictamente **no comercial**, sin pagos por posicionamiento. Código bajo licencia MIT y
*pipeline* de datos abierto y reproducible:
[github.com/acuestamd/mapasalud-es](https://github.com/acuestamd/mapasalud-es). Detalle de
fuentes y licencias en [`DATA-LICENSES.md`](https://github.com/acuestamd/mapasalud-es/blob/main/DATA-LICENSES.md).

**No es consejo médico** ni una medida validada de la calidad de un profesional o centro.
