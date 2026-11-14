# Fuentes Verificadas para Hugo — Sequía, Incendios, Gases y Terreno en Los Ángeles (Ene 2025)

> **Archivo de solo lectura.** Todos estos endpoints son oficiales, gratuitos y funcionan sin API key ni registro.

---

## 1. ¿Qué necesita comprobar Samu antes de conectar su Pipeline IA?
El futuro pipeline de Samu funciona en 2 pasos:
- **Nivel 1 (`T-SAR-JEPA / OPERA`):** necesita **varias pasadas SAR reales (`Sentinel-1` / `OPERA`)** antes, durante y después del incendio con sus intervalos en días ($\Delta t$) para ver la pérdida de vegetación/dosel atravesando el humo, más referencia histórica de deformación del terreno (`OPERA DISP-S1`) para evaluar riesgo de deslizamientos en laderas quemadas.
- **Nivel 2 (`LightGBM + SHAP`):** necesita **series diarias continuas sin huecos** de sequía edáfica, temperatura, humedad, vientos y gases/humo de combustión (`CO`, `PM2.5`, `NO2`, `AOD`) para separar el área incendiada de vegetación simplemente seca.

*(Descartamos satélites `OCO-2/3` de $\text{CO}_2$ crudo en HDF5 porque tienen poca cobertura diaria y quedan cegados por el humo; usamos **`carbon_monoxide` ($\text{CO}$) y `pm2_5` de Copernicus CAMS vía Open-Meteo**, que son trazadores directos de combustión forestal con serie horaria completa).*

---

## 2. Las 4 Fuentes Reales Sin Clave para Tu Script (`data_sequia_incendios_la/`)

1. **Satélite SAR `Sentinel-1 GRD_HD` (`VV+VH`) — NASA ASF GeoJSON:**
   ```text
   https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-118.54+34.07)&start=2024-12-25T00:00:00Z&end=2025-01-25T23:59:59Z&processingLevel=GRD_HD&output=geojson
   ```
   - En `features[].properties`: `sceneName`, `startTime`, `polarization`, `browse` (imagen pública `.jpg`) y `flightDirection`.

2. **Productos NASA CMR `OPERA` (Radiometría, Disturbio Forestal y Deformación Terreno `InSAR`):**
   - `OPERA_L2_RTC-S1_V1`:
     ```text
     https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L2_RTC-S1_V1&bounding_box=-118.70,33.95,-117.95,34.30&temporal=2025-01-01T00:00:00Z,2025-01-25T23:59:59Z&page_size=10
     ```
   - `OPERA_L3_DIST-ALERT-HLS_V1`:
     ```text
     https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L3_DIST-ALERT-HLS_V1&bounding_box=-118.70,33.95,-117.95,34.30&temporal=2025-01-01T00:00:00Z,2025-01-25T23:59:59Z&page_size=10
     ```
   - `OPERA_L3_DISP-S1_V1` *(Deformación superficial del terreno InSAR en la misma zona)*:
     ```text
     https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L3_DISP-S1_V1&bounding_box=-118.70,33.95,-117.95,34.30&page_size=10
     ```

3. **Sequía, Humedad del Suelo, Temperatura y Vientos Santa Ana — Open-Meteo ERA5:**
   ```text
   https://archive-api.open-meteo.com/v1/archive?latitude=34.07&longitude=-118.54&start_date=2024-12-25&end_date=2025-01-25&daily=temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_max,wind_gusts_10m_max,precipitation_sum,soil_moisture_0_to_7cm_mean,cloud_cover_mean&timezone=America%2FLos_Angeles
   ```

4. **Gases Tóxicos y Humo (`CO`, `NO2`, `PM2.5`, `PM10`, `AOD`) — Open-Meteo Air Quality CAMS:**
   ```text
   https://air-quality-api.open-meteo.com/v1/air-quality?latitude=34.07&longitude=-118.54&start_date=2025-01-01&end_date=2025-01-25&hourly=pm2_5,pm10,carbon_monoxide,nitrogen_dioxide,aerosol_optical_depth&timezone=America%2FLos_Angeles
   ```
   - *Nota:* Esta API devuelve datos horarios (`hourly`); en Python agrúpalos por día (`max` diario y `mean` diario) para cruzarlos por fecha con la tabla diaria de `ERA5`.
