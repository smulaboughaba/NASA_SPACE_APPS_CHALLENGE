# LÉEME PRIMERO — Yaro (`dev/data_science/yaro_incendios_cultivos/`)

- **Rama obligatoria:** `yaro` (usuario `@ItsYarosun`).
- **Tu único objetivo:** Extraer datos abiertos de **incendios y clima seco** (sin logins complicados) y redactar cómo la banda **L** y **S** detectan cicatrices de fuego y estrés en cultivos.

## Regla de oro (Seguridad)
- **NO toques archivos fuera de esta carpeta** (`dev/data_science/yaro_incendios_cultivos/`) ni de `dev/frontend/yaro_analytics/`.
- GitHub Actions revertirá automáticamente cualquier `push` que modifique archivos fuera de tus 2 carpetas.

## Recursos sin registro (Core MVP)
- **Open-Meteo Historical API (sin API Key):** `https://archive-api.open-meteo.com/v1/archive` (temperatura máxima, viento y humedad relativa).
- **Focos activos NASA FIRMS (descarga web directa):** [NASA FIRMS Active Fire](https://firms.modaps.eosdis.nasa.gov/active_fire/) y [NISAR StoryMaps — Wildfires](https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/).

## Prompt listo para copiar y pegar en Antigravity (Flash)
```text
Trabaja SOLO dentro de dev/data_science/yaro_incendios_cultivos/. Lee dev/shared/mock_events_contract.json (evento incendio-forestal-mediterraneo, NO edites el JSON).
Crea un script Python (extraer_clima_incendios.py) que consulte https://archive-api.open-meteo.com/v1/archive (sin clave API) con temperature_2m_max, relative_humidity_2m_mean y wind_speed_10m_max para las coordenadas y fechas de ese evento, guarde un CSV/JSON en esta carpeta y genere analisis_incendios_cultivos.md explicando cómo Open Data climático evita confundir sequía agrícola con cicatriz de incendio en SAR L-band/S-band. No toques archivos fuera de dev/data_science/yaro_incendios_cultivos/.
```

