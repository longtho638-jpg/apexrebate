#!/bin/bash

# 🚀 Setup Vercel Environment Variables
# Script tự động add DATABASE_URL và SEED_SECRET_KEY vào Vercel production

set -e

echo "🔍 Loading environment variables from .env..."
source .env

if [ -z "$DATABASE_URL" ]; then
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

if [ -z "$SEED_SECRET_KEY" ]; then
  echo "❌ SEED_SECRET_KEY not found in .env"
  exit 1
fi

echo "✅ DATABASE_URL found (${#DATABASE_URL} characters)"
echo "✅ SEED_SECRET_KEY found (${#SEED_SECRET_KEY} characters)"

echo ""
echo "📦 Adding DATABASE_URL to Vercel production environment..."
echo -n "$DATABASE_URL" | vercel env add DATABASE_URL production

echo ""
echo "🔑 Adding SEED_SECRET_KEY to Vercel production environment..."
echo -n "$SEED_SECRET_KEY" | vercel env add SEED_SECRET_KEY production

echo ""
echo "✅ Environment variables added successfully!"
echo ""
echo "📋 Verifying Vercel environment variables..."
vercel env ls

echo ""
echo "🎉 Done! Now you can deploy to Vercel with:"
echo "   vercel --prod"
