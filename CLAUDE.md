# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server on localhost:3000
npm run build    # Production build (requires .env.local with real or placeholder values)
npm run lint     # ESLint check
```

## Stack

- **Next.js 14** App Router + TypeScript
- **Supabase** — DB, Auth, Storage (via `@supabase/ssr`)
- **MercadoPago Checkout Bricks** — Argentine payments (`@mercadopago/sdk-react` + `mercadopago`)
- **PayPal Advanced Card Fields** — International payments (`@paypal/react-paypal-js`)
- **TipTap v2** — Rich text editor for course lessons
- **Tailwind CSS** + Radix UI primitives

## Architecture

### Route groups
- `app/(public)/` — Unauthenticated pages: `/login`, `/courses/[slug]`
- `app/(auth)/` — Auth-required pages: `/dashboard`, `/courses/[slug]/[lessonId]`
- `app/admin/` — Admin-only panel with sidebar layout (`admin/layout.tsx` enforces role check)
- `app/api/` — Route handlers for auth callback, geo detection, MP/PayPal payments, and admin actions

### Supabase clients
- `lib/supabase/client.ts` — `createBrowserClient()` for Client Components
- `lib/supabase/server.ts` — `createServerClient()` for Server Components/Route Handlers; `createAdminClient()` uses the service role key (bypasses RLS) for payment webhooks and admin grant/revoke

### Payment flow
1. User clicks "Comprar" → `PaymentModal` opens
2. `useGeo()` hook calls `/api/geo` which reads `x-vercel-ip-country` header (or `NEXT_PUBLIC_DEV_PAYMENT_PROVIDER` locally)
3. Argentina IP → `MercadoPagoForm` (dynamic import, ssr:false); Other → `PayPalForm`
4. Server creates a `purchases` row with `status='pending'` before returning the preference/order ID
5. On success: MP webhook or PayPal capture endpoint sets `status='completed'` + `granted_at`

### Access control
- **Middleware** (`middleware.ts`): session refresh + redirects — `/dashboard` and `/admin/*` require auth; `/admin/*` requires `role='admin'`
- **RLS policies**: lessons are gated by purchase status; admin role bypasses all restrictions via the `is_admin()` SQL function
- Lesson content is stored as TipTap JSON in `lessons.content` (JSONB); rendered server-side with `generateHTML()` from `@tiptap/core`

### Admin panel
- All admin pages under `app/admin/` share `app/admin/layout.tsx` which does a server-side role check
- `CurriculumBuilder` component handles module/lesson CRUD with inline TipTap editor
- Images upload to Supabase Storage bucket `media` (public); URL stored directly in DB fields

## Supabase setup (required before first deploy)
Run the SQL in the plan file at `C:\Users\andre\.claude\plans\modular-cuddling-scroll.md` (Fase 2) in the Supabase SQL editor. Create a `media` bucket (public) in Storage. Assign admin role with:
```sql
UPDATE public.profiles SET role = 'admin' WHERE email = 'tu@email.com';
```

## Environment variables
See `.env.example` for all required keys. Real values go in `.env.local` (gitignored) and in Vercel dashboard.
