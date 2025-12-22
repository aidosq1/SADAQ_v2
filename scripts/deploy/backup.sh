#!/bin/bash
set -e

# =============================================
# SADAQ - Database Backup Script
# =============================================

APP_DIR="/opt/sadaq"
BACKUP_DIR="${APP_DIR}/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Load environment
source "${APP_DIR}/.env"

cd "$APP_DIR"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Creating database backup..."

# Create backup
docker compose -f docker-compose.production.yml exec -T postgres pg_dump \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --format=custom \
    --compress=9 \
    > "${BACKUP_DIR}/db_${TIMESTAMP}.dump"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup created: db_${TIMESTAMP}.dump"

# Remove old backups
find "$BACKUP_DIR" -name "db_*.dump" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date '+%Y-%m-%d %H:%M:%S')] Old backups cleaned up (retention: $RETENTION_DAYS days)"
echo "[$(date '+%Y-%m-%d %H:%M:%S')] Backup completed!"
