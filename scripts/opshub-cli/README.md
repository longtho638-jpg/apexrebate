# OpsHub CLI

Google Ops Hub CLI for ApexRebate - Complete CI/CD, monitoring, and alerting in Google ecosystem.

## Installation

```bash
cd scripts/opshub-cli
npm install
npm link  # Makes 'opshub' command available globally
```

## Setup

1. Run the deploy script first:
   ```bash
   ./scripts/deploy-opshub.sh --init
   ```

2. Update `.opshub.json` with your Apps Script Web App URL

3. Authenticate with Google Cloud:
   ```bash
   gcloud auth application-default login
   ```

## Usage

### CI/CD Operations

```bash
# Log CI status
opshub ci status --status success --branch main --commit abc123 --preview-url https://preview.url

# View recent CI logs
opshub ci logs
```

### Alerts

```bash
# Send alert
opshub alert "Build failed on production" --level error --project ApexRebate
```

### Metrics

```bash
# Log performance metrics
opshub metrics log --env prod --build-time 120 --bundle-size 2.5 --p95-latency 150 --error-rate 0.1 --commit abc123

# View recent metrics
opshub metrics view
```

### Infrastructure

```bash
# Deploy/update infrastructure
opshub deploy

# Check system health
opshub health
```

## Configuration

The CLI reads configuration from `.opshub.json` in the project root:

```json
{
  "project_id": "your-gcp-project",
  "hub_url": "https://region-project.cloudfunctions.net/opshub",
  "script_url": "https://script.google.com/macros/s/.../exec",
  "firestore": "projects/project/databases/(default)",
  "region": "asia-southeast1"
}
```

## Integration with GitHub Actions

Update your `.github/workflows/codex-remix.yml` to use OpsHub:

```yaml
- name: Notify OpsHub
  run: |
    npx opshub ci status \
      --status ${{ job.status }} \
      --branch ${{ github.ref_name }} \
      --commit ${{ github.sha }} \
      --preview-url "https://apexrebate--${{ github.ref_name }}.web.app"
```

## Architecture

- **Cloud Functions**: Main API endpoints (`/ci`, `/alert`, `/metrics`)
- **Firestore**: Centralized logging and data storage
- **Apps Script**: Automation layer for Gmail, Sheets, Chat notifications
- **CLI**: Command-line interface for operations

All within Google Cloud ecosystem for maximum security and integration.
