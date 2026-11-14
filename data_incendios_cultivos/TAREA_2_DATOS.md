# Tarea 2 — Extracción Clima/Incendios y Análisis L vs S (`data_incendios_cultivos/`)

## Objetivo
Consultar en vivo **Open-Meteo ERA5 (sin API key)** para la ventana temporal del incendio mediterráneo (`2023-03-10` a `2023-03-31`), generar archivos limpios CSV/JSON y redactar cómo la fusión climática + térmica (`NASA FIRMS`) evita falsos positivos frente a sequía de cultivos.

---

## Prompt listo para copiar y pegar en Claude Code
```text
Lee CLAUDE.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md.
Trabaja ÚNICAMENTE dentro de la carpeta data_incendios_cultivos/ (no modifiques ningún archivo fuera de ella).

Crea dentro de data_incendios_cultivos/:
1. Un script Python llamado extraer_clima_incendios.py (usando solo librería estándar urllib.request, json y csv, sin dependencias externas) que:
   - Consulte sin API key la URL de Open-Meteo ERA5 para el evento incendio-forestal-mediterraneo ([39.95, -0.58]):
     https://archive-api.open-meteo.com/v1/archive?latitude=39.95&longitude=-0.58&start_date=2023-03-10&end_date=2023-03-31&daily=temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_max,precipitation_sum&timezone=Europe%2FMadrid
   - Guarde la serie diaria en clima_incendio_era5.csv y un resumen estadístico en resumen_clima_incendio.json (días más secos/ventosos, temperatura máxima, humedad mínima, y comparación entre t0_pre=2023-03-10, t1_event=2023-03-23 y t2_post_sar=2023-03-31).
2. Ejecuta extraer_clima_incendios.py para comprobar que descarga y genera ambos archivos con datos reales (si no hay red disponible aquí, indícamelo sin inventar datos).
3. Redacta analisis_incendios_cultivos.md en español explicando, con base en FUENTES_Y_CONTEXTO_YARO.md y los datos descargados, cómo distinguir cicatriz de incendio forestal (Banda L + pérdida HV/VH + focos NASA FIRMS + viento/baja humedad) de un cambio normal o sequía en cultivos (Banda S).
```
