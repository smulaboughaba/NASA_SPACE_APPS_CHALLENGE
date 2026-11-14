# Carpeta `dev/` — Desarrollo Modular

Esta carpeta contiene todo el código fuente del proyecto, dividido por módulos independientes para trabajar en paralelo sin conflictos.

> **¿Eres Hugo, Yaro o Jesús y vas a trabajar con Antigravity Flash?**  
> Empieza leyendo [`GUIA_EQUIPO_ANTIGRAVITY.md`](GUIA_EQUIPO_ANTIGRAVITY.md) — tienes tus carpetas exactas y prompts listos para copiar y pegar.

## Estructura modular

| Código | Módulo | Carpeta | Responsable(s) |
| :--- | :--- | :--- | :--- |
| `DEV-00` | Guía Autónoma del Equipo | [`GUIA_EQUIPO_ANTIGRAVITY.md`](GUIA_EQUIPO_ANTIGRAVITY.md) | Hugo, Yaro, Jesús (`@smulaboughaba` coordina) |
| `DEV-01` | Frontend Modular | [`frontend/`](frontend/README.md) | Hugo (`hugo_mapa/`), Yaro (`yaro_analytics/`), Jesús (`jesus_storytelling/`) |
| `DEV-02` | Backend y Orquestación API | [`backend/`](backend/README.md) | Samu (`@smulaboughaba`) |
| `DEV-03` | Extracción de Datos e IA | [`data_science/`](data_science/README.md) | Extracción: Hugo, Yaro, Jesús · Motor IA (`models/`): Samu (`@smulaboughaba`) |
| `DEV-04` | Contratos Compartidos (`JSON` / Config) | [`shared/`](shared/README.md) | Samu (`@smulaboughaba`) + Consumo por Frontend/Backend |

## Normas de trabajo en ramas

1. Cada integrante desarrolla exclusivamente en su rama asignada (`samu`, `hugo`, `yaro`, `jesus`) y **solo dentro de sus subcarpetas**.
2. Todo el Frontend consume el contrato común [`shared/mock_events_contract.json`](shared/mock_events_contract.json) para poder conectarse después al Backend real sin reescribir la interfaz.
3. **Nunca subir archivos `.env`, claves de API ni datos crudos pesados (>5 MB)**.
4. Toda integración hacia `main` se realiza mediante **Pull Request** para revisión y aprobación de `@smulaboughaba`.
