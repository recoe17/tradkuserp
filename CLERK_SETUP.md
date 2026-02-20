# Clerk Authentication Setup (Optional)

The system currently uses JWT authentication. If you want to use Clerk instead, follow these steps:

## Why Clerk?

- Pre-built authentication UI
- Social login (Google, GitHub, etc.)
- User management dashboard
- Better security features
- Email verification
- Password reset flows

## Setup Steps

### 1. Create Clerk Account

1. Go to https://clerk.com
2. Sign up for a free account
3. Create a new application
4. Copy your API keys from the dashboard

### 2. Install Clerk Dependencies

```bash
cd client
npm install @clerk/nextjs
```

### 3. Configure Clerk

Add to `client/.env.local`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

### 4. Integration Required

If you want Clerk integration, I can:
- Replace JWT auth with Clerk
- Update all authentication routes
- Update frontend to use Clerk components
- Sync Clerk users with your database

**Would you like me to integrate Clerk, or keep the current JWT system?**

The current JWT system works fine for most use cases. Clerk is better if you need:
- Social logins
- Pre-built UI components
- Advanced user management
- Multi-factor authentication
