# Guía Rápida para Yaro (`@ItsYarosun`) — Rama `yaro`

Bienvenido a tu espacio de trabajo limpio. Tu misión es **validar la viabilidad real del caso Incendio Forestal y Cultivos** (cruzando satélite NASA Sentinel-1 sin clave + clima ERA5 real) y construir el **panel analítico animado por 4 Hyperframes**.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contrato JSON común y endpoints verificados NASA ASF + Open-Meteo ERA5. **No lo edites.**
- `data_incendios_cultivos/` *(TU CARPETA 1 — Empezar aquí)*: `TAREA_2_DATOS.md` descarga pasadas radar reales + clima ERA5, genera **`hyperframes_incendio_cultivos.json`** y redacta **`viabilidad_incendio_cultivos.md`**.
- `frontend_analytics/` *(TU CARPETA 2)*: `TAREA_1_ANALYTICS.md` construye el panel dinámico **Chart.js** animado por los **4 Hyperframes** (luego Samu lo integrará en el shell **Vite + MapLibre/Deck.gl + GSAP** de `main`).

> **Importante:** **NO ejecutes `git merge origin/main`** en esta rama. Trabaja siempre en `yaro` y no modifiques `CLAUDE.md`, `LEEME_YARO.md` ni `datos_compartidos/`.

---

## 2. Orden recomendado con Claude Code (VS Code)
1. Asegúrate de estar en tu rama:
   ```bash
   git checkout yaro
   git pull origin yaro
   ```
2. **Paso 1 (Validar datos reales y Hyperframes):** Abre Claude Code y pega el prompt de **`data_incendios_cultivos/TAREA_2_DATOS.md`**. Esto consultará en vivo NASA ASF + Open-Meteo ERA5, y generará `hyperframes_incendio_cultivos.json` y `viabilidad_incendio_cultivos.md`.
3. **Paso 2 (Dashboard animado por Hyperframes):** Copia y pega el prompt de **`frontend_analytics/TAREA_1_ANALYTICS.md`**.
4. Pruébalo en local:
   ```bash
   python3 -m http.server 8000
   ```
   *(Abre `http://localhost:8000/frontend_analytics/` en tu navegador).*

---

## 3. Subir tus cambios sin errores
```bash
git status
git add data_incendios_cultivos frontend_analytics
git commit -m "feat(yaro): validar viabilidad incendio NASA+ERA5 y analytics animado 4 hyperframes"
git push origin yaro
```
