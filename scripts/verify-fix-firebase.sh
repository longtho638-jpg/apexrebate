#!/bin/bash
# 🧹 Verify và fix Firebase project config

echo "🔍 KIỂM TRA FIREBASE PROJECTS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# 1. List all projects
firebase projects:list

# 2. Check current
echo -e "\n✅ Current project:"
firebase use

# 3. Check workflow config
echo -e "\n📄 Workflow config hiện tại:"
grep -E "PROJECT_ID:|projectId:" .github/workflows/test-preview.yml

# 4. Analyze
echo -e "\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PHÂN TÍCH:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Đúng: apexrebate-prod (current)"
echo "❌ Sai: studio-2007559230-14fa6 (không tồn tại)"
echo "🗑️  Có thể xóa: apexrebate, apexrebate-os"

echo -e "\n❓ Fix workflow ngay? (y/n)"
read -p "> " choice

if [ "$choice" = "y" ]; then
    cp .github/workflows/test-preview.yml .github/workflows/test-preview.yml.backup
    sed -i '' 's/studio-2007559230-14fa6/apexrebate-prod/g' .github/workflows/test-preview.yml
    echo "✅ Đã update workflow"
    git diff .github/workflows/test-preview.yml
fi
