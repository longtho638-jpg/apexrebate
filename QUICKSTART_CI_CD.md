# 🚀 Quick Start: CI/CD Pipeline

**Time:** 15 phút setup → Automation forever! ⚡

---

## ✅ Checklist (3 bước)

### 1️⃣ Setup GitHub Secrets (10 phút)

**Lấy Firebase credentials:**
1. Vào [Firebase Console](https://console.firebase.google.com/)
2. Chọn project **studio-2007559230-14fa6**
3. Settings ⚙️ → General → Your apps → Web app
4. Copy 3 values:
   - API Key: `AIzaSy...`
   - Sender ID: `1029384756`
   - App ID: `1:1029384756:web:abc...`

**Tạo Service Account:**
1. Vào [GCP Console](https://console.cloud.google.com/)
2. IAM & Admin → Service Accounts
3. Create → Name: `github-actions` → Role: **Firebase Hosting Admin**
4. Keys → Add Key → JSON → Download

**Add vào GitHub:**
```bash
# Option 1: GitHub CLI (nhanh)
gh secret set FIREBASE_SERVICE_ACCOUNT < serviceAccountKey.json
gh secret set FIREBASE_API_KEY "AIzaSy..."
gh secret set FIREBASE_SENDER_ID "1029384756"
gh secret set FIREBASE_APP_ID "1:1029384756:web:abc..."

# Option 2: GitHub Web
# Settings → Secrets → Actions → New secret
```

**Verify:**
```bash
gh secret list
# Phải thấy 4 secrets
```

---

### 2️⃣ Test CI/CD (3 phút)

```bash
# Tạo test branch
git checkout -b test/ci

# Empty commit để trigger
git commit --allow-empty -m "test: CI/CD pipeline"

# Push và tạo PR
git push origin test/ci
gh pr create --base main --title "🧪 Test CI/CD"

# Xem workflow chạy
gh pr view --web
# → Click vào "Actions" tab
```

**Wait ~8 phút** → Workflow complete!

---

### 3️⃣ Verify kết quả (2 phút)

**Check PR comment:**
- ✅ Firebase preview URL: `https://pr-X--apexrebate.web.app/`
- ✅ E2E test results: `35 passed`

**Check Actions tab:**
- ✅ All steps green
- ✅ Playwright report artifact available

**Download report (optional):**
```bash
# GitHub web UI → Actions → Latest run → Artifacts → playwright-report.zip
```

---

## 🎉 Done!

**Từ giờ mỗi PR tự động:**
1. Deploy Firebase preview
2. Run E2E tests
3. Comment results + preview link
4. Upload Playwright report

**Zero manual work!** 🚀

---

## 🆘 Troubleshooting

### Lỗi: "Invalid service account"
→ Verify JSON key có đúng role **Firebase Hosting Admin**

### Lỗi: "Playwright tests failed"
→ Download artifact → Mở `index.html` → Xem chi tiết lỗi

### Lỗi: "Firebase project not found"
→ Check project ID: `studio-2007559230-14fa6`

---

## 📚 Chi tiết hơn

- [GITHUB_SECRETS_SETUP.md](./GITHUB_SECRETS_SETUP.md) - Setup guide đầy đủ
- [CI_CD_COMPLETE.md](./CI_CD_COMPLETE.md) - Technical details
- [PLAYWRIGHT_FIX.md](./PLAYWRIGHT_FIX.md) - Fix local tests

---

**Total time:** 15 phút → ∞ automation! ⚡
