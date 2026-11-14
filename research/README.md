# Carpeta `research/` — Investigación y Datos NASA

Esta carpeta centraliza toda la documentación previa al desarrollo técnico: comprensión exacta del reto elegido en **NASA Space Apps Challenge**, recopilación verificada de datos oficiales de la NASA y definición del enfoque diferenciador de nuestra solución.

## Índice de documentos

| Código | Documento | Propósito |
| :--- | :--- | :--- |
| `RES-01` | [`01_analisis_del_reto.md`](01_analisis_del_reto.md) | Desglose oficial del Challenge, problema, objetivos y criterios de evaluación. |
| `RES-02` | [`02_fuentes_datos_nasa.md`](02_fuentes_datos_nasa.md) | Registro estructurado de APIs, datasets y misiones de la NASA que vamos a consumir. |
| `RES-03` | [`03_estado_del_arte_y_solucion.md`](03_estado_del_arte_y_solucion.md) | Análisis de alternativas existentes, valor añadido de nuestra propuesta e impacto. |
| `RES-04` | [`04_plan_de_research_y_evidencias_fusion.md`](04_plan_de_research_y_evidencias_fusion.md) | Plan operativo de research (`R1`–`R4`) y evidencias científicas de fusión SAR + Open Data para validar el criterio *Validity*. |
| `RES-05` | [`05_formatos_sar_y_arquitectura_modelos_ia.md`](05_formatos_sar_y_arquitectura_modelos_ia.md) | Formatos oficiales (`HDF5` NISAR y `COG` OPERA), evaluación sin sesgos (`T-SAR-JEPA` vs. SOTA) y arquitectura híbrida de fusión con Big Data. |

## Normas de documentación en `research/`

1. **Citar siempre la fuente oficial**: Incluir el enlace exacto de NASA (`nasa.gov`, `earthdata.nasa.gov`, `api.nasa.gov`, etc.) o de agencias espaciales asociadas.
2. **Separar hechos de hipótesis**: Indicar claramente qué datos están confirmados en la documentación oficial y qué ideas son suposiciones del equipo por validar.
3. **Mantener la trazabilidad**: Cualquier fuente añadida aquí que implique cambios técnicos debe reflejarse en [`../dev/shared/README.md`](../dev/shared/README.md) y [`../anotaciones/03_decisiones_arquitectura.md`](../anotaciones/03_decisiones_arquitectura.md).

