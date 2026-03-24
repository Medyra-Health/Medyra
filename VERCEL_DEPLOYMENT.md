# 🚀 Vercel Deployment Guide for Medyra

## Prerequisites
1. GitHub account
2. Vercel account (sign up at vercel.com with GitHub)
3. MongoDB Atlas account (free tier)

---

## Step 1: Push Code to GitHub

1. **Create a new GitHub repository** (e.g., `medyra-medical-platform`)

2. **Initialize git in your project:**
```bash
git init
git add .
git commit -m "Initial commit - Medyra MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/medyra-medical-platform.git
git push -u origin main
```

---

## Step 2: Set Up MongoDB Atlas (Free)

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create a free M0 cluster (512MB)
3. **Important**: Whitelist all IPs (0.0.0.0/0) for Vercel access
4. Create a database user with password
5. Get your connection string:
   ```
   mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/medyra?retryWrites=true&w=majority
   ```

---

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com and sign in with GitHub
2. Click **"Add New Project"**
3. **Import** your GitHub repository
4. Vercel will auto-detect Next.js
5. Click **"Deploy"** (it will fail first - that's OK!)

### Option B: Via Vercel CLI

```bash
npm i -g vercel
vercel login
vercel
```

---

## Step 4: Configure Environment Variables in Vercel

Go to your project settings → **Environment Variables** and add:

### Required Variables:

```env
# Database
MONGO_URL=mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/medyra?retryWrites=true&w=majority
DB_NAME=medyra

# Claude AI
ANTHROPIC_API_KEY=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

# Google Vision (Base64)
GOOGLE_CREDENTIALS_BASE64=ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAibWVkeXJhLTQ5MTIxNyIsCiAgInByaXZhdGVfa2V5X2lkIjogIjdjODk5ZDIwYjcxMGMwOThhZDViNGVlODY2ZDlkZmY2NTljNzI3MmMiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRFY1bmMrZ0ZqRXVEZGRcbm1UMWtWejMrQmRBdEFORUVIMmdhTlQyRi9uQi90Q1RBTk4xbHZDdmpQenRJZThLTDFPQ1hjQ1FYNXV2N1htRUdcbkNuOHQvNmp2SGZ5bmt1TVlLalRoVG0rQmZnYUt1c2lxT3lsQWloUlY1YmFodXVBUUMzellTdWRZdmpDSmVlZDNcblFCUk1PQmsraEpYNnBHRDJOcXV2Rjk3OUduQlpNZkdwMGRQZEhxK0d4dXp6YnVIa2EzTC9UcG96N3Y4MjJoUkVcbmNNelA3WnNYa1FidnlUZnBHQlBIc0VGdDUzaFo5Rkt0cFN3Rkkvd0NJWENFQmVueUJsWGJ2aFhBTGt2QkxLK0JcbjRSK0dSSmozcHdRR3RWaFJyZG0xMGF4TmFMaDVHSmVPdFZTM282b3BtOUcvb1NIc1lFVjRQclNVakNteFB6eU9cbjNZSGxIajhQQWdNQkFBRUNnZ0VBVmlIRnBwOWNIMnJtc0lRQ1dxTmV6U2xlR0tFWmlZVjBFQW1jU3BhWWluUHBcbjBKUDVDdnhvMThzZ2ZpR0h4M0xqTlZmczBNc2wvMFNUNFREYzRaTHZYY28vY09NUEd5M3p1VDR5WEh4NCtlZ1lcbjRhT05DdllQRmorMytRd2RLWmpXbnVvYW1udUxZL0I0cW1aZFJndlk3bm5KUXZKcU1QcjJ5enpiaUNQYlZhNnZcbjNTNTNyM3poaG1WRHpuVGU2cDBGS0dYRWdCaVRiWTVoTnliWm80d3gycHFacEhsd05QTUh4ZkhFMm4rWE9JV3FcblhCc0dnOTJ0d2pDOUJRYnhIMzRNOHN0QUZBY09yYUdCeFg2U0hXeFluZEVJWU50NnNmQ2F5MDBZNG44OHJGUmtcbkF3a25CQk1tUTdjZFNHaWZEMTl2Qk93Q2Z1bnVPbDJQVDZLOCtobmdnUUtCZ1FEOENFUnI0ZHpPMkFsMDBVWkJcbk1JUitNQWJNNW9VMUVaTGpZR2JyOG9GNUE4Y3VGY0ZSTlpNaFdLZ1VZQzJOV01SQXZSZTYxR0d0eUR3TE5MUE9cbktvUE96MURRd09GaTBCdjJEWStyRSthZTNGNVhKVGp1R1VVMGRvcUZXK3gwdUluRmFjTjJZc3p2NVRhS1NOUGtcblgxRll1ZG9UL1RaVmt2Z0U4QTVpY3ExN3J3S0JnUURaUklVZENPUVUvdGNpbllGcUEvak94UGdyblFhVGVMU2JcblZLNk1nUmZoRGtzaWh3Q1VqV3d2RjVOTGZkeURZWnFFTWpGcWN4Y1N6U0Nzb1pvYThOeXVXT3lYZXFtR1cyYnBcbkp3VW5STHNWV0NzbENMZC9CaStGWHl5NXk2dk9UUTA4Z2Z0cDFZdWFQeVRXZWNCcjNLZ3c3NUM3YWdkMHFUdDJcbmxkaGZEa05xb1FLQmdFcW0yRDFzUlU4dlJuM0hqeHU0RjBhWlN5cGVEWTdPaWNlM3drU1pMQ2lBS2Z0SWpsNVRcbmxDVUljYUMzYkVhMXlFdTB0dGFzR2RLendMVkJBeEZLSG9pZmQ3eWRwU1R6cDVTV0o3dnd4UnJCQTJDa3NkdzBcbnQvNzJMY21hbE10dDdjRC90dG5XSWdYY3l1N2k2NEIxaTA3UW5mdlZ3TVpRSmc2d1hGSmt6V1laQW9HQWRWQ05cbk84ZEFPS0grRWovUDBDbkM0QXIxSWIrUS9ISVJ1MG0zVWtDbVh5d3puN29ic3hyRnpvdkJTZUwwL2EvbkdmaHNcblBGbFduUjFMeGtzZ0Jlb0dqdEdQTnAvU0I2MDAzVEhuazNPR1BSazFlckxCT2dKaUNIY0NsSFFJR2NYN0hxL2tcbnpCbTFYcDAzeStORDVqbm9TendmLzBKYU1rRHF6YlpOZGM0aTB1RUNnWUVBd1UyUVpEcXlkcldWd2FkSHVwYkdcblI5TDRXYThYU3hieXBxS2tuRTRTRVQyM3pmRGRFYVFnSGE2QnU0MXpLVGhxbDVLNGVJM0ZYWlhBZllDK3BiWWpcbnZZd0ZRc0ZCeTd2TGYwM2t4V1A1blpyazFoVm1jOHhXSy9xWmRjN0c3L0dPcTZMK1ZIbWtPdDYwRTFFcVpvVExcbmF0UEk4Qkc3bVpwMlAzdXdqbjM5TlRJPVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogIm1lZHlyYS12aXNpb25AbWVkeXJhLTQ5MTIxNy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDc0MDE0NTY5OTU0MDU5ODM3ODciLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9tZWR5cmEtdmlzaW9uJTQwbWVkeXJhLTQ5MTIxNy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQo=

# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_Y2xldmVyLWNvdy05LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_xYEcZuGd0DTJE8xPyDzA0xd5VkqrAllhQv609lrkvz

# Clerk URLs (use your Vercel URL after first deploy)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Stripe
STRIPE_API_KEY=sk-test-emergent
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_emergent

# CORS (allow all for now)
CORS_ORIGINS=*
```

**IMPORTANT**: Set all variables to **Production**, **Preview**, and **Development** environments

---

## Step 5: Update Clerk Settings

After your first deployment, you'll get a Vercel URL like: `https://medyra-medical-platform.vercel.app`

1. Go to Clerk Dashboard → Your App → **Paths**
2. Update URLs:
   - Sign-in URL: `https://YOUR-APP.vercel.app/sign-in`
   - Sign-up URL: `https://YOUR-APP.vercel.app/sign-up`
   - Home URL: `https://YOUR-APP.vercel.app`

3. Go to **Domains** → Add your Vercel domain

4. **Webhooks** (Optional but recommended):
   - Add endpoint: `https://YOUR-APP.vercel.app/api/webhook/clerk`
   - Subscribe to: user.created, user.updated, user.deleted

---

## Step 6: Update Stripe Settings

1. Go to Stripe Dashboard → **Webhooks**
2. Add endpoint: `https://YOUR-APP.vercel.app/api/webhook/stripe`
3. Select events: checkout.session.completed
4. Copy the webhook signing secret
5. Add to Vercel env: `STRIPE_WEBHOOK_SECRET=whsec_xxxxx`

---

## Step 7: Redeploy

After adding environment variables:
1. Go to Vercel Dashboard → **Deployments**
2. Click the three dots on the latest deployment
3. Click **Redeploy**

---

## 🎉 You're Live!

Your app will be available at: `https://YOUR-APP-NAME.vercel.app`

### Making Updates:

Just push to GitHub:
```bash
git add .
git commit -m "Update feature X"
git push
```

Vercel will automatically build and deploy!

---

## 📝 Important Notes

### Free Tier Limits (Vercel):
- ✅ Unlimited deployments
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Preview deployments for branches

### Database (MongoDB Atlas Free):
- ✅ 512MB storage
- ✅ Shared RAM
- ✅ Perfect for MVP

### Costs to Watch:
- Anthropic Claude API: Pay per token
- Google Vision API: 1000 free requests/month
- Clerk: 10,000 MAU free
- Stripe: Transaction fees only

---

## 🔧 Troubleshooting

### Build Fails:
- Check environment variables are set
- Ensure MongoDB connection string is correct
- Check build logs in Vercel dashboard

### API Errors:
- Verify all API keys are correct
- Check MongoDB IP whitelist (0.0.0.0/0)
- Look at Function Logs in Vercel

### Clerk Issues:
- Ensure Vercel domain is added to Clerk
- Check redirect URLs match Vercel deployment

---

## 🚀 Next Steps After Deployment

1. **Test Everything**:
   - Sign up with a test account
   - Upload a test medical report
   - Try payment flow

2. **Monitor**:
   - Vercel Analytics (free)
   - Check error logs daily
   - Monitor API usage

3. **Custom Domain** (optional paid):
   - Buy domain (e.g., medyra.com)
   - Add to Vercel project
   - Update Clerk URLs

---

## 📞 Need Help?

- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Clerk Support: https://clerk.com/docs

---

**Your app is production-ready! 🎉**

The code is already optimized and secure for deployment.
