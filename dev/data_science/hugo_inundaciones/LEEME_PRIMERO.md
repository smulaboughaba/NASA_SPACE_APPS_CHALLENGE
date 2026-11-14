# LÉEME PRIMERO — Hugo (`dev/data_science/hugo_inundaciones/`)

- **Rama obligatoria:** `hugo` (usuario `@hviciana`).
- **Tu único objetivo:** Extraer lluvia histórica y datos de inundación de la **DANA Valencia 2024** usando una API abierta **sin clave**, y generar un resumen limpio en JSON/CSV + notas de análisis con IA.

## Regla de oro (Seguridad)
- **NO toques archivos fuera de esta carpeta** (`dev/data_science/hugo_inundaciones/`) ni de `dev/frontend/hugo_mapa/`.
- GitHub Actions revertirá automáticamente cualquier `push` que modifique archivos fuera de tus 2 carpetas.

## Recursos sin registro (Core MVP)
- **Open-Meteo Historical API (ERA5 Copernicus, sin API Key):** `https://archive-api.open-meteo.com/v1/archive` (reemplaza a AEMET para evitar registros).
- **Guía Floods NASA (sin login):** [NISAR StoryMaps — Floods](https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/) y `bbox`/`dates` de `dana-valencia-2024` en `dev/shared/mock_events_contract.json`.

## Prompt listo para copiar y pegar en Antigravity (Flash)
```text
Trabaja SOLO dentro de dev/data_science/hugo_inundaciones/. Lee dev/shared/mock_events_contract.json para copiar las coordenadas y fechas de dana-valencia-2024 (NO edites el contrato).
Crea un script Python (extraer_lluvia_dana.py) que consulte https://archive-api.open-meteo.com/v1/archive (sin API key, parámetros latitude, longitude, start_date, end_date, daily=precipitation_sum) para finales de octubre 2024 en Valencia, guarde un CSV/JSON resumen en esta carpeta y genere analisis_inundaciones.md explicando cómo cruzar esa lluvia con la caída de backscatter SAR (doble rebote vs agua calma). No toques archivos fuera de dev/data_science/hugo_inundaciones/.
```

