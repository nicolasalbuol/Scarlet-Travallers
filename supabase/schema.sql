-- =====================================================================
-- SCARLET TRAVELLERS — banco de dados no Supabase
-- Cole TUDO isto em: Supabase → SQL Editor → New query → Run.
-- Pode rodar de novo sem problema (é idempotente).
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Perfis (nome e cargo de cada conta)
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
drop policy if exists "perfil: ler o próprio ou admin" on public.profiles;
create policy "perfil: ler o próprio ou admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "perfil: admin edita" on public.profiles;
create policy "perfil: admin edita" on public.profiles
  for update using (public.is_admin());

-- ---------------------------------------------------------------------
-- Registros: fichas, campanhas, livros, conteúdo do construtor etc.
-- entity = 'Character' | 'Campanha' | 'Book' | 'BuilderContent' | 'Passado' | 'AppSettings'
-- ---------------------------------------------------------------------
create table if not exists public.records (
  id uuid primary key default gen_random_uuid(),
  entity text not null,
  data jsonb not null default '{}'::jsonb,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);
create index if not exists records_entity_idx on public.records (entity);
create index if not exists records_created_by_idx on public.records (created_by);
create index if not exists records_data_idx on public.records using gin (data);

-- E-mail de quem está logado
create or replace function public.my_email()
returns text language sql stable as $$
  select lower(coalesce(auth.jwt()->>'email', ''));
$$;

-- A pessoa logada é mestre de uma campanha que contém esta ficha?
create or replace function public.masters_character(p_char uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.records c
    where c.entity = 'Campanha'
      and lower(c.data->>'master_email') = public.my_email()
      and c.data->'members' @> jsonb_build_array(jsonb_build_object('character_id', p_char::text))
  );
$$;

alter table public.records enable row level security;

-- LER
--  * Fichas: só o dono, o ADM (Área do Mestre) ou o mestre da campanha da ficha.
--  * Todo o resto (campanhas, livros, construtor): qualquer pessoa logada.
drop policy if exists "ler" on public.records;
create policy "ler" on public.records for select to authenticated using (
  case when entity = 'Character'
    then lower(created_by) = public.my_email() or public.is_admin() or public.masters_character(id)
    else true
  end
);

-- CRIAR
--  * Fichas e campanhas: qualquer pessoa logada (em seu próprio nome).
--  * Livros, construtor, passados, configurações: só ADM.
drop policy if exists "criar" on public.records;
create policy "criar" on public.records for insert to authenticated with check (
  lower(created_by) = public.my_email()
  and (entity in ('Character', 'Campanha') or public.is_admin())
);

-- EDITAR
--  * Ficha: dono, ADM ou mestre da campanha dela.
--  * Campanha: qualquer pessoa logada (entrar por código altera a lista de membros).
--  * Resto: só ADM.
drop policy if exists "editar" on public.records;
create policy "editar" on public.records for update to authenticated using (
  case entity
    when 'Character' then lower(created_by) = public.my_email() or public.is_admin() or public.masters_character(id)
    when 'Campanha' then true
    else public.is_admin()
  end
);

-- APAGAR: quem criou ou o ADM.
drop policy if exists "apagar" on public.records;
create policy "apagar" on public.records for delete to authenticated using (
  lower(created_by) = public.my_email() or public.is_admin()
);


-- Proteções: ninguém muda o dono/tipo de um registro, e só o mestre atual
-- (ou o ADM) troca o mestre de uma campanha.
create or replace function public.guard_records()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.entity <> old.entity or coalesce(new.created_by, '') <> coalesce(old.created_by, '') then
    if not public.is_admin() then raise exception 'não é permitido mudar o dono do registro'; end if;
  end if;
  if new.entity = 'Campanha'
     and coalesce(new.data->>'master_email', '') <> coalesce(old.data->>'master_email', '')
     and not public.is_admin()
     and lower(coalesce(old.data->>'master_email', '')) <> public.my_email() then
    raise exception 'só o mestre pode trocar o mestre da campanha';
  end if;
  return new;
end $$;

drop trigger if exists records_guard on public.records;
create trigger records_guard before update on public.records
  for each row execute function public.guard_records();

-- Mesclar campos (o site manda só o que mudou). Respeita as regras acima.
create or replace function public.merge_record(p_id uuid, p_patch jsonb)
returns setof public.records language sql security invoker as $$
  update public.records
     set data = data || coalesce(p_patch, '{}'::jsonb),
         updated_date = now()
   where id = p_id
  returning *;
$$;

-- Link público de ficha (somente leitura), funciona até sem login.
create or replace function public.character_by_token(p_token text)
returns setof public.records language sql stable security definer set search_path = public as $$
  select * from public.records
   where entity = 'Character' and coalesce(p_token, '') <> '' and data->>'share_token' = p_token
   limit 1;
$$;

-- Link de edição compartilhada.
create or replace function public.character_for_edit(p_id uuid, p_token text)
returns setof public.records language sql stable security definer set search_path = public as $$
  select * from public.records
   where id = p_id and entity = 'Character' and coalesce(p_token, '') <> ''
     and (data->>'edit_token' = p_token or data->>'share_token' = p_token)
   limit 1;
$$;

create or replace function public.update_character_with_token(p_id uuid, p_token text, p_patch jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if coalesce(p_token, '') = '' then raise exception 'token inválido'; end if;
  update public.records
     set data = data || (coalesce(p_patch, '{}'::jsonb) - 'share_token' - 'edit_token'),
         updated_date = now()
   where id = p_id and entity = 'Character' and data->>'edit_token' = p_token;
  if not found then raise exception 'sem permissão'; end if;
end $$;

grant execute on function public.character_by_token(text) to anon, authenticated;
grant execute on function public.character_for_edit(uuid, text) to authenticated;
grant execute on function public.update_character_with_token(uuid, text, jsonb) to authenticated;
grant execute on function public.merge_record(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- Arquivos: "uploads" (imagens e PDFs públicos) e "private" (arquivos de campanha)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('private', 'private', false)
  on conflict (id) do nothing;

drop policy if exists "uploads: logado envia" on storage.objects;
create policy "uploads: logado envia" on storage.objects for insert to authenticated
  with check (bucket_id in ('uploads', 'private'));
drop policy if exists "uploads: todos leem" on storage.objects;
create policy "uploads: todos leem" on storage.objects for select
  using (bucket_id = 'uploads' or (bucket_id = 'private' and auth.role() = 'authenticated'));

-- =====================================================================
-- DEPOIS de criar sua conta no site, rode SÓ a linha abaixo trocando o e-mail
-- para virar ADM / Mestre (enxerga todas as fichas):
--
--   update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
-- =====================================================================
