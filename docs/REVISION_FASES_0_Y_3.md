# Revisión Técnica y Documentación de Cierre — Fases 0 y 3

> **Fecha**: `2026-11-18`  
> **Estado de procesos**: Verificado sin tareas en segundo plano ni procesos/puertos activos de la aplicación (`vite`, `live_api.py`, `esbuild`, puertos `4173` / `5173` / `8765` cerrados).  
> **Documentos relacionados**: [ARQUITECTURA_UI_UX.md](./ARQUITECTURA_UI_UX.md) · [AUDITORIA_Y_ROADMAP.md](./AUDITORIA_Y_ROADMAP.md) · [FASE_3_TODOS.md](./FASE_3_TODOS.md) · [README.md](../README.md).

---

## 1. Resumen Ejecutivo

Con el cierre de la **Fase 0** (estabilización visual, paletas GIBS reales y limpieza de documentación raíz) y la **Fase 3** (coherencia temporal diaria vs. simulación, fluidez del deslizable y guion guiado dinámico), la base **Buscador + Earth Engine 3D** queda alineada tanto estética como científicamente:

- **Relieve 3D limpio**: eliminado el artefacto de "grabado / estrías" en `Vista Satélite` y calibrada la semitransparencia en capas regionales gruesas para mantener legible la topografía subyacente.
- **Leyendas veraces**: las 10 capas temáticas GIBS usan gradientes CSS reales extraídos de sus archivos oficiales `colormaps/v1.3/*.xml`, con rangos y unidades explícitas.
- **Reloj temporal unificado**: la barra inferior distingue ahora entre imágenes diarias reales WMTS (`Foto satelital del día · YYYY-MM-DD` sobre `N` días) y los modelos paramétricos (`Simulación` / `Variable Cruzada` sobre `T₀..T₃`), eliminando el temblor del slider.
- **Rigor de marca y producto**: `README.md` reescrito reflejando el software actual con `0` menciones a NASA en toda la app web, JSON de casos y documentación raíz.

---

## 2. Desglose de Cambios por Fase y Archivo

| Archivo | Fase | Cambio principal aplicado | Impacto verificado |
| :--- | :---: | :--- | :--- |
| [TerrainViewer3D.jsx](../src/components/TerrainViewer3D.jsx) | **0 · 3** | Eliminada perturbación artificial de normales (`0.28`) y filtro *high-pass* (`3.0 / 1024`, peso `0.75`) en `uRenderMode == 4`; añadido uniforme `uGibsOpacity` (`0.48–0.52` en `maxLevel <= 6`, `0.65–0.68` en `maxLevel >= 7`); renderizado de `legend.css`; reporte sincronizado de `gibsStatuses` por día. | Relieve natural sin granulado ni halo en nubes/cañones; plumas atmosféricas (`NO₂`, `IMERG`, etc.) dejan ver valles debajo; calendario GIBS sincronizado con `App.jsx`. |
| [gibsLayers.js](../src/utils/gibsLayers.js) | **0** | Calibradas las 10 leyendas temáticas contra `WMTSCapabilities.xml` + `colormaps/v1.3/*.xml` (`css`, `left`, `right`, `overlayOpacity`). Correcciones críticas en `Nieve NDSI` (amarillo-salmón-rojo real), `NO₂`, `CO₂` (Viridis), `CO`, `Ozono O₃`, `LST`, `SMAP`, `NDVI`, `AOD` e `IMERG`. | La barra de leyenda coincide 1:1 con los colores e intervalos reales servidos por WMTS. |
| [README.md](../README.md) | **0** | Reescritura completa describiendo los 3 modos reales (`Modo Buscador`, `Modo Earth Engine`, `Agent Mode` roadmap), 13 capas GIBS, ejecución CORS directa + `live_api.py` opcional y separación `Vista Satélite` vs `Simulación`. | `0` menciones a NASA; alineado al producto actual. |
| [index.css](../src/index.css) | **3** | Eliminada `transition: transform 0.12s ease` en *thumbs* de `<input type="range">` (`::-webkit-slider-thumb` y `::-moz-range-thumb`). | Supresión del retardo/vibración visual del deslizable durante reproducción y arrastre. |
| [App.jsx](../src/App.jsx) | **3** | Elevado `dailyDates` (`getDatasetDailyDates(dataset, 36)`) y `gibsStatuses`; congelado `simQuantizedT` para no recalcular `128×128` vértices a 60 fps en `Vista Satélite`; bucle `Play` discreto por días en GIBS; pasado `setRenderMode` y `setGibsLayerId` a `StoryModeTour`. | Reproducción fluida día a día sin temblor ni sobrecarga de CPU/GC; `handleManualSeek` conserva índices diarios exactos incluso con filtro de captura activo. |
| [TimelineControl.jsx](../src/components/TimelineControl.jsx) | **3** | En `Vista Satélite` opera sobre `0..N-1` días reales (`step=1`), muestra `Foto satelital del día` / `Sin captura WMTS`, hitos reales del periodo y `Solo días con captura`; en `Simulación` usa `step="any"` sobre `T₀..T₃` con etiqueta `Interpolado (%)`. | Desaparece la etiqueta contradictoria `"Interpolado"` sobre imágenes satelitales reales; slider sin saltos ni temblor en móvil y escritorio. |
| [ExaggerationPanel.jsx](../src/components/ExaggerationPanel.jsx) | **0 · 3** | Soporte de `legend.css`; sustituidos KPIs heredados (`"4 pasos"`, `"OLS + p-valor local"`) en `getGuide`; botón unificado `"Globo"`; variable activa en el badge de veredicto (`Tendencia · [Var]`); nota de escala regional `~0.5°`; prioridad de serie diaria larga en `Datos científicos`. | Diagnósticos más honestos, diferenciando celda climática regional (`~0.5°`) de cota puntual MDE (`~30 m`). |
| [StoryModeTour.jsx](../src/components/StoryModeTour.jsx) | **3** | Reemplazado fallback fijo de Los Ángeles por `buildLiveStoryScript(dataset)` dinámico; migrado a `setRenderMode` + `setGibsLayerId`; tarjeta anclada con `createPortal(..., document.body)` fuera del `backdrop-blur-xl` de `<header>`. | En zonas buscadas en vivo (`Valencia`), `Demo rápida` narra esa región real y su tarjeta es visible sin recortes. |
| [ARQUITECTURA_UI_UX.md](../docs/ARQUITECTURA_UI_UX.md) & [FASE_3_TODOS.md](./FASE_3_TODOS.md) | **0 · 3** | Marcadas **Fases 0 y 3** como completadas (`✅`) y detallados bloques `A–E` verificados. | Documentación de arquitectura y roadmap al día. |

