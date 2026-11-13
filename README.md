# NASA Space Apps Challenge

Repositorio oficial del proyecto para el hackathon **NASA Space Apps Challenge**.

## Estructura de ramas y responsables

| Rama | Tipo | Responsable | Usuario GitHub | Acceso / Rol |
| :--- | :--- | :--- | :--- | :--- |
| `main` | Principal / Producción | Samu (Admin) | `@smulaboughaba` | Acceso exclusivo de administración. Solo recibe cambios aprobados mediante Pull Request. |
| `samu` | Desarrollo | Samu | `@smulaboughaba` | Rama exclusiva de desarrollo de Samu. |
| `hugo` | Desarrollo | Hugo | `@hviciana` | Rama exclusiva de desarrollo de Hugo. |
| `yaro` | Desarrollo | Yaro | `@ItsYarosun` | Rama exclusiva de desarrollo de Yaro. |
| `jesus` | Desarrollo | Jesús | `@jesusorellanagil2002` | Rama exclusiva de desarrollo de Jesús. |

> Para la configuración detallada de permisos y reglas de protección en GitHub, consulta [docs/GITHUB_PERMISSIONS.md](docs/GITHUB_PERMISSIONS.md).

## Flujo de trabajo en Git para cada integrante

1. **Clonar el repositorio** (una sola vez):
   ```bash
   git clone https://github.com/smulaboughaba/NASA_SPACE_APPS_CHALLENGE.git
   cd NASA_SPACE_APPS_CHALLENGE
   ```

2. **Cambiarte a tu rama asignada** (`jesus`, `yaro`, `hugo` o `samu`):
   ```bash
   git checkout <tu-rama>
   git pull origin <tu-rama>
   ```

3. **Actualizar tu rama con los últimos cambios de `main`** (recomendado antes de empezar a trabajar):
   ```bash
   git fetch origin
   git merge origin/main
   ```

4. **Guardar y subir tus avances a tu rama**:
   ```bash
   git add .
   git commit -m "feat: descripción breve de tu cambio"
   git push origin <tu-rama>
   ```

5. **Integrar cambios en `main`**:
   - Abre un **Pull Request (PR)** en GitHub desde `<tu-rama>` hacia `main`.
   - El administrador (`@smulaboughaba`) revisará y aprobará el merge hacia `main`.
