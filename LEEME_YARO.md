# Guía Rápida para Yaro (`@ItsYarosun`) — Rama `yaro`

Bienvenido a tu espacio de trabajo actualizado. Tu caso asignado ahora es: **El Niño y Ciclón Costero en el Pacífico (`ciclon-elnino-global`)**.

> **Importante:** **NO tienes que programar modelos de IA.** Tu trabajo más importante aquí es **descargar y analizar datos reales de NASA + clima ERA5** para comprobar si son completos y compatibles con el pipeline que luego montará Samu.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contrato JSON y URLs reales sin API key ya preparadas. **No lo edites.**
- `data_elnino_ciclon/` *(TU CARPETA 1 — PRIORIDAD #1)*: Abre `TAREA_1_COMPATIBILIDAD_DATOS.md` y dile a Claude Code que la ejecute paso a paso.
- `frontend_analytics/` *(TU CARPETA 2 — DESPUÉS DE LOS DATOS)*: Abre `TAREA_2_DASHBOARD_EXPLORATORIO.md` para visualizar los resultados con Chart.js.

> **Aviso Git:** **NO ejecutes `git merge origin/main`** en esta rama. Trabaja siempre en `yaro` y no modifiques `CLAUDE.md`, `LEEME_YARO.md` ni `datos_compartidos/`.

---

## 2. Cómo trabajar con Claude Code en VS Code
1. Actualiza tu rama local:
   ```bash
   git checkout yaro
   git pull origin yaro
   ```
2. **Paso 1 (Prioridad — Estudio de Compatibilidad de Datos):** En Claude Code, copia y pega el prompt de **`data_elnino_ciclon/TAREA_1_COMPATIBILIDAD_DATOS.md`**. Al terminar, revisa el archivo `data_elnino_ciclon/informe_viabilidad_elnino.md`.
3. **Paso 2 (Secundario — Dashboard Exploratorio):** Copia y pega el prompt de **`frontend_analytics/TAREA_2_DASHBOARD_EXPLORATORIO.md`** y pruébalo con:
   ```bash
   python3 -m http.server 8000
   ```
   *(Entra en `http://localhost:8000/frontend_analytics/`)*.

---

## 3. Cómo subir tus avances sin errores
```bash
git status
git add data_elnino_ciclon frontend_analytics
git commit -m "feat(yaro): estudio compatibilidad datos El Nino y dashboard exploratorio"
git push origin yaro
```
