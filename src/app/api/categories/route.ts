import { NextResponse } from "next/server";

import { sql } from "@/lib/neon";

type CategoryRow = {
  slug: string;
  label: string;
  iconKey: string;
};

type SubcategoryRow = {
  slug: string;
  label: string;
  categorySlug: string;
};

export async function GET() {
  try {
    const categories = (await sql`
      select slug, label, icon_key as "iconKey"
      from categories
      order by id
    `) as CategoryRow[];

    const subcategories = (await sql`
      select slug, label, category_slug as "categorySlug"
      from subcategories
      order by category_slug, label
    `) as SubcategoryRow[];

    return NextResponse.json({ categories, subcategories });
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return NextResponse.json(
      { status: "error", message: "Unable to load categories" },
      { status: 500 },
    );
  }
}
