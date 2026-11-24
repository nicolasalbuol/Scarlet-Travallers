\set ON_ERROR_STOP 1
\pset footer off
\pset tuples_only on
set role authenticated;
create or replace function pg_temp.as_user(e text, id text) returns void language sql as $$ select set_config('request.jwt.claims', json_build_object('sub',id,'email',e,'role','authenticated')::text, false) $$;
-- L1 dona edita a própria ficha e cria outra
select pg_temp.as_user('vitima@x.com','00000000-0000-0000-0000-00000000000b');
select 'L1 dona edita', (merge_record('11111111-1111-1111-1111-111111111111','{"level":2}')).data->>'level';
insert into records(entity,data,created_by) values ('Character','{"name":"Segunda"}','vitima@x.com');
select 'L1 dona cria', count(*) from records where entity='Character';
-- L2 mestre lê/edita a ficha da jogadora e edita a campanha
select pg_temp.as_user('mestre@x.com','00000000-0000-0000-0000-00000000000d');
select 'L2 mestre lê ficha', data->>'name' from records where id='11111111-1111-1111-1111-111111111111';
select 'L2 mestre edita ficha', (merge_record('11111111-1111-1111-1111-111111111111','{"pv":10}')).data->>'pv';
select 'L2 mestre edita campanha', (merge_record('22222222-2222-2222-2222-222222222222','{"title":"Nova fase"}')).data->>'title';
-- L3 novo jogador entra pelo código, põe a ficha, mestre vê
select pg_temp.as_user('atacante@x.com','00000000-0000-0000-0000-00000000000c');
select 'L3 antes de entrar vê campanha?', count(*) from records where entity='Campanha';
select 'L3 entra (minúsculas)', join_campaign('abc123','Jogador Novo') = '22222222-2222-2222-2222-222222222222';
select 'L3 depois vê campanha', count(*) from records where entity='Campanha';
insert into records(id,entity,data,created_by) values ('33333333-3333-3333-3333-333333333333','Character','{"name":"Ficha do Novo"}','atacante@x.com');
select 'L3 põe a própria ficha', jsonb_array_length((merge_record('22222222-2222-2222-2222-222222222222',
  jsonb_build_object('members', (select jsonb_agg(case when m->>'user_email'='atacante@x.com' then m || '{"character_id":"33333333-3333-3333-3333-333333333333","character_name":"Ficha do Novo"}' else m end) from records r, jsonb_array_elements(r.data->'members') m where r.id='22222222-2222-2222-2222-222222222222')))).data->'members');
select 'L3 entrar de novo não duplica', join_campaign('ABC123') is not null, (select jsonb_array_length(data->'members') from records where id='22222222-2222-2222-2222-222222222222');
\set ON_ERROR_STOP 0
\echo 'L3 jogador tenta editar título (deve FALHAR):'
select merge_record('22222222-2222-2222-2222-222222222222','{"title":"x"}');
\echo 'L3 jogador tenta remover outra pessoa (deve FALHAR):'
select merge_record('22222222-2222-2222-2222-222222222222', jsonb_build_object('members', (select jsonb_agg(m) from records r, jsonb_array_elements(r.data->'members') m where r.id='22222222-2222-2222-2222-222222222222' and m->>'user_email'='atacante@x.com')));
\set ON_ERROR_STOP 1
select pg_temp.as_user('mestre@x.com','00000000-0000-0000-0000-00000000000d');
select 'L3 mestre vê ficha do novo', data->>'name' from records where id='33333333-3333-3333-3333-333333333333';
select pg_temp.as_user('atacante@x.com','00000000-0000-0000-0000-00000000000c');
select leave_campaign('22222222-2222-2222-2222-222222222222');
select 'L3 depois de sair não vê', count(*) from records where entity='Campanha';
-- L4 limite de códigos errados
select 'L4 erro devolve vazio', join_campaign('ZZZZZZ') is null;
select join_campaign('ZZZZZ'||g) from generate_series(1,9) g \g /dev/null
\set ON_ERROR_STOP 0
\echo 'L4 11ª tentativa (deve FALHAR por limite):'
select join_campaign('ABC123');
\set ON_ERROR_STOP 1
-- L5 criar campanha própria
insert into records(entity,data,created_by) values ('Campanha','{"title":"Minha","master_email":"atacante@x.com","invite_code":"QWERTY12","members":[]}','atacante@x.com');
select 'L5 cria campanha própria', count(*) from records where entity='Campanha';
\set ON_ERROR_STOP 0
\echo 'L5 criar campanha com outro mestre (deve FALHAR):'
insert into records(entity,data,created_by) values ('Campanha','{"title":"x","master_email":"mestre@x.com"}','atacante@x.com');
\set ON_ERROR_STOP 1
-- L6 links
select 'L6 edit-link devolve token', data->>'edit_token' from character_for_edit('11111111-1111-1111-1111-111111111111','EDITTOKEN987654321');
select 'L6 view-link sem token', data ? 'edit_token' from character_for_edit('11111111-1111-1111-1111-111111111111','VIEWTOKEN123456789');
select update_character_with_token('11111111-1111-1111-1111-111111111111','EDITTOKEN987654321','{"lore":"colab"}');
select 'L6 colaborador editou', data->>'lore' from character_for_edit('11111111-1111-1111-1111-111111111111','EDITTOKEN987654321');
-- L7 ADM
select pg_temp.as_user('adm@x.com','00000000-0000-0000-0000-00000000000a');
select 'L7 ADM vê tudo', (select count(*) from records where entity='Character'), (select count(*) from records where entity='Campanha');
insert into records(entity,data,created_by) values ('Character','{"name":"Importada"}','alguem@x.com');
select 'L7 ADM importa', count(*) from records where created_by='alguem@x.com';
select 'L7 ADM edita campanha', (merge_record('22222222-2222-2222-2222-222222222222','{"status":"ativa"}')).data->>'status';
select 'L7 log tem entradas', count(*) > 5 from audit_log;
-- L10 limite de criação
select pg_temp.as_user('vitima@x.com','00000000-0000-0000-0000-00000000000b');
insert into records(entity,data,created_by) select 'Character','{"name":"n"}','vitima@x.com' from generate_series(1,18);
\set ON_ERROR_STOP 0
\echo 'L10 21ª criação no minuto (deve FALHAR):'
insert into records(entity,data,created_by) values ('Character','{"name":"n"}','vitima@x.com');
\set ON_ERROR_STOP 1
-- L12 arquivos
insert into storage.objects(bucket_id,name,owner_id) values ('uploads','a.png','00000000-0000-0000-0000-00000000000b');
select 'L12 jogador envia imagem', count(*) from storage.objects;
\set ON_ERROR_STOP 0
\echo 'L12 jogador envia PDF/HTML (deve FALHAR):'
insert into storage.objects(bucket_id,name,owner_id) values ('uploads','x.html','00000000-0000-0000-0000-00000000000b');
\set ON_ERROR_STOP 1
select pg_temp.as_user('adm@x.com','00000000-0000-0000-0000-00000000000a');
insert into storage.objects(bucket_id,name,owner_id) values ('uploads','livro.pdf','00000000-0000-0000-0000-00000000000a'),('private','c.pdf','00000000-0000-0000-0000-00000000000a');
select 'L12 ADM envia PDF e privado e lista tudo', count(*) from storage.objects;
