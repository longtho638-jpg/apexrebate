#!/bin/bash

# OpsHub Deploy Script
# Deploys Google Ops Hub infrastructure: Cloud Function + Apps Script + Firestore
# Usage: ./scripts/deploy-opshub.sh [--init | --update | --test]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default mode
MODE="init"

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --init)
      MODE="init"
      shift
      ;;
    --update)
      MODE="update"
      shift
      ;;
    --test)
      MODE="test"
      shift
      ;;
    --help)
      echo "Usage: $0 [--init | --update | --test]"
      echo ""
      echo "Modes:"
      echo "  --init    Initialize new OpsHub infrastructure"
      echo "  --update  Update existing OpsHub deployment"
      echo "  --test    Test OpsHub endpoints"
      echo ""
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

echo -e "${BLUE}🚀 Starting OpsHub deployment in $MODE mode${NC}"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI not installed. Install from https://cloud.google.com/sdk/docs/install${NC}"
  exit 1
fi

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null; then
  echo -e "${RED}Error: Not authenticated with gcloud. Run: gcloud auth login${NC}"
  exit 1
fi

# Get project ID
PROJECT_ID=$(gcloud config get-value project)
if [ -z "$PROJECT_ID" ]; then
  echo -e "${RED}Error: No default project set. Run: gcloud config set project YOUR_PROJECT_ID${NC}"
  exit 1
fi

echo -e "${GREEN}Using project: $PROJECT_ID${NC}"

case $MODE in
  init)
    echo -e "${YELLOW}Initializing OpsHub infrastructure...${NC}"

    # Enable required APIs
    echo "Enabling required APIs..."
    gcloud services enable cloudfunctions.googleapis.com \
      firestore.googleapis.com \
      script.googleapis.com \
      bigquery.googleapis.com \
      chat.googleapis.com \
      --project="$PROJECT_ID"

    # Create Firestore database
    echo "Creating Firestore database..."
    gcloud firestore databases create --region=asia-southeast1 --project="$PROJECT_ID" || echo "Firestore may already exist"

    # Deploy Cloud Function
    echo "Deploying Cloud Function..."
    gcloud functions deploy opShub \
      --runtime=nodejs18 \
      --trigger-http \
      --allow-unauthenticated \
      --region=asia-southeast1 \
      --source="$SCRIPT_DIR/opshub-function" \
      --entry-point=opShub \
      --project="$PROJECT_ID"

    # Get function URL
    FUNCTION_URL=$(gcloud functions describe opShub --region=asia-southeast1 --project="$PROJECT_ID" --format="value(httpsTrigger.url)")
    echo -e "${GREEN}Cloud Function deployed: $FUNCTION_URL${NC}"

    # Create Apps Script project (manual step required)
    echo -e "${YELLOW}Apps Script setup:${NC}"
    echo "1. Go to https://script.google.com"
    echo "2. Create new project: 'ApexRebate Ops Hub'"
    echo "3. Copy content from scripts/OpsHub.gs"
    echo "4. Deploy as Web App (Anyone access)"
    echo "5. Update .opshub.json with the Web App URL"

    # Create config file
    cat > "$PROJECT_ROOT/.opshub.json" << EOF
{
  "project_id": "$PROJECT_ID",
  "hub_url": "$FUNCTION_URL",
  "script_url": "UPDATE_WITH_APPS_SCRIPT_WEB_APP_URL",
  "firestore": "projects/$PROJECT_ID/databases/(default)",
  "region": "asia-southeast1"
}
EOF

    echo -e "${GREEN}✅ OpsHub infrastructure initialized!${NC}"
    echo -e "${YELLOW}Next steps:${NC}"
    echo "1. Complete Apps Script setup"
    echo "2. Update script_url in .opshub.json"
    echo "3. Run: ./scripts/deploy-opshub.sh --test"
    ;;

  update)
    echo -e "${YELLOW}Updating OpsHub deployment...${NC}"

    # Redeploy Cloud Function
    gcloud functions deploy opShub \
      --runtime=nodejs18 \
      --trigger-http \
      --allow-unauthenticated \
      --region=asia-southeast1 \
      --source="$SCRIPT_DIR/opshub-function" \
      --entry-point=opShub \
      --project="$PROJECT_ID"

    echo -e "${GREEN}✅ OpsHub updated successfully!${NC}"
    ;;

  test)
    echo -e "${YELLOW}Testing OpsHub endpoints...${NC}"

    # Check config file
    if [ ! -f "$PROJECT_ROOT/.opshub.json" ]; then
      echo -e "${RED}Error: .opshub.json not found. Run --init first.${NC}"
      exit 1
    fi

    HUB_URL=$(jq -r '.hub_url' "$PROJECT_ROOT/.opshub.json")
    SCRIPT_URL=$(jq -r '.script_url' "$PROJECT_ROOT/.opshub.json")

    # Test Cloud Function
    echo "Testing Cloud Function CI endpoint..."
    curl -X POST "$HUB_URL/ci" \
      -H "Content-Type: application/json" \
      -d '{"project":"ApexRebate","status":"test","message":"OpsHub test"}' || echo "Cloud Function test failed"

    # Test Apps Script (if configured)
    if [ "$SCRIPT_URL" != "UPDATE_WITH_APPS_SCRIPT_WEB_APP_URL" ]; then
      echo "Testing Apps Script CI endpoint..."
      curl -X POST "$SCRIPT_URL?mode=ci" \
        -H "Content-Type: application/json" \
        -d '{"project":"ApexRebate","status":"test","message":"Apps Script test"}' || echo "Apps Script test failed"
    else
      echo "Apps Script URL not configured, skipping test"
    fi

    echo -e "${GREEN}✅ OpsHub testing completed!${NC}"
    ;;
esac

echo -e "${BLUE}🎉 OpsHub deployment script completed!${NC}"
