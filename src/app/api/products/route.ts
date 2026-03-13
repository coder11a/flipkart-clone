import { NextResponse } from "next/server";

import { sql } from "@/lib/neon";

type ProductRow = {
  slug: string;
  brand: string;
  title: string;
  category: string;
  subcategory: string;
  imageUrl: string;
  price: number;
  mrp: number | null;
  discountText: string | null;
  rating: number | null;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 50 ? limitParam : 20;
  const categoryLabel = searchParams.get("categoryLabel")?.trim();
  const subcategoryLabel = searchParams.get("subcategoryLabel")?.trim();

  try {
    const products = (await sql`
      select
        slug,
        brand,
        title,
        category,
        subcategory,
        image_url as "imageUrl",
        price,
        mrp,
        discount_text as "discountText",
        rating::float as rating
      from products
      where 1=1
      ${categoryLabel ? sql`and lower(category) = lower(${categoryLabel})` : sql``}
      ${subcategoryLabel ? sql`and lower(subcategory) = lower(${subcategoryLabel})` : sql``}
      order by created_at desc
      limit ${limit}
    `) as ProductRow[];

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to load products from Neon", error);
    return NextResponse.json(
      { status: "error", message: "Unable to load products" },
      { status: 500 },
    );
  }
}
