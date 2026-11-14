# Formatos Oficiales SAR y Arquitectura de Modelos de IA (`T-SAR-JEPA` vs. Alternativas SOTA)

> **Código:** `RES-05`  
> **Fase:** Fase 1 / Transición a Fase 2 (Arquitectura de Modelos y Datos)  
> **Objetivo:** Determinar los formatos reales de entrega SAR en NASA Space Apps, evaluar sin sesgos `T-SAR-JEPA` frente a otras arquitecturas SOTA y definir qué debe hacer el modelo al comunicarse con fuentes Big Data / Open Data en los 7 nichos de aplicabilidad.  
> **Estado:** En preparación (Base completada)  

---

## 1. Formatos Oficiales de Datos SAR en NASA Space Apps

En el ecosistema oficial de la NASA (**NISAR**, **NASA JPL OPERA** y **ASF DAAC**) los datos SAR llegan en **dos grandes formatos** según el nivel de procesado que elijamos:

### 1.1. Formato 1: `HDF5 (.h5)` — Estándar nativo de NISAR (Level 1 y Level 2)

Todos los productos científicos estándar de **NISAR** se distribuyen en archivos jerárquicos **HDF5 (`.h5`)** organizados internamente bajo `/science/LSAR/` (Banda L) y `/science/SSAR/` (Banda S), empaquetando matrices de radar complejas, múltiples polarizaciones, vectores de órbita y metadatos de proyección UTM o estereográfica polar.

| Producto NISAR | Nivel | Contenido físico exacto | Ruta interna típica en `.h5` | Uso en nuestro modelo |
| :--- | :---: | :--- | :--- | :--- |
| **`GCOV`** *(Geocoded Polarimetric Covariance)* | L2 | Matrices de covarianza polarimétrica corregidas radiométrica y topográficamente ($\gamma^0$) sobre rejilla UTM. | `/science/LSAR/GCOV/grids/frequencyA/{HH,HV,VV,VH}` | **Fuente directa para formar *amplitude/power stacks*** multi-fecha en Banda L/S. |
| **`GUNW`** *(Geocoded Unwrapped Interferogram)* | L2 | Campo de desplazamiento en línea de visión (LOS) tras fase desenvuelta + capa de coherencia InSAR. | Grupos de fase desenvuelta y coherencia | Entrada directa para **terremotos**, **deslizamientos** y **glaciares**. |
| **`GSLC`** *(Geocoded Single Look Complex)* | L2 | Imágenes complejas (`real + imag`, amplitud y fase preservadas) en rejilla geográfica (~5×5 m o 5×10 m). | Grupos por frecuencia y polarización | Útil si se requiere interferometría personalizada; más pesado que `GCOV`. |

- **Lectura estándar en Python:** `h5py`, `xarray` y `GDAL/rasterio` (para extraer las subcapas `.h5` y reproyectarlas si hace falta).

### 1.2. Formato 2: `Cloud-Optimized GeoTIFF (.tif / COG)` — Estándar Analysis-Ready de NASA JPL `OPERA` y `ASF HyP3`

A diferencia del `.h5` monolítico de NISAR, los productos operativos de **NASA JPL `OPERA`** (y los derivados de **Sentinel-1 / ALOS** procesados vía **ASF HyP3**) vienen como **Cloud-Optimized GeoTIFF (`.tif`)** en teselas UTM estandarizadas ($109.8\text{ km} \times 109.8\text{ km}$ a **30 m** uniformes, $3660 \times 3660$ px, con pirámides internas para lectura parcial por rango HTTP sin descargar todo el archivo):

| Producto `OPERA` | Nivel | Contenido exacto en `.tif` (COG) | Uso recomendado |
| :--- | :---: | :--- | :--- |
| **`OPERA RTC-S1`** | L2 | *Backscatter* $\gamma^0$ corregido topográficamente, entregado como `.tif` separado por polarización (`VV`, `VH`) + ángulo de incidencia y máscara de *layover/shadow*. | **Base perfecta para construir pilas de amplitud `(T, C, H, W)`** listas para el modelo sin sufrir distorsiones de montaña. |
| **`OPERA DSWx`** | L3 | Máscara de agua superficial dinámica + capa de confianza + máscara de cobertura y sombras. | Referencia y verdad operativa en **Inundaciones / DANA**. |
| **`OPERA DISP`** | L3 | Series temporales de desplazamiento superficial `InSAR` (mm/cm). | Entrada limpia para **Terremotos / Subsidencia / Glaciares**. |
| **`OPERA DIST`** | L3 | Perturbación de cobertura y vegetación (delta temporal). | Señal base para **Incendios / Deforestación**. |

