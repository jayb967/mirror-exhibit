-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create enum for user roles
create type user_role as enum ('admin', 'customer');

-- Create profiles table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    email text unique not null,
    role user_role not null default 'customer',
    full_name text,
    phone text,
    address jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create updated_at trigger function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger handle_profiles_updated_at
    before update on public.profiles
    for each row
    execute function public.handle_updated_at();

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view their own profile"
    on public.profiles for select
    using (auth.uid() = id);

create policy "Users can update their own profile"
    on public.profiles for update
    using (auth.uid() = id);

create policy "Admins can view all profiles"
    on public.profiles for select
    using (exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'admin'
    ));

create policy "Admins can update all profiles"
    on public.profiles for update
    using (exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'admin'
    ));

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, role)
    values (new.id, new.email, 'customer');
    return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();

-- Create indexes for better performance
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);

-- Create function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
    return exists (
        select 1 from public.profiles
        where id = user_id
        and role = 'admin'
    );
end;
$$ language plpgsql security definer;

-- Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.profiles to authenticated;
grant execute on function public.handle_updated_at() to authenticated;
grant execute on function public.handle_new_user() to authenticated;
grant execute on function public.is_admin(uuid) to authenticated; 