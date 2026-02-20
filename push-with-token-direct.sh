#!/bin/bash

echo "🚀 Push with Token (Direct Method)"
echo "==================================="
echo ""
echo "This method bypasses credential caching issues."
echo ""
read -p "Enter your Personal Access Token: " TOKEN

if [ -z "$TOKEN" ]; then
    echo "❌ Token is required!"
    exit 1
fi

echo ""
echo "Pushing to GitHub..."
echo ""

git push https://recoe17:$TOKEN@github.com/recoe17/maxvolt.git main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "View your repository at: https://github.com/recoe17/maxvolt"
    echo ""
    echo "⚠️  Note: Token was used in command. For security, consider:"
    echo "   1. Regenerating the token after push"
    echo "   2. Using SSH keys for future pushes"
else
    echo ""
    echo "❌ Push failed. Check:"
    echo "   - Token is correct and has 'repo' scope"
    echo "   - Repository exists: https://github.com/recoe17/maxvolt"
    echo "   - You're logged into GitHub as recoe17"
fi
