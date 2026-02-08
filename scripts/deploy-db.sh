#!/usr/bin/env bash
set -euo pipefail

backupDir="${HOME}/Documents/postgres-backups"
mkdir -p "$backupDir"

set -a
source ./schwarzentracker.env
set +a

dbHost="$DB_HOST"
dbPort="$DB_PORT"
dbUser="$DB_USERNAME"
dbPassword="$DB_PASSWORD"
dbName="$DB_DATABASE"

timestamp=$(date '+%Y%m%d-%H%M%S')
backupFile="${backupDir}/${dbName}-${timestamp}.sql.gz"

PGPASSWORD="$dbPassword" pg_dump \
  --host "$dbHost" \
  --port "$dbPort" \
  --username "$dbUser" \
  --dbname "$dbName" \
  --format=plain \
  --no-owner \
  --no-privileges | gzip > "$backupFile"

echo "Backup erstellt: $backupFile"

npm run set:schema
npx prisma@6.19.2 migrate status
npm run db:deploy

echo 'Datenbankmigration abgeschlossen'
