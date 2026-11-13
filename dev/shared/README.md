# Módulo Shared (`dev/shared/`)

> **Código:** `DEV-04`  
> **Responsable:** Samu (`@smulaboughaba`) + Equipo  
> **Estado:** Pendiente  

---

## Propósito

Mantiene las piezas transversales que conectan `frontend/`, `backend/` y `data_science/` para evitar incompatibilidades durante el desarrollo en paralelo.

## Contenido previsto

1. **Contratos de datos / Esquemas JSON**: Definición exacta de las estructuras de entrada y salida entre Frontend, Backend y Data Science.
2. **Constantes y utilidades comunes**: Coordenadas de referencia, unidades de medida, catálogos compartidos.
3. **Plantilla de variables de entorno (`.env.example`)**: Lista de variables necesarias (p. ej. `NASA_API_KEY=tu_clave_aqui`) sin incluir jamás valores reales secretos.

## Contratos acordados (completar en Fase 2)

| Contrato | Productor | Consumidor | Descripción |
| :--- | :--- | :--- | :--- |
| *(Ej. `nasa_events_v1.json`)* | `backend/` | `frontend/` | *(Formato de respuesta de eventos geolocalizados)* |
