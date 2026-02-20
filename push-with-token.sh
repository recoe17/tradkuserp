#!/bin/bash

echo "🔐 GitHub Push with Personal Access Token"
echo "=========================================="
echo ""
echo "Your repository: https://github.com/recoe17/maxvolt.git"
echo ""
echo "To push, you need a Personal Access Token:"
echo ""
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token' → 'Generate new token (classic)'"
echo "3. Name it: 'MaxVolt Project'"
echo "4. Select scope: ✅ repo (check the repo checkbox)"
echo "5. Click 'Generate token'"
echo "6. COPY THE TOKEN (you won't see it again!)"
echo ""
read -p "Press Enter when you have your token ready..."

echo ""
echo "Now push with your token:"
echo ""
echo "When prompted:"
echo "  Username: recoe17"
echo "  Password: [PASTE YOUR TOKEN HERE - NOT YOUR PASSWORD]"
echo ""
read -p "Press Enter to push now, or Ctrl+C to cancel..."

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "View your repository at: https://github.com/recoe17/maxvolt"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   - You used the TOKEN (not your password)"
    echo "   - Token has 'repo' scope"
    echo "   - Repository exists on GitHub"
fi
