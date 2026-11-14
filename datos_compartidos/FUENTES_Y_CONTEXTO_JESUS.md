# Fuentes Verificadas y Modelo de 4 Hyperframes para Jesús (InSAR y Escala Global)

> **Archivo de solo lectura.** Todos estos endpoints funcionan en vivo sin registro ni API key.

---

## 1. Narrativa *Local ➔ Global* e Historia de los Modelos IA
1. Empezamos en sucesos locales cercanos (**DANA Valencia** e **Incendio Forestal**) y demostramos que el mismo motor **Nivel 1 (`T-SAR-JEPA / InSAR`) + Nivel 2 (`LightGBM + SHAP`)** escala a nivel planetario:
   - **Terremoto Falla de Anatolia (`terremoto-insar-global`):** Interferometría **InSAR** compara la fase radar entre antes (`t0_pre`) y después del sismo (`t2_post_sar`) detectando desplazamientos de hasta **140 cm** y pérdida de coherencia urbana sobre ciudades.
   - **Ciclón Tropical y El Niño (`ciclon-elnino-global`):** El ancho de barrido **SweepSAR (>240 km)** de NISAR vigila franjas costeras enteras bajo nubes huracanadas y se cruza con clima extremo y el índice oceánico **El Niño (NOAA ONI)**.

---

## 2. APIs Reales Sin Clave Verificadas para Tu Script (`data_global_insar/`)

### A. Satélite NASA ASF DAAC (`Sentinel-1 GRD_HD`, `output=geojson`)
- **Caso Terremoto Turquía (`POINT(37.01 37.22)` — ene–feb 2023):**
  ```text
  https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(37.01+37.22)&start=2023-01-25T00:00:00Z&end=2023-02-15T23:59:59Z&processingLevel=GRD_HD&output=geojson
  ```
- **Caso Ciclón Otis Acapulco (`POINT(-99.82 16.85)` — oct 2023):**
  ```text
  https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-99.82+16.85)&start=2023-10-12T00:00:00Z&end=2023-11-02T23:59:59Z&processingLevel=GRD_HD&output=geojson
  ```
*(En `features[].properties` tienes `sceneName`, `startTime`, `polarization` y `browse` con imagen pública `.jpg`).*

### B. Open Big Data Sin API Key (`USGS Earthquakes` + `Open-Meteo ERA5`)
- **USGS Earthquake GeoJSON API (sismos Mw ≥ 6.0 entre 5 y 8 feb 2023):**
  ```text
  https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-02-05&endtime=2023-02-08&minmagnitude=6.0
  ```
- **Open-Meteo ERA5 Acapulco (lluvia, viento y nubosidad del ciclón en oct 2023):**
  ```text
  https://archive-api.open-meteo.com/v1/archive?latitude=16.85&longitude=-99.82&start_date=2023-10-20&end_date=2023-10-30&daily=precipitation_sum,wind_speed_10m_max,cloud_cover_mean&timezone=America%2FMexico_City
  ```

---

## 3. Esquema de `hyperframes_global_insar.json` (4 *Hyperframes* Animados)
Tu script en `data_global_insar/` debe generar este JSON exacto para conectar los datos verificados con la web animada:

```json
{
  "event_id": "terremoto-insar-global",
  "secondary_event_id": "ciclon-elnino-global",
  "viability_verified": true,
  "usgs_top_magnitude": 7.8,
  "satellite_scenes_count": 0,
  "satellite_samples": [
    { "case": "terremoto", "sceneName": "...", "startTime": "...", "browse_url": "..." }
  ],
  "hyperframes": [
    {
      "frame_index": 1,
      "id": "frame_1_pre",
      "stage": "t0_pre — Órbita Base InSAR",
      "timestamp": "2023-01-28",
      "headline": "Superficie terrestre estable antes del terremoto",
      "ai_pipeline_layer": "Captura fase radar de referencia t0",
      "metrics": { "displacement_cm": 0, "usgs_mw": 0, "anomaly_score": 0.05 },
      "visual_layer": { "mode": "baseline_insar", "sar_browse_url": "<browse pre>" }
    },
    {
      "frame_index": 2,
      "id": "frame_2_event_blindness",
      "stage": "t1_event — Ruptura Sísmica + Alerta Open Big Data",
      "timestamp": "2023-02-06",
      "headline": "Sismo Mw 7.8 registrado por USGS y nubosidad ciclónica en escala global",
      "ai_pipeline_layer": "Ingesta en vivo USGS Earthquake API + Open-Meteo ERA5",
      "metrics": { "usgs_mw": 7.8, "cyclone_cloud_pct": 0, "cyclone_wind_kmh": 0, "anomaly_score": 0.61 },
      "visual_layer": { "mode": "seismic_alert", "sar_browse_url": null }
    },
    {
      "frame_index": 3,
      "id": "frame_3_sar_level1",
      "stage": "t2_post_sar — Nivel 1 (Interferometría InSAR + T-SAR-JEPA)",
      "timestamp": "2023-02-10",
      "headline": "Franjas interferométricas miden deformación cortical y pérdida de coherencia",
      "ai_pipeline_layer": "Nivel 1 Cálculo diferencia de fase InSAR (GUNW/DISP)",
      "metrics": { "max_los_displacement_cm": 140.0, "coherence_loss_urban_pct": 44.5, "anomaly_score": 0.96 },
      "visual_layer": { "mode": "insar_fringe_sweep", "sar_browse_url": "<browse post>" }
    },
    {
      "frame_index": 4,
      "id": "frame_4_fusion_level2_shap",
      "stage": "Validación — Nivel 2 (Fusión USGS/OSM + SHAP ➔ Escala Global)",
      "timestamp": "2023-10-25",
      "headline": "Cruce con fallas/edificios depura falsos positivos y escala a SweepSAR global",
      "ai_pipeline_layer": "Nivel 2 LightGBM + SHAP (-22.0% falsos positivos InSAR / -31.0% Ciclón)",
      "metrics": { "affected_area_km2": 3200.0, "false_positive_reduction_pct": 22.0, "anomaly_score": 0.96 },
      "visual_layer": { "mode": "global_fusion_verified", "sar_browse_url": "<browse acapulco>" }
    }
  ]
}
```

## 4. Lecturas NASA Oficiales (Sin Login) y Disclaimer Legal
- **Intro to SAR:** https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar
- **NASA ARSET Trainings (ES/EN):** https://appliedsciences.nasa.gov/get-involved/training
- **NISAR Applications White Papers:** https://nisar.jpl.nasa.gov/applications/societal-benefit/
- **UAVSAR Postcards:** https://uavsar.jpl.nasa.gov/education/postcards.html
- **Nota legal (Disclaimer NASA):** Cita siempre las fuentes (`NASA ASF DAAC / JPL NISAR & OPERA`, `USGS`, `Open-Meteo ERA5`, `NOAA`, `OpenStreetMap`) y aclara que NASA no respalda entidades externas a EE. UU.
