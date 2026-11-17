# Diorama Designs

A personal, single-owner inspiration board for browsing AI-generated 3D diorama scenes across three hobbies: LEGO builds, Gundam (Gunpla) kits, and car miniatures. No user accounts, sharing, or community uploads — one owner browses/filters a gallery and (eventually) uses a prompt customiser to generate new diorama concepts.

See `CLAUDE.md` for full architecture notes and constraints.

## Stack

- Next.js 16 (App Router, TypeScript, Tailwind CSS v4)
- Supabase (Postgres + Auth), with Row-Level Security gating every table to a single owner email
- Owner-only magic-link auth — no roles, no public write access

## Getting started

```bash
npm install
supabase start      # local Postgres + Auth + Studio via Docker
supabase db reset   # apply migrations + supabase/seed.sql
npm run dev
```

The app runs at `http://localhost:3000`. Local Supabase Studio is at `http://127.0.0.1:54323`, and local email (magic links) at `http://127.0.0.1:54324`.

Copy `.env.local.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — from `supabase start` output (local) or your Supabase project settings (remote)
- `OWNER_EMAIL` — the single email allowed to sign in
- `NEXT_PUBLIC_GALLERY_PUBLIC` — `true`/`false`; gallery reads are still gated by RLS regardless of this flag (see below)

## Commands

- `npm run dev` / `npm run build` / `npm start` / `npm run lint`
- `supabase start` / `supabase stop` — local Postgres+Auth+Studio via Docker
- `supabase db reset` — reapplies all migrations + `supabase/seed.sql` locally
- `supabase migration new <name>` — new timestamped migration
- `supabase db push --remote` — apply local migrations to the linked remote project (after `supabase login` + `supabase link`)
- `supabase gen types typescript --local > src/types/database.ts` — regenerate typed bindings after any schema change

## Current status

Phase 1 scaffold: gallery page with category/scale/theme filters, seeded sample dioramas, and owner-only magic-link login. The database is private via Row-Level Security — every table requires the authenticated owner session regardless of `NEXT_PUBLIC_GALLERY_PUBLIC`, so a public read-only gallery needs a dedicated RLS policy change (not yet built).

Deferred: real image generation, R2/CDN image hosting, pgvector similarity, background jobs, and the full prompt customiser UI.

## Deployment

Intended target is Vercel (connected to this GitHub repo), with production environment variables pointing at the hosted Supabase project. Add the deployed `/auth/callback` URL to the Supabase project's Authentication → URL Configuration once a deployment URL exists.
