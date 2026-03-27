# Medyra — Medical Lab Report Explanation Platform

> AI-powered platform that helps patients understand their medical lab results in plain language. GDPR-compliant, fully internationalized, and production-ready.

**Live:** [medyra.de](https://medyra.de) &nbsp;·&nbsp; **Stack:** Next.js 15 · MongoDB · Claude AI · Stripe · Clerk

---

## Overview

Medyra bridges the gap between complex medical terminology and patient understanding. Users upload their lab reports (PDF, image, or text), and Claude AI generates plain-language explanations with contextual insights, flagged abnormal values, and suggested questions to ask their doctor.

---

## Features

### Core
| Feature | Details |
|---|---|
| **Authentication** | Clerk — sign-up, sign-in, OAuth, webhooks |
| **File Upload** | PDF, JPG, PNG, TXT via drag-and-drop or camera |
| **OCR** | Google Cloud Vision API extracts text from scanned images |
| **AI Analysis** | Claude (Anthropic) explains results in plain language |
| **Abnormal Flagging** | Values marked as normal / low / high / critical |
| **Follow-up Chat** | Ask follow-up questions about your specific results |
| **Dashboard** | Usage tracking, subscription status, report history |
| **Payments** | Stripe — 5 pricing tiers, webhooks, session management |
| **GDPR** | Auto-deletion after 30 days, consent notices, data encryption |
| **i18n** | 16 languages — cookie-based locale, server-side rendering |
| **Responsive UI** | Mobile-first — optimized for phone, tablet, and desktop |

### Pricing Tiers
| Plan | Price | Limit |
|---|---|---|
| Free | €0/mo | 1 report/month |
| One-Time | €4.99 | Per report |
| Personal | €9/mo | Unlimited reports |
| Family | €19/mo | 5 members |
| Clinic | €199/mo | Unlimited patients, white-label |

### Supported Languages
English · German · French · Spanish · Italian · Portuguese · Dutch · Polish · Turkish · Arabic · Chinese · Japanese · Korean · Hindi · Bengali · Russian

---

## Tech Stack

**Frontend**
- Next.js 15 (App Router, Server Components)
- React 19
- Tailwind CSS + shadcn/ui
- next-intl v3 (i18n, cookie-based locale)
- Lucide React

**Backend**
- Next.js API Routes
- MongoDB Atlas
- Anthropic Claude API
- Google Cloud Vision API (OCR)
- Stripe API + Webhooks
- pdf-parse

**Auth & Infra**
- Clerk (authentication + user management)
- Vercel (deployment, Frankfurt region)

---

## Project Structure

```
medyra/
├── app/
│   ├── page.js                  # Landing page
│   ├── dashboard/page.js        # User dashboard
│   ├── upload/page.js           # File upload
│   ├── reports/[id]/page.js     # Report detail + chat
│   ├── pricing/page.js          # Pricing plans
│   ├── success/page.js          # Payment confirmation
│   ├── sign-in/                 # Clerk sign-in
│   └── sign-up/                 # Clerk sign-up
├── components/
│   ├── LanguageSwitcher.jsx     # Cookie-based locale switcher
│   ├── MobileNav.jsx            # Bottom nav for mobile
│   └── ui/                      # shadcn/ui components
├── messages/                    # i18n translation files (16 languages)
│   ├── en.json                  # English (source of truth)
│   ├── de.json                  # German
│   └── ...                      # 14 more languages
├── lib/
│   └── mongodb.js               # MongoDB connection
├── app/api/
│   ├── reports/analyze/         # Upload + AI analysis
│   ├── reports/[id]/chat/       # Follow-up questions
│   ├── subscription/            # User plan info
│   ├── checkout/                # Stripe session
│   └── webhook/                 # Stripe + Clerk webhooks
└── i18n.js                      # next-intl config
```

---

## API Reference

```
GET  /api/                        Health check
POST /api/reports/analyze         Upload and analyze a report
GET  /api/reports                 List user's reports
GET  /api/reports/:id             Get a specific report
POST /api/reports/:id/chat        Ask a follow-up question
GET  /api/subscription            Get user's subscription + usage
POST /api/checkout                Create a Stripe checkout session
POST /api/webhook/stripe          Stripe webhook handler
POST /api/webhook/clerk           Clerk webhook handler
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Clerk account
- Anthropic API key
- Stripe account
- Google Cloud Vision credentials (optional — for image OCR)

### Installation

```bash
git clone https://github.com/abralurrahman/Medyra.git
cd Medyra
npm install --legacy-peer-deps
```

### Environment Variables

Create `.env.local`:

```bash
# Database
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/
DB_NAME=medyra

# AI
ANTHROPIC_API_KEY=sk-ant-api03-...

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Payments
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional: Google Vision OCR
GOOGLE_CREDENTIALS_BASE64=<base64-encoded-service-account-json>
```

### Run locally

```bash
npm run dev
```

---

## Database Schema

### `users`
```json
{
  "clerkId": "string",
  "email": "string",
  "tier": "free | onetime | personal | family | clinic",
  "usageLimit": 1,
  "currentUsage": 0,
  "stripeCustomerId": "string",
  "createdAt": "Date"
}
```

### `reports`
```json
{
  "userId": "string",
  "fileName": "string",
  "extractedText": "string",
  "explanation": {
    "summary": "string",
    "tests": [{ "name": "...", "value": "...", "flag": "normal|low|high|critical", "normalRange": "...", "explanation": "...", "interpretation": "..." }],
    "questionsForDoctor": ["string"],
    "disclaimer": "string"
  },
  "conversations": [{ "question": "string", "answer": "string", "timestamp": "Date" }],
  "createdAt": "Date",
  "expiresAt": "Date"
}
```

### `payments`
```json
{
  "userId": "string",
  "stripeSessionId": "string",
  "tier": "string",
  "amount": 499,
  "status": "pending | completed | failed",
  "createdAt": "Date"
}
```

---

## Internationalization

Locale is detected from a `locale` cookie, set by the `LanguageSwitcher` component. The root layout reads it server-side and loads the correct message file via `next-intl`.

```
User selects language
  → LanguageSwitcher sets cookie
    → RootLayout reads cookie on next request
      → Loads messages/[locale].json
        → NextIntlClientProvider wraps the app
```

All 16 message files are fully translated including nav, hero, features, pricing, upload, dashboard, and report sections.

---

## Deployment

The app is deployed on Vercel with the Frankfurt (`fra1`) region for GDPR-optimal data locality.

```bash
# vercel.json already configured
vercel --prod
```

Required env vars must be added in the Vercel dashboard. For the custom domain `medyra.de`, set DNS:
- `A` record `@` → `76.76.21.21`
- `CNAME` `www` → `cname.vercel-dns.com`

---

## Legal & Compliance

- **Medical disclaimer** visible on every page and every report result
- **GDPR**: data auto-expires after 30 days, no data sold or shared
- **Education only**: Medyra explains terminology — it does not provide medical advice, diagnoses, or treatment recommendations

---

## Roadmap

- [ ] Email notifications (SendGrid / Resend)
- [ ] PDF export of AI explanations
- [ ] Webhook signature verification (production secrets)
- [ ] Family member sub-accounts
- [ ] Clinic EHR integration (HL7/FHIR)
- [ ] iOS / Android native app (Capacitor)

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

---

**Built with care in Germany**
