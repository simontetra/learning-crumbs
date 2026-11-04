-- Learning Crumbs: contributions, moderation and admin approval.
-- DRAFT. Not applied to any database yet. Review before running.

create extension if not exists pgcrypto;

-- Registered contributors (needed to add exhibits or photos, not to suggest a room).
create table public.contributors (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  credit_mode text not null default 'anonymous'
    check (credit_mode in ('anonymous', 'real_name', 'nickname')),
  over_18_confirmed_at timestamptz not null,
  terms_accepted_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Room suggestions. No account needed; email optional, only for notification.
create table public.room_suggestions (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 2 and 80),
  question text not null check (char_length(question) between 5 and 160),
  why text check (char_length(why) <= 800),
  credit_mode text not null default 'anonymous'
    check (credit_mode in ('anonymous', 'real_name', 'nickname')),
  display_name text check (char_length(display_name) <= 60),
  notify_email text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Exhibits proposed by registered contributors for an existing room.
create table public.artefact_submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.contributors(id) on delete cascade,
  gallery_slug text not null,
  title text not null check (char_length(title) between 2 and 120),
  question text not null,
  body_md text not null,
  sources jsonb not null default '[]'::jsonb,
  credit_mode text not null default 'anonymous'
    check (credit_mode in ('anonymous', 'real_name', 'nickname')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Photographs proposed by registered contributors for an existing exhibit.
create table public.photo_submissions (
  id uuid primary key default gen_random_uuid(),
  contributor_id uuid not null references public.contributors(id) on delete cascade,
  exhibit_slug text not null,
  image_path text not null,
  alt text not null check (char_length(alt) between 5 and 300),
  credit_text text not null,
  licence text not null
    check (licence in ('own_photo', 'CC0', 'public_domain', 'CC_BY', 'CC_BY_SA', 'pexels_or_pixabay')),
  licence_url text,
  source_url text,
  credit_mode text not null default 'anonymous'
    check (credit_mode in ('anonymous', 'real_name', 'nickname')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  reviewer_note text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

-- Row level security: nothing is readable or writable from the public API.
-- Writes go through server-side functions using the service role, and the admin
-- tool is the only reader of pending items.
alter table public.contributors enable row level security;
alter table public.room_suggestions enable row level security;
alter table public.artefact_submissions enable row level security;
alter table public.photo_submissions enable row level security;
