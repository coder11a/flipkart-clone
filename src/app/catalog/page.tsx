"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import ProductCard from "../components/ProductCard";
import SiteHeaderTop from "../components/SiteHeaderTop";
import {
  categoryIcons,
  containerClass,
  heroBanners,
  resolveIconKey,
} from "../components/categoryContent";
import { useCatalogData } from "../hooks/useCatalogData";
import { SubcategoryApiDto } from "../types/catalog";

const accentGradients = [
  "from-[#fee2e2] via-[#fecaca] to-[#f87171]",
  "from-[#e0f2fe] via-[#bae6fd] to-[#60a5fa]",
  "from-[#fef9c3] via-[#fde68a] to-[#facc15]",
  "from-[#ede9fe] via-[#ddd6fe] to-[#c084fc]",
  "from-[#dcfce7] via-[#bbf7d0] to-[#4ade80]",
  "from-[#e0f7fa] via-[#b2ebf2] to-[#06b6d4]",
];

const SubcategoryGallery = ({
  items,
  activeSlug,
  onSelect,
}: {
  items: SubcategoryApiDto[];
  activeSlug?: string;
  onSelect: (slug?: string) => void;
}) => {
  if (!items.length) return null;

  return (
    <div className="bg-white">
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
       
        {items.map((sub, index) => {
          const gradient = accentGradients[index % accentGradients.length];
          const isActive = activeSlug === sub.slug;
          return (
            <button
              key={sub.slug}
              onClick={() => onSelect(sub.slug)}
              className={`flex min-w-[120px] flex-col items-center gap-2 rounded-3xl border px-4 py-4 text-sm font-semibold transition ${
                isActive
                  ? "border-[#2874f0] bg-[#f7faff] text-[#0f172a]"
                  : "border-transparent text-[#1f1f1f] hover:border-[#d1d5db]"
              }`}
            >
              <div
                className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br ${gradient} text-center text-base font-bold text-[#0f172a]/80 shadow-inner whitespace-pre-line leading-tight ${
                  isActive ? "ring-2 ring-[#2874f0]" : ""
                }`}
              >
                {sub.label.split(" ").slice(0, 2).join("\n")}
              </div>
              <span className="text-center text-xs font-semibold leading-snug text-[#1c1f23]">
                {sub.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => (
  <div className="col-span-full flex items-center justify-center rounded-3xl border border-dashed border-[#d1d5db] py-10 text-sm text-[#6b7280]">
    {message}
  </div>
);

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? undefined;
  const subcategoryParam = searchParams.get("subcategory") ?? undefined;

  const {
    categories,
    subcategories,
    products,
    productsLoading,
    productsError,
    categoriesLoading,
    categoriesError,
    selectedCategory,
    selectedSubcategory,
  } = useCatalogData({ categorySlug: categoryParam, subcategorySlug: subcategoryParam });

  const subcategoriesForCategory = useMemo(() => {
    if (!selectedCategory) return [];
    return subcategories.filter((sub) => sub.categorySlug === selectedCategory.slug);
  }, [selectedCategory, subcategories]);

  const buildCatalogUrl = useCallback((nextCategory?: string, nextSubcategory?: string) => {
    const params = new URLSearchParams();
    if (nextCategory) params.set("category", nextCategory);
    if (nextSubcategory) params.set("subcategory", nextSubcategory);
    const query = params.toString();
    return query ? `/catalog?${query}` : "/catalog";
  }, []);

  const handleSubcategorySelect = useCallback(
    (slug?: string) => {
      if (!selectedCategory?.slug) return;
      router.push(buildCatalogUrl(selectedCategory.slug, slug));
    },
    [buildCatalogUrl, router, selectedCategory?.slug],
  );

  const productHeading = selectedSubcategory?.label
    ? `${selectedSubcategory.label}`
    : selectedCategory?.label
      ? `Top picks in ${selectedCategory.label}`
      : "Top picks for you";

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
                categories.map((category, index) => {
                  const iconKey = resolveIconKey(category.iconKey);
                  const isForYou = category.slug === "for-you";
                  const isActive = isForYou
                    ? !categoryParam && index === 0
                    : category.slug === (selectedCategory?.slug ?? categories[0]?.slug);
                  const href = isForYou ? "/" : buildCatalogUrl(category.slug);
                  return (
                    <Link
                      key={category.slug}
                      href={href}
                      prefetch
                      className={`group flex min-w-[78px] flex-col items-center gap-1 whitespace-nowrap rounded-2xl px-3 py-1.5 transition ${
                        isActive ? "text-[#1f1f1f]" : "text-[#4a4d57] hover:text-[#1f1f1f]"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                      aria-label={isForYou ? "Go to home" : `Explore ${category.label}`}
                    >
                      <div
                        className={`flex items-center justify-center overflow-hidden rounded-2xl border text-[#c7a000] transition-all duration-300 ${
                          isActive
                            ? "border-transparent bg-linear-to-b from-white via-[#edf5ff] to-white shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                            : "border-transparent bg-[#fdfdfd] group-hover:border-[#d1d5db]"
                        } h-11 w-11`}
                      >
                        <span className="text-current">{categoryIcons[iconKey]}</span>
                      </div>
                      <span className="text-xs font-semibold">{category.label}</span>
                      <span
                        className={`inline-block h-0.5 w-8 rounded-full ${
                          isActive ? "bg-[#2874f0]" : "bg-transparent group-hover:bg-[#d7e3ff]"
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
          <SubcategoryGallery
            items={subcategoriesForCategory}
            activeSlug={selectedSubcategory?.slug}
            onSelect={handleSubcategorySelect}
          />
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#1c1f23]">{productHeading}</h3>
         
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {productsLoading && <EmptyState message="Loading products..." />}
            {!productsLoading && productsError && <EmptyState message={productsError} />}
            {!productsLoading && !productsError && products.length === 0 && <EmptyState message="No products found" />}
            {!productsLoading && !productsError &&
              products.map((product) => <ProductCard key={product.slug} {...product} />)}
          </div>
        </section>
      </main>
    </div>
  );
}
