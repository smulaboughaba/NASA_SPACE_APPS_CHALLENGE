# Estado del Arte y Solución Propuesta — Dancing with the SAR's

> **Código:** `RES-03`  
> **Fase:** Fase 1 — Investigación, Reto y Datos NASA  
> **Estado:** En preparación (Base completada)  

---

## 1. Análisis de Soluciones Previas (Estado del Arte)

| Solución / Herramienta existente | Qué hace bien | Limitación o brecha que resolvemos |
| :--- | :--- | :--- |
| **Visores ópticos convencionales** *(Google Earth, Sentinel-2 óptico, MODIS)* | Imágenes intuitivas en color real fáciles de leer por cualquier usuario. | **Quedan ciegos bajo nubes densas, tormentas (DANA / ciclones), humo de incendios y oscuridad nocturna**, justo en el momento crítico del desastre. |
| **Portales técnicos SAR** *(ASF Vertex, ESA SNAP, NASA Earthdata Search)* | Acceso completo a datos científicos radar en bruto y productos complejos (`RSLC`, `GSLC`, interferogramas). | **Curva de aprendizaje muy alta**: requieren conocimientos avanzados de procesado radar y no ofrecen narrativa visual ni cruce inmediato con datos de campo. |
| **Cuadros de mando de emergencias locales** *(portales meteo o hidrológicos)* | Buena información puntual de lluvia, viento o sismos en superficie. | **Desconectados de la observación física satelital SAR**: muestran cuánto llovió o tembló, pero no el impacto exacto en la superficie bajo cobertura nubosa. |

---

## 2. Nuestra Propuesta de Solución: *Dancing with the SAR's*

- **Concepto en una frase (*Elevator Pitch*):**  
  Una **Web App interactiva de Ciencia de Datos** que traduce los datos radar **SAR/NISAR** (`Backscatter`, `Polarización`, `InSAR` en Banda L y S) y los cruza con **Open Data de campo** sobre **sucesos históricos reales** para explicar, cuantificar y correlacionar desastres desde lo **Local** (DANA, incendios) hasta lo **Global** (ciclones, El Niño).

- **Arquitectura de flujo de extremo a extremo:**
  1. **Ingesta SAR Oficial (`NASA ASF DAAC / OPERA`):** Capas históricas georreferenciadas (antes / durante / después) con productos ya corregidos (`OPERA DSWx`, `OPERA DISP`, `OPERA DIST`, `RTC`, `ALOS/UAVSAR`).
  2. **Fusión con Open Data de Campo (`dev/data_science/`):** Cruce espacial y temporal con precipitación (AEMET/ERA5), topografía (SRTM), usos del suelo (WorldCover/CORINE), focos térmicos (FIRMS), sismos (USGS) e infraestructuras (OSM).
  3. **Motor de Relaciones y Métricas:** Cálculo de correlaciones estadísticas, porcentaje de superficie afectada por tipo de suelo/cultivo y anomalías detectables por banda (`L` vs `S`) y polarización.
  4. **Web App Interactiva (`dev/frontend/`):** Visor comparativo tipo cortina/línea temporal con modo educativo (*"¿Qué ve el óptico frente a qué ve el SAR?"*) y gráficas de análisis de datos.

---

## 3. Diferenciación y Valor Añadido

1. **Doble capa de valor (Visualización + Ciencia de Datos):** No somos solo un mapa bonito; descubrimos relaciones cuantitativas cruzando radar con Open Data de campo.
2. **Estrategia de Demo sin latencia ni riesgos:** Al apoyarse en **sucesos históricos verificados**, permite trabajar con datasets limpios, validar modelos contra verdad de campo (*ground truth*) y ofrecer respuesta instantánea en la demo.
3. **Hilo narrativo de alto impacto (*Local ➔ Global*):** Conecta al jurado y al público con tragedias cercanas (**DANA**, **Incendios**) antes de demostrar que la misma tecnología escala a fenómenos planetarios (**Ciclones**, **El Niño**).
4. **Pedagogía SAR incorporada:** Explica de forma visual e intuitiva cómo operan la **Banda L (24 cm)**, la **Banda S (9.4 cm)**, la **polarización** y el **InSAR**.

---

## 4. Alcance MVP para el Hackathon (sujeto a ajuste en Fase 2)

### Incluido en el MVP (imprescindible para la demo)
- [ ] Visor web interactivo con comparador **Antes / Durante / Después** y **Óptico (nubes/humo) vs SAR**.
- [ ] **1–2 Casos Locales profundos** (p. ej. **DANA / Inundación** e **Incendio**) con cruce real **SAR + Open Data de campo** (lluvia/relieve/usos del suelo o focos FIRMS/viento).
- [ ] **1 Caso Global de escalabilidad** (p. ej. **Ciclón** o **El Niño** / deformación **InSAR** en terremoto).
- [ ] Panel analítico de Ciencia de Datos con métricas calculadas y correlaciones exportables/visuales.

### Fuera de alcance del MVP (trabajo futuro post-hackathon)
- Procesamiento en tiempo real de escenas `Level 0B/RSLC` crudas bajo demanda del usuario en el navegador.
- Cobertura automática global en vivo de los 7 dominios con modelos predictivos pesados entrenados desde cero.
