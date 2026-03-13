import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { sql } from "@/lib/neon";

const MAX_QUANTITY = 10;

type CartItemRow = {
  id: number;
  productSlug: string;
  title: string;
  brand: string;
  imageUrl: string;
  color: string;
  size: string;
  quantity: number;
  unitPrice: number;
  addedAt: string;
};

const ensureAuthenticated = async () => {
  const user = await getSessionUser();
  if (!user) {
    throw new NextResponse(JSON.stringify({ message: "Please login to add items in cart" }), { status: 401 });
  }
  return user;
};

const sanitizeDimension = (value?: string | null) => {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 50);
};

export async function GET() {
  try {
    const user = await ensureAuthenticated();
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
      where ci.user_id = ${user.id}
      order by ci.added_at desc
    `) as CartItemRow[];

    return NextResponse.json({ items });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Failed to load cart", error);
    return NextResponse.json({ message: "Unable to load cart" }, { status: 500 });
  }
}

type AddBody = {
  productSlug?: string;
  color?: string;
  size?: string;
  quantity?: number;
  replaceExisting?: boolean;
};

export async function POST(request: Request) {
  try {
    const user = await ensureAuthenticated();
    const body = (await request.json()) as AddBody;
    const productSlug = body.productSlug?.trim();
    if (!productSlug) {
      return NextResponse.json({ message: "productSlug is required" }, { status: 400 });
    }

    const quantity = Number(body.quantity ?? 1);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return NextResponse.json({ message: "Quantity must be between 1 and 10" }, { status: 400 });
    }

    const color = sanitizeDimension(body.color);
    const size = sanitizeDimension(body.size);
    const replaceExisting = Boolean(body.replaceExisting);

    const [product] = await sql`
      select slug, price
      from products
      where slug = ${productSlug}
      limit 1
    ` as { slug: string; price: number }[];

    if (!product) {
      return NextResponse.json({ message: "Product not found" }, { status: 404 });
    }

    if (replaceExisting) {
      await sql`
        delete from cart_items
        where user_id = ${user.id}
      `;
    }

    const [cartItem] = await sql`
      insert into cart_items (user_id, product_slug, color, size, quantity, unit_price)
      values (${user.id}, ${product.slug}, ${color}, ${size}, ${quantity}, ${product.price})
      on conflict (user_id, product_slug, color, size)
      do update set
        quantity = LEAST(cart_items.quantity + EXCLUDED.quantity, ${MAX_QUANTITY}),
        unit_price = EXCLUDED.unit_price
      returning id, product_slug as "productSlug", color, size, quantity, unit_price as "unitPrice"
    ` as Array<Pick<CartItemRow, "id" | "productSlug" | "color" | "size" | "quantity" | "unitPrice">>;

    return NextResponse.json({ item: cartItem }, { status: 201 });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Failed to add to cart", error);
    return NextResponse.json({ message: "Unable to add to cart" }, { status: 500 });
  }
}

type UpdateBody = {
  id?: number;
  quantity?: number;
};

export async function PATCH(request: Request) {
  try {
    const user = await ensureAuthenticated();
    const body = (await request.json()) as UpdateBody;
    const id = Number(body.id);
    const quantity = Number(body.quantity);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Valid cart item id is required" }, { status: 400 });
    }
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      return NextResponse.json({ message: "Quantity must be between 1 and 10" }, { status: 400 });
    }

    const [updated] = await sql`
      update cart_items
      set quantity = ${quantity}
      where id = ${id} and user_id = ${user.id}
      returning id, quantity
    ` as { id: number; quantity: number }[];

    if (!updated) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ item: updated });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Failed to update cart item", error);
    return NextResponse.json({ message: "Unable to update cart item" }, { status: 500 });
  }
}

type RemoveBody = {
  id?: number;
};

export async function DELETE(request: Request) {
  try {
    const user = await ensureAuthenticated();
    const body = (await request.json()) as RemoveBody;
    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json({ message: "Valid cart item id is required" }, { status: 400 });
    }

    const [deleted] = await sql`
      delete from cart_items
      where id = ${id} and user_id = ${user.id}
      returning id
    ` as { id: number }[];

    if (!deleted) {
      return NextResponse.json({ message: "Cart item not found" }, { status: 404 });
    }

    return NextResponse.json({ id: deleted.id });
  } catch (error) {
    if (error instanceof NextResponse) {
      return error;
    }
    console.error("Failed to remove cart item", error);
    return NextResponse.json({ message: "Unable to remove cart item" }, { status: 500 });
  }
}
