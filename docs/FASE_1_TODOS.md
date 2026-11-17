# TO-DOs de Fase 1 — Integración No Invasiva de Portada, Shell Global y Globo Limpio

> **Principio rector**: En esta fase **NO se modifica la lógica interna de cálculo, renderizado WebGL 3D, capas GIBS ni series climáticas**. Todo se construye como una capa de UI/navegación aditiva sobre los flujos ya probados en [App.jsx](../src/App.jsx) y [OrbitalGlobe.jsx](../src/components/OrbitalGlobe.jsx), revisable punto por punto antes de pasar a código.
>
> **Referencias**: [ARQUITECTURA_UI_UX.md](./ARQUITECTURA_UI_UX.md) · Mockups [01_portada_modo_buscador.jpg](./mockups/01_portada_modo_buscador.jpg) y [03_earth_engine_globo_3d.jpg](./mockups/03_earth_engine_globo_3d.jpg).

---

## 1. Qué se mantiene 100 % intacto (Invariantes)

Para garantizar estabilidad total durante la Fase 1, estos bloques **no se alteran en su comportamiento**:
- **`loadScenario(scenarioId)` y `SCENARIOS`** ([App.jsx L13–53, L138–175](../src/App.jsx#L13-L53)): los 3 casos demostrativos siguen cargando idéntico desde `public/data/*.json`.
- **`analyzeCustomZone(params)` y `analyzeZoneClientSide`** ([App.jsx L177–225](../src/App.jsx#L177-L225), [liveZoneClient.js](../src/utils/liveZoneClient.js)): mismo pipeline CORS de Terrarium DEM, Esri, POWER/ERA5, CAMS y USGS.
- **Escena 3D completa**: `TerrainViewer3D.jsx`, `TimelineControl.jsx`, `ExaggerationPanel.jsx` y `StoryModeTour.jsx` conservan sus props y funcionamiento actual intactos en Fase 1 (sus ajustes visuales quedan para las Fases 0/3).
- **Panel derecho y barra inferior de `OrbitalGlobe.jsx`**: coordenadas, selectores `Desde/Hasta`, slider `Tamaño de caja de análisis`, tarjeta `scaleStatus`, botón `Analizar esta zona en 3D` y `Casos demostrativos`.

---

## 2. Backlog Detallado de Tareas (TO-DOs)

### Bloque A — Estado de Navegación y Continuidad en `src/App.jsx`
- [x] **A1. Añadir estado de navegación superior sin romper `viewMode`**:
  - Incorporar `activeMode`: `'search' | 'earth_engine' | 'agent'` (valor inicial `'search'` para arrancar en la Portada).
  - Mantener `viewMode`: `'globe' | 'terrain'` dentro de `'earth_engine'` para que `TerrainViewer3D` y `handleBackToGlobe` sigan operando exactamente igual.
- [x] **A2. Subir estado compartido de zona y cámara (`draftZone`)**:
  - Guardar `{ query, placeLabel, coords, zoom, pitch, boxKm, startDate, endDate }` en `App.jsx` para no perder la ubicación al navegar entre `Modo Buscador`, `Modo Earth Engine (Globo)` y `Visor 3D`.
  - Conectar `handleBackToGlobe()` para que vuelva a `activeMode = 'earth_engine'` y `viewMode = 'globe'` conservando `draftZone` (corrige la pérdida actual del punto buscado al salir del 3D).
- [x] **A3. Centralizar estado de conexión API (`apiMode`) y preferencias (`settings`)**:
  - Mover la comprobación de `/api/health` (hoy en `OrbitalGlobe.jsx` L88–113) a `App.jsx` (respetando la preferencia `'auto' | 'web' | 'local'` guardada en `localStorage` para evitar peticiones innecesarias en Netlify o en modo Web directo).
  - Persistir idioma (`'es' | 'en'`) y rango temporal por defecto en `localStorage`.

---

### Bloque B — Barra Superior Persistente (`src/components/TopShellBar.jsx`)
- [x] **B1. Segmented Switch centrado (`Modo Buscador` | `Modo Earth Engine` | `Agent Mode`)**:
  - Estética idéntica al mockup [01_portada_modo_buscador.jpg](./mockups/01_portada_modo_buscador.jpg): cápsula translúcida (`bg-zinc-900/75 backdrop-blur-xl border border-white/10 rounded-full p-1`) flotando centrada (`fixed` o dentro del header cuando corresponda, `z-30`).
  - Pestaña 1: **`Modo Buscador`** (icono lupa) → abre Portada / Buscador.
  - Pestaña 2: **`Modo Earth Engine`** (icono orbital) → abre Globo 3D (`OrbitalGlobe`) o mantiene la escena 3D activa si ya estaba abierta.
  - Pestaña 3: **`Agent Mode`** (icono destello) → en Fase 1 muestra una vista *preview* limpia de "En construcción · Fase 4" con botón para volver a Buscador o Earth Engine (sin llamadas LLM aún).
- [x] **B2. Indicador de marca a la izquierda (solo icono del logo)**:
  - En **Portada (`Modo Buscador`)**: esquina superior izquierda vacía/limpia para que todo el protagonismo sea del wordmark central `Ge[Logo]Wave`.
  - En el resto de vistas (**Buscador avanzado, Globo, Visor 3D, Agent Mode**): esquina superior izquierda muestra **únicamente el icono del logo** (sin texto `GeWave` / `GEO-WAVE` al lado), junto al badge discreto `Live Web directo` / `Live API activa` cuando corresponda.
- [x] **B3. Utilidades esquina superior derecha**:
  - **Selector de idioma (`Español ▾` / `English`)**: diccionario base para las cadenas de Portada, Switch y Ajustes.
  - **Botón Ajustes (`⚙`)**: popover con selector de conexión (`Auto` / `Live Web directo` / `API local`), días por defecto (`30d` / `60d` / `90d`) y calidad DPR.
  - **Botón Info / Perfil (`👤`)**: popover con resumen técnico del proyecto (cero menciones a NASA) y atajos de teclado (`⌘K` o `/` para buscar).
- [x] **B4. Integración en el Visor Terreno 3D (`viewMode === 'terrain'`) — Decisión aprobada**:
  - Se **conserva el switch** (`Modo Buscador` | `Modo Earth Engine` | `Agent Mode`) integrado directamente en el `<header>` actual del Visor 3D (junto al icono solo-logo arriba a la izquierda, sin apilar dos barras ni robar altura al lienzo WebGL).

---

### Bloque C — Nueva Portada Hero (`src/components/LandingHero.jsx`)
- [x] **C1. Lienzo y atmósfera visual fiel al mockup**:
  - Fondo oscuro radial `#05070b` → `#0d131d`, centrado vertical y horizontal limpio, cero ruido visual.
- [x] **C2. Wordmark integrado `Ge[Logo]Wave`**:
  - Preparar variante clara/monocroma limpia del icono orbital (derivada del asset existente [geo-wave-logo.png](../public/assets/geo-wave-logo.png)) colocada entre `Ge` y `Wave` en tipografía sans bold blanca, replicando exactamente [01_portada_modo_buscador.jpg](./mockups/01_portada_modo_buscador.jpg).
- [x] **C3. Barra de búsqueda Spotlight (`rounded-full`)**:
  - Input redondeado con icono lupa, placeholder *"Buscar ubicaciones, coordenadas o datos satelitales..."* y atajo de teclado (`/` o `⌘K`).
  - **Puente funcional en Fase 1 (sin esperar a Fase 2)**:
    - Si el usuario escribe coordenadas (`lat, lon`) o una ciudad/región y pulsa `Enter`, reutilizar la llamada a Nominatim (y parser `lat, lon`) existente:
      - Mostrar un desplegable limpio con hasta `5` candidatos (corrigiendo el `limit=1` actual) o mensaje claro si no hay coincidencias.
      - Al elegir un candidato en Fase 1: actualizar `draftZone` y volar directo a **`Modo Earth Engine` (Globo)** centrado en esa ubicación con la caja lista para pulsar `Analizar esta zona en 3D` (en Fase 2 este paso se expandirá al `SearchWorkspace` completo de dos tarjetas).
- [x] **C4. Accesos rápidos a casos demostrativos + estado inferior**:
  - 3 píldoras muy discretas debajo del buscador (`Los Ángeles · Incendio`, `Kamchatka · Sismo`, `Málaga · DANA`) conectadas directamente a `onEnterTerrain(sc.id)` (`loadScenario`).
  - Pie derecho muy sutil en monospace: `Live Web directo · 13 capas WMTS` (o `Live API activa · 13 capas WMTS`).

---

### Bloque D — Limpieza del Globo 3D (`src/components/OrbitalGlobe.jsx`)
- [x] **D1. Eliminar el bloque superior izquierdo de búsqueda y marca**:
  - Retirar la tarjeta flotante izquierda actual ([OrbitalGlobe.jsx L295–336](../src/components/OrbitalGlobe.jsx#L295-L336)) que contiene el logo antiguo del globo, el badge API y el formulario de búsqueda `Nominatim`.
  - Mantener el resultado idéntico al mockup [03_earth_engine_globo_3d.jpg](./mockups/03_earth_engine_globo_3d.jpg): todo el lado izquierdo del globo libre.
- [x] **D2. Sincronizar `OrbitalGlobe` con `draftZone` vía props**:
  - Aceptar `draftZone` / `onUpdateZone` desde `App.jsx`:
    - Si el usuario llega desde la Portada tras buscar `"Valencia"`, el mapa arranca o ejecuta `flyTo([lon, lat], zoom=10.8, pitch=54)` automáticamente.
    - Mostrar `draftZone.placeLabel` en la cabecera del panel derecho encima de las coordenadas (`Valencia · 39.47°, -0.38°`).
    - Resetear `placeLabel` a coordenadas si el usuario arrastra manualmente el globo lejos (`> 25 km`) del punto buscado, evitando nombres desfasados.
- [x] **D3. Ajuste de posición del panel derecho (`top-20 right-4`)** *(verificado visualmente en `1600×900`; pendiente probar manualmente en móvil/viewport estrecho si lo deseas)*:
  - Desplazar el panel derecho ligeramente hacia abajo para dejar espacio limpio a los controles de la esquina superior derecha de `TopShellBar` (`Español ▾`, `⚙`, `👤`).

---

### Bloque E — Verificación y Supervisión antes de Fase 2
- [x] **E1. Validación funcional en build estática (`vite preview`, `1600×900`)**:
  - Portada (`Modo Buscador`) → búsqueda `"Valencia"` (5 resultados) → clic → **Earth Engine (Globo)** centrado en Valencia (`39.4697°, -0.3763°`, `z=10.8`) **sin caja izquierda** → `Analizar esta zona en 3D` → `<header>` con **solo icono** arriba a la izquierda + **switch** centrado → botón `Globo` regresa manteniendo Valencia y sus fechas → `Agent Mode` muestra contexto heredado de Valencia. *(Nota: en la navegación rápida automática no se hicieron clics sobre los 3 chips demo desde Portada ni en viewport móvil).*
- [x] **E2. Verificación técnica y de marca**:
  - Comprobadas `0` menciones a `NASA` en todo `src/` e `index.html`.
  - `npm run build` completado sin errores (`dist/` actualizado).
  - Revisión visual de capturas reales frente a [01_portada_modo_buscador.jpg](./mockups/01_portada_modo_buscador.jpg) y [03_earth_engine_globo_3d.jpg](./mockups/03_earth_engine_globo_3d.jpg).

---

## 3. Decisiones Supervisadas y Aprobadas

1. **Switch persistente en el Visor 3D (`viewMode === 'terrain'`)**: **Aprobado conservarlo** integrado en el `<header>` superior del visor para saltar en cualquier momento entre `Modo Buscador`, `Modo Earth Engine` y `Agent Mode` sin perder altura útil del lienzo 3D.
2. **Flujo desde Portada (`Modo Buscador` → `Modo Earth Engine`)**: **Aprobado**: buscar y elegir una ubicación en la portada lleva al **Modo Earth Engine (Globo 3D)** ya volado y centrado sobre ese destino para ajustar caja/fechas o entrar al terreno 3D.
3. **Uso del Logo y Wordmark (`Ge[Logo]Wave`)**: **Aprobado**: en el centro de la portada se usa el wordmark visual **`Ge[Logo]Wave`**, mientras en la **esquina superior izquierda** de la barra/cabecera se muestra **solo el icono del logo** (sin texto acompañante).

