# Guía Rápida para Hugo (`@hviciana`) — Rama `hugo`

Bienvenido a tu espacio de trabajo limpio. Tu misión en este bloque es **validar la viabilidad real del caso DANA Valencia 2024** (cruzando satélite NASA real sin clave + Open Big Data de lluvia/nubes) y crear su **visor animado por 4 Hyperframes**.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contrato JSON común y endpoints reales NASA CMR/ASF + Open-Meteo ERA5 ya verificados. **No lo edites.**
- `data_inundaciones/` *(TU CARPETA 1 — Empezar aquí)*: `TAREA_2_DATOS.md` genera los datos reales de viabilidad y el archivo animado **`hyperframes_dana_valencia.json`**.
- `frontend_mapa/` *(TU CARPETA 2)*: `TAREA_1_MAPA.md` construye el visor Leaflet animado con los **4 Hyperframes** (luego Samu lo integrará en el shell **Vite + MapLibre/Deck.gl + GSAP** de `main`).

> **Importante:** **NO ejecutes `git merge origin/main`** en esta rama. Trabaja siempre en `hugo` y no modifiques `CLAUDE.md`, `LEEME_HUGO.md` ni `datos_compartidos/`.

---

## 2. Orden recomendado con Claude Code (VS Code)
1. Asegúrate de estar en tu rama:
   ```bash
   git checkout hugo
   git pull origin hugo
   ```
2. **Paso 1 (Validar datos reales y Hyperframes):** Abre Claude Code y pega el prompt de **`data_inundaciones/TAREA_2_DATOS.md`**. Esto consultará en vivo NASA CMR/ASF y Open-Meteo ERA5, y generará `data_inundaciones/hyperframes_dana_valencia.json` + `data_inundaciones/viabilidad_dana_valencia.md`.
3. **Paso 2 (Visor animado):** Copia y pega el prompt de **`frontend_mapa/TAREA_1_MAPA.md`**.
4. Pruébalo en local:
   ```bash
   python3 -m http.server 8000
   ```
   *(Abre `http://localhost:8000/frontend_mapa/` en tu navegador).*

---

## 3. Subir tus cambios sin errores
```bash
git status
git add data_inundaciones frontend_mapa
git commit -m "feat(hugo): validar viabilidad DANA NASA+ERA5 y visor animado 4 hyperframes"
git push origin hugo
```
