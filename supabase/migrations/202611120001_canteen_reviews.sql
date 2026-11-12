create schema if not exists canteen_private;
revoke all on schema canteen_private from public, anon, authenticated;

create table canteen_private.stalls (
  id text primary key
);

insert into canteen_private.stalls (id) values
  ('qiaoxinpo'), ('anhui-ban-mian'), ('fenghuang-buffet'), ('breakfast'),
  ('mala-xiangguo'), ('chicken-noodles'), ('beef-paomo'), ('chanzuiyu'),
  ('dongyue-buffet'), ('silky-egg-rice'), ('dumplings'), ('steak-pasta'),
  ('dundunxiang'), ('halal-beef-noodles'), ('tianxia-noodles'), ('lieyan-rice'),
  ('offal-noodles'), ('shandong-pancake'), ('shaanxi-noodles'), ('wisdom-pepper-pork'),
  ('double-rice-roujiamo'), ('xiaolongbao');

create table canteen_private.reviews (
  stall_id text not null references canteen_private.stalls (id),
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  score smallint not null check (score between 1 and 5),
  body text not null default '' check (char_length(body) <= 500),
  updated_at timestamptz not null default now(),
  primary key (stall_id, reviewer_id)
);

create index reviews_recent_idx on canteen_private.reviews (stall_id, updated_at desc);
create index reviews_reviewer_idx on canteen_private.reviews (reviewer_id);
alter table canteen_private.reviews enable row level security;

create function public.canteen_rating_summaries()
returns table (stall_id text, average numeric, count bigint)
language sql stable security definer set search_path = ''
as $$
  select r.stall_id, round(avg(r.score), 1), count(*)
  from canteen_private.reviews as r group by r.stall_id;
$$;

create function public.canteen_public_reviews(target_stall text)
returns table (score smallint, body text, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select r.score, r.body, r.updated_at
  from canteen_private.reviews as r
  where r.stall_id = target_stall and r.body <> ''
  order by r.updated_at desc, r.reviewer_id
  limit 30;
$$;

create function public.canteen_my_review(target_stall text)
returns table (score smallint, body text, updated_at timestamptz)
language sql stable security definer set search_path = ''
as $$
  select r.score, r.body, r.updated_at
  from canteen_private.reviews as r
  where r.stall_id = target_stall and r.reviewer_id = auth.uid();
$$;

create function public.canteen_save_review(target_stall text, rating smallint, review_body text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  reviewer uuid := auth.uid();
begin
  if reviewer is null then
    raise exception 'Authentication required' using errcode = '42501';
  end if;

  insert into canteen_private.reviews (stall_id, reviewer_id, score, body)
  values (target_stall, reviewer, rating, btrim(coalesce(review_body, '')))
  on conflict (stall_id, reviewer_id) do update
    set score = excluded.score, body = excluded.body, updated_at = now();
end;
$$;

create function public.canteen_delete_review(target_stall text)
returns void
language sql security definer set search_path = ''
as $$
  delete from canteen_private.reviews
  where stall_id = target_stall and reviewer_id = auth.uid();
$$;

revoke all on function public.canteen_rating_summaries() from public, anon, authenticated;
revoke all on function public.canteen_public_reviews(text) from public, anon, authenticated;
revoke all on function public.canteen_my_review(text) from public, anon, authenticated;
revoke all on function public.canteen_save_review(text, smallint, text) from public, anon, authenticated;
revoke all on function public.canteen_delete_review(text) from public, anon, authenticated;

grant execute on function public.canteen_rating_summaries() to anon, authenticated;
grant execute on function public.canteen_public_reviews(text) to anon, authenticated;
grant execute on function public.canteen_my_review(text) to authenticated;
grant execute on function public.canteen_save_review(text, smallint, text) to authenticated;
grant execute on function public.canteen_delete_review(text) to authenticated;
