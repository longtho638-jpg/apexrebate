#!/bin/bash
# Script to trigger vercel-optimize agent via GitHub API
# Usage: ./trigger-vercel-optimize.sh [branch] [pr_number] [repo]

set -e

BRANCH="${1:-main}"
PR_NUMBER="${2:-}"
REPO="${3:-longtho638-jpg/apexrebate}"

echo "🚀 Triggering vercel-optimize agent..."
echo "Repository: $REPO"
echo "Branch: $BRANCH"
echo "PR Number: ${PR_NUMBER:-N/A}"

# Check if GH_TOKEN or GITHUB_TOKEN is set
if [ -z "$GH_TOKEN" ] && [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GH_TOKEN or GITHUB_TOKEN environment variable is required"
  echo "Please set one of them with a GitHub personal access token"
  exit 1
fi

TOKEN="${GH_TOKEN:-$GITHUB_TOKEN}"

# Build the payload
if [ -n "$PR_NUMBER" ]; then
  PAYLOAD=$(cat <<EOF
{
  "event_type": "run-agent",
  "client_payload": {
    "agent": "vercel-optimize",
    "branch": "$BRANCH",
    "pr_number": "$PR_NUMBER"
  }
}
EOF
)
else
  PAYLOAD=$(cat <<EOF
{
  "event_type": "run-agent",
  "client_payload": {
    "agent": "vercel-optimize",
    "branch": "$BRANCH"
  }
}
EOF
)
fi

echo ""
echo "Payload:"
echo "$PAYLOAD"
echo ""

# Trigger the workflow
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
  -H "Accept: application/vnd.github+json" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-GitHub-Api-Version: 2022-11-28" \
  https://api.github.com/repos/$REPO/dispatches \
  -d "$PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "204" ]; then
  echo "✅ Successfully triggered vercel-optimize agent!"
  echo ""
  echo "Check the workflow run at:"
  echo "https://github.com/$REPO/actions/workflows/agent-vercel-optimize.yml"
else
  echo "❌ Failed to trigger workflow. HTTP code: $HTTP_CODE"
  echo "Response: $BODY"
  exit 1
fi
