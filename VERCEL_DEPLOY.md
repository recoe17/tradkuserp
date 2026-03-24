# Deploy Tradkuserp to Vercel

This app is a **full-stack Next.js** project (frontend + API routes + Prisma). Deploy the **client** folder to Vercel.

---

## Step 1: Deploy via Vercel Dashboard (Recommended)

1. Go to **[vercel.com](https://vercel.com)** and sign in (GitHub)
2. Click **Add New** → **Project**
3. Import **recoe17/tradkuserp**
4. **Root Directory**: Click "Edit" and set to `client`
5. Add **Environment Variables**:

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your Neon connection string (from `server/.env`) |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Your Clerk publishable key |
| `CLERK_SECRET_KEY` | Your Clerk secret key |

6. Click **Deploy**

---

## Step 2: Add Your Domain to Clerk

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. **Configure** → **Domains**
3. Add your Vercel URL (e.g. `https://tradkuserp.vercel.app`)

---

## Optional: Email & WhatsApp

Add these in Vercel env vars if you use them:

- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`

---

## Deploy via CLI

```powershell
cd c:\Users\Mufaro\Documents\tradkus
npx vercel
```

When prompted, set **Root Directory** to `client`, then add the env vars in the Vercel dashboard and redeploy.