### 1.3. Contrato de Entrada al Modelo (Estandarización a Tensor)

Independientemente de si el archivo origen es un `.h5` de NISAR/UAVSAR o un `.tif` (COG) de `OPERA / ASF`, nuestro pipeline de `dev/data_science/` los normalizará a un formato único de entrada:

$$X_{\text{SAR}} \in \mathbb{R}^{T \times C \times H \times W}, \quad \Delta t = [t_1 - t_0, \dots, t_{T-1} - t_{T-2}]$$

- **$T$**: número de pasadas ordenadas cronológicamente (ej. $T = 7\text{–}12$ en pilas temporales, o $T = 2$ en pares bi-temporales $T_{\text{pre}} / T_{\text{post}}$).
- **$C$**: canales normalizados en escala logarítmica ($\text{dB} = 10\log_{10}(\gamma^0)$) — p. ej. `VV`, `VH`, ratio `VH/VV` (o `HH`, `HV` en Banda L) + máscara de validez (*layover/shadow*) + capa de desplazamiento/coherencia `InSAR` cuando aplique.
- **$\Delta t$**: vector real de días transcurridos entre adquisiciones (crítico porque las órbitas SAR no siempre coinciden a intervalos fijos de 6 o 12 días).

---

## 2. Evaluación Sin Sesgos de Modelos SOTA (`T-SAR-JEPA` frente a Alternativas)

### 2.1. Análisis Objetivo de `T-SAR-JEPA` (*Woldesenbet & Woldesenbet, 2026 — `arXiv:2606.05700`*)

**Cómo funciona:**
1. Parte de un encoder **`ViT-Base/16`** procedente de **`SAR-JEPA`**, adaptado mediante reconstrucción local enmascarada con predicción de características de gradiente multi-escala (para evitar que el modelo memorice el ruido *speckle* del radar).
2. Toma pilas temporales de **solo amplitud SAR** ($K=7$ adquisiciones en el paper) evitando la complejidad del desenvolvimiento de fase InSAR.
3. Un **Temporal Transformer con codificación sinusoidal de intervalos $\Delta t$** predice el **estado latente futuro $\hat{z}_{t+1}$** a partir de las pasadas previas, entrenado con **descongelamiento progresivo (*progressive unfreezing*)**.
4. Mide anomalías como discrepancia en el espacio latente ($\|z_{t+1} - \hat{z}_{t+1}\|$), alcanzando un **77.0% ROC-AUC** en detección no supervisada de erupciones/cambios sobre datos del **IEEE GRSS Data Fusion Contest (DFC) 2026**, superando a RX, PaDiM, Linear AR y LSTM.

**Evaluación imparcial (Fortalezas vs. Limitaciones para nuestro hackathon):**

| Fortalezas reales de `T-SAR-JEPA` | Limitaciones reales si se usa aislado |
| :--- | :--- |
| ✅ **Inmune al *speckle***: al predecir en espacio latente y no píxel a píxel, ignora el ruido granular propio del SAR. | ❌ **Resolución espacial gruesa ($16 \times 16$ px por parche)**: sin un decodificador denso (tipo U-Net), no dibuja bordes precisos de calles inundadas o parcelas agrícolas. |
| ✅ **Sin etiquetas previas (*Self-Supervised*)**: detecta anomalías temporales sin requerir miles de máscaras etiquetadas a mano. | ❌ **Unimodal y agnóstico a la causa**: detecta *que algo cambió* en la serie de amplitud, pero **no distingue por sí solo** si el cambio es una inundación, un riego de cultivo o una tala, ni ingiere variables Big Data. |
| ✅ **Codificación sinusoidal de $\Delta t$**: maneja naturalmente intervalos irregulares entre pasadas de satélite. | ❌ **Coste de entrenamiento y dependencia de escala**: preentrenar `ViT-B/16` requiere GPU y grandes lotes de parches homogéneos; en un hackathon de días puede quedar sobre-ajustado si tenemos pocas escenas por caso. |

### 2.2. Comparativa Sin Sesgos de 5 Arquitecturas SOTA para SAR + Big Data

