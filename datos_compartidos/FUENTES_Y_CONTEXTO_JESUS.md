# Fuentes Verificadas para Jesús — Compatibilidad DANA Valencia 2024 y Storytelling

> **Archivo de solo lectura.** Endpoints reales sin login ni API key.

---

## 1. ¿Qué debe comprobar tu análisis de compatibilidad para el modelo de Samu?
- **Para el Nivel 1 (`T-SAR-JEPA / OPERA`):** Comprobar qué días exactos pasaron los satélites sobre Valencia (`2024-10-18` a `2024-11-05`), qué intervalos $\Delta t$ (en días) hay entre pasadas, y si existen enlaces públicos `*_BROWSE.png` / `.jpg` antes (`t0_pre`) y después (`t2_post_sar`) del 29 de octubre.
- **Para el Nivel 2 (`LightGBM + SHAP`):** Comprobar con **Open-Meteo ERA5** si los datos diarios de lluvia (`precipitation_sum`), saturación del suelo (`soil_moisture_0_to_7cm_mean`), viento y **nubosidad (`cloud_cover_mean`)** tienen `0%` nulos y prueban que las nubes cegaron los satélites ópticos mientras el radar SAR veía el agua.

---

## 2. Las 4 URLs Reales Sin Clave para Tu Script (`data_dana_valencia/`)

1. **NASA CMR `OPERA_L3_DSWX-S1_V1` (Mapas de lámina de agua derivados de Sentinel-1):**
   ```text
   https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L3_DSWX-S1_V1&bounding_box=-0.85,39.15,-0.25,39.58&temporal=2024-10-18T00:00:00Z,2024-11-05T23:59:59Z&page_size=20
   ```
   - En `feed.entry[]` tienes `title`, `time_start` y enlaces `*_BROWSE.png` en `links[].href`.

2. **NASA CMR `OPERA_L2_RTC-S1_V1` (Retrodispersión calibrada al terreno):**
   ```text
   https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L2_RTC-S1_V1&bounding_box=-0.85,39.15,-0.25,39.58&temporal=2024-10-18T00:00:00Z,2024-11-05T23:59:59Z&page_size=20
   ```

3. **NASA ASF DAAC `Sentinel-1 GRD_HD` (`VV+VH`, `output=geojson`):**
   ```text
   https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-0.42+39.42)&start=2024-10-18T00:00:00Z&end=2024-11-05T23:59:59Z&processingLevel=GRD_HD&output=geojson
   ```
   - En `features[].properties`: `sceneName`, `startTime`, `polarization` y `browse`.

4. **Open-Meteo Historical Weather (`ERA5 Copernicus`, lluvia + humedad suelo + nubosidad):**
   ```text
   https://archive-api.open-meteo.com/v1/archive?latitude=39.42&longitude=-0.42&start_date=2024-10-18&end_date=2024-11-05&daily=precipitation_sum,rain_sum,soil_moisture_0_to_7cm_mean,cloud_cover_mean,wind_speed_10m_max,wind_gusts_10m_max&timezone=Europe%2FMadrid
   ```

---

## 3. Lecturas NASA Oficiales (Sin Login) y Disclaimer Legal
- **NISAR StoryMaps (Floods):** https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/
- **Intro to SAR:** https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar
- **NASA ARSET Trainings (Español/Inglés):** https://appliedsciences.nasa.gov/get-involved/training
- **Disclaimer:** En la web se citan siempre todas las fuentes reales (`NASA ASF DAAC / JPL OPERA`, `ESA Copernicus`, `ERA5 vía Open-Meteo`, `NOAA`, `USGS`, `OpenStreetMap`) aclarando que NASA no respalda entidades externas a EE. UU.
