#!/bin/bash

# ApexRebate Backup and Restore Script
# Automated backup and restore functionality for application data

set -e

# Configuration
APP_NAME="apexrebate"
BACKUP_DIR="/var/backups/$APP_NAME"
APP_DIR="/var/www/$APP_NAME"
RETENTION_DAYS=30
S3_BUCKET=${S3_BUCKET:-""}
ENCRYPT_KEY=${ENCRYPT_KEY:-""}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Create backup directory
ensure_backup_dir() {
    mkdir -p "$BACKUP_DIR"
}

# Backup database
backup_database() {
    local backup_name=$1
    local db_backup_dir="$BACKUP_DIR/$backup_name"
    
    log "Backing up database..."
    
    mkdir -p "$db_backup_dir"
    
    if [[ -f "$APP_DIR/db/custom.db" ]]; then
        # Create database dump
        sqlite3 "$APP_DIR/db/custom.db" ".dump" > "$db_backup_dir/database.sql"
        
        # Copy the actual database file
        cp "$APP_DIR/db/custom.db" "$db_backup_dir/"
        
        # Create database info
        sqlite3 "$APP_DIR/db/custom.db" "SELECT COUNT(*) as user_count FROM User;" > "$db_backup_dir/db_info.txt" 2>/dev/null || true
        
        success "Database backup completed"
    else
        warning "Database file not found, skipping database backup"
    fi
}

# Backup application files
backup_files() {
    local backup_name=$1
    local files_backup_dir="$BACKUP_DIR/$backup_name"
    
    log "Backing up application files..."
    
    mkdir -p "$files_backup_dir"
    
    # Backup source code (excluding node_modules, .git, etc.)
    rsync -av --exclude='node_modules' \
              --exclude='.git' \
              --exclude='.next' \
              --exclude='*.log' \
              --exclude='.env.local' \
              "$APP_DIR/" "$files_backup_dir/app/"
    
    # Backup configuration files
    if [[ -f "$APP_DIR/.env" ]]; then
        cp "$APP_DIR/.env" "$files_backup_dir/"
    fi
    
    if [[ -f "$APP_DIR/package.json" ]]; then
        cp "$APP_DIR/package.json" "$files_backup_dir/"
    fi
    
    # Backup logs
    if [[ -d "$APP_DIR/logs" ]]; then
        mkdir -p "$files_backup_dir/logs"
        cp -r "$APP_DIR/logs/"* "$files_backup_dir/logs/" 2>/dev/null || true
    fi
    
    success "Application files backup completed"
}

# Backup system configuration
backup_system() {
    local backup_name=$1
    local system_backup_dir="$BACKUP_DIR/$backup_name"
    
    log "Backing up system configuration..."
    
    mkdir -p "$system_backup_dir/system"
    
    # Backup nginx configuration (if exists)
    if [[ -f "/etc/nginx/sites-available/$APP_NAME" ]]; then
        cp "/etc/nginx/sites-available/$APP_NAME" "$system_backup_dir/system/nginx.conf"
    fi
    
    # Backup systemd service (if exists)
    if [[ -f "/etc/systemd/system/$APP_NAME.service" ]]; then
        cp "/etc/systemd/system/$APP_NAME.service" "$system_backup_dir/system/"
    fi
    
    # Backup cron jobs
    crontab -l > "$system_backup_dir/system/crontab.txt" 2>/dev/null || true
    
    # Backup system info
    {
        echo "=== System Information ==="
        echo "Date: $(date)"
        echo "Hostname: $(hostname)"
        echo "OS: $(cat /etc/os-release | grep PRETTY_NAME | cut -d'"' -f2)"
        echo "Kernel: $(uname -r)"
        echo "Uptime: $(uptime)"
        echo ""
        echo "=== Disk Usage ==="
        df -h
        echo ""
        echo "=== Memory Info ==="
        free -h
        echo ""
        echo "=== Network Info ==="
        ip addr show | grep -E "inet|UP"
    } > "$system_backup_dir/system/system_info.txt"
    
    success "System configuration backup completed"
}

