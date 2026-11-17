create extension if not exists pgcrypto;

create table scales (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('lego', 'gundam', 'cars')),
  name text not null,
  sort_order int not null default 0,
  unique (category, name)
);

create table themes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table dioramas (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null check (category in ('lego', 'gundam', 'cars')),
  scale_id uuid references scales(id),
  theme_id uuid references themes(id),
  pov text,
  realism text,
  era text,
  tags jsonb not null default '[]'::jsonb,
  prompt text,
  negative_prompt text,
  model text,
  seed bigint,
  images jsonb not null default '[]'::jsonb,
  model_3d_url text,
  source text not null default 'generated' check (source in ('generated', 'own_photo')),
  is_favourite boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
  -- embedding column deferred: pgvector dimensionality is provider-dependent,
  -- add it in the similarity-search follow-up migration.
);

create index dioramas_category_idx on dioramas (category);
create index dioramas_scale_id_idx on dioramas (scale_id);
create index dioramas_theme_id_idx on dioramas (theme_id);
create index dioramas_era_idx on dioramas (era);
create index dioramas_is_favourite_idx on dioramas (is_favourite);
create index dioramas_created_at_idx on dioramas (created_at desc);
create index dioramas_tags_idx on dioramas using gin (tags);

create table boards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table board_dioramas (
  board_id uuid not null references boards(id) on delete cascade,
  diorama_id uuid not null references dioramas(id) on delete cascade,
  position int not null,
  primary key (board_id, diorama_id)
);

-- Single-owner gate. Centralized so changing the owner's email later is one
-- CREATE OR REPLACE, not an edit across every policy.
create or replace function is_owner() returns boolean
  language sql stable as $$
    select auth.jwt() ->> 'email' = 'kav.khood@gmail.com';
  $$;

alter table dioramas enable row level security;
alter table boards enable row level security;
alter table board_dioramas enable row level security;
alter table scales enable row level security;
alter table themes enable row level security;
alter table tags enable row level security;

create policy "owner_full_access" on dioramas for all using (is_owner()) with check (is_owner());
create policy "owner_full_access" on boards for all using (is_owner()) with check (is_owner());
create policy "owner_full_access" on board_dioramas for all using (is_owner()) with check (is_owner());
create policy "owner_full_access" on scales for all using (is_owner()) with check (is_owner());
create policy "owner_full_access" on themes for all using (is_owner()) with check (is_owner());
create policy "owner_full_access" on tags for all using (is_owner()) with check (is_owner());
