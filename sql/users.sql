create table if not exists users (
  id bigserial primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists users_email_idx on users (email);
