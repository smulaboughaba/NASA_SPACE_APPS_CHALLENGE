# LÉEME PRIMERO — Jesús (`dev/data_science/jesus_global_insar/`)

- **Rama obligatoria:** `jesus` (usuario `@jesusorellanagil2002`).
- **Tu único objetivo:** Extraer eventos sísmicos reales desde la **API abierta de USGS** (sin API key) y preparar guiones explicativos de deformación InSAR y escala global (terremotos / ciclón El Niño).

## Regla de oro (Seguridad)
- **NO toques archivos fuera de esta carpeta** (`dev/data_science/jesus_global_insar/`) ni de `dev/frontend/jesus_storytelling/`.
- GitHub Actions revertirá automáticamente cualquier `push` que modifique archivos fuera de tus 2 carpetas.

## Recursos sin registro (Core MVP)
- **USGS Earthquake GeoJSON API (sin API Key):** `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson`
- **Lecturas NASA (sin login):** [NISAR Applications White Papers](https://nisar.jpl.nasa.gov/applications/societal-benefit/) y [UAVSAR Postcards](https://uavsar.jpl.nasa.gov/education/postcards.html).

## Prompt listo para copiar y pegar en Antigravity (Flash)
```text
Trabaja SOLO dentro de dev/data_science/jesus_global_insar/. Lee dev/shared/mock_events_contract.json (eventos terremoto-insar-global y ciclon-elnino-global, NO edites el JSON).
Crea un script Python (extraer_sismos_usgs.py) que consulte https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2024-01-01&minmagnitude=6.5 (sin clave), guarde los últimos 10 sismos relevantes en un JSON limpio aquí dentro y redacte analisis_global_insar.md explicando cómo InSAR mide deformación milimétrica del suelo tras terremotos y su relación en la web con escalas Local -> Global. No toques archivos fuera de dev/data_science/jesus_global_insar/.
```