| Arquitectura / Enfoque | Qué hace mejor | Resolución de salida | ¿Acepta $\Delta t$ irregular? | ¿Acepta Big Data / Open Data? | Coste y viabilidad en Hackathon |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **1. `T-SAR-JEPA`** *(ViT-B/16 + Temporal Transformer)* | Detección no supervisada de **anomalías temporales** en pilas de amplitud puras sin etiquetas. | Parche ($16 \times 16$ px) | ✅ Sí (sinusoidal $\Delta t$) | ❌ No nativo (requiere módulo de fusión externo) | ⚠️ Media-Alta (sin pesos preentrenados del dominio concreto, exige GPU/tiempo). |
| **2. `U-TAE`** *(U-Net + Temporal Attention Encoder)* | Segmentación y detección temporal **densa píxel a píxel** en series de tiempo irregulares (cultivos, deforestación, agua). | **Píxel exacto** ($H \times W$) | ✅ Sí (sinusoidal $\Delta t$) | ⚠️ Fácil inyectar capas raster (`DEM`, `Land Cover`) como canales extra | ✅ Alta (arquitectura ligera, probada en series Sentinel-1/2). |
| **3. Redes Siamesas (`ChangeFormer` / `Siamese UNet`)** | Comparación bi-temporal rápida **`Pre (T0)` vs. `Post (T1)`** en eventos súbitos (DANA, incendio). | **Píxel exacto** ($H \times W$) | ❌ Diseñado para pares $(T_0, T_1)$ | ⚠️ Admite canales auxiliares raster (`DEM`) | ✅ Muy Alta (rápida de entrenar o usar en inferencia). |
| **4. Fundacionales EO (`Prithvi-EO 2.0` NASA-IBM / `CROMA` / `DOFA`)** | Backbones **ya preentrenados** en millones de parches EO (SAR+Óptico en `CROMA`/`DOFA`; HLS en `Prithvi`). | Densa con cabeza UPerNet / FPN | ⚠️ Adaptable según variante | ⚠️ Multimodal EO (radar + óptico + elevación) | ✅ Alta si se usan pesos abiertos congelados + cabeza ligera. |
| **5. Fusión Tabular/Espacial (`LightGBM / CatBoost + SHAP` o `FiLM / Cross-Attention`)** | Cruzar características SAR + **Big Data heterogéneo** (lluvia, viento, sismos, OSM) y dar **explicabilidad causal**. | Por píxel / celda / cuenca / parcela | ✅ Sí (features temporales explícitas) | ✅ **Nativo y óptimo** para Big Data tabular/geoespacial | ✅ Muy Alta (entrenamiento rápido en CPU/GPU, explicable con valores `SHAP` para el jurado). |

---

## 3. Definición del Modelo Recomendado: Arquitectura Híbrida de 2 Niveles

Tras comparar sin sesgos todas las opciones, usar **solo `T-SAR-JEPA` puro** nos daría un detector de anomalías de baja resolución desconectado del Big Data; mientras que usar **solo un modelo tabular** perdería la dinámica espacial y temporal del radar.

La solución óptima para *Dancing with the SAR's* es una **Arquitectura Híbrida de 2 Niveles** que conserva la intuición temporal de `T-SAR-JEPA` pero garantiza precisión espacial y comunicación directa con Big Data:

### Nivel 1 — Percepción SAR Temporal y Espacial (*Backbone Dual*)
Qué recibe y qué hace respecto a los datos SAR:
1. **Rama Temporal de Anomalía Latente (inspirada en `T-SAR-JEPA` / `U-TAE`):**
   - Recibe la pila de amplitud $X_{\text{SAR}} \in \mathbb{R}^{T \times C \times H \times W}$ y sus intervalos $\Delta t$ con codificación sinusoidal.
   - Puede emplear un **encoder ligero preentrenado** (`CROMA` / `DOFA` / `ResNet-U-Net` + atención temporal con $\Delta t$ y descongelamiento progresivo si se hace *fine-tuning*) para producir:
     - Un **Mapa de Anomalía Latente** $A_t(x,y) = \|z_t - \hat{z}_t\|_2$ (qué zonas rompieron su comportamiento temporal normal).
     - **Features físicas SAR explícitas**: $\Delta \gamma^0_{\text{VV}}$, $\Delta \gamma^0_{\text{VH/HV}}$, cociente de polarización cruzada (CR), textura local (GLCM/gradiente) y, donde exista, desplazamiento `InSAR` ($\Delta \phi$ / `OPERA DISP`).
