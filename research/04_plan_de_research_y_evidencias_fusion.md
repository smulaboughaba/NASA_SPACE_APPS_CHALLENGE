# Plan de Research y Evidencias Científicas de Fusión (`SAR + Open Data`)

> **Código:** `RES-04`  
> **Fase:** Fase 1 — Investigación, Reto y Datos NASA  
> **Propósito estratégico:** Respaldar el criterio **Validity (Validez científica)** ante el jurado de NASA Space Apps Challenge mediante evidencia empírica e institucional.  
> **Estado:** En preparación (Base completada)  

---

## 1. Objetivo del Documento

Este documento establece el **Plan Operativo de Research** del equipo y reúne la **evidencia científica y operativa (NASA, ESA/Copernicus, USGS)** que demuestra que fusionar datos radar **SAR** con fuentes abiertas de campo (**Open Data `+`**) no solo es viable, sino **necesario** para eliminar ambigüedades físicas del radar aislado y obtener análisis cuantitativos de alta precisión.

---

## 2. Evidencias Científicas e Institucionales: ¿Por qué funciona la Fusión `SAR + Open Data`?

El radar de apertura sintética (SAR) ofrece una ventaja única frente a los sensores ópticos al atravesar nubes, humo y operar de noche; sin embargo, **el SAR aislado tiene limitaciones físicas conocidas**. La literatura científica y los sistemas operativos de **NASA Applied Sciences**, **NASA JPL OPERA / ARIA**, **NASA ARSET**, **Copernicus EMS** y **USGS** demuestran que la fusión multi-fuente resuelve esas limitaciones:

### Evidencia 1 — Inundaciones y DANA (`SAR Backscatter` + `DEM` + `Pluviometría` + `Usos del Suelo`)

- **Limitación física del SAR aislado:**
  - El agua en calma refleja la onda radar de forma especular lejos del satélite (*backscatter* muy bajo, píxeles oscuros). Sin embargo, las **sombras topográficas de montañas (*radar shadow*)**, pistas/asfalto liso o suelos muy secos pueden generar **falsos positivos** (parecen agua sin serlo), mientras que el viento sobre el agua o el efecto *double-bounce* en zonas urbanas densas puede provocar **falsos negativos**.
- **Evidencia de mejora por fusión:**
  - Los flujos operativos de **NASA ARSET**, **NASA Applied Sciences** y **NASA JPL `OPERA DSWx`** (*Dynamic Surface Water eXtent*) demuestran que cruzar la máscara de retrodispersión SAR con **modelos digitales de elevación (`DEM`: NASA SRTM / Copernicus DEM)** —filtrando por pendiente y acumulación de flujo— y con **mapas de cobertura del suelo (`ESA WorldCover` / `CORINE`)** elimina los falsos positivos topográficos y urbanos, **superando el 90% de precisión en la cartografía de lámina de agua**.
- **Precedente real verificado para nuestra Demo Local — DANA de Valencia (29–31 de octubre de 2024):**
  - Durante la DANA que descargó entre **$300$ y $>600\text{ mm}$ en menos de $8\text{ horas}$** en las cuencas del río Magro y el barranco del Poyo (Chiva, Turís, Paiporta, Utiel), la nubosidad convectiva bloqueó las observaciones ópticas en tiempo real.
  - La adquisición **Sentinel-1 SAR del 31 de octubre de 2024** dentro de la activación oficial **Copernicus EMS `EMSR773`** permitió delimitar la extensión real de la inundación al sur de Valencia.
  - La fusión de **SAR (`Sentinel-1`) + `DEM` + series pluviométricas (`AEMET` / redes meteorológicas / `GPM IMERG`)** permitió reconstruir cómo los pulsos de precipitación aguas arriba se canalizaron por la topografía hasta generar la onda de crecida súbita aguas abajo.

### Evidencia 2 — Incendios Forestales y Deforestación (`SAR Banda L/C Polarimétrico` + `NASA FIRMS` + `DEM / Clima`)

- **Limitación de sensores aislados:**
  - Durante incendios activos, las columnas densas de humo ocultan el suelo a sensores ópticos (`Sentinel-2` / `Landsat`). Por su parte, el SAR aislado puede confundir cambios de humedad en cultivos o talas programadas con áreas quemadas.
- **Evidencia de mejora por fusión:**
  - Investigaciones respaldadas por **NASA Applied Sciences** muestran que combinar el *log-ratio* de retrodispersión pre/post evento en **polarización cruzada** (**`HV` en Banda L de $24\text{ cm}$**, sensible a estructura de troncos y ramas, y **`VH` en Banda C**, sensible a hojas y dosel) con los **focos térmicos activos de `NASA FIRMS` (`MODIS`/`VIIRS`)** delimita el perímetro y la severidad del daño estructural incluso bajo humo denso.
  - Además, cruzar esa severidad post-incendio con **pendiente del terreno (`DEM`)** y **lluvias posteriores (`GPM IMERG` / `AEMET`)** es el protocolo de referencia de **NASA / USGS** para detectar cuencas con alto riesgo de **flujos de lodo y deslizamientos post-incendio (*post-fire debris flows*)**.

### Evidencia 3 — Terremotos y Deformación del Terreno (`InSAR` + `USGS Earthquake Catalog` + `DEM`)

