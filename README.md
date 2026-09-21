# VELORA — Premium Sri Lankan Fashion & Lifestyle E-Commerce Store

A full-featured e-commerce storefront with WhatsApp ordering, secure admin dashboard, server-side order creation, SEO/OG tags, and island-wide delivery management.

**Tech Stack:** React 19 + TypeScript + Vite + Tailwind v4 (frontend) · Cloudflare Workers (API/SSR) · Supabase (PostgreSQL + media storage)

---

## Prerequisites

| Service | Purpose | Sign up |
|---------|---------|---------|
| **GitHub** | Code hosting + CI/CD | [github.com](https://github.com) |
| **Cloudflare** | Workers hosting (API + static assets) | [dash.cloudflare.com](https://dash.cloudflare.com) |
| **Supabase** | PostgreSQL database + storage | [supabase.com](https://supabase.com) |

You also need **Node.js 20+** and **npm** installed locally.

---

## 1. Local Development

```bash
# Clone your repo
git clone https://github.com/<your-username>/velora-storefront.git
cd velora-storefront

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# → Fill in your Supabase keys (see step 2)

# Start dev server
npm run dev
# → http://localhost:3000
```

---

## 2. Supabase Database Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run these files in order:
   - `supabase/migrations/001_initial_schema.sql` — creates all tables, RLS policies, stored procedures
   - `supabase/seed.sql` — seeds default settings, categories, and demo data
3. Go to **Project Settings → API** and collect:
   - **Project URL** → this is your `SUPABASE_URL` / `VITE_SUPABASE_URL`
   - **anon public key** → this is your `VITE_SUPABASE_ANON_KEY`
   - **service_role key** → this is your `SUPABASE_SERVICE_ROLE_KEY` (KEEP SECRET!)

4. Create a `.env` file locally:
```env
# Frontend (public, safe for browser)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_SITE_URL=https://velora-storefront.<your-subdomain>.workers.dev

# Backend (NEVER expose to browser)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SITE_URL=https://velora-storefront.<your-subdomain>.workers.dev
```

5. Set yourself as admin — run in Supabase SQL Editor:
```sql
INSERT INTO public.admin_roles (user_id, role)
VALUES ('<your-supabase-auth-user-uuid>', 'admin');
```
The admin email/password is managed by Supabase Auth. Add the Supabase Auth user UUID to `public.admin_roles`; do not store admin credentials in frontend source code.

---

## 3. Cloudflare Setup

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Go to **Workers & Pages → Create application → Worker**
3. Name it `velora-storefront`
4. Go to **Account Home → Manage API Tokens → Create Token**
5. Use the **"Edit Cloudflare Workers"** template
6. Copy the **API Token** and **Account ID** — you'll need these for GitHub

---

## 4. GitHub Repository Setup

1. Create a new repository on GitHub (e.g. `velora-storefront`)
2. Push your code:
```bash
cd velora-storefront
git init
git add .
git commit -m "Initial commit: VELORA storefront"
git branch -M main
git remote add origin https://github.com/<your-username>/velora-storefront.git
git push -u origin main
```

3. Go to **Repository Settings → Secrets and variables → Actions → New repository secret**
   Add these secrets:

| Secret Name | Value |
|-------------|-------|
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token (from step 3) |
| `CLOUDFLARE_ACCOUNT_ID` | Your Cloudflare Account ID |
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `VITE_SITE_URL` | Your worker URL (e.g. `https://velora-storefront.<subdomain>.workers.dev`) |
| `SUPABASE_URL` | Your Supabase project URL (same as VITE_SUPABASE_URL) |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |

4. Push to `main` — GitHub Actions will automatically:
   - Install dependencies
   - Build the frontend with your env vars
   - Deploy the Worker + static assets to Cloudflare
   - Sync Supabase secrets to the Worker

5. Monitor the deploy at **Actions** tab in your GitHub repo.

---

## 5. Cloudflare Worker Secrets (Alternative to GitHub)

If you prefer to set secrets manually instead of via GitHub Actions:

```bash
# Install wrangler globally (optional)
npm install -g wrangler

# Login to Cloudflare
npx wrangler login

# Set secrets (one-time)
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# Deploy manually
npm run deploy
```

---

## 6. Custom Domain (Optional)

To use your own domain (e.g. `velora.lk`):

1. Add your domain to Cloudflare (if not already there)
2. Go to **Workers → velora-storefront → Settings → Triggers → Custom Domains**
3. Add your domain (e.g. `velora.lk`)
4. Update `SITE_URL` in `wrangler.toml` and `VITE_SITE_URL` in GitHub secrets

---

## Environment Variables Reference

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_SUPABASE_URL` | GitHub Secret (build-time) | Supabase project URL — inlined into frontend bundle |
| `VITE_SUPABASE_ANON_KEY` | GitHub Secret (build-time) | Supabase anon public key — inlined into frontend bundle |
| `VITE_SITE_URL` | GitHub Secret (build-time) | Your site URL for SEO/meta tags |
| `SUPABASE_URL` | GitHub Secret → Worker Secret | Supabase project URL — used server-side by Worker |
| `SUPABASE_SERVICE_ROLE_KEY` | GitHub Secret → Worker Secret | Supabase service role key — used for admin DB operations |
| `SITE_URL` | `wrangler.toml` `[vars]` | Your site URL — used for sitemaps & OG tags |

---

## NPM Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start local dev server (port 3000) |
| `npm run build` | Build production frontend to `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build + deploy to Cloudflare Workers |
| `npm run deploy:dry` | Build + dry-run deploy (no actual deploy) |
| `npm run typecheck` | TypeScript type checking |
| `npm run clean` | Remove `dist/` and `server.js` |

---

## Project Structure

```
velora-storefront/
├── .github/workflows/
│   └── deploy.yml              # GitHub Actions CI/CD
├── public/                      # Static assets (logos, favicon)
├── src/
│   ├── components/              # React components
│   │   ├── admin/              # Admin: invoices, shipping labels, image upload
│   │   ├── auth/               # Google sign-in
│   │   ├── cart/               # Cart drawer
│   │   ├── common/             # Search, logo
│   │   ├── layout/             # Header, Footer
│   │   ├── product/            # Product card
│   │   └── ui/                 # Toast notifications
│   ├── context/                # Auth & Cart React contexts
│   ├── lib/                    # Store API, Supabase client, helpers
│   ├── pages/                  # Home, Collection, Product, Checkout, Admin
│   ├── types/                  # TypeScript type definitions
│   ├── App.tsx                 # Main app with routing
│   ├── main.tsx                # React entry point
│   └── index.css              # Global styles (Tailwind)
├── supabase/
│   ├── migrations/             # Database schema SQL
│   └── seed.sql                # Seed data
├── worker/
│   └── index.ts                # Cloudflare Worker (API, SEO, SPA serving)
├── .env.example                # Environment variable template
├── .gitignore
├── index.html                  # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── wrangler.toml               # Cloudflare Workers config
```

---

## API Endpoints (Cloudflare Worker)

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/orders` | Create order with server-side price re-check |
| `GET` | `/api/settings` | Fetch public site settings |
| `GET` | `/robots.txt` | Dynamic robots.txt |
| `GET` | `/sitemap.xml` | Dynamic sitemap |
| `GET` | `/product/:slug` | Social crawler OG tags (WhatsApp/Facebook previews) |

---

## Notes

- The app falls back to **localStorage demo data** when Supabase isn't configured, so you can preview locally without a database.
- Admin dashboard is at `/admin` — requires Supabase Auth email/password + admin role.
- Google sign-in is customer-only and is not accepted by the admin portal.
- Update `SITE_URL` in `wrangler.toml` to match your domain.
