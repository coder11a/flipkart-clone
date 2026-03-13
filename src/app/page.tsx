"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import ProductCard, { ProductCardProps } from "./components/ProductCard";
import SiteHeaderTop from "./components/SiteHeaderTop";
import {
  categoryIcons,
  containerClass,
  formatCurrency,
  heroBanners,
  resolveIconKey,
} from "./components/categoryContent";

type ProductApiDto = {
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

type CategoryApiDto = {
  slug: string;
  label: string;
  iconKey: string;
};

type SubcategoryApiDto = {
  slug: string;
  label: string;
  categorySlug: string;
};

const ArrowButton = ({ direction }: { direction: "left" | "right" }) => (
  <button
    className="absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/60 bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40 md:flex"
    aria-label={`${direction === "left" ? "Previous" : "Next"} slide`}
    style={direction === "left" ? { left: "0.5rem" } : { right: "0.5rem" }}
  >
    <svg
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      viewBox="0 0 24 24"
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
      )}
    </svg>
  </button>
);



export default function Home() {
  const [showCategories, setShowCategories] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState<ProductCardProps[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  const [navCategories, setNavCategories] = useState<CategoryApiDto[]>([]);
  const [navSubcategories, setNavSubcategories] = useState<SubcategoryApiDto[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  const gridProductSelection = useMemo(() => suggestedProducts.slice(0, 8), [suggestedProducts]);
  const stillLookingProducts = useMemo(() => {
    if (!suggestedProducts.length) {
      return [] as ProductCardProps[];
    }
    const shuffled = [...suggestedProducts];
    for (let i = shuffled.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 6);
  }, [suggestedProducts]);

  const subcategoriesByCategory = useMemo(() => {
    return navSubcategories.reduce<Record<string, SubcategoryApiDto[]>>((acc, subcategory) => {
      if (!acc[subcategory.categorySlug]) {
        acc[subcategory.categorySlug] = [];
      }
      acc[subcategory.categorySlug].push(subcategory);
      return acc;
    }, {} as Record<string, SubcategoryApiDto[]>);
  }, [navSubcategories]);

  const featuredCategoryCards = useMemo(() => {
    return navCategories.slice(0, 6).map((category) => ({
      category,
      subcategories: (subcategoriesByCategory[category.slug] ?? []).slice(0, 4),
    }));
  }, [navCategories, subcategoriesByCategory]);

  useEffect(() => {
    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      if (currentScroll <= 0) {
        setShowCategories(true);
        lastScrollY = 0;
        return;
      }
      if (currentScroll > lastScrollY + 10) {
        setShowCategories(false);
      } else if (currentScroll < lastScrollY - 10) {
        setShowCategories(true);
      }
      lastScrollY = currentScroll;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadProducts = async () => {
      try {
        const response = await fetch("/api/products?limit=8", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load products: ${response.status}`);
        }

        const data = await response.json();
        const mapped = Array.isArray(data?.products)
          ? (data.products as ProductApiDto[]).map((product) => ({
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
          setSuggestedProducts(mapped);
          setProductsError(mapped.length === 0 ? "No products found" : null);
        }
      } catch (error) {
        console.error("Failed to fetch suggested products", error);
        if (!isCancelled) {
          setProductsError("Unable to load products right now");
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
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories", { cache: "no-store" });
        if (!response.ok) {
          throw new Error(`Failed to load categories: ${response.status}`);
        }

        const data = await response.json();
        if (!isCancelled) {
          const categories = Array.isArray(data?.categories) ? (data.categories as CategoryApiDto[]) : [];
          const subcats = Array.isArray(data?.subcategories)
            ? (data.subcategories as SubcategoryApiDto[])
            : [];

          setNavCategories(categories);
          setNavSubcategories(subcats);
          setCategoriesError(categories.length === 0 ? "No categories found" : null);
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

  const buildCatalogHref = (categorySlug: string, subcategorySlug?: string) => {
    const params = new URLSearchParams({ category: categorySlug });
    if (subcategorySlug) {
      params.set("subcategory", subcategorySlug);
    }
    const query = params.toString();
    return `/catalog${query ? `?${query}` : ""}`;
  };

  return (
    <div className="min-h-screen bg-white text-[#1f1f1f]">
      <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <SiteHeaderTop containerClass={containerClass} />
        <div className="border-t border-[#e5e7eb] bg-white">
          <div className={`${containerClass} overflow-x-auto text-sm font-semibold text-[#3a3c43] scrollbar-hide`}>
            <div className="flex min-w-full items-center">
              {categoriesLoading && (
                <div className="flex min-w-full items-center justify-center py-4 text-xs text-[#6b7280]">
                  Loading categories...
                </div>
              )}
              {!categoriesLoading && categoriesError && (
                <div className="flex min-w-full items-center justify-center py-4 text-xs text-[#6b7280]">
                  {categoriesError}
                </div>
              )}
              {!categoriesLoading && !categoriesError &&
                navCategories.map((category, index) => {
                  const isActive = index === 0;
                  const iconKey = resolveIconKey(category.iconKey);
                  const isForYou = category.slug === "for-you";
                  const href = isForYou ? "/" : buildCatalogHref(category.slug);
                  return (
                    <Link
                      key={category.slug}
                      href={href}
                      prefetch
                      className={`group flex min-w-[78px] flex-col items-center gap-1 whitespace-nowrap rounded-2xl px-3 py-1.5 transition ${
                        isActive ? "text-[#1f1f1f]" : "text-[#4a4d57] hover:text-[#1f1f1f]"
                      }`}
                      aria-label={isForYou ? "Go to home" : `Explore ${category.label} on Flipkart`}
                    >
                      <div
                        className={`flex items-center justify-center overflow-hidden rounded-2xl border text-[#c7a000] transition-all duration-300 ${
                          isActive
                            ? "border-transparent bg-linear-to-b from-white via-[#edf5ff] to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                            : "border-transparent bg-[#fdfdfd] group-hover:border-[#d1d5db]"
                        } ${
                          showCategories
                            ? "h-11 w-11 opacity-100 scale-100"
                            : "h-0 w-0 opacity-0 scale-90"
                        }`}
                      >
                        <span className="text-current">{categoryIcons[iconKey]}</span>
                      </div>
                      <span className="text-xs font-semibold">{category.label}</span>
                      <span
                        className={`inline-block h-0.5 w-8 rounded-full ${
                          isActive
                            ? "bg-[#2874f0]"
                            : "bg-transparent group-hover:bg-[#d7e3ff]"
                        }`}
                      />
                    </Link>
                  );
                })}
            </div>
          </div>
        </div>
      </header>

      <main className={`${containerClass} space-y-8 py-8 bg-white`}>
        <section className="space-y-4">
          <div className="relative overflow-x-auto pb-3 scrollbar-hide">
            <div className="flex min-w-full gap-4">
              {heroBanners.map((banner) => (
                <div
                  key={banner.title}
                  className="min-w-[280px] flex-1 rounded-3xl border border-[#e5e7eb] bg-white shadow-sm"
                >
                  <Image
                    src={banner.image}
                    alt={banner.title}
                    width={380}
                    height={240}
                    className="h-60 w-full rounded-2xl object-cover"
                    unoptimized
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            {heroBanners.map((_, index) => (
              <span
                key={index}
                className={`h-1 w-4 rounded-full transition ${
                  index === 0 ? "bg-black" : "bg-black/20"
                }`}
              />
            ))}
          </div>
        </section>
        <section className="rounded-3xl bg-[#d32f2f] p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Still looking for these?</h3>
            </div>
          </div>
          <div className="relative mt-4 overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-3">
              {productsLoading && (
                <div className="flex min-w-full items-center justify-center py-8 text-sm text-white/80">
                  Loading picks...
                </div>
              )}
              {!productsLoading && productsError && (
                <div className="flex min-w-full items-center justify-center rounded-2xl border border-dashed border-white/60 bg-white/10 py-8 text-sm text-white">
                  {productsError}
                </div>
              )}
              {!productsLoading && !productsError && stillLookingProducts.length === 0 && (
                <div className="flex min-w-full items-center justify-center rounded-2xl border border-dashed border-white/60 bg-white/10 py-8 text-sm text-white">
                  No recommendations available
                </div>
              )}
              {!productsLoading && !productsError &&
                stillLookingProducts.map((product) => (
                  <Link
                    key={`${product.slug}-still-looking`}
                    href={`/product/${product.slug}`}
                    prefetch
                    className="min-w-[200px] rounded-2xl bg-white text-[#1f1f1f] shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Image
                      src={product.image}
                      alt={product.title}
                      width={200}
                      height={140}
                      className="h-52 w-full rounded-2xl object-cover"
                      unoptimized
                    />
                    <div className="px-3 py-3">
                      <p className="text-sm font-semibold uppercase tracking-wide text-[#1f1f1f]">{product.brand}</p>
                      <p className="text-xs text-[#6b7280] line-clamp-2">{product.title}</p>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        </section>


        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1c1f23]">Suggested For You</h3>
         
          </div>
          <div className="relative overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex gap-3">
              {productsLoading && (
                <div className="flex min-w-full items-center justify-center py-10 text-sm text-[#6b7280]">
                  Loading products...
                </div>
              )}
              {!productsLoading && productsError && (
                <div className="flex min-w-full items-center justify-center rounded-3xl border border-dashed border-[#d1d5db] py-10 text-sm text-[#6b7280]">
                  {productsError}
                </div>
              )}
              {!productsLoading && !productsError &&
                suggestedProducts.map((product) => (
                  <ProductCard
                    key={`${product.brand}-${product.title}`}
                    {...product}
                    className="min-w-[220px] flex-1"
                    imageClassName="h-64"
                  />
                ))}
            </div>
            <ArrowButton direction="right" />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[#1c1f23]">Top picks for you</h3>
            </div>
            <div className="hidden gap-2 sm:flex">
              <button className="rounded-full border border-[#d8dae2] p-2 text-sm text-[#4c4f58] hover:bg-[#f4f6f9]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <button className="rounded-full border border-[#d8dae2] p-2 text-sm text-[#4c4f58] hover:bg-[#f4f6f9]">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productsLoading && (
              <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed border-[#d1d5db] py-10 text-sm text-[#6b7280]">
                Loading products...
              </div>
            )}
            {!productsLoading && productsError && (
              <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed border-[#d1d5db] py-10 text-sm text-[#6b7280]">
                {productsError}
              </div>
            )}
            {!productsLoading && !productsError && gridProductSelection.length === 0 && (
              <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed border-[#d1d5db] py-10 text-sm text-[#6b7280]">
                No products found
              </div>
            )}
            {!productsLoading && !productsError &&
              gridProductSelection.map((product) => (
                <ProductCard key={`${product.brand}-${product.title}`} {...product} />
              ))}
          </div>
        </section>
      </main>
    </div>
  );
}
