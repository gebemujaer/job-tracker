-- Run this entire script in Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run

-- 1. Profiles table (extends Supabase auth)
create table if not exists profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  created_at timestamptz default now()
);

-- 2. Applications table
create table if not exists applications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  company text not null,
  role text not null,
  location text,
  applied_date date,
  status text default 'applied' check (status in ('applied','screening','interview','offer','rejected','withdrawn')),
  fit_score integer check (fit_score >= 1 and fit_score <= 10),
  pay_range text,
  remote_risk text check (remote_risk in ('low','medium','high')),
  notes text,
  job_url text,
  contact text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Docs table
create table if not exists docs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text,
  category text,
  file_name text,
  file_url text,
  file_path text,
  created_at timestamptz default now()
);

-- 4. Row Level Security — enable it
alter table profiles enable row level security;
alter table applications enable row level security;
alter table docs enable row level security;

-- 5. Policies for profiles
-- Anyone logged in can read all profiles (needed for Partner view)
create policy "Profiles are viewable by logged in users"
  on profiles for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own profile"
  on profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on profiles for update
  using (auth.uid() = id);

-- 6. Policies for applications
-- Users can view their own AND their partner's applications
create policy "Users can view all applications"
  on applications for select
  using (auth.role() = 'authenticated');

create policy "Users can insert their own applications"
  on applications for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own applications"
  on applications for update
  using (auth.uid() = user_id);

create policy "Users can delete their own applications"
  on applications for delete
  using (auth.uid() = user_id);

-- 7. Policies for docs
create policy "Users can view their own docs"
  on docs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own docs"
  on docs for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own docs"
  on docs for delete
  using (auth.uid() = user_id);

-- 8. Storage bucket for docs (run this separately if SQL editor doesn't support it)
-- Go to Storage → New bucket → name it "docs" → set to Public

-- 9. Auto-update updated_at on applications
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger applications_updated_at
  before update on applications
  for each row execute procedure update_updated_at();
