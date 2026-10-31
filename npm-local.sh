#!/usr/bin/env sh
set -eu
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
export PATH="$PROJECT_ROOT/.tools/node/bin:$PATH"
export NPM_CONFIG_PREFIX="$PROJECT_ROOT/.npm-global"
exec "$PROJECT_ROOT/.tools/node/bin/npm" "$@"
