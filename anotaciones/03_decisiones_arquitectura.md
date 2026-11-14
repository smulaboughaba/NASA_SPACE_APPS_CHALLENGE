# Registro de Decisiones de Arquitectura (ADR)

> **Código:** `ANO-03`  
> **Fase:** Fase 2 y Fase 3  
> **Estado:** En preparación  

---

## Cómo usar este archivo

Cada vez que el equipo tome una decisión técnica importante (stack, librería de mapas, base de datos, modelo de IA, hosting de la demo), se añade una ficha ADR corta para que los 4 miembros trabajen alineados.

---

## Índice de Decisiones

| ID | Fecha | Decisión | Estado | Propuesto por |
| :--- | :--- | :--- | :--- | :--- |
| `ADR-001` | `2026-11-13` | Estrategia de ramas individuales con consolidación en `main` | Aceptada | `@smulaboughaba` |
| `ADR-002` | `2026-11-14` | Arquitectura híbrida en 2 niveles (Percepción temporal SAR tipo JEPA/U-TAE + Fusión Multimodal con Big Data/Open Data) | Propuesta | `@smulaboughaba` |
| `ADR-003` | `2026-11-14` | Stack Frontend Vite + MapLibre GL/Deck.gl + GSAP Hyperframes y validación de casos por compañero | Aceptada | `@smulaboughaba` |

---

### `ADR-001` — Estrategia de ramas individuales con consolidación en `main`
- **Estado:** Aceptada
- **Contexto:** Equipo de 4 personas trabajando en paralelo en un hackathon con necesidad de aislar desarrollos y proteger la rama principal.
- **Qué decidimos:** Cada miembro trabaja exclusivamente en su rama (`samu`, `hugo`, `yaro`, `jesus`) y los cambios se integran a `main` mediante Pull Request revisado por `@smulaboughaba`, con validación automática vía GitHub Actions.
- **Consecuencias:** Evita conflictos destructivos directos sobre `main` y mantiene trazabilidad clara de autoría por módulo.

---

### `ADR-002` — Arquitectura híbrida en 2 niveles (`SAR` + `Big Data / Open Data`)
- **Estado:** Propuesta *(documentada en [`../research/05_formatos_sar_y_arquitectura_modelos_ia.md`](../research/05_formatos_sar_y_arquitectura_modelos_ia.md))*
- **Contexto:** El equipo evaluó usar `T-SAR-JEPA` (`arXiv:2606.05700`, predicción latente temporal sobre pilas de amplitud con codificación sinusoidal de intervalos $\Delta t$ y descongelamiento progresivo) frente a otras arquitecturas SOTA (`U-TAE`, `Siamese ChangeFormer`, `Prithvi-EO / CROMA / DOFA`, `LightGBM + SHAP`).
- **Qué decidimos:** Adoptar una arquitectura híbrida en 2 niveles:
  - **Nivel 1 (Percepción SAR temporal/espacial):** Normalizar los `.h5` (NISAR) y `.tif` COG (`OPERA/ASF`) a tensores `(T, C, H, W)` con vector $\Delta t$; usar codificación temporal $\Delta t$ y señal de anomalía latente (inspirada en `T-SAR-JEPA` / `U-TAE` o backbones preentrenados) junto a máscaras de resolución exacta al píxel (`OPERA` / `U-Net`).
  - **Nivel 2 (Fusión Multimodal con Big Data + Explicabilidad):** Cruzar el vector físico SAR resultante con variables Open Data (`DEM`, lluvia, `FIRMS`, `USGS`, `WorldCover`, `OSM`) mediante `LightGBM / CatBoost + SHAP` (y/o capas `FiLM` / `Cross-Attention`) para eliminar falsos positivos, cuantificar impacto y explicar causalmente cada suceso.
- **Por qué (alternativas descartadas):** Usar solo `T-SAR-JEPA` aislado produce salidas a resolución gruesa de parche ($16 \times 16$ px), exige alto coste de preentrenamiento y no distingue causas ni ingiere Big Data tabular; usar solo modelos tabulares perdería la dinámica espaciotemporal del radar.
- **Quién lo propuso:** `@smulaboughaba`

---

### `ADR-003` — Stack Frontend `Vite + MapLibre GL JS + Deck.gl + GSAP Hyperframes` y Validación Distribuida de Casos
- **Estado:** Aceptada *(ampliado en [`../research/06_viabilidad_casos_storytelling_y_animacion_web.md`](../research/06_viabilidad_casos_storytelling_y_animacion_web.md))*
- **Contexto:** La Web App debe renderizar mapas geoespaciales WebGL/3D fluidos y explicar cada catástrofe mediante animaciones secuenciales (*Hyperframes*) conectadas al pipeline IA (`Nivel 1 T-SAR-JEPA/OPERA` + `Nivel 2 LightGBM/SHAP`), mientras Hugo, Yaro y Jesús validan en paralelo la viabilidad real de cada caso desde sus ramas aisladas sin bloquearse con entornos complejos.
- **Qué decidimos:**
  1. **Motor visual maestro en `main` (`dev/frontend/`):** **Vite** como empaquetador moderno, **MapLibre GL JS + Deck.gl** (renderizado GPU WebGL2/3D con relieve DEM, barridos radar y capas georreferenciadas sin requerir token de pago Mapbox), **GSAP (`ScrollTrigger` + línea temporal de *Hyperframes*)** para coreografía visual de alto nivel, y **Chart.js** para gráficas `SHAP`, conectado por API a **FastAPI** (`dev/backend/`).
  2. **Validación y prototipado en ramas aisladas (`hugo`, `yaro`, `jesus`):** Cada compañero valida un caso histórico real cruzando escenas **SAR reales sin login** (`NASA CMR API` / `NASA ASF GeoJSON API`) con **Open Big Data verificado** (`Open-Meteo ERA5` incluyendo nubosidad `cloud_cover_mean`, `USGS Earthquake API`, `NASA FIRMS`), exporta un artefacto estándar `hyperframes_<caso>.json` (4 *Hyperframes*) e implementa su reproductor web autocontenido HTML/JS para que Samu lo importe con [`../dev/scripts/sincronizar_equipo.sh`](../dev/scripts/sincronizar_equipo.sh) y lo conecte al shell **Vite + MapLibre/Deck.gl + GSAP**.
- **Por qué (alternativas descartadas):**
  - Usar *Mapbox GL JS* v2/v3 exige clave de facturación/token propietario en producción, mientras que *MapLibre GL JS + Deck.gl* es 100% abierto con aceleración WebGL equivalente.
  - Exigir a todo el equipo configurar Vite/Node desde el primer día aumentaba la fricción en ramas aisladas; el contrato `hyperframes_<caso>.json` permite prototipar rápido y elevar el acabado final a nivel Awwward en `main`.
- **Quién lo propuso:** `@smulaboughaba`

