#!/bin/bash

# Media Matching MVP - Development Startup Script
# Starts both backend and frontend in separate terminal tabs (macOS)

echo "🚀 Starting Media Matching MVP..."
echo ""

# Check if we're on macOS
if [[ "$OSTYPE" != "darwin"* ]]; then
  echo "⚠️  This script is designed for macOS Terminal."
  echo "Please start services manually:"
  echo "  Terminal 1: cd api && yarn dev"
  echo "  Terminal 2: cd frontend && yarn start"
  exit 1
fi

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📂 Project root: $PROJECT_ROOT"
echo ""

# Check if .env exists
if [ ! -f "$PROJECT_ROOT/.env" ]; then
  echo "⚠️  Warning: .env file not found!"
  echo "Please create .env with required AWS and OpenAI credentials"
  echo ""
  read -p "Continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Check if node_modules exist
if [ ! -d "$PROJECT_ROOT/api/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd "$PROJECT_ROOT/api" && yarn install
fi

if [ ! -d "$PROJECT_ROOT/frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd "$PROJECT_ROOT/frontend" && yarn install
fi

echo ""
echo "🎯 Starting services in new tabs..."
echo ""

# Start backend in new tab
osascript <<EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$PROJECT_ROOT/api' && echo '🔧 Starting Backend API...' && yarn dev" in front window
end tell
EOF

# Wait a moment
sleep 1

# Start frontend in new tab
osascript <<EOF
tell application "Terminal"
    activate
    tell application "System Events" to keystroke "t" using {command down}
    delay 0.5
    do script "cd '$PROJECT_ROOT/frontend' && echo '🎨 Starting Frontend...' && yarn start" in front window
end tell
EOF

echo "✅ Services starting!"
echo ""
echo "📍 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:3001"
echo ""
echo "💡 Check the new Terminal tabs for service logs"
echo ""
echo "To stop services: Press Ctrl+C in each tab"
