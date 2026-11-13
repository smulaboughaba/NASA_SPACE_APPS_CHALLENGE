# Matriz Documental del Proyecto — NASA Space Apps Challenge

> **Código:** `MAT-00`  
> **Responsable de Gobierno:** Samu (`@smulaboughaba`)  
> **Rama oficial de consolidación:** `main`  

---

## 1. Objetivo del Documento Matriz

Este documento es la **fuente única de verdad y gobierno** del proyecto para el hackathon **NASA Space Apps Challenge**. Su finalidad es centralizar:

1. La **estructura de carpetas** que organiza la investigación, el desarrollo técnico, las anotaciones del equipo y la planificación por fases.
2. El **ciclo de vida por fases** del hackathon, desde la elección del reto hasta la entrega oficial ante la NASA.
3. La **división funcional del equipo** y la matriz de responsabilidades (**RACI**) entre los 4 integrantes.
4. El **índice maestro documental**, que permite rastrear cada documento, su fase, su responsable y su estado actual.

---

## 2. Mapa de Arquitectura de Carpetas

```text
NASA_SPACE_APPS_CHALLENGE/
├── README.md                              # Guía general del repositorio y flujo Git
├── MATRIZ_DOCUMENTAL.md                   # [MAT-00] Documento matriz de gobierno del proyecto
├── .github/                               # Reglas de revisión (CODEOWNERS), plantillas PR y control de ramas
├── docs/                                  # Documentación operativa de repositorio y permisos GitHub
│
├── research/                              # Investigación del reto, fuentes oficiales NASA y propuesta
│   ├── README.md
│   ├── 01_analisis_del_reto.md            # [RES-01] Análisis del Challenge oficial y criterios del jurado
│   ├── 02_fuentes_datos_nasa.md           # [RES-02] Catálogo de APIs, datasets y misiones NASA
│   └── 03_estado_del_arte_y_solucion.md   # [RES-03] Soluciones existentes, propuesta de valor e impacto
│
├── dev/                                   # Código fuente organizado por módulos técnicos
│   ├── README.md                          # Normas de arquitectura y desarrollo en ramas
│   ├── frontend/                          # [DEV-01] Interfaz de usuario y visualización de datos
│   ├── backend/                           # [DEV-02] API, lógica de negocio e integración de servicios
│   ├── data_science/                      # [DEV-03] Procesamiento de datos NASA, análisis y modelos
│   └── shared/                            # [DEV-04] Contratos de datos, utilidades comunes y .env.example
│
├── anotaciones/                           # Cuadernos vivos de ideación, reuniones y decisiones
│   ├── README.md
│   ├── 01_brainstorming_ideas.md          # [ANO-01] Lluvia de ideas, pros/contras y votación
│   ├── 02_bitacora_reuniones.md           # [ANO-02] Puntos de control (checkpoints) del equipo
│   └── 03_decisiones_arquitectura.md      # [ANO-03] Registro ligero de decisiones técnicas (ADR)
│
└── todos/                                 # Listas de tareas ejecutables organizadas por fase
    ├── README.md                          # Panel general y criterios de paso entre fases
    ├── fase_1_investigacion_y_reto.md     # [TODO-F1] Tareas de Fase 1
    ├── fase_2_arquitectura_y_diseno.md    # [TODO-F2] Tareas de Fase 2
    ├── fase_3_desarrollo_e_integracion.md # [TODO-F3] Tareas de Fase 3
    └── fase_4_testing_pitch_y_entrega.md  # [TODO-F4] Tareas de Fase 4
```

---

## 3. Fases del Proyecto (Ciclo de Vida del Hackathon)

El trabajo del equipo se divide en **4 fases secuenciales con hitos claros** antes de pasar a la siguiente etapa:

