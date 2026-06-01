-- Combined setup: run this once in the Supabase SQL editor.
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
-- ============================================================
-- seed_demo_for(owner) — reproduces the Puerto Escondido demo
-- (+ Valle de Bravo, Roma & Condesa) for a new user, so the app
-- feels alive on first login. Demo companions are profiles with
-- user_id null / is_demo true so they can carry votes.
-- ============================================================
create or replace function seed_demo_for(p_owner uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  p_ale uuid; p_memo uuid; p_sofi uuid; p_dani uuid;
  t_pxm uuid; t_val uuid; t_cdmx uuid;
  o_h1 uuid; o_h2 uuid; o_h3 uuid; o_t1 uuid; o_t2 uuid;
  o_a1 uuid; o_a2 uuid; o_a3 uuid; o_c1 uuid;
  d1 uuid; d2 uuid; d3 uuid; d4 uuid; d5 uuid;
begin
  -- companions
  insert into profiles(name,initials,color,is_demo) values ('Ale','A','#FF6F5C',true) returning id into p_ale;
  insert into profiles(name,initials,color,is_demo) values ('Memo','M','#7C6CF0',true) returning id into p_memo;
  insert into profiles(name,initials,color,is_demo) values ('Sofi','S','#FFB43E',true) returning id into p_sofi;
  insert into profiles(name,initials,color,is_demo) values ('Dani','D','#0E8AA6',true) returning id into p_dani;

  -- trips
  insert into trips(owner_id,name,sub,tone,emoji,status,start_date,end_date,people_count)
    values (p_owner,'Puerto Escondido','Cumple de Ale 🎂','pool','🏝️','planeando','2026-06-19','2026-06-23',5) returning id into t_pxm;
  insert into trips(owner_id,name,sub,tone,emoji,status,people_count)
    values (p_owner,'Valle de Bravo','Escape de fin de semana','palm','⛰️','idea',6) returning id into t_val;
  insert into trips(owner_id,name,sub,tone,emoji,status,people_count)
    values (p_owner,'Roma & Condesa','Finde gastronómico','grape','🌮','completado',4) returning id into t_cdmx;

  -- members
  insert into trip_members(trip_id,user_id,role,confirmed) values
    (t_pxm,p_owner,'host',true),(t_pxm,p_ale,'host',true),(t_pxm,p_memo,'guest',true),(t_pxm,p_sofi,'guest',true),(t_pxm,p_dani,'guest',false),
    (t_val,p_owner,'host',true),(t_val,p_ale,'host',true),(t_val,p_memo,'guest',false),
    (t_cdmx,p_owner,'host',true),(t_cdmx,p_ale,'host',true),(t_cdmx,p_memo,'guest',true),(t_cdmx,p_sofi,'guest',true);

  -- options (Puerto Escondido)
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'hospedaje','pool','🏝️','Casa Aleta','Villa con alberca privada · Zicatela',13500,'total','5 noches · toda la casa','[["Alberca","Privada"],["Recámaras","3"],["A la playa","4 min"]]','airbnb.com/casa-aleta',true,p_owner) returning id into o_h1;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'hospedaje','palm','🌿','Selva Suites','Bungalows boutique · La Punta',11000,'total','5 noches · 3 bungalows','[["Alberca","Compartida"],["Recámaras","3"],["A la playa","2 min"]]','airbnb.com/selva-suites',false,p_owner) returning id into o_h2;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'hospedaje','sunset','🛏️','Hotel Marea','Hotel frente al mar · Zicatela',16200,'total','5 noches · 3 cuartos','[["Alberca","Rooftop"],["Cuartos","3"],["A la playa","0 min"]]','booking.com/marea',false,p_owner) returning id into o_h3;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'transporte','pool','✈️','Volaris directo','MEX → PXM · vuelo redondo',2380,'pp','por persona · redondo','[["Duración","1h 10m"],["Escalas","Directo"],["Maleta","Incluida"]]','volaris.com',true,p_owner) returning id into o_t1;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'transporte','grape','🚐','Roadtrip en van','Renta de van · 7h de camino',1450,'pp','gasolina + casetas + renta ÷ 5','[["Duración","7h"],["Flexible","Sí"],["Vibe","Aventura"]]','nota de Ale',false,p_owner) returning id into o_t2;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'actividades','night','🐬','Bioluminiscencia','Tour nocturno en laguna de Manialtepec',650,'pp','por persona · incluye guía','[["Duración","3h"],["Horario","Noche"],["Wow","★★★★★"]]','tiktok.com/@viajespxm',true,p_owner) returning id into o_a1;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'actividades','sunset','🏄','Clase de surf','Para principiantes · playa Carrizalillo',500,'pp','por persona · 2h con tabla','[["Duración","2h"],["Nivel","Principiante"],["Tabla","Incluida"]]','instagram.com/surfpxm',true,p_owner) returning id into o_a2;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'actividades','palm','🐢','Liberación de tortugas','Atardecer en Bahías de Chacahua',0,'pp','gratis · donativo sugerido','[["Duración","1h"],["Horario","Atardecer"],["Costo","Donativo"]]','nota de Sofi',false,p_owner) returning id into o_a3;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'comida','coral','🍤','Plan gastronómico','Mezcla de market + restaurantes',480,'ppd','estimado por persona / día','[["Desayunos","En casa"],["Cenas","Fuera"],["Mezcal","Incluido 😏"]]','estimado del grupo',true,p_owner) returning id into o_c1;

  -- votes
  insert into votes(option_id,user_id,rating) values
    (o_h1,p_owner,5),(o_h1,p_ale,5),(o_h1,p_memo,4),(o_h1,p_sofi,5),
    (o_h2,p_owner,4),(o_h2,p_ale,3),(o_h2,p_memo,5),(o_h2,p_sofi,4),
    (o_h3,p_owner,3),(o_h3,p_ale,4),(o_h3,p_memo,3),(o_h3,p_sofi,3),
    (o_t1,p_owner,5),(o_t1,p_ale,4),(o_t1,p_memo,4),(o_t1,p_sofi,5),
    (o_t2,p_owner,3),(o_t2,p_ale,5),(o_t2,p_memo,2),(o_t2,p_sofi,3),
    (o_a1,p_owner,5),(o_a1,p_ale,5),(o_a1,p_memo,5),(o_a1,p_sofi,4),
    (o_a2,p_owner,4),(o_a2,p_ale,5),(o_a2,p_memo,5),(o_a2,p_sofi,5),
    (o_a3,p_owner,4),(o_a3,p_ale,4),(o_a3,p_memo,3),(o_a3,p_sofi,5),
    (o_c1,p_owner,4),(o_c1,p_ale,4),(o_c1,p_memo,4),(o_c1,p_sofi,4);

  -- research
  insert into research(trip_id,type,cat,tone,title,source,note,saved_by,converted_option_id) values
    (t_pxm,'tiktok','actividades','night','POV: la laguna brilla de noche 🌊✨','tiktok.com/@viajespxm','Bioluminiscencia — dicen que junio es la mejor época',p_ale,o_a1),
    (t_pxm,'flight','transporte','pool','Volaris MEX–PXM $2,380 redondo','volaris.com','Precio baja si compramos antes del 15 de junio',p_owner,o_t1),
    (t_pxm,'link','hospedaje','pool','Casa Aleta — alberca privada 🏝️','airbnb.com/casa-aleta','3 recámaras, cabe perfecto, a 4 min de la playa',p_owner,o_h1),
    (t_pxm,'note','comida','coral','Lista de antojos 🍤','Nota','Tacos del Carmen, Almoraduz, mercado de Zicatela, mezcalería de La Punta',p_sofi,null),
    (t_pxm,'link','actividades','sunset','Surf en Carrizalillo para novatos','instagram.com/surfpxm','Clase grupal, nos dan descuento si somos +4',p_memo,o_a2),
    (t_pxm,'note','general','grape','Idea: pastel sorpresa 🎂 para Ale','Nota','Encargar pastel para la noche del cumpleaños (no decirle 🤫)',p_owner,null);

  -- itinerary
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,1,'Vie 19 jun','Llegada & La Punta','sunset') returning id into d1;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,2,'Sáb 20 jun','Surf & playa','pool') returning id into d2;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,3,'Dom 21 jun','🎂 Cumple de Ale','coral') returning id into d3;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,4,'Lun 22 jun','Bioluminiscencia','night') returning id into d4;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,5,'Mar 23 jun','Despedida','palm') returning id into d5;
  insert into itinerary_items(day_id,idx,emoji,text) values
    (d1,0,'✈️','Vuelo MEX–PXM 9:40am'),(d1,1,'🏝️','Check-in Casa Aleta'),(d1,2,'🌅','Atardecer + cena en La Punta'),
    (d2,0,'🏄','Clase de surf en Carrizalillo'),(d2,1,'🥥','Tarde de alberca'),(d2,2,'🍤','Cena de mariscos'),
    (d3,0,'🛥️','Tour de bahías'),(d3,1,'🐢','Liberación de tortugas'),(d3,2,'🎉','¡Fiesta sorpresa en la casa!'),
    (d4,0,'😴','Mañana libre'),(d4,1,'🛍️','Mercado de Zicatela'),(d4,2,'🐬','Tour nocturno bioluminiscente'),
    (d5,0,'🥞','Brunch en La Punta'),(d5,1,'🧳','Check-out'),(d5,2,'✈️','Vuelo de regreso 6:10pm');
