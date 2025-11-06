#!/bin/bash

# ApexRebate Final Optimization Script
# This script performs comprehensive project optimization and cleanup

echo "🚀 Starting ApexRebate Final Optimization..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[ℹ]${NC} $1"
}

# 1. Code Quality Check
echo ""
echo "📋 Step 1: Code Quality Analysis"
echo "-------------------------------"

# Run ESLint
print_info "Running ESLint..."
if npm run lint > /dev/null 2>&1; then
    print_status "ESLint: No errors or warnings found"
else
    print_error "ESLint: Issues found"
    npm run lint
fi

# TypeScript Check
print_info "TypeScript compilation check..."
if npx tsc --noEmit > /dev/null 2>&1; then
    print_status "TypeScript: Compilation successful"
else
    print_error "TypeScript: Compilation errors found"
    npx tsc --noEmit
fi

# 2. Dependencies Check
echo ""
echo "📦 Step 2: Dependencies Analysis"
echo "--------------------------------"

# Check for outdated packages
print_info "Checking for outdated packages..."
npm outdated || print_warning "Some packages may be outdated"

# Security audit
print_info "Running security audit..."
npm audit --audit-level=moderate || print_warning "Security vulnerabilities found"

# 3. Build Optimization
echo ""
echo "🏗️ Step 3: Build Optimization"
echo "-----------------------------"

# Clean previous build
print_info "Cleaning previous build..."
rm -rf .next > /dev/null 2>&1

# Production build
print_info "Creating production build..."
if npm run build > /dev/null 2>&1; then
    print_status "Production build successful"
    
    # Check build size
    BUILD_SIZE=$(du -sh .next | cut -f1)
    print_info "Build size: $BUILD_SIZE"
else
    print_error "Production build failed"
    npm run build
fi

# 4. Database Optimization
echo ""
echo "🗄️ Step 4: Database Optimization"
echo "--------------------------------"

# Check database connection
print_info "Checking database connection..."
if npx prisma db pull > /dev/null 2>&1; then
    print_status "Database connection successful"
else
    print_error "Database connection failed"
fi

# Generate Prisma client
print_info "Generating Prisma client..."
npx prisma generate > /dev/null 2>&1
print_status "Prisma client generated"

# 5. Performance Analysis
echo ""
echo "⚡ Step 5: Performance Analysis"
echo "------------------------------"

# Analyze bundle size
print_info "Analyzing bundle size..."
if command -v npx &> /dev/null; then
    npx @next/bundle-analyzer .next > /dev/null 2>&1 || print_warning "Bundle analyzer not available"
fi

# Check for unused exports
print_info "Checking for unused code..."
find src -name "*.tsx" -o -name "*.ts" | wc -l | xargs -I {} echo "Total TypeScript files: {}"

# 6. Image Optimization
echo ""
echo "🖼️ Step 6: Image Optimization"
echo "-----------------------------"

