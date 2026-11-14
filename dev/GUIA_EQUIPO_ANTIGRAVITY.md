# Guía Autónoma del Equipo (Validación Satélite SAR + Open Data y Hyperframes)

> **Código:** `DEV-00`  
> **Arquitectura vinculada:** `ADR-003` (**Vite + MapLibre GL / Deck.gl + GSAP Hyperframes** en `main`) y `RES-06`  
> **Para:** Hugo (`@hviciana`), Yaro (`@ItsYarosun`) y Jesús (`@jesusorellanagil2002`)  
> **Coordinación Backend + IA + Shell Vite:** Samu (`@smulaboughaba`)

---

## 1. Objetivo Central de Vuestras Ramas Aisladas

Cada uno valida de extremo a extremo **1 caso de storytelling real** para confirmar que los datos de satélite **NASA SAR** (consultados en APIs públicas sin clave: **NASA CMR** y **NASA ASF GeoJSON**) y los datos **Open Big Data** (`Open-Meteo ERA5` con nubosidad `cloud_cover_mean`, `USGS Earthquake API`, `NASA FIRMS`) coinciden temporal y físicamente, generan una secuencia animada de **4 Hyperframes (`hyperframes_<caso>.json`)** y alimentan la Web App final en **Vite + MapLibre GL/Deck.gl + GSAP** que ensamblará Samu.

> **Regla de seguridad automática (`.github/workflows/branch-access-control.yml`):**
> - **NO ejecutéis `git merge origin/main`** en vuestras ramas aisladas (`hugo`, `yaro`, `jesus`).
> - Solo podéis modificar archivos dentro de **vuestras 2 carpetas de trabajo**. Todo lo de `datos_compartidos/`, `CLAUDE.md`, `GEMINI.md`, `LEEME_*.md` y `.github/` es de solo lectura.

---

## 2. Reparto Exacto: Rama, Agente IA, Caso y Entregables

| Integrante | Rama Git | Agente IA | Caso asignado (`mock_events_contract.json`) | Carpeta Datos + Viabilidad (`hyperframes_*.json`) | Carpeta UI Animada (*4 Hyperframes*) | Destino en `main` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hugo** (`@hviciana`) | `hugo` | **Claude Code (VS Code)** | **DANA Valencia 2024** (`dana-valencia-2024`) | `data_inundaciones/` (`validar_viabilidad_dana.py`, `viabilidad_dana_valencia.md`) | `frontend_mapa/` (Visor + reproductor animado 4 Hyperframes) | `dev/*/hugo_*` |
| **Yaro** (`@ItsYarosun`) | `yaro` | **Claude Code (VS Code)** | **Incendio Alto Mijares y Cultivos** (`incendio-forestal-mediterraneo`) | `data_incendios_cultivos/` (`validar_viabilidad_incendio.py`, `viabilidad_incendio_cultivos.md`) | `frontend_analytics/` (Gráficas dinámicas por Hyperframe + SHAP) | `dev/*/yaro_*` |
| **Jesús** (`@jesusorellanagil2002`) | `jesus` | **Gemini Flash 3.8 (Antigravity)** | **Terremoto InSAR + Ciclón/El Niño Global** (`terremoto-insar-global` + `ciclon-elnino-global`) | `data_global_insar/` (`validar_viabilidad_global.py`, `viabilidad_global_insar.md`) | `frontend_storytelling/` (*Storyboard* animado Local ➔ Global + `sar_concepts`) | `dev/*/jesus_*` |
| **Samu** (`@smulaboughaba`) | `samu` / `main` | Backend + IA + Vite 3D | Integración completa + **Pipeline Nivel 1 & 2** | `dev/backend/` + `dev/data_science/models/` | `dev/frontend/` (**Vite + MapLibre GL / Deck.gl + GSAP Hyperframes**) | `main` |

---

## 3. Puente Pipeline IA ➔ Web Animada (Los 4 *Hyperframes*)

Cada archivo `hyperframes_<caso>.json` contiene **4 escenas animadas** que representan el flujo real del modelo (`RES-05` / `RES-06`):
1. `frame_1_pre` (**`t0_pre` — Línea Base**): territorio estable antes del evento.
2. `frame_2_event_blindness` (**`t1_event` — Crisis y Ceguera Óptica**): disparo del pico Open Big Data (`cloud_cover_mean` cercano al 95–100% en lluvia/tormenta, humo o epicentro sísmico).
3. `frame_3_sar_level1` (**`t2_post_sar` — Nivel 1 `T-SAR-JEPA / OPERA`**): barrido radar con escena real de NASA (`browse_url`), caída de backscatter / desplazamiento InSAR y anomalía latente.
4. `frame_4_fusion_level2_shap` (**Validación — Nivel 2 `LightGBM + SHAP`**): eliminación de falsos positivos y peso causal de cada variable (`shap_attributions`).

---

## 4. Importación en `main` (`dev/scripts/sincronizar_equipo.sh`)

```bash
# Revisar entregas reales y viabilidad de los 3 compañeros desde origin
./dev/scripts/sincronizar_equipo.sh review

# Importar carpetas a dev/frontend/* y dev/data_science/* para integrar en Vite + FastAPI
./dev/scripts/sincronizar_equipo.sh import all
```
