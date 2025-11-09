#!/bin/bash
# 🤖 VS Code Agent Setup Script
# Run this after extracting ZIP

echo "🤖 Setting up JWKS + HMAC pipeline..."

cd functions
echo "📦 Installing dependencies..."
npm install

echo "🔥 Deploying to Firebase..."
firebase deploy --only functions:sign,functions:verify

echo "✅ Deployment complete!"
echo "🧪 Next: Import tests/apexrebate-jwks-auto.postman_collection.json"
echo "    and run collection to verify full pipeline."
