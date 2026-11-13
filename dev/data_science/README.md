# Módulo Data Science (`dev/data_science/`)

> **Código:** `DEV-03`  
> **Responsable:** *Por asignar en Fase 2*  
> **Estado:** Pendiente  

---

## Propósito

Agrupa los scripts, notebooks y pipelines para descarga, limpieza, transformación y análisis/modelado de los datasets oficiales de la NASA catalogados en [`../../research/02_fuentes_datos_nasa.md`](../../research/02_fuentes_datos_nasa.md).

## Organización recomendada

```text
data_science/
├── README.md
├── notebooks/       # Exploración y validación de datasets NASA
├── pipelines/       # Scripts reproducibles de ETL / limpieza
├── models/          # Entrenamiento o inferencia (si aplica)
└── samples/         # Muestras ligeras de prueba (< 5 MB)
```

> **Importante:** No versionar datasets grandes en bruto dentro de Git. Guardar únicamente muestras ligeras de prueba o scripts reproducibles de descarga.
