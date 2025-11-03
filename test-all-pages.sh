#!/bin/bash
echo "=== TESTING ALL CRITICAL PAGES ==="
echo ""

pages=(
  "https://apexrebate.com/"
  "https://apexrebate.com/vi"
  "https://apexrebate.com/en"
  "https://apexrebate.com/vi/dashboard"
  "https://apexrebate.com/en/dashboard"
  "https://apexrebate.com/vi/tools"
  "https://apexrebate.com/vi/apex-pro"
  "https://apexrebate.com/vi/hang-soi"
)

for page in "${pages[@]}"; do
  echo "Testing: $page"
  response=$(curl -s -H "Cache-Control: no-cache" "$page" 2>&1)
  
  if echo "$response" | grep -q "Application error"; then
    echo "  ❌ ERROR FOUND!"
  elif echo "$response" | grep -q "<!DOCTYPE html>"; then
    echo "  ✅ OK"
  else
    echo "  ⚠️  UNKNOWN RESPONSE"
  fi
  echo ""
done
