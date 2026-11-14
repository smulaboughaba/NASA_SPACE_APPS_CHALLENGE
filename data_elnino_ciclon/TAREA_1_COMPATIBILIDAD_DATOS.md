# Tarea 1 (Prioridad #1) — Estudio de Compatibilidad El Niño / Ciclón (`data_elnino_ciclon/`)

## Objetivo
**NO tienes que programar modelos de IA.** Tu misión es hacer un **estudio real de compatibilidad de datos (EDA)** consultando las APIs de NASA ASF/CMR y Open-Meteo ERA5 sobre la ventana del ciclón costero en el Pacífico bajo **El Niño (oct–nov 2023)**, verificar qué pasadas y variables existen sin huecos, y redactar `informe_viabilidad_elnino.md` para Samu.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md.
Trabaja ÚNICAMENTE dentro de la carpeta data_elnino_ciclon/ (NO modifiques CLAUDE.md, datos_compartidos/ ni nada fuera de esta carpeta).
OJO: NO programes ni entrenes modelos de IA. Solo análisis y verificación de compatibilidad de datos con Python estándar.

Haz esto dentro de data_elnino_ciclon/:
1. Crea el script analizar_compatibilidad_elnino.py usando SOLO librerías estándar (urllib.request, json, csv, datetime) que consulte en vivo las URLs sin API key de FUENTES_Y_CONTEXTO_YARO.md:
   - NASA ASF Sentinel-1 GRD_HD GeoJSON sobre (-99.82, 16.85) del 2023-10-10 al 2023-11-05.
   - NASA CMR OPERA_L2_RTC-S1_V1 y OPERA_L3_DSWX-S1_V1 sobre el bbox [-100.30, 16.50, -99.30, 17.20] del 2023-10-10 al 2023-11-05.
   - Open-Meteo ERA5 diario (temperature_2m_max, relative_humidity_2m_mean, precipitation_sum, wind_speed_10m_max, wind_gusts_10m_max, soil_moisture_0_to_7cm_mean, cloud_cover_mean) del 2023-10-10 al 2023-11-05.

2. Con esos datos reales, genera 2 archivos limpios:
   - dataset_compatibilidad_elnino.csv: una fila por día (2023-10-10 a 2023-11-05) con todas las variables ERA5, el valor de contexto NOAA ONI (+1.8 C) y una columna booleana + sceneName indicando qué días hubo pasada real de Sentinel-1.
   - reporte_compatibilidad_elnino.json: resumen técnico para Samu:
     * total_escenas_sentinel1 y lista ordenada con los intervalos exactos Δt en días entre pasadas consecutivas (para T-SAR-JEPA), polarización y url browse pública.
     * total_granulos_opera por producto (RTC-S1 y DSWx-S1), reportando 0 si alguno no cubre oct 2023 en esa zona.
     * porcentaje_nulos_era5 por variable.
     * picos_reales (lluvia máxima diaria, racha máxima de viento, humedad del suelo pre/post ciclón y cobertura nubosa % durante el impacto del 24–26 oct 2023).

3. Ejecuta python3 data_elnino_ciclon/analizar_compatibilidad_elnino.py y verifica que genera los archivos con datos reales (si falla la red, avísame sin inventar cifras).

4. Redacta informe_viabilidad_elnino.md en español respondiendo claramente para Samu:
   - ¿Están las pasadas SAR Sentinel-1 bien situadas antes y después del impacto (con Δt compatible con T-SAR-JEPA)?
   - ¿Qué diferencia física muestran lluvia, viento, nubosidad y humedad del suelo en ERA5 antes vs después del evento?
   - Veredicto objetivo: ¿con qué fuente radar (ASF Sentinel-1 vs OPERA) y qué variables climáticas es 100% viable trabajar sin complicarnos la vida?
```
