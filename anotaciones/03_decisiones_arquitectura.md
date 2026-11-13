# Registro de Decisiones de Arquitectura (ADR)

> **Código:** `ANO-03`  
> **Fase:** Fase 2 y Fase 3  
> **Estado:** Pendiente  

---

## Cómo usar este archivo

Cada vez que el equipo tome una decisión técnica importante (stack, librería de mapas, base de datos, modelo de IA, hosting de la demo), se añade una ficha ADR corta para que los 4 miembros trabajen alineados.

---

## Índice de Decisiones

| ID | Fecha | Decisión | Estado | Propuesto por |
| :--- | :--- | :--- | :--- | :--- |
| `ADR-001` | `2026-11-13` | Estrategia de ramas individuales con consolidación en `main` | Aceptada | `@smulaboughaba` |
| `ADR-002` | *(Fecha)* | *(Elección del stack Frontend / Backend / Data)* | Propuesta | *(Usuario)* |

---

### `ADR-001` — Estrategia de ramas individuales con consolidación en `main`
- **Estado:** Aceptada
- **Contexto:** Equipo de 4 personas trabajando en paralelo en un hackathon con necesidad de aislar desarrollos y proteger la rama principal.
- **Qué decidimos:** Cada miembro trabaja exclusivamente en su rama (`samu`, `hugo`, `yaro`, `jesus`) y los cambios se integran a `main` mediante Pull Request revisado por `@smulaboughaba`, con validación automática vía GitHub Actions.
- **Consecuencias:** Evita conflictos destructivos directos sobre `main` y mantiene trazabilidad clara de autoría por módulo.

---

### `ADR-002` — *(Título de la decisión técnica, ej. Stack del proyecto)*
- **Estado:** Propuesta
- **Contexto:** *(Qué problema técnico o requisito del reto motiva la decisión)*
- **Qué decidimos:** *(Tecnología, librería o patrón seleccionado)*
- **Por qué (alternativas descartadas):** *(Razón de la elección frente a otras opciones)*
- **Quién lo propuso:** *(Nombre / `@usuario`)*

