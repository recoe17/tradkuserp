# GitHub Setup Instructions

## Step 1: Create Repository on GitHub

1. Go to https://github.com/new
2. Repository name: `maxvolt` (or any name you prefer)
3. Description: "Electrical company management system - Jobs, Quotations, Invoices, and Finances"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/reconcilemakamure/maxvolt

# Add your GitHub repository as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/maxvolt.git

# Or if you prefer SSH:
# git remote add origin git@github.com:YOUR_USERNAME/maxvolt.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Verify

1. Go to your GitHub repository
2. You should see all your files there
3. Make sure `.env` files are NOT visible (they should be in .gitignore)

## Important Notes

✅ **Protected Files** (already in .gitignore):
- All `.env` files
- `node_modules/`
- Database files
- Build artifacts

✅ **What's Included**:
- All source code
- Configuration files
- Documentation
- Package.json files

## Future Updates

To push future changes:

```bash
git add .
git commit -m "Your commit message"
git push
```

## Troubleshooting

### If you get authentication errors:
- Use GitHub Personal Access Token instead of password
- Or set up SSH keys: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

### If repository already exists:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/maxvolt.git
git push -u origin main
```
