# Fix GitHub Push Authentication

The push failed because GitHub requires authentication. Here are solutions:

## Solution 1: Use Personal Access Token (Recommended)

### Step 1: Create Personal Access Token
1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "MaxVolt Project"
4. Select scopes: ✅ **repo** (check the repo checkbox)
5. Click "Generate token"
6. **COPY THE TOKEN** (you won't see it again!)

### Step 2: Push with Token
```bash
cd /Users/reconcilemakamure/maxvolt

# When prompted:
# Username: YOUR_GITHUB_USERNAME
# Password: PASTE_YOUR_TOKEN_HERE (not your GitHub password!)
git push -u origin main
```

## Solution 2: Use SSH (Alternative)

### Step 1: Check if you have SSH key
```bash
ls -al ~/.ssh
```

### Step 2: If no SSH key, create one
```bash
ssh-keygen -t ed25519 -C "recomakamure@gmail.com"
# Press Enter to accept default location
# Press Enter for no passphrase (or set one)
```

### Step 3: Add SSH key to GitHub
```bash
# Copy your public key
cat ~/.ssh/id_ed25519.pub
# Copy the output
```

Then:
1. Go to https://github.com/settings/keys
2. Click "New SSH key"
3. Paste your key
4. Click "Add SSH key"

### Step 4: Change remote to SSH
```bash
cd /Users/reconcilemakamure/maxvolt
git remote set-url origin git@github.com:YOUR_USERNAME/maxvolt.git
git push -u origin main
```

## Solution 3: Use GitHub CLI (Easiest)

```bash
# Install GitHub CLI if not installed
brew install gh

# Authenticate
gh auth login

# Push
git push -u origin main
```

## Verify Repository Exists

Make sure you created the repository on GitHub:
1. Go to https://github.com/new
2. Repository name: `maxvolt`
3. **DO NOT** check "Initialize with README"
4. Click "Create repository"

## Quick Check

```bash
# Verify remote is set
git remote -v

# Should show:
# origin  https://github.com/YOUR_USERNAME/maxvolt.git (fetch)
# origin  https://github.com/YOUR_USERNAME/maxvolt.git (push)
```

## Most Common Issue

**Using password instead of token**: GitHub no longer accepts passwords. You MUST use a Personal Access Token.

Try Solution 1 first - it's the quickest!
