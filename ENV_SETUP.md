# Environment Variables Setup

## Client (.env.local)

Create or update `client/.env.local` with:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c291Z2h0LW1hc3RpZmYtMzAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_Gl48SKqaJLaRZvYgyMsGkYmAlujZqodqb2oW08zDdQ

NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Optional: Customize URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Server (.env)

Add to your existing `server/.env` file:

```env
CLERK_SECRET_KEY=sk_test_Gl48SKqaJLaRZvYgyMsGkYmAlujZqodqb2oW08zDdQ
```

**Quick Setup Commands:**

```bash
# Create client .env.local
cd client
cat > .env.local << 'EOF'
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_c291Z2h0LW1hc3RpZmYtMzAuY2xlcmsuYWNjb3VudHMuZGV2JA
CLERK_SECRET_KEY=sk_test_Gl48SKqaJLaRZvYgyMsGkYmAlujZqodqb2oW08zDdQ
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
EOF

# Add to server .env
cd ../server
echo "" >> .env
echo "CLERK_SECRET_KEY=sk_test_Gl48SKqaJLaRZvYgyMsGkYmAlujZqodqb2oW08zDdQ" >> .env
```
