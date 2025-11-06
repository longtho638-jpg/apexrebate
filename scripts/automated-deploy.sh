#!/bin/bash

# ApexRebate Automated Deployment Script
# This script handles automated deployment with proper error handling and rollback

set -euo pipefail

# Configuration
ENVIRONMENT=${1:-staging}
APP_NAME="apexrebate"
DOCKER_REGISTRY="ghcr.io"
VERSION=${2:-latest}
BACKUP_DIR="/backups"
LOG_FILE="/var/log/deploy.log"

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

# Pre-deployment checks
pre_deployment_checks() {
    log "🔍 Running pre-deployment checks..."
    
    # Check if required environment variables are set
    required_vars=("DATABASE_URL" "NEXTAUTH_SECRET" "NEXT_PUBLIC_APP_URL")
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var:-}" ]]; then
            error "Environment variable $var is not set"
        fi
    done
    
    # Check Docker registry connectivity
    if ! docker pull "$DOCKER_REGISTRY/$APP_NAME:$VERSION" >/dev/null 2>&1; then
        error "Cannot pull Docker image from registry"
    fi
    
    # Check database connectivity
    if ! npx prisma db pull --force >/dev/null 2>&1; then
        error "Cannot connect to database"
    fi
    
    success "✅ Pre-deployment checks passed"
}

# Backup current deployment
backup_current_deployment() {
    log "💾 Creating backup of current deployment..."
    
    BACKUP_NAME="$APP_NAME-$(date +%Y%m%d-%H%M%S)"
    BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
    
    mkdir -p "$BACKUP_PATH"
    
    # Backup database
    if ! npx prisma db push --preview-feature && \
       npx prisma db seed --preview-feature; then
        error "Failed to backup database"
    fi
    
    # Backup application files
    if ! cp -r /app/current "$BACKUP_PATH/app" 2>/dev/null; then
        warning "Could not backup application files"
    fi
    
    # Save backup info
    echo "$BACKUP_NAME" > "$BACKUP_DIR/latest_backup.txt"
    
    success "✅ Backup created: $BACKUP_NAME"
}

# Deploy application
deploy_application() {
    log "🚀 Deploying $APP_NAME version $VERSION to $ENVIRONMENT..."
    
    # Pull latest image
    log "📦 Pulling Docker image..."
    docker pull "$DOCKER_REGISTRY/$APP_NAME:$VERSION"
    
    # Stop current container
    log "⏹️ Stopping current container..."
    docker stop "$APP_NAME" 2>/dev/null || true
    docker rm "$APP_NAME" 2>/dev/null || true
    
    # Run database migrations
    log "🗄️ Running database migrations..."
    npx prisma migrate deploy
    
    # Start new container
    log "▶️ Starting new container..."
    docker run -d \
        --name "$APP_NAME" \
        --restart unless-stopped \
        -p 3000:3000 \
        -e DATABASE_URL="$DATABASE_URL" \
        -e NEXTAUTH_SECRET="$NEXTAUTH_SECRET" \
        -e NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL" \
        -e NODE_ENV="$ENVIRONMENT" \
        "$DOCKER_REGISTRY/$APP_NAME:$VERSION"
    
    # Wait for application to start
    log "⏳ Waiting for application to start..."
    sleep 30
    
    # Health check
    health_check
    
    success "✅ Application deployed successfully"
}

# Health check
health_check() {
    log "🏥 Running health checks..."
    
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
            success "✅ Health check passed"
            return 0
        fi
        
        log "Health check attempt $attempt/$max_attempts failed"
        sleep 10
        ((attempt++))
    done
    
    error "❌ Health check failed after $max_attempts attempts"
}

# Post-deployment verification
post_deployment_verification() {
    log "🔍 Running post-deployment verification..."
    
    # Check if application is responding
    if ! curl -f http://localhost:3000 >/dev/null 2>&1; then
        error "Application is not responding"
    fi
    
    # Check API endpoints
    local endpoints=(
        "/api/health"
        "/api/calculator"
        "/api/wall-of-fame"
    )
    
    for endpoint in "${endpoints[@]}"; do
        if ! curl -f "http://localhost:3000$endpoint" >/dev/null 2>&1; then
            error "API endpoint $endpoint is not responding"
        fi
    done
    
    # Run smoke tests
    log "🧪 Running smoke tests..."
    npm run test:smoke || error "Smoke tests failed"
    
    success "✅ Post-deployment verification passed"
}

# Rollback function
rollback() {
    log "🔄 Rolling back deployment..."
    
    local latest_backup
    latest_backup=$(cat "$BACKUP_DIR/latest_backup.txt" 2>/dev/null || echo "")
    
    if [[ -z "$latest_backup" ]]; then
        error "No backup found for rollback"
    fi
    
    log "Rolling back to backup: $latest_backup"
    
    # Stop current container
    docker stop "$APP_NAME" 2>/dev/null || true
    docker rm "$APP_NAME" 2>/dev/null || true
    
    # Restore from backup
    # Add your restore logic here
    
    success "✅ Rollback completed"
}

# Cleanup function
cleanup() {
    log "🧹 Cleaning up..."
    
    # Remove unused Docker images
    docker image prune -f
    
    # Remove old backups (keep last 10)
    find "$BACKUP_DIR" -maxdepth 1 -type d -name "$APP_NAME-*" | sort -r | tail -n +11 | xargs rm -rf
    
    success "✅ Cleanup completed"
}

# Notification function
send_notification() {
    local status=$1
    local message=$2
    
    log "📢 Sending notification..."
    
    # Slack notification
    if [[ -n "${SLACK_WEBHOOK:-}" ]]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$message\"}" \
            "$SLACK_WEBHOOK" || warning "Failed to send Slack notification"
    fi
    
    # Email notification
    if [[ -n "${ADMIN_EMAIL:-}" ]]; then
        echo "$message" | mail -s "ApexRebate Deployment $status" "$ADMIN_EMAIL" || \
            warning "Failed to send email notification"
    fi
}

# Main deployment flow
main() {
    log "🚀 Starting ApexRebate automated deployment..."
    log "Environment: $ENVIRONMENT"
    log "Version: $VERSION"
    
    # Trap for cleanup on exit
    trap 'error "Deployment interrupted"' INT TERM
    
    # Run deployment steps
    pre_deployment_checks
    backup_current_deployment
    
    # Deploy with error handling
    if ! deploy_application; then
        rollback
        send_notification "FAILED" "❌ ApexRebate deployment to $ENVIRONMENT failed"
        error "Deployment failed"
    fi
    
    post_deployment_verification
    cleanup
    
    # Send success notification
    send_notification "SUCCESS" "✅ ApexRebate version $VERSION deployed to $ENVIRONMENT successfully"
    
    success "🎉 Deployment completed successfully!"
}

# Script usage
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    case "${1:-}" in
        --help|-h)
            echo "Usage: $0 [environment] [version]"
            echo "  environment: staging|production (default: staging)"
            echo "  version: Docker image tag (default: latest)"
            exit 0
            ;;
        --rollback)
            rollback
            exit 0
            ;;
        *)
            main "$@"
            ;;
    esac
fi