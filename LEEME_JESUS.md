# Guía Rápida para Jesús (`@jesusorellanagil2002`) — Rama `jesus`

Bienvenido a tu espacio de trabajo limpio. Aquí solo ves lo necesario para hacer tus 2 bloques del reto **Dancing with the SAR's** usando **Gemini Flash 3.8 en Antigravity**.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Tiene el JSON común (`mock_events_contract.json`) y las lecturas/URLs ya resumidas para ti. **No lo toques.**
- `frontend_storytelling/` *(TU CARPETA 1)*: Aquí va la **página narrativa (*Local ➔ Global*), tarjetas educativas SAR y créditos legales** (`TAREA_1_STORYTELLING.md`).
- `data_global_insar/` *(TU CARPETA 2)*: Aquí va tu **script Python sísmico (USGS sin API key) + informe InSAR/El Niño** (`TAREA_2_DATOS.md`).

> **Importante:** **NO ejecutes `git merge origin/main`** en esta rama (`main` usa otras carpetas). Trabaja siempre en `jesus` y Samu importará tus archivos a `main`. Tampoco modifiques `GEMINI.md`, `LEEME_JESUS.md` ni `datos_compartidos/`.

---

## 2. Cómo trabajar con Gemini Flash 3.8 en Antigravity
1. Abre esta carpeta en **Antigravity** y verifica que estás en tu rama **`jesus`**:
   ```bash
   git checkout jesus
   git pull origin jesus
   ```
2. Selecciona **Gemini Flash 3.8**, abre `frontend_storytelling/TAREA_1_STORYTELLING.md`, copia su prompt y pégalo en el chat.
3. Prueba tu web arrancando un servidor local sencillo:
   ```bash
   python3 -m http.server 8000
   ```
   *(Abre `http://localhost:8000/frontend_storytelling/` en el navegador).*
4. Después abre `data_global_insar/TAREA_2_DATOS.md`, copia el segundo prompt y pídele a Flash 3.8 que ejecute el script y redacte el análisis.

---

## 3. Cómo guardar y subir tus cambios sin errores
Comprueba con `git status` que solo aparecen archivos dentro de `frontend_storytelling/` o `data_global_insar/`:
```bash
git status
git add frontend_storytelling data_global_insar
git commit -m "feat(jesus): storytelling SAR-NISAR y extraccion sismos USGS"
git push origin jesus
```
Si modificaste sin querer otro archivo (como `GEMINI.md` o `datos_compartidos/`), GitHub cancelará el `push` y restaurará la rama automáticamente.
