-- Enable RLS on all tables (if not already enabled)
alter table public.clientes enable row level security;
alter table public.pedidos enable row level security;
alter table public.detalle_pedidos enable row level security;
alter table public.ventas enable row level security;
alter table public.detalle_ventas enable row level security;
alter table public.productos enable row level security;
alter table public.servicios enable row level security;
alter table public.movimientos enable row level security;
alter table public.configuracion enable row level security;

-- Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text,
  role text not null check (role in ('admin', 'worker')) default 'worker',
  nombre text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.profiles enable row level security;

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, nombre)
  values (new.id, new.email, 'worker', new.raw_user_meta_data->>'nombre');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper function to check if user is admin
create or replace function public.is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- POLICIES

-- Profiles: Users can read their own profile. Admins can read all.
create policy "Users can modify their own profile"
  on public.profiles for update
  using ( auth.uid() = id );

create policy "Users can read own profile"
  on public.profiles for select
  using ( auth.uid() = id or is_admin() );

-- General Tables (Orders, Sales, Products, etc.)

-- READ: Everyone (authenticated) can read
create policy "Enable read access for all authenticated users"
  on public.pedidos for select
  to authenticated
  using (true);

create policy "Enable read access for all authenticated users"
  on public.clientes for select
  to authenticated
  using (true);
  
create policy "Enable read access for all authenticated users"
  on public.productos for select
  to authenticated
  using (true);

create policy "Enable read access for all authenticated users"
  on public.servicios for select
  to authenticated
  using (true);

-- CREATE: Everyone (authenticated) can create (Workers need to sell/order)
create policy "Enable insert for authenticated users"
  on public.pedidos for insert
  to authenticated
  with check (true);

create policy "Enable insert for authenticated users"
  on public.clientes for insert
  to authenticated
  with check (true);
  
create policy "Enable insert for authenticated users"
  on public.detalle_pedidos for insert
  to authenticated
  with check (true);

-- UPDATE/DELETE: Only Admins
create policy "Only admins can update"
  on public.pedidos for update
  to authenticated
  using ( is_admin() );

create policy "Only admins can delete"
  on public.pedidos for delete
  to authenticated
  using ( is_admin() );

create policy "Only admins can update"
  on public.productos for update
  to authenticated
  using ( is_admin() );

create policy "Only admins can delete"
  on public.productos for delete
  to authenticated
  using ( is_admin() );
  
-- Configuration: Only Admin can manage
create policy "Read config"
  on public.configuracion for select
  to authenticated
  using (true);

create policy "Admin manage config"
  on public.configuracion for all
  to authenticated
  using ( is_admin() );
