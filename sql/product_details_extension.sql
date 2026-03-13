-- Additional product detail fields and enriched data.
-- Run after `sql/products.sql` has been applied:
--   psql "$NEON_DATABASE_URL" -f sql/product_details_extension.sql

alter table products
  add column if not exists description text,
  add column if not exists gallery_urls text[] default array[]::text[],
  add column if not exists color_options text[] default array[]::text[],
  add column if not exists size_options text[] default array[]::text[],
  add column if not exists highlights text[] default array[]::text[];

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
  rating,
  description,
  gallery_urls,
  color_options,
  size_options,
  highlights
) values
  ('ausk-checkered-polo', 'AUSK', 'Men Checkered Polo Neck Cotton Blend T-Shirt', 'Fashion', 'Men T-Shirts', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80', 266, 1499, '82% off', 4.3,
    'Fresh cotton polos built for everyday comfort.',
    array[
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=600&q=80'
    ],
    array['Navy', 'Charcoal', 'Wine'],
    array['S','M','L','XL','XXL'],
    array['Cotton-rich fabric','Ribbed collar','Machine washable']
  ),
  ('hrx-colorblock-active', 'HRX', 'Active Men Colorblock Polo Neck Polyester T-Shirt', 'Fashion', 'Sportswear', 'https://images.unsplash.com/photo-1503342250622-88bf4c349d20?auto=format&fit=crop&w=600&q=80', 599, 1999, '70% off', 4.4,
    'Performance polos designed for intense training sessions.',
    array[
      'https://images.unsplash.com/photo-1503342250622-88bf4c349d20?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80'
    ],
    array['Black/Blue','White/Orange','Grey/Green'],
    array['S','M','L','XL'],
    array['Sweat-wicking polyester','4-way stretch','Reflective trims']
  ),
  ('uspolo-slim-striped', 'U.S. POLO', 'Men Slim Fit Striped Pure Cotton Polo', 'Fashion', 'Premium Polo', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80', 999, 2499, '60% off', 4.6,
    'Iconic stripes with a tailored silhouette.',
    array[
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1503342250622-88bf4c349d20?auto=format&fit=crop&w=600&q=80'
    ],
    array['Navy/Green','White/Blue'],
    array['S','M','L','XL'],
    array['Mercerized cotton','Slim fit cut','Two-button placket']
  ),
  ('levis-pure-cotton', 'LEVIS', 'Men Solid Pure Cotton Polo Neck T-Shirt', 'Fashion', 'Casual Wear', 'https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=600&q=80', 1299, 2999, '57% off', 4.5,
    'Everyday polos with signature Levi''s detailing.',
    array[
      'https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=600&q=80'
    ],
    array['Black','White','Olive'],
    array['S','M','L','XL','XXL'],
    array['Pure cotton pique','Side slits','Contrast Levi''s tab']
  ),
  ('ketch-zipper-polo', 'KETCH', 'Men Slim Fit Heathered Polo with Zipper', 'Fashion', 'Everyday Polo', 'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80', 799, 2299, '65% off', 4.1,
    'Minimal zipper placket with breathable knit.',
    array[
      'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
    ],
    array['Maroon','Grey','Teal'],
    array['S','M','L','XL'],
    array['Heathered texture','Zipper placket','Tailored hem']
  ),
  ('apple-iphone-air', 'Apple', 'iPhone Air (Sky Blue, 256 GB)', 'Mobiles', 'Smartphones', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80', 99900, 119900, '16% off', 4.7,
    'Feather-light flagship performance with Pro-grade cameras.',
    array[
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=80'
    ],
    array['Sky Blue','Midnight','Starlight'],
    array['128 GB','256 GB','512 GB'],
    array['A17 chipset','Super Retina display','48MP + 12MP cameras']
  ),
  ('fireboltt-ninja-talk', 'Fire-Boltt', 'Ninja Talk 35.3mm AMOLED Bluetooth Calling Watch', 'Wearables', 'Smart Watches', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80', 1099, 11999, '90% off', 4.8,
    'Vibrant AMOLED smartwatch with calling and 120 sports modes.',
    array[
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1584589167171-d78d355f6078?auto=format&fit=crop&w=500&q=80'
    ],
    array['Black','Silver','Ocean Blue'],
    array['Free size'],
    array['AMOLED display','BT calling','SpO2 monitor']
  ),
  ('uspolo-leather-sneaker', 'U.S. POLO', 'ASSN. Men Leather Low-Top Sneakers', 'Footwear', 'Sneakers', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80', 1469, 3699, '60% off', 4.6,
    'Premium low-top sneakers for smart casual looks.',
    array[
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1497015289639-54688650d173?auto=format&fit=crop&w=500&q=80'
    ],
    array['Tan','White','Navy'],
    array['UK 7','UK 8','UK 9','UK 10'],
    array['Genuine leather upper','Cushioned footbed','Contrast outsole']
  ),
  ('boat-nirvanaa-ion', 'boAt', 'Nirvanaa Ion with 120hrs Playback', 'Audio', 'True Wireless', 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=500&q=80', 1499, 7990, '81% off', 4.2,
    'Flagship earbuds with dual EQ and beast mode latency.',
    array[
      'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80'
    ],
    array['Black','Ivory'],
    array['Standard'],
    array['120hrs playback','Dual mics','BEAST gaming mode']
  ),
  ('apple-iphone-15', 'Apple', 'iPhone 15 (Midnight, 128 GB)', 'Mobiles', 'Smartphones', 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=80', 79900, 89900, '11% off', 4.8,
    'Dynamic island design with advanced camera system.',
    array[
      'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=500&q=80'
    ],
    array['Midnight','Pink','Blue'],
    array['128 GB','256 GB'],
    array['A16 Bionic','Crash detection','All-day battery']
  ),
  ('adidas-ozweego', 'Adidas', 'Ozweego Chunky Sneakers', 'Footwear', 'Lifestyle Sneakers', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80', 8999, 11999, '25% off', 4.5,
    'Retro-inspired chunky sneakers with Adiprene cushioning.',
    array[
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=500&q=80'
    ],
    array['White','Neon Green'],
    array['UK 6','UK 7','UK 8','UK 9'],
    array['Adiprene cushioning','Mesh + suede upper','Stability overlays']
  )
  on conflict (slug) do update set
    brand = excluded.brand,
    title = excluded.title,
    category = excluded.category,
    subcategory = excluded.subcategory,
    image_url = excluded.image_url,
    price = excluded.price,
    mrp = excluded.mrp,
    discount_text = excluded.discount_text,
    rating = excluded.rating,
    description = excluded.description,
    gallery_urls = excluded.gallery_urls,
    color_options = excluded.color_options,
    size_options = excluded.size_options,
    highlights = excluded.highlights;
