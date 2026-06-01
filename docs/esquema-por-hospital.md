# Esquema destino: datos de calidad POR HOSPITAL (pendiente de microdatos i-CMBD)

Cuando lleguen los microdatos anonimizados del CMBD/i-CMBD (solicitud en
`~/mapasalud-cmbd-request-draft.md`, ~semanas), la capa por hospital se construirá sobre
este esquema. Dejarlo fijado ahora permite desarrollar el panel en paralelo.

## `src/data/hospital-quality.json` (propuesto)
```json
{
  "title": "Indicadores de calidad por hospital (CMBD/i-CMBD, anonimizado)",
  "source": "RAE-CMBD / i-CMBD, Ministerio de Sanidad (RD 69/2015).",
  "version": "AAAA",
  "riskAdjusted": true,
  "indicators": [
    {
      "id": 129,
      "name": "Mortalidad intrahospitalaria tras IAM (ajustada por riesgo, GRD-APR)",
      "betterWhen": "lower",
      "unit": "por 100 altas",
      "hospitals": {
        "<hospId>": { "value": 7.8, "ciLow": 5.9, "ciHigh": 9.7, "n": 412, "year": "AAAA" }
      }
    }
  ]
}
```

## Reglas de integración (heredan de DATA-LICENSES y del plan)
- **Clave de unión:** `hospId` debe casar con el **código CCN/REGCESS** del Catálogo
  Nacional de Hospitales (tarea 5.4). Si los microdatos vienen con hospitales **codificados**
  (anonimizados), mantener el código tal cual y mostrar "centro anonimizado" hasta poder
  cruzar.
- **Ajuste por riesgo:** usar los indicadores ya ajustados (GRD-APR) del i-CMBD; marcar
  `riskAdjusted: true` y retirar el aviso de "tasas crudas" solo en esta capa.
- **N bajo / IC (tareas 5.2/5.3):** incluir numerador/denominador, calcular IC
  (Wilson/Poisson), **suprimir** celdas por debajo del umbral (~20–30 eventos) y **no
  rankear** sobre estimadores inestables. Mostrar barras de error.
- **UI:** la página `/buscar` mostrará, en la ficha del hospital, sus indicadores propios
  (con IC) en lugar del contexto regional actual; conservar el aviso si un indicador está
  suprimido por bajo N.

## Estado
- Borrador de solicitud listo: `~/mapasalud-cmbd-request-draft.md` (lo envía Armando).
- Hoy la calidad es **regional (CCAA)** vía INCLASNS; esta capa la sustituye/añade a nivel
  de centro cuando lleguen los datos.
