# Tarea 1 — Storytelling, Glosario SAR y Atribuciones (`frontend_storytelling/`)

## Objetivo
Construir la interfaz de **Storytelling Guiado (*Local ➔ Global*)**, las **5 tarjetas interactivas "Aprende SAR en 1 minuto"** y el **pie de créditos legales** usando exactamente las claves de `datos_compartidos/mock_events_contract.json`.

---

## Prompt optimizado para copiar y pegar en Gemini Flash 3.8 (Antigravity)
```text
Lee GEMINI.md, datos_compartidos/mock_events_contract.json y datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md.
REGLA ESTRICTA: Crea archivos ÚNICAMENTE dentro de frontend_storytelling/. NO toques GEMINI.md, datos_compartidos/ ni ningún otro archivo fuera de frontend_storytelling/.

Crea index.html, styles.css y app.js dentro de frontend_storytelling/ con temática oscura estilo NASA Space Apps (HTML/CSS/JS puro sin frameworks):
1. Cabecera Hero con título "Dancing with the SAR's" y un resumen claro (en 3 tarjetas breves) de por qué usamos sucesos históricos reales: cero latencia, entrenamiento validado y storytelling Local -> Global.
2. Bloque "Línea Temporal Local -> Global": lee el array events[] de ../datos_compartidos/mock_events_contract.json via fetch. Al pulsar un evento o usar botones Anterior / Siguiente, muestra:
   - title, scale, niche, location
   - dates.t0_pre, dates.t1_event y dates.t2_post_sar
   - sar_signature.band, sar_signature.mechanism y sar_signature.affected_area_km2
   - storytelling_summary (OJO: storytelling_summary es un string único en el JSON, muéstralo directo sin buscar subcampos).
3. Bloque "Aprende SAR en 1 minuto": genera 5 tarjetas interactivas leyendo el array sar_concepts[] del JSON (l-band, s-band, backscatter, insar, polarizacion), usando ÚNICAMENTE las 3 claves reales de cada objeto: id, title y summary.
4. Pie de página legal: muestra dinámicamente event.attributions del evento activo más la nota del disclaimer oficial NASA explicando que las fuentes externas cumplen sus licencias de uso.
```