2. **Rama de Segmentación / Máscara Base (`OPERA` + Refinamiento Espacial):**
   - Cuando existen productos L3 de NASA (`OPERA DSWx / DIST / DISP`), actúan como señal física de alta resolución o pseudo-etiqueta para supervisar/calibrar el modelo al píxel exacto.

### Nivel 2 — Motor de Fusión Multimodal `SAR ↔ Big Data` y Explicabilidad
Qué recibe y cómo se comunica con el Big Data:
- Toma para cada unidad espacial (píxel, micro-cuenca, parcela o malla hexagonal H3) el **vector de estado SAR del Nivel 1** y lo fusiona con el **vector de contexto Big Data / Open Data** (topografía `DEM`, meteorología `AEMET/ERA5/GPM`, focos `FIRMS`, cobertura `WorldCover/CORINE`, sismos `USGS`, viales/población `OSM`):
  - **En arquitecturas neuronales (si entrenamos finamente):** mediante bloques **FiLM (*Feature-wise Linear Modulation*)** o **Cross-Attention**, donde los datos climáticos/topográficos modulan las activaciones del mapa SAR (p. ej., *"suprime detecciones de agua si la pendiente DEM $> 10^\circ$"*).
  - **En el motor analítico de Ciencia de Datos (`LightGBM / CatBoost + SHAP`):** clasifica y cuantifica el impacto real del evento y genera automáticamente **atribución causal (`SHAP values`)** para la Web App (ej.: *"El 78% de la anomalía SAR en esta zona se explica por precipitación acumulada $>250\text{ mm}$ + cota $<15\text{ m}$ + suelo agrícola"*).

---

## 4. Comportamiento del Modelo y Comunicación `SAR ↔ Big Data` en los 7 Nichos

