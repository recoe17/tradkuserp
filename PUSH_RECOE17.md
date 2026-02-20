# Push to recoe17 Account

## Fixed Remote
✅ Remote updated to: `https://github.com/recoe17/maxvolt.git`

## Clear Cached Credentials

The system is currently using `BossRecoe17` credentials. To switch to `recoe17`:

### Option 1: Clear macOS Keychain (Recommended)
```bash
# Remove GitHub credentials from Keychain
security delete-internet-password -s github.com 2>/dev/null
```

### Option 2: Use Fresh Credentials
When you push, git will ask for credentials. Use:
- **Username**: `recoe17`
- **Password**: Your Personal Access Token (not password!)

## Steps to Push

### Step 1: Create Repository
1. Go to https://github.com/new
2. Make sure you're logged in as **recoe17** (not BossRecoe17)
3. Repository name: `maxvolt`
4. **DO NOT** check "Initialize with README"
5. Click "Create repository"

### Step 2: Get Personal Access Token for recoe17
1. Make sure you're logged into GitHub as **recoe17**
2. Go to: https://github.com/settings/tokens
3. Click "Generate new token" → "Generate new token (classic)"
4. Name: `MaxVolt Project`
5. Select scope: ✅ **repo**
6. Generate and **COPY THE TOKEN**

### Step 3: Push
```bash
cd /Users/reconcilemakamure/maxvolt
git push -u origin main
```

When prompted:
- **Username**: `recoe17`
- **Password**: **PASTE YOUR TOKEN** (from recoe17 account)

## If Still Using Wrong Account

If it still tries to use BossRecoe17, manually specify credentials:

```bash
git push -u origin main
# When asked for username: recoe17
# When asked for password: [your recoe17 token]
```

Or use the token directly in the URL (one-time):
```bash
git push https://recoe17:YOUR_TOKEN@github.com/recoe17/maxvolt.git main
```

## Your Repository
After successful push: https://github.com/recoe17/maxvolt
