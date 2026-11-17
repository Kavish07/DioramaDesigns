# Diorama Designs

A personal, single-owner gallery for browsing AI-generated 3D diorama scenes across LEGO builds, Gundam (Gunpla) kits, and car miniatures. No accounts, sharing, or community uploads — see `CLAUDE.md` and `docs/ADR-001 Diorama Designs — Architecture.pdf` for the full architecture and roadmap.

## Stack

Next.js (App Router, TypeScript), Tailwind, Supabase (Postgres + Auth), deployed as a single-owner app gated by one allowed email.

## Setup

1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL/anon key and `OWNER_EMAIL`.
3. Local development needs Docker running, then:

   ```sh
   supabase start
   supabase db reset   # applies migrations + supabase/seed.sql
   npm run dev
   ```

4. To work against your real Supabase project instead: `supabase login`, `supabase link --project-ref <ref>`, `supabase db push`, then point `.env.local` at that project's URL/anon key. In the Supabase dashboard, add `<your-site-url>/auth/callback` under Authentication → URL Configuration, or magic-link sign-in will silently fail.

## Commands

- `npm run dev` / `npm run build` / `npm start` / `npm run lint`
- `supabase start` / `supabase stop` — local Postgres+Auth+Studio via Docker
- `supabase db reset` — reapplies all migrations + `supabase/seed.sql` locally
- `supabase migration new <name>` — new timestamped migration
- `supabase db push` — apply local migrations to the linked remote
- `supabase gen types typescript --local > src/types/database.ts` — regenerate typed bindings after any schema change

Next.js 16 note: Cache Components (`cacheComponents`) is intentionally off in `next.config.ts` — see the comment there. `middleware.ts` is `src/proxy.ts` in this Next version.
