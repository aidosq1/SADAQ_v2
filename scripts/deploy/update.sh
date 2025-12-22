#!/bin/bash
set -e

# =============================================
# SADAQ - Application Update Script
# =============================================

APP_DIR="/opt/sadaq"
BACKUP_DIR="${APP_DIR}/backups"
LOG_FILE="${APP_DIR}/logs/deploy.log"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error_exit() {
    log "ERROR: $1"
    exit 1
}

cd "$APP_DIR" || error_exit "Cannot change to $APP_DIR"

log "=========================================="
log "Starting deployment: $TIMESTAMP"
log "=========================================="

# Check if .env exists
if [ ! -f ".env" ]; then
    error_exit ".env file not found!"
fi

# Load environment variables
source .env

# Backup database before update
log "Creating database backup..."
docker compose -f docker-compose.production.yml exec -T postgres pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > "${BACKUP_DIR}/db_${TIMESTAMP}.sql.gz"
log "Database backup created: db_${TIMESTAMP}.sql.gz"

# Pull latest images
log "Pulling latest images..."
docker compose -f docker-compose.production.yml pull

# Run database migrations
log "Running database migrations..."
docker compose -f docker-compose.production.yml run --rm app npx prisma migrate deploy

# Perform update
log "Restarting application..."
docker compose -f docker-compose.production.yml up -d

# Wait for health check
log "Waiting for application health check..."
sleep 10

HEALTH_CHECK_URL="http://localhost:3000/api/health"
MAX_RETRIES=6
RETRY_COUNT=0

while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
    if docker compose -f docker-compose.production.yml exec -T app wget -q -O - "$HEALTH_CHECK_URL" > /dev/null 2>&1; then
        log "Health check passed!"
        break
    fi
    RETRY_COUNT=$((RETRY_COUNT + 1))
    log "Health check pending, retry $RETRY_COUNT of $MAX_RETRIES..."
    sleep 10
done

if [ $RETRY_COUNT -eq $MAX_RETRIES ]; then
    log "WARNING: Health check did not pass after $MAX_RETRIES retries"
fi

# Cleanup old images
log "Cleaning up old Docker images..."
docker image prune -af --filter "until=168h"

# Keep only last 7 database backups
log "Cleaning up old backups..."
ls -t "${BACKUP_DIR}"/db_*.sql.gz 2>/dev/null | tail -n +8 | xargs -r rm

log "=========================================="
log "Deployment completed!"
log "=========================================="