# Encrypt backup
encrypt_backup() {
    local backup_path=$1
    
    if [[ -n "$ENCRYPT_KEY" ]]; then
        log "Encrypting backup..."
        
        # Create encrypted archive
        tar -czf - "$backup_path" | openssl enc -aes-256-cbc -salt -out "$backup_path.tar.gz.enc" -k "$ENCRYPT_KEY"
        
        # Remove unencrypted backup
        rm -rf "$backup_path"
        
        success "Backup encrypted"
    else
        # Create compressed archive without encryption
        tar -czf "$backup_path.tar.gz" -C "$(dirname "$backup_path")" "$(basename "$backup_path")"
        rm -rf "$backup_path"
        
        warning "Backup created without encryption"
    fi
}

# Upload to cloud storage
upload_to_cloud() {
    local backup_file=$1
    
    if [[ -n "$S3_BUCKET" ]] && command -v aws &> /dev/null; then
        log "Uploading backup to S3..."
        
        if aws s3 cp "$backup_file" "s3://$S3_BUCKET/backups/$APP_NAME/"; then
            success "Backup uploaded to S3"
        else
            warning "Failed to upload backup to S3"
        fi
    elif [[ -n "$S3_BUCKET" ]]; then
        warning "AWS CLI not found, skipping S3 upload"
    fi
}