- **Evidencia operativa (`NASA JPL ARIA / OPERA DISP` + `USGS`):**
  - El sistema **ARIA** de NASA JPL (base directa de los productos **`OPERA DISP`** para Sentinel-1, UAVSAR y NISAR) fusiona de manera operativa interferogramas de fase **InSAR** (con corrección topográfica mediante **DEM**) junto con los catálogos sísmicos abiertos del **USGS** (epicentro, profundidad, magnitud $M_w$ y mecanismos focales).
  - Esta fusión permite validar qué franjas interferométricas corresponden realmente a desplazamiento co-sísmico de la falla frente a ruido atmosférico, modelando con precisión centimétrica/milimétrica el impacto sobre la corteza e infraestructuras.

---

## 3. Plan Operativo de Research del Equipo (4 Etapas)

| Etapa | Nombre | Qué debemos conseguir | Salida verificable |
| :--- | :--- | :--- | :--- |
| **`R1`** | **Acotación Espaciotemporal (*BBox + Fechas*)** | Fijar coordenadas exactas (`[min_lon, min_lat, max_lon, max_lat]`) y ventana temporal `T0` (Pre), `T1` (Evento) y `T2` (Post) para los casos de la demo. | Ficha de coordenadas y fechas para: **Caso Local 1 (DANA Valencia Oct-Nov 2024)**, **Caso Local 2 (Gran Incendio Mediterráneo/España)** y **Caso Global (Ciclón / El Niño / Terremoto)**. |
| **`R2`** | **Auditoría SAR en `NASA ASF DAAC / OPERA`** | Localizar en `search.asf.alaska.edu` (o con `asf_search`) los `Granule IDs` exactos de Sentinel-1, ALOS PALSAR, UAVSAR y/o productos `OPERA DSWx / RTC / DISP / DIST`. | Listado reproducible de escenas SAR reales verificadas y descargables para `T0`, `T1` y `T2`. |
| **`R3`** | **Extracción de Capas `Open Data (+)`** | Descargar para el mismo *Bounding Box* los datos de campo correspondientes: lluvia (`AEMET`/`ERA5`/`GPM`), relieve (`SRTM`/`Copernicus DEM`), cobertura (`CORINE`/`WorldCover`), focos (`FIRMS`), sismos (`USGS`) o viales (`OSM`). | Datasets alineados espacialmente (mismo CRS y *bounding box*) listos para `dev/data_science/`. |
| **`R4`** | **Experimento Demostrativo de Validez (*Proof of Validity*)** | Ejecutar 2 pruebas cuantitativas que demuestren en datos reales que nuestra fusión funciona mejor que el SAR aislado. | Gráficas/métricas exportadas para la Web App y el pitch (ver sección 4). |

---

## 4. Experimento Demostrativo de Validez (`Etapa R4`) para el Jurado

Para convertir este research en una prueba visual irrebatible dentro de la Web App y la presentación, generaremos en `dev/data_science/` dos comparativas empíricas reales:

1. **Prueba A — Filtro de Falsos Positivos (*Solo SAR* vs. *SAR + DEM + Land Cover*):**
   - Mostrar sobre el caso de estudio (p. ej. DANA Valencia) cuántos píxeles marca un umbral simple de `Backscatter` SAR como "agua" frente a los que quedan tras aplicar la máscara física de **pendiente (`DEM`) + cobertura del suelo**, evidenciando visual y numéricamente la reducción de ruido y falsos positivos.
2. **Prueba B — Matriz / Curva de Correlación Física:**
   - Calcular la correlación estadística entre las variables Open Data de campo (ej. precipitación acumulada + baja elevación relativa en DANA, o densidad térmica `FIRMS` en incendio) y la respuesta física medida por el satélite (caída en $\text{dB}$ del `Backscatter` o desplazamiento `InSAR`), desglosando las **hectáreas reales afectadas** por tipo de suelo (urbano, cultivo, bosque).

---

## 5. Propuesta de Reparto del Plan de Research entre los 4 Integrantes

| Integrante | Usuario GitHub | Rama | Responsabilidad en el Plan de Research (`R1`–`R4`) |
| :--- | :--- | :--- | :--- |
| **Samu** | `@smulaboughaba` | `samu` | Coordinación metodológica, validación técnica de productos `NASA OPERA / ASF DAAC` (`R2`), definición de métricas de la Prueba A y Prueba B (`R4`) e integración en `main`. |
| **Hugo** | `@hviciana` | `hugo` | **Caso Local 1 (DANA Valencia / Inundaciones):** recopilar escenas SAR (`EMSR773` / Sentinel-1 / `OPERA DSWx`), datos pluviométricos (`AEMET` / `ERA5` / `GPM`) y modelo de elevación (`DEM`) + infraestructuras (`OSM`). |
| **Yaro** | `@ItsYarosun` | `yaro` | **Caso Local 2 (Incendios / Deforestación / Cultivos):** recopilar escenas SAR (`Banda L` / `C` / `OPERA DIST`), focos térmicos (`NASA FIRMS`), meteorología y mapas de cobertura (`CORINE` / `WorldCover`). |
| **Jesús** | `@jesusorellanagil2002` | `jesus` | **Caso Global (Ciclón / El Niño / Terremoto `InSAR`):** recopilar datos globales (`OPERA DISP`, `NOAA IBTrACS / ONI`, catálogo sísmico `USGS`) y estructurar la narrativa *Local ➔ Global* del pitch. |

