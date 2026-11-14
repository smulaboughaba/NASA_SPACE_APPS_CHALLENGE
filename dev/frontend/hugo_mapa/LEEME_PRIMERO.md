# LÉEME PRIMERO — Hugo (`dev/frontend/hugo_mapa/`)

- **Rama obligatoria:** `hugo` (usuario `@hviciana`).
- **Tu único objetivo:** Crear el componente visual de **Mapa Interactivo SAR + Selector Local/Global** usando los eventos de `../../shared/mock_events_contract.json` (`dana-valencia-2024`, `incendio-forestal-mediterraneo`, `terremoto-insar-global`, `ciclon-elnino-global`).

## Regla de oro (Seguridad)
- **NO toques archivos fuera de esta carpeta** (`dev/frontend/hugo_mapa/`) ni de `dev/data_science/hugo_inundaciones/`.
- GitHub Actions revertirá automáticamente cualquier `push` a `hugo` que modifique archivos fuera de tus 2 carpetas.

## Recursos sin registro (Core MVP)
- Contrato de datos local: `dev/shared/mock_events_contract.json` (solo lectura).
- Referencia visual NASA (sin login): [NISAR StoryMaps](https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/) y [UAVSAR Postcards](https://uavsar.jpl.nasa.gov/education/postcards.html).

## Prompt listo para copiar y pegar en Antigravity (Flash)
```text
Trabaja SOLO dentro de dev/frontend/hugo_mapa/. Lee dev/shared/mock_events_contract.json (NO lo modifiques).
Crea un módulo HTML/JS/CSS o componente React con Leaflet (OpenStreetMap) que:
1) Muestre un selector rápido de escala ("Local" y "Global") y botones para los 4 eventos del JSON usando sus campos center_coords, bbox, title, scale y niche.
2) Dibuje el rectángulo bbox del evento seleccionado y muestre en un panel lateral los campos sar_signature (band, polarization, mechanism, affected_area_km2, jepa_latent_anomaly_score) y attributions.
3) Incluya un selector o slider Pre-evento / Evento / Post-evento usando dates.t0_pre, dates.t1_event y dates.t2_post_sar. No toques ningún archivo fuera de dev/frontend/hugo_mapa/.
```
