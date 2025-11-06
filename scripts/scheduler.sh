#!/bin/bash

# ApexRebate Task Scheduler
# Automated task scheduling and management system

set -e

# Configuration
APP_NAME="apexrebate"
LOG_FILE="/var/log/scheduler-$APP_NAME.log"
PID_FILE="/var/run/scheduler-$APP_NAME.pid"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(dirname "$SCRIPT_DIR")"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

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

# Check if scheduler is already running
check_running() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            warning "Scheduler is already running (PID: $pid)"
            return 0
        else
            rm -f "$PID_FILE"
        fi
    fi
    return 1
}

# Task definitions
declare -A TASKS
declare -A TASK_SCHEDULES
declare -A TASK_DESCRIPTIONS

# Marketing automation tasks
TASKS["send_welcome_emails"]="cd $APP_DIR && node -e \"
const { sendWelcomeEmails } = require('./src/lib/marketing-automation');
sendWelcomeEmails().catch(console.error);
\""

TASK_SCHEDULES["send_welcome_emails"]="0 9 * * *"  # Daily at 9 AM
TASK_DESCRIPTIONS["send_welcome_emails"]="Send welcome emails to new users"

TASKS["send_weekly_reports"]="cd $APP_DIR && node -e \"
const { sendWeeklyReports } = require('./src/lib/marketing-automation');
sendWeeklyReports().catch(console.error);
\""

TASK_SCHEDULES["send_weekly_reports"]="0 10 * * 1"  # Weekly on Monday at 10 AM
TASK_DESCRIPTIONS["send_weekly_reports"]="Send weekly performance reports"

TASKS["process_referral_payouts"]="cd $APP_DIR && node -e \"
const { processReferralPayouts } = require('./src/lib/cron-jobs');
processReferralPayouts().catch(console.error);
\""

TASK_SCHEDULES["process_referral_payouts"]="0 14 * * *"  # Daily at 2 PM
TASK_DESCRIPTIONS["process_referral_payouts"]="Process referral payouts"

TASKS["update_analytics"]="cd $APP_DIR && node -e \"
const { updateAnalytics } = require('./src/lib/cron-jobs');
updateAnalytics().catch(console.error);
\""

TASK_SCHEDULES["update_analytics"]="*/30 * * * *"  # Every 30 minutes
TASK_DESCRIPTIONS["update_analytics"]="Update analytics data"

# Maintenance tasks
TASKS["cleanup_logs"]="cd $APP_DIR && node -e \"
const { cleanupLogs } = require('./src/lib/logging');
cleanupLogs();
\""

TASK_SCHEDULES["cleanup_logs"]="0 2 * * *"  # Daily at 2 AM
TASK_DESCRIPTIONS["cleanup_logs"]="Clean up old log files"

TASKS["backup_database"]="$SCRIPT_DIR/backup.sh create"
TASK_SCHEDULES["backup_database"]="0 3 * * *"  # Daily at 3 AM
TASK_DESCRIPTIONS["backup_database"]="Create database backup"

TASKS["health_check"]="$SCRIPT_DIR/monitor.sh check"
TASK_SCHEDULES["health_check"]="*/5 * * * *"  # Every 5 minutes
TASK_DESCRIPTIONS["health_check"]="Perform health check"

TASKS["generate_daily_report"]="$SCRIPT_DIR/monitor.sh report"
TASK_SCHEDULES["generate_daily_report"]="0 8 * * *"  # Daily at 8 AM
TASK_DESCRIPTIONS["generate_daily_report"]="Generate daily monitoring report"

# Data processing tasks
TASKS["calculate_rebates"]="cd $APP_DIR && node -e \"
const { calculateRebates } = require('./src/lib/cron-jobs');
calculateRebates().catch(console.error);
\""

TASK_SCHEDULES["calculate_rebates"]="0 16 * * *"  # Daily at 4 PM
TASK_DESCRIPTIONS["calculate_rebates"]="Calculate daily rebates"

TASKS["sync_broker_data"]="cd $APP_DIR && node -e \"
const { syncBrokerData } = require('./src/lib/cron-jobs');
syncBrokerData().catch(console.error);
\""

TASK_SCHEDULES["sync_broker_data"]="*/15 * * * *"  # Every 15 minutes
TASK_DESCRIPTIONS["sync_broker_data"]="Sync data from brokers"

TASKS["update_user_stats"]="cd $APP_DIR && node -e \"
const { updateUserStats } = require('./src/lib/cron-jobs');
updateUserStats().catch(console.error);
\""

TASK_SCHEDULES["update_user_stats"]="0 */2 * * *"  # Every 2 hours
TASK_DESCRIPTIONS["update_user_stats"]="Update user statistics"

