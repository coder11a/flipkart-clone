-- Orders storage. Run after users, products, and cart tables exist.
--   psql "$NEON_DATABASE_URL" -f sql/orders.sql

create table if not exists orders (
  id               bigserial primary key,
  user_id          bigint not null references users(id) on delete cascade,
  total_amount     integer not null check (total_amount > 0),
  payment_method   text not null,
  shipping_name    text not null,
  shipping_phone   text not null,
  shipping_address1 text not null,
  shipping_address2 text,
  shipping_city    text not null,
  shipping_state   text not null,
  shipping_postal_code text not null,
  status           text not null default 'placed',
  created_at       timestamptz not null default now()
);

create table if not exists order_items (
  id           bigserial primary key,
  order_id     bigint not null references orders(id) on delete cascade,
  product_slug text not null references products(slug),
  title        text not null,
  brand        text not null,
  color        text not null,
  size         text not null,
  quantity     integer not null check (quantity > 0),
  unit_price   integer not null check (unit_price > 0)
);
