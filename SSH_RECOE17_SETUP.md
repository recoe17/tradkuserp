# SSH Setup for recoe17 Account

## ✅ New SSH Key Generated

A new SSH key has been created specifically for your **recoe17** account:
- Key file: `~/.ssh/id_ed25519_recoe17`
- Public key: [Shown below]

## Step 1: Copy Your New SSH Public Key

Your new SSH public key is:

```
[The key will be shown when you run the setup]
```

Or view it with:
```bash
cat ~/.ssh/id_ed25519_recoe17.pub
```

## Step 2: Add SSH Key to recoe17 GitHub Account

1. **Make sure you're logged into GitHub as recoe17** (not BossRecoe17)
2. Go to: **https://github.com/settings/keys**
3. Click **"New SSH key"**
4. Title: `MaxVolt Mac - recoe17`
5. Key type: **Authentication Key**
6. **Paste your new public key** (from Step 1)
7. Click **"Add SSH key"**

## Step 3: Test SSH Connection

```bash
ssh -T git@github.com-recoe17
```

You should see: `Hi recoe17! You've successfully authenticated...`

## Step 4: Git Remote Configured

✅ Your git remote is now configured to use the recoe17 SSH key:
- `git@github.com-recoe17:recoe17/maxvolt.git`

## Step 5: Test Push

```bash
cd /Users/reconcilemakamure/maxvolt
git push
```

Should authenticate as **recoe17** now!

## How It Works

The SSH config uses a special host alias `github.com-recoe17` that:
- Points to github.com
- Uses the recoe17-specific SSH key
- Keeps it separate from BossRecoe17 keys

## Troubleshooting

**Still authenticating as BossRecoe17?**
- Make sure you added the new key to the **recoe17** account
- Test: `ssh -T git@github.com-recoe17`
- Verify: `git remote -v` shows `github.com-recoe17`
