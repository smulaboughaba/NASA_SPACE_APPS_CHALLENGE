# Tarea 2 — Extracción Sísmica USGS y Análisis InSAR/Global (`data_global_insar/`)

## Objetivo
Consultar en vivo la **API pública del USGS (sin API key)** para los terremotos reales de febrero de 2023 (`Mw >= 6.0`), guardar un JSON limpio y redactar en español cómo la interferometría InSAR y el modo SweepSAR escalan nuestra web app del plano local al global.

---

## Prompt optimizado para copiar y pegar en Gemini Flash 3.8 (Antigravity)
```text
Lee GEMINI.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md.
REGLA ESTRICTA: Crea archivos ÚNICAMENTE dentro de data_global_insar/. NO modifiques ningún archivo fuera de data_global_insar/.

Realiza estos 3 pasos dentro de data_global_insar/:
1. Crea el script Python extraer_sismos_usgs.py usando SOLO librerías estándar (urllib.request, json, datetime) que consulte esta URL exacta sin API key:
   https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-02-05&endtime=2023-02-08&minmagnitude=6.0
   Extrae de cada terremoto en features[] su id, place, mag, fecha ISO, latitud, longitud y profundidad_km (geometry.coordinates[2]), ordénalos de mayor a menor magnitud y guárdalos en usgs_global_sample.json (máximo 15 registros para que sea ligero).
2. Ejecuta python3 data_global_insar/extraer_sismos_usgs.py y comprueba el archivo generado (si hay algún problema de red, dímelo claramente sin inventar resultados).
3. Redacta analisis_global_insar.md en español con lenguaje claro para el pitch del hackathon explicando:
   - Qué detecta InSAR (deformación milimétrica/centimétrica y pérdida de coherencia urbana) usando el sismo real extraído del USGS y la ficha de terremoto-insar-global.
   - Cómo pasamos en la historia de una catástrofe local (DANA Valencia) a escala planetaria (terremotos InSAR y ciclón/El Niño con barrido SweepSAR > 240 km de NISAR).
```
