# Fuentes y Contexto Científico para Hugo (Inundaciones DANA + Mapa SAR)

> **Archivo de solo lectura.** Resume la física SAR y las fuentes **sin registro ni API key** que necesitas para `frontend_mapa/` y `data_inundaciones/`.

---

## 1. Física Radar SAR aplicada a Inundaciones (El problema de las nubes)
- Durante la **DANA de Valencia (29–31 de octubre de 2024)**, las nubes convectivas impidieron ver el terreno con cámaras ópticas tradicionales durante el pico de la riada.
- El radar **SAR** emite su propia señal de microondas y atraviesa nubes, lluvia y oscuridad:
  - **Reflexión especular en agua en calma:** La lámina de agua actúa como un espejo que desvía el haz radar lejos del satélite. En la imagen SAR se traduce en una **caída brusca del backscatter** (`mean_backscatter_drop_db: -6.8` dB en `dana-valencia-2024`).
  - **Doble rebote urbano / vegetación inundada:** En calles o zonas con obstáculos parcialmente anegados, la señal rebota dos veces (agua ➔ pared/tronco ➔ satélite) aumentando el retorno.
- **¿Por qué fusionamos SAR con Open Data?** Un radar solo puede confundir carreteras mojadas, techos planos o sombras de montaña con agua. Al cruzarlo con **precipitación acumulada** y **modelo digital de elevaciones (DEM / pendiente baja)**, reducimos drásticamente los falsos positivos (`false_positive_reduction_pct: 34.2%`) como quedó demostrado en la activación oficial **Copernicus EMSR773**.

---

## 2. API Abierta Sin Clave para Tu Script (`data_inundaciones/`)

En lugar de perder tiempo pidiendo tokens en AEMET, usamos **Open-Meteo Historical Weather API (datos Copernicus ERA5, 100% gratuita y sin API key)**:

- **Endpoint exacto listo para copiar en Python (`dana-valencia-2024`):**
  ```text
  https://archive-api.open-meteo.com/v1/archive?latitude=39.42&longitude=-0.42&start_date=2024-10-25&end_date=2024-11-02&daily=precipitation_sum,rain_sum,wind_speed_10m_max&timezone=Europe%2FMadrid
  ```
- **Variables devueltas en JSON:**
  - `daily.time`: fechas de `2024-10-25` a `2024-11-02`
  - `daily.precipitation_sum`: precipitación total diaria (mm)
  - `daily.rain_sum`: lluvia líquida diaria (mm)
  - `daily.wind_speed_10m_max`: racha/viento máximo diario a 10 m (km/h)

---

## 3. Enlaces Oficiales NASA (Sin Registro / Solo Consulta Visual)
- **NISAR StoryMaps (caso inundaciones / Floods):** https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/
- **UAVSAR Postcards (imágenes Banda L en falso color):** https://uavsar.jpl.nasa.gov/education/postcards.html
- **Intro to SAR (explicación backscatter y polarización):** https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar

> **No pierdas tiempo buscando cuentas externas (`CONAE SAOCOM`, `CSA`, `AEMET`):** Samu centraliza la descarga satelital pesada (`.tif` COG / `.h5`) en el backend.
