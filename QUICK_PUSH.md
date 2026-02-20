# Quick Push to GitHub

## Option 1: Use the Script (Easiest)

```bash
cd /Users/reconcilemakamure/maxvolt
./push-to-github.sh
```

The script will:
1. Ask for your GitHub username
2. Ask for repository name (default: maxvolt)
3. Set up the remote
4. Guide you through creating the repository
5. Push your code

## Option 2: Manual Steps

### Step 1: Create Repository on GitHub
1. Go to https://github.com/new
2. Repository name: `maxvolt`
3. **DO NOT** check "Initialize with README"
4. Click "Create repository"

### Step 2: Push (replace YOUR_USERNAME)

```bash
cd /Users/reconcilemakamure/maxvolt

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/maxvolt.git

# Push
git branch -M main
git push -u origin main
```

### Step 3: Authentication
- **Username**: Your GitHub username
- **Password**: Use a Personal Access Token (not your password)
  - Create at: https://github.com/settings/tokens
  - Select scope: `repo`

## Your Git Config
- Email: recomakamure@gmail.com ✅
- Name: recomakamure ✅

Everything is ready to push!
