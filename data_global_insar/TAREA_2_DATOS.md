# Tarea 1 de Validación — Viabilidad Global InSAR y Ciclón/El Niño (`data_global_insar/`)

## Objetivo
Consultar en vivo (sin API key) **escenas SAR reales de NASA ASF** sobre Turquía y Acapulco junto con **USGS Earthquake API** y **Open-Meteo ERA5**, generando `hyperframes_global_insar.json` y el informe `viabilidad_global_insar.md`.

---

## Prompt optimizado para copiar y pegar en Gemini Flash 3.8 (Antigravity)
```text
Lee GEMINI.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md.
REGLA ESTRICTA: Crea archivos ÚNICAMENTE dentro de data_global_insar/. NO toques GEMINI.md, datos_compartidos/ ni ningún otro archivo fuera de data_global_insar/.

Haz estos 4 pasos dentro de data_global_insar/:
1. Crea el script Python validar_viabilidad_global.py usando SOLO librerías estándar (urllib.request, json, csv, datetime) que consulte en vivo las 4 URLs exactas de FUENTES_Y_CONTEXTO_JESUS.md:
   - NASA ASF Turquía (InSAR): https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(37.01+37.22)&start=2023-01-25T00:00:00Z&end=2023-02-15T23:59:59Z&processingLevel=GRD_HD&output=geojson
   - NASA ASF Acapulco (Ciclón): https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-99.82+16.85)&start=2023-10-12T00:00:00Z&end=2023-11-02T23:59:59Z&processingLevel=GRD_HD&output=geojson
   - USGS Earthquakes GeoJSON: https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-02-05&endtime=2023-02-08&minmagnitude=6.0
   - Open-Meteo ERA5 Acapulco: https://archive-api.open-meteo.com/v1/archive?latitude=16.85&longitude=-99.82&start_date=2023-10-20&end_date=2023-10-30&daily=precipitation_sum,wind_speed_10m_max,cloud_cover_mean&timezone=America%2FMexico_City

2. Haz que el script guarde:
   - usgs_global_sample.json (máximo 15 sismos reales ordenados de mayor a menor magnitud).
   - clima_ciclon_acapulco.csv (lluvia, viento y nubosidad diaria de Acapulco).
   - escenas_sar_global.json (escenas Sentinel-1 reales de ambos casos con sceneName, startTime, polarization y browse URL).
   - hyperframes_global_insar.json siguiendo EXACTAMENTE el esquema JSON de FUENTES_Y_CONTEXTO_JESUS.md, insertando los valores reales obtenidos (magnitud máxima USGS, nubosidad/viento de Acapulco el 25 oct 2023 y las URLs browse reales de NASA ASF).

3. Ejecuta python3 data_global_insar/validar_viabilidad_global.py para comprobar que genera los 4 archivos sin errores (si hay fallo de red, dímelo claramente sin inventar números).

4. Redacta viabilidad_global_insar.md en español explicando con los números reales extraídos:
   - Por qué existen pares SAR pre/post sismo para InSAR en Turquía y pasadas radar bajo las nubes del ciclón en Acapulco.
   - Cómo viaja la explicación desde escala Local (DANA/Incendio) hasta escala Global (InSAR + SweepSAR > 240 km en ciclones/El Niño) para animar el Storyboard web.
```
