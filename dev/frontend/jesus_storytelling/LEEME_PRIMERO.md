# LÉEME PRIMERO — Jesús (`dev/frontend/jesus_storytelling/`)

- **Rama obligatoria:** `jesus` (usuario `@jesusorellanagil2002`).
- **Tu único objetivo:** Construir el **Narrador Guiado (Storytelling)** y el **Glosario Educativo SAR/NISAR** para que cualquier usuario entienda la ciencia en 60 segundos.

## Regla de oro (Seguridad)
- **NO toques archivos fuera de esta carpeta** (`dev/frontend/jesus_storytelling/`) ni de `dev/data_science/jesus_global_insar/`.
- GitHub Actions revertirá automáticamente cualquier `push` que modifique archivos fuera de tus 2 carpetas.

## Recursos sin registro (Core MVP)
- Contrato local: `dev/shared/mock_events_contract.json` (`storytelling_summary` + los 5 conceptos de `sar_concepts`: `l-band`, `s-band`, `backscatter`, `insar`, `polarizacion`, cada uno con `id`, `title`, `summary`).
- Textos base NASA (sin login): [Intro to SAR](https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar) y [NASA ARSET Trainings (ES/EN)](https://appliedsciences.nasa.gov/get-involved/training).

## Prompt listo para copiar y pegar en Antigravity (Flash)
```text
Trabaja SOLO dentro de dev/frontend/jesus_storytelling/. Lee dev/shared/mock_events_contract.json (NO lo modifiques).
Crea una vista HTML/JS/CSS o componente React con dos bloques limpios:
1) "Modo Historia": muestra el título, scale, niche, location, dates y el texto de storytelling_summary del evento activo, con botones Anterior / Siguiente evento.
2) "Aprende SAR en 1 minuto": tarjetas interactivas generadas desde el array sar_concepts del JSON (l-band, s-band, backscatter, insar, polarizacion) mostrando title y summary de forma visual. No toques archivos fuera de dev/frontend/jesus_storytelling/.
```
