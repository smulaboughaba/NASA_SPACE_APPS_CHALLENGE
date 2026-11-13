# Guía de Permisos y Protección de Ramas en GitHub

Configuración específica para el repositorio:
`https://github.com/smulaboughaba/NASA_SPACE_APPS_CHALLENGE`

## Asignación de usuarios y ramas

| Rama | Propietario autorizado | Acceso de administración |
| :--- | :--- | :--- |
| `main` | Exclusiva de administración | `@smulaboughaba` |
| `samu` | `@smulaboughaba` | `@smulaboughaba` |
| `hugo` | `@hviciana` | `@smulaboughaba` |
| `yaro` | `@ItsYarosun` | `@smulaboughaba` |
| `jesus` | `@jesusorellanagil2002` | `@smulaboughaba` |

---

## Paso 1: Invitar a los colaboradores

1. Entra en [Settings → Collaborators](https://github.com/smulaboughaba/NASA_SPACE_APPS_CHALLENGE/settings/access).
2. Haz clic en **Add people** e invita con rol **Write** a:
   - `hviciana`
   - `ItsYarosun`
   - `jesusorellanagil2002`
3. Tú (`@smulaboughaba`) mantienes el rol **Admin** (propietario).

---

## Paso 2: Ruleset 1 — Acceso exclusivo Admin (`main` y `samu`)

Bloquea a nivel de servidor de GitHub que ningún colaborador pueda hacer push, borrar o modificar `main` o `samu`:

1. Ve a **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset**.
2. **Ruleset Name**: `Acceso exclusivo Admin: main y samu`.
3. **Enforcement status**: `Active`.
4. **Bypass list**:
   - Haz clic en **Add bypass** y selecciona únicamente **Repository admin** (`@smulaboughaba`).
5. **Target branches**:
   - **Add target** → **Include by pattern** → añade `main`.
   - **Add target** → **Include by pattern** → añade `samu`.
6. **Branch rules** (marca las siguientes casillas):
   - **Restrict deletions** (impide borrar `main` o `samu`).
   - **Block force pushes** (impide reescribir el historial).
   - **Require a pull request before merging**:
     - Marca **Require approvals** (mínimo `1`).
     - Marca **Require review from Code Owners** (usa `.github/CODEOWNERS`, donde solo estás tú: `@smulaboughaba`).
   - **Restrict pushes** (si aparece disponible en tu cuenta/plan, impide también pushes directos a estas ramas para quienes no estén en el Bypass).
7. Haz clic en **Create**.

> Con esto, `hviciana`, `ItsYarosun` y `jesusorellanagil2002` no podrán hacer push directo ni a `main` ni a `samu` bajo ninguna circunstancia.

---

## Paso 3: Ruleset 2 — Protección de ramas del equipo (`hugo`, `yaro`, `jesus`) + Guardián automático

En repositorios bajo cuentas personales de GitHub (`smulaboughaba/...`), los Rulesets nativos distinguen por **rol** (Admin vs Write) pero no permiten seleccionar usuarios individuales por rama sin una Organización. Por eso combinamos dos capas:

### Capa A: Ruleset 2 en GitHub

1. Ve a **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset**.
2. **Ruleset Name**: `Protección ramas equipo: hugo, yaro, jesus`.
3. **Enforcement status**: `Active`.
4. **Target branches**:
   - **Add target** → **Include by pattern** → añade `hugo`, `yaro` y `jesus`.
5. **Branch rules**:
   - Marca **Restrict deletions** (nadie puede borrar la rama de otro compañero).
   - **Importante sobre *Block force pushes***:
     - El repositorio incluye el workflow automático [`.github/workflows/branch-access-control.yml`](../.github/workflows/branch-access-control.yml), que detecta en cada `push` si un usuario intentó subir código a la rama de otro compañero y **revierte automáticamente la rama al commit anterior (`git push --force`)** además de marcar el error.
     - Para que ese guardián automático de GitHub Actions pueda ejecutar la reversión en `hugo`, `yaro` y `jesus`, **no marques *Block force pushes*** en este Ruleset 2 (o mantén *Bypass* si tu plan lo permite para la app/actor correspondiente), ya que si *Block force pushes* está activo sin bypass para `GITHUB_TOKEN`, el servidor bloqueará la reversión automática del workflow (aunque el workflow seguirá fallando y alertando del push indebido).
     - En su defecto, si prefieres **bloqueo previo al push (antes de aceptar el `git push`)** a nivel nativo de GitHub para cada integrante por separado, consulta la alternativa gratuita con Organización abajo.
6. **Bypass list**: añade **Repository admin** si quieres poder administrarlas como propietario, y **no añadas** el rol Write.
7. Haz clic en **Create**.

### Capa B: Guardián automático en GitHub Actions

El archivo [`.github/workflows/branch-access-control.yml`](../.github/workflows/branch-access-control.yml) se ejecuta en cada `push` y `pull_request`:
- `main` / `samu` → solo `@smulaboughaba`
- `hugo` → solo `@hviciana` (y `@smulaboughaba`)
- `yaro` → solo `@ItsYarosun` (y `@smulaboughaba`)
- `jesus` → solo `@jesusorellanagil2002` (y `@smulaboughaba`)

Si alguien empuja por error a la rama de otro compañero o intenta abrir un PR desde ella, el job falla inmediatamente y revierte la rama al estado previo.

---

## Alternativa con bloqueo nativo pre-push por usuario (Organización gratuita de GitHub)

Si en lugar de la reversión automática tras el push prefieres que GitHub rechace el `git push` de antemano cuando un integrante intenta empujar a la rama de otro:

1. Crea una **Organización gratuita en GitHub** (p. ej. `NASA-Space-Apps-Team`) y transfiere allí el repositorio (en repositorios públicos es totalmente gratuito; en privados requiere GitHub Team / GitHub Education).
2. Crea 3 **Teams** de un solo miembro dentro de la organización (`team-hugo` con `@hviciana`, `team-yaro` con `@ItsYarosun`, `team-jesus` con `@jesusorellanagil2002`).
3. En **Settings → Branches → Branch protection rules** (reglas clásicas), activa **Restrict who can push to matching branches** en cada rama seleccionando únicamente su Team correspondiente.
