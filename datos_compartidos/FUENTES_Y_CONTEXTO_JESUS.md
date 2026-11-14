# Fuentes y Contexto Científico para Jesús (Storytelling, InSAR y Escala Global)

> **Archivo de solo lectura.** Resume la física de InSAR/SweepSAR, la narrativa Local ➔ Global, los enlaces NASA sin registro, la API sísmica sin clave y las atribuciones legales obligatorias.

---

## 1. Narrativa del Proyecto: ¿Por qué Sucesos Históricos y Escala Local ➔ Global?
1. **Ventaja de los sucesos históricos reales:** Cero latencia de espera de satélites, datos oficiales reales ya validados y mejor entrenamiento/explicabilidad para enseñar al público qué ocurrió.
2. **Viaje narrativo *Local ➔ Global*:**
   - **Escala Local:** **DANA Valencia 2024** (`dana-valencia-2024`, inundaciones bajo nubes convectivas) + **Incendio Forestal Mediterráneo** (`incendio-forestal-mediterraneo`, bosque quemado bajo humo).
   - **Escala Global:** **Terremoto Falla de Anatolia 2023** (`terremoto-insar-global`, deformación de la corteza terrestre medida con InSAR) + **Ciclón Tropical y El Niño** (`ciclon-elnino-global`, impacto costero masivo vigilado gracias al ancho de barrido **SweepSAR > 240 km** de NISAR).

---

## 2. Física Clave: InSAR y Coherencia
- **InSAR (Interferometría SAR):** Compara la **fase** de la onda radar entre una imagen previa (`t0_pre`) y otra posterior al sismo (`t2_post_sar`) para medir desplazamientos de la tierra de **milímetros o centímetros** (`max_los_displacement_cm: 140.0` cm en el evento de referencia).
- **Pérdida de coherencia urbana:** Cuando un edificio o calle se derrumba o agrieta bruscamente, la señal radar pierde estabilidad entre ambas fechas; cruzar esa pérdida de coherencia con la distancia al epicentro (**USGS**) localiza zonas críticas.

---

## 3. API Abierta Sin Clave para Tu Script (`data_global_insar/`)

**USGS Earthquake Hazards GeoJSON API (100% abierta, sin registro ni API key):**
- **URL exacta para terremotos reales de referencia histórica (`terremoto-insar-global`, Mw ≥ 6.0, feb 2023):**
  ```text
  https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2023-02-05&endtime=2023-02-08&minmagnitude=6.0
  ```
- **Campos del GeoJSON (`features[]`):** `properties.mag` (magnitud), `properties.place` (lugar), `properties.time` (timestamp ms) y `geometry.coordinates` (`[lon, lat, depth_km]`).

---

## 4. Enlaces NASA Oficiales (Sin Registro) y Disclaimer Legal
- **Intro to SAR (glosario visual):** https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar
- **NASA ARSET Trainings (material en español e inglés):** https://appliedsciences.nasa.gov/get-involved/training
- **NISAR Applications White Papers (impacto social):** https://nisar.jpl.nasa.gov/applications/societal-benefit/
- **UAVSAR Postcards (ejemplos Banda L):** https://uavsar.jpl.nasa.gov/education/postcards.html

**Regla legal (Disclaimer NASA):** Podemos usar fuentes abiertas externas (`ESA Copernicus`, `USGS`, `Open-Meteo ERA5`, `NOAA`, `OpenStreetMap`) siempre que **mostremos visiblemente sus atribuciones en la Web App** y aclaremos que NASA no respalda entidades no gubernamentales de EE. UU.
