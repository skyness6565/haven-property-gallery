create type public.app_role as enum ('admin','user');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique(user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create policy "read own roles" on public.user_roles for select to authenticated using (auth.uid() = user_id);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.user_roles where user_id=_user_id and role=_role)
$$;

create or replace function public.handle_new_user_role()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.user_roles where role='admin') then
    insert into public.user_roles(user_id, role) values (new.id, 'admin');
  else
    insert into public.user_roles(user_id, role) values (new.id, 'user');
  end if;
  return new;
end $$;
create trigger on_auth_user_created_role after insert on auth.users
for each row execute function public.handle_new_user_role();

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  price numeric not null default 0,
  price_period text not null default 'month',
  location text not null default '',
  bedrooms int not null default 1,
  bathrooms int not null default 1,
  area_sqm int not null default 0,
  property_type text not null default 'Apartment',
  amenities text[] not null default '{}',
  images text[] not null default '{}',
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.listings to anon, authenticated;
grant insert, update, delete on public.listings to authenticated;
grant all on public.listings to service_role;
alter table public.listings enable row level security;
create policy "public read" on public.listings for select to anon, authenticated using (true);
create policy "admin insert" on public.listings for insert to authenticated with check (public.has_role(auth.uid(),'admin'));
create policy "admin update" on public.listings for update to authenticated using (public.has_role(auth.uid(),'admin'));
create policy "admin delete" on public.listings for delete to authenticated using (public.has_role(auth.uid(),'admin'));

create policy "public read listing images" on storage.objects for select using (bucket_id='listing-images');
create policy "admin upload listing images" on storage.objects for insert to authenticated with check (bucket_id='listing-images' and public.has_role(auth.uid(),'admin'));
create policy "admin delete listing images" on storage.objects for delete to authenticated using (bucket_id='listing-images' and public.has_role(auth.uid(),'admin'));