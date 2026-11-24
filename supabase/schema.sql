-- =====================================================================
-- SCARLET TRAVELLERS — banco de dados no Supabase
-- Cole TUDO isto em: Supabase → SQL Editor → New query → Run.
-- Pode rodar de novo sem problema (é idempotente): não apaga dados.
-- Depois rode também o supabase/audit_log.sql (log do ADM).
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
  values (new.id, new.email, left(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), 80))
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
create index if not exists records_owner_recent_idx on public.records (lower(created_by), created_date);
create index if not exists records_data_idx on public.records using gin (data);
create index if not exists records_invite_idx on public.records (upper(data->>'invite_code')) where entity = 'Campanha';

-- E-mail de quem está logado
create or replace function public.my_email()
returns text language sql stable as $$
  select lower(coalesce(auth.jwt()->>'email', ''));
$$;

-- Lista de membros de uma campanha (sempre um array, mesmo se o dado vier torto).
create or replace function public.campaign_members(p_data jsonb)
returns setof jsonb language sql immutable as $$
  select m from jsonb_array_elements(
    case when jsonb_typeof(p_data->'members') = 'array' then p_data->'members' else '[]'::jsonb end
  ) m;
$$;

-- A pessoa logada participa desta campanha?
create or replace function public.is_campaign_member(p_data jsonb)
returns boolean language sql stable as $$
  select exists (select 1 from public.campaign_members(p_data) m where lower(m->>'user_email') = public.my_email());
$$;

-- A pessoa logada é mestre de uma campanha onde o DONO desta ficha a colocou?
-- (a linha de membro precisa ter o e-mail do dono da ficha: ninguém "puxa" ficha alheia)
create or replace function public.masters_character(p_char uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1
      from public.records c
      cross join lateral public.campaign_members(c.data) m
      join public.records ch on ch.id = p_char and ch.entity = 'Character'
     where c.entity = 'Campanha'
       and public.my_email() <> ''
       and lower(c.data->>'master_email') = public.my_email()
       and m->>'character_id' = p_char::text
       and lower(m->>'user_email') = lower(ch.created_by)
  );
$$;

alter table public.records enable row level security;

-- LER
--  * Fichas: só o dono, o ADM (Área do Mestre) ou o mestre da campanha da ficha.
--  * Campanhas: só quem criou, o mestre, os participantes e o ADM.
--  * Todo o resto (livros, construtor, passados): qualquer pessoa logada.
drop policy if exists "ler" on public.records;
create policy "ler" on public.records for select to authenticated using (
  case entity
    when 'Character' then lower(created_by) = public.my_email() or public.is_admin() or public.masters_character(id)
    when 'Campanha' then lower(created_by) = public.my_email() or public.is_admin()
      or lower(data->>'master_email') = public.my_email() or public.is_campaign_member(data)
    else true
  end
);

-- CRIAR
--  * Fichas e campanhas: qualquer pessoa logada (em seu próprio nome).
--  * Livros, construtor, passados, configurações: só ADM.
--  * O ADM pode criar fichas no nome de outro jogador (importação do site antigo).
drop policy if exists "criar" on public.records;
create policy "criar" on public.records for insert to authenticated with check (
  (lower(created_by) = public.my_email() and public.my_email() <> '' and entity in ('Character', 'Campanha'))
  or public.is_admin()
);

-- EDITAR
--  * Ficha: dono, ADM ou mestre da campanha dela.
--  * Campanha: quem criou, o mestre e o ADM; participante só mexe na própria linha
--    de membro (o gatilho guard_records confere isso). Entrar por código: join_campaign().
--  * Resto: só ADM.
drop policy if exists "editar" on public.records;
create policy "editar" on public.records for update to authenticated
using (
  case entity
    when 'Character' then lower(created_by) = public.my_email() or public.is_admin() or public.masters_character(id)
    when 'Campanha' then lower(created_by) = public.my_email() or public.is_admin()
      or lower(data->>'master_email') = public.my_email() or public.is_campaign_member(data)
    else public.is_admin()
  end
)
with check (
  case entity
    when 'Character' then lower(created_by) = public.my_email() or public.is_admin() or public.masters_character(id)
    when 'Campanha' then true  -- quem sai da campanha deixa de ser membro; o gatilho valida o resto
    else public.is_admin()
  end
);

-- APAGAR: quem criou ou o ADM.
drop policy if exists "apagar" on public.records;
create policy "apagar" on public.records for delete to authenticated using (
  lower(created_by) = public.my_email() or public.is_admin()
);

-- Proteções no servidor (valem para o site, para a API direta e para as funções):
--  * ninguém muda o dono/tipo de um registro nem falsifica as datas;
--  * registro de no máximo ~2 MB; no máximo 20 registros novos por minuto por conta;
--  * campanha: só o mestre edita; participante só mexe na própria linha;
--    ficha só entra numa campanha pelas mãos do dono dela.
create or replace function public.guard_records()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_me text := public.my_email();
  -- ADM, ou comando rodado direto no SQL Editor / service role (fora dos papéis do site).
  v_admin boolean := public.is_admin()
    or coalesce(nullif(current_setting('role', true), ''), 'none') not in ('anon', 'authenticated');
  v_master boolean;
  v_old_members jsonb := '[]'::jsonb;
  m jsonb;
begin
  if octet_length(new.data::text) > 2000000 then
    raise exception 'registro grande demais (máximo 2 MB)';
  end if;

  if tg_op = 'INSERT' then
    if not v_admin then
      new.created_date := now();
      new.updated_date := now();
      if (select count(*) from public.records r
            where lower(r.created_by) = v_me and r.created_date > now() - interval '1 minute') >= 20 then
        raise exception 'muitas criações seguidas; espere um minuto';
      end if;
    end if;
  else
    if new.entity <> old.entity or coalesce(new.created_by, '') <> coalesce(old.created_by, '') then
      if not v_admin then raise exception 'não é permitido mudar o dono do registro'; end if;
    end if;
    if not v_admin then
      new.created_date := old.created_date;
      new.updated_date := now();
    end if;
    if new.entity = 'Campanha'
       and coalesce(new.data->>'master_email', '') <> coalesce(old.data->>'master_email', '')
       and not v_admin
       and lower(coalesce(old.data->>'master_email', '')) <> v_me then
      raise exception 'só o mestre pode trocar o mestre da campanha';
    end if;
  end if;

  if new.entity <> 'Campanha' or v_admin then
    return new;
  end if;

  if new.data ? 'members' and jsonb_typeof(new.data->'members') <> 'array' then
    raise exception 'lista de membros inválida';
  end if;

  if tg_op = 'INSERT' then
    if lower(coalesce(new.data->>'master_email', '')) not in ('', v_me) then
      raise exception 'você só pode criar campanhas em que você é o mestre';
    end if;
  else
    v_old_members := coalesce((select jsonb_agg(x) from public.campaign_members(old.data) x), '[]'::jsonb);
    v_master := lower(coalesce(old.data->>'master_email', '')) = v_me or lower(coalesce(old.created_by, '')) = v_me;
    if not v_master then
      if (new.data - 'members') is distinct from (old.data - 'members') then
        raise exception 'só o mestre pode editar a campanha';
      end if;
      if (select coalesce(jsonb_agg(x order by x::text), '[]'::jsonb) from public.campaign_members(new.data) x
            where lower(coalesce(x->>'user_email', '')) <> v_me)
         is distinct from
         (select coalesce(jsonb_agg(x order by x::text), '[]'::jsonb) from public.campaign_members(old.data) x
            where lower(coalesce(x->>'user_email', '')) <> v_me) then
        raise exception 'você só pode mudar a sua própria participação';
      end if;
    end if;
  end if;

  for m in select * from public.campaign_members(new.data) loop
    if coalesce(m->>'character_id', '') <> ''
       and not exists (
         select 1 from jsonb_array_elements(v_old_members) o
          where o->>'character_id' = m->>'character_id'
            and lower(coalesce(o->>'user_email', '')) = lower(coalesce(m->>'user_email', ''))
       ) then
      if lower(coalesce(m->>'user_email', '')) <> v_me
         or not exists (
           select 1 from public.records c
            where c.id::text = m->>'character_id' and c.entity = 'Character' and lower(c.created_by) = v_me
         ) then
        raise exception 'só o dono da ficha pode colocá-la numa campanha';
      end if;
    end if;
  end loop;

  return new;
end $$;

drop trigger if exists records_guard on public.records;
create trigger records_guard before insert or update on public.records
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
-- Nunca devolve o token de edição nem o e-mail do dono.
create or replace function public.character_by_token(p_token text)
returns setof public.records language sql stable security definer set search_path = public as $$
  select r.id, r.entity, r.data - 'edit_token', null::text, r.created_date, r.updated_date
    from public.records r
   where r.entity = 'Character' and length(coalesce(p_token, '')) >= 8 and r.data->>'share_token' = p_token
   limit 1;
$$;

-- Link de edição compartilhada. Com o link "só de ver", o token de edição não volta.
create or replace function public.character_for_edit(p_id uuid, p_token text)
returns setof public.records language sql stable security definer set search_path = public as $$
  select r.id, r.entity,
         case when r.data->>'edit_token' = p_token then r.data else r.data - 'edit_token' end,
         r.created_by, r.created_date, r.updated_date
    from public.records r
   where r.id = p_id and r.entity = 'Character' and length(coalesce(p_token, '')) >= 8
     and (r.data->>'edit_token' = p_token or r.data->>'share_token' = p_token)
   limit 1;
$$;

create or replace function public.update_character_with_token(p_id uuid, p_token text, p_patch jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  if length(coalesce(p_token, '')) < 8 then raise exception 'token inválido'; end if;
  update public.records
     set data = data || (coalesce(p_patch, '{}'::jsonb) - 'share_token' - 'edit_token'),
         updated_date = now()
   where id = p_id and entity = 'Character' and data->>'edit_token' = p_token;
  if not found then raise exception 'sem permissão'; end if;
end $$;

-- Entrar numa campanha pelo código. Só adiciona VOCÊ (sem ficha); 10 erros a cada 10 min.
create table if not exists public.rate_events (
  id bigserial primary key,
  email text not null,
  kind text not null,
  at timestamptz not null default now()
);
create index if not exists rate_events_idx on public.rate_events (email, kind, at);
alter table public.rate_events enable row level security;
revoke all on public.rate_events from anon, authenticated;

create or replace function public.join_campaign(p_code text, p_name text default null)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  v_me text := public.my_email();
  v_code text := upper(btrim(coalesce(p_code, '')));
  c public.records;
begin
  if v_me = '' then raise exception 'faça login para entrar numa campanha'; end if;
  delete from public.rate_events where at < now() - interval '1 day';
  if (select count(*) from public.rate_events
        where email = v_me and kind = 'join_fail' and at > now() - interval '10 minutes') >= 10 then
    raise exception 'muitas tentativas de código; espere alguns minutos';
  end if;
  if length(v_code) between 4 and 16 then
    select * into c from public.records
     where entity = 'Campanha' and upper(data->>'invite_code') = v_code
     limit 1 for update;
  end if;
  if c.id is null then
    insert into public.rate_events (email, kind) values (v_me, 'join_fail');
    return null;
  end if;
  if lower(coalesce(c.data->>'master_email', '')) = v_me or public.is_campaign_member(c.data) then
    return c.id;
  end if;
  update public.records
     set data = jsonb_set(
           data, '{members}',
           coalesce((select jsonb_agg(x) from public.campaign_members(data) x), '[]'::jsonb)
           || jsonb_build_array(jsonb_build_object(
                'user_email', v_me,
                'user_name', coalesce(nullif(left(btrim(coalesce(p_name, '')), 80), ''), v_me),
                'character_id', '',
                'character_name', '',
                'joined_date', now()))),
         updated_date = now()
   where id = c.id;
  return c.id;
end $$;

-- Sair de uma campanha (tira só as suas linhas de membro; a ficha volta a ficar livre).
create or replace function public.leave_campaign(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare
  v_me text := public.my_email();
begin
  if v_me = '' then raise exception 'faça login'; end if;
  update public.records
     set data = jsonb_set(data, '{members}', coalesce(
           (select jsonb_agg(x) from public.campaign_members(data) x where lower(coalesce(x->>'user_email', '')) <> v_me),
           '[]'::jsonb)),
         updated_date = now()
   where id = p_id and entity = 'Campanha' and public.is_campaign_member(data);
end $$;

-- Quem pode chamar cada função (por padrão o Postgres libera para todos, inclusive anônimos).
revoke execute on function public.merge_record(uuid, jsonb) from public, anon;
revoke execute on function public.character_for_edit(uuid, text) from public, anon;
revoke execute on function public.update_character_with_token(uuid, text, jsonb) from public, anon;
revoke execute on function public.join_campaign(text, text) from public, anon;
revoke execute on function public.masters_character(uuid) from public, anon;
revoke execute on function public.leave_campaign(uuid) from public, anon;
grant execute on function public.leave_campaign(uuid) to authenticated;
grant execute on function public.character_by_token(text) to anon, authenticated;
grant execute on function public.character_for_edit(uuid, text) to authenticated;
grant execute on function public.update_character_with_token(uuid, text, jsonb) to authenticated;
grant execute on function public.merge_record(uuid, jsonb) to authenticated;
grant execute on function public.join_campaign(text, text) to authenticated;
grant execute on function public.masters_character(uuid) to authenticated;

-- TRUNCATE ignora as regras (RLS): ninguém do site pode usar.
revoke truncate on public.records, public.profiles from anon, authenticated;

-- ---------------------------------------------------------------------
-- Arquivos: "uploads" (imagens e PDFs públicos) e "private" (arquivos de campanha do ADM)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
  on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('private', 'private', false)
  on conflict (id) do nothing;

-- Só imagens e documentos; nada de HTML/SVG/scripts. Até 50 MB por arquivo.
update storage.buckets
   set file_size_limit = 52428800,
       allowed_mime_types = array[
         'image/png', 'image/jpeg', 'image/webp', 'image/gif', 'image/avif',
         'application/pdf', 'application/msword',
         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
       ]
 where id in ('uploads', 'private');

-- Enviar: jogador só manda imagens para "uploads"; documentos e o bucket "private" são do ADM.
drop policy if exists "uploads: logado envia" on storage.objects;
create policy "uploads: logado envia" on storage.objects for insert to authenticated
  with check (
    (bucket_id = 'uploads' and lower(storage.extension(name)) in ('png', 'jpg', 'jpeg', 'webp', 'gif', 'avif'))
    or (bucket_id in ('uploads', 'private') and public.is_admin())
  );
-- Listar/ler pela API: só o próprio arquivo ou o ADM. (Imagens de "uploads" continuam
-- abertas pelo link público; o bucket "private" só abre com link assinado do ADM.)
drop policy if exists "uploads: todos leem" on storage.objects;
create policy "uploads: todos leem" on storage.objects for select to authenticated
  using (owner_id = auth.uid()::text or public.is_admin());

-- =====================================================================
-- DEPOIS de criar sua conta no site, rode SÓ a linha abaixo trocando o e-mail
-- para virar ADM / Mestre (enxerga todas as fichas):
--
--   update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
-- =====================================================================
