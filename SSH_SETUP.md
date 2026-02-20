# SSH Setup for GitHub

## Step 1: Generate SSH Key (If Needed)

If you don't have an SSH key, generate one:

```bash
ssh-keygen -t ed25519 -C "recomakamure@gmail.com"
```

- Press Enter to accept default location: `~/.ssh/id_ed25519`
- Press Enter for no passphrase (or set one if you prefer)

## Step 2: Copy Your Public Key

```bash
cat ~/.ssh/id_ed25519.pub
```

**Copy the entire output** - it starts with `ssh-ed25519` and ends with your email.

## Step 3: Add SSH Key to GitHub

1. Go to: https://github.com/settings/keys
2. Click **"New SSH key"**
3. Title: `MaxVolt Mac` (or any name)
4. Key type: **Authentication Key**
5. Paste your public key in the "Key" field
6. Click **"Add SSH key"**

## Step 4: Test SSH Connection

```bash
ssh -T git@github.com
```

You should see: `Hi recoe17! You've successfully authenticated...`

## Step 5: Update Git Remote to Use SSH

```bash
cd /Users/reconcilemakamure/maxvolt
git remote set-url origin git@github.com:recoe17/maxvolt.git
```

## Step 6: Verify Remote

```bash
git remote -v
```

Should show:
```
origin  git@github.com:recoe17/maxvolt.git (fetch)
origin  git@github.com:recoe17/maxvolt.git (push)
```

## Step 7: Test Push

```bash
git push
```

Should work without asking for credentials!

## Troubleshooting

### "Permission denied (publickey)"
- Make sure you added the public key to GitHub
- Check: `ssh -T git@github.com`

### "Could not resolve hostname"
- Check your internet connection
- Try: `ssh -T git@github.com -v` for verbose output

### Key not found
- Make sure key is in `~/.ssh/id_ed25519.pub`
- Check: `ls -la ~/.ssh/`
