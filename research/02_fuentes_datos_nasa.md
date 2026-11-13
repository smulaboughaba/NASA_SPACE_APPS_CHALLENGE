# Fuentes de Datos Oficiales NASA y Open Data Complementario

> **Código:** `RES-02`  
> **Fase:** Fase 1 — Investigación, Reto y Datos NASA  
> **Estado:** En preparación (Base completada)  

---

## 1. Fuentes Primarias Oficiales NASA (SAR / NISAR)

| ID | Dataset / Plataforma | Qué aporta al proyecto | Formato / Acceso | Estado |
| :--- | :--- | :--- | :--- | :--- |
| `NASA-01` | **NASA ASF DAAC (*Alaska Satellite Facility*)** | Archivo oficial NASA de datos SAR: **ALOS PALSAR** (Banda L, equivalente en longitud de onda a NISAR), **UAVSAR** (aerotransportado Banda L + campañas de simulación NISAR) y **Sentinel-1** (Banda C para series históricas recientes como la DANA). | GeoTIFF / HDF5 / NetCDF · Portal Vertex (`search.asf.alaska.edu`) y librería Python `asf_search` | Pendiente de prueba |
| `NASA-02` | **Proyecto NASA JPL `OPERA`** *(vía ASF DAAC / Earthdata)* | Productos **Level-3 listos para análisis** (evitan procesar radar crudo desde cero):<br>• `OPERA DSWx`: extensión dinámica de agua superficial (**Inundaciones**).<br>• `OPERA DISP`: desplazamiento superficial InSAR (**Terremotos / Terreno**).<br>• `OPERA DIST`: perturbación superficial (**Incendios / Deforestación**).<br>• `OPERA RTC`: backscatter radiométrica y topográficamente corregido. | Cloud-Optimized GeoTIFF (COG) / NetCDF | Pendiente de prueba |
| `NASA-03` | **NASA Earthdata / GIBS / Worldview / FIRMS / SMAP** | Visualización en capas WMTS/WMS ([ASF NISAR Worldview Docs](https://nisar-docs.asf.alaska.edu/worldview/)), focos activos térmicos (**FIRMS** para cruzar con incendios) y humedad del suelo (**SMAP** para cruzar con Banda L). | WMTS / WMS / CSV / GeoJSON / HDF5 | Pendiente de prueba |
| `NASA-04` | **ISRO Bhoonidhi Portal** | Portal oficial socio de la misión conjunta NASA-ISRO para consulta de referencia en **Banda S** y observaciones de agricultura/terreno. | Portal web / API según producto | Referencia |

### Niveles de Producto NISAR en ASF DAAC (Referencia Técnica)
- **Level 0B:** Señal cruda sin enfocar y calibración.
- **Level 1:** `RSLC` (*Range-Doppler Single Look Complex*), interferogramas envueltos/desenvueltos y offsets.
- **Level 2:** `GSLC` (*Geocoded SLC*), interferogramas geocodificados y covarianza polarimétrica *(más prácticos para Web Apps tras conversión a GeoTIFF/COG)*.
- **Level 3:** Productos geofísicos derivados (humedad del suelo, métricas de deformación).

---

## 2. Fuentes Complementarias `Open Data (+)` para Ciencia de Datos (Data Fusion)

Tal como se planteó en la Pizarra 4, cruzar las detecciones SAR con **Big Data / Open Data de campo** permite pasar de *"ver un cambio en un mapa"* a *"descubrir relaciones causales y cuantificar el impacto real"*:

| Dominio / Caso de uso | Fuentes Open Data recomendadas | Relación que descubre la Ciencia de Datos al cruzar con SAR |
| :--- | :--- | :--- |
| **Inundaciones / DANA** *(Escala Local)* | • **AEMET OpenData / ERA5 (Copernicus)**: lluvia acumulada por hora/día.<br>• **NASA SRTM / Copernicus DEM**: elevación y pendientes.<br>• **Red hidrográfica / MITECO / OpenStreetMap**: cauces, carreteras y edificios. | Correlacionar milímetros de precipitación + cota topográfica frente a la lámina de agua detectada por `Backscatter` (`OPERA DSWx`) para estimar zonas de acumulación crítica e infraestructura afectada. |
| **Incendios y Deforestación** | • **NASA FIRMS (MODIS/VIIRS)**: puntos calientes térmicos.<br>• **EFFIS (Copernicus) / AEMET**: viento, temperatura y humedad.<br>• **CORINE Land Cover / ESA WorldCover**: tipo de vegetación previa. | Verificar severidad del daño estructural (caída de retrodispersión volumétrica en Banda L/HV) atravesando el humo y calcular hectáreas quemadas por tipo de masa forestal. |
| **Terremotos y Cambios de Terreno** | • **USGS Earthquake Catalog API / IGN**: epicentro, profundidad, magnitud y fallas.<br>• **Litología / usos del suelo**: tipo de sustrato. | Cruzar la deformación interferométrica `InSAR` (`OPERA DISP`) con distancia a la falla, magnitud sísmica y tipo de suelo para modelar la atenuación del desplazamiento. |
| **Cultivos** | • **SIGPAC / LPIS / ESA WorldCover**: parcelas agrícolas y tipos de cultivo.<br>• **NASA SMAP / datos pluviométricos**: humedad y riego. | Relacionar la respuesta en **Banda S / polarización** con ciclos fenológicos de cosecha y estrés hídrico. |
| **Glaciares** | • **RGI (*Randolph Glacier Inventory*)** + series térmicas **ERA5 / NASA GISTEMP**. | Medir velocidad de desplazamiento o retroceso frontal (`InSAR` / offset tracking) frente a anomalías locales de temperatura. |
| **Ciclones y El Niño** *(Escala Global)* | • **NOAA / NHC / IBTrACS**: trayectorias y vientos de ciclones.<br>• **NOAA ONI (*Oceanic Niño Index*) / NASA Giovanni**. | Conectar anomalías climáticas planetarias (El Niño / ciclones) con su huella física concreta sobre el terreno (inundaciones costeras, sequías agrícolas o deslizamientos). |

---

## 3. Política Técnica sobre `Datos Sintéticos (~)`

Para proteger el criterio **Validity (Validez científica)** ante el jurado de la NASA:

1. **Cuándo SÍ usar datos sintéticos/simulados (`~`):**
   - **Simulaciones oficiales de NISAR publicadas por NASA JPL / ASF DAAC** (generadas a partir de vuelos **UAVSAR** o **ALOS** para entrenar algoritmos antes de la disponibilidad masiva de datos NISAR).
   - **Escenarios hipotéticos futuros ("¿Qué pasaría si...?")** en la Web App, siempre etiquetados visualmente en la interfaz como *"Simulación / Proyección"* y nunca mezclados sin aviso con observaciones reales.
   - **Datos sintéticos de prueba unitaria** en `dev/data_science/samples/` durante el desarrollo local.
2. **Cuándo NO usar datos sintéticos:**
   - **Nunca sustituir ni falsear** la evidencia de los sucesos históricos reales de la demo (DANA, incendios, terremotos, ciclones): esos deben respaldarse 100% con datos reales de NASA ASF/OPERA/Sentinel-1 y Open Data oficial.