---

## 3. Verificaciones Ejecutadas tras la Última Edición

1. **Procesos y puertos de la aplicación**:
   - `manage_task(list)` → sin tareas activas.
   - `ps aux` (`vite|live_api|esbuild`) → `NO_APP_PROCESSES`.
   - `ss -tulpn` (`4173|5173|8765`) → `NO_OPEN_APP_PORTS`.
2. **Build y limpieza terminológica**:
   - `npm run build` → correcto (`✓ 2177 modules transformed.`, `✓ built in 18.28s`).
   - `grep -rnI "NASA" src/ index.html README.md public/data/*.json` → `ZERO_NASA_MATCHES`.
   - `grep -rnE "4 pasos|OLS \+ p-valor local" src/ README.md` → `0` coincidencias (`setOpticalMode` queda únicamente como respaldo defensivo si faltara `setRenderMode`).
3. **Pruebas end-to-end y capturas en navegador headless (`vite preview`)**:
   - **`1600×900` (Los Ángeles)**: inspeccionados `Color real` (relieve limpio sin estrías), `NO₂` (pluma semitransparente con relieve legible debajo y escala crema→rojo) y `Nieve NDSI` (escala real amarillo→salmón→rojo).
   - **`1600×900` (Valencia `2024-10-20 → 2024-11-10`)**:
     - `Vista Satélite`: slider `max="21"`, `step="1"`, badge `Foto satelital del día · 2024-10-20`, `hasInterpolatedBadgeInGibs: false`, avance fluido en `Play` (`day 0 → day 3`).
     - `Simulación`: conmutación limpia a `max="3"`, `step="any"`, hitos `T₀..T₃`.
     - `Datos científicos`: serie diaria de precipitación (`22d`) priorizada al inicio de la pestaña.
     - `Demo rápida`: tarjeta `RECORRIDO GUIADO · 1/4` visible narrando Valencia (`mentionsValencia: true`, `mentionsLAFallback: false`).
   - **`390×844` móvil (Los Ángeles)**: slider diario compacto (`max="12"`, `step="1"`), `scrollW: 390`, `pageErrors: []`.

---

## 4. Observaciones Técnicas y Alcance Pendiente (Transparente)

- **Comportamiento en días sin captura GIBS (`empty`)**: cuando el usuario detiene el deslizador sobre una fecha concreta sin cobertura WMTS (p. ej. hueco orbital de `OCO-2` o borde de órbita), `TimelineControl` advierte `Sin captura WMTS · YYYY-MM-DD` (ámbar), mientras el terreno 3D mantiene el último frame válido más cercano (`gibsState.date`) para evitar un lienzo negro; activar **`Solo días con captura`** restringe la navegación solo a los días cargados.
- **Cobertura de casos en la pasada automática final**: en el último script automático se probaron en vivo **Valencia** (escritorio) y **Los Ángeles** (escritorio + móvil); los guiones actualizados de **Kamchatka** y **Málaga** en `StoryModeTour.jsx` quedaron validados por revisión estática y compilación sin haberlos pulsado de forma individual en esta ronda.
- **Cambios locales fuera del alcance de Fases 0 y 3**: en `git status` figuran `netlify.toml` (+1 línea en blanco al final), `PLAN_EJECUCION_12H.md` y `raw_data/` sin rastrear, previos o ajenos a estas fases.
- **Siguiente hito del roadmap**: **Fase 4 (`Agent Mode` UI completa)** seguida de **Fase 5 (`Sandbox + Harness Real`)**.

