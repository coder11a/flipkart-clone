import { sql } from "@/lib/neon";
import type { OrderSummary } from "@/types/order";

export async function fetchUserOrders(userId: number): Promise<OrderSummary[]> {
  const orders = (await sql`
    select
      o.id,
      o.total_amount as "totalAmount",
      o.payment_method as "paymentMethod",
      o.status,
      o.created_at as "createdAt",
      o.shipping_name as "shippingName",
      o.shipping_address1 as "shippingAddress1",
      o.shipping_address2 as "shippingAddress2",
      o.shipping_city as "shippingCity",
      o.shipping_state as "shippingState",
      o.shipping_postal_code as "shippingPostalCode",
      coalesce(
        json_agg(
          json_build_object(
            'productSlug', oi.product_slug,
            'title', oi.title,
            'brand', oi.brand,
            'color', oi.color,
            'size', oi.size,
            'quantity', oi.quantity,
            'unitPrice', oi.unit_price
          )
        ) filter (where oi.id is not null),
        '[]'
      ) as items
    from orders o
    left join order_items oi on oi.order_id = o.id
    where o.user_id = ${userId}
    group by o.id
    order by o.created_at desc
  `) as OrderSummary[];

  return orders;
}
