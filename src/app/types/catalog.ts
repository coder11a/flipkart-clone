export type ProductApiDto = {
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

export type CategoryApiDto = {
  slug: string;
  label: string;
  iconKey: string;
};

export type SubcategoryApiDto = {
  slug: string;
  label: string;
  categorySlug: string;
};
