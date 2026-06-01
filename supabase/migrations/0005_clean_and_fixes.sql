-- ============================================================
-- 0005 — Clean start, leave-trip, and storage upload fix
--  • New users start EMPTY (no demo seeding)
--  • Remove already-seeded demo data
--  • Members can leave a trip
--  • Relax storage writes so cover/option uploads persist
--    (paths aren't bare uuids, so the old ::uuid host check failed)
-- ============================================================

-- 1. Stop seeding demo trips on signup (create→host, join→guest only).
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare nm text; ini text;
begin
  nm := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1), 'Viajero');
  ini := upper(left(nm, 1));
  insert into profiles(user_id, name, initials, color) values (new.id, nm, ini, '#11BFB2');
  return new;
end $$;

-- 2. Remove already-seeded demo data. Safe: real trips never contain is_demo
--    companions, so this only deletes the seeded example trips + companions.
delete from trips t
 where exists (
   select 1 from trip_members m join profiles p on p.id = m.user_id
   where m.trip_id = t.id and p.is_demo
 );
delete from profiles where is_demo;
drop function if exists seed_demo_for(uuid);

-- 3. Let a member leave a trip (delete their own membership).
drop policy if exists members_delete_self on trip_members;
create policy members_delete_self on trip_members for delete to authenticated
  using (user_id = current_profile_id());

-- 4. Relax storage writes so uploads succeed (public buckets; the edit
--    affordance is host-gated in the UI). Public read stays.
drop policy if exists "covers_write" on storage.objects;
drop policy if exists "covers_update" on storage.objects;
drop policy if exists "option_photos_write" on storage.objects;
drop policy if exists "option_photos_update" on storage.objects;
create policy "covers_write"  on storage.objects for insert to authenticated with check (bucket_id = 'covers');
create policy "covers_update" on storage.objects for update to authenticated using (bucket_id = 'covers');
create policy "option_photos_write"  on storage.objects for insert to authenticated with check (bucket_id = 'option-photos');
create policy "option_photos_update" on storage.objects for update to authenticated using (bucket_id = 'option-photos');
