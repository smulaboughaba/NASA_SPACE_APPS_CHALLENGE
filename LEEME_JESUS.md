# Guía Rápida para Jesús (`@jesusorellanagil2002`) — Rama `jesus`

Bienvenido a tu espacio de trabajo actualizado. Tu caso asignado ahora es: **DANA de Valencia — Inundaciones Súbitas (Oct–Nov 2024)**, además de mantener el hilo narrativo *Local ➔ Global*.

> **Importante:** **NO tienes que programar modelos de IA ni backend.** Lo más importante ahora es **analizar datos reales de la DANA (NASA OPERA/Sentinel-1 + Open-Meteo ERA5)** para verificar que son compatibles y completos antes de que Samu los meta en el modelo.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contrato JSON común y las URLs exactas sin clave para la DANA. **No lo toques.**
- `data_dana_valencia/` *(TU CARPETA 1 — PRIORIDAD #1)*: Abre `TAREA_1_COMPATIBILIDAD_DATOS.md` y dile a **Gemini Flash 3.8** que haga ese análisis.
- `frontend_storytelling/` *(TU CARPETA 2 — DESPUÉS DE LOS DATOS)*: Abre `TAREA_2_STORYTELLING_EXPLORATORIO.md` para montar la web narrativa y glosario SAR.

> **Aviso Git:** **NO ejecutes `git merge origin/main`** en esta rama. Trabaja siempre en `jesus` y no modifiques `GEMINI.md`, `LEEME_JESUS.md` ni `datos_compartidos/`.

---

## 2. Pasos con Gemini Flash 3.8 en Antigravity
1. Asegúrate de estar en tu rama:
   ```bash
   git checkout jesus
   git pull origin jesus
   ```
2. **Paso 1 (Prioridad — Estudio de Compatibilidad de Datos):** Abre `data_dana_valencia/TAREA_1_COMPATIBILIDAD_DATOS.md`, copia su prompt y pégalo en Antigravity con **Gemini Flash 3.8**. Revisa después el informe `data_dana_valencia/informe_viabilidad_dana.md`.
3. **Paso 2 (Secundario — Storytelling Exploratorio):** Copia y pega el prompt de `frontend_storytelling/TAREA_2_STORYTELLING_EXPLORATORIO.md` y pruébalo con:
   ```bash
   python3 -m http.server 8000
   ```
   *(Abre `http://localhost:8000/frontend_storytelling/` en el navegador).*

---

## 3. Guardar y subir tus cambios sin errores
```bash
git status
git add data_dana_valencia frontend_storytelling
git commit -m "feat(jesus): estudio compatibilidad datos DANA Valencia y storytelling exploratorio"
git push origin jesus
```
