# Brainstorming e Ideas del Equipo — Pizarras de Trabajo

> **Código:** `ANO-01`  
> **Fase:** Fase 1 — Investigación, Reto y Datos NASA  
> **Estado:** En preparación (Base completada)  

---

## 1. Síntesis Visual del Brainstorming en Pizarra

El equipo definió en pizarra la arquitectura conceptual del proyecto **"Dancing with the SAR's"** alrededor de los datos de radar de apertura sintética (**SAR / NISAR**) enriquecidos con fuentes **Open Data** y análisis de Ciencia de Datos.

### Pizarra 1 — Fundamentos Técnicos SAR y Misión NISAR
- **Referencia visual:** [`pizarras/01_fundamentos_nisar_sar.jpg`](pizarras/01_fundamentos_nisar_sar.jpg)
- **Sistema radar (SAR — *Synthetic Aperture Radar*):** Sensor activo capaz de observar la superficie terrestre a través de nubes densas, humo y en ausencia de luz solar.
- **Arquitectura de doble banda (`NISAR`):**
  - **`L-BAND` ($24\text{ cm}$):** Penetra el dosel vegetal; enfocada en vegetación, bosques (biomasa), humedad del suelo y deformaciones del terreno.
  - **`S-BAND` (~$9.4\text{ cm}$):** Mayor sensibilidad superficial; enfocada en agricultura (cultivos) y cambios superficiales de terreno.
- **Mecanismos físicos clave:**
  - **Capacidad `InSAR`:** Medición interferométrica de desplazamientos milimétricos/centimétricos de la corteza.
  - **`Backscatter` (Retrodispersión):** Intensidad de retorno según rugosidad y constante dieléctrica (humedad/agua).
  - **`Polarización` (`HH`, `HV`, `VV`, `VH`):** Separación de tipos de cobertura (agua en calma, bosque, urbano, cultivos).

### Pizarra 2 — Producto Web App y 7 Dominios de Interés
- **Referencia visual:** [`pizarras/02_webapp_e_intereses.jpg`](pizarras/02_webapp_e_intereses.jpg)
- **Producto central:** **Web App interactiva** basada en datos **NISAR / SAR** para visualización, cruce analítico e interpretación accesible de datos radar.
- **Casos de interés identificados:**
  1. **Inundaciones**
  2. **Deforestación**
  3. **Incendios**
  4. **Glaciares**
  5. **Cultivos**
  6. **Cambio de terrenos**
  7. **Terremotos**

### Pizarra 3 — Estrategia de Demo y *Storytelling*
- **Referencia visual:** [`pizarras/03_estrategia_demo_storytelling.jpg`](pizarras/03_estrategia_demo_storytelling.jpg)
- **Decisión clave de producto:** Utilizar **sucesos históricos reales** documentados para demostrar la herramienta con comparativas antes / durante / después.
- **Ventajas detectadas (`+`):**
  - **`+ Fácil trabajar con datos`:** Datasets históricos completos, limpios y reproducibles.
  - **`+ Latencia`:** Eliminación de cuellos de botella por revisita satelital en tiempo real durante la demo.
  - **`+ Entrenamiento`:** Disponibilidad de verdad de campo (*ground truth*) para entrenar y validar modelos analíticos.
  - **`+ Storytelling` (Escala Local ➔ Global):**
    - **Local:** **DANA** (inundaciones) e **Incendios** (casos cercanos de alto impacto donde la óptica tradicional falla por nubes o humo).
    - **Global:** **Ciclón** y fenómeno de **El Niño** (escalabilidad planetaria de la plataforma).

### Pizarra 4 — Fusión con Open Data (`+`) y Datos Sintéticos (`~`)
- **Referencia visual:** [`pizarras/04_opendata_y_datos_sinteticos.jpg`](pizarras/04_opendata_y_datos_sinteticos.jpg)
- **`Open Data (+)` (Alta prioridad):** Cruzar los datos SAR con fuentes externas abiertas de campo (meteorología, hidrología, sismología, usos del suelo, relieve e infraestructuras) mediante Ciencia de Datos para descubrir correlaciones y aumentar la precisión del análisis de cada suceso.
- **`Datos Sintéticos (~)` (Uso controlado y condicionado):**
  - Uso válido: datasets simulados oficiales de NISAR producidos por NASA JPL/UAVSAR o simulaciones futuras claramente etiquetadas como tales.
  - Restricción: no reemplazar observaciones históricas reales de los casos demo por datos inventados.

---

## 2. Propuestas y Enfoque por Integrante *(Ampliar cuando se repartan subcasos)*

### Samu (`@smulaboughaba`)
- **Foco propuesto:** Arquitectura de plataforma, integración de capas SAR + Open Data y diseño del hilo narrativo (*Local ➔ Global*).

### Hugo (`@hviciana`)
- **Foco propuesto:** *(Completar según reparto de módulos y casos de uso)*

### Yaro (`@ItsYarosun`)
- **Foco propuesto:** *(Completar según reparto de módulos y casos de uso)*

### Jesús (`@jesusorellanagil2002`)
- **Foco propuesto:** *(Completar según reparto de módulos y casos de uso)*

---

## 3. Matriz de Priorización de Casos para el MVP

Evaluar qué 2 o 3 sucesos históricos encabezarán la demo (combinando el bloque **Local** y el bloque **Global**) en función del tiempo y datos disponibles:

| Suceso candidato | Escala | Impacto (1-5) | Disponibilidad SAR + Open Data (1-5) | Viabilidad MVP (1-5) | Prioridad |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **DANA / Inundaciones históricas** | Local | - | - | - | Alta *(candidato principal)* |
| **Incendios forestales** | Local | - | - | - | Alta *(candidato principal)* |
| **Ciclón / El Niño** | Global | - | - | - | Media-Alta *(cierre global)* |
| **Terremoto / Cambio terreno (InSAR)** | Local/Global | - | - | - | Por evaluar |
