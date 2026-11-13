# Fase 2 — To-Dos: Arquitectura, Diseño y Prototipado

> **Código:** `TODO-F2`  
> **Estado:** Pendiente  
> **Documentos objetivo:** [`../anotaciones/03_decisiones_arquitectura.md`](../anotaciones/03_decisiones_arquitectura.md) y [`../dev/`](../dev/README.md)  

---

## 1. Tareas de Diseño y Arquitectura

- [ ] **Definición del Stack Tecnológico**: Acordar lenguajes, frameworks y librerías para Frontend, Backend y Data Science, y documentarlo en `ANO-03` (`ADR-002`).
- [ ] **Boceto / Wireframe de la Interfaz**: Diseñar las pantallas clave del flujo principal de usuario (Figma, papel o excalidraw) antes de programar la UI.
- [ ] **Esquema de Datos NASA y Contratos API**: Definir en `dev/shared/` el formato exacto JSON de entrada/salida entre Backend, Data Science y Frontend, además de `.env.example`.
- [ ] **Asignación definitiva de módulos en `dev/`**: Actualizar la tabla de roles en [`../MATRIZ_DOCUMENTAL.md`](../MATRIZ_DOCUMENTAL.md) y [`../.github/CODEOWNERS`](../.github/CODEOWNERS) con la carpeta asignada a cada integrante (`frontend/`, `backend/`, `data_science/`, `shared/`).
- [ ] **Validación del prototipo mínimo**: Comprobar que el flujo completo (Dato NASA → Procesamiento → Visualización) es técnicamente viable con datos reales o una muestra (`dev/data_science/samples/`).

---

## 2. Checklist por Bloque Técnico

- [ ] **Frontend (`dev/frontend/`)**: Definir diseño visual, rutas/vistas y librerías de visualización/mapas.
- [ ] **Backend (`dev/backend/`)**: Definir endpoints REST/WebSocket, estrategia de caché para evitar límites de API NASA y manejo de errores.
- [ ] **Data Science (`dev/data_science/`)**: Definir formato de salida del pipeline ETL/modelo para que Backend o Frontend lo consuman directamente.
- [ ] **Shared (`dev/shared/`)**: Publicar esquemas de datos y `.env.example` en `main` antes de iniciar el desarrollo intensivo de Fase 3.