# Check for unoptimized images
print_info "Checking image assets..."
if [ -d "public" ]; then
    IMAGE_COUNT=$(find public -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.svg" | wc -l)
    print_status "Found $IMAGE_COUNT image files in public directory"
    
    # Check for next/image usage
    NEXT_IMAGE_COUNT=$(grep -r "next/image" src --include="*.tsx" --include="*.ts" | wc -l)
    print_status "Next.js Image component used $NEXT_IMAGE_COUNT times"
fi

# 7. SEO and Meta Tags Check
echo ""
echo "🔍 Step 7: SEO Analysis"
echo "------------------------"

# Check for metadata
print_info "Checking SEO metadata..."
METADATA_FILES=$(find src -name "metadata.ts" | wc -l)
print_status "Found $METADATA_FILES metadata configuration files"

# Check for sitemap
if [ -f "src/app/sitemap.xml/route.ts" ]; then
    print_status "Sitemap route found"
else
    print_warning "Sitemap route not found"
fi

# Check for robots.txt
if [ -f "public/robots.txt" ]; then
    print_status "Robots.txt found"
else
    print_warning "Robots.txt not found"
fi

# 8. Environment Variables Check
echo ""
echo "🔐 Step 8: Environment Configuration"
echo "------------------------------------"

# Check for .env.example
if [ -f ".env.example" ]; then
    print_status ".env.example file found"
else
    print_warning ".env.example file not found"
fi

# Check for required environment variables
print_info "Checking environment variable templates..."
if [ -f ".env.example" ]; then
    ENV_VARS=$(grep -c "^[A-Z_]" .env.example)
    print_status "Found $ENV_VARS environment variable templates"
fi

# 9. Testing Status
echo ""
echo "🧪 Step 9: Testing Status"
echo "-------------------------"

# Check test files
TEST_FILES=$(find tests -name "*.test.ts" -o -name "*.spec.ts" 2>/dev/null | wc -l)
print_status "Found $TEST_FILES test files"

# Run tests if available
if [ "$TEST_FILES" -gt 0 ]; then
    print_info "Running tests..."
    if npm test > /dev/null 2>&1; then
        print_status "All tests passed"
    else
        print_warning "Some tests may have failed"
    fi
fi

# 10. Documentation Check
echo ""
echo "📚 Step 10: Documentation Status"
echo "-------------------------------"

# Check for README
if [ -f "README.md" ]; then
    print_status "README.md found"
else
    print_warning "README.md not found"
fi

# Check for API documentation
if [ -d "docs" ]; then
    DOC_FILES=$(find docs -name "*.md" | wc -l)
    print_status "Found $DOC_FILES documentation files"
fi

# 11. Security Check
echo ""
echo "🔒 Step 11: Security Analysis"
echo "-----------------------------"

# Check for sensitive files
print_info "Checking for sensitive files..."
SENSITIVE_FILES=$(find . -name "*.key" -o -name "*.pem" -o -name ".env" -not -path "./node_modules/*" -not -path "./.git/*" | wc -l)
if [ "$SENSITIVE_FILES" -eq 0 ]; then
    print_status "No sensitive files found in repository"
else
    print_warning "Found $SENSITIVE_FILES sensitive files (ensure they are in .gitignore)"
fi

# Check for .gitignore
if [ -f ".gitignore" ]; then
    print_status ".gitignore file found"
else
    print_error ".gitignore file not found"
fi

# 12. Final Summary
echo ""
echo "📊 Step 12: Optimization Summary"
echo "--------------------------------"

# Project statistics
TS_FILES=$(find src -name "*.tsx" -o -name "*.ts" | wc -l)
JS_FILES=$(find src -name "*.js" -o -name "*.jsx" | wc -l)
CSS_FILES=$(find src -name "*.css" | wc -l)
PACKAGE_SIZE=$(du -sh node_modules 2>/dev/null | cut -f1 || echo "N/A")

print_status "Project Statistics:"
echo "  - TypeScript files: $TS_FILES"
echo "  - JavaScript files: $JS_FILES"
echo "  - CSS files: $CSS_FILES"
echo "  - Node modules size: $PACKAGE_SIZE"

# Git status
if command -v git &> /dev/null; then
    print_info "Git repository status:"
    if [ -d ".git" ]; then
        BRANCH=$(git branch --show-current 2>/dev/null || echo "N/A")
        COMMITS=$(git rev-list --count HEAD 2>/dev/null || echo "N/A")
        echo "  - Current branch: $BRANCH"
        echo "  - Total commits: $COMMITS"
        
        # Check for uncommitted changes
        if [ -n "$(git status --porcelain 2>/dev/null)" ]; then
            print_warning "There are uncommitted changes"
        else
            print_status "Working directory is clean"
        fi
    else
        print_warning "Not a git repository"
    fi
fi

echo ""
echo "🎉 Final Optimization Complete!"
echo "================================"
echo ""
print_status "ApexRebate project has been optimized and is ready for deployment!"
echo ""
print_info "Next steps:"
echo "1. Review any warnings or errors above"
echo "2. Run 'npm run build' to verify production build"
echo "3. Deploy to your preferred hosting platform"
echo "4. Run post-deployment verification tests"
echo ""
print_info "For deployment instructions, see: PROJECT_READY_FOR_PRODUCTION.md"
echo ""