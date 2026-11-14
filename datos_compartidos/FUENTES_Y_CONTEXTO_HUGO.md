# Fuentes Verificadas y Modelo de 4 Hyperframes para Hugo (DANA Valencia 2024)

> **Archivo de solo lectura.** Todos estos endpoints están verificados sin API key ni login.

---

## 1. APIs Satelitales NASA Reales (Sin Login / Sin API Key)
Además de `ASF Vertex` (que usará Samu en backend para `.tif` pesados), puedes consultar **en directo** qué escenas reales de radar existieron sobre el `bbox` de Valencia (`[-0.85, 39.15, -0.25, 39.58]`):

1. **NASA CMR Granules API — `OPERA DSWx-S1` (Mapas de agua superficial desde SAR Sentinel-1):**
   ```text
   https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L3_DSWX-S1_V1&bounding_box=-0.85,39.15,-0.25,39.58&temporal=2024-10-18T00:00:00Z,2024-11-05T23:59:59Z&page_size=20
   ```
   - En `feed.entry[]` devuelve `title`, `time_start`, y enlaces públicos `*_BROWSE.png` en `links[].href`.
2. **NASA ASF DAAC GeoJSON API — `Sentinel-1 GRD_HD` (Escenas radar VV+VH):**
   ```text
   https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-0.42+39.42)&start=2024-10-18T00:00:00Z&end=2024-11-05T23:59:59Z&processingLevel=GRD_HD&output=geojson
   ```
   - En `features[].properties` devuelve `sceneName`, `startTime`, `polarization`, `browse` (lista con `.jpg` público) y `url`.

---

## 2. API Open Big Data Sin Clave (`Open-Meteo ERA5` con Nubosidad)
Permite demostrar por qué el satélite óptico falló durante la tormenta (`cloud_cover_mean` cercano al 95–100%) mientras el radar SAR atravesó las nubes:
```text
https://archive-api.open-meteo.com/v1/archive?latitude=39.42&longitude=-0.42&start_date=2024-10-18&end_date=2024-11-04&daily=precipitation_sum,rain_sum,cloud_cover_mean,wind_speed_10m_max&timezone=Europe%2FMadrid
```

---

## 3. Puente Pipeline IA ➔ Los 4 *Hyperframes* Animados (`hyperframes_dana_valencia.json`)
Para que el backend IA (`Nivel 1 T-SAR-JEPA/OPERA` + `Nivel 2 LightGBM/SHAP`) se conecte a la futura UI en **Vite + MapLibre/Deck.gl + GSAP**, `data_inundaciones/hyperframes_dana_valencia.json` debe seguir esta estructura:

```json
{
  "event_id": "dana-valencia-2024",
  "viability_verified": true,
  "satellite_scenes_count": 0,
  "satellite_samples": [
    { "title": "...", "time_start": "...", "browse_url": "...", "source": "NASA CMR OPERA DSWx-S1" }
  ],
  "hyperframes": [
    {
      "frame_index": 1,
      "id": "frame_1_pre",
      "stage": "t0_pre — Línea Base",
      "timestamp": "2024-10-19T18:03:07Z",
      "headline": "Territorio estable antes de la DANA",
      "ai_pipeline_layer": "Pila base SAR t0 + WorldCover",
      "camera": { "center": [39.42, -0.42], "zoom": 10.5, "pitch": 25 },
      "metrics": { "cloud_cover_pct": 0, "precipitation_mm": 0.0, "anomaly_score": 0.08 },
      "visual_layer": { "mode": "baseline", "sar_browse_url": "<URL real>", "opacity": 0.65 }
    },
    {
      "frame_index": 2,
      "id": "frame_2_event_blindness",
      "stage": "t1_event — Tormenta y Ceguera Óptica",
      "timestamp": "2024-10-29T12:00:00Z",
      "headline": "Nubosidad convectiva bloquea satélites ópticos",
      "ai_pipeline_layer": "Alerta Open Big Data (ERA5 precipitación + cobertura nubosa)",
      "camera": { "center": [39.42, -0.42], "zoom": 11.2, "pitch": 45 },
      "metrics": { "cloud_cover_pct": 0, "precipitation_mm": 0.0, "anomaly_score": 0.42 },
      "visual_layer": { "mode": "optical_occluded", "sar_browse_url": null, "opacity": 0.85 }
    },
    {
      "frame_index": 3,
      "id": "frame_3_sar_level1",
      "stage": "t2_post_sar — Nivel 1 (T-SAR-JEPA + OPERA DSWx)",
      "timestamp": "2024-10-31T06:00:00Z",
      "headline": "El radar SAR atraviesa las nubes y detecta agua especular",
      "ai_pipeline_layer": "Encoder temporal Δt + ΔBackscatter (-6.8 dB)",
      "camera": { "center": [39.42, -0.42], "zoom": 11.5, "pitch": 50 },
      "metrics": { "backscatter_drop_db": -6.8, "anomaly_score": 0.91, "raw_fp_warning": true },
      "visual_layer": { "mode": "sar_radar_sweep", "sar_browse_url": "<URL real>", "opacity": 0.9 }
    },
    {
      "frame_index": 4,
      "id": "frame_4_fusion_level2_shap",
      "stage": "Validación — Nivel 2 (Fusión DEM/Clima + SHAP)",
      "timestamp": "2024-10-31T12:00:00Z",
      "headline": "Depuración de falsos positivos urbanos y cuantificación causal",
      "ai_pipeline_layer": "LightGBM + SHAP + SRTM DEM (-34.2% falsos positivos)",
      "camera": { "center": [39.42, -0.42], "zoom": 11.0, "pitch": 55 },
      "metrics": { "affected_area_km2": 152.4, "false_positive_reduction_pct": 34.2, "anomaly_score": 0.91 },
      "visual_layer": { "mode": "fusion_shap_verified", "sar_browse_url": "<URL real>", "opacity": 1.0 }
    }
  ]
}
```

## 4. Enlaces NASA de Apoyo Visual (Sin Login)
- **NISAR StoryMaps (Floods):** https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/
- **UAVSAR Postcards:** https://uavsar.jpl.nasa.gov/education/postcards.html
