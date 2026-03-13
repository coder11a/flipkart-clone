-- Shopping cart storage. Run after users/products tables exist.
--   psql "$NEON_DATABASE_URL" -f sql/cart.sql

create table if not exists cart_items (
  id            bigserial primary key,
  user_id       bigint not null references users(id) on delete cascade,
  product_slug  text not null references products(slug) on delete cascade,
  color         text not null default '',
  size          text not null default '',
  quantity      integer not null check (quantity > 0),
  unit_price    integer not null check (unit_price > 0),
  added_at      timestamptz not null default now(),
  unique (user_id, product_slug, color, size)
);
