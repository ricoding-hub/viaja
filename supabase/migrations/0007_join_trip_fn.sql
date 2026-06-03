-- ============================================================
-- 0007 — join_trip() security-definer function
--  The client-side upsert into trip_members fails for new users
--  because ON CONFLICT DO NOTHING evaluates WITH CHECK RLS
--  before deciding to skip. A SECURITY DEFINER function runs as
--  the DB owner, bypasses RLS, and handles the upsert safely.
-- ============================================================

create or replace function join_trip(p_trip_id uuid, p_role text default 'guest')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
begin
  select id into v_profile_id from profiles where user_id = auth.uid();

  if v_profile_id is null then
    raise exception 'profile_not_found';
  end if;

  insert into trip_members (trip_id, user_id, role, confirmed)
  values (p_trip_id, v_profile_id,
          case when p_role = 'host' then 'host'::member_role else 'guest'::member_role end,
          false)
  on conflict (trip_id, user_id) do nothing;
end;
$$;
