# Especificaciones Oficiales de Satélites, Sensores y Fuentes de Datos — GEO-WAVE

> **Propósito**: Inventario técnico exhaustivo de **todas** las fuentes externas, constelaciones satelitales y modelos integrados en `GEO-WAVE` (tanto en modo Web directo como en los casos demostrativos), contrastado contra el código fuente actual y el `WMTSCapabilities.xml` en vivo.
>
> **Nota de política de producto**: Este documento técnico registra los identificadores y servicios reales subyacentes con rigor de ingeniería. En la **interfaz visible de la aplicación web** (`src/`, `index.html`), **GEO-WAVE** mantiene política de cero menciones a agencias concretas (mencionando misiones, sensores y productos).

---

## 1. Resumen de Arquitectura de Datos (En Vivo vs. Casos Demostrativos)

| Categoría | Modo Web Directo (`liveZoneClient.js` + `gibsLayers.js`) | Casos Demostrativos (`public/data/*.json` vía `build_datasets.py`) |
| :--- | :--- | :--- |
| **Imágenes diarias (13 capas)** | Peticiones CORS directas en navegador a **GIBS WMTS** (`EPSG:3857`) | Mosaicos/texturas pre-horneadas + soporte completo de las 13 capas GIBS WMTS en vivo |
| **Ortofoto base HD + Relieve 3D** | **ArcGIS World Imagery** + **AWS/Mapzen Terrarium DEM** (`128×128`) | ArcGIS World Imagery HD (`1536 px`) + AWS Terrarium DEM |
| **Series climáticas diarias** | **POWER API** (`MERRA-2` / `CERES`) con respaldo automático **Open-Meteo ERA5** | POWER API (`MERRA-2` / `CERES` / `GPM`) histórica fija por evento |
| **Calidad del aire diaria** | **Open-Meteo Air Quality** (`Copernicus CAMS`: `O₃`, `NO₂`, `PM₂.₅`) | *(Opcional si presente en JSON; disponible en análisis en vivo)* |
| **Actividad sísmica** | **USGS Earthquake Hazards FDSNWS** (`Mw >= 2.5`) | USGS Earthquake Hazards (`Kamchatka Mw 8.8 & Mw 7.8`) |
| **Geocodificación** | **OpenStreetMap Nominatim** (`limit=5`) | Coordenadas fijas pre-configuradas |
| **Capas de evento / Simulación** | Modelo topográfico derivado de series POWER/USGS | **LA**: Perímetro real **NIFC WFIGS** + simulación SAR VH/HV · **Kamchatka**: modelo elástico NISAR InSAR · **Málaga**: cota aluvial `< 23 m` (referencia OPERA DSWx-S1) |

---

## 2. Capas Satelitales Diarias GIBS WMTS (13 Capas en `src/utils/gibsLayers.js`)

Verificadas directamente contra `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml` (consulta ejecutada el `2026-11-17`). En proyección Web Mercator (`EPSG:3857`), las resoluciones de malla WMTS en el Ecuador son:
- **`GoogleMapsCompatible_Level6`**: `~2,445.98 m/píxel`
- **`GoogleMapsCompatible_Level7`**: `~1,222.99 m/píxel`
- **`GoogleMapsCompatible_Level8`**: `~611.50 m/píxel`
- **`GoogleMapsCompatible_Level9`**: `~305.75 m/píxel`

*(Nota técnica: GIBS reproyecta dinámicamente al vuelo hacia `EPSG:3857` desde sus mallas/bandas geográficas nativas, por lo que el `Level` del tile determina el tamaño máximo de píxel servido, mientras que el sensor físico dicta el detalle real).*

### 2.1. Tabla Completa de Especificaciones de las 13 Capas

