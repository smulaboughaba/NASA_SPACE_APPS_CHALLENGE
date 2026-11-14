# Fuentes y Contexto Científico para Yaro (Analítica, Incendios y Cultivos)

> **Archivo de solo lectura.** Resume la física SAR (Banda L vs Banda S), explicabilidad SHAP y las fuentes **sin API key** para `frontend_analytics/` y `data_incendios_cultivos/`.

---

## 1. Física Radar SAR: L-Band vs S-Band + Polarización Cruzada (`HV`/`VH`)
- **Banda L (24 cm — NASA JPL en NISAR):** Longitud de onda larga capaz de atravesar las copas de los árboles y rebotar contra troncos, ramas y suelo. Es clave en **bosques e incendios** (`incendio-forestal-mediterraneo`): al quemarse el dosel y perder estructura volumétrica, cae bruscamente la polarización cruzada **`HV` / `VH`** (`mean_backscatter_drop_db: -3.4` dB).
- **Banda S (9.4 cm — ISRO en NISAR):** Longitud de onda más corta, muy sensible a hojas, rugosidad del terreno y **tallos de cultivos**. Ideal para distinguir entre un **cultivo cosechado/seco** y un **incendio forestal**.
- **Por qué fusionamos SAR + Open Data (Explicabilidad SHAP):** El radar por sí solo detecta pérdida de vegetación, pero no distingue fácilmente una tala o sequía severa de un incendio activo bajo humo denso. Al cruzar con **calor térmico (`NASA FIRMS`)**, **temperatura máxima, baja humedad y viento (`Open-Meteo ERA5`)** y **pendiente DEM**, eliminamos falsos positivos (`false_positive_reduction_pct: 28.5%`) y obtenemos alertas de **riesgo de deslizamiento post-fuego**.

---

## 2. API Abierta Sin Clave para Tu Script (`data_incendios_cultivos/`)

Usamos **Open-Meteo Historical Weather API (datos Copernicus ERA5, sin API key ni registro)** con las fechas y coordenadas del evento `incendio-forestal-mediterraneo` (`[39.95, -0.58]`, marzo de 2023):

- **Endpoint exacto listo para copiar en Python:**
  ```text
  https://archive-api.open-meteo.com/v1/archive?latitude=39.95&longitude=-0.58&start_date=2023-03-10&end_date=2023-03-31&daily=temperature_2m_max,relative_humidity_2m_mean,wind_speed_10m_max,precipitation_sum&timezone=Europe%2FMadrid
  ```
- **Variables devueltas en JSON:**
  - `daily.temperature_2m_max`: temperatura máxima diaria (°C)
  - `daily.relative_humidity_2m_mean`: humedad relativa media (%) — clave para sequedad extrema
  - `daily.wind_speed_10m_max`: viento máximo diario a 10 m (km/h) — clave para propagación
  - `daily.precipitation_sum`: lluvia diaria (mm)

---

## 3. Enlaces Oficiales NASA (Sin Registro)
- **NASA FIRMS Active Fire (descarga web directa de CSV públicos de focos térmicos):** https://firms.modaps.eosdis.nasa.gov/active_fire/
- **NISAR StoryMaps (Wildfires & Agriculture):** https://nisar.jpl.nasa.gov/applications/arcgis-storymaps/
- **NISAR Applications White Papers:** https://nisar.jpl.nasa.gov/applications/societal-benefit/

> **No pierdas tiempo buscando cuentas externas (`CONAE SAOCOM`, `CSA`, `AEMET`):** Trabaja solo con `Open-Meteo ERA5`, `NASA FIRMS` (CSV abierto) y `mock_events_contract.json`.
