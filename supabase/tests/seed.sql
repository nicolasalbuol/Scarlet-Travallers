select set_config('request.jwt.claims','',false) \g /dev/null
insert into auth.users values ('00000000-0000-0000-0000-00000000000a','adm@x.com'),('00000000-0000-0000-0000-00000000000b','vitima@x.com'),('00000000-0000-0000-0000-00000000000c','atacante@x.com'),('00000000-0000-0000-0000-00000000000d','mestre@x.com');
update profiles set role='admin' where email='adm@x.com';
insert into records(id,entity,data,created_by) values
 ('11111111-1111-1111-1111-111111111111','Character','{"name":"Ficha da Vítima","share_token":"VIEWTOKEN123456789","edit_token":"EDITTOKEN987654321"}','vitima@x.com'),
 ('22222222-2222-2222-2222-222222222222','Campanha','{"title":"Campanha do Mestre","master_email":"mestre@x.com","invite_code":"ABC123","notas_secretas":"plot twist","members":[{"user_email":"vitima@x.com","character_id":"11111111-1111-1111-1111-111111111111","character_name":"Ficha da Vítima"}]}','mestre@x.com');