| ID interno (`gibsLayers.js`) | Identificador WMTS oficial | Satélite / Sensor | Resolución espacial nativa (sensor) | TileMatrixSet (`maxLevel`) & Formato | Cobertura temporal en XML (`start` → `latest_end`) | Latencia típica oficial |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `truecolor` | `MODIS_Terra_CorrectedReflectance_TrueColor` | **Terra** / MODIS (bandas 1-4-3) | **~250 m** (en nadir) | `Level9` (`jpg`) | `2000-02-24` → `2026-11-17` | Mismo día (NRT, ~3–5 h) |
| `truecolor_viirs` | `VIIRS_SNPP_CorrectedReflectance_TrueColor` | **Suomi-NPP** / VIIRS | **~375 m** (bandas I) | `Level9` (`jpg`) | `2015-11-24` → `2026-11-02` *(1)* | NRT (~3–5 h) *(ver nota XML)* |
| `bands721` | `MODIS_Terra_CorrectedReflectance_Bands721` | **Terra** / MODIS (SWIR 7-2-1) | **~250–500 m** (bandas 7/2/1) | `Level9` (`jpg`) | `2000-02-24` → `2026-11-17` | Mismo día (NRT) |
| `ndvi` | `MODIS_Terra_NDVI_8Day` | **Terra** / MODIS (`MOD13Q1`/equivalente) | **~250 m** | `Level9` (`png`) | `2025-02-12` → `2026-11-15` *(2)* | Compuesto cada **8 días** (+1–2 d) |
| `snow` | `MODIS_Terra_NDSI_Snow_Cover` | **Terra** / MODIS (`MOD10A1`) | **~500 m** | `Level8` (`png`) | `2000-02-24` → `2026-11-17` | NRT horas / ciencia 1–2 días |
| `lst` | `MODIS_Terra_Land_Surface_Temp_Day` | **Terra** / MODIS (`MOD11A1`) | **~1 km** | `Level7` (`png`) | `2000-02-24` → `2026-11-17` | NRT horas / ciencia 1–2 días *(huecos = nubes)* |
| `soil` | `SMAP_L4_Analyzed_Root_Zone_Soil_Moisture` | **SMAP** (`SPL4SMGP` asimilado) | **9 × 9 km** (EASE-Grid 2.0) | `Level6` (`png`) | `2015-03-31` → `2026-11-14` | **~2,5 días** |
| `aod` | `MODIS_Terra_AOD_Deep_Blue_Combined` | **Terra** / MODIS (`MOD04_L2`) | **~10 km** (en nadir) | `Level6` (`png`) | `2000-02-24` → `2026-11-17` | NRT `< 3 h` / ciencia 1–2 días |
| `precip` | `IMERG_Precipitation_Rate` | **Constelación GPM** (IMERG) | **0,1° × 0,1° (~11 km Ecuador)** | `Level6` (`png`) | `2000-06-01` → `2026-11-16` | Early ~4 h · Late ~12–14 h · Final ~3,5 meses |
| `co2` | `OCO-2_Carbon_Dioxide_Total_Column_Average` | **OCO-2** | **~1,29 × 2,25 km** (huella en **franjas estrechas** aisladas) | `Level8` (`png`) | `2014-09-06` → `2026-07-28` *(3)* | Semanas a meses (calibración L2/L3) |
| `no2` | `OMI_Nitrogen_Dioxide_Tropo_Column` | **Aura** / OMI | **~13 × 24 km** (en nadir) | `Level6` (`png`) | `2004-10-01` → `2026-11-09` | NRT horas / estándar 1–2 días (~8 d en capa `best` XML) |
| `o3` | `OMI_Ozone_DOAS_Total_Column` | **Aura** / OMI | **~13 × 24 km** (regrid `0,25°–1°`) | `Level6` (`png`) | `2004-10-01` → `2026-11-09` | NRT `< 3 h` / estándar 1–3 días (~8 d en capa `best` XML) |
| `co` | `AIRS_L3_Carbon_Monoxide_500hPa_Volume_Mixing_Ratio_Daily_Day` | **Aqua** / AIRS (`L3`) | **1° × 1° (~111 km)** *(L2 ~45–50 km)* | `Level6` (`png`) | `2002-09-01` → `2026-11-09` | Varios días a ~1 semana (`~8 d` en XML) |

**Hallazgos críticos verificados en el XML oficial**:
1. **`VIIRS_SNPP_CorrectedReflectance_TrueColor`**: en el `WMTSCapabilities.xml` del `2026-11-17` su intervalo termina en `2026-11-02`, por lo que consultas de los últimos días devolverán tiles vacíos en VIIRS.
2. **`MODIS_Terra_NDVI_8Day`**: el identificador WMTS actual comienza el `2025-02-12`, por lo que casos históricos previos (Málaga Nov 2024 o Los Ángeles Ene 2025) no tienen datos bajo esta capa.
3. **`OCO-2_Carbon_Dioxide_Total_Column_Average`**: además de medir en franjas orbitales muy estrechas (sin cobertura continua diaria global), tiene un desfase de ~3,5 meses (`latest_end = 2026-07-28`), por lo que en ventanas recientes ("últimos 60 días") dará `0` días con datos.

---

## 3. Series Climáticas, Calidad del Aire, Sismos, Relieve y Base

