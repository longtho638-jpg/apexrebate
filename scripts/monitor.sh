#!/bin/bash

# ApexRebate Monitoring Script
# Monitors application health, performance, and sends alerts

set -e

# Configuration
APP_NAME="apexrebate"
LOG_FILE="/var/log/monitor-$APP_NAME.log"
HEALTH_CHECK_URL="http://localhost:3000/api/health"
METRICS_URL="http://localhost:3000/api/monitoring/performance"
ALERT_THRESHOLD_CPU=80
ALERT_THRESHOLD_MEMORY=85
ALERT_THRESHOLD_DISK=90
ALERT_THRESHOLD_RESPONSE_TIME=5000
CHECK_INTERVAL=60

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
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

# Check application health
check_health() {
    local response=$(curl -s -w "%{http_code}" "$HEALTH_CHECK_URL" 2>/dev/null)
    local http_code="${response: -3}"
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" "$HEALTH_CHECK_URL" 2>/dev/null)
    
    if [[ "$http_code" == "200" ]]; then
        if (( $(echo "$response_time > $ALERT_THRESHOLD_RESPONSE_TIME" | bc -l) )); then
            warning "Slow response time: ${response_time}s (threshold: ${ALERT_THRESHOLD_RESPONSE_TIME}s)"
            return 1
        else
            success "Health check passed (response time: ${response_time}s)"
            return 0
        fi
    else
        error "Health check failed (HTTP $http_code)"
        return 1
    fi
}

# Check system resources
check_system_resources() {
    local alert_sent=false
    
    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    if (( $(echo "$cpu_usage > $ALERT_THRESHOLD_CPU" | bc -l) )); then
        warning "High CPU usage: ${cpu_usage}%"
        alert_sent=true
    fi
    
    # Memory usage
    local memory_usage=$(free | grep Mem | awk '{printf "%.1f", $3/$2 * 100.0}')
    if (( $(echo "$memory_usage > $ALERT_THRESHOLD_MEMORY" | bc -l) )); then
        warning "High memory usage: ${memory_usage}%"
        alert_sent=true
    fi
    
    # Disk usage
    local disk_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [[ $disk_usage -gt $ALERT_THRESHOLD_DISK ]]; then
        warning "High disk usage: ${disk_usage}%"
        alert_sent=true
    fi
    
    if [[ "$alert_sent" == "false" ]]; then
        success "System resources normal"
        return 0
    else
        return 1
    fi
}

# Check application metrics
check_application_metrics() {
    local metrics_response=$(curl -s "$METRICS_URL" 2>/dev/null)
    
    if [[ -n "$metrics_response" ]]; then
        # Parse metrics (example checks)
        local active_users=$(echo "$metrics_response" | jq -r '.activeUsers // 0' 2>/dev/null || echo "0")
        local error_rate=$(echo "$metrics_response" | jq -r '.errorRate // 0' 2>/dev/null || echo "0")
        
        if (( $(echo "$error_rate > 5" | bc -l) )); then
            warning "High error rate: ${error_rate}%"
            return 1
        fi
        
        success "Application metrics normal (active users: $active_users, error rate: ${error_rate}%)"
        return 0
    else
        warning "Could not fetch application metrics"
        return 1
    fi
}

# Check database connectivity
check_database() {
    if command -v sqlite3 &> /dev/null; then
        if sqlite3 "/var/www/$APP_NAME/db/custom.db" "SELECT 1;" &> /dev/null; then
            success "Database connection OK"
            return 0
        else
            error "Database connection failed"
            return 1
        fi
    else
        warning "SQLite3 not available for database check"
        return 1
    fi
}

# Check log files for errors
check_logs() {
    local error_count=$(grep -c "ERROR\|FATAL" "/var/www/$APP_NAME/logs/app.log" 2>/dev/null || echo "0")
    local recent_errors=$(grep "$(date +'%Y-%m-%d')" "/var/www/$APP_NAME/logs/app.log" 2>/dev/null | grep -c "ERROR\|FATAL" || echo "0")
    
    if [[ $recent_errors -gt 5 ]]; then
        warning "High number of recent errors: $recent_errors"
        return 1
    elif [[ $error_count -gt 0 ]]; then
        warning "Errors found in logs: $error_count total, $recent_errors today"
        return 1
    else
        success "No errors found in logs"
        return 0
    fi
}

# Restart application if needed
restart_application() {
    log "Restarting application..."
    
    if systemctl is-active --quiet "$APP_NAME"; then
        sudo systemctl restart "$APP_NAME"
        success "Application restarted via systemd"
    else
        # Fallback: kill and restart Node.js processes
        pkill -f "next-server" || true
        cd "/var/www/$APP_NAME"
        nohup npm run start > /dev/null 2>&1 &
        success "Application restarted manually"
    fi
    
    # Wait for application to start
    sleep 10
    
    if check_health; then
        success "Application restarted successfully"
    else
        error "Application failed to start after restart"
        send_alert "CRITICAL" "Application failed to start after restart"
    fi
}

