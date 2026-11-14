# Guía Rápida para Hugo (`@hviciana`) — Rama `hugo`

Bienvenido a tu espacio de trabajo limpio. Aquí solo ves lo que necesitas para construir tus 2 bloques del reto **Dancing with the SAR's** usando **Claude Code en VS Code**.

---

## 1. ¿Qué carpetas hay aquí?
- `datos_compartidos/` *(SOLO LECTURA)*: Contiene el contrato JSON único y las fuentes NASA/Open Data ya filtradas para ti. **No lo edites.**
- `frontend_mapa/` *(TU CARPETA 1)*: Aquí va tu **Visor Geoespacial Interactivo con mapa** (`TAREA_1_MAPA.md`).
- `data_inundaciones/` *(TU CARPETA 2)*: Aquí va tu **script Python de lluvia DANA Valencia + informe de análisis** (`TAREA_2_DATOS.md`).

> **Importante:** **NO ejecutes `git merge origin/main`** en esta rama. `main` tiene otra estructura y chocará con la tuya; Samu importará tus avances desde aquí cuando los subas. Tampoco modifiques `CLAUDE.md`, `LEEME_HUGO.md` ni `datos_compartidos/`.

---

## 2. Cómo trabajar con Claude Code en VS Code
1. Abre VS Code en la carpeta raíz de este repositorio asegurándote de estar en la rama **`hugo`**:
   ```bash
   git checkout hugo
   git pull origin hugo
   ```
2. Abre el panel de **Claude Code** (él leerá `CLAUDE.md` automáticamente).
3. Copia y pega primero el prompt de **`frontend_mapa/TAREA_1_MAPA.md`** y pruébalo abriendo un servidor local rápido:
   ```bash
   python3 -m http.server 8000
   ```
   *(Entra en `http://localhost:8000/frontend_mapa/` para ver tu mapa funcionando).*
4. Después copia y pega el prompt de **`data_inundaciones/TAREA_2_DATOS.md`** para descargar y analizar la lluvia real de la DANA.

---

## 3. Cómo guardar y subir tus cambios sin errores
Comprueba primero que solo tocaste tus 2 carpetas (`git status`), y después sube:
```bash
git status
git add frontend_mapa data_inundaciones
git commit -m "feat(hugo): visor mapa SAR y extraccion DANA Valencia"
git push origin hugo
```
Si sin querer editaste un archivo fuera de `frontend_mapa/` o `data_inundaciones/`, GitHub rechazará el `push` y restaurará la rama automáticamente para proteger el repo.
