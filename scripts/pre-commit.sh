#!/bin/bash

# Pre-commit hook for ApexRebate
echo "🔍 Running pre-commit checks..."

# Run linting
echo "📋 Running ESLint..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ ESLint failed. Please fix the issues before committing."
    exit 1
fi

# Run type checking
echo "🔍 Running TypeScript type checking..."
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo "❌ TypeScript type checking failed. Please fix the issues before committing."
    exit 1
fi

# Run unit tests
echo "🧪 Running unit tests..."
npm run test
if [ $? -ne 0 ]; then
    echo "❌ Unit tests failed. Please fix the issues before committing."
    exit 1
fi

echo "✅ All pre-commit checks passed!"
exit 0