#!/bin/bash

# Build and upload to production
# Usage: ./scripts/deploy.sh

echo "🔨 Building..."
npm run build

echo ""
echo "📦 Build complete! Files in dist/:"
ls -lh dist/

echo ""
echo "📤 Ready to upload to https://michaelfwells.com/printvault/"
echo ""
echo "Upload options:"
echo "1. Use Cyberduck: File → Synchronize → dist/ → /printvault/"
echo "2. Use FTP client of choice"
echo "3. Or run: duck --synchronize ftp://your-server/printvault/ dist/"
echo ""
echo "✅ After upload, hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)"

