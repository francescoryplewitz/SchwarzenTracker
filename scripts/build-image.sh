#!/usr/bin/env bash
set -euo pipefail

version="${1:-}"

if [ -z "$version" ]; then
  echo 'Bitte gib eine Version an, z. B. npm run build 0.0.1'
  exit 1
fi

docker build . --build-arg NODE_ENV=production -t "base:${version}"
echo "Docker-Image base:${version} wurde gebaut"
