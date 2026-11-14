# Guía Rápida para Yaro (`@ItsYarosun`) — Rama `yaro`

Bienvenido a tu espacio de trabajo limpio. Aquí solo ves lo necesario para construir tus 2 bloques del reto **Dancing with the SAR's** usando **Claude Code en VS Code**.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contiene el contrato JSON único y las fuentes NASA/Open Data ya filtradas para ti. **No lo edites.**
- `frontend_analytics/` *(TU CARPETA 1)*: Aquí va tu **Dashboard Analítico de Ciencia de Datos SAR + SHAP** (`TAREA_1_ANALYTICS.md`).
- `data_incendios_cultivos/` *(TU CARPETA 2)*: Aquí va tu **script Python de clima/incendios + informe L-Band vs S-Band** (`TAREA_2_DATOS.md`).

> **Importante:** **NO ejecutes `git merge origin/main`** en esta rama. `main` tiene otra estructura y chocará con la tuya; Samu importará tus avances desde aquí cuando los subas. Tampoco modifiques `CLAUDE.md`, `LEEME_YARO.md` ni `datos_compartidos/`.

---

## 2. Cómo trabajar con Claude Code en VS Code
1. Abre VS Code en la carpeta raíz de este repositorio asegurándote de estar en la rama **`yaro`**:
   ```bash
   git checkout yaro
   git pull origin yaro
   ```
2. Abre el panel de **Claude Code** (leerá `CLAUDE.md` automáticamente).
3. Copia y pega primero el prompt de **`frontend_analytics/TAREA_1_ANALYTICS.md`** y pruébalo abriendo un servidor local rápido:
   ```bash
   python3 -m http.server 8000
   ```
   *(Entra en `http://localhost:8000/frontend_analytics/` para ver tu dashboard funcionando).*
4. Después copia y pega el prompt de **`data_incendios_cultivos/TAREA_2_DATOS.md`** para descargar datos meteorológicos reales sin API key y analizar incendios/cultivos.

---

## 3. Cómo guardar y subir tus cambios sin errores
Comprueba primero que solo tocaste tus 2 carpetas (`git status`), y después sube:
```bash
git status
git add frontend_analytics data_incendios_cultivos
git commit -m "feat(yaro): dashboard analytics y extraccion incendios-cultivos"
git push origin yaro
```
Si sin querer editaste un archivo fuera de `frontend_analytics/` o `data_incendios_cultivos/`, GitHub rechazará el `push` y restaurará la rama automáticamente para proteger el repo.
