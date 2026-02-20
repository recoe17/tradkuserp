# Quick SSH Setup

## ✅ Already Done

- ✅ Git remote updated to use SSH: `git@github.com:recoe17/maxvolt.git`
- ✅ You have SSH keys ready

## Next Steps

### Step 1: View Your SSH Keys

Run this script:
```bash
./setup-ssh.sh
```

Or manually view:
```bash
cat ~/.ssh/id_ed25519.pub
# or
cat ~/.ssh/id_ed25519_github.pub
```

### Step 2: Add SSH Key to GitHub

1. **Copy your SSH public key** (from Step 1)
2. Go to: **https://github.com/settings/keys**
3. Make sure you're logged in as **recoe17**
4. Click **"New SSH key"**
5. Title: `MaxVolt Mac`
6. Key type: **Authentication Key**
7. **Paste your public key**
8. Click **"Add SSH key"**

### Step 3: Test Connection

```bash
ssh -T git@github.com
```

You should see: `Hi recoe17! You've successfully authenticated...`

### Step 4: Push (No Token Needed!)

```bash
cd /Users/reconcilemakamure/maxvolt
git push
```

Should work without any credentials! 🎉

## Benefits of SSH

✅ No more tokens needed
✅ More secure
✅ Faster authentication
✅ Works automatically

## Troubleshooting

**"Permission denied"**
- Key not added to GitHub yet
- Make sure you added it to the **recoe17** account

**"Could not resolve hostname"**
- Check internet connection
- Try: `ssh -T git@github.com -v`
