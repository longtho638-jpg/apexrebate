#!/bin/bash

# ApexRebate Deployment Automation Script
# This script automates the deployment process for production environments

set -e  # Exit on any error

# Configuration
APP_NAME="apexrebate"
DEPLOY_ENV=${1:-production}
BACKUP_DIR="/var/backups/$APP_NAME"
LOG_FILE="/var/log/deploy-$APP_NAME.log"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
MAX_RETRIES=30
RETRY_DELAY=10

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check if running as root for production deployments
check_permissions() {
    if [[ "$DEPLOY_ENV" == "production" ]] && [[ $EUID -ne 0 ]]; then
        error "Production deployment must be run as root"
    fi
}

# Create backup of current deployment
create_backup() {
    log "Creating backup of current deployment..."
    
    if [[ -d "/var/www/$APP_NAME" ]]; then
        mkdir -p "$BACKUP_DIR"
        BACKUP_NAME="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S)"
        
        # Backup application files
        cp -r "/var/www/$APP_NAME" "$BACKUP_NAME/app"
        
        # Backup database
        if [[ -f "/var/www/$APP_NAME/db/custom.db" ]]; then
            cp "/var/www/$APP_NAME/db/custom.db" "$BACKUP_NAME/"
        fi
        
        # Backup environment file
        if [[ -f "/var/www/$APP_NAME/.env" ]]; then
            cp "/var/www/$APP_NAME/.env" "$BACKUP_NAME/"
        fi
        
        success "Backup created at $BACKUP_NAME"
        
        # Keep only last 5 backups
        find "$BACKUP_DIR" -type d -name "backup-*" | sort -r | tail -n +6 | xargs rm -rf
    else
        warning "No existing deployment found, skipping backup"
    fi
}

# Run tests before deployment
run_tests() {
    log "Running test suite..."
    
    # Unit tests
    if ! npm test; then
        error "Unit tests failed"
    fi
    
    # E2E tests (if available)
    if [[ -f "playwright.config.ts" ]]; then
        if ! npm run test:e2e; then
            error "E2E tests failed"
        fi
    fi
    
    success "All tests passed"
}

# Build application
build_app() {
    log "Building application..."
    
    # Clean previous build
    rm -rf .next || true
    
    # Install dependencies
    npm ci --production=false
    
    # Build application
    if ! npm run build; then
        error "Build failed"
    fi
    
    success "Application built successfully"
}

# Deploy application files
deploy_files() {
    log "Deploying application files..."
    
    DEPLOY_DIR="/var/www/$APP_NAME"
    
    # Create deployment directory if it doesn't exist
    sudo mkdir -p "$DEPLOY_DIR"
    
    # Copy application files
    sudo rsync -av --exclude='.git' --exclude='node_modules' --exclude='.env.local' \
        ./ "$DEPLOY_DIR/"
    
    # Set proper permissions
    sudo chown -R www-data:www-data "$DEPLOY_DIR"
    sudo chmod -R 755 "$DEPLOY_DIR"
    
    # Install production dependencies
    cd "$DEPLOY_DIR"
    sudo -u www-data npm ci --production
    
    success "Files deployed successfully"
}

# Database migrations
run_migrations() {
    log "Running database migrations..."
    
    DEPLOY_DIR="/var/www/$APP_NAME"
    cd "$DEPLOY_DIR"
    
    # Run Prisma migrations
    if ! sudo -u www-data npx prisma db push; then
        error "Database migration failed"
    fi
    
    success "Database migrations completed"
}

# Restart services
restart_services() {
    log "Restarting services..."
    
    # Restart application service (if using systemd)
    if systemctl is-active --quiet "$APP_NAME"; then
        sudo systemctl restart "$APP_NAME"
        success "Application service restarted"
    fi
    
    # Restart nginx (if configured)
    if systemctl is-active --quiet nginx; then
        sudo systemctl reload nginx
        success "Nginx reloaded"
    fi
}

# Health check
health_check() {
    log "Performing health check..."
    
    local retry_count=0
    
    while [[ $retry_count -lt $MAX_RETRIES ]]; do
        if curl -f -s "$HEALTH_CHECK_URL" > /dev/null; then
            success "Health check passed"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        log "Health check failed, retrying... ($retry_count/$MAX_RETRIES)"
        sleep $RETRY_DELAY
    done
    
    error "Health check failed after $MAX_RETRIES attempts"
}

# Rollback function
rollback() {
    log "Initiating rollback..."
    
    LATEST_BACKUP=$(find "$BACKUP_DIR" -type d -name "backup-*" | sort -r | head -n 1)
    
    if [[ -z "$LATEST_BACKUP" ]]; then
        error "No backup found for rollback"
    fi
    
    # Restore application files
    sudo rm -rf "/var/www/$APP_NAME"
    sudo cp -r "$LATEST_BACKUP/app" "/var/www/$APP_NAME"
    
    # Restore database
    if [[ -f "$LATEST_BACKUP/custom.db" ]]; then
        sudo cp "$LATEST_BACKUP/custom.db" "/var/www/$APP_NAME/db/"
    fi
    
    # Restore environment file
    if [[ -f "$LATEST_BACKUP/.env" ]]; then
        sudo cp "$LATEST_BACKUP/.env" "/var/www/$APP_NAME/"
    fi
    
    restart_services
    health_check
    
    success "Rollback completed successfully"
}

# Cleanup old deployments
cleanup() {
    log "Cleaning up old deployments..."
    
    # Remove old Node.js processes
    pkill -f "next-server" || true
    
    # Clear npm cache
    npm cache clean --force || true
    
    success "Cleanup completed"
}

# Send notification
send_notification() {
    local status=$1
    local message=$2
    
    # Send to Slack (if webhook is configured)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$APP_NAME deployment $status: $message\"}" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    # Send email (if configured)
    if [[ -n "$ADMIN_EMAIL" ]]; then
        echo "$message" | mail -s "$APP_NAME Deployment $status" "$ADMIN_EMAIL" || true
    fi
}

# Main deployment flow
main() {
    log "Starting $APP_NAME deployment to $DEPLOY_ENV environment..."
    
    # Check prerequisites
    check_permissions
    
    # Create backup
    create_backup
    
    # Run tests
    if [[ "$SKIP_TESTS" != "true" ]]; then
        run_tests
    fi
    
    # Build application
    build_app
    
    # Deploy files
    deploy_files
    
    # Run migrations
    run_migrations
    
    # Restart services
    restart_services
    
    # Health check
    health_check
    
    # Cleanup
    cleanup
    
    success "Deployment completed successfully!"
    send_notification "SUCCESS" "$APP_NAME has been successfully deployed to $DEPLOY_ENV"
    
    log "Deployment summary:"
    log "- Environment: $DEPLOY_ENV"
    log "- Backup location: $BACKUP_DIR"
    log "- Health check: PASSED"
    log "- Timestamp: $(date)"
}

# Handle script arguments
case "${1:-}" in
    "rollback")
        rollback
        ;;
    "health")
        health_check
        ;;
    "backup")
        create_backup
        ;;
    *)
        main
        ;;
esac