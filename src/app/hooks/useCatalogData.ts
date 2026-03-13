"use client";

import { useEffect, useMemo, useState } from "react";

import { ProductCardProps } from "../components/ProductCard";
import { formatCurrency } from "../components/categoryContent";
import { CategoryApiDto, ProductApiDto, SubcategoryApiDto } from "../types/catalog";

type CatalogFilterOptions = {
  categorySlug?: string;
  subcategorySlug?: string;
  productLimit?: number;
};

type CatalogHookReturn = {
  categories: CategoryApiDto[];
  subcategories: SubcategoryApiDto[];
  categoriesLoading: boolean;
  categoriesError: string | null;
  products: ProductCardProps[];
  productsLoading: boolean;
  productsError: string | null;
  selectedCategory?: CategoryApiDto;
  selectedSubcategory?: SubcategoryApiDto;
};

export const useCatalogData = ({ categorySlug, subcategorySlug, productLimit = 16 }: CatalogFilterOptions): CatalogHookReturn => {
  const [categories, setCategories] = useState<CategoryApiDto[]>([]);
  const [subcategories, setSubcategories] = useState<SubcategoryApiDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const [products, setProducts] = useState<ProductCardProps[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const loadCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const response = await fetch("/api/categories", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load categories: ${response.status}`);
        }

        const data = await response.json();
        if (!isCancelled) {
          const categoriesData = Array.isArray(data?.categories) ? (data.categories as CategoryApiDto[]) : [];
          const subcategoriesData = Array.isArray(data?.subcategories) ? (data.subcategories as SubcategoryApiDto[]) : [];
          setCategories(categoriesData);
          setSubcategories(subcategoriesData);
          if (!categoriesData.length) {
            setCategoriesError("No categories found");
          }
        }
      } catch (error) {
        console.error("Failed to fetch categories", error);
        if (!isCancelled) {
          setCategoriesError("Unable to load categories right now");
        }
      } finally {
        if (!isCancelled) {
          setCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isCancelled = true;
    };
  }, []);

  const selectedCategory = useMemo(() => {
    if (!categories.length) return undefined;
    if (!categorySlug) {
      return categories[0];
    }
    return categories.find((category) => category.slug === categorySlug) ?? categories[0];
  }, [categories, categorySlug]);

  const selectedSubcategory = useMemo(() => {
    if (!subcategorySlug || !selectedCategory) return undefined;
    return (
      subcategories.find(
        (subcategory) => subcategory.slug === subcategorySlug && subcategory.categorySlug === selectedCategory.slug,
      ) ?? undefined
    );
  }, [subcategorySlug, subcategories, selectedCategory]);

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      setProductsLoading(true);
      setProductsError(null);
      try {
        const params = new URLSearchParams({ limit: String(productLimit) });
        if (selectedCategory?.label) {
          params.set("categoryLabel", selectedCategory.label);
        }
        if (selectedSubcategory?.label) {
          params.set("subcategoryLabel", selectedSubcategory.label);
        }

        const response = await fetch(`/api/products?${params.toString()}`, { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load products: ${response.status}`);
        }

        const data = (await response.json()) as { products?: ProductApiDto[] };
        const mapped = Array.isArray(data?.products)
          ? data.products.map((product) => ({
              slug: product.slug,
              image: product.imageUrl,
              brand: product.brand,
              title: product.title,
              category: product.category,
              subcategory: product.subcategory,
              price: formatCurrency(product.price) ?? "₹0",
              mrp: formatCurrency(product.mrp),
              discountText: product.discountText ?? undefined,
              rating: product.rating ?? undefined,
            }))
          : [];

        if (!isCancelled) {
          setProducts(mapped);
          if (!mapped.length) {
            setProductsError("No products found for this category");
          }
        }
      } catch (error) {
        console.error("Failed to load catalog products", error);
        if (!isCancelled) {
          setProductsError("Unable to load products right now");
          setProducts([]);
        }
      } finally {
        if (!isCancelled) {
          setProductsLoading(false);
        }
      }
    };

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, [selectedCategory?.label, selectedSubcategory?.label, productLimit]);

  return {
    categories,
    subcategories,
    categoriesLoading,
    categoriesError,
    products,
    productsLoading,
    productsError,
    selectedCategory,
    selectedSubcategory,
  };
};
