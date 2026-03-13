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

        <div className="grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] -mt-2">
          <section className="space-y-0 bg-white p-2 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <nav className="mb-3 flex flex-wrap items-center gap-1 text-xs text-[#6b7280] sm:text-sm">
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
            <div className="relative">
              <div className="grid gap-3 sm:grid-cols-2">
                {gallery.slice(0, 4).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative aspect-3/4 overflow-hidden border border-white/70 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={500}
                      height={700}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                ))}
                {gallery.slice(0, 4).map((image, index) => (
                  <div
                    key={`${image}-${index}`}
                    className="group relative aspect-3/4 overflow-hidden border border-white/70 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.08)]"
                  >
                    <Image
                      src={image}
                      alt={`${product.title} ${index + 1}`}
                      width={500}
                      height={700}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="border border-[#e5e7eb] p-4">
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

          <section className="space-y-0 lg:pl-0">
            <div className="bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:p-6">
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

              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#ecfdf5] px-3 py-1 text-xs font-semibold text-[#0b8a44]">
                <span className="h-2 w-2 rounded-full bg-[#22c55e]" aria-hidden />
                In stock · Ready to ship
              </div>

              <p className="mt-4 text-sm text-[#4b5563]">{product.description}</p>
            </div>

            <div className="space-y-0 bg-white p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] md:p-6">
              <div className="border border-[#ebebff] bg-[#f4f6ff] p-4 text-sm text-[#1f2937]">
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
