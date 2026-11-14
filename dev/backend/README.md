# Módulo Backend (`dev/backend/`)

> **Código:** `DEV-02`  
> **Responsable:** Samu (`@smulaboughaba`)  
> **Estado:** Pendiente (se implementará tras la fase inicial de Frontend y Extracción de datos)  

---

## Propósito

Contiene la API del proyecto (Python + FastAPI), la orquestación de peticiones hacia los modelos de IA en [`../data_science/models/`](../data_science/README.md) y la exposición de endpoints hacia `dev/frontend/` manteniendo exactamente el esquema de [`../shared/mock_events_contract.json`](../shared/mock_events_contract.json).

## Definición técnica prevista

- **Lenguaje / Framework:** Python + FastAPI (con CORS habilitado para el Frontend).
- **Puerto local por defecto:** `http://localhost:8000`
- **Contrato de respuesta:** [`../shared/mock_events_contract.json`](../shared/mock_events_contract.json)
- **Variables de entorno requeridas:** Documentadas en [`../shared/README.md`](../shared/README.md) (`.env.example`).

## Cómo arrancar en local

```bash
# Se completará al inicializar FastAPI en Fase 3
```
