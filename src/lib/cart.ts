import { sql } from "@/lib/neon";
import type { CartItem } from "@/types/cart";

export async function fetchCartItems(userId: number): Promise<CartItem[]> {
  const items = (await sql`
    select
      ci.id,
      ci.product_slug as "productSlug",
      ci.color,
      ci.size,
      ci.quantity,
      ci.unit_price as "unitPrice",
      ci.added_at as "addedAt",
      p.title,
      p.brand,
      p.image_url as "imageUrl"
    from cart_items ci
    join products p on p.slug = ci.product_slug
    where ci.user_id = ${userId}
    order by ci.added_at desc
  `) as CartItem[];

  return items;
}
