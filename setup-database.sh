#!/bin/bash

echo "🚀 MaxVolt Database Setup"
echo "========================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed."
    echo "Install it with: brew install postgresql@15"
    echo "Or download from: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL is installed"
echo ""

# Get current username
USERNAME=$(whoami)
echo "Detected username: $USERNAME"
echo ""

# Ask for database password (optional)
read -p "Do you have a PostgreSQL password? (y/n): " has_password

if [ "$has_password" = "y" ]; then
    read -sp "Enter PostgreSQL password: " DB_PASSWORD
    echo ""
    DATABASE_URL="postgresql://$USERNAME:$DB_PASSWORD@localhost:5432/maxvolt?schema=public"
else
    DATABASE_URL="postgresql://$USERNAME@localhost:5432/maxvolt?schema=public"
fi

echo ""
echo "Creating database..."

# Create database
psql postgres -c "CREATE DATABASE maxvolt;" 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Database 'maxvolt' created successfully"
else
    echo "⚠️  Database might already exist (this is okay)"
fi

echo ""
echo "Creating .env file..."

# Create .env file
cat > server/.env << EOF
# Database
DATABASE_URL="$DATABASE_URL"

# JWT Authentication
JWT_SECRET="$(openssl rand -hex 32)"
JWT_EXPIRES_IN="7d"

# Email Configuration (optional)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER=""
EMAIL_PASS=""
EMAIL_FROM="MaxVolt <your-email@gmail.com>"

# WhatsApp Configuration (optional)
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_WHATSAPP_NUMBER="whatsapp:+14155238886"

# Server
PORT=5000
NODE_ENV="development"

# Company Info
COMPANY_NAME="MaxVolt Electrical"
COMPANY_ADDRESS="123 Main Street, City, Country"
COMPANY_PHONE="+1234567890"
COMPANY_EMAIL="info@maxvolt.com"
EOF

echo "✅ .env file created in server/.env"
echo ""

echo "Running Prisma migrations..."
cd server

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate -- --name init

echo ""
echo "✅ Database setup complete!"
echo ""
echo "Next steps:"
echo "1. Review server/.env and update company info if needed"
echo "2. Start the server: cd server && npm run dev"
echo "3. Start the client: cd client && npm run dev"
