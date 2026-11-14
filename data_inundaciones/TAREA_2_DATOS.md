# Tarea 1 de Validación — Viabilidad Satélite + Open Data DANA Valencia (`data_inundaciones/`)

## Objetivo
Verificar con datos reales en vivo (sin API key) que existen **escenas SAR NASA** y **datos climáticos Open-Meteo ERA5 (lluvia + nubosidad)** para reconstruir y animar el caso `dana-valencia-2024`, generando `hyperframes_dana_valencia.json` y `viabilidad_dana_valencia.md`.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md.
Trabaja ÚNICAMENTE dentro de la carpeta data_inundaciones/ (no modifiques ningún archivo fuera de ella).

Crea dentro de data_inundaciones/:
1. Un script Python llamado validar_viabilidad_dana.py (usando solo librería estándar urllib.request, json y csv para no requerir pip install) que consulte en vivo las 3 URLs exactas de FUENTES_Y_CONTEXTO_HUGO.md:
   - NASA CMR OPERA DSWx-S1: https://cmr.earthdata.nasa.gov/search/granules.json?short_name=OPERA_L3_DSWX-S1_V1&bounding_box=-0.85,39.15,-0.25,39.58&temporal=2024-10-18T00:00:00Z,2024-11-05T23:59:59Z&page_size=20
   - NASA ASF Sentinel-1 GeoJSON: https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-0.42+39.42)&start=2024-10-18T00:00:00Z&end=2024-11-05T23:59:59Z&processingLevel=GRD_HD&output=geojson
   - Open-Meteo ERA5 (lluvia + cobertura nubosa): https://archive-api.open-meteo.com/v1/archive?latitude=39.42&longitude=-0.42&start_date=2024-10-18&end_date=2024-11-04&daily=precipitation_sum,rain_sum,cloud_cover_mean,wind_speed_10m_max&timezone=Europe%2FMadrid

2. El script debe:
   - Cruzar por fecha las pasadas reales del satélite NASA con la lluvia y la cobertura nubosa (%) diaria de Open-Meteo.
   - Guardar la serie diaria en lluvia_nubes_dana.csv y el catálogo de pasadas reales (con título, fecha ISO y enlace BROWSE.png/.jpg) en escenas_sar_dana.json.
   - Generar hyperframes_dana_valencia.json siguiendo exactamente el esquema de 4 Hyperframes definido en FUENTES_Y_CONTEXTO_HUGO.md, rellenando metrics.cloud_cover_pct, metrics.precipitation_mm y visual_layer.sar_browse_url con los valores y URLs reales obtenidos.

3. Ejecuta python3 data_inundaciones/validar_viabilidad_dana.py para comprobar que genera los 3 archivos sin errores (si falla la red en este entorno, dímelo claramente sin inventar números).

4. Redacta viabilidad_dana_valencia.md en español con una tabla de conclusiones verificadas: ¿qué días hubo pasadas SAR?, ¿qué % de nubes cegó al satélite óptico los días 29-31 oct?, ¿qué datos quedan verificados y listos para animar en los 4 Hyperframes del frontend?
```
