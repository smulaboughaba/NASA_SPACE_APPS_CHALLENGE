# Tarea 1 (Prioridad #1) — Estudio de Compatibilidad de Datos LA 2025 (`data_sequia_incendios_la/`)

## Objetivo
**NO tienes que programar ningún modelo de IA.** Tu misión es realizar un **análisis real de datos (EDA de compatibilidad)** consultando en vivo las 4 fuentes de Los Ángeles (dic 2024 – ene 2025), cruzarlas por fecha, detectar qué parámetros están completos y sin problemas, y dejarle a Samu el veredicto técnico listo en `informe_viabilidad_la.md`.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md.
Trabaja ÚNICAMENTE dentro de la carpeta data_sequia_incendios_la/ (NO modifiques CLAUDE.md, datos_compartidos/ ni nada fuera de esta carpeta).
OJO: NO programes ni entrenes modelos de IA (ni PyTorch ni LightGBM). Solo análisis y verificación de compatibilidad de datos con Python estándar.

Haz esto dentro de data_sequia_incendios_la/:
1. Crea el script analizar_compatibilidad_la.py usando SOLO librerías estándar (urllib.request, json, csv, datetime) que consulte en vivo todas las URLs sin API key descritas en FUENTES_Y_CONTEXTO_HUGO.md:
   - NASA ASF Sentinel-1 GRD_HD GeoJSON sobre Los Ángeles (-118.54, 34.07) del 2024-12-25 al 2025-01-25.
   - NASA CMR OPERA_L2_RTC-S1_V1, OPERA_L3_DIST-ALERT-HLS_V1 y OPERA_L3_DISP-S1_V1 sobre el bbox [-118.70, 33.95, -117.95, 34.30].
   - Open-Meteo ERA5 diario (temperature_2m_max, relative_humidity_2m_mean, wind_speed_10m_max, wind_gusts_10m_max, precipitation_sum, soil_moisture_0_to_7cm_mean, cloud_cover_mean) del 2024-12-25 al 2025-01-25.
   - Open-Meteo Air Quality CAMS horario (pm2_5, pm10, carbon_monoxide, nitrogen_dioxide, aerosol_optical_depth) del 2025-01-01 al 2025-01-25, agregando por fecha el máximo diario de cada gas/partícula.

2. Con esos datos descargados en vivo, el script debe generar 2 salidas limpias:
   - dataset_compatibilidad_la.csv: una fila por día (2024-12-25 a 2025-01-25) con clima/sequía ERA5, máximos diarios de CO/NO2/PM2.5/PM10/AOD y una columna booleana + sceneName indicando qué días hubo pasada real de Sentinel-1.
   - reporte_compatibilidad_la.json: resumen objetivo de compatibilidad para el futuro pipeline de Samu:
     * total_escenas_sentinel1 y lista ordenada de fechas con el cálculo exacto de intervalos Δt en días entre pasadas consecutivas (para el encoder temporal de T-SAR-JEPA), incluyendo polarización y url browse pública.
     * total_granulos_opera por producto (RTC-S1, DIST-ALERT-HLS y DISP-S1 de deformación).
     * porcentaje_nulos_era5 y porcentaje_nulos_gases por variable.
     * valores_extremos_reales (mínima humedad relativa, humedad media del suelo, racha máxima Santa Ana, pico de CO, PM2.5, NO2 y AOD con sus fechas exactas).

3. Ejecuta python3 data_sequia_incendios_la/analizar_compatibilidad_la.py y verifica los números reales (si alguna URL fallara por red, repórtamelo sin inventar datos).

4. Redacta informe_viabilidad_la.md en español respondiendo claramente para Samu:
   - ¿Hay suficientes pasadas SAR pre, durante y post incendio con Δt regulares?
   - ¿Qué parámetros (sequía del suelo, humedad 12%, vientos Santa Ana, CO, PM2.5, AOD, DISP-S1) resultaron 100% completos, fiables y discriminativos, y cuáles conviene descartar o dejar como secundarios para no complicar el proyecto?
   - ¿Es compatible este caso con el pipeline Nivel 1 (SAR Δt + deformación) + Nivel 2 (clima + gases)?
```
