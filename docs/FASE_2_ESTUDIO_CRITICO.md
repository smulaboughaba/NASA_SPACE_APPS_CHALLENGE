# Estudio Crítico de Fase 2 — Apartado de Búsqueda y Continuidad UI/Datos

> **Objetivo**: Auditar con rigor técnico y de producto qué parte de la **Fase 2** ya existe tras la Fase 1, qué falta por construir, **por qué** cada elemento está diseñado así y qué **confusiones o bugs ocultos** debemos resolver antes de escribir código.
>
> **Referencia visual**: [02_apartado_busqueda.jpg](./mockups/02_apartado_busqueda.jpg) · [ARQUITECTURA_UI_UX.md (§4 y §7)](./ARQUITECTURA_UI_UX.md).

---

## 1. Diagnóstico Real: Qué está hecho vs. Qué NO está hecho

| Bloque de Fase 2 | Estado actual | Qué existe hoy en código | Qué falta o falla |
| :--- | :---: | :--- | :--- |
| **Parser de coordenadas (`lat, lon`)** | Parcial (60 %) | [LandingHero.jsx L5–15](../src/components/LandingHero.jsx#L5-L15) parsea `39.47, -0.38` | No interpreta formatos tipo `34.07N 118.58W` o DMS; vive acoplado dentro de `LandingHero` en vez de en `src/utils/searchEngine.js`. |
| **Geocodificación múltiple (`limit=5`)** | Parcial (65 %) | [LandingHero.jsx L67–98](../src/components/LandingHero.jsx#L67-L98) consulta Nominatim con `limit=5` y maneja estados `empty`/`error` | Solo se dispara al pulsar `Enter` (no hay búsqueda en vivo con *debounce* `280 ms` ni caché local), ni historial de búsquedas recientes. |
| **Búsqueda de capas GIBS, variables y casos demo** | **No hecho (0 %)** | Solo existen los 3 chips fijos abajo en Portada (`Los Ángeles`, `Kamchatka`, `Málaga`) | Escribir `"lluvia"`, `"CO2"`, `"NDVI"`, `"NO2"` o `"DANA"` en el buscador manda eso a Nominatim como si fuese el nombre de una ciudad. |
| **Apartado de 2 tarjetas (`Resultados` + `Preparar zona`)** | **No hecho (0 %)** | Hoy es solo un desplegable simple bajo el input en `LandingHero` | No existe `SearchWorkspace.jsx` ni la tarjeta lateral **Preparar zona de estudio** con fechas, caja, enfoque y 3 acciones de salida. |
| **Botón directo `Analizar directo en 3D`** | **No hecho (0 %)** | Hoy elegir una ciudad siempre pasa primero por el Globo (`handleSelectSearchLocation`) | Faltaría calcular `bbox` y llamar a `analyzeCustomZone` sin obligar a pasar por el Globo si el usuario ya confirmó destino y fechas. |
| **Persistencia de zona y cámara** | Hecho (90 %) | `draftZone` en [App.jsx](../src/App.jsx#L109-L120) + sincronización en `OrbitalGlobe.jsx` | Falta incluir `topic`, `preferredGibsLayer` y `searchHistory` dentro del estado compartido. |
| **Rango de caja ampliado (`20–200 km`)** | **Aplazado** | El slider de [OrbitalGlobe.jsx L315](../src/components/OrbitalGlobe.jsx#L315) sigue en `20–60 km` (`36 km` defecto) | **Decisión del equipo**: mantener `20–60 km` en Fase 2 por calibración con las specs de satélites actuales; se revisará tras auditar las especificaciones oficiales. |
| **Selector de enfoque (`Hidrología / Térmico / Sísmico`)** | **No hecho (0 %)** | [OrbitalGlobe.jsx L55](../src/components/OrbitalGlobe.jsx#L55) mantiene `topic` fijo en `'hydrology'` | Cualquier lugar analizado en vivo sigue entrando al 3D etiquetado como balance hídrico. |

---

## 2. Hallazgos Críticos, Bugs Ocultos y Confusiones a Corregir

### Bug Crítico Detectado #1 — Las fechas elegidas por el usuario se ignoran en modo Web Directo
- **Dónde ocurre**:
  - [OrbitalGlobe.jsx L223–229](../src/components/OrbitalGlobe.jsx#L223-L229) envía `{ bbox, topic, label, startDate, endDate }` (en **camelCase**).
  - [liveZoneClient.js L414–420](../src/utils/liveZoneClient.js#L414-L420) desestructura `{ bbox, start_date, end_date }` (en **snake_case**).
- **Consecuencia real**: cuando `App.jsx` llama a `analyzeZoneClientSide(params)` sin backend Python, `start_date` y `end_date` llegan como `undefined`, `new Date("undefinedT00:00:00Z")` da `Invalid Date`, y la función cae silenciosamente al fallback `Date.now() - 60 días → Date.now() - 2 días`. **Cualquier fecha que selecciones en la UI es ignorada hoy en producción estática (Netlify).**
- **Por qué es bloqueante para Fase 2**: si vamos a construir toda una tarjeta *"Preparar zona de estudio"* con selectores `Desde / Hasta` antes de entrar al 3D, este desajuste debe corregirse lo primero (`start_date || startDate`, `end_date || endDate`).

### Confusión #2 — Qué hace realmente el selector `Hidrología | Térmico | Sísmico`
- **El problema**: en el mockup de Fase 2 ([02_apartado_busqueda.jpg](./mockups/02_apartado_busqueda.jpg)) aparecen 3 píldoras (`Hidrología`, `Térmico`, `Sísmico`). Hoy `topic` **no cambia** qué capas reales ves en `Vista Satélite` (siempre tienes las 13 capas GIBS), sino **exclusivamente**:
  1. Qué modelo físico sintético se dibuja en `Simulación` y `Variable Cruzada`.
  2. Qué variable sale marcada por defecto en `ExaggerationPanel` (`PRECTOTCORR` vs `T2M` vs `USGS_MAX_MW`).
- **Riesgo UX**: si el usuario pulsa `Térmico` pensando que solo así verá incendios/temperatura en el satélite, o si pulsa `Hidrología` esperando lluvia real en `Simulación` y la zona está seca (`0.0%`), no entiende qué hizo esa píldora.
- **Solución exigida en Fase 2**:
  - Etiquetar ese selector con honestidad: **"Enfoque inicial / Simulación física"**.
  - Y vincular cada enfoque a una **capa satelital inicial sugerida** en `Vista Satélite` (`Hidrología` → `Lluvia` / `Color real`, `Térmico` → `Falso color 7-2-1` o `Temp. suelo`, `Sísmico` → `Color real`), pasando `preferredGibsLayer` a `App.jsx` (`setGibsLayerId`).

### Confusión #3 — Fricción entre "Portada limpia" y "Apartado de Búsqueda completo"
- **El problema**: en Fase 1, buscar `"Valencia"` en la portada muestra un desplegable ligero justo debajo del input y al hacer clic vuela al Globo 3D en 2 clics. Si en Fase 2 convertimos eso obligatoriamente en un panel complejo con dos tarjetas grandes (`Resultados` + `Preparar zona`), podemos **empeorar la velocidad percibida** para quien solo quiere "ir a Valencia".
- **Decisión de diseño necesaria**:
  - **1 clic / doble camino claro**:
    - En la lista de resultados (`Resultados`), mantener visible un acceso directo rápido o que al seleccionar un resultado aparezca la tarjeta derecha **"Preparar zona de estudio"** ya rellena con valores sensatos (`últimos 60d`, `36 km`), permitiendo pulsar **`Analizar directo en 3D`** con **un único clic adicional** (sin obligar a rellenar nada).
  - Además, permitir **limpiar la búsqueda y volver al Hero puro (`Ge[Logo]Wave`)** al borrar el input, para no perder nunca la elegancia minimalista de la portada.

### Confusión #4 — Buscar por variable (`"CO2"`, `"lluvia"`) sin elegir todavía lugar
- **El problema**: el placeholder dice *"Buscar ubicaciones, coordenadas o datos satelitales..."*. Si el usuario escribe `"NO2"` o `"lluvia"`, **no existe un lugar geográfico asociado aún**: no podemos inventar unas coordenadas para lanzar el 3D.
- **Cómo resolverlo con lógica sólida**:
  - Si la consulta coincide con una **capa WMTS** (`GIBS_LAYERS`) o **variable diaria** (`VARIABLE_DEFINITIONS`), mostrarla en una subsección clara **"Capas y variables satelitales"** de la tarjeta izquierda con su resolución nativa (`~10 km`, `~250 m`, etc.).
  - Al hacer clic en esa capa: queda fijada como **`Capa preseleccionada`** (p. ej. un chip `[Capa activa: Dióxido de nitrógeno NO₂ · caja recomendada ≥ 120 km]`) y el foco vuelve automáticamente al buscador pidiendo elegir ubicación (o usar la última zona en `draftZone` / abrir el Globo con esa capa preseleccionada).

### Confusión #5 — Escala de la caja (`20–60 km`) frente a capas atmosféricas (Decisión cerrada)
- **Contexto técnico**: [liveZoneClient.js L75–86, L427–428](../src/utils/liveZoneClient.js#L75-L86) usa `chooseOptimalZoom(bbox, minZ, maxZ, maxTiles = 16)`. Ampliar la caja a `200 km` degradaría la resolución del MDE Terrarium y Esri.
- **Decisión aprobada**: **no ampliar el perímetro en Fase 2** (se conserva `20–60 km`, defecto `36 km`). En su lugar, la **Fase 2 incluye una tarea de auditoría de fuentes y specs oficiales** para contrastar qué tamaño óptimo exige cada satélite/misión y documentarlo antes de tocar los límites espaciales.
  - Cuando en la tarjeta se elija una capa gruesa (`~10–100 km/px`: `NO₂`, `IMERG`, `AOD`, `CO`, `SMAP`), la UI mostrará un aviso informativo transparente sobre su resolución nativa real.

### Confusión #6 — El botón `Investigar con Agent Mode` antes de Fase 4
- **El problema**: en el mockup aparece un tercer botón `Investigar con Agent Mode`. Pero hoy el `Agent Mode` es solo una pantalla informativa (`AgentModePreview`) que dice *"Próxima fase · Fase 4"*.
- **Criterio exigente**: en Fase 2 **no debemos prometer una acción rota**. Ese botón debe mostrarse marcado discretamente como `Agent Mode (Próximamente)` o deshabilitado con tooltip claro hasta que la Fase 4 implemente el chat real (o bien omitirse de los CTA principales de la tarjeta hasta Fase 4 para no frustrar al usuario).

### Confusión #7 — Validación de fechas y latencia satelital real
- Hoy los `<input type="date">` permiten elegir `Desde > Hasta`, rangos de `1 día` o `5 años`, y fechas futuras.
- En Fase 2 `SearchWorkspace` debe imponer validación explícita en UI:
  - `endDate <= hoy`, `startDate < endDate`.
  - Rango mínimo `7 días` y máximo `180 días` (coherente con el muestreo de hasta 36 frames WMTS y límites de POWER/ERA5/CAMS).
  - Aviso discreto si `endDate` está a `< 5 días` de hoy: *"Algunas capas diarias (NDVI, SMAP, IMERG) pueden tardar varios días en publicarse."*

---

## 3. Conclusión de Avance (Estado Real del Proyecto)

1. **Portada + Shell + Fondo estelar (Fase 1)**: **Listo y verificado**.
2. **Puente Buscador → Datos Reales (Pre-Fase 2)**: **Tiene un bug real bloqueante** (`startDate`/`endDate` ignorados en `liveZoneClient.js`) que conviene corregir antes o al arrancar Fase 2.
3. **Motor 3D actual (Fase 0 / Fase 3)**: Sigue pendiente de sus correcciones visuales P0/P1 ya documentadas (solapamiento píldoras vs ficha en `TerrainViewer3D.jsx`, pan-sharpening rugoso, sincronía de 36 días en `TimelineControl.jsx` y `README.md`).
4. **Orden más inteligente recomendado**:
   - **Paso A (Previo/Inicio Fase 2)**: Corregir el mapeo `start_date / end_date` en `liveZoneClient.js` (y opcionalmente en `App.jsx` pasar `preferredGibsLayer`).
   - **Paso B (Fase 2 real)**: Extraer `src/utils/searchEngine.js`, construir `SearchWorkspace.jsx` (2 tarjetas limpias + búsqueda en capas/variables + pre-configurador con validaciones) integrado sin romper el flujo rápido desde `LandingHero` ni `OrbitalGlobe`.

