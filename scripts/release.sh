#!/bin/zsh
set -euo pipefail

startBranch=$(git rev-parse --abbrev-ref HEAD)
worktreeStatus=$(git status --porcelain)

if [ -n "$worktreeStatus" ]; then
  echo 'Working tree ist nicht sauber. Bitte erst committen oder stagen.'
  exit 1
fi

git fetch origin main
git checkout main
git pull --ff-only origin main

npm version patch --no-git-tag-version
newVersion=$(node -p "require('./package.json').version")

git add package.json package-lock.json
git commit -m "chore:(release):${newVersion}"
git tag -a "${newVersion}" -m "Release ${newVersion}"

git push origin main
git push origin --tags

if [ "$startBranch" != 'main' ]; then
  git checkout "$startBranch"
fi

echo "Release ${newVersion} abgeschlossen"
