# Guía Rápida para Hugo (`@hviciana`) — Rama `hugo`

Bienvenido a tu espacio de trabajo actualizado. Tu caso asignado ahora es: **Sequía Extrema e Incendios Forestales de Los Ángeles (Enero 2025 — *Palisades & Eaton Fires*)**.

> **Importante:** **NO tienes que programar modelos de IA ni cosas complicadas.** Tu trabajo más importante aquí es **descargar y analizar datos reales de NASA + clima/gases** para comprobar que son limpios y compatibles con el pipeline que luego montará Samu.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contrato JSON y URLs reales verificadas (sin API key ni logins). **No lo edites.**
- `data_sequia_incendios_la/` *(TU CARPETA 1 — PRIORIDAD #1)*: Abre `TAREA_1_COMPATIBILIDAD_DATOS.md` y dile a Claude Code que la ejecute paso a paso.
- `frontend_mapa/` *(TU CARPETA 2 — DESPUÉS DE LOS DATOS)*: Abre `TAREA_2_MAPA_EXPLORATORIO.md` para montar un mapa exploratorio sencillo con Leaflet.

> **Aviso Git:** **NO ejecutes `git merge origin/main`** en esta rama. Trabaja siempre en `hugo` y no modifiques `CLAUDE.md`, `LEEME_HUGO.md` ni `datos_compartidos/`.

---

## 2. Cómo trabajar con Claude Code en VS Code
1. Actualiza tu rama local:
   ```bash
   git checkout hugo
   git pull origin hugo
   ```
2. **Paso 1 (Prioridad — Estudio de Compatibilidad de Datos):** En Claude Code, copia y pega el prompt de **`data_sequia_incendios_la/TAREA_1_COMPATIBILIDAD_DATOS.md`**. Al terminar, revisa el archivo `data_sequia_incendios_la/informe_viabilidad_la.md` que habrá redactado.
3. **Paso 2 (Secundario — Visor Exploratorio):** Copia y pega el prompt de **`frontend_mapa/TAREA_2_MAPA_EXPLORATORIO.md`** y pruébalo en el navegador con:
   ```bash
   python3 -m http.server 8000
   ```
   *(Entra en `http://localhost:8000/frontend_mapa/`)*.

---

## 3. Cómo subir tus avances sin errores
```bash
git status
git add data_sequia_incendios_la frontend_mapa
git commit -m "feat(hugo): estudio compatibilidad datos LA 2025 y visor exploratorio"
git push origin hugo
```
