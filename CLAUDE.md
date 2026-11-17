# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project status

Phase 1 scaffold is in place: Next.js (App Router, TypeScript, Tailwind) wired to Supabase, with the initial schema/RLS, single-owner auth gate, and a baseline gallery page. Real image generation is wired up (OpenAI `gpt-image-1` behind the adapter interface, images stored in a public Supabase Storage bucket, a minimal customiser form at `/customiser` triggers it) — capped at 4 variations per request, no monthly spend cap yet. Still deferred: a second provider, R2/CDN image hosting (Supabase Storage is the interim host), pgvector similarity, the background jobs system (OpenAI's endpoint is synchronous so none was needed yet), monthly spend cap enforcement, and the Remix action (see the data model and constraints below).

Next.js 16 note: `cacheComponents` is intentionally **off** in `next.config.ts` (classic rendering model) — enabling it requires wrapping every session/DB read in `<Suspense>`, which isn't worth it for a single-owner app. `middleware.ts` is also renamed to `proxy.ts` in this Next version.

## Commands

- `npm run dev` / `npm run build` / `npm start` / `npm run lint`
- `supabase start` / `supabase stop` — local Postgres+Auth+Studio via Docker
- `supabase db reset` — reapplies all migrations + `supabase/seed.sql` locally
- `supabase migration new <name>` — new timestamped migration
- `supabase db push` — apply local migrations to the linked remote (after `supabase login` + `supabase link`)
- `supabase gen types typescript --local > src/types/database.ts` — regenerate typed bindings after any schema change (replaces the hand-written stub)

## What this is

Diorama Designs is a personal, single-owner inspiration board for browsing AI-generated 3D diorama scenes across three hobbies: LEGO builds, Gundam (Gunpla) kits, and car miniatures. There are no user accounts, sharing, or community uploads — one owner browses/filters a gallery and uses a prompt customiser to generate new diorama concepts.

## Architecture (from ADR-001)

**Phase 1 — image gallery and customiser:**
- Frontend: Next.js (React, App Router), server-rendered gallery pages, Tailwind.
- Database: Postgres (Supabase or Neon). Filter fields are indexed columns; free-form tags live in JSONB.
- Image storage: S3-compatible object storage (Cloudflare R2) behind an image CDN serving resized WebP/AVIF thumbnails.
- Generation: a server-side adapter with one interface across image providers (OpenAI, Google, Flux-family via Replicate/fal). API keys must never reach the browser — never call image generation APIs directly from client code.
- Jobs: generation runs as background jobs (Inngest, Trigger.dev, or a Postgres job table); UI polls/subscribes for results.
- Similarity: image embeddings stored via pgvector drive "more like this".
- Access: single owner login (Supabase Auth or Auth.js, one allowed email). No roles/user tables/moderation — don't add them. Gallery can be public-read-only or fully private via one env flag; the customiser and all writes always require owner login.

**Phase 2 — interactive 3D** (later, featured pieces only): image-to-3D or photogrammetry/Gaussian-splat captures, stored as glTF/GLB or .splat, rendered with react-three-fiber or `<model-viewer>`.

## Data model

- **Diorama record**: id, title, category, scale, theme, pov, realism, era, tags (JSONB), prompt, negative_prompt, model, seed, images (one per angle), model_3d_url (optional), embedding, source (generated|own photo), is_favourite, notes, created_at.
- **Board record**: id, name, description, ordered list of diorama ids (many-to-many).
- Scale options depend on category (LEGO/Gundam/Cars each have their own scale set) — the scale filter must be re-derived whenever category changes.
- Themes and tags live in a lookup table, not hard-coded enums, so new ones don't require a release.
- Every generated image must persist the prompt, negative prompt, model, and seed used to make it (reproducibility requirement).

## Prompt customiser

Filter choices (category, scale, theme, pov, realism, era) plus free-text extra details map through a tested phrase table into this template:

```
A {scale} {category} diorama of a {theme} scene set in the {era}, {realism}, seen from {pov}. Tabletop miniature photography, shallow depth of field, soft studio lighting, on a display base. {extra details}
```

A default negative prompt filters blurry/distorted/text/logo/watermark issues. The built prompt is shown editable; an Advanced panel exposes model, aspect ratio, seed, and variation count. The phrase map and template are versioned data (not inline code) so old images stay reproducible after the template changes. Any gallery piece has a Remix action that reloads its saved settings/prompt into the customiser.

## Constraints to respect

- Don't add multi-user features (sign-up, roles, sharing, moderation) — explicitly out of scope for this single-owner app.
- Keep the image-provider integration behind the adapter interface; don't hard-code a single provider.
- Respect the monthly spend cap / per-job variation limit when implementing generation (cost-control requirement).
- If gallery is public-facing, use non-trademark wording ("brick-built", "mecha model kit" rather than LEGO/Gundam as product claims) and keep a non-affiliation notice — see ADR risks section.

## Open questions (unresolved as of ADR-001)

- Public read-only gallery vs. fully private.
- Whether photos of real hand-built dioramas appear alongside generated ones (would need an "own build" label).
- Monthly budget for generation and hosting.
