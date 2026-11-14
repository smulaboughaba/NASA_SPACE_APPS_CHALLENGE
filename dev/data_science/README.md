# Módulo Data Science e IA (`dev/data_science/`)

> **Código:** `DEV-03`  
> **Responsables:** Extracción y análisis inicial: Hugo, Yaro y Jesús · Motor híbrido IA (`models/`): Samu (`@smulaboughaba`)  
> **Estado:** En preparación  

---

## Propósito y Organización

Agrupa los scripts, informes y pipelines de extracción de datos SAR/Open Data (según [`../../research/02_fuentes_datos_nasa.md`](../../research/02_fuentes_datos_nasa.md)) y el motor híbrido de IA (según [`../../research/05_formatos_sar_y_arquitectura_modelos_ia.md`](../../research/05_formatos_sar_y_arquitectura_modelos_ia.md)).

```text
data_science/
├── README.md
├── hugo_inundaciones/       # Extracción DANA Valencia (SAR + AEMET/Open-Meteo + DEM) — Hugo (@hviciana)
├── yaro_incendios_cultivos/ # Extracción Incendios/Cultivos (SAR + NASA FIRMS) — Yaro (@ItsYarosun)
├── jesus_global_insar/      # Extracción Terremotos InSAR / Glaciares / Global (USGS/CSA) — Jesús (@jesusorellanagil2002)
├── models/                  # Motor híbrido Nivel 1 SAR + Nivel 2 Big Data SHAP — Samu (@smulaboughaba)
└── samples/                 # Muestras ligeras JSON/CSV (< 5 MB)
```

> **Importante:** Seguir las instrucciones de [`../GUIA_EQUIPO_ANTIGRAVITY.md`](../GUIA_EQUIPO_ANTIGRAVITY.md) y no versionar archivos raster/crudos pesados en Git.
