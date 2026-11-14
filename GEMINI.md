# Reglas Obligatorias para Gemini Flash 3.8 (Antigravity) — Rama `jesus`

Eres el asistente de **Jesús** (`@jesusorellanagil2002`) para el proyecto **Dancing with the SAR's** (NASA Space Apps Challenge).

## 1. REGLA CRÍTICA DE CARPETAS (NO ROMPER)
- **SOLO puedes crear o editar archivos dentro de:**
  1. `frontend_storytelling/`
  2. `data_global_insar/`
- **PROHIBIDO modificar, crear o borrar:**
  - `GEMINI.md`, `LEEME_JESUS.md`, `.gitignore`, `.github/`
  - Todo lo que está en `datos_compartidos/` (**SOLO LECTURA**)
  - Cualquier archivo fuera de `frontend_storytelling/` y `data_global_insar/`
*(GitHub Actions revertirá automáticamente la rama si modificas cualquier otro archivo).*

---

## 2. ESQUEMA EXACTO DEL JSON (PROHIBIDO INVENTAR CLAVES)
Antes de escribir código, lee `datos_compartidos/mock_events_contract.json`. Usa **exactamente estas claves** y **NO inventes otras**:

- Raíz del JSON:
  - `project`: `"Dancing with the SAR's"`
  - `events`: array de 4 eventos (`dana-valencia-2024`, `incendio-forestal-mediterraneo`, `terremoto-insar-global`, `ciclon-elnino-global`)
  - `sar_concepts`: array de 5 conceptos (`l-band`, `s-band`, `backscatter`, `insar`, `polarizacion`)

- Cada elemento de `events[]` tiene:
  - `id`, `title`, `scale` (`"local"` o `"global"`), `niche`, `location`
  - `dates`: `{ "t0_pre": "...", "t1_event": "...", "t2_post_sar": "..." }`
  - `sar_signature`: `{ "sensor_reference": "...", "band": "...", "polarization": "...", "mechanism": "...", "jepa_latent_anomaly_score": <num>, "affected_area_km2": <num>, "false_positive_reduction_pct": <num> }`
  - `storytelling_summary`: **es un STRING directo (texto plano), NO un objeto.**
  - `attributions`: array de strings con las fuentes a citar.

- Cada elemento de `sar_concepts[]` tiene **únicamente 3 claves**:
  - `id`, `title`, `summary`

---

## 3. REGLAS TÉCNICAS
1. Lee `datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md` antes de redactar explicaciones científicas.
2. En `frontend_storytelling/`, usa HTML5 + CSS3 + JavaScript puro (`index.html`, `styles.css`, `app.js`) sin necesidad de `npm install`, cargando el JSON con `fetch('../datos_compartidos/mock_events_contract.json')`.
3. En `data_global_insar/`, usa Python con librerías estándar (`urllib.request`, `json`) para evitar errores de instalación.
4. Responde paso a paso en español indicando qué archivos exactos modificaste.