| Fase | Nombre | Propósito principal | Entregable clave de salida |
| :--- | :--- | :--- | :--- |
| **Fase 1** | **Investigación, Reto y Datos NASA** | Analizar el challenge seleccionado, localizar APIs/datasets oficiales de la NASA y acordar el enfoque de la solución. | `RES-01`, `RES-02`, `RES-03` completos y alcance cerrado. |
| **Fase 2** | **Arquitectura, Diseño y Prototipado** | Elegir el stack tecnológico, definir contratos de datos entre módulos, bocetar la interfaz y repartir submódulos en `dev/`. | `ANO-03` (stack cerrado), contratos en `dev/shared/` y reparto técnico. |
| **Fase 3** | **Desarrollo Modular e Integración** | Implementar en paralelo desde las ramas (`samu`, `hugo`, `yaro`, `jesus`) dentro de `dev/` e integrar de forma continua hacia `main` vía Pull Request. | Producto funcional integrado en `main` con todas las piezas conectadas. |
| **Fase 4** | **Pruebas, Storytelling, Pitch y Entrega Oficial NASA** | Ejecutar pruebas de extremo a extremo, preparar la demo en vivo, elaborar el vídeo/presentación y completar la entrega oficial en NASA Space Apps. | Demo validada, pitch cerrado y proyecto enviado en la plataforma NASA. |

---

## 4. Cómo se divide el proyecto (Roles y Matriz RACI)

### 4.1. Equipo y asignación de ramas

Cada integrante desarrolla en su rama personal y sube sus avances a `main` mediante **Pull Request** revisado por el administrador (`@smulaboughaba`). Los roles técnicos específicos dentro de `dev/` se confirmarán y ajustarán en la **Fase 2** según el reto elegido:

| Integrante | Usuario GitHub | Rama asignada | Rol / Área principal *(a definir según el reto)* | Responsabilidades transversales |
| :--- | :--- | :--- | :--- | :--- |
| **Samu** | `@smulaboughaba` | `samu` | Coordinación / Arquitectura / Integración *(por confirmar módulo técnico)* | Gobierno de `main`, revisión de PRs, control de calidad documental y coordinación de entregables. |
| **Hugo** | `@hviciana` | `hugo` | *Por asignar (ej. Frontend / Backend / Datos / Diseño)* | Investigación del reto (`research/`), desarrollo de su módulo en `dev/` y registro de avances en `todos/`. |
| **Yaro** | `@ItsYarosun` | `yaro` | *Por asignar (ej. Frontend / Backend / Datos / Diseño)* | Investigación de datos NASA (`research/`), desarrollo de su módulo en `dev/` y pruebas de integración. |
| **Jesús** | `@jesusorellanagil2002` | `jesus` | *Por asignar (ej. Frontend / Backend / Datos / Diseño)* | Análisis técnico (`research/`), desarrollo de su módulo en `dev/` y soporte a documentación/pitch. |

### 4.2. Matriz RACI por bloque de trabajo

Leyenda: **R** = Responsable de ejecutar · **A** = Aprobador final · **C** = Consultado · **I** = Informado

| Bloque / Apartado | Samu (`@smulaboughaba`) | Hugo (`@hviciana`) | Yaro (`@ItsYarosun`) | Jesús (`@jesusorellanagil2002`) |
| :--- | :---: | :---: | :---: | :---: |
| **Gobierno de `main` y Pull Requests** | **A / R** | I | I | I |
| **Investigación del reto y datos NASA (`research/`)** | **A** | **R** | **R** | **R** |
| **Ideación, actas y decisiones (`anotaciones/`)** | **A / R** | **C / R** | **C / R** | **C / R** |
| **Arquitectura y contratos (`dev/shared/`)** | **A / R** | **C** | **C** | **C** |
| **Desarrollo Frontend (`dev/frontend/`)** | **A** | **C / R** *(por asignar)* | **C / R** *(por asignar)* | **C / R** *(por asignar)* |
| **Desarrollo Backend (`dev/backend/`)** | **A** | **C / R** *(por asignar)* | **C / R** *(por asignar)* | **C / R** *(por asignar)* |
| **Datos y Ciencia NASA (`dev/data_science/`)** | **A** | **C / R** *(por asignar)* | **C / R** *(por asignar)* | **C / R** *(por asignar)* |
| **Seguimiento de To-Dos (`todos/`)** | **A / R** | **R** | **R** | **R** |
| **Testing final, Pitch y Entrega NASA** | **A / R** | **R** | **R** | **R** |

