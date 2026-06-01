-- ============================================================
-- 0006 — Idea budgets + itinerary item links
--  • research.amount: optional estimated budget per idea. When an idea is
--    converted into an option, this becomes the option's price (feeds budget).
--  • itinerary_items.option_id: link a plan item back to the option it came
--    from (auto-integration of options into the day-by-day plan).
-- Run AFTER 0005. Itinerary stays host-managed (RLS unchanged); avatars reuse
-- the public `covers` bucket already relaxed in 0005.
-- ============================================================

alter table research add column if not exists amount int;
alter table itinerary_items add column if not exists option_id uuid references options(id) on delete set null;