# Gamification tasks
TASKS["process_achievements"]="cd $APP_DIR && node -e \"
const { processAchievements } = require('./src/lib/gamification');
processAchievements().catch(console.error);
\""

TASK_SCHEDULES["process_achievements"]="0 12 * * *"  # Daily at noon
TASK_DESCRIPTIONS["process_achievements"]="Process user achievements"

TASKS["leaderboard_update"]="cd $APP_DIR && node -e \"
const { updateLeaderboard } = require('./src/lib/gamification');
updateLeaderboard().catch(console.error);
\""

TASK_SCHEDULES["leaderboard_update"]="0 20 * * *"  # Daily at 8 PM
TASK_DESCRIPTIONS["leaderboard_update"]="Update leaderboard rankings"

# Execute a single task
execute_task() {
    local task_name=$1
    local task_command="${TASKS[$task_name]}"
    
    if [[ -z "$task_command" ]]; then
        error "Task not found: $task_name"
    fi
    
    log "Executing task: $task_name"
    log "Description: ${TASK_DESCRIPTIONS[$task_name]}"
    
    local start_time=$(date +%s)
    local temp_log="/tmp/task-$task_name-$(date +%s).log"
    
    # Execute task and capture output
    if eval "$task_command" > "$temp_log" 2>&1; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        success "Task completed: $task_name (${duration}s)"
        
        # Log task output
        log "Task output:"
        cat "$temp_log" | while read -r line; do
            log "  $line"
        done
        
        # Send success notification if configured
        if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
            curl -X POST -H 'Content-type: application/json' \
                --data "{\"text\":\"✅ $APP_NAME task '$task_name' completed successfully (${duration}s)\"}" \
                "$SLACK_WEBHOOK_URL" || true
        fi
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        
        error "Task failed: $task_name (${duration}s)"
        
        # Log error output
        log "Task error output:"
        cat "$temp_log" | while read -r line; do
            log "  ERROR: $line"
        done
        
        # Send failure notification
        if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
            curl -X POST -H 'Content-type: application/json' \
                --data "{\"text\":\"❌ $APP_NAME task '$task_name' failed (${duration}s)\"}" \
                "$SLACK_WEBHOOK_URL" || true
        fi
        
        # Try to execute fallback task if defined
        if [[ -n "${FALLBACK_TASKS[$task_name]}" ]]; then
            log "Executing fallback task for: $task_name"
            execute_task "${FALLBACK_TASKS[$task_name]}"
        fi
    fi
    
    rm -f "$temp_log"
}

# Generate crontab entries
generate_crontab() {
    log "Generating crontab entries..."
    
    local crontab_content="# ApexRebate Scheduled Tasks"
    crontab_content+=$'\n'
    crontab_content+="# Generated on $(date)"
    crontab_content+=$'\n'
    crontab_content+=$'\n'
    
    for task_name in "${!TASK_SCHEDULES[@]}"; do
        local schedule="${TASK_SCHEDULES[$task_name]}"
        local task_command="cd $APP_DIR && $SCRIPT_DIR/scheduler.sh run_task $task_name"
        
        crontab_content+="$schedule $task_command"
        crontab_content+=$'\n'
    done
    
    echo "$crontab_content"
}

# Install crontab
install_crontab() {
    log "Installing crontab..."
    
    local temp_crontab="/tmp/crontab-$APP_NAME-$(date +%s)"
    generate_crontab > "$temp_crontab"
    
    # Backup existing crontab
    crontab -l > "/tmp/crontab-backup-$(date +%s)" 2>/dev/null || true
    
    # Install new crontab
    crontab "$temp_crontab"
    rm -f "$temp_crontab"
    
    success "Crontab installed successfully"
    
    # Show installed tasks
    log "Installed tasks:"
    crontab -l | grep "$APP_NAME" | while read -r line; do
        log "  $line"
    done
}

# Run scheduler in daemon mode
run_daemon() {
    log "Starting scheduler daemon..."
    
    # Write PID file
    echo $$ > "$PID_FILE"
    
    # Setup signal handlers
    trap 'log "Scheduler daemon stopping"; rm -f "$PID_FILE"; exit 0' SIGTERM SIGINT
    
    log "Scheduler daemon started (PID: $$)"
    
    # Main daemon loop
    while true; do
        local current_time=$(date +"%Y-%m-%d %H:%M")
        local current_minute=$(date +"%M")
        local current_hour=$(date +"%H")
        local current_day=$(date +"%d")
        local current_month=$(date +"%m")
        local current_dow=$(date +"%u")  # 1-7 (Monday-Sunday)
        
        # Check each task
        for task_name in "${!TASK_SCHEDULES[@]}"; do
            local schedule="${TASK_SCHEDULES[$task_name]}"
            
            # Parse cron schedule (simplified - for production, consider using a proper cron library)
            if should_run_task "$schedule" "$current_minute" "$current_hour" "$current_day" "$current_month" "$current_dow"; then
                log "Scheduled task triggered: $task_name"
                execute_task "$task_name"
            fi
        done
        
        # Sleep until next minute
        sleep 60
    done
}

