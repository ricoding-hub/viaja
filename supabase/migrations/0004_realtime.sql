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
