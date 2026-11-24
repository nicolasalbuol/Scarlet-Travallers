-- =====================================================================
-- LOG DE AUDITORIA (só ADM vê) — quem criou, editou ou apagou o quê, com
-- o antes e o depois de cada registro, e reversão de qualquer ação.
-- Cole TUDO isto em: Supabase → SQL Editor → New query → Run.
-- Pode rodar de novo sem problema.
-- =====================================================================

create table if not exists public.audit_log (
  id bigserial primary key,
  at timestamptz not null default now(),
  actor_email text,              -- quem fez (null = link de edição compartilhado, sem login)
  action text not null,          -- criar | editar | apagar
  table_name text not null,      -- records | profiles
  record_id uuid,
  entity text,                   -- Character, Campanha, Book... ou Perfil
  label text,                    -- nome da ficha/campanha/etc. para mostrar na lista
  old_row jsonb,
  new_row jsonb,
  reverts_id bigint,             -- preenchido quando esta linha É a reversão de outra
  reverted_at timestamptz,
  reverted_by text
);
create index if not exists audit_log_at_idx on public.audit_log (at desc);
create index if not exists audit_log_record_idx on public.audit_log (record_id);

-- Ninguém escreve aqui pelo site: só os gatilhos abaixo. Só o ADM lê.
alter table public.audit_log enable row level security;
drop policy if exists "log: só ADM lê" on public.audit_log;
create policy "log: só ADM lê" on public.audit_log for select to authenticated using (public.is_admin());
revoke insert, update, delete on public.audit_log from anon, authenticated;

create or replace function public.audit_write()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_old jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
  v_new jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_row jsonb := coalesce(v_new, v_old);
  v_rev text := nullif(current_setting('st.reverting', true), '');
begin
  -- Salvar sem mudar nada não vira linha no log.
  if tg_op = 'UPDATE' and (v_old - 'updated_date') = (v_new - 'updated_date') then
    return null;
  end if;
  insert into public.audit_log (actor_email, action, table_name, record_id, entity, label, old_row, new_row, reverts_id)
  values (
    nullif(public.my_email(), ''),
    case tg_op when 'INSERT' then 'criar' when 'UPDATE' then 'editar' else 'apagar' end,
    tg_table_name,
    (v_row->>'id')::uuid,
    case when tg_table_name = 'profiles' then 'Perfil' else v_row->>'entity' end,
    coalesce(v_row->'data'->>'name', v_row->'data'->>'title', v_row->'data'->>'nome', v_row->>'full_name', v_row->>'email'),
    v_old,
    v_new,
    v_rev::bigint
  );
  return null;
end $$;

drop trigger if exists records_audit on public.records;
create trigger records_audit after insert or update or delete on public.records
  for each row execute function public.audit_write();

drop trigger if exists profiles_audit on public.profiles;
create trigger profiles_audit after update or delete on public.profiles
  for each row execute function public.audit_write();

-- Reverter uma ação do log (só ADM). A própria reversão também fica no log.
create or replace function public.revert_audit(p_id bigint)
returns text language plpgsql security definer set search_path = public as $$
declare
  a public.audit_log;
begin
  if not public.is_admin() then raise exception 'só o ADM pode reverter'; end if;
  select * into a from public.audit_log where id = p_id;
  if not found then raise exception 'ação não encontrada'; end if;
  if a.reverted_at is not null then raise exception 'essa ação já foi revertida'; end if;

  perform set_config('st.reverting', p_id::text, true);

  if a.table_name = 'records' then
    if a.action = 'criar' then
      delete from public.records where id = a.record_id;
    else
      -- editar → volta ao "antes"; apagar → recria. Se sumiu depois, recria também.
      insert into public.records (id, entity, data, created_by, created_date, updated_date)
      values (
        a.record_id,
        a.old_row->>'entity',
        a.old_row->'data',
        a.old_row->>'created_by',
        coalesce((a.old_row->>'created_date')::timestamptz, now()),
        now()
      )
      on conflict (id) do update
        set entity = excluded.entity, data = excluded.data, created_by = excluded.created_by, updated_date = now();
    end if;
  elsif a.table_name = 'profiles' then
    if a.action = 'editar' then
      if a.record_id = auth.uid() and coalesce(a.old_row->>'role', '') <> 'admin' then
        raise exception 'reverter isso tiraria o seu próprio ADM';
      end if;
      update public.profiles
         set role = a.old_row->>'role', full_name = a.old_row->>'full_name'
       where id = a.record_id;
    else
      raise exception 'perfil apagado não pode ser recriado pelo site';
    end if;
  end if;

  update public.audit_log set reverted_at = now(), reverted_by = public.my_email() where id = p_id;
  return 'ok';
end $$;

revoke execute on function public.revert_audit(bigint) from anon;
grant execute on function public.revert_audit(bigint) to authenticated;
