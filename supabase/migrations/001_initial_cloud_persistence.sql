create extension if not exists "pgcrypto";

do $$
begin
  create type public.app_language as enum ('fr', 'en');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.business_profile_type as enum (
    'Assemblage de meubles',
    'Nettoyage',
    'Livraison',
    'Services informatiques',
    'Vente en ligne',
    'Autre'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.transaction_kind as enum (
    'owner-investment',
    'client-payment',
    'cash-expense',
    'equipment-purchase',
    'supplies-credit',
    'supplier-payment',
    'owner-withdrawal',
    'bank-loan'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_method as enum (
    'Espèces',
    'Carte bancaire',
    'Mobile Money',
    'Virement',
    'Chèque',
    'Plateforme en ligne',
    'Autre'
  );
exception
  when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  preferred_language public.app_language not null default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Ma Petite Compta',
  business_profile public.business_profile_type not null default 'Autre',
  currency text not null default 'FCFA' check (currency = 'FCFA'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.business_members (
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'member')),
  created_at timestamptz not null default now(),
  primary key (business_id, user_id)
);

create table if not exists public.app_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  default_business_id uuid references public.businesses(id) on delete set null,
  preferred_language public.app_language not null default 'fr',
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  local_transaction_id text,
  transaction_date date not null,
  kind public.transaction_kind not null,
  description text not null,
  amount numeric(14, 2) not null check (amount > 0),
  currency text not null default 'FCFA' check (currency = 'FCFA'),
  category text,
  payment_method public.payment_method not null default 'Autre',
  party_name text,
  note text,
  is_sample boolean not null default false,
  generated_accounting jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, local_transaction_id)
);

create index if not exists businesses_owner_id_idx on public.businesses(owner_id);
create index if not exists business_members_user_id_idx on public.business_members(user_id);
create index if not exists transactions_business_date_idx on public.transactions(business_id, transaction_date desc);
create index if not exists transactions_user_id_idx on public.transactions(user_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists businesses_set_updated_at on public.businesses;
create trigger businesses_set_updated_at
before update on public.businesses
for each row execute function public.set_updated_at();

drop trigger if exists app_settings_set_updated_at on public.app_settings;
create trigger app_settings_set_updated_at
before update on public.app_settings
for each row execute function public.set_updated_at();

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.business_members enable row level security;
alter table public.app_settings enable row level security;
alter table public.transactions enable row level security;

drop policy if exists "profiles are self managed" on public.profiles;
create policy "profiles are self managed"
on public.profiles
for all
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "users can read their business memberships" on public.business_members;
create policy "users can read their business memberships"
on public.business_members
for select
using (auth.uid() = user_id);

drop policy if exists "owners manage business memberships" on public.business_members;
create policy "owners manage business memberships"
on public.business_members
for all
using (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.businesses b
    where b.id = business_members.business_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "users manage owned businesses" on public.businesses;
create policy "users manage owned businesses"
on public.businesses
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

drop policy if exists "members read businesses" on public.businesses;
create policy "members read businesses"
on public.businesses
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = businesses.id
      and bm.user_id = auth.uid()
  )
);

drop policy if exists "app settings are self managed" on public.app_settings;
create policy "app settings are self managed"
on public.app_settings
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "members read business transactions" on public.transactions;
create policy "members read business transactions"
on public.transactions
for select
using (
  exists (
    select 1
    from public.business_members bm
    where bm.business_id = transactions.business_id
      and bm.user_id = auth.uid()
  )
);

drop policy if exists "members insert own transactions" on public.transactions;
create policy "members insert own transactions"
on public.transactions
for insert
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.business_members bm
    where bm.business_id = transactions.business_id
      and bm.user_id = auth.uid()
  )
);

drop policy if exists "members update own transactions" on public.transactions;
create policy "members update own transactions"
on public.transactions
for update
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.business_members bm
    where bm.business_id = transactions.business_id
      and bm.user_id = auth.uid()
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1
    from public.business_members bm
    where bm.business_id = transactions.business_id
      and bm.user_id = auth.uid()
  )
);

drop policy if exists "members delete own transactions" on public.transactions;
create policy "members delete own transactions"
on public.transactions
for delete
using (
  auth.uid() = user_id
  and exists (
    select 1
    from public.business_members bm
    where bm.business_id = transactions.business_id
      and bm.user_id = auth.uid()
  )
);
