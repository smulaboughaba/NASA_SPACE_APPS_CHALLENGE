# Guía de Permisos y Protección de Ramas en GitHub

Una vez que hayas creado el repositorio en GitHub y subido las 5 ramas (`main`, `jesus`, `yaro`, `hugo`, `samu`), sigue estos pasos para aplicar el control de accesos.

---

## 1. Invitar a los colaboradores

1. Ve a tu repositorio en GitHub → **Settings** → **Collaborators** (o **Collaborators and teams**).
2. Haz clic en **Add people** e invita a los usuarios de GitHub de Jesús, Yaro, Hugo y Samu con rol **Write**.
3. Tú (`@smulaboughaba`) mantienes el rol **Admin** (propietario del repositorio).

---

## 2. Proteger `main` (acceso exclusivo para ti)

Para impedir que ningún integrante pueda hacer push directo o modificar `main`, y exigir que todo pase por Pull Request aprobado por ti:

1. Ve a **Settings** → **Rules** → **Rulesets** (o **Branches** → **Add branch ruleset**).
2. Nombre del ruleset: `Proteccion main`.
3. **Enforcement status**: `Active`.
4. **Target branches**: Haz clic en **Add target** → **Include by pattern** → escribe `main`.
5. Activa las siguientes reglas (**Branch rules**):
   - **Restrict deletions**: evita que nadie borre la rama `main`.
   - **Block force pushes**: evita reescrituras de historial en `main`.
   - **Require a pull request before merging**:
     - Marca **Require approvals** (mínimo `1`).
     - Marca **Require review from Code Owners** (usará `.github/CODEOWNERS`, donde solo estás tú: `@smulaboughaba`).
6. **Bypass list**:
   - Haz clic en **Add bypass** y selecciona únicamente **Repository admin** (tú).
   - De este modo, tú podrás hacer push o merge directo a `main`, mientras que los demás colaboradores no podrán hacer push directo ni aprobar sus propios PRs.
7. Haz clic en **Create** para guardar.

---

## 3. Permisos por rama secundaria (`jesus`, `yaro`, `hugo`, `samu`)

En GitHub, la forma de gestionar los permisos en cada rama depende del tipo de cuenta o plan donde esté alojado el repositorio:

### Opción A: Organización de GitHub (GitHub Team / GitHub Education Pack) o cuenta GitHub Pro (en repos privados) / Repo Público con Branch Protection

Si el repositorio es **público** o está en **GitHub Pro / Organización con Team o Education Pack**, puedes restringir explícitamente quién hace push a cada rama individual:

1. Crea un ruleset o regla de protección (**Settings** → **Branches** → **Add classic branch protection rule** o **Rulesets**) para cada rama:
   - Regla para `jesus`: activa **Restrict who can push to matching branches** y añade únicamente al usuario de GitHub de Jesús (y a ti como Admin si quieres respaldo).
   - Regla para `yaro`: restringe pushes únicamente al usuario de GitHub de Yaro.
   - Regla para `hugo`: restringe pushes únicamente al usuario de GitHub de Hugo.
   - Regla para `samu`: restringe pushes únicamente al usuario de GitHub de Samu.
2. Activa también **Allow force pushes** desmarcado (bloqueado) y **Allow deletions** desmarcado en todas ellas para evitar borrados accidentales.

> **Nota sobre GitHub:** La opción clásica *"Restrict who can push to matching branches"* en repositorios privados requiere que el repo pertenezca a una Organización (plan Team / Enterprise / GitHub Campus) o que sea público. En repositorios privados de cuentas personales gratuitas (GitHub Free), GitHub permite proteger ramas frente a borrados/force-push, pero no restringir pushes por usuario individual.

### Opción B: Cuenta personal gratuita en repositorio privado

Si el repositorio es privado bajo una cuenta gratuita de GitHub Free (sin restricción de push por usuario individual en branch rules):

1. Crea un ruleset para el patrón de ramas de desarrollo (`jesus`, `yaro`, `hugo`, `samu`) activando:
   - **Restrict deletions** (nadie puede borrar la rama de otro).
   - **Block force pushes** (nadie puede sobrescribir el historial de otro).
2. Cada integrante trabaja únicamente en su rama asignada (`git checkout <su-rama>`).
3. La seguridad de integración queda garantizada porque **`main` sí está protegida** y todos los cambios hacia `main` requieren Pull Request y aprobación tuya vía `CODEOWNERS` (`@smulaboughaba`).
4. Además, cuando organicemos los roles y carpetas del proyecto, se pueden asignar las rutas correspondientes en `.github/CODEOWNERS` para controlar las revisiones por módulo.

