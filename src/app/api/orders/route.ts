import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/neon";

const PAYMENT_METHOD = "Cash on Delivery";

const sanitize = (value?: string) => value?.trim() ?? "";

const requiredFields = [
  "shippingName",
  "shippingPhone",
  "shippingAddress1",
  "shippingCity",
  "shippingState",
  "shippingPostalCode",
] as const;

type RequiredField = (typeof requiredFields)[number];

type CheckoutPayload = Record<RequiredField | "shippingAddress2", string>;

type CartRow = {
  productSlug: string;
  title: string;
  brand: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
};

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: "Please login" }, { status: 401 });
    }

    const payload = (await request.json()) as CheckoutPayload;
    const data = Object.fromEntries(
      Object.entries(payload).map(([key, value]) => [key, sanitize(value)]),
    ) as CheckoutPayload;

    const missingField = requiredFields.find((field) => !data[field]);
    if (missingField) {
      return NextResponse.json({ message: `${missingField} is required` }, { status: 400 });
    }

    const items = (await sql`
      select
        ci.product_slug as "productSlug",
        ci.color,
        ci.size,
        ci.quantity,
        ci.unit_price as "unitPrice",
        p.title,
        p.brand
      from cart_items ci
      join products p on p.slug = ci.product_slug
      where ci.user_id = ${user.id}
    `) as CartRow[];

    if (!items.length) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const [order] = await sql`
      insert into orders (
        user_id,
        total_amount,
        payment_method,
        shipping_name,
        shipping_phone,
        shipping_address1,
        shipping_address2,
        shipping_city,
        shipping_state,
        shipping_postal_code
      ) values (
        ${user.id},
        ${totalAmount},
        ${PAYMENT_METHOD},
        ${data.shippingName},
        ${data.shippingPhone},
        ${data.shippingAddress1},
        ${data.shippingAddress2 ?? ""},
        ${data.shippingCity},
        ${data.shippingState},
        ${data.shippingPostalCode}
      )
      returning id
    ` as { id: number }[];

    const orderId = order.id;

    for (const item of items) {
      await sql`
        insert into order_items (
          order_id,
          product_slug,
          title,
          brand,
          color,
          size,
          quantity,
          unit_price
        ) values (
          ${orderId},
          ${item.productSlug},
          ${item.title},
          ${item.brand},
          ${item.color},
          ${item.size},
          ${item.quantity},
          ${item.unitPrice}
        )
      `;
    }

    await sql`delete from cart_items where user_id = ${user.id}`;

    return NextResponse.json({ orderId }, { status: 201 });
  } catch (error) {
    console.error("Failed to place order", error);
    return NextResponse.json({ message: "Unable to place order" }, { status: 500 });
  }
}
