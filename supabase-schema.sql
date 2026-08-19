-- À exécuter dans Supabase > SQL Editor > New query > Run

create table dates (
  id serial primary key,
  label text not null,
  event_date date not null,
  total_spots int not null default 150
);

create table reservations (
  id serial primary key,
  date_id int references dates(id) not null,
  tarif text not null,
  quantity int not null default 1,
  amount_total int not null,
  customer_email text,
  stripe_session_id text unique,
  status text not null default 'pending',
  created_at timestamptz default now()
);

-- Les 4 dates de la saison 2026 (places partagées entre tous les tarifs)
insert into dates (label, event_date, total_spots) values
  ('26-27 septembre 2026', '2026-09-26', 150),
  ('3-4 octobre 2026', '2026-10-03', 150),
  ('10-11 octobre 2026', '2026-10-10', 150),
  ('17-18 octobre 2026', '2026-10-17', 150);
