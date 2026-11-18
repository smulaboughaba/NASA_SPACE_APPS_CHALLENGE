# TO-DOs de Fase 3 — Coherencia Temporal, Rigor Científico y Fluidez del Visor 3D

> **Propósito**: Resolver la desconexión temporal entre las capturas satelitales diarias (`GIBS WMTS`) y el timeline de 4 pasos (`T₀..T₃`), corregir el temblor del deslizable temporal en reproducción/arrastre, limpiar textos y métricas heredadas del panel científico y dotar a `Demo rápida` de un guion real para zonas buscadas en vivo.
>
> **Referencias**: [ARQUITECTURA_UI_UX.md (§5.2.4, §5.2.5, §8)](./ARQUITECTURA_UI_UX.md) · [AUDITORIA_Y_ROADMAP.md (§2.3)](./AUDITORIA_Y_ROADMAP.md).

---

## Bloque A — Estabilización y Fluidez del Deslizable Temporal (`TimelineControl.jsx`, `App.jsx`, `index.css`)

- [x] **A1. Corregir el temblor del ítem deslizable (`<input type="range">`)**:
  - Cambiar `step={0.01}` sobre rangos pequeños (`0..3`) por `step={discreteOnly ? 1 : 'any'}` (y paso entero por día en modo diario `Vista Satélite`) para eliminar los saltos por cuantización frente a `dt * 0.42 * speed`.
  - En [index.css L71, L91](../src/index.css#L71), retirar `transition: transform 0.12s ease` del *thumb* durante la reproducción/arrastre para evitar retraso o vibración visual entre frames.
  - Mantener anchos estables con `tabular-nums` en el badge de fecha/estado para impedir reajustes de ancho mientras cambia el valor.
- [x] **A2. Desacoplar recálculos pesados innecesarios en reproducción 3D**:
  - En [App.jsx L335-L342](../src/App.jsx#L335-L342), evitar recalcular la malla `128×128` (`computeInterpolatedBuffers`) 60 veces por segundo cuando el modo activo es `Vista Satélite` (`renderMode === 'gibs'`) y la geometría de simulación no está visible.
  - Verificar que tanto el slider móvil compacto como el de escritorio sincronizan `handleManualSeek` de forma determinista sin pelear con `tFloatRef` (no cuantizando a `Math.round` cuando `renderMode === 'gibs'`).

---

## Bloque B — Sincronización del Reloj Dual (`N` Días Reales GIBS vs. 4 Hitos `T₀..T₃`)

- [x] **B1. Estado compartido de fechas diarias GIBS entre `App.jsx`, `TerrainViewer3D.jsx` y `TimelineControl.jsx`**:
  - Elevar `dailyDates = getDatasetDailyDates(dataset, 36)` y `gibsStatuses` (`loaded` / `empty` / `pending`) para que la barra inferior y el visor 3D lean exactamente el mismo calendario.
- [x] **B2. Adaptar `TimelineControl.jsx` según el modo activo**:
  - **En `Vista Satélite` (`renderMode === 'gibs'`)**:
    - Operar el slider sobre los **`N` días reales** (`0 .. dailyDates.length - 1`) en lugar de limitarlo a `T₀..T₃`.
    - Mostrar en el badge la etiqueta honesta **`Foto satelital del día · YYYY-MM-DD`** (esmeralda si hay frame descargado, gris/ámbar si está pendiente o sin captura WMTS; **nunca `"Interpolado"`** sobre imágenes diarias reales).
    - Mostrar hitos reales del rango temporal (`Inicio · Día ... · Mitad · Cierre`) en lugar de etiquetas fijas `T₀..T₃`.
    - Hacer que **`Solo días con captura`** salte exclusivamente entre días que sí devolvieron imagen válida en GIBS WMTS.
  - **En `Simulación` (`hybrid`) y `Variable Cruzada` (`driver`)**:
    - Mantener la escala estructurada **`T₀..T₃`** con el indicador de confianza/interpolación (`Dato observado` vs `Interpolado (%)`) y botones rápidos `Pre-evento` / `Durante el evento` / `Post-evento`.

---

## Bloque C — Limpieza de Textos Heredados y Rigor Científico (`ExaggerationPanel.jsx`)

- [x] **C1. Actualizar KPIs heredados y navegación en `getGuide(dataset)` ([ExaggerationPanel.jsx L149-L214](../src/components/ExaggerationPanel.jsx#L149-L214))**:
  - Sustituir `"4 pasos · Texturas GIBS (T)"` y `"128×128 · Malla estadística · OLS + p-valor local"` en zonas en vivo por métricas reales actuales (`N días Imágenes WMTS`, `Serie diaria regional MERRA-2 / GPM · ~0.5°`, `4 hitos Simulación T₀–T₃`).
  - Unificar el botón `"Volver a casos"` del encabezado del panel con `"Globo"` (coherente con [TerrainViewer3D.jsx](../src/components/TerrainViewer3D.jsx)).
- [x] **C2. Claridad en variables, escalas y veredictos (`Vista clara` y `Datos científicos`)**:
  - Incluir el nombre de la variable evaluada en el badge de veredicto (`"Tendencia · [Variable]"` vs `"Sin tendencia · [Variable]"`) para evitar interpretaciones ambiguas.
  - Mostrar nota explícita aclarando que las series diarias corresponden a la **celda regional (`~0.5°`)**, diferenciándola del relieve local MDE (`~30 m`).
  - En **`Datos científicos`**, priorizar visualmente la serie diaria larga sobre la tarjeta de `Inspección puntual · Vértice` (`4 hitos T₀–T₃`).

---

## Bloque D — Guion Dinámico en `Demo rápida` ([StoryModeTour.jsx](../src/components/StoryModeTour.jsx))

- [x] **D1. Eliminar el fallback de Los Ángeles en zonas en vivo**:
  - Sustituir `STORY_SCRIPTS[dataset?.id] || STORY_SCRIPTS['los-angeles-fires-2025']` por `buildLiveStoryScript(dataset)` con título, relieve (`elev_range_m`), fechas y sensores reales de la zona activa.
- [x] **D2. Modernizar los saltos del recorrido guiado a `setRenderMode` y capas GIBS**:
  - Migrar a `setRenderMode(s.renderMode)` y `setGibsLayerId(s.gibsLayer)` manteniendo los guiones narrativos de los 3 casos demostrativos, y anclar la tarjeta flotante mediante `createPortal(..., document.body)` para que `backdrop-blur-xl` de `<header>` no la recorte.

---

## Bloque E — Verificación End-to-End de Fase 3

- [x] **E1. Verificación del slider (`1600×900` y `390×844`)**: probado `Play` en `Vista Satélite` (`dayBeforePlay: "0"` → `dayAfterPlay: "3"`, `step="1"`, sin temblor) y cambio a `Simulación` (`max="3"`, `step="any"`), más `mobile_3d_timeline` (`scrollW: 390`, `innerW: 390`, `pageErrors: []`).
- [x] **E2. Verificación del reloj unificado en `"Valencia"` (`2024-10-20 → 2024-11-10`)**: confirmado `max="21"` (`22 días`), `Foto satelital del día · 2024-10-20` en `Vista Satélite` (`hasInterpolatedBadgeInGibs: false`) y conmutación a `T₀..T₃` en `Simulación`.
- [x] **E3. Verificación de `ExaggerationPanel` y `Demo rápida` en zona en vivo**: ausentes `"4 pasos"` y `"OLS + p-valor local"`, tarjeta `RECORRIDO GUIADO · 1/4` visible sobre Valencia (`mentionsValencia: true`, `mentionsLAFallback: false` e inspeccionada en captura).
- [x] **E4. Build y control de marca**: `npm run build` (`0` errores) y `grep -rnI "NASA" src/ index.html README.md public/data/*.json` (`0` coincidencias).

