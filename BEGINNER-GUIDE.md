# Homestead — Beginner's Deployment Guide
# From Zero to Live Website

This guide assumes you've never deployed a website before.
Follow each step in order. Don't skip ahead.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 1: INSTALL TOOLS ON YOUR COMPUTER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Step 1: Install Node.js

Node.js is what runs the app on your computer.

1. Go to https://nodejs.org
2. Download the "LTS" version (the big green button)
3. Run the installer — click Next through everything
4. To verify it worked, open your Terminal:
   - On Mac: open "Terminal" (search for it in Spotlight)
   - On Windows: open "Command Prompt" or "PowerShell"
5. Type this and press Enter:

   node --version

   You should see something like "v20.11.0". If you do, you're good!

### Step 2: Install Git

Git tracks your code and lets you push it to GitHub.

1. Go to https://git-scm.com/downloads
2. Download and install for your OS
3. Verify by typing in Terminal:

   git --version


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 2: SET UP YOUR PROJECT LOCALLY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Step 3: Extract and set up the project

1. Download the homestead-marketplace.tar.gz file (you already have this)
2. Extract it (double-click on Mac, use 7-Zip on Windows)
3. You should see a folder called "homestead"
4. Open Terminal and navigate to that folder:

   cd /path/to/homestead

   For example, if it's on your Desktop:
   - Mac:    cd ~/Desktop/homestead
   - Windows: cd C:\Users\YourName\Desktop\homestead

5. Install all the code dependencies:

   npm install

   This will take 1-2 minutes. You'll see a progress bar.
   Ignore any "warn" messages — those are normal.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 3: SET UP SUPABASE (Your Database)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Supabase stores all your data: users, properties, images, etc.

### Step 4: Create a Supabase account and project

1. Go to https://supabase.com
2. Click "Start your project" → Sign up with GitHub (easiest)
3. Once logged in, click "New Project"
4. Fill in:
   - Name: "homestead" (or anything you want)
   - Database Password: make up a strong password and SAVE IT somewhere
   - Region: pick the one closest to you
5. Click "Create new project"
6. Wait 1-2 minutes for it to set up

### Step 5: Get your Supabase keys