# Check if task should run (simplified cron parsing)
should_run_task() {
    local schedule=$1
    local current_minute=$2
    local current_hour=$3
    local current_day=$4
    local current_month=$5
    local current_dow=$6
    
    # Parse schedule fields
    IFS=' ' read -ra FIELDS <<< "$schedule"
    local cron_minute="${FIELDS[0]}"
    local cron_hour="${FIELDS[1]}"
    local cron_day="${FIELDS[2]}"
    local cron_month="${FIELDS[3]}"
    local cron_dow="${FIELDS[4]}"
    
    # Check each field (simplified)
    [[ "$cron_minute" == "*" || "$cron_minute" == "$current_minute" ]] || return 1
    [[ "$cron_hour" == "*" || "$cron_hour" == "$current_hour" ]] || return 1
    [[ "$cron_day" == "*" || "$cron_day" == "$current_day" ]] || return 1
    [[ "$cron_month" == "*" || "$cron_month" == "$current_month" ]] || return 1
    [[ "$cron_dow" == "*" || "$cron_dow" == "$current_dow" ]] || return 1
    
    return 0
}

# List all tasks
list_tasks() {
    log "Available tasks:"
    echo ""
    
    printf "%-30s %-20s %s\n" "TASK NAME" "SCHEDULE" "DESCRIPTION"
    printf "%-30s %-20s %s\n" "--------" "--------" "-----------"
    
    for task_name in "${!TASK_SCHEDULES[@]}"; do
        printf "%-30s %-20s %s\n" "$task_name" "${TASK_SCHEDULES[$task_name]}" "${TASK_DESCRIPTIONS[$task_name]}"
    done
}

# Show task status
show_status() {
    log "Scheduler status:"
    
    if check_running; then
        local pid=$(cat "$PID_FILE")
        success "Scheduler is running (PID: $pid)"
        
        # Show recent task executions
        log "Recent task executions:"
        tail -20 "$LOG_FILE" | grep "Task completed\|Task failed" | while read -r line; do
            echo "  $line"
        done
    else
        warning "Scheduler is not running"
    fi
    
    # Show crontab status
    log "Crontab entries:"
    local crontab_count=$(crontab -l 2>/dev/null | grep -c "$APP_NAME" || echo "0")
    echo "  $crontab_count tasks scheduled"
}

# Stop scheduler daemon
stop_daemon() {
    if [[ -f "$PID_FILE" ]]; then
        local pid=$(cat "$PID_FILE")
        if ps -p "$pid" > /dev/null 2>&1; then
            log "Stopping scheduler daemon (PID: $pid)..."
            kill "$pid"
            
            # Wait for process to stop
            local count=0
            while ps -p "$pid" > /dev/null 2>&1 && [[ $count -lt 10 ]]; do
                sleep 1
                count=$((count + 1))
            done
            
            if ps -p "$pid" > /dev/null 2>&1; then
                warning "Force killing scheduler daemon..."
                kill -9 "$pid"
            fi
            
            rm -f "$PID_FILE"
            success "Scheduler daemon stopped"
        else
            warning "Scheduler daemon not running"
            rm -f "$PID_FILE"
        fi
    else
        warning "PID file not found, scheduler may not be running"
    fi
}

# Main function
main() {
    # Create log directory
    mkdir -p "$(dirname "$LOG_FILE")"
    
    case "${1:-help}" in
        "start")
            if check_running; then
                error "Scheduler is already running"
            fi
            run_daemon
            ;;
        "stop")
            stop_daemon
            ;;
        "restart")
            stop_daemon
            sleep 2
            run_daemon
            ;;
        "status")
            show_status
            ;;
        "run_task")
            execute_task "$2"
            ;;
        "list")
            list_tasks
            ;;
        "install")
            install_crontab
            ;;
        "generate_crontab")
            generate_crontab
            ;;
        "help"|*)
            echo "Usage: $0 {start|stop|restart|status|run_task|list|install|generate_crontab|help}"
            echo ""
            echo "Commands:"
            echo "  start                Start scheduler daemon"
            echo "  stop                 Stop scheduler daemon"
            echo "  restart              Restart scheduler daemon"
            echo "  status               Show scheduler status"
            echo "  run_task <task>      Execute a specific task"
            echo "  list                 List all available tasks"
            echo "  install              Install crontab entries"
            echo "  generate_crontab     Generate crontab entries"
            echo "  help                 Show this help message"
            echo ""
            echo "Environment Variables:"
            echo "  SLACK_WEBHOOK_URL    Slack webhook for notifications"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"