#!/bin/bash

echo "🚀 Starting server..."
echo "📁 Current directory: $(pwd)"

# Check if Chrome exists
CHROME_PATH=".cache/puppeteer/chrome/linux-*/chrome-linux64/chrome"
if ls $CHROME_PATH 1> /dev/null 2>&1; then
    echo "✅ Chrome found at: $(ls $CHROME_PATH)"
else
    echo "⚠️  Chrome not found in .cache directory"
    echo "📥 Installing Chrome..."
    npx puppeteer browsers install chrome
    
    if ls $CHROME_PATH 1> /dev/null 2>&1; then
        echo "✅ Chrome installed successfully at: $(ls $CHROME_PATH)"
    else
        echo "❌ Failed to install Chrome"
        exit 1
    fi
fi

# Start the server
echo "🌐 Starting Node.js server..."
node server.js
