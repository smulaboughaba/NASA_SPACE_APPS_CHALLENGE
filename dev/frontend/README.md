# Módulo Frontend (`dev/frontend/`)

> **Código:** `DEV-01`  
> **Responsables:** Hugo (`@hviciana`), Yaro (`@ItsYarosun`) y Jesús (`@jesusorellanagil2002`) · **Integración en `main`:** Samu (`@smulaboughaba`)  
> **Estado:** En preparación  

---

## División de Carpetas (Trabajo Paralelo sin Conflictos)

| Subcarpeta | Responsable | Qué construye | Fuente de datos |
| :--- | :--- | :--- | :--- |
| `hugo_mapa/` | Hugo (`@hviciana`) | Visor geoespacial interactivo (`Leaflet`), `bbox` y comparador deslizante *Óptico vs SAR* | [`../shared/mock_events_contract.json`](../shared/mock_events_contract.json) |
| `yaro_analytics/` | Yaro (`@ItsYarosun`) | Panel de Ciencia de Datos (`Chart.js`): atribuciones `SHAP`, uso de suelo y `L-Band vs S-Band` | [`../shared/mock_events_contract.json`](../shared/mock_events_contract.json) |
| `jesus_storytelling/` | Jesús (`@jesusorellanagil2002`) | Cabecera *Dancing with the SAR's*, línea temporal *Local ➔ Global*, tarjetas educativas y atribuciones legales | [`../shared/mock_events_contract.json`](../shared/mock_events_contract.json) |

> Para instrucciones paso a paso y prompts listos en Antigravity Flash, consulta [`../GUIA_EQUIPO_ANTIGRAVITY.md`](../GUIA_EQUIPO_ANTIGRAVITY.md).

## Cómo arrancar en local

Cada submódulo está diseñado para funcionar de forma independiente en navegador (`index.html` o servidor local simple como `python3 -m http.server`) leyendo el contrato JSON compartido [`../shared/mock_events_contract.json`](../shared/mock_events_contract.json).
