# Fuentes Verificadas para Yaro — El Niño y Ciclón Costero en el Pacífico (`ciclon-elnino-global`)

> **Archivo de solo lectura.** Endpoints reales sin API key ni registro para el estudio de compatibilidad.

---

## 1. ¿Qué necesita comprobar Samu para este caso global?
Este caso representa el salto de **escala local a escala planetaria** (*Ciclón Otis sobre la costa de Acapulco, octubre 2023, bajo pico intenso de El Niño +1.8 °C en índice NOAA ONI*):
- **Nivel 1 (`T-SAR-JEPA` + ancho `SweepSAR > 240 km`):** Necesita verificar si existen **pasadas reales `Sentinel-1 GRD_HD` (`VV+VH`)** antes y después del impacto ciclónico (`25 oct 2023`) con intervalos $\Delta t$ medibles y cobertura en `OPERA`.
- **Nivel 2 (`LightGBM + SHAP`):** Necesita series diarias sin huecos de **lluvia (`precipitation_sum`), rachas de viento (`wind_gusts_10m_max`), cobertura nubosa (`cloud_cover_mean`)** —para demostrar ceguera óptica— y **humedad del suelo (`soil_moisture_0_to_7cm_mean`)** en zonas costeras/cultivos.

---

## 2. Las 3 Fuentes Reales Sin Clave para Tu Script (`data_elnino_ciclon/`)

1. **Satélite SAR `Sentinel-1 GRD_HD` (`VV+VH`) — NASA ASF GeoJSON:**
   ```text
   https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-99.82+16.85)&start=2023-10-10T00:00:00Z&end=2023-11-05T23:59:59Z&processingLevel=GRD_HD&output=geojson
   ```
   - En `features[].properties`: `sceneName`, `startTime`, `polarization`, `browse` (imagen pública `.jpg`) y `flightDirection`.

2. **NASA CMR `OPERA_L2_RTC-S1_V1` y `OPERA_L3_DSWX-S1_V1` (comprobación de cobertura histórica):**
   ```text
   https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L2_RTC-S1_V1&bounding_box=-100.30,16.50,-99.30,17.20&temporal=2023-10-10T00:00:00Z,2023-11-05T23:59:59Z&page_size=15
   ```
   *(Comprueba también `OPERA_L3_DSWX-S1_V1` en ese mismo bbox y fechas: si devuelve `0` gránulos porque OPERA inició después en esa zona, reportar `0` junto a las escenas `Sentinel-1` de ASF es un hallazgo clave de viabilidad).*

3. **Clima Costero y Agrícola bajo El Niño — Open-Meteo ERA5:**
   ```text
   https://archive-api.open-meteo.com/v1/archive?latitude=16.85&longitude=-99.82&start_date=2023-10-10&end_date=2023-11-05&daily=temperature_2m_max,relative_humidity_2m_mean,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,soil_moisture_0_to_7cm_mean,cloud_cover_mean&timezone=America%2FMexico_City
   ```
   - **Referencia fija de contexto climático global (`mock_events_contract.json`):** Índice **NOAA ONI = `+1.8 °C`** (evento El Niño fuerte oct 2023).
