-- V2 Schema additions -- run this in Supabase SQL Editor

-- 1. Add new columns to applications
alter table applications 
  add column if not exists fit_score_decimal numeric(3,1) check (fit_score_decimal >= 1 and fit_score_decimal <= 10),
  add column if not exists follow_up_date date,
  add column if not exists tags text[],
  add column if not exists last_activity_at timestamptz default now();

-- 2. Friend/privacy system
create table if not exists friend_requests (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references auth.users(id) on delete cascade not null,
  to_user_id uuid references auth.users(id) on delete cascade not null,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz default now(),
  unique(from_user_id, to_user_id)
);

alter table friend_requests enable row level security;

create policy "Users can view their own friend requests"
  on friend_requests for select
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

create policy "Users can send friend requests"
  on friend_requests for insert
  with check (auth.uid() = from_user_id);

create policy "Users can update requests sent to them"
  on friend_requests for update
  using (auth.uid() = to_user_id or auth.uid() = from_user_id);

create policy "Users can delete their own requests"
  on friend_requests for delete
  using (auth.uid() = from_user_id or auth.uid() = to_user_id);

-- 3. Update applications RLS - only friends can see each other's apps
drop policy if exists "Users can view all applications" on applications;

create policy "Users can view own and friends applications"
  on applications for select
  using (
    auth.uid() = user_id
    or exists (
      select 1 from friend_requests
      where status = 'accepted'
      and (
        (from_user_id = auth.uid() and to_user_id = user_id)
        or (to_user_id = auth.uid() and from_user_id = user_id)
      )
    )
  );

-- 4. Private storage policies (drop public ones, add signed)
drop policy if exists "Users can upload their own files" on storage.objects;
drop policy if exists "Users can view their own files" on storage.objects;
drop policy if exists "Users can delete their own files" on storage.objects;

create policy "Users can upload their own files"
  on storage.objects for insert
  with check (bucket_id = 'docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view their own files"
  on storage.objects for select
  using (bucket_id = 'docs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own files"
  on storage.objects for delete
  using (bucket_id = 'docs' and auth.uid()::text = (storage.foldername(name))[1]);

-- 5. Update last_activity_at trigger
create or replace function update_last_activity()
returns trigger as $$
begin
  new.last_activity_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists applications_last_activity on applications;
create trigger applications_last_activity
  before update on applications
  for each row execute procedure update_last_activity();
