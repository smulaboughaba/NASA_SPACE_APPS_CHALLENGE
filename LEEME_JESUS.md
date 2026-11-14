# Guía Rápida para Jesús (`@jesusorellanagil2002`) — Rama `jesus`

Bienvenido a tu espacio de trabajo limpio. Tu misión es **validar la viabilidad real de nuestros casos globales** (Terremoto InSAR + Ciclón/El Niño cruzando escenas NASA reales + USGS + Open-Meteo sin API key) y construir el **Storyboard Animado de 4 Hyperframes**.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contrato JSON común y enlaces/APIs sin clave ya verificados. **No lo toques.**
- `data_global_insar/` *(TU CARPETA 1 — Empezar aquí)*: `TAREA_2_DATOS.md` descarga sismos reales (`USGS`), clima ciclón (`Open-Meteo`) y pasadas radar (`NASA ASF`), creando **`hyperframes_global_insar.json`** y **`viabilidad_global_insar.md`**.
- `frontend_storytelling/` *(TU CARPETA 2)*: `TAREA_1_STORYTELLING.md` crea el reproductor **Storyboard Animado de 4 Hyperframes** (*Satélite/Big Data ➔ Nivel 1 IA ➔ Nivel 2 SHAP*), la transición *Local ➔ Global*, las tarjetas `sar_concepts` y los créditos legales.

> **Importante:** **NO ejecutes `git merge origin/main`** en esta rama. Trabaja siempre en `jesus` y no modifiques `GEMINI.md`, `LEEME_JESUS.md` ni `datos_compartidos/`.

---

## 2. Pasos con Gemini Flash 3.8 en Antigravity
1. Verifica que estás en tu rama:
   ```bash
   git checkout jesus
   git pull origin jesus
   ```
2. **Paso 1 (Validar datos reales y Hyperframes):** Abre **`data_global_insar/TAREA_2_DATOS.md`**, copia su prompt y pégalo en Antigravity con **Gemini Flash 3.8**.
3. **Paso 2 (Storyboard animado):** Copia y pega el prompt de **`frontend_storytelling/TAREA_1_STORYTELLING.md`**.
4. Pruébalo arrancando un servidor local:
   ```bash
   python3 -m http.server 8000
   ```
   *(Abre `http://localhost:8000/frontend_storytelling/` en tu navegador).*

---

## 3. Guardar y subir tus cambios sin errores
```bash
git status
git add data_global_insar frontend_storytelling
git commit -m "feat(jesus): validar viabilidad global InSAR/El Nino y storyboard 4 hyperframes"
git push origin jesus
```
