# 🚀 Deploy Medyra to Vercel (Step-by-Step)

## ✅ Prerequisites Completed
- [x] Code pushed to GitHub
- [ ] MongoDB Atlas account (we'll set this up)
- [ ] Vercel account (we'll create this)

---

## Step 1: Set Up MongoDB Atlas (5 minutes)

### Why MongoDB Atlas?
Your app currently uses local MongoDB, but Vercel needs a cloud database. Atlas has a FREE forever tier!

### Setup Instructions:

1. **Go to** https://www.mongodb.com/cloud/atlas/register

2. **Sign up** (use Google/GitHub for quick signup)

3. **Create a FREE Cluster**:
   - Choose "M0 FREE" tier
   - Select region closest to you (or Frankfurt for EU)
   - Name: `medyra-cluster`
   - Click "Create Cluster"

4. **Create Database User**:
   - Click "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `medyra_admin`
   - Password: Generate a secure password (save it!)
   - Database User Privileges: "Atlas admin"
   - Click "Add User"

5. **Whitelist All IPs** (for Vercel):
   - Click "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere"
   - IP Address: `0.0.0.0/0`
   - Click "Confirm"

6. **Get Connection String**:
   - Click "Database" (left sidebar)
   - Click "Connect" on your cluster
   - Click "Connect your application"
   - Copy the connection string (looks like):
   ```
   mongodb+srv://medyra_admin:<password>@medyra-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   - **Replace `<password>`** with your actual password
   - **Add database name** at the end:
   ```
   mongodb+srv://medyra_admin:YOUR_PASSWORD@medyra-cluster.xxxxx.mongodb.net/medyra?retryWrites=true&w=majority
   ```

✅ **Save this connection string!** You'll need it for Vercel.

---

## Step 2: Deploy to Vercel (3 minutes)

### 2.1 Create Vercel Account

1. **Go to** https://vercel.com/signup

2. **Sign up with GitHub** (click "Continue with GitHub")

3. **Authorize Vercel** to access your GitHub repositories

### 2.2 Import Your Project

1. **In Vercel Dashboard**, click **"Add New..." → "Project"**

2. **Find your repository**: 
   - Search for your repository name (e.g., `medyra`)
   - Click **"Import"**

3. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave as default)
   - Build Command: `yarn build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

4. **DON'T CLICK DEPLOY YET!** 
   - First, we need to add environment variables

### 2.3 Add Environment Variables

Click **"Environment Variables"** section (expand if collapsed)

Add these variables ONE BY ONE:

```env
MONGO_URL
```
**Value**: Your MongoDB Atlas connection string from Step 1
```
mongodb+srv://medyra_admin:YOUR_PASSWORD@medyra-cluster.xxxxx.mongodb.net/medyra?retryWrites=true&w=majority
```

```env
DB_NAME
```
**Value**: `medyra`

```env
ANTHROPIC_API_KEY
```
**Value**: `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`

```env
GOOGLE_CREDENTIALS_BASE64
```
**Value**: `ewogICJ0eXBlIjogInNlcnZpY2VfYWNjb3VudCIsCiAgInByb2plY3RfaWQiOiAibWVkeXJhLTQ5MTIxNyIsCiAgInByaXZhdGVfa2V5X2lkIjogIjdjODk5ZDIwYjcxMGMwOThhZDViNGVlODY2ZDlkZmY2NTljNzI3MmMiLAogICJwcml2YXRlX2tleSI6ICItLS0tLUJFR0lOIFBSSVZBVEUgS0VZLS0tLS1cbk1JSUV2UUlCQURBTkJna3Foa2lHOXcwQkFRRUZBQVNDQktjd2dnU2pBZ0VBQW9JQkFRRFY1bmMrZ0ZqRXVEZGRcbm1UMWtWejMrQmRBdEFORUVIMmdhTlQyRi9uQi90Q1RBTk4xbHZDdmpQenRJZThLTDFPQ1hjQ1FYNXV2N1htRUdcbkNuOHQvNmp2SGZ5bmt1TVlLalRoVG0rQmZnYUt1c2lxT3lsQWloUlY1YmFodXVBUUMzellTdWRZdmpDSmVlZDNcblFCUk1PQmsraEpYNnBHRDJOcXV2Rjk3OUduQlpNZkdwMGRQZEhxK0d4dXp6YnVIa2EzTC9UcG96N3Y4MjJoUkVcbmNNelA3WnNYa1FidnlUZnBHQlBIc0VGdDUzaFo5Rkt0cFN3Rkkvd0NJWENFQmVueUJsWGJ2aFhBTGt2QkxLK0JcbjRSK0dSSmozcHdRR3RWaFJyZG0xMGF4TmFMaDVHSmVPdFZTM282b3BtOUcvb1NIc1lFVjRQclNVakNteFB6eU9cbjNZSGxIajhQQWdNQkFBRUNnZ0VBVmlIRnBwOWNIMnJtc0lRQ1dxTmV6U2xlR0tFWmlZVjBFQW1jU3BhWWluUHBcbjBKUDVDdnhvMThzZ2ZpR0h4M0xqTlZmczBNc2wvMFNUNFREYzRaTHZYY28vY09NUEd5M3p1VDR5WEh4NCtlZ1lcbjRhT05DdllQRmorMytRd2RLWmpXbnVvYW1udUxZL0I0cW1aZFJndlk3bm5KUXZKcU1QcjJ5enpiaUNQYlZhNnZcbjNTNTNyM3poaG1WRHpuVGU2cDBGS0dYRWdCaVRiWTVoTnliWm80d3gycHFacEhsd05QTUh4ZkhFMm4rWE9JV3FcblhCc0dnOTJ0d2pDOUJRYnhIMzRNOHN0QUZBY09yYUdCeFg2U0hXeFluZEVJWU50NnNmQ2F5MDBZNG44OHJGUmtcbkF3a25CQk1tUTdjZFNHaWZEMTl2Qk93Q2Z1bnVPbDJQVDZLOCtobmdnUUtCZ1FEOENFUnI0ZHpPMkFsMDBVWkJcbk1JUitNQWJNNW9VMUVaTGpZR2JyOG9GNUE4Y3VGY0ZSTlpNaFdLZ1VZQzJOV01SQXZSZTYxR0d0eUR3TE5MUE9cbktvUE96MURRd09GaTBCdjJEWStyRSthZTNGNVhKVGp1R1VVMGRvcUZXK3gwdUluRmFjTjJZc3p2NVRhS1NOUGtcblgxRll1ZG9UL1RaVmt2Z0U4QTVpY3ExN3J3S0JnUURaUklVZENPUVUvdGNpbllGcUEvak94UGdyblFhVGVMU2JcblZLNk1nUmZoRGtzaWh3Q1VqV3d2RjVOTGZkeURZWnFFTWpGcWN4Y1N6U0Nzb1pvYThOeXVXT3lYZXFtR1cyYnBcbkp3VW5STHNWV0NzbENMZC9CaStGWHl5NXk2dk9UUTA4Z2Z0cDFZdWFQeVRXZWNCcjNLZ3c3NUM3YWdkMHFUdDJcbmxkaGZEa05xb1FLQmdFcW0yRDFzUlU4dlJuM0hqeHU0RjBhWlN5cGVEWTdPaWNlM3drU1pMQ2lBS2Z0SWpsNVRcbmxDVUljYUMzYkVhMXlFdTB0dGFzR2RLendMVkJBeEZLSG9pZmQ3eWRwU1R6cDVTV0o3dnd4UnJCQTJDa3NkdzBcbnQvNzJMY21hbE10dDdjRC90dG5XSWdYY3l1N2k2NEIxaTA3UW5mdlZ3TVpRSmc2d1hGSmt6V1laQW9HQWRWQ05cbk84ZEFPS0grRWovUDBDbkM0QXIxSWIrUS9ISVJ1MG0zVWtDbVh5d3puN29ic3hyRnpvdkJTZUwwL2EvbkdmaHNcblBGbFduUjFMeGtzZ0Jlb0dqdEdQTnAvU0I2MDAzVEhuazNPR1BSazFlckxCT2dKaUNIY0NsSFFJR2NYN0hxL2tcbnpCbTFYcDAzeStORDVqbm9TendmLzBKYU1rRHF6YlpOZGM0aTB1RUNnWUVBd1UyUVpEcXlkcldWd2FkSHVwYkdcblI5TDRXYThYU3hieXBxS2tuRTRTRVQyM3pmRGRFYVFnSGE2QnU0MXpLVGhxbDVLNGVJM0ZYWlhBZllDK3BiWWpcbnZZd0ZRc0ZCeTd2TGYwM2t4V1A1blpyazFoVm1jOHhXSy9xWmRjN0c3L0dPcTZMK1ZIbWtPdDYwRTFFcVpvVExcbmF0UEk4Qkc3bVpwMlAzdXdqbjM5TlRJPVxuLS0tLS1FTkQgUFJJVkFURSBLRVktLS0tLVxuIiwKICAiY2xpZW50X2VtYWlsIjogIm1lZHlyYS12aXNpb25AbWVkeXJhLTQ5MTIxNy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgImNsaWVudF9pZCI6ICIxMDc0MDE0NTY5OTU0MDU5ODM3ODciLAogICJhdXRoX3VyaSI6ICJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsCiAgInRva2VuX3VyaSI6ICJodHRwczovL29hdXRoMi5nb29nbGVhcGlzLmNvbS90b2tlbiIsCiAgImF1dGhfcHJvdmlkZXJfeDUwOV9jZXJ0X3VybCI6ICJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9vYXV0aDIvZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwKICAiY2xpZW50X3g1MDlfY2VydF91cmwiOiAiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vcm9ib3QvdjEvbWV0YWRhdGEveDUwOS9tZWR5cmEtdmlzaW9uJTQwbWVkeXJhLTQ5MTIxNy5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsCiAgInVuaXZlcnNlX2RvbWFpbiI6ICJnb29nbGVhcGlzLmNvbSIKfQo=`

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
```
**Value**: `pk_test_Y2xldmVyLWNvdy05LmNsZXJrLmFjY291bnRzLmRldiQ`

```env
CLERK_SECRET_KEY
```
**Value**: `sk_test_xYEcZuGd0DTJE8xPyDzA0xd5VkqrAllhQv609lrkvz`

```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL
```
**Value**: `/sign-in`

```env
NEXT_PUBLIC_CLERK_SIGN_UP_URL
```
**Value**: `/sign-up`

```env
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL
```
**Value**: `/dashboard`

```env
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL
```
**Value**: `/dashboard`

```env
STRIPE_API_KEY
```
**Value**: `sk_test_emergent`

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```
**Value**: `pk_test_emergent`

```env
CORS_ORIGINS
```
**Value**: `*`

**IMPORTANT**: For EACH variable, check **"Production", "Preview", AND "Development"** checkboxes!

### 2.4 Deploy!

1. Click **"Deploy"** button

2. Wait 2-3 minutes while Vercel:
   - Clones your code
   - Installs dependencies
   - Builds your app
   - Deploys to global CDN

3. **Success!** You'll see: 🎉
   ```
   ✅ Deployment completed
   🔗 Your app URL: https://medyra-xxx.vercel.app
   ```

---

## Step 3: Update Clerk Settings (2 minutes)

Your app is live, but Clerk needs to know your new URL!

1. **Go to** https://dashboard.clerk.com

2. **Select your app** (or create one if you haven't)

3. **Update URLs**:
   - Go to "Configure" → "Paths"
   - Sign-in URL: `https://YOUR-APP.vercel.app/sign-in`
   - Sign-up URL: `https://YOUR-APP.vercel.app/sign-up`
   - After sign-in: `https://YOUR-APP.vercel.app/dashboard`
   - After sign-up: `https://YOUR-APP.vercel.app/dashboard`
   - Home URL: `https://YOUR-APP.vercel.app`

4. **Add your domain**:
   - Go to "Configure" → "Domains"
   - Add: `YOUR-APP.vercel.app`
   - Click "Add domain"

5. **Set up webhook** (optional but recommended):
   - Go to "Configure" → "Webhooks"
   - Click "Add Endpoint"
   - URL: `https://YOUR-APP.vercel.app/api/webhook/clerk`
   - Subscribe to: `user.created`, `user.updated`, `user.deleted`
   - Click "Create"

---

## Step 4: Test Your Live Site! (5 minutes)

Visit your Vercel URL: `https://YOUR-APP.vercel.app`

### Test Checklist:

1. **Landing Page** ✅
   - Should show pricing tiers
   - Sign up button works

2. **Sign Up** ✅
   - Click "Get Started"
   - Create account with Clerk
   - Should redirect to dashboard

3. **Dashboard** ✅
   - Shows your plan (Free tier)
   - Shows usage (0/1)

4. **Upload Report** ✅
   - Go to /upload
   - Try uploading a test PDF or image
   - AI should analyze and explain

5. **Pricing** ✅
   - Go to /pricing
   - Stripe checkout should work

---

## 🎉 You're LIVE!

Your app is now deployed at: **https://YOUR-APP.vercel.app**

### What You Can Do Now:

✅ **Share your URL** with users
✅ **Test all features** in production
✅ **Monitor** in Vercel dashboard
✅ **Make updates** by pushing to GitHub (auto-deploys!)

---

## Making Updates (Super Easy!)

Whenever you want to update your site:

```bash
# Make your changes locally
# Edit any file...

# Commit and push
git add .
git commit -m "Updated landing page design"
git push

# That's it! Vercel automatically deploys in 2-3 minutes
```

---

## 🐛 Troubleshooting

### Build Failed?

1. **Check Build Logs** in Vercel dashboard
2. **Most common issues**:
   - Missing environment variable
   - MongoDB connection string wrong
   - Syntax error in code

### MongoDB Connection Error?

1. **Check IP Whitelist**: Must be `0.0.0.0/0`
2. **Verify password**: No special chars that need encoding
3. **Test connection**: Use MongoDB Compass to test

### Clerk Not Working?

1. **Domain added**: Check Clerk dashboard
2. **URLs match**: Must match your Vercel URL exactly
3. **Environment vars**: Check they're set in Vercel

### 500 Error on Deploy?

1. **Check Function Logs** in Vercel dashboard
2. **Common causes**:
   - Database connection
   - API key invalid
   - Missing environment variable

---

## 📊 Monitor Your App

### Vercel Dashboard:

- **Deployments**: See all deploys
- **Analytics**: Page views, performance
- **Logs**: Runtime errors and API logs
- **Usage**: Bandwidth, function invocations

### Check Regularly:

- MongoDB Atlas usage
- Claude API costs
- Google Vision API calls
- Clerk active users

---

## 💰 Free Tier Limits

**Vercel** (FREE forever):
- 100GB bandwidth/month
- 100GB-Hrs compute/month
- Unlimited projects

**MongoDB Atlas** (FREE):
- 512MB storage
- Shared RAM
- ~1000s of reports

**Claude API** (Pay per use):
- ~$0.001 per report
- $10 = ~10,000 reports

**Google Vision** (FREE):
- 1,000 requests/month free
- $1.50 per 1,000 after

**Clerk** (FREE):
- 10,000 MAU (monthly active users)
- Upgrade if you exceed

---

## 🚀 Next Steps

### Week 1:
- ✅ Test all features thoroughly
- ✅ Upload real medical reports
- ✅ Share with 5-10 beta users
- ✅ Collect feedback

### Week 2:
- Add Google Analytics
- Set up error tracking (Sentry)
- Improve landing page based on feedback
- Add FAQ section

### Month 1:
- Buy custom domain (medyra.com)
- Set up production Stripe account
- Launch marketing campaign
- Scale based on usage

---

## 📞 Need Help?

**Vercel Issues**: https://vercel.com/support
**MongoDB Issues**: https://www.mongodb.com/docs/atlas/
**Clerk Issues**: https://clerk.com/support

---

## ✨ Congratulations!

Your **Medyra** medical lab report explanation platform is now LIVE and FREE! 🏥

**Your Live URL**: `https://YOUR-APP.vercel.app`

Share it with the world! 🚀
