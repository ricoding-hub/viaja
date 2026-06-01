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
