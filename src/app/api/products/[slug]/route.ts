import { NextResponse } from "next/server";

import { sql } from "@/lib/neon";

type ProductDetailRow = {
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
  description: string | null;
  galleryUrls: string[];
  colorOptions: string[];
  sizeOptions: string[];
  highlights: string[];
};

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } },
) {
  const slug = params.slug;

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
        rating::float as rating,
        description,
        gallery_urls as "galleryUrls",
        color_options as "colorOptions",
        size_options as "sizeOptions",
        highlights
      from products
      where slug = ${slug}
      limit 1
    `) as ProductDetailRow[];

    if (products.length === 0) {
      return NextResponse.json({ status: "not_found" }, { status: 404 });
    }

    return NextResponse.json({ product: products[0] });
  } catch (error) {
    console.error(`Failed to load product ${slug}`, error);
    return NextResponse.json(
      { status: "error", message: "Unable to load product" },
      { status: 500 },
    );
  }
}
