create table public.fridge_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null default 'other',
  added_date timestamptz not null default now(),
  shelf_life_days integer not null default 7,
  quantity text,
  storage text not null default 'fridge',
  created_at timestamptz default now()
);

alter table public.fridge_items enable row level security;

create policy "Users can manage their own fridge items"
  on public.fridge_items for all
  using (auth.uid() = user_id);
