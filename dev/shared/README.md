# Módulo Shared (`dev/shared/`)

> **Código:** `DEV-04`  
> **Responsable:** Samu (`@smulaboughaba`) + Consumo por Frontend/Backend  
> **Estado:** En preparación (Contrato v1.0.0 publicado)  

---

## Propósito

Mantiene los contratos compartidos que conectan `dev/frontend/`, `dev/backend/` y `dev/data_science/` para que los 3 bloques de interfaz y los pipelines de datos avancen en paralelo sin incompatibilidades.

## Contratos publicados

| Archivo | Productor | Consumidor | Descripción |
| :--- | :--- | :--- | :--- |
| [`mock_events_contract.json`](mock_events_contract.json) | `backend/` / `data_science/` | `frontend/` (`hugo_mapa`, `yaro_analytics`, `jesus_storytelling`) | Esquema v1.0.0 con sucesos reales (`DANA Valencia`, `Incendio`, `Terremoto InSAR`, `Ciclón / El Niño`), métricas SAR, fusión Open Data, valores `SHAP`, conceptos SAR y atribuciones oficiales. |
