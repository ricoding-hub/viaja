-- ============================================================
-- seed_demo_for(owner) — reproduces the Puerto Escondido demo
-- (+ Valle de Bravo, Roma & Condesa) for a new user, so the app
-- feels alive on first login. Demo companions are profiles with
-- user_id null / is_demo true so they can carry votes.
-- ============================================================
create or replace function seed_demo_for(p_owner uuid) returns void
language plpgsql security definer set search_path = public as $$
declare
  p_ale uuid; p_memo uuid; p_sofi uuid; p_dani uuid;
  t_pxm uuid; t_val uuid; t_cdmx uuid;
  o_h1 uuid; o_h2 uuid; o_h3 uuid; o_t1 uuid; o_t2 uuid;
  o_a1 uuid; o_a2 uuid; o_a3 uuid; o_c1 uuid;
  d1 uuid; d2 uuid; d3 uuid; d4 uuid; d5 uuid;
begin
  -- companions
  insert into profiles(name,initials,color,is_demo) values ('Ale','A','#FF6F5C',true) returning id into p_ale;
  insert into profiles(name,initials,color,is_demo) values ('Memo','M','#7C6CF0',true) returning id into p_memo;
  insert into profiles(name,initials,color,is_demo) values ('Sofi','S','#FFB43E',true) returning id into p_sofi;
  insert into profiles(name,initials,color,is_demo) values ('Dani','D','#0E8AA6',true) returning id into p_dani;

  -- trips
  insert into trips(owner_id,name,sub,tone,emoji,status,start_date,end_date,people_count)
    values (p_owner,'Puerto Escondido','Cumple de Ale 🎂','pool','🏝️','planeando','2026-06-19','2026-06-23',5) returning id into t_pxm;
  insert into trips(owner_id,name,sub,tone,emoji,status,people_count)
    values (p_owner,'Valle de Bravo','Escape de fin de semana','palm','⛰️','idea',6) returning id into t_val;
  insert into trips(owner_id,name,sub,tone,emoji,status,people_count)
    values (p_owner,'Roma & Condesa','Finde gastronómico','grape','🌮','completado',4) returning id into t_cdmx;

  -- members
  insert into trip_members(trip_id,user_id,role,confirmed) values
    (t_pxm,p_owner,'host',true),(t_pxm,p_ale,'host',true),(t_pxm,p_memo,'guest',true),(t_pxm,p_sofi,'guest',true),(t_pxm,p_dani,'guest',false),
    (t_val,p_owner,'host',true),(t_val,p_ale,'host',true),(t_val,p_memo,'guest',false),
    (t_cdmx,p_owner,'host',true),(t_cdmx,p_ale,'host',true),(t_cdmx,p_memo,'guest',true),(t_cdmx,p_sofi,'guest',true);

  -- options (Puerto Escondido)
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'hospedaje','pool','🏝️','Casa Aleta','Villa con alberca privada · Zicatela',13500,'total','5 noches · toda la casa','[["Alberca","Privada"],["Recámaras","3"],["A la playa","4 min"]]','airbnb.com/casa-aleta',true,p_owner) returning id into o_h1;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'hospedaje','palm','🌿','Selva Suites','Bungalows boutique · La Punta',11000,'total','5 noches · 3 bungalows','[["Alberca","Compartida"],["Recámaras","3"],["A la playa","2 min"]]','airbnb.com/selva-suites',false,p_owner) returning id into o_h2;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'hospedaje','sunset','🛏️','Hotel Marea','Hotel frente al mar · Zicatela',16200,'total','5 noches · 3 cuartos','[["Alberca","Rooftop"],["Cuartos","3"],["A la playa","0 min"]]','booking.com/marea',false,p_owner) returning id into o_h3;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'transporte','pool','✈️','Volaris directo','MEX → PXM · vuelo redondo',2380,'pp','por persona · redondo','[["Duración","1h 10m"],["Escalas","Directo"],["Maleta","Incluida"]]','volaris.com',true,p_owner) returning id into o_t1;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'transporte','grape','🚐','Roadtrip en van','Renta de van · 7h de camino',1450,'pp','gasolina + casetas + renta ÷ 5','[["Duración","7h"],["Flexible","Sí"],["Vibe","Aventura"]]','nota de Ale',false,p_owner) returning id into o_t2;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'actividades','night','🐬','Bioluminiscencia','Tour nocturno en laguna de Manialtepec',650,'pp','por persona · incluye guía','[["Duración","3h"],["Horario","Noche"],["Wow","★★★★★"]]','tiktok.com/@viajespxm',true,p_owner) returning id into o_a1;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'actividades','sunset','🏄','Clase de surf','Para principiantes · playa Carrizalillo',500,'pp','por persona · 2h con tabla','[["Duración","2h"],["Nivel","Principiante"],["Tabla","Incluida"]]','instagram.com/surfpxm',true,p_owner) returning id into o_a2;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'actividades','palm','🐢','Liberación de tortugas','Atardecer en Bahías de Chacahua',0,'pp','gratis · donativo sugerido','[["Duración","1h"],["Horario","Atardecer"],["Costo","Donativo"]]','nota de Sofi',false,p_owner) returning id into o_a3;
  insert into options(trip_id,cat,tone,emoji,title,subtitle,price,unit,price_note,meta,link,winner,created_by) values
    (t_pxm,'comida','coral','🍤','Plan gastronómico','Mezcla de market + restaurantes',480,'ppd','estimado por persona / día','[["Desayunos","En casa"],["Cenas","Fuera"],["Mezcal","Incluido 😏"]]','estimado del grupo',true,p_owner) returning id into o_c1;

  -- votes
  insert into votes(option_id,user_id,rating) values
    (o_h1,p_owner,5),(o_h1,p_ale,5),(o_h1,p_memo,4),(o_h1,p_sofi,5),
    (o_h2,p_owner,4),(o_h2,p_ale,3),(o_h2,p_memo,5),(o_h2,p_sofi,4),
    (o_h3,p_owner,3),(o_h3,p_ale,4),(o_h3,p_memo,3),(o_h3,p_sofi,3),
    (o_t1,p_owner,5),(o_t1,p_ale,4),(o_t1,p_memo,4),(o_t1,p_sofi,5),
    (o_t2,p_owner,3),(o_t2,p_ale,5),(o_t2,p_memo,2),(o_t2,p_sofi,3),
    (o_a1,p_owner,5),(o_a1,p_ale,5),(o_a1,p_memo,5),(o_a1,p_sofi,4),
    (o_a2,p_owner,4),(o_a2,p_ale,5),(o_a2,p_memo,5),(o_a2,p_sofi,5),
    (o_a3,p_owner,4),(o_a3,p_ale,4),(o_a3,p_memo,3),(o_a3,p_sofi,5),
    (o_c1,p_owner,4),(o_c1,p_ale,4),(o_c1,p_memo,4),(o_c1,p_sofi,4);

  -- research
  insert into research(trip_id,type,cat,tone,title,source,note,saved_by,converted_option_id) values
    (t_pxm,'tiktok','actividades','night','POV: la laguna brilla de noche 🌊✨','tiktok.com/@viajespxm','Bioluminiscencia — dicen que junio es la mejor época',p_ale,o_a1),
    (t_pxm,'flight','transporte','pool','Volaris MEX–PXM $2,380 redondo','volaris.com','Precio baja si compramos antes del 15 de junio',p_owner,o_t1),
    (t_pxm,'link','hospedaje','pool','Casa Aleta — alberca privada 🏝️','airbnb.com/casa-aleta','3 recámaras, cabe perfecto, a 4 min de la playa',p_owner,o_h1),
    (t_pxm,'note','comida','coral','Lista de antojos 🍤','Nota','Tacos del Carmen, Almoraduz, mercado de Zicatela, mezcalería de La Punta',p_sofi,null),
    (t_pxm,'link','actividades','sunset','Surf en Carrizalillo para novatos','instagram.com/surfpxm','Clase grupal, nos dan descuento si somos +4',p_memo,o_a2),
    (t_pxm,'note','general','grape','Idea: pastel sorpresa 🎂 para Ale','Nota','Encargar pastel para la noche del cumpleaños (no decirle 🤫)',p_owner,null);

  -- itinerary
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,1,'Vie 19 jun','Llegada & La Punta','sunset') returning id into d1;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,2,'Sáb 20 jun','Surf & playa','pool') returning id into d2;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,3,'Dom 21 jun','🎂 Cumple de Ale','coral') returning id into d3;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,4,'Lun 22 jun','Bioluminiscencia','night') returning id into d4;
  insert into itinerary_days(trip_id,day,date,title,tone) values (t_pxm,5,'Mar 23 jun','Despedida','palm') returning id into d5;
  insert into itinerary_items(day_id,idx,emoji,text) values
    (d1,0,'✈️','Vuelo MEX–PXM 9:40am'),(d1,1,'🏝️','Check-in Casa Aleta'),(d1,2,'🌅','Atardecer + cena en La Punta'),
    (d2,0,'🏄','Clase de surf en Carrizalillo'),(d2,1,'🥥','Tarde de alberca'),(d2,2,'🍤','Cena de mariscos'),
    (d3,0,'🛥️','Tour de bahías'),(d3,1,'🐢','Liberación de tortugas'),(d3,2,'🎉','¡Fiesta sorpresa en la casa!'),
    (d4,0,'😴','Mañana libre'),(d4,1,'🛍️','Mercado de Zicatela'),(d4,2,'🐬','Tour nocturno bioluminiscente'),
    (d5,0,'🥞','Brunch en La Punta'),(d5,1,'🧳','Check-out'),(d5,2,'✈️','Vuelo de regreso 6:10pm');
end $$;

-- ============================================================
-- On signup: create the user's profile and seed their demo.
-- ============================================================
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare pid uuid; nm text; ini text;
begin
  nm := coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email,'@',1), 'Viajero');
  ini := upper(left(nm, 1));
  insert into profiles(user_id, name, initials, color) values (new.id, nm, ini, '#11BFB2') returning id into pid;
  perform seed_demo_for(pid);
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
