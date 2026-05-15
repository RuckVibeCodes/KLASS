# Klass - White-Label Creator Platform

⚡ **TL;DR:** `npm install` → add env vars → `npm run dev` → create community

---

A Skool-style community platform that's fully brandable and resellable to creators.

## Features

- **Community Feed** - Posts, comments, and engagement
- **Programs & Courses** - Video lessons with progress tracking
- **Resources Vault** - File downloads and external links
- **Events** - Live sessions and workshops
- **Membership Paywalls** - Stripe subscriptions with tier-gated content
- **White-Label Branding** - Custom colors, logos, and navigation labels
- **Admin Dashboard** - Member management and analytics
- **AI Tools** (Stubs) - Onboarding messages and lesson outlines

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript)
- **UI**: Tailwind CSS + shadcn/ui
- **Auth**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Hosting**: Vercel (recommended)

## 🚀 Quick Start (5 min)

```bash
# 1. Clone & install
cd klass && npm install

# 2. Add env vars
cp .env.local_example.example .env.local
# Fill in: Clerk, Supabase, Stripe keys

# 3. Run DB
# Run supabase/migrations/00001_initial_schema.sql in Supabase SQL Editor

# 4. Dev
npm run dev
```

Open localhost:3000 — create your first community.

---

## Prerequisites

1. [Node.js](https://nodejs.org/) 18+
2. [Clerk](https://clerk.com/) account
3. [Supabase](https://supabase.com/) project
4. [Stripe](https://stripe.com/) account

### Setup

1. **Clone and install**

```bash
cd klass
npm install
```

2. **Configure environment variables**

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - From Clerk dashboard
- `CLERK_SECRET_KEY` - From Clerk dashboard
- `NEXT_PUBLIC_SUPABASE_URL` - From Supabase project settings
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - From Supabase project settings
- `SUPABASE_SERVICE_ROLE_KEY` - From Supabase project settings
- `STRIPE_SECRET_KEY` - From Stripe dashboard
- `STRIPE_WEBHOOK_SECRET` - From Stripe webhook settings
- `STRIPE_PRICE_ID_MONTHLY` - Your Stripe price ID

3. **Set up Supabase database**

Run the migration SQL in your Supabase SQL Editor:

```sql
-- Run the contents of supabase/migrations/00001_initial_schema.sql
```

Then optionally run the seed data:

```sql
-- Run the contents of supabase/seed.sql
```

4. **Configure Clerk-Supabase integration**

In Clerk Dashboard:
- Go to JWT Templates
- Create a template named "supabase"
- Add your Supabase JWT secret

5. **Set up Stripe webhooks**

Configure webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

Events to listen for:
- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

6. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
klass/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Sign in/up pages
│   ├── (platform)/        # Protected platform routes
│   │   ├── [community-slug]/ # Community pages
│   │   │   ├── admin/     # Admin dashboard
│   │   │   ├── programs/  # Programs & lessons
│   │   │   ├── resources/ # Resource vault
│   │   │   ├── events/    # Events list
│   │   │   └── members/   # Member directory
│   │   └── create-community/
│   └── api/               # API routes
│       ├── webhooks/      # Stripe & Clerk webhooks
│       ├── stripe/        # Checkout & portal
│       └── ai/            # AI feature stubs
├── components/
│   ├── ui/               # shadcn/ui components
│   ├── layout/           # Sidebar, header, nav
│   └── providers/        # Context providers
├── lib/
│   ├── supabase/         # Supabase clients
│   └── stripe/           # Stripe client
├── types/                # TypeScript types
├── actions/              # Server actions
└── supabase/
    └── migrations/       # SQL schema
```

## Roles & Permissions

| Role | Capabilities |
|------|-------------|
| ADMIN | Full access - create/edit/delete all content, manage branding, manage members |
| PAID_MEMBER | Access all content including paid-gated programs and resources |
| FREE_MEMBER | Access free and members-only content |

## Demo Flow

1. Visit the landing page
2. Sign up / Sign in
3. Create a community (becomes Admin)
4. Customize branding in Admin > Branding
5. Add programs, resources, and events
6. Invite members

Or visit `/demo` to see the pre-seeded demo community.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Build the production app:

```bash
npm run build
npm start
```

## 📋 Environment Variables Checklist

```bash
# Clerk (required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Supabase (required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Stripe (required for payments)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_MONTHLY=price_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Environment Variables Reference

```bash
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_ID_MONTHLY=

# App
NEXT_PUBLIC_APP_URL=
```

## License

Private - For authorized use only.
