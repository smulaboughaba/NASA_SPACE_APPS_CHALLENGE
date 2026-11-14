# Módulo Frontend (`dev/frontend/`)

> **Código:** `DEV-01`  
> **Stack Maestro en `main` (`ADR-003`):** **Vite + MapLibre GL JS + Deck.gl + GSAP (`ScrollTrigger` / *Hyperframes*) + Chart.js**  
> **Responsables de prototipos modulares:** Hugo (`@hviciana`), Yaro (`@ItsYarosun`) y Jesús (`@jesusorellanagil2002`) · **Integración Vite/Awwwards en `main`:** Samu (`@smulaboughaba`)

---

## 1. Arquitectura de Integración (Prototipo por Caso ➔ Shell Vite 3D/Animado)

1. **En las ramas aisladas (`hugo`, `yaro`, `jesus`):**
   - Cada compañero construye el reproductor animado de **4 Hyperframes** para su caso histórico sin necesidad de configurar Node/Vite en su rama.
   - Todo módulo consume su JSON de viabilidad generado (`hyperframes_<caso>.json`) junto al contrato base [`../shared/mock_events_contract.json`](../shared/mock_events_contract.json).
2. **En `main` (`dev/frontend/`):**
   - Una vez importados sus avances con [`../scripts/sincronizar_equipo.sh`](../scripts/sincronizar_equipo.sh), Samu unifica los módulos dentro de un proyecto **Vite** con **MapLibre GL JS + Deck.gl** (cámara 3D WebGL sin token de pago, relieve DEM y cortina/barrido radar animado) y **GSAP Hyperframes** sincronizados con las respuestas de **FastAPI** (`dev/backend/`).

---

## 2. Reparto de Submódulos

| Subcarpeta en `main` | Origen en rama aislada | Caso asignado y visor exploratorio |
| :--- | :--- | :--- |
| `hugo_mapa/` | `origin/hugo:frontend_mapa/` | **Sequía e Incendios Los Ángeles 2025:** mapa Leaflet, `bbox`, vista previa `Sentinel-1` real, capa sequía/humo/deformación `DISP-S1` y selector temporal de datos compatibles. |
| `yaro_analytics/` | `origin/yaro:frontend_analytics/` | **El Niño y Ciclón Pacífico:** gráficas `Chart.js` exploratorias de lluvia, viento, cobertura costera afectada y pesos `SHAP` (`L-Band` vs `S-Band`). |
| `jesus_storytelling/` | `origin/jesus:frontend_storytelling/` | **DANA Valencia 2024 + Viaje Local ➔ Global:** comparador de ceguera óptica por nubes frente a radar `OPERA DSWx-S1`, narrativa guiada y tarjetas educativas `sar_concepts`. |
