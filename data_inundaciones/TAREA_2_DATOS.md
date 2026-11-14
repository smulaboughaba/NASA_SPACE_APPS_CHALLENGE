# Tarea 2 — Extracción Open Data DANA Valencia (`data_inundaciones/`)

## Objetivo
Consultar en vivo la API abierta **Open-Meteo ERA5 (sin API key)** para las fechas de la **DANA de Valencia (oct–nov 2024)**, guardar un dataset ligero limpio y redactar un análisis explicando cómo la lluvia + elevación DEM valida las detecciones SAR.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md.
Trabaja ÚNICAMENTE dentro de la carpeta data_inundaciones/ (no modifiques ningún archivo fuera de ella).

Crea dentro de data_inundaciones/:
1. Un script Python llamado extraer_lluvia_dana.py (usando solo librerías estándar urllib.request, json y csv para no requerir pip install) que:
   - Lea las coordenadas center_coords ([39.42, -0.42]) y el rango temporal del evento dana-valencia-2024 (2024-10-25 a 2024-11-02).
   - Consulte sin clave la URL de Open-Meteo ERA5:
     https://archive-api.open-meteo.com/v1/archive?latitude=39.42&longitude=-0.42&start_date=2024-10-25&end_date=2024-11-02&daily=precipitation_sum,rain_sum,wind_speed_10m_max&timezone=Europe%2FMadrid
   - Guarde los resultados diarios en lluvia_dana_valencia.csv y un resumen agregado en resumen_lluvia_dana.json (día pico, acumulado total, comparación con t0_pre=2024-10-19, t1_event=2024-10-29, t2_post_sar=2024-10-31).
2. Ejecuta extraer_lluvia_dana.py para comprobar que genera el CSV y el JSON sin errores con datos reales (si hay fallo de red en este entorno, indícamelo claramente sin inventar números).
3. Redacta analisis_inundaciones.md en español explicando, con los datos extraídos y FUENTES_Y_CONTEXTO_HUGO.md, cómo la caída de backscatter SAR (-6.8 dB) se valida cruzando precipitación acumulada + baja pendiente DEM para evitar falsos positivos urbanos.
```
