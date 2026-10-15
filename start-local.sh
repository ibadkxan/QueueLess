#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
if [[ ! -f "$ROOT/server/.env" ]]; then
  echo "Missing server/.env. Copy server/.env.example to server/.env and configure it first."
  exit 1
fi
printf 'QueueLess setup is ready. Open two terminals:\n'
printf 'Backend: cd "%s/server" && npm run dev\n' "$ROOT"
printf 'Frontend: cd "%s/client" && npm run dev\n' "$ROOT"
printf 'Backend port: 5001 | Frontend port: 5173\n'
