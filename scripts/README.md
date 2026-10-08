# scripts/seed-issues.sh

Crea issues en GitHub a partir de un archivo JSON, usando [GitHub CLI](https://cli.github.com/).

## Requisitos

- [`gh`](https://cli.github.com/) instalado y autenticado (`gh auth login`).
- [`jq`](https://jqlang.org/) instalado.

## Archivo de issues

Por defecto el script lee [`scripts/issues.json`](issues.json), un array de objetos con este formato:

```json
[
  {
    "title": "Título de la issue",
    "type": "bug",
    "projects": ["web-admin", "api"],
    "body": "Descripción de la issue"
  }
]
```

- `type`: `bug` o `feature`. Se usa como etiqueta.
- `projects`: uno o varios proyectos del monorepo. Cada uno se añade como etiqueta `proyecto:<nombre>`.
- `body`: descripción de la issue (admite Markdown y saltos de línea).

Las etiquetas se crean automáticamente en el repositorio si no existen todavía.

## Uso

```bash
# Crear las issues en el repo actual (el que detecta gh en este directorio)
./scripts/seed-issues.sh

# Simular sin crear nada en GitHub (útil para revisar antes de lanzarlo)
./scripts/seed-issues.sh --dry-run

# Usar otro archivo JSON
./scripts/seed-issues.sh -f otras-issues.json

# Crear las issues en un repo distinto
./scripts/seed-issues.sh -R owner/repo

# Ver la ayuda
./scripts/seed-issues.sh --help
```

## Opciones

| Opción            | Descripción                                                          |
| ------------------ | --------------------------------------------------------------------- |
| `-f`, `--file`      | Ruta al JSON de issues (por defecto: `scripts/issues.json`)          |
| `-R`, `--repo`      | Repositorio de GitHub `owner/repo` (por defecto, el del directorio actual) |
| `-n`, `--dry-run`   | Muestra lo que se crearía sin llamar a la API de GitHub               |
| `-h`, `--help`      | Muestra la ayuda                                                      |
