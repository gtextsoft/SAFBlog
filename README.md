# SAF Blog

Editorial blog and CMS for the **Stephen Akintayo Foundation**, built with **Next.js 16** (App Router), Supabase, and Resend.

## Stack

- **Next.js 16** + React 19 + TypeScript
- **Supabase** (Postgres, Auth, Storage, RLS)
- **Tailwind CSS** + Radix / shadcn-style primitives
- **Resend** (newsletter + contact)
- **Stripe** (optional donations)
- **Plausible** (optional analytics)

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint on `src` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run test:token` | Newsletter HMAC token unit tests |
| `npm run test:search` | Search-term escape unit tests |

## Setup

1. Copy `.env.example` → `.env.local` and fill values.
2. Apply Supabase migrations (`supabase/migrations`).
3. `npm install && npm run dev`.

## Environment

See `.env.example` for the full list. Key groups:

- **Supabase**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **Site**: `NEXT_PUBLIC_SITE_URL`
- **Email**: `RESEND_API_KEY`, `RESEND_FROM_*`, `NEWSLETTER_TOKEN_SECRET`
- **Ops**: `REVALIDATE_SECRET`, `CRON_SECRET`
- **Optional**: `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`, `STRIPE_*`, `SENTRY_DSN`

## Architecture (brief)

```
src/app/                  App Router pages (public + /admin)
src/components/           UI (site, blog, admin, newsletter)
src/lib/queries/          Server-only data access
src/lib/supabase/         Public / cookie / service clients
src/proxy.ts              Session refresh + /admin gate (Next 16 proxy)
supabase/migrations/      Schema + RLS
```

- Public pages use the **anon** client (cache-friendly); admin uses the **cookie** client under RLS.
- Service role is reserved for newsletter confirm, view counters, Stripe webhook inserts, and similar server-only writes.
- Staff roles: `admin` (full) and `editor` (content). Admin-only: subscribers, newsletter, users, donations.

## Sentry

`SENTRY_DSN` is reserved for a future `@sentry/nextjs` install. `src/instrumentation.ts` is a no-op until the SDK is wired.

## Deploy

Deploy on Vercel (or any Node host). Point `NEXT_PUBLIC_SITE_URL` at the production origin. Configure Stripe webhook → `/api/stripe/webhook` and Supabase revalidate → `/api/revalidate`.
