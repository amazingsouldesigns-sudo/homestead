# Homestead — Real Estate Marketplace

A production-ready, full-stack real estate marketplace platform built with **Next.js 14**, **Supabase**, **Stripe**, and **Google Maps**. Think Zillow meets Apple design.

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ecf8e) ![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff) ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-Styling-38bdf8)

---

## Features

### For Buyers / Renters
- Browse property listings with search + filters (price, beds, baths, type)
- Map view with Google Maps pins for each property
- Full property detail pages with image galleries
- Save/favorite properties
- Contact sellers via email

### For Sellers / Landlords
- Create and manage property listings with multiple photos
- Upload images to Supabase Storage
- Dashboard with analytics (views, saves)
- Pay to publish listings ($29.99) via Stripe
- Upgrade to Featured listing ($99.99) for 30 days of priority placement

### For Admins
- Approve or reject pending listings
- Manage all users (change roles, delete)
- View all payment records and revenue
- Full listing management (activate, reject, delete)

### Platform
- Role-based access (Buyer, Seller, Admin)
- Supabase Auth with email/password
- Row Level Security on all tables
- SEO-friendly URLs (e.g. `/properties/modern-beach-house-miami-lx3k9`)
- Server-side rendering for listing pages
- Fully responsive (mobile + desktop)
- Stripe Checkout with webhook handling
- Real-time payment verification

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Payments | Stripe Checkout |
| Maps | Google Maps JavaScript API |
| State | Zustand |
| Animations | Framer Motion + CSS |
| Icons | Lucide React |
| Deployment | Vercel / Node.js |

---

## Project Structure

```
homestead/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Homepage
│   ├── not-found.tsx           # 404 page
│   ├── (auth)/
│   │   ├── login/page.tsx      # Login
│   │   └── signup/page.tsx     # Signup
│   ├── (main)/
│   │   ├── layout.tsx          # Layout with Navbar/Footer
│   │   ├── properties/
│   │   │   ├── page.tsx        # Browse/search properties
│   │   │   └── [slug]/page.tsx # Property detail (SSR)
│   │   ├── dashboard/
│   │   │   ├── layout.tsx      # Dashboard sidebar
│   │   │   ├── page.tsx        # Overview
│   │   │   ├── listings/page.tsx   # Manage listings
│   │   │   ├── saved/page.tsx      # Saved properties
│   │   │   └── analytics/page.tsx  # Listing analytics
│   │   └── admin/
│   │       ├── layout.tsx      # Admin layout
│   │       ├── page.tsx        # Admin overview
│   │       ├── listings/page.tsx   # Manage all listings
│   │       ├── users/page.tsx      # Manage users
│   │       └── payments/page.tsx   # View payments
│   ├── checkout/
│   │   ├── page.tsx            # Checkout page
│   │   ├── success/page.tsx    # Payment success
│   │   └── failure/page.tsx    # Payment failure
│   └── api/
│       ├── auth/callback/route.ts
│       └── payments/
│           ├── create-checkout/route.ts
│           ├── verify/route.ts
│           └── webhook/route.ts
├── components/
│   ├── layout/
│   │   ├── AuthProvider.tsx
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── property/
│   │   ├── PropertyCard.tsx
│   │   ├── PropertyForm.tsx
│   │   ├── PropertyDetailActions.tsx
│   │   ├── ImageGallery.tsx
│   │   ├── ImageUploader.tsx
│   │   └── SearchFilters.tsx
│   └── maps/
│       └── PropertyMap.tsx
├── lib/
│   ├── supabase-browser.ts     # Client-side Supabase
│   ├── supabase-server.ts      # Server-side Supabase
│   ├── stripe.ts               # Stripe config
│   ├── store.ts                # Zustand auth store
│   └── utils.ts                # Utility functions
├── types/
│   └── index.ts                # TypeScript types
├── styles/
│   └── globals.css             # Global styles + Tailwind
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql  # Database schema
└── middleware.ts                # Auth middleware
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- A Supabase account (free tier works)
- A Stripe account (test mode)
- A Google Cloud account (Maps API)

### 1. Clone and Install

```bash
git clone <repository-url>
cd homestead
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/migrations/001_initial_schema.sql`
3. Go to **Settings > API** and copy your:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - Anon public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Service role key → `SUPABASE_SERVICE_ROLE_KEY`

4. Go to **Authentication > Settings**:
   - Enable Email provider
   - Set Site URL to `http://localhost:3000`
   - Add `http://localhost:3000/api/auth/callback` to Redirect URLs

5. Go to **Storage** and verify the `property-images` bucket was created (it's in the SQL migration). If not, create it manually and set it to **public**.

### 3. Set Up Stripe

1. Go to [stripe.com/dashboard](https://dashboard.stripe.com)
2. Copy your **test mode** keys:
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - Secret key → `STRIPE_SECRET_KEY`
3. Set up a webhook endpoint:
   - URL: `https://your-domain.com/api/payments/webhook`
   - Events: `checkout.session.completed`, `payment_intent.payment_failed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

For local development, use the Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### 4. Set Up Google Maps

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the **Maps JavaScript API** and **Places API**
3. Create an API key → `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`
4. Restrict the key to your domains for production

### 5. Configure Environment Variables

```bash
cp .env.example .env.local
```

Fill in all values in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...

NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Homestead
```

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 7. Create an Admin User

1. Sign up with an email
2. Go to Supabase **Table Editor > users**
3. Find your user and change `role` to `admin`
4. Refresh the app

---

## Database Schema

### Tables

| Table | Description |
|-------|------------|
| `users` | User profiles (synced from auth.users) |
| `properties` | Property listings |
| `property_images` | Images for each property |
| `payments` | Stripe payment records |
| `saved_properties` | User-saved/favorited properties |

### Key Features
- **Row Level Security (RLS)** on all tables
- **Automatic user profile creation** via trigger on auth.users
- **Auto-updated timestamps** via trigger
- **Indexes** on all frequently queried columns
- **Storage bucket** for property images with RLS policies

---

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import to [vercel.com](https://vercel.com)
3. Add all environment variables in Vercel dashboard
4. Deploy

Vercel will automatically detect Next.js and configure the build.

### Docker / Self-hosted

```bash
# Build
npm run build

# Start
npm start
```

Set `PORT` environment variable if needed (default: 3000).

### Post-deployment Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` to production URL
- [ ] Update Supabase redirect URLs to production domain
- [ ] Set up Stripe webhook for production URL
- [ ] Restrict Google Maps API key to production domain
- [ ] Create admin user in production database

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-only) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Yes | Stripe secret key (server-only) |
| `STRIPE_WEBHOOK_SECRET` | Yes | Stripe webhook signing secret |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Yes | Google Maps API key |
| `NEXT_PUBLIC_APP_URL` | Yes | Application base URL |
| `NEXT_PUBLIC_APP_NAME` | No | App display name (default: Homestead) |

---

## License

MIT
