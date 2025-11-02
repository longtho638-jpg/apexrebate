# 📦 Install Google Cloud CLI (gcloud)

## macOS Installation

### Option 1: Homebrew (Recommended)

```bash
brew install google-cloud-sdk
```

### Option 2: Official Installer

```bash
# Download and install
curl https://sdk.cloud.google.com | bash

# Restart shell or run:
exec -l $SHELL

# Initialize
gcloud init
```

## After Installation

### 1. Verify Installation

```bash
gcloud --version
```

### 2. Login

```bash
gcloud auth login
```

### 3. Set Project

```bash
gcloud config set project apexrebate
```

### 4. Enable Application Default Credentials

```bash
gcloud auth application-default login
```

## Alternative: Use Firebase CLI Only

If you don't want to install gcloud, you can set environment variables manually:

### 1. Set Firebase Functions Config

```bash
firebase functions:config:set \
  app.url="https://apexrebate.com" \
  app.secret_key="your-secret-key-123"
```

### 2. Deploy Functions

```bash
firebase deploy --only functions
```

### 3. Create Scheduler Job Manually

Go to: https://console.cloud.google.com/cloudscheduler

**Settings:**
- Name: `apexrebate-cron`
- Frequency: `0 * * * *` (every hour)
- Timezone: `Asia/Ho_Chi_Minh`
- Target: HTTPS
- URL: `https://us-central1-apexrebate.cloudfunctions.net/scheduledCronJobs`
- HTTP Method: POST
- Headers: `Authorization: Bearer your-secret-key-123`

## Troubleshooting

### Command not found

```bash
# Check if gcloud is in PATH
which gcloud

# Add to PATH (if installed via official installer)
echo 'export PATH=$PATH:$HOME/google-cloud-sdk/bin' >> ~/.zshrc
source ~/.zshrc
```

### Permission denied

```bash
gcloud auth login
gcloud auth application-default login
```

## Quick Test

```bash
# Test gcloud
gcloud projects list

# Test Firebase
firebase projects:list
```
