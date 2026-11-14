# Fuentes de Datos Oficiales NASA, Agencias Socias, Análisis del Disclaimer y Triaje Core MVP

> **Código:** `RES-02`  
> **Fase:** Fase 1 — Investigación, Reto y Datos NASA  
> **Estado:** Completado y filtrado (Core MVP sin fricción)

---

## 1. Catálogo Oficial de Recursos del Reto (*NASA Space Apps Challenge*)

### 1.1. NASA Data & Resources
| Recurso oficial | Enlace | Qué aporta al proyecto | Acceso |
| :--- | :--- | :--- | :--- |
| **NASA Earthdata Search** | https://search.earthdata.nasa.gov/search | Buscador general de observación terrestre (`OPERA`, `FIRMS`, `SMAP`, `SRTM`). | Login Earthdata |
| **ASF Data Search Vertex** | https://search.asf.alaska.edu/ | Archivo oficial NASA de datos SAR (**Sentinel-1**, **ALOS PALSAR**, **UAVSAR**, **OPERA RTC/DSWx/DISP/DIST**). | Login gratuito Earthdata |
| **NISAR Data User Guide** | https://nisar-docs.asf.alaska.edu/ | Guía técnica sobre productos `.h5` (`GCOV`, `GUNW`, `GSLC`) y trabajo con datos NISAR. | Libre sin registro |
| **Intro to Remote Sensing** | https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/remote-sensing | Fundamentos de teledetección y resoluciones espacial/temporal/espectral. | Libre sin registro |
| **Intro to Synthetic Aperture Radar (SAR)** | https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar | Fundamentos oficiales de frecuencia, longitud de onda, polarización y mecanismos de dispersión. | Libre sin registro |
| **NASA ARSET Trainings** | https://appliedsciences.nasa.gov/get-involved/training | Cursos prácticos oficiales en **inglés y español** sobre SAR, NISAR, inundaciones y agricultura. | Libre sin registro |
| **NISAR StoryMaps** | https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/ | StoryMaps interactivos de NASA JPL sobre **inundaciones, incendios, subsidencia, vertidos y glaciares**. | Libre sin registro |
| **NISAR Applications White Papers** | https://nisar.jpl.nasa.gov/applications/societal-benefit/ | Resúmenes ejecutivos de 2 páginas sobre casos de impacto social de NISAR. | Libre sin registro |
| **UAVSAR Postcards** | https://uavsar.jpl.nasa.gov/education/postcards.html | Composiciones en falso color aerotransportadas Banda L (`UAVSAR`) para storytelling y validación visual. | Libre sin registro |

