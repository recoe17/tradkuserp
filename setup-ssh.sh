#!/bin/bash

echo "🔐 SSH Setup for GitHub"
echo "======================"
echo ""

# Check for SSH keys
echo "Checking for SSH keys..."
if [ -f ~/.ssh/id_ed25519.pub ]; then
    echo "✅ Found: id_ed25519.pub"
    KEY1=$(cat ~/.ssh/id_ed25519.pub)
    echo ""
    echo "📋 Your SSH Public Key (id_ed25519.pub):"
    echo "----------------------------------------"
    echo "$KEY1"
    echo ""
fi

if [ -f ~/.ssh/id_ed25519_github.pub ]; then
    echo "✅ Found: id_ed25519_github.pub"
    KEY2=$(cat ~/.ssh/id_ed25519_github.pub)
    echo ""
    echo "📋 Your SSH Public Key (id_ed25519_github.pub):"
    echo "----------------------------------------"
    echo "$KEY2"
    echo ""
fi

echo "✅ Git remote updated to use SSH"
echo "   git@github.com:recoe17/maxvolt.git"
echo ""

echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Copy one of the SSH keys above"
echo ""
echo "2. Add it to GitHub:"
echo "   - Go to: https://github.com/settings/keys"
echo "   - Click 'New SSH key'"
echo "   - Title: 'MaxVolt Mac'"
echo "   - Paste the key"
echo "   - Click 'Add SSH key'"
echo ""
echo "3. Test the connection:"
echo "   ssh -T git@github.com"
echo ""
echo "4. Push your code:"
echo "   cd /Users/reconcilemakamure/maxvolt"
echo "   git push"
echo ""

read -p "Press Enter to test SSH connection now, or Ctrl+C to exit..."

echo ""
echo "Testing SSH connection..."
ssh -T git@github.com

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH is working! You can now push without tokens."
else
    echo ""
    echo "❌ SSH connection failed. Make sure:"
    echo "   - You added the SSH key to GitHub"
    echo "   - You're logged into GitHub as recoe17"
fi
