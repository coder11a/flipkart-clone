import { NextResponse } from "next/server";

import { sql } from "@/lib/neon";

type ProductSuggestion = {
  slug: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limitParam = Number(searchParams.get("limit"));
  const limit = Number.isFinite(limitParam) && limitParam > 0 && limitParam <= 10 ? limitParam : 5;

  if (query.length < 2) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = (await sql`
      select
        slug,
        title,
        brand,
        price,
        image_url as "imageUrl"
      from products
      where title ilike ${"%" + query + "%"} or brand ilike ${"%" + query + "%"}
      order by created_at desc
      limit ${limit}
    `) as ProductSuggestion[];

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Failed to search products", error);
    return NextResponse.json({ products: [] }, { status: 500 });
  }
}
