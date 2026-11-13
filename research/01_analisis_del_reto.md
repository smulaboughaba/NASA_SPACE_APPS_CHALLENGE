# Análisis del Reto — NASA Space Apps Challenge

> **Código:** `RES-01`  
> **Fase:** Fase 1 — Investigación, Reto y Datos NASA  
> **Estado:** En preparación (Base completada)  

---

## 1. Identificación del Challenge Oficial

- **Nombre del proyecto:** **Dancing with the SAR's**
- **Challenge de referencia NASA Space Apps:** *Through the Radar Looking Glass: Revealing Earth Processes with SAR* (y desafíos oficiales centrados en datos **SAR / NISAR**).
- **Categoría:** Earth Observation / Synthetic Aperture Radar (SAR) / Data Visualization & Science.
- **Portales oficiales de referencia:**
  - NASA Space Apps Challenge: https://www.spaceappschallenge.org/
  - Misión NISAR (NASA JPL): https://nisar.jpl.nasa.gov/
  - Documentación ASF NISAR: https://nisar-docs.asf.alaska.edu/worldview/

---

## 2. Especificaciones Técnicas Oficiales de la Tecnología NISAR / SAR

La misión **NISAR (*NASA-ISRO Synthetic Aperture Radar*)** es la primera misión satelital radar de **doble frecuencia** en una misma plataforma espacial, combinando un radar de **Banda L** desarrollado por NASA (JPL) y un radar de **Banda S** desarrollado por ISRO (SAC).

### 2.1. Parámetros Técnicos Corroborados

| Especificación | Banda L (NASA JPL) | Banda S (ISRO) |
| :--- | :--- | :--- |
| **Frecuencia central** | ~1.25 GHz (`1.258 GHz`) | ~3.2 GHz |
| **Longitud de onda ($\lambda$)** | **24 cm** | **9.4 cm** |
| **Capacidad de penetración** | Alta: atraviesa el dosel arbóreo y vegetación densa hasta tronco y suelo | Media/baja: interactúa con hojas, tallos y rugosidad superficial |
| **Aplicaciones físicas óptimas** | Bosques/biomasa, humedad del suelo, deformación sólida terrestre (InSAR), criosfera/glaciares | Agricultura y cultivos, vegetación ligera, cambios rápidos superficiales |
| **Archivo y distribución oficial** | **NASA ASF DAAC** (libre y abierto) | Plataforma **ISRO Bhoonidhi** |

### 2.2. Arquitectura y Órbita del Satélite

- **Técnica `SweepSAR` (*Scan-on-Receive*):** Utiliza un reflector desplegable de malla metálica de **12 metros** de diámetro montado en un brazo de **9 metros**, permitiendo cubrir franjas muy anchas sin sacrificar resolución espacial.
- **Ancho de barrido (*Swath*):** **> 240 km** (~242 km).
- **Resolución espacial:** Entre **3 y 10 metros** según modo operativo (alta precisión para cartografía de desastres e infraestructuras).
- **Órbita y ciclo de repetición:** Órbita polar heliosíncrona amanecer-atardecer (~747 km de altitud) con **ciclo de repetición exacta de 12 días** (observación media cada ~6 días combinando pasadas ascendentes y descendentes).
- **Polarimetría:** Modos Single, Dual y Quad-pol (`HH`, `HV`, `VV`, `VH`).

---

## 3. Validación Científica de Nuestro Enfoque

El planteamiento recogido en nuestra pizarra coincide plenamente con la física oficial del radar de apertura sintética:

1. **Por qué SAR frente a satélites ópticos en catástrofes:**
   - Al ser un **sensor activo de microondas**, emite su propio pulso y mide el retorno; **no depende de la luz solar** (funciona de día y de noche) y **atraviesa nubes densas y columnas de humo**, justo cuando los sensores ópticos quedan ciegos durante una **DANA**, un **ciclón** o un **gran incendio**.
2. **Por qué `InSAR` + `Backscatter` + `Polarización` cubren los 7 intereses propuestos:**
   - **`Backscatter` (amplitud):** El agua en calma (inundaciones de una DANA) actúa como espejo especular que desvía la señal fuera del sensor generando valores muy bajos (oscuros), facilitando su detección precisa.
   - **`Polarización` (`HH/HV/VV/VH`):** Diferencia la dispersión volumétrica de copas de árboles (deforestación / incendios) frente a la dispersión superficial o de doble rebote en zonas urbanas inundadas y cultivos.
   - **`InSAR` (diferencia de fase):** Compara pasadas repetidas para medir deformaciones centimétricas/milimétricas en **terremotos**, **deslizamientos de terreno** y flujo de **glaciares**.

---

## 4. Resumen del Problema y Objetivos del Proyecto

- **Problema:** Los datos SAR contienen información crítica para gestionar crisis climáticas y geológicas, pero sus formatos técnicos (`RSLC`, `GSLC`, interferogramas complejos) resultan inaccesibles para técnicos locales, divulgadores y ciudadanía.
- **Objetivo principal:** Construir una **Web App interactiva** que traduzca la física SAR/NISAR (`InSAR`, `Backscatter`, `Polarización`) en visualizaciones comprensibles y la cruce con **Open Data** de campo mediante **Ciencia de Datos** sobre **sucesos históricos reales** (de escala **Local** como DANA/Incendios a **Global** como Ciclones/El Niño).

---

## 5. Alineación con los 5 Criterios del Jurado NASA

| Criterio | Qué evalúa el jurado | Cómo lo cubriremos en *Dancing with the SAR's* |
| :--- | :--- | :--- |
| **Impact** (Impacto) | Alcance social, ambiental o operativo real de la solución. | Mostrar cuánto terreno, cultivo, bosque o población se ve afectada usando casos de alto impacto (DANA, incendios, ciclones). |
| **Creativity** (Creatividad) | Originalidad en la experiencia y enfoque multidisciplinar. | Narrativa interactiva *Local ➔ Global* uniendo física SAR con Big/Open Data de campo en una interfaz visual intuitiva. |
| **Validity** (Validez) | Rigor científico, viabilidad técnica y uso correcto de datos NASA. | Uso de productos oficiales NASA (ASF DAAC, OPERA, datos simulados NISAR/UAVSAR/ALOS/Sentinel-1) sin inventar datos históricos y respetando las specs reales de Banda L y S. |
| **Relevance** (Relevancia) | Respuesta directa a la temática del reto SAR/NISAR. | Explicación y demostración práctica directa de `Backscatter`, `Polarización`, `InSAR` y dual-band `L/S`. |
| **Presentation** (Presentación) | Claridad del storytelling, demo funcional y comunicación. | Demo rápida y sin latencia apoyada en sucesos históricos reales verificados y visualizaciones antes/durante/después. |
