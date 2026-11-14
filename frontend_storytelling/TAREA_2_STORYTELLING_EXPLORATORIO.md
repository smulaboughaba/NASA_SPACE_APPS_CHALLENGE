# Tarea 2 (Secundaria) — Storytelling Exploratorio y Glosario SAR (`frontend_storytelling/`)

> **Haz esta tarea DESPUÉS de completar `data_dana_valencia/TAREA_1_COMPATIBILIDAD_DATOS.md`.**

## Objetivo
Construir la interfaz narrativa en HTML/CSS/JS puro que muestre las pruebas reales de compatibilidad de la **DANA Valencia 2024** (`reporte_compatibilidad_dana.json`: nubes cegando el óptico frente a vistas `BROWSE` reales de `OPERA DSWx-S1`), la línea temporal **Local ➔ Global** de los 4 eventos, las 5 tarjetas `sar_concepts` y el pie de atribuciones legales.

---

## Prompt optimizado para copiar y pegar en Gemini Flash 3.8 (Antigravity)
```text
Lee GEMINI.md, datos_compartidos/mock_events_contract.json y data_dana_valencia/reporte_compatibilidad_dana.json (si existe).
REGLA ESTRICTA: Crea archivos ÚNICAMENTE dentro de frontend_storytelling/. NO toques GEMINI.md, datos_compartidos/ ni ningún otro archivo fuera de frontend_storytelling/.

Crea index.html, styles.css y app.js dentro de frontend_storytelling/ con temática oscura estilo NASA (HTML/CSS/JS puro):
1. Carga vía fetch ../data_dana_valencia/reporte_compatibilidad_dana.json y ../datos_compartidos/mock_events_contract.json (añade fallback en JS por si falta alguno al abrir en local).
2. Cabecera Hero "Dancing with the SAR's" explicando en 3 tarjetas breves por qué validamos sucesos históricos reales: cero latencia, compatibilidad probada SAR+OpenData e historia Local -> Global.
3. Bloque "Caso DANA Valencia: Prueba Óptica vs Radar": muestra las métricas reales extraídas de reporte_compatibilidad_dana.json (nubosidad % el 29-31 oct, lluvia acumulada, número de escenas OPERA DSWx-S1 y tarjeta visual con el enlace *_BROWSE.png real obtenido).
4. Bloque "Viaje Local -> Global": permite cambiar entre los 4 eventos de events[] en mock_events_contract.json mostrando title, scale, niche, location, dates (t0_pre, t1_event, t2_post_sar), sar_signature y storytelling_summary (OJO: es un STRING único, muéstralo directo).
5. Bloque "Aprende SAR en 1 minuto": 5 tarjetas interactivas leyendo sar_concepts[] con sus ÚNICAS 3 claves (id, title, summary) + Pie de página con event.attributions y el aviso del Disclaimer NASA.
```
