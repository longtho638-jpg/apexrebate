#!/bin/bash
# Fix all Prisma model names from singular to plural

echo "🔧 Fixing Prisma model names..."

# Find and replace in src/ directory
find src -type f -name "*.ts" -o -name "*.tsx" | while read file; do
  if grep -q "db\.tool\." "$file" 2>/dev/null; then
    sed -i.bak 's/db\.tool\./db.tools./g' "$file"
    echo "  ✅ Fixed: $file"
  fi
  if grep -q "db\.user\." "$file" 2>/dev/null; then
    sed -i.bak 's/db\.user\./db.users./g' "$file"
    echo "  ✅ Fixed: $file"
  fi
  if grep -q "prisma\.tool\." "$file" 2>/dev/null; then
    sed -i.bak 's/prisma\.tool\./prisma.tools./g' "$file"
    echo "  ✅ Fixed: $file"
  fi
  if grep -q "prisma\.user\." "$file" 2>/dev/null; then
    sed -i.bak 's/prisma\.user\./prisma.users./g' "$file"
    echo "  ✅ Fixed: $file"
  fi
done

# Clean up backup files
find src -name "*.bak" -delete

echo "✅ Done! All Prisma model names fixed."
