# Medyra — AI Medical Report Explainer

> **Live site:** [medyra.de](https://medyra.de)  
> **Organization:** [github.com/Medyra-Health](https://github.com/Medyra-Health)

Medyra helps patients understand their medical lab results in plain language. Upload a report (PDF, image, or text), and Claude AI explains every value — flagging what's normal, low, high, or critical — in 18 languages. Built to be GDPR-compliant and deployed to the EU (Frankfurt, Vercel).

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Local Setup](#local-setup)
4. [Environment Variables](#environment-variables)
5. [Branch & Deployment Workflow](#branch--deployment-workflow)
6. [Key Features](#key-features)
7. [Database Schema](#database-schema)
8. [API Routes](#api-routes)
9. [Internationalization](#internationalization)
10. [Payments (Stripe)](#payments-stripe)
11. [Contributing](#contributing)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Styling | Tailwind CSS 3 + shadcn/ui |
| Auth | Clerk (OAuth, webhooks) |
| Database | MongoDB Atlas |
| AI | Anthropic Claude API |
| OCR | Google Cloud Vision |
| Payments | Stripe |
| i18n | next-intl (18 languages) |
| Deployment | Vercel (Frankfurt, fra1) |

---

## Project Structure

```
Medyra/
├── app/                    # Next.js App Router pages & API routes
│   ├── api/                # Server-side API endpoints
│   │   ├── [[...path]]/    # Main AI analysis handler
│   │   ├── checkout/       # Stripe checkout session
│   │   ├── billing-portal/ # Stripe customer portal
│   │   ├── prep/           # Doctor visit prep (AI + chat)
│   │   ├── profiles/       # Health profiles CRUD
│   │   ├── stripe/webhook/ # Stripe webhook handler
│   │   └── admin/          # Admin-only endpoints
│   ├── dashboard/          # User dashboard
│   ├── upload/             # File upload page
│   ├── reports/            # Report history & detail views
│   ├── profiles/           # Health profiles (Health Vault)
│   ├── blog/               # 9 SEO blog articles
│   ├── lexikon/            # Medical terms encyclopedia
│   ├── pricing/            # Pricing page
│   ├── sign-in/ sign-up/   # Clerk auth pages
│   ├── admin/              # Admin dashboard
│   ├── layout.js           # Root layout (fonts, providers)
│   ├── page.js             # Landing page
│   ├── robots.js           # Dynamic robots.txt
│   └── sitemap.js          # Dynamic sitemap
├── components/
│   ├── ui/                 # 40+ shadcn/ui base components
│   ├── lexikon/            # Lexikon-specific components
│   ├── MobileNav.jsx       # Mobile bottom navigation
│   ├── ConsentModal.jsx    # GDPR consent modal
│   ├── CookieBanner.jsx    # Cookie notice
│   ├── LanguageSwitcher.jsx
│   ├── JsonLd.jsx          # Schema.org structured data
│   └── SiteFooter.js
├── lib/
│   ├── mongodb.js          # MongoDB connection helper
│   ├── lexikon.js          # Lexikon data helpers
│   └── utils.js            # Shared utilities
├── messages/               # i18n translation files (18 languages)
├── data/lexikon/           # 45+ medical term JSON definitions
├── hooks/                  # use-mobile, use-toast
├── public/                 # Static assets (logos, manifest)
├── scripts/                # Translation generation scripts
├── middleware.js           # Clerk auth middleware (public routes)
├── i18n.js                 # next-intl config
├── next.config.js
├── tailwind.config.js
└── .env.example            # Environment variable template
```

---

## Local Setup

### Prerequisites

- **Node.js** 18 or later
- **Yarn** 1.x — install with `npm install -g yarn`
- **Git**
- Accounts needed: MongoDB Atlas, Clerk, Stripe, Anthropic (see [Environment Variables](#environment-variables))

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/Medyra-Health/Medyra.git
cd Medyra

# 2. Install dependencies
yarn install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in all values (see the table below)

# 4. Start the development server
yarn dev
```

The app runs at **http://localhost:3000**.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in every value. **Never commit `.env.local` to git.**

| Variable | Where to get it | Notes |
|---|---|---|
| `MONGO_URL` | MongoDB Atlas → Clusters → Connect | Use a separate DB for staging |
| `DB_NAME` | Your choice | e.g. `medyra` (prod) / `medyra-staging` (staging) |
| `ANTHROPIC_API_KEY` | console.anthropic.com | Powers AI report analysis |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys | Frontend-safe key |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys | Server-only, never expose |
| `STRIPE_SECRET_KEY` | Stripe Dashboard → API Keys | Use `sk_test_` for staging |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard → API Keys | Frontend-safe key |
| `STRIPE_WEBHOOK_SECRET` | Stripe Dashboard → Webhooks | Different per environment |
| `ENCRYPTION_KEY` | Generate locally (see below) | 64-char hex, 32 bytes |
| `GOOGLE_CREDENTIALS_BASE64` | GCP Service Account JSON | Optional — only needed for OCR |

**Generate an encryption key:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> **Staging tip:** Use Stripe test mode keys (`sk_test_`, `pk_test_`) and a separate MongoDB database (`DB_NAME=medyra-staging`) so you never touch real production data while testing.

---

## Branch & Deployment Workflow

We use a **three-tier model** so no untested code ever reaches the live site.

```
feature/my-feature  →  staging  →  main
                                     │
                                 medyra.de (production)
```

### Branch roles

| Branch | Purpose | Deploys to |
|---|---|---|
| `main` | Production-ready code only | medyra.de (live) |
| `staging` | Integration testing before going live | Vercel preview URL |
| `feature/*` | Individual features or fixes | Local dev / personal preview |

### Day-to-day workflow

```bash
# 1. Always branch off staging — not main
git checkout staging
git pull origin staging
git checkout -b feature/your-feature-name

# 2. Build your feature, commit often
git add <specific-files>
git commit -m "feat: short description of what you did"

# 3. Push and open a PR targeting staging
git push origin feature/your-feature-name
# On GitHub: open PR from feature/your-feature-name → staging

# 4. Vercel auto-deploys the branch — test on the preview URL

# 5. Once staging looks good, open a PR: staging → main
#    Both founders review and approve before merging
```

### Rules

- **Never push directly to `main`.** Always go through staging first.
- **Both founders must approve** a `staging → main` PR before it merges.
- Test on the Vercel staging preview URL before touching production.
- Keep staging env vars pointing at test/staging credentials only.

### Setting up Vercel for staging (one-time)

1. Go to your Vercel project → **Settings → Git**
2. Confirm "Production Branch" is set to `main`
3. Vercel automatically creates preview deployments for every other branch (including `staging`)
4. Go to **Settings → Environment Variables**, add your staging credentials and scope them to **"Preview"** only (not Production)

---

## Key Features

### 1. File Upload & OCR
- Drag-and-drop or camera capture (`app/upload/`)
- Accepts PDF, JPG, PNG, TXT
- PDFs parsed with `pdf-parse`; images processed with Google Cloud Vision (OCR)

### 2. AI Analysis
- Claude API reads extracted text and returns plain-language explanations
- Every value is flagged: normal / low / high / critical
- Follow-up chat lets users ask questions about their specific results

### 3. Doctor Visit Prep (`/prep`)
- AI generates a list of questions to bring to the next appointment
- Chat interface for refining the prep notes

### 4. Health Profiles — Health Vault (`/profiles`)
- Users store personal health data (allergies, conditions, medications)
- Linked to reports so the AI has context for analysis

### 5. Medical Lexikon (`/lexikon`)
- Encyclopedia of 45+ medical terms with normal ranges
- SEO-optimized with Schema.org structured data, available in 18 languages

### 6. Dashboard (`/dashboard`)
- Usage counter, subscription tier, report history
- Subscription management via Stripe Billing Portal

### 7. Internationalization
- 18 languages: EN, DE, FR, ES, IT, PT, NL, PL, TR, AR, ZH, JA, KO, HI, BN, RU, UR
- Cookie-based locale detection with server-side rendering
- All UI strings live in `messages/<locale>.json`

### 8. GDPR Compliance
- Reports auto-expire after 30 days (`expiresAt` field in MongoDB)
- Health data encrypted with AES-256-GCM (`ENCRYPTION_KEY`)
- GDPR consent modal and cookie banner included
- Deployed to Vercel Frankfurt region (fra1) for EU data residency

---

## Database Schema

Three MongoDB collections:

### `users`
| Field | Type | Description |
|---|---|---|
| `clerkId` | String | Clerk user ID (used as primary key) |
| `email` | String | User email |
| `tier` | String | `free`, `one-time`, `personal`, `family`, `clinic` |
| `usageLimit` | Number | Max reports allowed for this tier |
| `currentUsage` | Number | Reports used this period |
| `stripeCustomerId` | String | Stripe customer ID |
| `createdAt` | Date | Account creation timestamp |

### `reports`
| Field | Type | Description |
|---|---|---|
| `userId` | String | Clerk user ID |
| `fileName` | String | Original file name |
| `extractedText` | String | Raw text from OCR or PDF parsing |
| `explanation` | Object | AI-generated explanation with value flags |
| `conversations` | Array | Chat history (follow-up questions) |
| `createdAt` | Date | Upload timestamp |
| `expiresAt` | Date | Auto-delete date (30 days after upload) |

### `payments`
| Field | Type | Description |
|---|---|---|
| `userId` | String | Clerk user ID |
| `stripeSessionId` | String | Stripe checkout session ID |
| `tier` | String | Tier purchased |
| `amount` | Number | Amount charged (in cents) |
| `status` | String | `pending`, `complete`, `failed` |
| `createdAt` | Date | Payment timestamp |

---

## API Routes

| Method | Route | Auth | Description |
|---|---|---|---|
| `POST` | `/api/[[...path]]` | Required | Main AI analysis (upload + explain) |
| `POST` | `/api/checkout` | Required | Create Stripe checkout session |
| `GET` | `/api/billing-portal` | Required | Redirect to Stripe customer portal |
| `POST` | `/api/stripe/webhook` | Stripe sig | Handle Stripe payment events |
| `GET/POST` | `/api/prep` | Required | Generate doctor visit prep notes |
| `POST` | `/api/prep/chat` | Required | Follow-up chat for prep notes |
| `GET/POST/DELETE` | `/api/profiles` | Required | Health profiles CRUD |
| `GET` | `/api/admin/stats` | Admin only | Platform usage stats |
| `POST` | `/api/admin/activate` | Admin only | Manual user tier activation |

---

## Internationalization

All UI strings are in `messages/<locale>.json`. English (`en.json`) is the source of truth.

**Adding a new string:**
1. Add the key/value to `messages/en.json`
2. Add the translation to the other locale files (or run the relevant script in `scripts/`)
3. Use in a component via `useTranslations()` from `lib/useTranslations.js`

**Adding a new language:**
1. Create `messages/<locale>.json` (copy from `en.json` and translate)
2. Add the locale to `i18n.js`
3. Add a flag + label to `components/LanguageSwitcher.jsx`

---

## Payments (Stripe)

**Pricing tiers:**

| Plan | Price | Report limit |
|---|---|---|
| Free | €0 | 2 reports |
| One-Time | €4.99 | 10 reports |
| Personal | €9 / month | 30 reports/month |
| Family | €19 / month | 100 reports/month |
| Clinic | €199 / month | Unlimited |

**Payment flow:**
1. User clicks "Upgrade" → `POST /api/checkout` creates a Stripe Checkout Session
2. User pays on Stripe's hosted page
3. Stripe fires `checkout.session.completed` webhook → `POST /api/stripe/webhook`
4. Webhook updates `users.tier` and `users.usageLimit` in MongoDB

**Testing webhooks locally:**
```bash
# Install Stripe CLI, then:
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

---

## Contributing

1. Clone the repo and set up your local environment (see [Local Setup](#local-setup))
2. Create a feature branch off `staging` — **not** `main`
3. Make your changes and push
4. Open a PR targeting `staging` and request a review
5. Test on the Vercel staging preview URL
6. Once approved and tested, open a `staging → main` PR — both founders must approve

**Commit message convention:**
```
feat: add new feature
fix: resolve a bug
chore: dependency or config update
docs: documentation change
```

---

*Questions? Open an issue or reach out via [medyra.de/contact](https://medyra.de/contact).*
