# Fase 3 — To-Dos: Desarrollo Modular e Integración

> **Código:** `TODO-F3`  
> **Estado:** Pendiente  
> **Directorio objetivo:** [`../dev/`](../dev/README.md)  

---

## 1. Arranque del Entorno Base

- [ ] Inicializar dependencias del proyecto en `dev/frontend/`, `dev/backend/` y `dev/data_science/`.
- [ ] Verificar que todos los miembros tienen configurado su `.env` local (basado en `dev/shared/.env.example`) sin subir secretos al repo.
- [ ] Actualizar cada rama secundaria (`samu`, `hugo`, `yaro`, `jesus`) haciendo `git merge origin/main` antes de empezar a programar.

---

## 2. Desarrollo por Módulo (Ramas Individuales)

- [ ] **Módulo `dev/data_science/`**:
  - [ ] Descarga/ingesta reproducible de datos NASA (`RES-02`).
  - [ ] Limpieza, transformación y generación de salidas según contrato de `dev/shared/`.
  - [ ] Pruebas locales con datos reales y muestra de respaldo offline para la demo.
- [ ] **Módulo `dev/backend/`**:
  - [ ] Implementación de endpoints acordados en Fase 2.
  - [ ] Integración con APIs NASA y/o salidas de `dev/data_science/`.
  - [ ] Validación de respuestas HTTP y manejo de CORS para el Frontend.
- [ ] **Módulo `dev/frontend/`**:
  - [ ] Maquetación de vistas principales según el wireframe de Fase 2.
  - [ ] Conexión inicial con mocks y sustitución por endpoints reales de `dev/backend/`.
  - [ ] Visualización clara e interactiva de los resultados/datos NASA.

---

## 3. Integración Progresiva en `main`

- [ ] **Primer corte de integración (Hito medio)**: Abrir PRs tempranos de cada módulo hacia `main` para comprobar que las piezas conectan sin errores de formato.
- [ ] **Integración de extremo a extremo**: Conectar Frontend + Backend + Data Science funcionando sobre la rama `main`.
- [ ] **Congelación de funcionalidades (*Feature Freeze*)**: Dejar de añadir características nuevas con margen suficiente antes de la Fase 4 para centrarse en estabilidad y presentación.
