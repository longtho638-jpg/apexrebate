# 🔐 GitHub Secrets Setup Guide

## 📋 Tổng quan

Pipeline CI/CD cần **4 secrets** được configure trong GitHub repository để deploy Firebase Preview và chạy E2E tests tự động.

---

## ✅ Secrets cần tạo

### 1️⃣ `FIREBASE_SERVICE_ACCOUNT` (Required)

**Mô tả:** JSON key của Firebase service account với quyền Firebase Hosting Admin

**Cách lấy:**

1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project `apexrebate-prod`
3. Menu → **IAM & Admin** → **Service Accounts**
4. Click **Create Service Account**:
   - Name: `github-actions-deployer`
   - Role: **Firebase Hosting Admin**
5. Click **Keys** tab → **Add Key** → **Create new key** → JSON
6. Download file JSON

**Thêm vào GitHub:**
```bash
# Option 1: GitHub CLI
gh secret set FIREBASE_SERVICE_ACCOUNT --body "$(cat serviceAccountKey.json)"

# Option 2: GitHub Web UI
# Repo → Settings → Secrets → Actions → New repository secret
# Name: FIREBASE_SERVICE_ACCOUNT
# Value: Copy toàn bộ nội dung JSON file
```

---

### 2️⃣ `FIREBASE_API_KEY` (Required)

**Cách lấy:**

1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **apexrebate-prod**
3. Project Settings (⚙️) → **General** tab
4. Scroll xuống phần **Your apps** → Web app
5. Copy giá trị **API Key** (dạng `AIzaSyA...`)

```bash
gh secret set FIREBASE_API_KEY --body "AIzaSyApexRebate1234567890abcdefg"
```

---

### 3️⃣ `FIREBASE_SENDER_ID` (Required)

**Cách lấy:** Firebase Console → Project Settings → Copy **Messaging Sender ID**

```bash
gh secret set FIREBASE_SENDER_ID --body "1029384756"
```

---

### 4️⃣ `FIREBASE_APP_ID` (Required)

**Cách lấy:** Firebase Console → Project Settings → Copy **App ID**

```bash
gh secret set FIREBASE_APP_ID --body "1:1029384756:web:abcdef1234567890"
```

---

## 🚀 Setup nhanh với GitHub CLI

```bash
# 1. Đăng nhập GitHub CLI (nếu chưa)
gh auth login

# 2. Thiết lập toàn bộ secrets (thay giá trị thực tế)
gh secret set FIREBASE_SERVICE_ACCOUNT --body "$(cat serviceAccountKey.json)"
gh secret set FIREBASE_API_KEY --body "AIzaSyApexRebate1234567890abcdefg"
gh secret set FIREBASE_SENDER_ID --body "1029384756"
gh secret set FIREBASE_APP_ID --body "1:1029384756:web:abcdef1234567890"

# 3. Verify secrets đã được tạo
gh secret list
```

---

## 🌐 Setup qua GitHub Web UI

1. Vào repository **longtho638-jpg/apexrebate**
2. Tab **Settings** → Sidebar menu **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Nhập từng secret theo bảng:

| Secret Name                | Giá trị                                               |
| -------------------------- | ----------------------------------------------------- |
| `FIREBASE_SERVICE_ACCOUNT` | Nội dung file serviceAccountKey.json (toàn bộ JSON)   |
| `FIREBASE_API_KEY`         | `AIzaSyA...` (từ Firebase Console)                    |
| `FIREBASE_SENDER_ID`       | `1029384756` (số, từ Firebase Console)                |
| `FIREBASE_APP_ID`          | `1:1029384756:web:abc...` (từ Firebase Console)       |

---

## 🧪 Verify setup hoàn tất

```bash
# Test 1: Secrets đã được tạo
gh secret list

# Test 2: Trigger CI pipeline
git checkout -b test/ci-setup
git commit --allow-empty -m "test: trigger CI pipeline"
git push origin test/ci-setup
gh pr create --base main --head test/ci-setup --title "Test CI/CD Pipeline"
```

**Kết quả mong đợi:**
- ✅ Firebase preview deployed → `https://pr-1--apexrebate.web.app/`
- ✅ E2E tests chạy trên preview URL
- ✅ Playwright report upload trong **Artifacts** tab

---

## ✅ Checklist hoàn thành

- [ ] Tạo Firebase service account với role **Firebase Hosting Admin**
- [ ] Download JSON key file
- [ ] Thêm `FIREBASE_SERVICE_ACCOUNT` secret vào GitHub
- [ ] Thêm `FIREBASE_API_KEY` secret vào GitHub
- [ ] Thêm `FIREBASE_SENDER_ID` secret vào GitHub
- [ ] Thêm `FIREBASE_APP_ID` secret vào GitHub
- [ ] Verify: `gh secret list` hiển thị 4 secrets
- [ ] Test: Tạo PR và verify CI pipeline chạy thành công

🚀 **Không cần đụng tay gì nữa!**
