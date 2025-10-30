#!/bin/bash

# ApexRebate 自动化系统快速启动脚本
# 版本: v2.1.0
# 更新时间: 2025-01-07

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_header() {
    echo -e "${PURPLE}$1${NC}"
}

# 检查系统要求
check_requirements() {
    log_header "🔍 检查系统要求..."
    
    # 检查 Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，请先安装 Node.js 18+"
        exit 1
    fi
    
    # 检查 npm
    if ! command -v npm &> /dev/null; then
        log_error "npm 未安装"
        exit 1
    fi
    
    # 检查 Docker (可选)
    if command -v docker &> /dev/null; then
        log_success "Docker 已安装"
    else
        log_warning "Docker 未安装，某些功能可能无法使用"
    fi
    
    # 检查内存
    MEMORY=$(free -m | awk 'NR==2{printf "%.0f", $2/1024}')
    if [ $MEMORY -lt 2 ]; then
        log_warning "系统内存少于 2GB，可能影响性能"
    else
        log_success "系统内存充足: ${MEMORY}GB"
    fi
    
    log_success "系统要求检查完成"
}

# 安装依赖
install_dependencies() {
    log_header "📦 安装项目依赖..."
    
    if [ ! -d "node_modules" ]; then
        log_info "首次安装依赖..."
        npm install
    else
        log_info "依赖已存在，检查更新..."
        npm update
    fi
    
    log_success "依赖安装完成"
}

# 数据库初始化
init_database() {
    log_header "🗄️ 初始化数据库..."
    
    # 检查 Prisma 是否已生成
    if [ ! -d "node_modules/.prisma" ]; then
        log_info "生成 Prisma 客户端..."
        npm run db:generate
    fi
    
    # 推送数据库 schema
    log_info "推送数据库 schema..."
    npm run db:push
    
    log_success "数据库初始化完成"
}

# 创建环境配置
setup_environment() {
    log_header "⚙️ 设置环境配置..."
    
    if [ ! -f ".env.local" ]; then
        log_info "创建 .env.local 文件..."
        cat > .env.local << EOF
# ApexRebate 环境配置
NODE_ENV=development

# 数据库配置
DATABASE_URL="file:./dev.db"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# 邮件配置
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis 配置 (可选)
REDIS_URL="redis://localhost:6379"

# AWS S3 配置 (可选)
AWS_ACCESS_KEY_ID="your-access-key"
AWS_SECRET_ACCESS_KEY="your-secret-key"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="apexrebate-backups"

# 监控配置
SLACK_WEBHOOK_URL="your-slack-webhook-url"
ADMIN_EMAIL="admin@apexrebate.com"

# AI SDK 配置
ZAI_API_KEY="your-zai-api-key"
EOF
        log_warning "请编辑 .env.local 文件配置您的环境变量"
    else
        log_success ".env.local 文件已存在"
    fi
}

# 启动自动化服务
start_automation_services() {
    log_header "🚀 启动自动化服务..."
    
    # 检查并创建必要的目录
    mkdir -p logs
    mkdir -p backups
    mkdir -p scripts/temp
    
    # 设置脚本权限
    chmod +x scripts/*.sh
    
    # 启动监控服务 (后台运行)
    if [ -f "scripts/monitor.sh" ]; then
        log_info "启动系统监控..."
        nohup bash scripts/monitor.sh > logs/monitor.log 2>&1 &
        echo $! > logs/monitor.pid
        log_success "监控服务已启动 (PID: $(cat logs/monitor.pid))"
    fi
    
    # 启动任务调度器 (后台运行)
    if [ -f "scripts/scheduler.sh" ]; then
        log_info "启动任务调度器..."
        nohup bash scripts/scheduler.sh > logs/scheduler.log 2>&1 &
        echo $! > logs/scheduler.pid
        log_success "任务调度器已启动 (PID: $(cat logs/scheduler.pid))"
    fi
    
    log_success "自动化服务启动完成"
}

# 运行健康检查
run_health_check() {
    log_header "🏥 运行健康检查..."
    
    # 检查端口占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
        log_warning "端口 3000 已被占用"
    else
        log_success "端口 3000 可用"
    fi
    
    # 检查数据库连接
    if [ -f "dev.db" ]; then
        log_success "数据库文件存在"
    else
        log_warning "数据库文件不存在，将在首次启动时创建"
    fi
    
    # 检查日志目录
    if [ -d "logs" ]; then
        log_success "日志目录已准备"
    else
        log_warning "日志目录不存在，正在创建..."
        mkdir -p logs
    fi
    
    log_success "健康检查完成"
}

# 显示系统信息
show_system_info() {
    log_header "📊 系统信息"
    
    echo -e "${CYAN}ApexRebate 自动化系统${NC}"
    echo -e "${CYAN}版本: v2.1.0${NC}"
    echo -e "${CYAN}启动时间: $(date)${NC}"
    echo ""
    echo -e "${BLUE}可用的管理命令:${NC}"
    echo -e "  启动开发服务器: ${GREEN}npm run dev${NC}"
    echo -e "  构建生产版本: ${GREEN}npm run build${NC}"
    echo -e "  启动生产服务器: ${GREEN}npm run start${NC}"
    echo -e "  查看系统日志: ${GREEN}tail -f logs/app.log${NC}"
    echo -e "  运行部署脚本: ${GREEN}bash scripts/deploy.sh${NC}"
    echo -e "  手动备份: ${GREEN}bash scripts/backup.sh${NC}"
    echo -e "  系统监控: ${GREEN}bash scripts/monitor.sh${NC}"
    echo ""
    echo -e "${BLUE}访问地址:${NC}"
    echo -e "  前端应用: ${GREEN}http://localhost:3000${NC}"
    echo -e "  API 文档: ${GREEN}http://localhost:3000/api${NC}"
    echo -e "  监控面板: ${GREEN}http://localhost:3000/admin${NC}"
    echo ""
    echo -e "${YELLOW}注意事项:${NC}"
    echo -e "  1. 请确保已正确配置 .env.local 文件"
    echo -e "  2. 首次启动可能需要几分钟初始化"
    echo -e "  3. 如遇问题请查看 logs/ 目录下的日志文件"
    echo ""
}

# 主函数
main() {
    clear
    log_header "🎯 ApexRebate 自动化系统快速启动"
    echo ""
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行启动流程
    check_requirements
    echo ""
    
    install_dependencies
    echo ""
    
    setup_environment
    echo ""
    
    init_database
    echo ""
    
    start_automation_services
    echo ""
    
    run_health_check
    echo ""
    
    show_system_info
    
    log_success "🎉 ApexRebate 自动化系统启动完成！"
    echo ""
    log_info "现在您可以运行以下命令启动开发服务器："
    echo -e "${GREEN}npm run dev${NC}"
    echo ""
}

# 脚本入口
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi