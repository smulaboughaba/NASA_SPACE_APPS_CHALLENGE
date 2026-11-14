# Tarea 2 de Visualización — Storyboard Animado de 4 Hyperframes (`frontend_storytelling/`)

## Objetivo
Construir el módulo visual **Scrollytelling / Storyboard Animado de los 4 Hyperframes** que muestre paso a paso cómo el flujo IA (`Satélite + Open Big Data ➔ Nivel 1 T-SAR-JEPA/InSAR ➔ Nivel 2 LightGBM/SHAP`) explica los desastres desde escala **Local ➔ Global**, junto con el glosario `sar_concepts` y el pie legal.

---

## Prompt optimizado para copiar y pegar en Gemini Flash 3.8 (Antigravity)
```text
Lee GEMINI.md, datos_compartidos/mock_events_contract.json, datos_compartidos/FUENTES_Y_CONTEXTO_JESUS.md y data_global_insar/hyperframes_global_insar.json (si existe).
REGLA ESTRICTA: Crea archivos ÚNICAMENTE dentro de frontend_storytelling/. NO toques GEMINI.md, datos_compartidos/ ni ningún otro archivo fuera de frontend_storytelling/.

Crea index.html, styles.css y app.js dentro de frontend_storytelling/ con temática oscura estilo NASA Space Apps (HTML/CSS/JS puro):
1. Carga vía fetch ../data_global_insar/hyperframes_global_insar.json y ../datos_compartidos/mock_events_contract.json (añade fallback en JS por si hyperframes_global_insar.json aún no se generó).
2. Cabecera Hero "Dancing with the SAR's" explicando en 3 tarjetas breves por qué usamos sucesos históricos reales: cero latencia, validación científica con Open Big Data e historia Local -> Global.
3. Bloque "Storyboard Animado IA — Los 4 Hyperframes":
   - Botón Play / Pausa (auto-avance animado cada 3.5s) y pasos interactivos 1 -> 2 -> 3 -> 4 mostrando visualmente el flujo del pipeline:
     [Satélite NASA + Open Big Data] -> [Nivel 1 T-SAR-JEPA / InSAR] -> [Nivel 2 LightGBM + SHAP].
   - Muestra en cada frame: stage, headline, ai_pipeline_layer, métricas reales del frame y la imagen preview de visual_layer.sar_browse_url cuando exista.
4. Bloque "Viaje Local -> Global": lee los 4 eventos de events[] en mock_events_contract.json (usando storytelling_summary como string directo, dates.t0_pre / t1_event / t2_post_sar, y sar_signature).
5. Bloque "Aprende SAR en 1 minuto": lee sar_concepts[] usando SOLO las 3 claves reales (id, title, summary) + Pie de página con event.attributions y el aviso del Disclaimer NASA.
```
