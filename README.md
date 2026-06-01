# Viaja 🌴

**Planeador de viajes en grupo** — presupuesto en vivo, votación de opciones con estrellas e
ideas en un solo lugar. Roles de **anfitrión** (decide) y **invitado** (vota).

Production rebuild of the prototype (now in [`legacy/`](./legacy)) using **Next.js + Supabase**,
deployed on **Vercel**.

## Stack
- **Next.js 15** (App Router) + **TypeScript** + **React 19**
- **Supabase** — Postgres, Auth (Google + email magic link), Realtime, Storage
- **Zustand** for client state; ported design system in `app/globals.css` (no Tailwind)
- **PWA** — installable, standalone, theme `#11BFB2`

## Run locally

```bash
npm install
npm run dev        # http://localhost:3000
```

With **no Supabase env**, the app runs in **demo mode**: an in-memory dataset (the Puerto
Escondido demo) so every screen works without a backend. Great for design review.

## Connect Supabase (real, persistent, multi-user)

1. Create a project at [supabase.com](https://supabase.com).
2. Run the migrations **in order** (SQL editor, or `supabase db push`):
   - `supabase/migrations/0001_schema.sql` — tables, enums, indexes, winner trigger, RLS
   - `supabase/migrations/0002_seed_demo.sql` — `seed_demo_for()` + signup trigger (new users get the demo)
   - `supabase/migrations/0003_storage.sql` — `covers` + `option-photos` buckets & policies
   - `supabase/migrations/0004_realtime.sql` — enable Realtime on app tables
3. **Auth → Providers**: enable **Email** (magic link) and, optionally, **Google** (add OAuth client id/secret).
4. **Auth → URL Configuration**: add `http://localhost:3000` and your Vercel domain to redirect allow-list.
5. Copy `.env.local.example` → `.env.local` and fill:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...        # server-only
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

`npm run dev` now uses Supabase: sign in, and your account is seeded with the demo trips. Open
two browsers to see **realtime** voting/budget update live.

## Deploy to Vercel
- Import the repo (root directory). Framework: Next.js.
- Add the four env vars above (use the production domain for `NEXT_PUBLIC_SITE_URL`).
- Add that domain to Supabase Auth redirect URLs.

## How it works
- **Budget engine** (`lib/budget.ts`) recomputes per-person cost from winning options + people count.
- **Winners**: `hospedaje/transporte/comida` are single-choice (DB trigger clears siblings);
  `actividades` allows multiple.
- **Roles**: enforced by Postgres **RLS** (`lib/`/`supabase/migrations`). Hosts decide & convert;
  members vote. Hosts can "preview as guest".
- **Realtime**: the client subscribes to changes and re-fetches the (small) dataset to stay in sync.
- **Data layer** branches on env: Supabase when configured, in-memory demo otherwise
  (`lib/store.ts`, `lib/supabase/*`).

## Structure
```
app/            routes (/, /login, /auth, /join, /trip/[id]/{,options,budget,ideas,plan,guests})
components/     UI primitives (components/ui) + screens' shared pieces + sheets
lib/            budget, types, seed, store, hooks, dates, supabase client/server/queries/adapter/live
store/          ephemeral UI state (toast, confetti, sheets, preview-as-guest)
supabase/       SQL migrations (schema, RLS, seed, storage, realtime)
legacy/         original HTML/Babel prototype (design reference)
```
