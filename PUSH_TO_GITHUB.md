# Push to GitHub - Quick Guide

Your repository is ready! Follow these steps:

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `maxvolt` (or your preferred name)
3. Description: "Electrical company management system"
4. Choose **Public** or **Private**
5. **DO NOT** check "Initialize with README" (we already have files)
6. Click **"Create repository"**

## Step 2: Push to GitHub

After creating the repository, run these commands:

```bash
cd /Users/reconcilemakamure/maxvolt

# Add your GitHub repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/maxvolt.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Alternative: Using SSH

If you have SSH keys set up:

```bash
git remote add origin git@github.com:YOUR_USERNAME/maxvolt.git
git push -u origin main
```

## Authentication

If prompted for credentials:
- **Username**: Your GitHub username
- **Password**: Use a GitHub Personal Access Token (not your password)
  - Create one at: https://github.com/settings/tokens
  - Select scope: `repo`

## Verify

1. Go to https://github.com/YOUR_USERNAME/maxvolt
2. You should see all your files
3. Check that `.env` files are NOT visible (they're in .gitignore)

## Your Git Configuration

- **Email**: recomakamure@gmail.com
- **Name**: recomakamure

This is already configured in your local repository.
