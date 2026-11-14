# Guía Autónoma del Equipo (Ramas Aisladas para Claude Code y Gemini Flash 3.8)

> **Código:** `DEV-00`  
> **Para:** Hugo (`@hviciana`), Yaro (`@ItsYarosun`) y Jesús (`@jesusorellanagil2002`)  
> **Coordinación Backend + IA + Revisión e Integración:** Samu (`@smulaboughaba`)

---

## 1. Arquitectura de Raíz Aislada por Rama (Cero Confusiones)

Para que ni vosotros ni vuestros agentes de IA os perdáis entre decenas de archivos de investigación y backend, **las ramas `hugo`, `yaro` y `jesus` tienen una distribución de carpetas propia y reducida en la raíz** (distinta de `main`):

- **NO tenéis `research/`, `todos/`, `anotaciones/`, `dev/backend/` ni `README.md` en vuestra rama.**
- **NO hagáis `git merge origin/main` desde vuestras ramas**, porque `main` usa la estructura completa del proyecto y chocaría con vuestra raíz limpia.
- Todo lo que necesitáis de contexto NASA, fuentes Open Data y el contrato JSON está pre-empaquetado dentro de **`datos_compartidos/`** en la raíz de vuestra rama.

### Regla de seguridad automática (GitHub Actions + `CODEOWNERS`)
1. Cada uno solo puede hacer `push` a **su propia rama** (`hugo`, `yaro` o `jesus`).
2. Solo podéis modificar archivos dentro de **vuestras 2 carpetas de trabajo**. Si un commit modifica `CLAUDE.md`, `GEMINI.md`, `datos_compartidos/`, `.github/` o intenta un `git push --force`, [branch-access-control.yml](../.github/workflows/branch-access-control.yml) bloquea el cambio y revierte la rama al estado previo.

---

## 2. Reparto Exacto: Agente IA, Rama y Carpetas Raíz

| Integrante | Rama Git | Agente IA usado | Archivos guía en la raíz de su rama | Sus 2 únicas carpetas editables | Destino en `main` (Samu) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hugo** (`@hviciana`) | `hugo` | **Claude Code (VS Code)** | `CLAUDE.md`, `LEEME_HUGO.md`, `datos_compartidos/FUENTES_Y_CONTEXTO_HUGO.md` | `frontend_mapa/` · `data_inundaciones/` | `dev/frontend/hugo_mapa/` · `dev/data_science/hugo_inundaciones/` |
| **Yaro** (`@ItsYarosun`) | `yaro` | **Claude Code (VS Code)** | `CLAUDE.md`, `LEEME_YARO.md`, `datos_compartidos/FUENTES_Y_CONTEXTO_YARO.md` | `frontend_analytics/` · `data_incendios_cultivos/` | `dev/frontend/yaro_analytics/` · `dev/data_science/yaro_incendios_cultivos/` |
| **Jesús** (`@jesusorellanagil2002`) | `jesus` | **Gemini Flash 3.8 (Antigravity)** | `GEMINI.md`, `LEEME_JESUS.md`, `datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md` | `frontend_storytelling/` · `data_global_insar/` | `dev/frontend/jesus_storytelling/` · `dev/data_science/jesus_global_insar/` |
| **Samu** (`@smulaboughaba`) | `samu` / `main` | Coordinador Backend + IA | `MATRIZ_DOCUMENTAL.md`, `research/`, `dev/` completo | `dev/backend/` · `dev/data_science/models/` · `dev/shared/` | Integración completa en `main` |

> **Fuentes descartadas en las ramas del equipo (`CONAE SAOCOM`, `CSA RCM/RADARSAT-1`, `Earthdata Search`, `AEMET con token`):** Se mantienen fuera del flujo del equipo para evitar registros y descargas pesadas. Hugo, Yaro y Jesús usan únicamente APIs sin API key (`Open-Meteo ERA5`, `USGS Earthquake API`, `NASA FIRMS` CSV web) y material NASA abierto (`NISAR StoryMaps`, `UAVSAR Postcards`, `Intro to SAR`, `NASA ARSET`).

---

## 3. Contrato Único de Datos (`datos_compartidos/mock_events_contract.json`)

En cada rama aislada tenéis una copia de solo lectura en `datos_compartidos/mock_events_contract.json` (idéntica a [`dev/shared/mock_events_contract.json`](shared/mock_events_contract.json)):
- `events[]`: `dana-valencia-2024`, `incendio-forestal-mediterraneo`, `terremoto-insar-global`, `ciclon-elnino-global`.
- Claves por evento: `id`, `title`, `scale`, `niche`, `location`, `center_coords`, `bbox`, `dates` (`t0_pre`, `t1_event`, `t2_post_sar`), `sar_signature` (`sensor_reference`, `band`, `polarization`, `mechanism`, `jepa_latent_anomaly_score`, `affected_area_km2`, `false_positive_reduction_pct`), `open_data_metrics` (incluye `affected_land_cover_ha`), `shap_attributions[]` (`feature`, `contribution_pct`), `storytelling_summary` (texto), `attributions[]`.
- `sar_concepts[]`: 5 tarjetas (`l-band`, `s-band`, `backscatter`, `insar`, `polarizacion`), cada una con `id`, `title`, `summary`.

---

## 4. Flujo de Trabajo del Equipo vs. Integración de Samu

### Para Hugo, Yaro y Jesús en su rama (`hugo` | `yaro` | `jesus`)
1. Clonar el repo y cambiar a su rama: `git checkout <tu-rama> && git pull origin <tu-rama>`.
2. Abrir **solo la carpeta raíz del proyecto en esa rama** dentro de VS Code (Claude Code leerá `CLAUDE.md` automáticamente) o Antigravity (Jesús abre `LEEME_JESUS.md` y usa `GEMINI.md` con Flash 3.8).
3. Subir **únicamente sus 2 carpetas**:
   ```bash
   git add <carpeta_frontend> <carpeta_datos>
   git commit -m "feat(<tu-rama>): descripcion breve"
   git push origin <tu-rama>
   ```

### Para Samu en `main` (`dev/scripts/sincronizar_equipo.sh`)
Como las ramas `hugo`, `yaro` y `jesus` tienen raíces distintas a `main`, **NO se hace `git merge hugo` directo sobre `main`**. En su lugar, desde `main` se usa [`dev/scripts/sincronizar_equipo.sh`](scripts/sincronizar_equipo.sh):

```bash
# 1. Revisar commits nuevos y archivos tocados en origin/hugo, origin/yaro y origin/jesus
./dev/scripts/sincronizar_equipo.sh review

# 2. Importar el código revisado hacia dev/frontend/* y dev/data_science/* sin afectar la estructura de main
./dev/scripts/sincronizar_equipo.sh import all     # o especificar: hugo | yaro | jesus
```
