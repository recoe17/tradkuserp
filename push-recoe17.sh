#!/bin/bash

echo "🚀 Push to recoe17/maxvolt"
echo "=========================="
echo ""

# Clear any cached credentials
security delete-internet-password -s github.com 2>/dev/null

echo "✅ Remote configured: https://github.com/recoe17/maxvolt.git"
echo ""
echo "📋 Steps:"
echo "1. Make sure repository exists: https://github.com/recoe17/maxvolt"
echo "2. Get Personal Access Token from recoe17 account:"
echo "   https://github.com/settings/tokens"
echo ""
read -p "Press Enter when ready to push..."

echo ""
echo "Pushing to GitHub..."
echo ""
echo "When prompted:"
echo "  Username: recoe17"
echo "  Password: [PASTE YOUR TOKEN FROM recoe17 ACCOUNT]"
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "View at: https://github.com/recoe17/maxvolt"
else
    echo ""
    echo "❌ Push failed. Make sure:"
    echo "   - You're using recoe17 token (not BossRecoe17)"
    echo "   - Repository exists on GitHub under recoe17 account"
    echo "   - Token has 'repo' scope"
fi
