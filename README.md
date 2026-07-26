# Jeevikaa Couture — Luxury Women's Fashion E-commerce

A premium production-grade e-commerce platform built for **Jeevikaa Couture**, an Indian women's ethnic-fashion brand (sarees, lehengas, kurtis, gowns, suits, co-ord sets, and more).

![Playfair Display](https://img.shields.io/badge/font-Playfair%20Display-C2185B) ![Next.js 15](https://img.shields.io/badge/Next.js-15-black) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E) ![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

---

## ✨ Features

### Customer storefront
- **Luxury home page** — auto-playing hero slider, featured categories, trending pieces, hot deals, new arrivals, best sellers, testimonials, newsletter
- **Shop** — category tabs, live search, sort (newest / popular / price)
- **Product detail** — image gallery + zoom, colour/size pickers, quantity, wishlist, PIN-code delivery check, related products
- **Cart, Wishlist** — persisted to `localStorage`
- **Checkout** — guest checkout with COD **or** UPI/QR (dynamic QR + UTR capture)
- **Order tracking** — `JC{YYYYMMDD}{NNNN}` order IDs, animated status timeline (placed → confirmed → processing → packed → shipped → out-for-delivery → delivered)
- **Order-success page** with copy-to-clipboard order ID
- Sticky animated navbar, luxury magenta/gold palette, Playfair Display + Poppins fonts, framer-motion micro-interactions, floating WhatsApp/Call buttons

### Admin panel (`/admin`)
- **Dashboard** — 8 KPI cards (today's revenue, total revenue, pending, delivered, products, categories…) + recent orders table
- **Orders** — live search by order ID / name / phone / email, status filter dropdown, one-click status transitions, full status history timeline, one-click QR-payment approve/reject
- **Products** — add / edit / delete with images (multi-URL), colours, sizes, flags (trending / featured / best-seller / new-arrival / hot-deal)
- **Categories** — add / edit / delete with live thumbnail preview
- **Payment Settings** — admin-editable UPI ID, merchant name, support phone, custom QR image (upload from device or paste URL), optional payment instructions — with live customer preview
- **Auth** — custom JWT (HS256 + PBKDF2 password hash)

### Backend
- Single catch-all Next.js API route at `/api/[[...path]]/route.js`
- Supabase PostgreSQL storage (10 tables: `categories`, `products`, `orders`, `admins`, `testimonials`, `newsletter`, `settings`, `wishlist`, `reviews`, `coupons`)
- Auto-seeds 6 categories, 8 curated products, 4 testimonials, and 1 super admin on first API hit
- Nodemailer-ready email templates (currently log to console until SMTP is wired)

---

## 🚀 Getting started

### 1. Clone & install
```bash
git clone https://github.com/0000aditya0000/jeevika.git
cd jeevika
yarn install
```

### 2. Set up Supabase
1. Create a project at [supabase.com](https://supabase.com/dashboard).
2. Open **SQL Editor** and paste the contents of [`supabase/schema.sql`](supabase/schema.sql). Run it.
3. Grab your project URL, `anon` key, and `service_role` key from **Settings → API**.

### 3. Configure environment
```bash
cp .env.example .env
```
Edit `.env` and fill in:
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `JWT_SECRET` — any long random string (e.g. `openssl rand -base64 48`)
- (Optional) `SMTP_*` — Gmail App Password for real order emails

### 4. Run in development
```bash
yarn dev
```
Visit http://localhost:3000

### 5. First admin login
On first API call, the app auto-seeds a super admin:
- **URL:** http://localhost:3000/admin
- **Email:** `admin@jeevikaacouture.com`
- **Password:** `Jeevikaa@2025` *(change immediately after first login in production)*

---

## 🗄️ Database

All schema lives in [`supabase/schema.sql`](supabase/schema.sql). Key tables:

| Table | Purpose |
|-------|---------|
| `categories` | Sarees, Lehengas, Kurtis… |
| `products` | Full product catalogue with JSONB colours/sizes/images/tags |
| `orders` | Customer orders + JSONB items, statusHistory, JSONB customer info |
| `admins` | Admin users (PBKDF2 password hashes) |
| `testimonials` | Homepage social-proof |
| `settings` | Key/value store (payment config, seed flag, etc.) |
| `newsletter` | Email subscribers |

---

## 🔑 API reference (short)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | — | Service ping |
| GET | `/api/categories` | — | List active categories |
| POST, PUT, DELETE | `/api/categories[/:id]` | admin | Manage categories |
| GET | `/api/products?q=&category=&filter=&sort=&limit=` | — | Search & filter products |
| GET | `/api/products/:slug` | — | Product + related |
| POST, PUT, DELETE | `/api/products[/:id]` | admin | Manage products |
| GET | `/api/testimonials` | — | Homepage testimonials |
| POST | `/api/orders` | — | Place order (COD or QR + UTR) |
| GET | `/api/orders/track/:orderId` | — | Customer tracking |
| GET | `/api/orders` | admin | List all orders |
| PATCH | `/api/orders/:id` | admin | Update status / payment status |
| POST | `/api/admin/login` | — | Returns JWT |
| GET | `/api/admin/stats` | admin | Dashboard KPIs |
| GET | `/api/settings/:key` | — | Public read |
| PUT | `/api/settings/:key` | admin | Save settings (payment config, etc.) |
| POST | `/api/newsletter` | — | Subscribe |

---

## 🖼️ Tech stack

- **Framework:** Next.js 15 (App Router) + React 18
- **UI:** Tailwind CSS + shadcn/ui + framer-motion + embla-carousel + lucide-react
- **DB:** Supabase PostgreSQL (via `@supabase/supabase-js`)
- **Auth:** Custom HS256 JWT + PBKDF2/SHA-512 password hashing (`node:crypto`)
- **Email:** Nodemailer-compatible template layer (SMTP via env vars)
- **State:** React Context (Cart + Wishlist), `localStorage`-backed
- **Fonts:** Playfair Display (display) + Poppins (body) via `next/font/google`

---

## 🚀 Deploying to Vercel

1. Push this repo to GitHub (already done!).
2. Go to [vercel.com/new](https://vercel.com/new) and import `0000aditya0000/jeevika`.
3. In **Environment Variables**, add every non-comment line from `.env.example` with your real values.
4. Click **Deploy**. Done in ~2 minutes.
5. Optional: attach a custom domain (e.g. `jeevikaacouture.com`) in Vercel → Settings → Domains.

---

## ⚖️ License

Built for Jeevikaa Couture. All rights reserved.
