# Guía Autónoma del Equipo — Estudio de Compatibilidad de Datos (EDA)

> **Código:** `DEV-00`  
> **Enfoque:** Validación realista de datos reales (`NASA SAR` + `Open Big Data`) para comprobar compatibilidad con el pipeline IA de Samu (**no tenéis que programar modelos IA**)  
> **Integración Backend/IA + Vite/MapLibre:** Samu (`@smulaboughaba`)

---

## 1. Regla Principal de Vuestra Misión

1. **Vuestro foco #1 es el análisis de datos realistas (EDA de compatibilidad), NO entrenar ni programar modelos `T-SAR-JEPA` o `LightGBM`.**
2. Cada uno comprueba en su caso real si las fechas de satélite **NASA ASF / CMR** encajan ($\Delta t$) con los datos abiertos **Open-Meteo ERA5 / CAMS** y si las variables propuestas dan señal limpia y sin huecos.
3. Samu revisará vuestros informes y datasets desde `main` para validar el pipeline IA y diseñar la conexión interactiva en tiempo real (<15 ms en Nivel 2) con la interfaz **Vite + MapLibre/Deck.gl + GSAP**.

> **Candado automático de GitHub (`.github/workflows/branch-access-control.yml`):**
> - **NO ejecutéis `git merge origin/main`** en vuestras ramas aisladas (`hugo`, `yaro`, `jesus`).
> - Trabajad únicamente dentro de **vuestras 2 carpetas asignadas**. Cualquier edición fuera será bloqueada y revertida automáticamente.

---

## 2. Reparto Exacto de Casos, Ramas y Carpetas

| Integrante | Rama Git | Agente IA | Caso Asignado (`mock_events_contract.json`) | Carpeta 1 (Prioritaria — EDA Compatibilidad) | Carpeta 2 (Secundaria — Visor Exploratorio) | Destino al importar en `main` |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Hugo** (`@hviciana`) | `hugo` | **Claude Code (VS Code)** | **Sequía e Incendios Los Ángeles (Ene 2025)** (`incendio-sequia-los-angeles-2025`) | `data_sequia_incendios_la/` (`TAREA_1_COMPATIBILIDAD_DATOS.md`) | `frontend_mapa/` (`TAREA_2_MAPA_EXPLORATORIO.md`) | `dev/data_science/hugo_sequia_incendios_la/` · `dev/frontend/hugo_mapa/` |
| **Yaro** (`@ItsYarosun`) | `yaro` | **Claude Code (VS Code)** | **El Niño y Ciclón Costero Pacífico** (`ciclon-elnino-global`) | `data_elnino_ciclon/` (`TAREA_1_COMPATIBILIDAD_DATOS.md`) | `frontend_analytics/` (`TAREA_2_DASHBOARD_EXPLORATORIO.md`) | `dev/data_science/yaro_elnino_ciclon/` · `dev/frontend/yaro_analytics/` |
| **Jesús** (`@jesusorellanagil2002`) | `jesus` | **Gemini Flash 3.8 (Antigravity)** | **DANA de Valencia (Oct–Nov 2024)** (`dana-valencia-2024`) | `data_dana_valencia/` (`TAREA_1_COMPATIBILIDAD_DATOS.md`) | `frontend_storytelling/` (`TAREA_2_STORYTELLING_EXPLORATORIO.md`) | `dev/data_science/jesus_dana_valencia/` · `dev/frontend/jesus_storytelling/` |
| **Samu** (`@smulaboughaba`) | `samu` / `main` | Backend + Pipeline IA + Vite | Supervisión, Pipeline `T-SAR-JEPA + LightGBM/SHAP`, Terremoto InSAR y Web Tiempo Real | `dev/data_science/models/` + `dev/backend/` | `dev/frontend/` (**Vite + MapLibre/Deck.gl + GSAP**) | `main` |

---

## 3. Cómo Trabajar y Subir Vuestros Entregables

1. En vuestra rama (`hugo`, `yaro` o `jesus`), haced `git pull origin <tu-rama>`.
2. Empezad siempre por **`TAREA_1_COMPATIBILIDAD_DATOS.md`** (ejecutando el script Python con librería estándar para comprobar que las APIs devuelven datos reales limpios y documentar los hallazgos en `informe_viabilidad_*.md`).
3. Cuando los datos estén validados, pasad a **`TAREA_2_*`** para visualizar ese mismo dataset en un prototipo limpio.
4. Subid solo vuestras 2 carpetas:
   ```bash
   git add <tu_carpeta_datos> <tu_carpeta_frontend>
   git commit -m "feat(<tu-rama>): estudio de compatibilidad de datos y visor exploratorio"
   git push origin <tu-rama>
   ```
5. Desde `main`, Samu revisa e importa vuestros estudios sin conflictos ejecutando [`dev/scripts/sincronizar_equipo.sh`](scripts/sincronizar_equipo.sh):
   ```bash
   ./dev/scripts/sincronizar_equipo.sh review
   ./dev/scripts/sincronizar_equipo.sh import all
   ```