| # | Nicho de Aplicabilidad | Qué recibe del SAR (Nivel 1) | Qué recibe del Big Data / Open Data (Nivel 2) | Cómo interactúan y qué salida entrega a la Web App |
| :-: | :--- | :--- | :--- | :--- |
| **1** | **Inundaciones / DANA** *(Caso Local Principal)* | Pila `RTC-S1` (`VV`, `VH`, $\Delta \gamma^0_{\text{VV}}$) + `OPERA DSWx` + score de anomalía temporal latente respecto a pasadas secas `T0`. | • `DEM` (SRTM/Copernicus): pendiente, altitud relativa al cauce (`HAND`).<br>• Lluvia horaria (`AEMET`/`ERA5`/`GPM`).<br>• Uso del suelo + viales/edificios (`OSM`). | **Fusión:** El modelo cruza caída especular $\Delta \gamma^0$ con `HAND`/pendiente (eliminando sombras de montaña y asfalto) y correlaciona extensión inundada vs. lluvia acumulada.<br>**Salida:** Máscara depurada de inundación, m²/km² por tipo de suelo, infraestructuras cortadas y curva *Lluvia → Área inundada*. |
| **2** | **Incendios Forestales** *(Caso Local)* | `OPERA DIST` + pila `ALOS/UAVSAR` (`HV` Banda L) y `RTC-S1` (`VH/VV`) pre/durante/post humo + anomalía latente $\Delta z$. | • Focos activos `NASA FIRMS` (`VIIRS/MODIS`).<br>• Viento/temperatura/humedad (`ERA5`/`EFFIS`).<br>• Masa forestal (`CORINE`/`WorldCover`) + `DEM`. | **Fusión:** `FIRMS` ancla dónde hubo calor activo bajo el humo y la caída de polarización cruzada (`HV/VH`) mide qué estructura vegetal se perdió realmente.<br>**Salida:** Mapa de severidad de quema (baja/media/alta) + alerta de riesgo de flujo de lodo post-incendio en laderas con pendiente `DEM`. |
| **3** | **Deforestación** | Pilas temporales largas ($T \ge 6\text{–}12$) en **Banda L (`GCOV`/`ALOS` `HH/HV`)** + `OPERA DIST`; alta persistencia frente a nubes tropicales. | • Alertas previas (`Global Forest Watch` / `RADD`), áreas protegidas (`WDPA`), carreteras/ríos (`OSM`), precipitación estacional. | **Fusión:** El predictor temporal tipo `T-SAR-JEPA`/`U-TAE` con codificación $\Delta t$ detecta pérdida abrupta de dispersión volumétrica de troncos (`HV`) frente al ciclo estacional húmedo/seco.<br>**Salida:** Polígonos tempranos de tala y distancia a vías de acceso (`OSM`). |
| **4** | **Cultivos (Agricultura)** | Series temporales multi-fecha con $\Delta t$ variable en **Banda S** (o `Sentinel-1 VV/VH`, ratio `VH/VV`, índice `RVI` radar). | • Parcelario agrícola (`SIGPAC`/`LPIS`), temperatura/evapotranspiración (`ERA5`), humedad del suelo (`NASA SMAP`), calendario fenológico. | **Fusión:** La codificación sinusoidal $\Delta t$ aprende la curva fenológica normal de cada cultivo; cuando la serie se desvía del estado latente esperado y coincide con déficit `SMAP`/lluvia, dispara anomalía.<br>**Salida:** Estado hídrico/fenológico por parcela y alertas de estrés o daño en cosecha. |
| **5** | **Glaciares** | Pares/series `GSLC`/`GUNW` y `OPERA DISP` (offset tracking / InSAR) en **Banda L** (mayor coherencia sobre hielo/nieve) + backscatter de deshielo superficial. | • Inventario `RGI` (*Randolph Glacier Inventory*), `DEM` de elevación glaciar, anomalías térmicas `ERA5 / NASA GISTEMP`. | **Fusión:** Correlaciona velocidades de desplazamiento superficial y transición nieve seca $\rightarrow$ húmeda (caída brusca de backscatter) frente a isotermas de temperatura.<br>**Salida:** Mapa de velocidad de flujo glaciar, variación de frente y tasa de fusión estacional. |
| **6** | **Cambio de Terrenos** *(Deslizamientos / Subsidencia)* | Series `InSAR` (`GUNW` / `OPERA DISP`) + coherencia temporal + anomalía de amplitud `T-SAR-JEPA` en laderas. | • `DEM` (pendientes $>15^\circ$, orientación), litología/permeabilidad, lluvia acumulada previa (`ERA5`/`AEMET`), infraestructuras (`OSM`). | **Fusión:** Detecta deformación milimétrica lenta en laderas y determina mediante el modelo tabular si acelera tras episodios de lluvia intensa o extracción de acuíferos.<br>**Salida:** Mapa de zonas de inestabilidad de ladera/subsidencia priorizadas por cercanía a población. |
| **7** | **Terremotos** | Interferogramas `GUNW` / `OPERA DISP` (desplazamiento LOS `T_pre` vs `T_post`) + mapa de pérdida de coherencia InSAR (daño urbano/licuefacción). | • Catálogo `USGS Earthquake API` (epicentro, magnitud $M_w$, profundidad, mecanismo focal, `ShakeMap`), densidad edificatoria (`OSM`). | **Fusión:** Contrasta las franjas `InSAR` con el modelo sísmico `USGS` (descartando ruido atmosférico) y cruza la pérdida de coherencia con la huella de edificios `OSM`.<br>**Salida:** Campo de desplazamiento co-sísmico en cm, perfil de falla y estimación de manzanas urbanas potencialmente dañadas. |

---

## 5. Conclusión Práctica para el Desarrollo (`Fase 2 → Fase 3`)

1. **No casarse con un único modelo monolítico**: Adoptar la intuición temporal de **`T-SAR-JEPA` (pilas de amplitud + codificación sinusoidal $\Delta t$ + espacio latente)** combinada con **segmentación densa / productos NASA `OPERA`** en el **Nivel 1**, y un **motor explicable `LightGBM/SHAP` + máscaras físicas `DEM/Open Data`** en el **Nivel 2**.
2. **Viabilidad en Hackathon**:
   - Si tenemos tiempo/GPU acotado, el **Nivel 1** puede apoyarse en **productos `OPERA` + features radiométricas (`VV`, `VH`, `CR`, $\Delta \text{dB}$) + encoder ligero con atención $\Delta t$** (o embeddings preentrenados tipo `CROMA`/`Prithvi`), evitando entrenar un `ViT-B/16` gigante desde cero, y concentrar nuestra diferenciación científica en el **Nivel 2 (Fusión `SAR + Big Data` + Explicabilidad `SHAP`)**.
