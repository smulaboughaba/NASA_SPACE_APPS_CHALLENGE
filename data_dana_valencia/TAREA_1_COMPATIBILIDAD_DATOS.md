# Tarea 1 (Prioridad #1) — Estudio de Compatibilidad DANA Valencia 2024 (`data_dana_valencia/`)

## Objetivo
**NO programes ni entrenes modelos de IA.** Tu misión es realizar un **estudio real de compatibilidad de datos (EDA)** consultando las APIs abiertas de **NASA CMR (`OPERA DSWx-S1` / `RTC-S1`)**, **NASA ASF (`Sentinel-1`)** y **Open-Meteo ERA5 (lluvia + humedad del suelo + nubosidad)** sobre Valencia (`2024-10-18` a `2024-11-05`), y dejarle a Samu el informe listo en `informe_viabilidad_dana.md`.

---

## Prompt optimizado para copiar y pegar en Gemini Flash 3.8 (Antigravity)
```text
Lee GEMINI.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md.
REGLA ESTRICTA: Crea archivos ÚNICAMENTE dentro de data_dana_valencia/. NO modifiques GEMINI.md, datos_compartidos/ ni nada fuera de data_dana_valencia/.
NO programes modelos de IA (ni PyTorch ni LightGBM). Solo análisis y verificación de compatibilidad de datos con Python estándar.

Haz estos 4 pasos dentro de data_dana_valencia/:
1. Crea el script Python analizar_compatibilidad_dana.py usando SOLO librerías estándar (urllib.request, json, csv, datetime) que consulte en vivo las 4 URLs exactas de FUENTES_Y_CONTEXTO_JESUS.md:
   - NASA CMR OPERA_L3_DSWX-S1_V1 sobre Valencia.
   - NASA CMR OPERA_L2_RTC-S1_V1 sobre Valencia.
   - NASA ASF Sentinel-1 GRD_HD GeoJSON sobre POINT(-0.42 39.42).
   - Open-Meteo ERA5 diario (precipitation_sum, rain_sum, soil_moisture_0_to_7cm_mean, cloud_cover_mean, wind_speed_10m_max, wind_gusts_10m_max) del 2024-10-18 al 2024-11-05.

2. El script debe generar 2 archivos limpios dentro de data_dana_valencia/:
   - dataset_compatibilidad_dana.csv: una fila por día (2024-10-18 a 2024-11-05) con lluvia, humedad del suelo, viento, nubosidad (%) y columnas booleanas + conteo indicando qué días hubo gránulos OPERA DSWx-S1 y escenas Sentinel-1.
   - reporte_compatibilidad_dana.json: resumen objetivo para Samu con:
     * total_granulos_opera_dswx, total_granulos_opera_rtc, total_escenas_sentinel1.
     * lista ordenada de fechas SAR reales con el cálculo exacto de intervalos Δt (en días) entre pasadas consecutivas y las URLs públicas *_BROWSE.png / .jpg.
     * porcentaje_nulos_era5 por variable.
     * resumen_tormenta_oct29_31 (lluvia diaria, cloud_cover_mean en %, soil_moisture_0_to_7cm_mean pre vs post riada).

3. Ejecuta python3 data_dana_valencia/analizar_compatibilidad_dana.py y comprueba los resultados reales (si hay fallo de red en este entorno, avísame claramente sin inventar números).

4. Redacta informe_viabilidad_dana.md en español respondiendo para Samu:
   - ¿Queda demostrado con cloud_cover_mean que el óptico estuvo cegado el 29–31 oct mientras OPERA DSWx-S1 y Sentinel-1 sí capturaron escenas?
   - ¿Tienen intervalos Δt regulares las pasadas SAR para alimentar T-SAR-JEPA?
   - ¿Qué variables climáticas (lluvia, saturación previa del suelo, rachas de viento) están 100% limpias y listas para el Nivel 2?
```