# Create full backup
create_backup() {
    local backup_name="backup-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log "Creating backup: $backup_name"
    
    ensure_backup_dir
    
    # Create backup components
    backup_files "$backup_name"
    backup_database "$backup_name"
    backup_system "$backup_name"
    
    # Create backup metadata
    {
        echo "=== Backup Metadata ==="
        echo "Backup Name: $backup_name"
        echo "Created: $(date)"
        echo "Hostname: $(hostname)"
        echo "User: $(whoami)"
        echo "App Directory: $APP_DIR"
        echo "Backup Type: Full"
        echo ""
        echo "=== Backup Contents ==="
        du -sh "$backup_path"/* 2>/dev/null || true
    } > "$backup_path/backup_info.txt"
    
    # Encrypt and compress
    encrypt_backup "$backup_path"
    
    # Upload to cloud
    if [[ -f "$backup_path.tar.gz.enc" ]]; then
        upload_to_cloud "$backup_path.tar.gz.enc"
    elif [[ -f "$backup_path.tar.gz" ]]; then
        upload_to_cloud "$backup_path.tar.gz"
    fi
    
    success "Backup created successfully: $backup_name"
    
    # Cleanup old backups
    cleanup_old_backups
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups (retention: $RETENTION_DAYS days)..."
    
    # Remove local backups older than retention period
    find "$BACKUP_DIR" -name "backup-*.tar.gz*" -mtime +$RETENTION_DAYS -delete
    
    # Remove from S3 if configured
    if [[ -n "$S3_BUCKET" ]] && command -v aws &> /dev/null; then
        local cutoff_date=$(date -d "$RETENTION_DAYS days ago" +%Y%m%d)
        aws s3 ls "s3://$S3_BUCKET/backups/$APP_NAME/" | \
            awk '$1 < "'$cutoff_date'" {print $4}' | \
            xargs -I {} aws s3 rm "s3://$S3_BUCKET/backups/$APP_NAME/{}" 2>/dev/null || true
    fi
    
    success "Old backups cleaned up"
}

# List available backups
list_backups() {
    log "Available backups:"
    
    echo ""
    echo "Local Backups:"
    ls -lah "$BACKUP_DIR"/backup-*.tar.gz* 2>/dev/null || echo "No local backups found"
    
    if [[ -n "$S3_BUCKET" ]] && command -v aws &> /dev/null; then
        echo ""
        echo "S3 Backups:"
        aws s3 ls "s3://$S3_BUCKET/backups/$APP_NAME/" 2>/dev/null || echo "No S3 backups found"
    fi
}

# Restore from backup
restore_backup() {
    local backup_name=$1
    
    if [[ -z "$backup_name" ]]; then
        error "Backup name required. Use: $0 restore <backup_name>"
    fi
    
    log "Restoring from backup: $backup_name"
    
    local backup_file=""
    local temp_dir="/tmp/restore-$APP_NAME-$(date +%s)"
    
    # Find backup file
    if [[ -f "$BACKUP_DIR/$backup_name.tar.gz.enc" ]]; then
        backup_file="$BACKUP_DIR/$backup_name.tar.gz.enc"
    elif [[ -f "$BACKUP_DIR/$backup_name.tar.gz" ]]; then
        backup_file="$BACKUP_DIR/$backup_name.tar.gz"
    elif [[ -n "$S3_BUCKET" ]] && command -v aws &> /dev/null; then
        # Try to download from S3
        mkdir -p "$temp_dir"
        if aws s3 cp "s3://$S3_BUCKET/backups/$APP_NAME/$backup_name.tar.gz.enc" "$temp_dir/" 2>/dev/null; then
            backup_file="$temp_dir/$backup_name.tar.gz.enc"
        elif aws s3 cp "s3://$S3_BUCKET/backups/$APP_NAME/$backup_name.tar.gz" "$temp_dir/" 2>/dev/null; then
            backup_file="$temp_dir/$backup_name.tar.gz"
        fi
    fi
    
    if [[ -z "$backup_file" ]]; then
        error "Backup file not found: $backup_name"
    fi
    
    # Extract backup
    mkdir -p "$temp_dir"
    
    if [[ "$backup_file" == *.enc ]]; then
        log "Decrypting backup..."
        if ! openssl enc -aes-256-cbc -d -in "$backup_file" -out "$temp_dir/backup.tar.gz" -k "$ENCRYPT_KEY"; then
            error "Failed to decrypt backup. Check encryption key."
        fi
        tar -xzf "$temp_dir/backup.tar.gz" -C "$temp_dir"
    else
        tar -xzf "$backup_file" -C "$temp_dir"
    fi
    
    local extracted_dir=$(find "$temp_dir" -type d -name "backup-*" | head -n 1)
    
    if [[ -z "$extracted_dir" ]]; then
        error "Invalid backup format"
    fi
    
    # Stop application
    log "Stopping application..."
    if systemctl is-active --quiet "$APP_NAME"; then
        sudo systemctl stop "$APP_NAME"
    fi
    
    # Restore application files
    if [[ -d "$extracted_dir/app" ]]; then
        log "Restoring application files..."
        sudo rsync -av --delete "$extracted_dir/app/" "$APP_DIR/"
        sudo chown -R www-data:www-data "$APP_DIR"
    fi
    
    # Restore database
    if [[ -f "$extracted_dir/custom.db" ]]; then
        log "Restoring database..."
        sudo cp "$extracted_dir/custom.db" "$APP_DIR/db/"
        sudo chown www-data:www-data "$APP_DIR/db/custom.db"
    fi
    
    # Restore configuration
    if [[ -f "$extracted_dir/.env" ]]; then
        log "Restoring environment configuration..."
        sudo cp "$extracted_dir/.env" "$APP_DIR/"
    fi
    
    # Restore system configuration
    if [[ -d "$extracted_dir/system" ]]; then
        log "Restoring system configuration..."
        
        if [[ -f "$extracted_dir/system/nginx.conf" ]]; then
            sudo cp "$extracted_dir/system/nginx.conf" "/etc/nginx/sites-available/$APP_NAME"
        fi
        
        if [[ -f "$extracted_dir/system/$APP_NAME.service" ]]; then
            sudo cp "$extracted_dir/system/$APP_NAME.service" "/etc/systemd/system/"
            sudo systemctl daemon-reload
        fi
    fi
    
    # Start application
    log "Starting application..."
    if systemctl is-enabled --quiet "$APP_NAME"; then
        sudo systemctl start "$APP_NAME"
    else
        cd "$APP_DIR"
        sudo -u www-data nohup npm run start > /dev/null 2>&1 &
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
    
    success "Restore completed successfully"
    
    # Verify restore
    sleep 10
    if curl -f -s "http://localhost:3000/api/health" > /dev/null; then
        success "Application is running after restore"
    else
        warning "Application may not be running properly after restore"
    fi
}

# Verify backup integrity
verify_backup() {
    local backup_name=$1
    
    if [[ -z "$backup_name" ]]; then
        error "Backup name required. Use: $0 verify <backup_name>"
    fi
    
    log "Verifying backup integrity: $backup_name"
    
    local backup_file=""
    local temp_dir="/tmp/verify-$APP_NAME-$(date +%s)"
    
    # Find and extract backup
    if [[ -f "$BACKUP_DIR/$backup_name.tar.gz.enc" ]]; then
        backup_file="$BACKUP_DIR/$backup_name.tar.gz.enc"
    elif [[ -f "$BACKUP_DIR/$backup_name.tar.gz" ]]; then
        backup_file="$BACKUP_DIR/$backup_name.tar.gz"
    fi
    
    if [[ -z "$backup_file" ]]; then
        error "Backup file not found: $backup_name"
    fi
    
    mkdir -p "$temp_dir"
    
    # Extract backup for verification
    if [[ "$backup_file" == *.enc ]]; then
        openssl enc -aes-256-cbc -d -in "$backup_file" -out "$temp_dir/backup.tar.gz" -k "$ENCRYPT_KEY"
        tar -xzf "$temp_dir/backup.tar.gz" -C "$temp_dir"
    else
        tar -xzf "$backup_file" -C "$temp_dir"
    fi
    
    local extracted_dir=$(find "$temp_dir" -type d -name "backup-*" | head -n 1)
    
    # Verify backup components
    local verification_failed=false
    
    if [[ ! -d "$extracted_dir/app" ]]; then
        error "Application files not found in backup"
        verification_failed=true
    fi
    
    if [[ ! -f "$extracted_dir/custom.db" ]] && [[ ! -f "$extracted_dir/database.sql" ]]; then
        warning "Database backup not found"
    fi
    
    if [[ ! -f "$extracted_dir/backup_info.txt" ]]; then
        warning "Backup metadata not found"
    fi
    
    # Verify database integrity
    if [[ -f "$extracted_dir/custom.db" ]]; then
        if sqlite3 "$extracted_dir/custom.db" "PRAGMA integrity_check;" | grep -q "ok"; then
            success "Database integrity check passed"
        else
            error "Database integrity check failed"
            verification_failed=true
        fi
    fi
    
    # Cleanup
    rm -rf "$temp_dir"
    
    if [[ "$verification_failed" == "false" ]]; then
        success "Backup verification completed successfully"
    else
        error "Backup verification failed"
    fi
}

# Schedule automatic backups
schedule_backups() {
    log "Setting up automatic backup schedule..."
    
    # Add to crontab
    local cron_entry="0 2 * * * $0 create >/dev/null 2>&1"
    
    if crontab -l 2>/dev/null | grep -q "$0 create"; then
        warning "Backup schedule already exists"
    else
        (crontab -l 2>/dev/null; echo "$cron_entry") | crontab -
        success "Backup schedule added (daily at 2 AM)"
    fi
}

# Main function
main() {
    case "${1:-help}" in
        "create")
            create_backup
            ;;
        "restore")
            restore_backup "$2"
            ;;
        "list")
            list_backups
            ;;
        "verify")
            verify_backup "$2"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        "schedule")
            schedule_backups
            ;;
        "help"|*)
            echo "Usage: $0 {create|restore|list|verify|cleanup|schedule|help}"
            echo ""
            echo "Commands:"
            echo "  create              Create a new backup"
            echo "  restore <backup>    Restore from backup"
            echo "  list                List available backups"
            echo "  verify <backup>     Verify backup integrity"
            echo "  cleanup             Clean up old backups"
            echo "  schedule            Schedule automatic backups"
            echo "  help                Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  S3_BUCKET           S3 bucket for cloud storage"
            echo "  ENCRYPT_KEY         Encryption key for backup files"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"