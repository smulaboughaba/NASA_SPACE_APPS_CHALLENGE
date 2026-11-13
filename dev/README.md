# Carpeta `dev/` — Desarrollo Modular

Esta carpeta contiene todo el código fuente del proyecto, dividido por responsabilidades técnicas para que el equipo pueda trabajar en paralelo sin conflictos.

## Estructura modular

| Código | Módulo | Carpeta | Responsabilidad principal |
| :--- | :--- | :--- | :--- |
| `DEV-01` | Frontend | [`frontend/`](frontend/README.md) | Interfaz de usuario, experiencia interactiva y visualización de datos. |
| `DEV-02` | Backend | [`backend/`](backend/README.md) | API, lógica de negocio, orquestación y conexión con servicios/APIs NASA. |
| `DEV-03` | Data Science | [`data_science/`](data_science/README.md) | Ingesta, limpieza, procesamiento de datasets NASA y modelos analíticos. |
| `DEV-04` | Shared | [`shared/`](shared/README.md) | Contratos de datos (esquemas JSON/tipos), utilidades comunes y plantillas `.env.example`. |

## Normas de trabajo en ramas

1. Cada integrante desarrolla exclusivamente en su rama asignada (`samu`, `hugo`, `yaro`, `jesus`).
2. Antes de codificar un nuevo bloque, comprobar en [`../todos/`](../todos/README.md) y en [`../anotaciones/03_decisiones_arquitectura.md`](../anotaciones/03_decisiones_arquitectura.md) el stack y los contratos definidos en `dev/shared/`.
3. **Nunca subir archivos `.env`, claves de API ni datos pesados binarios** (usar `.env.example` en `dev/shared/` y mantener los datasets pesados fuera de Git o bajo tamaño mínimo de muestra).
4. Toda integración hacia `main` se realiza mediante **Pull Request** desde la rama correspondiente para revisión de `@smulaboughaba`.
