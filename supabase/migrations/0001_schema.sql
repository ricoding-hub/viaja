-- ============================================================
-- Viaja — core schema, indexes, winner rule, and RLS
-- ============================================================
create extension if not exists pgcrypto;

-- ---------- enums ----------
do $$ begin
  create type cat as enum ('hospedaje','transporte','actividades','comida','general');
exception when duplicate_object then null; end $$;
do $$ begin
  create type price_unit as enum ('total','pp','ppd');
exception when duplicate_object then null; end $$;
do $$ begin
  create type trip_status as enum ('planeando','idea','completado');
exception when duplicate_object then null; end $$;
do $$ begin
  create type member_role as enum ('host','guest');
exception when duplicate_object then null; end $$;
do $$ begin
  create type research_type as enum ('tiktok','flight','link','note');
exception when duplicate_object then null; end $$;

-- ---------- profiles ----------
-- A profile may be a real user (user_id set) or a demo companion (user_id null,
-- is_demo true) so the seeded Puerto Escondido group can have votes.
create table if not exists profiles (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid unique references auth.users(id) on delete cascade,
  name        text not null,
  initials    text not null,
  color       text not null default '#11BFB2',
  avatar_url  text,
  is_demo     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- trips ----------
create table if not exists trips (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid not null references profiles(id) on delete cascade,
  name            text not null,
  sub             text not null default '',
  tone            text not null default '',
  emoji           text not null default '🌴',
  status          trip_status not null default 'planeando',
  start_date      date,
  end_date        date,
  people_count    int not null default 2 check (people_count between 1 and 30),
  goal_per_person int not null default 9000,
  cover_url       text,
  created_at      timestamptz not null default now()
);

-- ---------- trip_members (replaces memberIds[]) ----------
create table if not exists trip_members (
  id         uuid primary key default gen_random_uuid(),
  trip_id    uuid not null references trips(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  role       member_role not null default 'guest',
  confirmed  boolean not null default false,
  created_at timestamptz not null default now(),
  unique (trip_id, user_id)
);

-- ---------- options ----------
create table if not exists options (
  id               uuid primary key default gen_random_uuid(),
  trip_id          uuid not null references trips(id) on delete cascade,
  cat              cat not null,
  tone             text not null default '',
  emoji            text not null default '✨',
  title            text not null,
  subtitle         text not null default '',
  price            int not null default 0,
  unit             price_unit not null default 'pp',
  price_note       text not null default '',
  meta             jsonb not null default '[]'::jsonb,
  link             text not null default '',
  winner           boolean not null default false,
  cover_url        text,
  created_by       uuid references profiles(id) on delete set null,
  from_research_id uuid,
  created_at       timestamptz not null default now()
);

-- ---------- votes (replaces nested votes{}) ----------
create table if not exists votes (
  id         uuid primary key default gen_random_uuid(),
  option_id  uuid not null references options(id) on delete cascade,
  user_id    uuid not null references profiles(id) on delete cascade,
  rating     int not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (option_id, user_id)
);

-- ---------- research ----------
create table if not exists research (
  id                  uuid primary key default gen_random_uuid(),
  trip_id             uuid not null references trips(id) on delete cascade,
  type                research_type not null,
  cat                 cat not null default 'general',
  tone                text not null default '',
  title               text not null,
  source              text not null default '',
  note                text not null default '',
  saved_by            uuid references profiles(id) on delete set null,
  converted_option_id uuid references options(id) on delete set null,
  created_at          timestamptz not null default now()
);

-- ---------- itinerary ----------
create table if not exists itinerary_days (
  id      uuid primary key default gen_random_uuid(),
  trip_id uuid not null references trips(id) on delete cascade,
  day     int not null,
  date    text not null default '',
  title   text not null default '',
  tone    text not null default '',
  unique (trip_id, day)
);
create table if not exists itinerary_items (
  id     uuid primary key default gen_random_uuid(),
  day_id uuid not null references itinerary_days(id) on delete cascade,
  idx    int not null default 0,
  emoji  text not null default '',
  text   text not null default ''
);

-- ---------- indexes ----------
create index if not exists idx_trip_members_trip on trip_members(trip_id);
create index if not exists idx_trip_members_user on trip_members(user_id);
create index if not exists idx_options_trip on options(trip_id, cat);
create index if not exists idx_votes_option on votes(option_id);
create index if not exists idx_votes_user on votes(user_id);
create index if not exists idx_research_trip on research(trip_id);
create index if not exists idx_itinerary_days_trip on itinerary_days(trip_id);
create index if not exists idx_itinerary_items_day on itinerary_items(day_id);

-- ============================================================
-- Winner rule: single-winner categories clear siblings.
-- (hospedaje/transporte/comida = one winner; actividades = many)
-- ============================================================
create or replace function clear_sibling_winners() returns trigger
language plpgsql as $$
begin
  if NEW.winner and NEW.cat in ('hospedaje','transporte','comida') then
    update options
       set winner = false
     where trip_id = NEW.trip_id and cat = NEW.cat and id <> NEW.id and winner;
  end if;
  return NEW;
end $$;

drop trigger if exists trg_clear_sibling_winners on options;
create trigger trg_clear_sibling_winners
  after insert or update of winner on options
  for each row execute function clear_sibling_winners();

-- ============================================================
-- Helper functions (SECURITY DEFINER → no RLS recursion)
-- ============================================================
create or replace function current_profile_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from profiles where user_id = auth.uid();
$$;

create or replace function is_member(p_trip uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from trip_members m join profiles pr on pr.id = m.user_id
    where m.trip_id = p_trip and pr.user_id = auth.uid()
  );
$$;

create or replace function is_host(p_trip uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from trip_members m join profiles pr on pr.id = m.user_id
    where m.trip_id = p_trip and pr.user_id = auth.uid() and m.role = 'host'
  );
$$;

create or replace function shares_trip(p_profile uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from trip_members m1
      join trip_members m2 on m1.trip_id = m2.trip_id
      join profiles me on me.id = m1.user_id
     where me.user_id = auth.uid() and m2.user_id = p_profile
  );
$$;

create or replace function option_trip(p_option uuid) returns uuid
language sql stable security definer set search_path = public as $$
  select trip_id from options where id = p_option;
$$;

-- ============================================================
-- Row Level Security
-- ============================================================
alter table profiles        enable row level security;
alter table trips           enable row level security;
alter table trip_members    enable row level security;
alter table options         enable row level security;
alter table votes           enable row level security;
alter table research        enable row level security;
alter table itinerary_days  enable row level security;
alter table itinerary_items enable row level security;

-- profiles
create policy profiles_select on profiles for select to authenticated
  using (user_id = auth.uid() or shares_trip(id));
create policy profiles_update_self on profiles for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
-- hosts/members may create placeholder companions (add-by-name guests)
create policy profiles_insert_placeholder on profiles for insert to authenticated
  with check (user_id is null);

-- trips
create policy trips_select on trips for select to authenticated using (is_member(id));
create policy trips_insert on trips for insert to authenticated
  with check (owner_id = current_profile_id());
create policy trips_update_host on trips for update to authenticated
  using (is_host(id)) with check (is_host(id));
create policy trips_delete_host on trips for delete to authenticated using (is_host(id));

-- trip_members
create policy members_select on trip_members for select to authenticated using (is_member(trip_id));
create policy members_insert_host on trip_members for insert to authenticated
  with check (is_host(trip_id) or user_id = current_profile_id());
create policy members_update on trip_members for update to authenticated
  using (is_host(trip_id) or user_id = current_profile_id())
  with check (is_host(trip_id) or user_id = current_profile_id());
create policy members_delete_host on trip_members for delete to authenticated using (is_host(trip_id));

-- options (host manages; everyone reads)
create policy options_select on options for select to authenticated using (is_member(trip_id));
create policy options_insert_host on options for insert to authenticated with check (is_host(trip_id));
create policy options_update_host on options for update to authenticated
  using (is_host(trip_id)) with check (is_host(trip_id));
create policy options_delete_host on options for delete to authenticated using (is_host(trip_id));

-- votes (members read; you write only your own)
create policy votes_select on votes for select to authenticated using (is_member(option_trip(option_id)));
create policy votes_insert_self on votes for insert to authenticated
  with check (user_id = current_profile_id() and is_member(option_trip(option_id)));
create policy votes_update_self on votes for update to authenticated
  using (user_id = current_profile_id()) with check (user_id = current_profile_id());
create policy votes_delete_self on votes for delete to authenticated using (user_id = current_profile_id());

-- research (members add ideas; host converts)
create policy research_select on research for select to authenticated using (is_member(trip_id));
create policy research_insert on research for insert to authenticated with check (is_member(trip_id));
create policy research_update_host on research for update to authenticated
  using (is_host(trip_id) or saved_by = current_profile_id())
  with check (is_host(trip_id) or saved_by = current_profile_id());
create policy research_delete on research for delete to authenticated
  using (is_host(trip_id) or saved_by = current_profile_id());

-- itinerary (host manages)
create policy itin_days_select on itinerary_days for select to authenticated using (is_member(trip_id));
create policy itin_days_write on itinerary_days for all to authenticated
  using (is_host(trip_id)) with check (is_host(trip_id));
create policy itin_items_select on itinerary_items for select to authenticated
  using (is_member((select trip_id from itinerary_days d where d.id = day_id)));
create policy itin_items_write on itinerary_items for all to authenticated
  using (is_host((select trip_id from itinerary_days d where d.id = day_id)))
  with check (is_host((select trip_id from itinerary_days d where d.id = day_id)));