end $$;

-- ============================================================
-- On signup: create the user's profile and seed their demo.
-- ============================================================
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid; nm text; ini text;
begin
  nm := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1), 'Viajero');
  ini := upper(left(nm, 1));
  insert into profiles(user_id, name, initials, color) values (new.id, nm, ini, '#11BFB2') returning id into pid;
  perform seed_demo_for(pid);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
-- ============================================================
-- Storage buckets for trip covers and option photos.
-- Path convention: "<trip_id>/<file>" (covers) and
-- "<option_id>/<file>" (option-photos). Public read; host writes.
-- ============================================================
insert into storage.buckets (id, name, public) values ('covers', 'covers', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('option-photos', 'option-photos', true)
  on conflict (id) do nothing;

-- public read
drop policy if exists "covers_read" on storage.objects;
create policy "covers_read" on storage.objects for select using (bucket_id = 'covers');
drop policy if exists "option_photos_read" on storage.objects;
create policy "option_photos_read" on storage.objects for select using (bucket_id = 'option-photos');

-- host writes (first path segment identifies the trip / option)
drop policy if exists "covers_write" on storage.objects;
create policy "covers_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and is_host(((storage.foldername(name))[1])::uuid));
drop policy if exists "covers_update" on storage.objects;
create policy "covers_update" on storage.objects for update to authenticated
  using (bucket_id = 'covers' and is_host(((storage.foldername(name))[1])::uuid));

drop policy if exists "option_photos_write" on storage.objects;
create policy "option_photos_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'option-photos' and is_host(option_trip(((storage.foldername(name))[1])::uuid)));
drop policy if exists "option_photos_update" on storage.objects;
create policy "option_photos_update" on storage.objects for update to authenticated
  using (bucket_id = 'option-photos' and is_host(option_trip(((storage.foldername(name))[1])::uuid)));
-- ============================================================
-- Enable Realtime on the tables the app subscribes to.
-- (Idempotent: ignores tables already in the publication.)
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['trips','trip_members','options','votes','research','itinerary_days','itinerary_items'] loop
    begin
      execute format('alter publication supabase_realtime add table %I', t);
    exception when others then null;
    end;
  end loop;
end $$;
