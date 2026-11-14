# Tarea 1 de Validación — Viabilidad Satélite + Open Data Incendio y Cultivos (`data_incendios_cultivos/`)

## Objetivo
Verificar en vivo con APIs abiertas (sin clave) las **pasadas reales de Sentinel-1 (`NASA ASF`)** y los **datos climáticos diarios (`Open-Meteo ERA5`)** para el incendio de marzo de 2023 (`incendio-forestal-mediterraneo`), generando `hyperframes_incendio_cultivos.json` y el informe `viabilidad_incendio_cultivos.md`.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md.
Trabaja ÚNICAMENTE dentro de la carpeta data_incendios_cultivos/ (no modifiques ningún archivo fuera de ella).

Crea dentro de data_incendios_cultivos/:
1. Un script Python llamado validar_viabilidad_incendio.py (usando solo librería estándar urllib.request, json y csv para no requerir pip install) que consulte en vivo las 2 URLs exactas de FUENTES_Y_CONTEXTO_YARO.md:
   - NASA ASF Sentinel-1 GeoJSON: https://api.daac.asf.alaska.edu/services/search/param?platform=S1&intersectsWith=POINT(-0.58+39.95)&start=2023-03-08T00:00:00Z&end=2023-04-03T23:59:59Z&processingLevel=GRD_HD&output=geojson
   - Open-Meteo ERA5: https://archive-api.open-meteo.com/v1/archive?latitude=39.95&longitude=-0.58&start_date=2023-03-08&end_date=2023-04-02&daily=temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_max,cloud_cover_mean,precipitation_sum&timezone=Europe%2FMadrid

2. El script debe:
   - Guardar la serie climática diaria en clima_incendio_era5.csv y las escenas Sentinel-1 reales (sceneName, startTime, polarization y browse URL) en escenas_sar_incendio.json.
   - Generar hyperframes_incendio_cultivos.json siguiendo el esquema de 4 Hyperframes de FUENTES_Y_CONTEXTO_YARO.md, rellenando temp_max_c, humidity_pct, wind_kmh con los valores reales de las fechas correspondientes, copiando shap_attributions reales del evento incendio-forestal-mediterraneo en el Frame 4, e insertando el browse_url real de Sentinel-1.

3. Ejecuta python3 data_incendios_cultivos/validar_viabilidad_incendio.py y verifica que genera todos los archivos con datos reales (si falla la conexión en este entorno, avísame claramente sin inventar cifras).

4. Redacta viabilidad_incendio_cultivos.md en español respondiendo con números reales:
   - ¿Cuántas pasadas Sentinel-1 VV+VH cubrieron la zona antes y después del 23 de marzo?
   - ¿Qué valores de temperatura, viento y baja humedad explican la propagación?
   - ¿Cómo ayuda la combinación Banda L (bosque) vs Banda S (cultivos) + SHAP a evitar falsos positivos en la demo?
```