---

## 5. Matriz de Control Documental (Índice Maestro)

| Código | Documento | Archivo | Fase | Responsable | Estado |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `MAT-00` | Matriz Documental del Proyecto | [`MATRIZ_DOCUMENTAL.md`](MATRIZ_DOCUMENTAL.md) | Transversal | Samu (`@smulaboughaba`) | En preparación |
| `RES-01` | Análisis del Reto NASA | [`research/01_analisis_del_reto.md`](research/01_analisis_del_reto.md) | Fase 1 | Todo el equipo | Pendiente |
| `RES-02` | Fuentes y Datos Oficiales NASA | [`research/02_fuentes_datos_nasa.md`](research/02_fuentes_datos_nasa.md) | Fase 1 | Todo el equipo | Pendiente |
| `RES-03` | Estado del Arte y Solución Propuesta | [`research/03_estado_del_arte_y_solucion.md`](research/03_estado_del_arte_y_solucion.md) | Fase 1 | Todo el equipo | Pendiente |
| `DEV-01` | Módulo Frontend | [`dev/frontend/README.md`](dev/frontend/README.md) | Fase 2–3 | *Por asignar* | Pendiente |
| `DEV-02` | Módulo Backend | [`dev/backend/README.md`](dev/backend/README.md) | Fase 2–3 | *Por asignar* | Pendiente |
| `DEV-03` | Módulo Data Science | [`dev/data_science/README.md`](dev/data_science/README.md) | Fase 2–3 | *Por asignar* | Pendiente |
| `DEV-04` | Módulo Shared (Contratos y Config) | [`dev/shared/README.md`](dev/shared/README.md) | Fase 2–3 | Samu + Equipo | Pendiente |
| `ANO-01` | Brainstorming e Ideas | [`anotaciones/01_brainstorming_ideas.md`](anotaciones/01_brainstorming_ideas.md) | Fase 1 | Todo el equipo | Pendiente |
| `ANO-02` | Bitácora de Reuniones | [`anotaciones/02_bitacora_reuniones.md`](anotaciones/02_bitacora_reuniones.md) | Transversal | Rotativo / Samu | Pendiente |
| `ANO-03` | Decisiones de Arquitectura (ADR) | [`anotaciones/03_decisiones_arquitectura.md`](anotaciones/03_decisiones_arquitectura.md) | Fase 2–3 | Samu + Equipo | Pendiente |
| `TODO-F1` | Checklist Fase 1: Investigación y Reto | [`todos/fase_1_investigacion_y_reto.md`](todos/fase_1_investigacion_y_reto.md) | Fase 1 | Todo el equipo | En preparación |
| `TODO-F2` | Checklist Fase 2: Arquitectura y Diseño | [`todos/fase_2_arquitectura_y_diseno.md`](todos/fase_2_arquitectura_y_diseno.md) | Fase 2 | Todo el equipo | Pendiente |
| `TODO-F3` | Checklist Fase 3: Desarrollo e Integración | [`todos/fase_3_desarrollo_e_integracion.md`](todos/fase_3_desarrollo_e_integracion.md) | Fase 3 | Todo el equipo | Pendiente |
| `TODO-F4` | Checklist Fase 4: Testing, Pitch y Entrega | [`todos/fase_4_testing_pitch_y_entrega.md`](todos/fase_4_testing_pitch_y_entrega.md) | Fase 4 | Todo el equipo | Pendiente |

---

## 6. Convención de Estados Documentales

- **Pendiente**: Plantilla creada, aún sin contenido del reto.
- **En preparación**: El equipo está completando activamente el documento.
- **En revisión**: Listo en rama secundaria mediante Pull Request, pendiente de aprobación en `main`.
- **Aprobado**: Validado y consolidado en `main`.
