import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import type { Metadata } from "next";

import { sql } from "@/lib/neon";
import SiteHeaderTop from "@/app/components/SiteHeaderTop";
import AddToCartForm from "./AddToCartForm";

type ProductDetail = {
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

const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number") return "₹0";
  return `₹${value.toLocaleString("en-IN")}`;
};

const containerClass = "mx-auto w-full max-w-[1200px] px-4";

async function fetchProduct(slug: string): Promise<ProductDetail | null> {
  const rows = (await sql`
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
  `) as ProductDetail[];

  return rows[0] ?? null;
}

type PageParams = { slug: string };

export async function generateMetadata({ params }: { params: Promise<PageParams> }): Promise<Metadata> {
  try {
    const { slug } = await params;
    const product = await fetchProduct(slug);
    if (!product) {
      return { title: "Product not found" };
    }
    return {
      title: `${product.title} | ${product.brand}`,
      description: product.description ?? undefined,
      openGraph: {
        title: product.title,
        description: product.description ?? undefined,
        images: product.galleryUrls?.[0] ? [{ url: product.galleryUrls[0] }] : undefined,
      },
    };
  } catch {
    return { title: "Product" };
  }
}

export default async function ProductPage({ params }: { params: Promise<PageParams> }) {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) {
    notFound();
  }

  const gallery = product.galleryUrls?.length ? product.galleryUrls : [product.imageUrl];

  return (
    <div className="min-h-screen bg-[#f3f5fb]">
      <header className="border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <SiteHeaderTop containerClass={containerClass} />
      </header>
      <main className={`${containerClass} py-2`}>
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-[#6b7280] sm:text-sm">
          <Link href="/" className="hover:text-[#2874f0]">
            Home
          </Link>
          <span>/</span>
          {product.category}
          <span>/</span>
          {product.subcategory}
          <span>/</span>
          <span className="font-semibold text-[#111827]">{product.title}</span>
        </nav>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
          <section className="space-y-4 rounded-3xl bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:p-6">
            <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
              <div className="overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#fafbff] p-4">
                <Image
                  src={gallery[0]}
                  alt={product.title}
                  width={600}
                  height={600}
                  className="h-full w-full rounded-2xl object-cover"
                  unoptimized
                />
              </div>
              <div className="flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0">
                {gallery.slice(1, 5).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="min-w-[160px] overflow-hidden rounded-2xl border border-[#e5e7eb] bg-[#fafbff] p-2 md:min-w-0"
                  >
                    <Image src={image} alt={`${product.title} ${index + 2}`} width={300} height={300} className="h-full w-full rounded-xl object-cover" unoptimized />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-[#e5e7eb] p-4">
              <h3 className="text-sm font-semibold text-[#111827]">Highlights</h3>
              <ul className="mt-2 grid grid-cols-1 gap-2 text-sm text-[#4b5563] sm:grid-cols-2">
                {product.highlights?.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#111827]" />
                    {highlight}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="mt-6 space-y-4 lg:mt-0 lg:pl-4">
            <div className="rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">{product.brand}</p>
                  <h1 className="text-xl font-semibold text-[#111827]">{product.title}</h1>
                  <p className="text-sm text-[#6b7280]">{product.category} • {product.subcategory}</p>
                </div>
                {typeof product.rating === "number" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#e7f6e9] px-3 py-1 text-sm font-semibold text-[#0a8a38]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                      <path d="m12 3 2.09 6.41H21l-5.17 3.76L17.91 21 12 16.9 6.09 21l1.08-7.83L2 9.41h6.91Z" />
                    </svg>
                    {product.rating.toFixed(1)}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold text-[#111827]">{formatCurrency(product.price)}</span>
                {product.mrp && <span className="text-sm text-[#9ca3af] line-through">{formatCurrency(product.mrp)}</span>}
                {product.discountText && <span className="text-sm font-semibold text-[#059669]">{product.discountText}</span>}
              </div>

              <p className="mt-4 text-sm text-[#4b5563]">{product.description}</p>
            </div>

            <div className="space-y-5 rounded-3xl bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:p-6">
              <div className="rounded-2xl border border-[#ebebff] bg-[#f4f6ff] p-4 text-sm text-[#1f2937]">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase text-[#6366f1]">
                  <span className="rounded-full bg-white px-2 py-0.5 text-[#6366f1]">WOW DEAL</span>
                  Apply offers for maximum savings
                </div>
                <div className="mt-3 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs text-[#6b7280]">Best value for you</p>
                      <p className="text-base font-semibold">Buy at {formatCurrency(product.price - 50)}</p>
                    </div>
                    <button className="rounded-full border border-[#c7d2fe] px-3 py-1 text-xs font-semibold text-[#4c1d95]">
                      Apply
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span>Bank offers</span>
                    <div className="flex gap-2">
                      <button className="rounded-full border border-[#d1d5db] px-2 py-0.5 text-[#111827]">₹50 off</button>
                      <button className="rounded-full border border-[#d1d5db] px-2 py-0.5 text-[#111827]">₹23 off</button>
                    </div>
                  </div>
                </div>
              </div>

              <AddToCartForm
                productSlug={product.slug}
                price={product.price}
                colorOptions={product.colorOptions}
                sizeOptions={product.sizeOptions}
              />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