| Fuente / Servicio | Endpoint / Proveedor usado en código | Variables / Productos en GEO-WAVE | Resolución espacial nativa | Cadencia y cobertura temporal | Latencia / Límites operativos |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **POWER API** (`MERRA-2` & `CERES`) | `power.larc.nasa.gov/api/temporal/daily/point` | `T2M`, `PRECTOTCORR`, `GWETTOP`, `RH2M`, `QV2M` (`MERRA-2`) + `ALLSKY_SFC_SW_DWN` (`CERES`) | **MERRA-2**: `0,5° × 0,625°` (~50×55 km)<br>**CERES**: `1,0° × 1,0°` (~100×100 km) | Diaria (`1981` → casi tiempo real) | **2–3 días** (MERRA-2); **1 a varias semanas** (CERES). Representa **un único punto de rejilla**, no variaciones metro a metro. |
| **Open-Meteo Historical (ERA5)** | `archive-api.open-meteo.com/v1/archive` *(respaldo automático en `liveZoneClient.js`)* | Temperatura 2m, precipitación, humedad relativa, humedad suelo `0–7 cm` | `0,25°` (~25 km ERA5) / `0,1°` (~11 km ERA5-Land) | Diaria (`1940` → ~5 días antes de hoy) | ~2–5 días de consolidación ERA5; CORS abierto sin clave. |
| **Open-Meteo Air Quality (CAMS)** | `air-quality-api.open-meteo.com/v1/air-quality` | `ozone` (`O₃`), `nitrogen_dioxide` (`NO₂`), `pm2_5` (`PM₂.₅`) promediados por día | **Europa**: `0,1°` (~11 km)<br>**Global**: `0,4°` (~45 km) | Horaria (Europa) / 3-horaria (Global); archivo reciente | Actualización cada 12 h; en zonas fuera de Europa usa malla global ~45 km. |
| **USGS FDSNWS Earthquakes** | `earthquake.usgs.gov/fdsnws/event/1/query` | Catálogo sísmico `ComCat` filtrado (`minmagnitude=2.5`, `bbox` expandido `±0.8°`) | Puntual (epicentro/hipocentro instrumental) | Tiempo real continuo (`geojson`) | Minutos tras evento; límite aplicado en app `500` eventos por consulta. |
| **AWS / Mapzen Terrarium DEM** | `s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png` | Elevación en metros codificada RGB: `(R×256 + G + B/256) - 32768` | **EE.UU./zonas UE**: `3–10 m`<br>**Global (SRTM)**: `~30 m`<br>**Polos/remoto**: `225 m–1 km` | Estático (MDE compuesto) | `z` máx `15`; `liveZoneClient.js` usa `z ∈ [9, 13]` con máx `16` tiles muestreados en `128×128`. |
| **Esri World Imagery** | `server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}` | Ortofoto satélite/aérea RGB base y Globo 3D (`MapLibre`) | **Global base**: `15 m` (TerraColor)<br>**Regional/Urbano**: `0,15–0,6 m` HD (Maxar/Vantor/aéreo) | Mosaico compuesto multi-fecha (no es diario) | Puede mostrar costuras entre fechas distintas en zoom alto (`z > 10`); `liveZoneClient.js` usa `z ∈ [10, 15]`. |
| **OpenStreetMap Nominatim** | `nominatim.openstreetmap.org/search` | Geocodificación directa (`lat, lon, display_name`) | Topónimo / polígono ODbL | Continuo | **Política estricta**: máx **1 req/s**, obligatorio caché local y **atribución visible OpenStreetMap (ODbL)**. |

### Fuentes adicionales de Casos Demostrativos (`build_datasets.py` / `public/data/*.json`)
- **NIFC WFIGS Interagency Fire Perimeters** (`services3.arcgis.com/...`, usado en `la_fires.json`): polígonos oficiales de perímetros de incendio en EE. UU. refrescados cada ~5 minutos (`23.448 acres` reales de Pacific Palisades).
- **Referencias radar / agua de contexto**:
  - **OPERA DSWx-S1** (citado en `malaga_flood.json`): producto de extensión superficial de agua basado en **Sentinel-1 Banda C (5,6 cm)** a **30 m** sobre malla MGRS.
  - **NISAR** (citado en `earthquake.json` y paneles): misión radar **Banda L (24 cm)** con ancho de barrido `~242 km` y resolución `~3–10 m`. *(Nota importante de transparencia: en los JSON actuales de demo, la capa visual `Simulación` combina elevación/perímetros reales con modelos físicos estimados/simulados, no productos raster directos descargados de NISAR/ASF).*

---

## 4. Análisis Crítico de Idoneidad para el Perímetro Vigente (`20–60 km`, defecto `36 km`)

El tamaño de caja (`36 × 36 km`, rango `20–60 km`) fue calibrado pensando en el relieve 3D y las texturas ópticas, lo cual **se justifica plenamente** al cruzarlo con las specs oficiales:

| Escala del dato | Capas / Fuentes | Píxeles reales dentro de `36 × 36 km` | Píxeles reales dentro de `60 × 60 km` | Diagnóstico para `GEO-WAVE` |
| :--- | :--- | :---: | :---: | :--- |
| **Sub-kilométrica / Alta resolución** | `Terrarium MDE` (`3–30 m`), `Esri Imagery` (`0,3–15 m`), `MODIS TrueColor` (`250 m`), `MODIS NDVI` (`250 m`), `VIIRS` (`375 m`), `MODIS 7-2-1` / `NDSI` (`500 m`) | **`72 × 72` a `144 × 144 px`** satelitales + MDE `128×128` | **`120 × 120` a `240 × 240 px`** satelitales | **Idónea**: máximo equilibrio entre detalle orográfico (`zDem 11–13`) y nubes/cicatrices diarias reales. |
| **Kilométrica intermedia** | `MODIS LST` (`1 km`), franjas `OCO-2` (`~1,3 × 2,3 km`) | **`36 × 36 px`** (`LST`) | **`60 × 60 px`** (`LST`) | **Buena**: suficiente para gradientes térmicos tierra/mar y valles. |
| **Mesoescala gruesa (~10 km)** | `SMAP L4` (`9 km`), `MODIS AOD` (`10 km`), `GPM IMERG` (`~11 km`), `ERA5-Land` / `CAMS EU` (`~11 km`) | **`3 × 3` a `4 × 4` px reales** | **`5 × 5` a `6 × 6` px reales** | **Válida con aviso**: suficiente para distinguir paso de tormenta o pluma, pero se verá en bloques grandes. |
| **Sinóptica / Celda regional (25–110 km)** | `OMI NO₂` (`13×24 km`), `OMI O₃` (`~25 km`), `ERA5` (`~25 km`), `CAMS Global` (`~45 km`), `MERRA-2` (`~55 km`), `AIRS CO` / `CERES` (`~110 km`) | **`1 a 2` celdas** cubren toda la caja | **`1 a 4` celdas** cubren toda la caja | **Solo contexto regional**: en la UI debe mostrarse aviso claro de resolución sinóptica (la caja entera cae prácticamente en 1 píxel del satélite/modelo). |

### Implicaciones directas para implementar la Fase 2
1. **Validación inteligente de fechas en `SearchWorkspace`**:
   - Si el usuario escoge los **últimos 1–10 días**, advertir que capas como `OMI NO₂/O₃`, `AIRS CO`, `VIIRS`, `SMAP` y `OCO-2` tienen **latencia oficial de publicación** (de `2,5 días` en SMAP hasta `~8 días` en OMI/AIRS y varios meses en OCO-2).
2. **Atribución y límite de tasa en Nominatim**:
   - En `src/utils/searchEngine.js`, aplicar **debounce `>= 300 ms`** + cola/throttle para no superar `1 req/s`, caché de consultas y añadir atribución visible `© OpenStreetMap` en el pie de resultados de `SearchWorkspace.jsx`.
3. **Avisos honestos de resolución en tarjeta `Preparar zona`**:
   - Sin ampliar la caja más allá de `60 km`, mostrar una etiqueta clara cuando se seleccione una capa de escala gruesa (`SMAP`, `IMERG`, `AOD`, `NO₂`, `O₃`, `CO`) para que el usuario sepa antes de entrar al 3D cuántos píxeles nativos abarcará su ventana.

---

## 5. Documentación Oficial de Referencia
- **GIBS WMTS & Capas**: `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/1.0.0/WMTSCapabilities.xml` · Docs GIBS (`nasa-gibs.github.io/gibs-api-docs`)
- **POWER API (`MERRA-2` / `CERES`)**: `https://power.larc.nasa.gov/docs/`
- **Open-Meteo (`ERA5` Archive & `CAMS` Air Quality)**: `https://open-meteo.com/en/docs/historical-weather-api` · `https://open-meteo.com/en/docs/air-quality-api`
- **USGS Earthquake Catalog FDSNWS**: `https://earthquake.usgs.gov/fdsnws/event/1/`
- **Terrarium Elevation Tiles (AWS Open Data)**: `https://registry.opendata.aws/terrain-tiles/`
- **Esri World Imagery**: `https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9`
- **OpenStreetMap Nominatim Usage Policy**: `https://operations.osmfoundation.org/policies/nominatim/`
- **OPERA DSWx-S1 / NISAR / NIFC WFIGS**: `https://www.jpl.nasa.gov/go/opera` · `https://nisar.jpl.nasa.gov/` · NIFC WFIGS Open Data (ArcGIS Online)

