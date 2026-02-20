# Fix Authentication Error

## Error: "Invalid username or token"

This usually means:
1. Token is incorrect or expired
2. Username is wrong
3. Token doesn't have correct permissions

## Solution: Push with Token Directly

Instead of entering credentials when prompted, use the token directly in the command:

```bash
cd /Users/reconcilemakamure/maxvolt

# Replace YOUR_TOKEN with your actual token
git push https://recoe17:YOUR_TOKEN@github.com/recoe17/maxvolt.git main
```

## Verify Your Token

Make sure your token:
1. ✅ Has `repo` scope checked
2. ✅ Is from the **recoe17** account (not BossRecoe17)
3. ✅ Was copied completely (no spaces, all characters)
4. ✅ Is still valid (not expired)

## Create New Token (If Needed)

If token doesn't work:
1. Go to: https://github.com/settings/tokens
2. Make sure you're logged in as **recoe17**
3. Delete old token if needed
4. Create new token:
   - Name: `MaxVolt Project`
   - Scope: ✅ **repo** (check this!)
   - Generate
   - **COPY IMMEDIATELY**

## Alternative: Use SSH

If token keeps failing, switch to SSH:

```bash
# Change remote to SSH
git remote set-url origin git@github.com:recoe17/maxvolt.git

# Push (will use SSH key)
git push -u origin main
```

But you'll need to set up SSH keys first.

## Quick Test

Try this command (replace YOUR_TOKEN):

```bash
git push https://recoe17:YOUR_TOKEN@github.com/recoe17/maxvolt.git main
```

This bypasses credential caching issues.
