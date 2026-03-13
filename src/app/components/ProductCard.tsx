import Link from "next/link";
import Image from "next/image";

export interface ProductCardProps {
  slug: string;
  image: string;
  brand: string;
  title: string;
  category: string;
  subcategory: string;
  price: string;
  mrp?: string;
  discountText?: string;
  rating?: number;
  className?: string;
  imageClassName?: string;
}

const RatingPill = ({ rating }: { rating: number }) => (
  <span className="inline-flex items-center gap-1 rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-black">
    {rating.toFixed(1)}
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="green" aria-hidden>
      <path d="m12 3 2.09 6.41H21l-5.17 3.76L17.91 21 12 16.9 6.09 21l1.08-7.83L2 9.41h6.91Z" />
    </svg>
  </span>
);

const ProductCard = ({
  slug,
  image,
  brand,
  title,
  category,
  subcategory,
  price,
  mrp,
  discountText,
  rating,
  className,
  imageClassName,
}: ProductCardProps) => {
  const card = (
    <article
      className={`group flex flex-col bg-[#ffffff] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(15,23,42,0.12)] ${
        className ?? ""
      }`}
    >
      <div className="relative overflow-hidden rounded-[6px]">
        {typeof rating === "number" && (
          <div className="absolute bottom-1 left-1 z-10">
            <RatingPill rating={rating} />
          </div>
        )}
        <Image
          src={image}
          alt={title}
          width={400}
          height={500}
          className={`w-full rounded-[6px] object-cover ${imageClassName ?? "h-[320px]"}`}
          unoptimized
        />
      </div>
      <div className="space-y-2 px-1 py-1">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-[#1c1f23]">{title}</p>
        <div className="flex flex-wrap items-baseline gap-2">
          {mrp && <span className="text-sm text-[#a0a4b4] line-through">{mrp}</span>}
          <span className="text-md font-bold text-[#1d1f2c]">{price}</span>
        </div>
      </div>
    </article>
  );

  return (
    <Link href={`/product/${slug}`} className="block" prefetch>
      {card}
    </Link>
  );
}
;

export default ProductCard;
