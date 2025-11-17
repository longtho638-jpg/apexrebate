#!/bin/bash

# Qwen Code Quick Start for ApexRebate
# Usage: bash scripts/qwen-quick-start.sh [command]

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_header() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}🤖 Qwen Code Quick Start${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
  echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

# Check if Qwen is installed
check_qwen() {
  if command -v qwen &> /dev/null; then
    local version=$(qwen --version 2>/dev/null || echo "unknown")
    print_success "Qwen Code is installed (version: $version)"
    return 0
  else
    print_error "Qwen Code is not installed"
    print_info "Installing Qwen Code globally..."
    npm install -g @qwen-code/qwen-code@latest
    return $?
  fi
}

# Authenticate Qwen
setup_auth() {
  print_header
  echo ""
  print_info "Setting up Qwen authentication..."
  echo ""
  echo "Select authentication method:"
  echo "1) Qwen OAuth (Recommended - 2,000 free requests/day)"
  echo "2) API Key (OpenAI compatible)"
  echo "3) Skip (use existing auth)"
  echo ""
  read -p "Enter choice (1-3): " choice

  case $choice in
    1)
      print_info "Starting Qwen OAuth flow..."
      qwen --auth oauth
      print_success "Qwen OAuth setup complete!"
      ;;
    2)
      print_info "Starting API Key setup..."
      qwen --auth api-key
      print_success "API Key setup complete!"
      ;;
    3)
      print_info "Skipping authentication setup"
      ;;
    *)
      print_error "Invalid choice"
      return 1
      ;;
  esac
}

# Test Qwen
test_qwen() {
  print_header
  echo ""
  print_info "Testing Qwen Code..."
  echo ""
  
  # Quick test
  if qwen "What is the main architecture of ApexRebate?" 2>/dev/null | head -20; then
    print_success "Qwen Code is working correctly!"
  else
    print_warning "Qwen Code test completed (may need authentication)"
  fi
}

# Generate tests
generate_tests() {
  local file=$1
  print_header
  echo ""
  
  if [ -z "$file" ]; then
    print_info "Generating tests for modified files..."
    npm run qwen:test
  else
    print_info "Generating tests for: $file"
    qwen "Generate comprehensive unit tests for $file. Use Jest + testing-library. Include edge cases and error scenarios."
  fi
}

# Refactor code
refactor_code() {
  local file=$1
  print_header
  echo ""
  
  if [ -z "$file" ]; then
    print_info "Refactoring modified code..."
    npm run qwen:refactor
  else
    print_info "Refactoring: $file"
    qwen "Refactor $file for performance and readability. Extract reusable components. Optimize TypeScript types."
  fi
}

# Generate docs
generate_docs() {
  local file=$1
  print_header
  echo ""
  
  if [ -z "$file" ]; then
    print_info "Generating documentation for entire codebase..."
    npm run qwen:docs
  else
    print_info "Generating documentation for: $file"
    qwen "Generate JSDoc documentation for $file. Include @param, @returns, and @example tags."
  fi
}

# Analyze code
analyze_code() {
  print_header
  echo ""
  print_info "Analyzing code for quality and security issues..."
  npm run qwen:analyze
}

# Fix issues
fix_issues() {
  print_header
  echo ""
  print_info "Fixing linting errors and test failures..."
  npm run qwen:ci:fix
}

# Explain architecture
explain_architecture() {
  print_header
  echo ""
  print_info "Explaining ApexRebate architecture..."
  npm run qwen:explain
}

# Interactive menu
show_menu() {
  echo ""
  echo "Available commands:"
  echo "1) Setup (install & authenticate)"
  echo "2) Test Qwen"
  echo "3) Generate tests for modified files"
  echo "4) Refactor code"
  echo "5) Generate documentation"
  echo "6) Analyze code"
  echo "7) Fix issues"
  echo "8) Explain architecture"
  echo "9) Run all tasks"
  echo "0) Exit"
  echo ""
  read -p "Enter command (0-9): " cmd

  case $cmd in
    1) check_qwen && setup_auth ;;
    2) test_qwen ;;
    3) generate_tests ;;
    4) refactor_code ;;
    5) generate_docs ;;
    6) analyze_code ;;
    7) fix_issues ;;
    8) explain_architecture ;;
    9)
      print_header
      check_qwen
      echo ""
      test_qwen
      echo ""
      generate_tests
      echo ""
      refactor_code
      echo ""
      generate_docs
      ;;
    0)
      print_info "Exiting..."
      exit 0
      ;;
    *)
      print_error "Invalid command"
      show_menu
      ;;
  esac
}

# Main
main() {
  if [ $# -eq 0 ]; then
    # Interactive mode
    print_header
    check_qwen
    show_menu
  else
    # Command mode
    case "$1" in
      setup)
        check_qwen && setup_auth
        ;;
      test)
        test_qwen
        ;;
      tests)
        generate_tests "$2"
        ;;
      refactor)
        refactor_code "$2"
        ;;
      docs)
        generate_docs "$2"
        ;;
      analyze)
        analyze_code
        ;;
      fix)
        fix_issues
        ;;
      explain)
        explain_architecture
        ;;
      all)
        check_qwen
        test_qwen
        generate_tests
        refactor_code
        generate_docs
        ;;
      help|--help|-h)
        echo "Usage: bash scripts/qwen-quick-start.sh [command] [file]"
        echo ""
        echo "Commands:"
        echo "  setup           - Install and authenticate Qwen"
        echo "  test            - Test Qwen installation"
        echo "  tests [file]    - Generate tests"
        echo "  refactor [file] - Refactor code"
        echo "  docs [file]     - Generate documentation"
        echo "  analyze         - Analyze code for issues"
        echo "  fix             - Fix issues"
        echo "  explain         - Explain architecture"
        echo "  all             - Run all tasks"
        echo "  help            - Show this help"
        echo ""
        echo "Examples:"
        echo "  bash scripts/qwen-quick-start.sh setup"
        echo "  bash scripts/qwen-quick-start.sh tests src/lib/auth.ts"
        echo "  bash scripts/qwen-quick-start.sh refactor src/app/dashboard"
        echo "  bash scripts/qwen-quick-start.sh analyze"
        ;;
      *)
        print_error "Unknown command: $1"
        exit 1
        ;;
    esac
  fi
}

main "$@"