1. In your Supabase dashboard, click "Settings" (gear icon) in the left sidebar
2. Click "API" under Settings
3. You'll see two important things:
   - "Project URL" — copy this (looks like https://xxxxx.supabase.co)
   - "anon public" key — copy this (starts with "eyJ...")
   - "service_role" key — click "Reveal" and copy this too

   ⚠️ KEEP THE SERVICE_ROLE KEY SECRET. Never share it publicly.

### Step 6: Create your database tables

1. In Supabase, click "SQL Editor" in the left sidebar
2. Click "New query"
3. Open the file: supabase/migrations/001_initial_schema.sql
4. Copy ALL the text from that file
5. Paste it into the SQL Editor
6. Click "Run" (or press Ctrl+Enter / Cmd+Enter)
7. You should see "Success. No rows returned" — that's correct!

### Step 7: Set up Supabase Authentication

1. In Supabase, click "Authentication" in the left sidebar
2. Click "Providers" tab
3. Make sure "Email" is enabled (it should be by default)
4. Click "URL Configuration" tab
5. Set "Site URL" to: http://localhost:3000
6. Under "Redirect URLs", click "Add URL" and enter:
   http://localhost:3000/api/auth/callback
7. Click "Save"


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 4: SET UP STRIPE (Payments)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Stripe handles credit card payments securely.

### Step 8: Create a Stripe account

1. Go to https://stripe.com
2. Click "Start now" and create an account
3. You do NOT need to activate your account yet
   — "Test mode" works perfectly for development

### Step 9: Get your Stripe keys

1. In the Stripe Dashboard, make sure "Test mode" is toggled ON
   (you'll see an orange "TEST MODE" banner at the top)
2. Click "Developers" in the top menu
3. Click "API keys"
4. Copy:
   - "Publishable key" (starts with pk_test_...)
   - "Secret key" — click "Reveal" (starts with sk_test_...)

### Step 10: Set up Stripe Webhook (needed for production, optional for testing)

For now, you can skip this step and come back to it
when you deploy to Vercel. The webhook secret can be
a placeholder like "whsec_placeholder" during local dev.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 5: SET UP GOOGLE MAPS (Optional for now)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

The map feature is nice but the site works without it.
You can skip this and add it later if you want.

### Step 11: Get a Google Maps API key (optional)

1. Go to https://console.cloud.google.com
2. Create a new project (or use an existing one)
3. Go to "APIs & Services" → "Library"
4. Search for and enable:
   - "Maps JavaScript API"
   - "Places API"
5. Go to "APIs & Services" → "Credentials"
6. Click "Create Credentials" → "API Key"
7. Copy the key

If you skip this, the map just shows a "Map unavailable" message.
Everything else works fine.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 6: CONNECT EVERYTHING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Step 12: Create your .env.local file

This is the most important step! This file tells your
app how to connect to all the services.

1. In your homestead folder, find the file called ".env.example"
2. Make a COPY of it and rename the copy to ".env.local"
   - Mac Terminal:  cp .env.example .env.local
   - Windows:       copy .env.example .env.local
3. Open .env.local in any text editor (Notepad, VS Code, etc.)
4. Replace each placeholder with your real keys:

   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-actual-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-actual-service-role-key

   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-actual-key
   STRIPE_SECRET_KEY=sk_test_your-actual-key
   STRIPE_WEBHOOK_SECRET=whsec_placeholder

   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key-or-leave-blank

   NEXT_PUBLIC_APP_URL=http://localhost:3000
   NEXT_PUBLIC_APP_NAME=Homestead

5. Save the file

### Step 13: Test it locally!

1. In Terminal (make sure you're in the homestead folder), run:

   npm run dev

2. Open your browser and go to: http://localhost:3000
3. You should see the Homestead homepage! 🎉

### Step 14: Test the features

1. Click "Sign Up" and create an account (choose "Seller")
2. Go to Dashboard → New Listing → create a test property
3. Try searching and browsing
4. If everything works locally, you're ready to go live!

### Step 15: Make yourself an Admin (optional)

1. Go to Supabase Dashboard
2. Click "Table Editor" in the sidebar
3. Click on the "users" table
4. Find your user row
5. Click on the "role" cell and change it from "seller" to "admin"
6. Click "Save"
7. Refresh your app — you'll now see the Admin panel


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 7: DEPLOY TO VERCEL (Go Live!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Vercel hosts your website for free and makes it
accessible to anyone on the internet.

### Step 16: Push your code to GitHub

1. Go to https://github.com and create an account (or log in)
2. Click the "+" icon (top right) → "New repository"
3. Name it "homestead" (or whatever you want)
4. Keep it "Public" or "Private" (your choice)
5. Do NOT check any boxes (no README, no .gitignore)
6. Click "Create repository"
7. GitHub will show you commands. In your Terminal, run:

   git init
   git add .
   git commit -m "Initial commit - Homestead marketplace"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/homestead.git
   git push -u origin main

   Replace YOUR-USERNAME with your actual GitHub username.

### Step 17: Deploy on Vercel

1. Go to https://vercel.com
2. Click "Sign Up" → sign up with your GitHub account
3. Click "Add New Project"
4. It will show your GitHub repos — find "homestead" and click "Import"
5. On the configuration page:
   - Framework Preset: should auto-detect "Next.js" ✓
   - Root Directory: leave as "./" ✓

6. Click "Environment Variables" to expand that section
7. Add EACH of your environment variables one by one:
   - Click "Add", enter the name, paste the value
   - Do this for ALL of them:

     NEXT_PUBLIC_SUPABASE_URL         → your Supabase URL
     NEXT_PUBLIC_SUPABASE_ANON_KEY    → your anon key
     SUPABASE_SERVICE_ROLE_KEY        → your service role key
     NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → your Stripe publishable key
     STRIPE_SECRET_KEY                → your Stripe secret key
     STRIPE_WEBHOOK_SECRET            → whsec_placeholder (update later)
     NEXT_PUBLIC_GOOGLE_MAPS_API_KEY  → your Maps key (or leave empty)
     NEXT_PUBLIC_APP_URL              → leave blank for now (we'll update)
     NEXT_PUBLIC_APP_NAME             → Homestead

8. Click "Deploy"
9. Wait 2-3 minutes for it to build
10. Vercel will give you a URL like: https://homestead-abc123.vercel.app

🎉 YOUR SITE IS NOW LIVE ON THE INTERNET! 🎉

### Step 18: Update your URLs (important!)

Now that you have a live URL, you need to update a few things:

1. In Vercel:
   - Go to your project Settings → Environment Variables
   - Update NEXT_PUBLIC_APP_URL to your Vercel URL
     (e.g., https://homestead-abc123.vercel.app)
   - Click "Redeploy" in the Deployments tab

2. In Supabase:
   - Go to Authentication → URL Configuration
   - Add your Vercel URL to "Redirect URLs":
     https://homestead-abc123.vercel.app/api/auth/callback
   - Optionally update "Site URL" to your Vercel URL

3. In Stripe:
   - Go to Developers → Webhooks
   - Click "Add endpoint"
   - URL: https://homestead-abc123.vercel.app/api/payments/webhook
   - Select events: checkout.session.completed, payment_intent.payment_failed
   - Click "Add endpoint"
   - Copy the "Signing secret" (starts with whsec_)
   - Go back to Vercel and update STRIPE_WEBHOOK_SECRET
   - Redeploy

### Step 19: Add a custom domain (optional)

If you own a domain name (like homestead.com):

1. In Vercel, go to your project Settings → Domains
2. Type your domain and click "Add"
3. Vercel will show you DNS records to add
4. Go to your domain registrar (GoDaddy, Namecheap, etc.)
5. Add the DNS records Vercel tells you
6. Wait 5-30 minutes for DNS to propagate
7. Your site is now live at your custom domain!


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## PHASE 8: ADD DEMO DATA (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Step 20: Seed demo properties

To add sample listings so the site doesn't look empty:

1. First, sign up for an account on your live site
2. Then in Terminal (in the homestead folder), run:

   npm run db:seed

   This creates 6 sample property listings.


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## TROUBLESHOOTING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### "npm install" shows errors
→ Make sure Node.js is installed (node --version should work)
→ Delete the node_modules folder and try again

### Site loads but sign up doesn't work
→ Check your Supabase URL and keys in .env.local
→ Make sure the SQL migration ran successfully

### Payments don't work
→ Make sure you're using Stripe TEST keys (pk_test_ and sk_test_)
→ Use Stripe test card: 4242 4242 4242 4242, any future date, any CVC

### Map doesn't show
→ That's OK! It just means the Google Maps API key isn't set.
→ Everything else works without it.

### Vercel build fails
→ Check the build logs in Vercel for the specific error
→ Make sure ALL environment variables are added
→ Make sure there are no typos in the variable names

### "Module not found" errors
→ Run: npm install
→ If that doesn't work: rm -rf node_modules && npm install

### Need help?
→ Check the README.md file for technical details
→ Supabase docs: https://supabase.com/docs
→ Vercel docs: https://vercel.com/docs
→ Next.js docs: https://nextjs.org/docs


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## SUMMARY — WHAT YOU DID
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ Installed Node.js and Git
✅ Set up Supabase (database + auth + image storage)
✅ Set up Stripe (payments in test mode)
✅ Connected everything with environment variables
✅ Tested locally at localhost:3000
✅ Pushed code to GitHub
✅ Deployed to Vercel (your site is live!)
✅ Updated redirect URLs for production
✅ (Optional) Added custom domain
✅ (Optional) Seeded demo data

You now have a fully functional real estate marketplace
that anyone can access on the internet. Congratulations! 🏠
