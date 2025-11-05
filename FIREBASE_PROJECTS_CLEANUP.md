# 🧹 Firebase Projects Cleanup

## ✅ ĐÃ FIX

Workflow đã được update:
- **Trước:** `studio-2007559230-14fa6` ❌ (không tồn tại)
- **Sau:** `apexrebate-prod` ✅ (current project)

## 📊 Firebase Projects

1. ✅ **apexrebate-prod** (425437982259) - ACTIVE
2. ⚠️ **apexrebate** (828270415983) - Có thể xóa
3. ⚠️ **apexrebate-os** (539442277707) - Có thể xóa

## 🗑️ Xóa projects cũ (Optional)

⚠️ **KHÔNG HOÀN TÁC!**

```bash
# Verify trước
firebase hosting:sites:list --project apexrebate

# Xóa (nhập project ID để confirm)
firebase projects:delete apexrebate
firebase projects:delete apexrebate-os
```

## 📝 Next steps

```bash
# Commit fix
git add .github/workflows/test-preview.yml
git commit -m "fix(ci): Update Firebase project to apexrebate-prod"
git push

# Test workflow
gh pr view --web
```
