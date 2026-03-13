-- SQL bootstrap for Neon products table.
-- Usage:
--   psql "$NEON_DATABASE_URL" -f sql/products.sql
-- or paste the statements into the Neon SQL editor.

create table if not exists categories (
  id        serial primary key,
  slug      text not null unique,
  label     text not null,
  icon_key  text not null
);

create table if not exists subcategories (
  id             serial primary key,
  category_slug  text not null references categories(slug) on delete cascade,
  slug           text not null unique,
  label          text not null
);

create table if not exists products (
  id            bigserial primary key,
  slug          text not null unique,
  brand         text not null,
  title         text not null,
  category      text not null,
  subcategory   text not null,
  image_url     text not null,
  price         integer not null check (price > 0),
  mrp           integer check (mrp > 0),
  discount_text text,
  rating        numeric(3,1),
  created_at    timestamptz not null default now()
);

insert into products (
  slug,
  brand,
  title,
  category,
  subcategory,
  image_url,
  price,
  mrp,
  discount_text,
  rating
) values
  ('ausk-checkered-polo', 'AUSK', 'Men Checkered Polo Neck Cotton Blend T-Shirt', 'Fashion', 'Men T-Shirts', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', 266, 1499, '82% off', 4.3),
  ('hrx-colorblock-active', 'HRX', 'Active Men Colorblock Polo Neck Polyester T-Shirt', 'Fashion', 'Sportswear', 'https://images.unsplash.com/photo-1503342250622-88bf4c349d20?auto=format&fit=crop&w=600&q=80', 599, 1999, '70% off', 4.4),
  ('uspolo-slim-striped', 'U.S. POLO', 'Men Slim Fit Striped Pure Cotton Polo', 'Fashion', 'Premium Polo', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', 999, 2499, '60% off', 4.6),
  ('levis-pure-cotton', 'LEVIS', 'Men Solid Pure Cotton Polo Neck T-Shirt', 'Fashion', 'Casual Wear', 'https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=600&q=80', 1299, 2999, '57% off', 4.5),
  ('ketch-zipper-polo', 'KETCH', 'Men Slim Fit Heathered Polo with Zipper', 'Fashion', 'Everyday Polo', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80', 799, 2299, '65% off', 4.1),
  ('apple-iphone-air', 'Apple', 'iPhone Air (Sky Blue, 256 GB)', 'Mobiles', 'Smartphones', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80', 99900, 119900, '16% off', 4.7),
  ('fireboltt-ninja-talk', 'Fire-Boltt', 'Ninja Talk 35.3mm AMOLED Bluetooth Calling Watch', 'Wearables', 'Smart Watches', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80', 1099, 11999, '90% off', 4.8),
  ('uspolo-leather-sneaker', 'U.S. POLO', 'ASSN. Men Leather Low-Top Sneakers', 'Footwear', 'Sneakers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80', 1469, 3699, '60% off', 4.6),
  ('boat-nirvanaa-ion', 'boAt', 'Nirvanaa Ion with 120hrs Playback', 'Audio', 'True Wireless', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=500&q=80', 1499, 7990, '81% off', 4.2),
  ('apple-iphone-15', 'Apple', 'iPhone 15 (Midnight, 128 GB)', 'Mobiles', 'Smartphones', 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=80', 79900, 89900, '11% off', 4.8),
  ('adidas-ozweego', 'Adidas', 'Ozweego Chunky Sneakers', 'Footwear', 'Lifestyle Sneakers', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80', 8999, 11999, '25% off', 4.5)
  on conflict (slug) do update set
    brand = excluded.brand,
    title = excluded.title,
    category = excluded.category,
    subcategory = excluded.subcategory,
    image_url = excluded.image_url,
    price = excluded.price,
    mrp = excluded.mrp,
    discount_text = excluded.discount_text,
    rating = excluded.rating;

insert into categories (slug, label, icon_key) values
  ('for-you', 'For You', 'bag'),
  ('fashion', 'Fashion', 'fashion'),
  ('mobiles', 'Mobiles', 'mobile'),
  ('beauty', 'Beauty', 'beauty'),
  ('electronics', 'Electronics', 'electronics'),
  ('home', 'Home', 'home'),
  ('appliances', 'Appliances', 'appliance'),
  ('toys-baby', 'Toys & Baby', 'toys'),
  ('food-health', 'Food & Health', 'food'),
  ('auto-accessories', 'Auto Accessories', 'auto'),
  ('two-wheelers', '2 Wheelers', 'scooter'),
  ('sports-more', 'Sports & More', 'sports'),
  ('books-music', 'Books & Music', 'books'),
  ('furniture', 'Furniture', 'furniture')
  on conflict (slug) do update set
    label = excluded.label,
    icon_key = excluded.icon_key;

insert into subcategories (category_slug, slug, label) values
  ('fashion', 'men-tshirts', 'Men T-Shirts'),
  ('fashion', 'women-kurtas', 'Women Kurtas'),
  ('fashion', 'kids-wear', 'Kids Wear'),
  ('mobiles', 'android', 'Android Phones'),
  ('mobiles', 'ios', 'iOS Phones'),
  ('beauty', 'makeup', 'Makeup Essentials'),
  ('beauty', 'grooming', 'Men Grooming'),
  ('electronics', 'laptops', 'Laptops'),
  ('electronics', 'audio', 'Audio Devices'),
  ('home', 'decor', 'Home Decor'),
  ('home', 'kitchen', 'Kitchen & Dining'),
  ('appliances', 'ac', 'Air Conditioners'),
  ('appliances', 'washing-machines', 'Washing Machines'),
  ('sports-more', 'fitness', 'Fitness Gear'),
  ('books-music', 'novels', 'Novels & Literature')
  on conflict (slug) do update set
    category_slug = excluded.category_slug,
    label = excluded.label;
