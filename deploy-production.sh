#!/bin/bash

# ==========================================
# APEXREBATE PRODUCTION DEPLOYMENT SCRIPT
# ==========================================
# Run: ./deploy-production.sh

set -e

echo "🚀 Starting ApexRebate Production Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ID="apexrebate-prod"
REGION="asia-southeast1"
SERVICE_NAME="apexrebate"
IMAGE_NAME="gcr.io/${PROJECT_ID}/apexrebate"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command -v gcloud &> /dev/null; then
        print_error "gcloud CLI is not installed. Please install it first."
        exit 1
    fi

    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed. Please install it first."
        exit 1
    fi

    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install Node.js first."
        exit 1
    fi

    print_success "Prerequisites check passed"
}

# Authenticate with Google Cloud
authenticate_gcp() {
    print_status "Authenticating with Google Cloud..."

    if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
        print_warning "GOOGLE_APPLICATION_CREDENTIALS not set. Using interactive login..."
        gcloud auth login
    fi

    gcloud config set project $PROJECT_ID
    gcloud config set compute/region $REGION

    print_success "GCP authentication completed"
}

# Build production image
build_production_image() {
    print_status "Building production Docker image..."

    # Build Next.js for production
    npm run build

    # Build Docker image
    docker build -t $IMAGE_NAME:latest -t $IMAGE_NAME:$(date +%Y%m%d-%H%M%S) .

    print_success "Production image built successfully"
}

# Push image to Google Container Registry
push_image() {
    print_status "Pushing image to Google Container Registry..."

    gcloud auth configure-docker --quiet
    docker push $IMAGE_NAME:latest

    print_success "Image pushed to GCR"
}

# Deploy to Cloud Run
deploy_to_cloud_run() {
    print_status "Deploying to Google Cloud Run..."

    gcloud run deploy $SERVICE_NAME \
        --image $IMAGE_NAME:latest \
        --platform managed \
        --region $REGION \
        --allow-unauthenticated \
        --port 3000 \
        --memory 2Gi \
        --cpu 2 \
        --max-instances 10 \
        --concurrency 100 \
        --timeout 300 \
        --set-env-vars "NODE_ENV=production" \
        --set-secrets "DATABASE_URL=DATABASE_URL:latest" \
        --set-secrets "NEXTAUTH_SECRET=NEXTAUTH_SECRET:latest" \
        --set-secrets "NEXTAUTH_URL=NEXTAUTH_URL:latest"

    print_success "Deployment to Cloud Run completed"
}

# Get service URL
get_service_url() {
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")
    print_success "Service deployed at: $SERVICE_URL"
    echo "🌐 Production URL: $SERVICE_URL"
}

# Setup monitoring (optional)
setup_monitoring() {
    print_status "Setting up Cloud Monitoring..."

    # Enable Cloud Monitoring APIs
    gcloud services enable monitoring.googleapis.com logging.googleapis.com

    # Create uptime check
    gcloud monitoring uptime-checks create http $SERVICE_NAME-uptime \
        --resource-type=uptime-url \
        --resource-labels=host=$SERVICE_NAME \
        --checked-resource-uri=$SERVICE_URL \
        --checker-type=PUBLIC_CHECKER \
        --check-interval=300  # 5 minutes

    print_success "Monitoring setup completed"
}

# Main deployment process
main() {
    echo "=========================================="
    echo "🚀 APEXREBATE PRODUCTION DEPLOYMENT"
    echo "=========================================="

    check_prerequisites
    authenticate_gcp
    build_production_image
    push_image
    deploy_to_cloud_run
    get_service_url

    echo ""
    echo "=========================================="
    print_success "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo "=========================================="
    echo ""
    echo "📋 Next Steps:"
    echo "1. Verify the application at: $SERVICE_URL"
    echo "2. Check Cloud Run logs: gcloud logs read --service=$SERVICE_NAME"
    echo "3. Monitor performance in Cloud Console"
    echo "4. Setup custom domain if needed"
    echo ""
    echo "🔧 Useful commands:"
    echo "- View logs: gcloud logs read --service=$SERVICE_NAME --region=$REGION"
    echo "- Update: gcloud run deploy $SERVICE_NAME --image $IMAGE_NAME:latest"
    echo "- Scale: gcloud run services update $SERVICE_NAME --max-instances=20"
}

# Handle command line arguments
case "${1:-}" in
    "check")
        check_prerequisites
        ;;
    "build")
        build_production_image
        ;;
    "push")
        push_image
        ;;
    "deploy")
        deploy_to_cloud_run
        ;;
    *)
        main
        ;;
esac
