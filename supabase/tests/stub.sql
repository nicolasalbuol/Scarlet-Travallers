-- Ambiente falso do Supabase (auth, storage, papéis) só para testar localmente.
drop database if exists t; create database t;
\c t
do $$ begin create role anon; exception when others then null; end $$;
do $$ begin create role authenticated; exception when others then null; end $$;
create schema auth; create table auth.users(id uuid primary key, email text, raw_user_meta_data jsonb default '{}');
create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true),''),'{}')::jsonb $$;
create function auth.uid() returns uuid language sql stable as $$ select nullif(auth.jwt()->>'sub','')::uuid $$;
create function auth.role() returns text language sql stable as $$ select coalesce(auth.jwt()->>'role','anon') $$;
create schema storage;
create table storage.buckets(id text primary key, name text, public bool, file_size_limit bigint, allowed_mime_types text[]);
create table storage.objects(id serial, bucket_id text, name text, owner uuid, owner_id text, metadata jsonb);
create function storage.extension(name text) returns text language sql as $$ select lower(split_part(name, '.', -1)) $$;
alter table storage.objects enable row level security;
grant usage on schema public, auth, storage to anon, authenticated;
-- como no Supabase: anon/authenticated recebem privilégios padrão nas tabelas e funções novas
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;
alter default privileges in schema public grant execute on functions to anon, authenticated;
grant all on storage.objects to anon, authenticated; grant usage on all sequences in schema storage to anon, authenticated;
