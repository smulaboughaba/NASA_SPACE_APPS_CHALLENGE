# TO-DOs de Fase 2 — Apartado de Búsqueda, Fixes de Datos y Auditoría Oficial de Satélites

> **Alcance acordado**: Mantener el tamaño de caja en **`20–60 km` (`36 km` defecto)** calibrado con el MDE/satélites actuales (sin ampliar el perímetro en esta fase), incorporar la **auditoría oficial de todas las fuentes y satélites usados** y construir el **Apartado de Búsqueda (`SearchWorkspace`)** fiel a [02_apartado_busqueda.jpg](./mockups/02_apartado_busqueda.jpg).
>
> **Referencias**: [FASE_2_ESTUDIO_CRITICO.md](./FASE_2_ESTUDIO_CRITICO.md) · [ARQUITECTURA_UI_UX.md (§4)](./ARQUITECTURA_UI_UX.md#4-módulo-2--apartado-de-búsqueda-search-workspace).

---

## Bloque 0 — Auditoría Completa de Fuentes, Satélites y Specs Oficiales *(Completado)*

- [x] **0.1. Inventario total verificado contra código fuente**:
  Mapeadas todas las fuentes externas conectadas en `src/` (`gibsLayers.js`, `liveZoneClient.js`, `OrbitalGlobe.jsx`, `LandingHero.jsx`), scripts (`build_datasets.py`, `live_api.py`) y los 3 JSON de casos demostrativos (`public/data/*.json`).
- [x] **0.2. Ficha técnica de especificaciones oficiales y verificación contra XML vivo** → creado [ESPECIFICACIONES_SATELITES_Y_FUENTES.md](./ESPECIFICACIONES_SATELITES_Y_FUENTES.md):
  - Contrastadas las **13 capas GIBS** directamente frente a `WMTSCapabilities.xml` (con `TileMatrixSet`, resolución real del sensor, formato y `latest_end` exacto observados el `2026-11-17`).
  - Documentadas las specs de `POWER API (MERRA-2 / CERES)`, `Open-Meteo (ERA5 / Copernicus CAMS)`, `USGS FDSNWS`, `AWS/Mapzen Terrarium`, `Esri World Imagery`, `OpenStreetMap Nominatim` (política 1 req/s + atribución), `NIFC WFIGS`, `OPERA DSWx-S1` y `NISAR`.
  - Incluida tabla de idoneidad para el perímetro vigente (`20–60 km`, defecto `36 km`).

---

## Bloque A — Correcciones Previas Bloqueantes en Datos y Contrato (`liveZoneClient.js`, `App.jsx`)

- [x] **A1. Corregir bug de fechas ignoradas en modo Web Directo**:
  - En [liveZoneClient.js L414](../src/utils/liveZoneClient.js#L414), aceptar tanto `start_date / end_date` como `startDate / endDate` para que el rango seleccionado en Globo o Búsqueda **no** caiga silenciosamente al fallback de 60 días.
- [x] **A2. Propagar `preferredGibsLayer` y `topic` desde `App.jsx`**:
  - Añadir `topic: 'hydrology' | 'thermal' | 'seismic'` y `preferredGibsLayer` al estado `draftZone` en [App.jsx](../src/App.jsx#L109-L120).
  - Cuando `analyzeCustomZone(params)` termina y entra al Visor 3D, aplicar `setGibsLayerId(params.preferredGibsLayer || 'truecolor')` en lugar de resetear siempre a `'truecolor'` si el usuario buscó otra capa.
- [x] **A3. Enlace limpio de `OrbitalGlobe` con `topic` elegido**:
  - Quitar el `useState('hydrology')` fijo de [OrbitalGlobe.jsx L55](../src/components/OrbitalGlobe.jsx#L55) para leer/actualizar `draftZone.topic` (sin añadir cajas nuevas en la esquina izquierda del globo).

---

## Bloque B — Motor de Búsqueda Multi-Dominio (`src/utils/searchEngine.js`)

- [x] **B1. Extraer parser avanzado de coordenadas**:
  - Soportar decimal (`39.47, -0.38`), cardinal simple (`34.07N 118.58W`) y validar rangos (`lat ∈ [-85, 85]`, `lon ∈ [-180, 180]`).
- [x] **B2. Geocodificador con caché en sesión, *debounce* (`280 ms`) y manejo explícito de errores**:
  - Consultar Nominatim `limit=5` respetando `lang`, evitando llamadas repetidas con `Map` en memoria/sesión y distinguiendo estado `empty` vs `rate_limit / error`.
- [x] **B3. Índice local instantáneo sobre capas GIBS, variables climáticas y casos demostrativos**:
  - Filtrar por palabras clave en español e inglés sobre las 13 capas de [gibsLayers.js](../src/utils/gibsLayers.js), las variables de `VARIABLE_DEFINITIONS` y los 3 casos de `SCENARIOS` (`"lluvia"`, `"co2"`, `"incendio"`, `"terremoto"`, `"ndvi"`, `"no2"`, `"humedad"`...).
- [x] **B4. Historial reciente de búsquedas (`sessionStorage`)**:
  - Guardar hasta 5 zonas recientes seleccionadas para reutilizarlas en un clic desde Búsqueda.

---

## Bloque C — Interfaz del Apartado de Búsqueda (`src/components/SearchWorkspace.jsx`)

- [x] **C1. Transición suave entre Portada Hero (`Ge[Logo]Wave`) y Vista de Resultados**:
  - En `activeMode === 'search'`:
    - Input vacío → muestra el Hero minimalista exacto actual (`LandingHero`) sobre el cielo estrellado interactivo.
    - Al escribir o enviar consulta → despliega limpiamente debajo la estructura de 2 tarjetas fiel a [02_apartado_busqueda.jpg](./mockups/02_apartado_busqueda.jpg) (con botón claro para limpiar y volver al Hero puro).
- [x] **C2. Tarjeta izquierda — `Resultados`**:
  - Lista seleccionable de ubicaciones/coordenadas (borde cian en elemento seleccionado) + subsección compacta de **Capas satelitales / Casos coincidentes**.
  - Si el usuario elige primero una capa satelital (p. ej. `NO₂`) sin ubicación todavía, fijar chip **`Capa preseleccionada`** y pedir destino (o ofrecer usar la ubicación ya guardada en `draftZone`).
- [x] **C3. Tarjeta derecha — `Preparar zona de estudio`** *(simplificada según Opción 1 aprobada por el usuario)*:
  - Pre-rellena automáticamente al seleccionar un lugar (`Desde`, `Hasta`, `Caja: 20–60 km`, manteniendo mínimos los controles previos igual que `OrbitalGlobe.jsx` hasta la futura ingesta volumétrica real en backend).
  - **Validación real de fechas**: `endDate <= hoy`, `startDate < endDate`, rango mínimo 7 días / máximo 180 días, y aviso honesto de latencia si `endDate` está a `< 5 días` de hoy.
  - **Escala y capas**: mantiene el slider en `20–60 km` (`36 km` defecto) y muestra aviso de resolución nativa (`~10–100 km/px`) cuando el usuario selecciona una capa desde resultados (`Capa preseleccionada`), evitando selector de `Enfoque / Simulación` o desplegable de capa redundantes.
  - **Botones de acción**:
    1. **`Analizar directo en 3D`** *(CTA primario cian)* → calcula `bbox` y lanza `analyzeCustomZone` directo al Visor 3D.
    2. **`Encuadrar en Earth Engine`** *(secundario)* → actualiza `draftZone` y abre el Globo 3D volado a esa ubicación.
    3. **`Agent Mode (Próximamente · Fase 4)`** → botón secundario discretamente etiquetado como *Próximamente* (sin prometer acción inexistente hasta Fase 4).

---

## Bloque D — Integración en `src/App.jsx` y `src/components/OrbitalGlobe.jsx`

- [x] **D1. Conectar `SearchWorkspace` dentro de la capa `activeMode === 'search'` de `App.jsx`** manteniendo intacto `InteractiveStarfieldBg` y la transición fluida `300 ms`.
- [x] **D2. Calcular `bbox` desde utilidad compartida** (`buildRegionalBbox` extraída de `OrbitalGlobe.jsx` a una utilidad común para usar exactamente la misma geometría tanto desde Búsqueda directa como desde el Globo).
- [x] **D3. Soporte bilingüe (`es` / `en`) en [i18n.js](../src/utils/i18n.js)** para todas las etiquetas nuevas de `SearchWorkspace`.

---

## Bloque E — Verificación End-to-End de Fase 2

- [x] **E1. Verificar el fix de fechas en `liveZoneClient.js`**: analizar `"Valencia"` eligiendo un rango histórico pasado concreto (`2024-10-20 → 2024-11-10`) y comprobar que la escena 3D y las series diarias devuelven exactamente `2024-10-20 → 2024-11-10` (y no los últimos 60 días).
- [x] **E2. Flujo completo en navegador headless (`vite preview`, `1600×900` y `1280×720`)**:
  - Buscar `"Valencia"` → ver 5 resultados Nominatim + tarjetas `Resultados` / `Preparar zona de estudio`.
  - Buscar `"lluvia"` → fijar chip `Precipitación IMERG (GPM)` → buscar `"Valencia"` → comprobar validación (`Desde > Hasta` deshabilita botón y muestra error) → corregir fechas (`2024-10-20 → 2024-11-10`) → pulsar `Analizar directo en 3D` → abrir el 3D ya con la capa `Lluvia` seleccionada y regreso a Globo conservando fechas (`["2024-10-20","2024-11-10","2024-10-20","2024-11-10"]`). *(Nota: el botón `Encuadrar en Earth Engine` comparte `handleSelectSearchLocation`, no se pulsó explícitamente en este script final aunque sí en la auditoría de Fase 1; en viewport `1280×720` el final de la tarjeta derecha queda bajo scroll vertical `overflow-y-auto`.)*
- [x] **E3. Build y marca**: `npm run build` (`0` errores) y `grep -rnI "NASA" src/ index.html` (`0` coincidencias).

