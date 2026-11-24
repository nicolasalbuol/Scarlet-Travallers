\pset footer off
\pset tuples_only on
set role authenticated;
create or replace function pg_temp.as_user(e text, id text) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub',id,'email',e,'role','authenticated')::text, false) $$;
select pg_temp.as_user('atacante@x.com','00000000-0000-0000-0000-00000000000c') \g /dev/null
select 'X0 entra na campanha legítima', join_campaign('ABC123') is not null;
\echo 'X1 membro põe a ficha da vítima na própria linha:'
select merge_record('22222222-2222-2222-2222-222222222222', jsonb_build_object('members', (select jsonb_agg(case when m->>'user_email'='atacante@x.com' then m || '{"character_id":"11111111-1111-1111-1111-111111111111"}' else m end) from records r, jsonb_array_elements(r.data->'members') m where r.id='22222222-2222-2222-2222-222222222222')));
\echo 'X1b membro se passa pela vítima numa linha nova:'
select merge_record('22222222-2222-2222-2222-222222222222', jsonb_build_object('members', (select jsonb_agg(m) from records r, jsonb_array_elements(r.data->'members') m where r.id='22222222-2222-2222-2222-222222222222') || '[{"user_email":"vitima@x.com","character_id":"11111111-1111-1111-1111-111111111111"}]'));
insert into records(id,entity,data,created_by) values ('44444444-4444-4444-4444-444444444444','Campanha','{"title":"Isca","master_email":"atacante@x.com","members":[]}','atacante@x.com');
\echo 'X2 mestre da própria campanha cria linha falsa da vítima com a ficha dela:'
select merge_record('44444444-4444-4444-4444-444444444444','{"members":[{"user_email":"vitima@x.com","character_id":"11111111-1111-1111-1111-111111111111"}]}');
\echo 'X3 sair de campanha alheia (sem efeito):'
select leave_campaign('22222222-2222-2222-2222-222222222222'::uuid) is null; 
\echo 'X5 transformar a própria ficha em Livro:'
update records set entity='Book' where id='44444444-4444-4444-4444-444444444444';
\echo 'X6 criar Livro:'
insert into records(entity,data,created_by) values ('Book','{"title":"x"}','atacante@x.com');
\echo 'X6b criar ficha no nome de outro:'
insert into records(entity,data,created_by) values ('Character','{"name":"x"}','vitima@x.com');
\echo 'X7 virar ADM:'
update profiles set role='admin' where email='atacante@x.com';
select 'X7 cargo continua', role from profiles where email='atacante@x.com';
\echo 'X9 ler/escrever no log:'
select 'X9 linhas do log visíveis', count(*) from audit_log;
insert into audit_log(action,table_name) values ('x','y');
\echo 'X10 apagar ficha da vítima:'
delete from records where id='11111111-1111-1111-1111-111111111111';
reset role; select set_config('request.jwt.claims','',false) \g /dev/null
insert into records(entity,data,created_by) values ('Campanha','{"title":"dado antigo malicioso","master_email":"atacante@x.com","members":[{"user_email":"atacante@x.com","character_id":"11111111-1111-1111-1111-111111111111"}]}','atacante@x.com');
set role authenticated; select pg_temp.as_user('atacante@x.com','00000000-0000-0000-0000-00000000000c') \g /dev/null
select 'X8 dado antigo malicioso dá acesso?', count(*) from records where id='11111111-1111-1111-1111-111111111111';
set role anon; select set_config('request.jwt.claims','{"role":"anon"}',false) \g /dev/null
select 'X11 anônimo lê registros', count(*) from records;
select 'X12 token curto/vazio', count(*) from character_by_token('');
reset role;
select 'FINAL vítima intacta', data->>'name', data->>'lore' from records where id='11111111-1111-1111-1111-111111111111';
select 'FINAL membros campanha', jsonb_array_length(data->'members') from records where id='22222222-2222-2222-2222-222222222222';