### 1.2. Space Agency Partner Resources (Agencias Espaciales Socias)
| Agencia | Recurso oficial | Enlace | Qué aporta | Acceso |
| :--- | :--- | :--- | :--- | :--- |
| **CSA** *(Canadá)* | **RADARSAT-1 Open Archive** | https://donnees-data.asc-csa.gc.ca/en/dataset/radarsat1 | Archivo histórico SAR bajo *Open Government Licence – Canada*. | Portal CSA |
| **CSA** *(Canadá)* | **SAR Python Tutorial** | https://github.com/asc-csa/Synthetic_Aperture_Radar_Tutorial | Tutorial oficial en Python y QGIS para visualizar imágenes SAR. | Libre en GitHub |
| **CSA** *(Canadá)* | **RADARSAT Constellation Mission (RCM)** | https://donnees-data.asc-csa.gc.ca/en/dataset/rcm | Datos de vigilancia marítima, desastres y ecosistemas. | Cuenta EODMS/CSA |
| **CONAE** *(Argentina)* | **SAOCOM Catalogue** & **Registro ONE CLICK** | [Catálogo](https://catalogos.conae.gov.ar/catalogo/catalogoSatSaocomInfo.html) · [Protocolo Registro](https://www.argentina.gob.ar/noticias/la-informacion-saocom-cada-vez-mas-accesible) | Satélite SAR Banda L (~23.5 cm), documentación en español. | Registro *ONE CLICK* |

---

## 2. Triaje Objetivo: ¿Qué necesitamos realmente? (Core MVP vs. Descartadas)

> **Criterio objetivo:** Para un hackathon con compañeros que están empezando y tiempo limitado, cada fuente extra con login manual o formatos pesados añade riesgo de bloqueo sin aportar ventaja técnica real frente al catálogo central de NASA ASF/OPERA.

| Fuente evaluada | Decisión | Motivo técnico y operativo objetivo | Quién la usa |
| :--- | :--- | :--- | :--- |
| **NISAR StoryMaps, White Papers, UAVSAR Postcards, Intro to SAR, NASA ARSET** | **MANTENER (Core MVP)** | **Cero registro y cero riesgo.** Material oficial directo de NASA JPL para narrativa, conceptos físicos (Banda L/S, backscatter, InSAR, polarización) y validación visual. | Todo el equipo (Hugo, Yaro, Jesús, Samu) |
| **ASF Data Search Vertex + NISAR Data User Guide** | **MANTENER (Solo Backend/IA)** | **Único portal SAR técnico necesario.** Centraliza `OPERA` (`.tif` COG ya calibrados: `DSWx`, `DISP`, `DIST`), `Sentinel-1` y `ALOS` Banda L con una sola cuenta Earthdata. | **Solo Samu** (`dev/backend/` + `dev/data_science/models/`) |
| **Open-Meteo Historical API (ERA5 Copernicus)** (`https://archive-api.open-meteo.com/v1/archive`) | **MANTENER (Core MVP)** | **Sin API Key ni registro.** Devuelve lluvia diaria/horaria, temperatura, viento y humedad en JSON/CSV al instante. **Sustituye a AEMET**. | Hugo (`inundaciones`) e Yaro (`incendios`) |
| **USGS Earthquake GeoJSON API** (`https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson`) | **MANTENER (Core MVP)** | **Sin API Key ni registro.** GeoJSON oficial en tiempo real e histórico de terremotos (magnitud, profundidad, epicentro). | Jesús (`global_insar`) |
| **NASA FIRMS Active Fire** (`https://firms.modaps.eosdis.nasa.gov/active_fire/`) | **MANTENER (Core MVP)** | Descarga web directa de CSV históricos de focos térmicos activos sin fricción de autenticación para consultas puntuales. | Yaro (`incendios`) |
| **CONAE SAOCOM** | **DESCARTADA para MVP** | Exige perfil *ONE CLICK*, gestión adicional y **prohíbe redistribuir crudos**. La Banda L ya queda cubierta sin fricción adicional con `UAVSAR` y `ALOS/OPERA` en `ASF Vertex`. | No usar salvo necesidad posterior |
| **CSA RCM y RADARSAT-1 (descargas)** | **DESCARTADA para MVP** | Exige cuenta EODMS/portales extra y añade formatos distintos cuando `Sentinel-1` + `OPERA` en `ASF Vertex` cubren todo el flujo. *(Solo se deja `CSA SAR Python Tutorial` en GitHub como referencia opcional de lectura Python).* | No usar para entregas del equipo |
| **NASA Earthdata Search (portal general)** | **DESCARTADA para compañeros** | Interfaz generalista compleja y propensa a descargar archivos `.h5`/NetCDF de varios GB. Se canaliza únicamente a través de `ASF Vertex` por Samu. | Solo referencia conceptual |
| **AEMET OpenData (con API Key)** | **DESCARTADA en MVP** | Exige solicitar y gestionar clave personal API. Reemplazada por **Open-Meteo (ERA5 Copernicus)** sin credenciales para el equipo. | No usar en scripts del equipo |

---

## 3. Análisis del Disclaimer Oficial y Reglas Legales

El enunciado del reto especifica:
> *"NASA does not endorse any non-U.S. Government entity and is not responsible for information contained on non-U.S. Government websites. For non-U.S. Government websites, participants must comply with any data use parameters of that specific website."*

### Implicaciones prácticas para la Web App y el Repositorio
1. **Permitido combinar Open Data externo con datos NASA** (`Open-Meteo / ERA5`, `Copernicus`, `USGS`, `OpenStreetMap`), cumpliendo las licencias de atribución de cada sitio.
2. **Prohibido subir archivos satelitales crudos o pesados a GitHub** (`>5 MB`, `.h5`, `.zip`, `.tif` completos): el repositorio solo almacena **scripts ligeros, métricas agregadas JSON/CSV y documentación derivada**.
3. **Atribuciones visibles obligatorias:** Tanto en `dev/shared/mock_events_contract.json` como en el pie de página creado por Jesús deben aparecer las fuentes efectivamente empleadas (**NASA ASF DAAC / JPL NISAR & OPERA**, **NASA FIRMS**, **ESA Copernicus / ERA5 vía Open-Meteo**, **NOAA**, **USGS**, **OpenStreetMap contributors**).

---

## 4. Cruces `SAR + Open Data (+)` y Política de `Datos Sintéticos (~)`

### 4.1. Cruces Operativos en el MVP
| Nicho | Quién extrae Open Data (`+`) | Fuente Keyless MVP | Qué valida junto al SAR (Backend Samu) |
| :--- | :--- | :--- | :--- |
| **Inundaciones (DANA Valencia)** | Hugo (`hugo_inundaciones`) | `Open-Meteo ERA5` (`precipitation_sum`) | Lluvia acumulada + pendiente/cota frente a caída de `Backscatter` (`OPERA DSWx`). |
| **Incendios y Cultivos** | Yaro (`yaro_incendios_cultivos`) | `Open-Meteo ERA5` + `NASA FIRMS` (CSV público) | Temperatura, viento y focos térmicos frente a pérdida cruzada `HV/VH` en Banda L/S. |
| **Terremotos y Escala Global** | Jesús (`jesus_global_insar`) | `USGS Earthquake API` (`GeoJSON`) | Epicentros/magnitudes frente a interferometría `InSAR` y ancho de barrido global. |

### 4.2. Política sobre `Datos Sintéticos (~)`
- **Permitido:** Usar `dev/shared/mock_events_contract.json` como contrato de desarrollo para desacoplar Frontend y Backend durante la construcción, y datos simulados oficiales de NASA JPL (`UAVSAR`) etiquetados explícitamente.
- **Prohibido:** Inventar mediciones reales de desastres históricos en la demo final; los scripts de Hugo, Yaro y Jesús consultan APIs reales abiertas (`Open-Meteo`, `USGS`, `FIRMS`) que se integrarán con el motor de Samu (`RES-05`).
