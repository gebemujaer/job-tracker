# Deployment Guide — Job Tracker

## What you need
- A free Supabase account (supabase.com)
- A free Vercel account (vercel.com)
- A GitHub account (github.com)
- Node.js installed on your computer (nodejs.org)

---

## Step 1 — Set up Supabase (5 minutes)

1. Go to supabase.com → Sign up (free)
2. Click "New project" → give it a name (e.g. "job-tracker") → set a password → Create
3. Wait ~2 minutes for it to provision
4. Go to SQL Editor (left sidebar) → New query
5. Copy the entire contents of `supabase_schema.sql` → paste → click Run
6. Go to Storage (left sidebar) → New bucket
   - Name: `docs`
   - Toggle "Public bucket" ON
   - Click Create
7. Go to Project Settings → API
   - Copy "Project URL" → this is your VITE_SUPABASE_URL
   - Copy "anon / public" key → this is your VITE_SUPABASE_ANON_KEY

---

## Step 2 — Set up the project locally (2 minutes)

1. Open terminal in the project folder
2. Create a `.env` file (copy from `.env.example`):
   ```
   VITE_SUPABASE_URL=https://xxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Test it locally:
   ```
   npm run dev
   ```
5. Open http://localhost:5173 — you should see the sign in page

---

## Step 3 — Deploy to Vercel (3 minutes)

1. Push the project to a GitHub repo:
   ```
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/job-tracker.git
   git push -u origin main
   ```
2. Go to vercel.com → Sign up with GitHub
3. Click "Add New Project" → import your job-tracker repo
4. Before deploying, add Environment Variables:
   - VITE_SUPABASE_URL → your value
   - VITE_SUPABASE_ANON_KEY → your value
5. Click Deploy
6. Vercel gives you a URL like `job-tracker-abc123.vercel.app`

---

## Step 4 — Share with your partner

1. Send her the Vercel URL
2. She goes to the URL → clicks "Sign up" → creates her own account
3. Once she's signed up, you can both see each other in "Partner's View"

---

## Troubleshooting

**"Cannot read properties of undefined" on load**
→ Check your .env file has the correct Supabase URL and key (no extra spaces)

**File upload fails**
→ Make sure the "docs" storage bucket exists in Supabase and is set to Public

**Partner's view shows no users**
→ Your partner needs to sign up first. Their profile appears once they've created an account.

**Auth emails not arriving**
→ Check spam. Supabase sends from noreply@mail.supabase.io
→ Alternatively, go to Supabase → Authentication → Email Templates and disable email confirmation for faster testing

---

## Custom domain (optional)

In Vercel → your project → Settings → Domains → add your own domain if you have one.
Otherwise the vercel.app URL works fine on both mobile and desktop.