# Send alerts
send_alert() {
    local severity=$1
    local message=$2
    
    # Log the alert
    error "ALERT [$severity]: $message"
    
    # Send to Slack (if webhook is configured)
    if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
        local color="good"
        case "$severity" in
            "CRITICAL") color="danger" ;;
            "WARNING") color="warning" ;;
        esac
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{
                \"attachments\": [{
                    \"color\": \"$color\",
                    \"title\": \"$APP_NAME Alert [$severity]\",
                    \"text\": \"$message\",
                    \"ts\": $(date +%s)
                }]
            }" \
            "$SLACK_WEBHOOK_URL" || true
    fi
    
    # Send email (if configured)
    if [[ -n "$ADMIN_EMAIL" ]]; then
        echo "$message" | mail -s "$APP_NAME Alert [$severity]" "$ADMIN_EMAIL" || true
    fi
    
    # Send SMS (if configured with Twilio)
    if [[ -n "$TWILIO_ACCOUNT_SID" ]] && [[ -n "$ADMIN_PHONE" ]]; then
        curl -X POST "https://api.twilio.com/2010-04-01/Accounts/$TWILIO_ACCOUNT_SID/Messages.json" \
            --data-urlencode "To=$ADMIN_PHONE" \
            --data-urlencode "From=$TWILIO_PHONE_NUMBER" \
            --data-urlencode "Body=$APP_NAME Alert [$severity]: $message" \
            -u "$TWILIO_ACCOUNT_SID:$TWILIO_AUTH_TOKEN" || true
    fi
}

# Generate monitoring report
generate_report() {
    local report_file="/var/log/$APP_NAME-daily-report-$(date +%Y%m%d).log"
    
    {
        echo "=== $APP_NAME Daily Monitoring Report ==="
        echo "Date: $(date)"
        echo ""
        
        echo "=== System Information ==="
        echo "Uptime: $(uptime)"
        echo "Load Average: $(uptime | awk -F'load average:' '{print $2}')"
        echo ""
        
        echo "=== Resource Usage ==="
        echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')%"
        echo "Memory: $(free | grep Mem | awk '{printf "%.1f%%", $3/$2 * 100.0}')"
        echo "Disk: $(df / | awk 'NR==2 {print $5}')"
        echo ""
        
        echo "=== Application Status ==="
        if check_health > /dev/null 2>&1; then
            echo "Health: OK"
        else
            echo "Health: FAILED"
        fi
        
        if check_database > /dev/null 2>&1; then
            echo "Database: OK"
        else
            echo "Database: FAILED"
        fi
        
        echo ""
        echo "=== Recent Errors ==="
        grep "$(date +'%Y-%m-%d')" "/var/www/$APP_NAME/logs/app.log" 2>/dev/null | grep "ERROR\|FATAL" | tail -10 || echo "No recent errors"
        
    } > "$report_file"
    
    success "Daily report generated: $report_file"
    
    # Email report if configured
    if [[ -n "$ADMIN_EMAIL" ]]; then
        cat "$report_file" | mail -s "$APP_NAME Daily Report - $(date +%Y-%m-%d)" "$ADMIN_EMAIL" || true
    fi
}

# Continuous monitoring
monitor_continuous() {
    log "Starting continuous monitoring (interval: ${CHECK_INTERVAL}s)..."
    
    while true; do
        local overall_status=0
        
        # Run all checks
        check_health || overall_status=1
        check_system_resources || overall_status=1
        check_application_metrics || overall_status=1
        check_database || overall_status=1
        check_logs || overall_status=1
        
        # Take action if there are issues
        if [[ $overall_status -ne 0 ]]; then
            log "Issues detected, attempting recovery..."
            
            # Try to restart application if health checks fail
            if ! check_health > /dev/null 2>&1; then
                restart_application
            fi
            
            # Send alert
            send_alert "WARNING" "Multiple issues detected in $APP_NAME monitoring"
        fi
        
        # Sleep until next check
        sleep $CHECK_INTERVAL
    done
}

# Main function
main() {
    log "Starting $APP_NAME monitoring..."
    
    case "${1:-check}" in
        "continuous")
            monitor_continuous
            ;;
        "report")
            generate_report
            ;;
        "restart")
            restart_application
            ;;
        "check"|*)
            local overall_status=0
            
            # Run all checks
            check_health || overall_status=1
            check_system_resources || overall_status=1
            check_application_metrics || overall_status=1
            check_database || overall_status=1
            check_logs || overall_status=1
            
            if [[ $overall_status -eq 0 ]]; then
                success "All monitoring checks passed"
            else
                warning "Some monitoring checks failed"
                exit 1
            fi
            ;;
    esac
}

# Trap to handle script termination
trap 'log "Monitoring script stopped"; exit 0' SIGTERM SIGINT

# Run main function
main "$@"