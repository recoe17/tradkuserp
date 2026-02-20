#!/bin/bash

echo "🚀 MaxVolt - Push to GitHub"
echo "============================"
echo ""

# Get GitHub username
read -p "Enter your GitHub username: " GITHUB_USERNAME

if [ -z "$GITHUB_USERNAME" ]; then
    echo "❌ GitHub username is required!"
    exit 1
fi

# Repository name
read -p "Enter repository name (default: maxvolt): " REPO_NAME
REPO_NAME=${REPO_NAME:-maxvolt}

echo ""
echo "Setting up remote..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git 2>/dev/null || git remote set-url origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo "✅ Remote configured: https://github.com/$GITHUB_USERNAME/$REPO_NAME.git"
echo ""

# Ensure we're on main branch
git branch -M main

echo "Ready to push!"
echo ""
echo "Next steps:"
echo "1. Make sure you've created the repository on GitHub: https://github.com/new"
echo "2. Repository name should be: $REPO_NAME"
echo "3. DO NOT initialize with README"
echo ""
read -p "Press Enter when repository is created, or Ctrl+C to cancel..."

echo ""
echo "Pushing to GitHub..."
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "View your repository at: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   - Repository not created on GitHub"
    echo "   - Authentication required (use Personal Access Token)"
    echo "   - Check your GitHub credentials"
fi
