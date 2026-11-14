#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

usage() {
  cat <<'EOF'
Uso:
  ./dev/scripts/sincronizar_equipo.sh review
      Actualiza referencias remotas y lista los commits y archivos modificados
      por Hugo, Yaro y Jesús después de [branch-root-setup].

  ./dev/scripts/sincronizar_equipo.sh import [hugo|yaro|jesus|all]
      Importa el contenido de las carpetas aisladas de origin/<rama>
      hacia dev/frontend/* y dev/data_science/* en main (sin mezclar borrados de raíz).
EOF
}

get_member_config() {
  local member="$1"
  case "$member" in
    hugo)
      SRC_FE="frontend_mapa"
      DST_FE="dev/frontend/hugo_mapa"
      SRC_DS="data_inundaciones"
      DST_DS="dev/data_science/hugo_inundaciones"
      ;;
    yaro)
      SRC_FE="frontend_analytics"
      DST_FE="dev/frontend/yaro_analytics"
      SRC_DS="data_incendios_cultivos"
      DST_DS="dev/data_science/yaro_incendios_cultivos"
      ;;
    jesus)
      SRC_FE="frontend_storytelling"
      DST_FE="dev/frontend/jesus_storytelling"
      SRC_DS="data_global_insar"
      DST_DS="dev/data_science/jesus_global_insar"
      ;;
    *)
      echo "Integrante no válido: '$member'. Usa hugo, yaro, jesus o all." >&2
      exit 1
      ;;
  esac
}

review_member() {
  local member="$1"
  get_member_config "$member"
  local ref="origin/${member}"

  echo "============================================================"
  echo "Revisión de rama: ${ref} (${SRC_FE}/ | ${SRC_DS}/)"
  echo "============================================================"

  if ! git rev-parse --verify "$ref" >/dev/null 2>&1; then
    echo "  [!] La referencia ${ref} no existe todavía en remoto."
    return 0
  fi

  local setup_sha
  setup_sha="$(git log --grep='\[branch-root-setup\]' -n 1 --format=%H "$ref" || true)"
  if [[ -z "$setup_sha" ]]; then
    echo "  [!] No se encontró commit base [branch-root-setup] en ${ref}."
    git log --oneline -n 5 "$ref"
    return 0
  fi

  local commits
  commits="$(git log --oneline "${setup_sha}..${ref}")"
  if [[ -z "$commits" ]]; then
    echo "  Sin commits nuevos después de [branch-root-setup] (${setup_sha:0:7})."
  else
    echo "  Commits nuevos:"
    while IFS= read -r line; do
      echo "    - $line"
    done <<< "$commits"

    echo "  Archivos tocados en sus 2 carpetas:"
    git -c core.quotepath=false diff --name-status "${setup_sha}..${ref}" -- "$SRC_FE" "$SRC_DS" || true
  fi
}

import_dir() {
  local ref="$1"
  local src_dir="$2"
  local dst_dir="$3"

  if ! git cat-file -e "${ref}:${src_dir}" 2>/dev/null; then
    echo "  [!] No existe ${ref}:${src_dir}; se omite."
    return 0
  fi

  mkdir -p "$dst_dir"
  git archive "$ref" "$src_dir" | tar -x -C "$dst_dir" --strip-components=1
  echo "  [OK] Importado ${ref}:${src_dir}/ -> ${dst_dir}/"
}

import_member() {
  local member="$1"
  get_member_config "$member"
  local ref="origin/${member}"

  if ! git rev-parse --verify "$ref" >/dev/null 2>&1; then
    echo "  [!] No existe ${ref}. Haz fetch/push de esa rama antes de importar."
    return 1
  fi

  echo "Importando trabajo de ${member} desde ${ref}..."
  import_dir "$ref" "$SRC_FE" "$DST_FE"
  import_dir "$ref" "$SRC_DS" "$DST_DS"
}

cmd="${1:-}"
case "$cmd" in
  review)
    git fetch origin || echo "Aviso: git fetch origin falló; usando estado en caché de origin/*." >&2
    for m in hugo yaro jesus; do
      review_member "$m"
    done
    ;;
  import)
    target="${2:-all}"
    git fetch origin || echo "Aviso: git fetch origin falló; usando estado en caché de origin/*." >&2
    if [[ "$target" == "all" ]]; then
      for m in hugo yaro jesus; do
        import_member "$m"
      done
    else
      import_member "$target"
    fi
    echo
    echo "Revisa cambios con 'git status' y 'git diff' antes de hacer commit en main."
    ;;
  *)
    usage
    exit 1
    ;;
esac
