"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import type { CartItem } from "@/types/cart";

type Props = {
  initialItems: CartItem[];
};

type BannerState = {
  type: "success" | "error";
  message: string;
};

const MAX_QUANTITY = 10;

const DEAL_BADGES = [
  { label: "Hot Deal", bg: "bg-[#e7f8ed]", color: "text-[#1a7f37]" },
  { label: "Super Deal", bg: "bg-[#e5f2ff]", color: "text-[#1a5fd6]" },
];

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function CartClient({ initialItems }: Props) {
  const [items, setItems] = useState<CartItem[]>(initialItems);
  const [banner, setBanner] = useState<BannerState | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<number | null>(null);
  const [removingItemId, setRemovingItemId] = useState<number | null>(null);

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const mrp = items.reduce((sum, item) => sum + Math.round(item.unitPrice * item.quantity * 1.25), 0);
    const discount = Math.max(0, mrp - subtotal);
    const fees = items.length ? 19 : 0;
    const total = subtotal + fees;
    return { subtotal, totalItems, mrp, discount, fees, total };
  }, [items]);

  const clampQuantity = (value: number) => {
    if (!Number.isInteger(value)) return 1;
    return Math.max(1, Math.min(value, MAX_QUANTITY));
  };

  const handleQuantityChange = async (id: number, nextQuantity: number) => {
    const quantity = clampQuantity(nextQuantity);
    setBanner(null);
    setUpdatingItemId(id);
    try {
      const response = await fetch("/api/cart", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id, quantity }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Unable to update cart item");
      }

      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
      setBanner({ type: "success", message: "Cart updated" });
      window.dispatchEvent(new CustomEvent("fk:cart-updated"));
    } catch (error) {
      setBanner({ type: "error", message: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (id: number) => {
    setBanner(null);
    setRemovingItemId(id);
    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        throw new Error(data?.message ?? "Unable to remove cart item");
      }

      setItems((prev) => prev.filter((item) => item.id !== id));
      setBanner({ type: "success", message: "Item removed from cart" });
      window.dispatchEvent(new CustomEvent("fk:cart-updated"));
    } catch (error) {
      setBanner({ type: "error", message: error instanceof Error ? error.message : "Something went wrong" });
    } finally {
      setRemovingItemId(null);
    }
  };

  if (!items.length) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
        <p className="text-lg font-semibold text-[#111827]">Your cart is empty</p>
        <p className="mt-1 text-sm text-[#6b7280]">Browse products and add the styles you love.</p>
        <Link href="/" className="mt-6 inline-flex rounded-full bg-[#2874f0] px-6 py-3 text-sm font-semibold text-white">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,1.2fr)]">
      <div className="space-y-4">

        {items.map((item, index) => {
          const isUpdating = updatingItemId === item.id;
          const isRemoving = removingItemId === item.id;
          const badge = DEAL_BADGES[index % DEAL_BADGES.length];
          const linePrice = item.unitPrice * item.quantity;
          const lineMrp = Math.max(linePrice + 200, Math.round(linePrice * 1.25));
          const discountPercent = Math.max(5, Math.round(((lineMrp - linePrice) / lineMrp) * 100));
          const ratingValue = (4 + (index % 3) * 0.1).toFixed(1);
          const ratingCount = (62000 + index * 103).toLocaleString("en-IN");
          const deliveryDate = new Date();
          deliveryDate.setDate(deliveryDate.getDate() + 5 + index);
          const deliveryLabel = deliveryDate.toLocaleDateString("en-IN", {
            weekday: "short",
            month: "short",
            day: "numeric",
          });
          return (
            <div key={item.id} className=" border border-[#e0e0e0] bg-white shadow-sm">
              <div className="flex flex-col gap-4 p-4 md:flex-row">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[12px] border border-[#e0e0e0] bg-[#f5f5f5]">
                      <Image src={item.imageUrl} alt={item.title} width={160} height={160} className="h-full w-full object-cover" unoptimized />
                    </div>
                    <label className="text-xs font-semibold text-[#878787]">

                      <div className="relative mt-1">
                        <select
                          className="w-24 appearance-none rounded-[8px] border border-[#d7d7d7] bg-white px-3 py-2 text-sm font-semibold text-[#212121]"
                          value={item.quantity}
                          onChange={(event) => handleQuantityChange(item.id, Number(event.target.value))}
                          disabled={isUpdating}
                        >
                          {Array.from({ length: MAX_QUANTITY }, (_, i) => i + 1).map((value) => (
                            <option key={value} value={value}>
                              Qty {value}
                            </option>
                          ))}
                        </select>
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#5f6368]">
                          <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M7 10l5 5 5-5H7z" />
                          </svg>
                        </span>
                      </div>
                    </label>
                  </div>
                  <div>
                    <span className={`${badge.bg} ${badge.color} inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide`}>
                      {badge.label}
                    </span>
                    <Link href={`/product/${item.productSlug}`} className="mt-2 block text-base font-semibold text-[#212121] hover:text-[#2874f0]">
                      {item.title}
                    </Link>
                    <p className="text-sm text-[#878787]">{item.brand}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#5f6368]">
                      <span className="rounded-[6px] bg-[#f1f3f6] px-2 py-1 font-medium">Size: {item.size || "Free"}</span>
                      <span className="rounded-[6px] bg-[#f1f3f6] px-2 py-1 font-medium">Color: {item.color || "Default"}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                      <span className="inline-flex items-center gap-1 rounded-[4px] bg-[#388e3c] px-2 py-0.5 text-xs font-semibold text-white">
                        {ratingValue}
                        <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                      </span>
                      <span className="text-[#388e3c] font-semibold">{discountPercent}%</span>
                      <span className="text-[#878787] line-through">{formatCurrency(lineMrp)}</span>
                      <span className="text-lg font-semibold text-[#212121]">{formatCurrency(linePrice)}</span>
                      <span className="text-xs text-[#878787]">({ratingCount} reviews)</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#2874f0]">
                      <span className="font-semibold">Buy now at {formatCurrency(Math.round(linePrice * 0.85))}</span>
                      <span className="text-[#5f6368]">Or pay {formatCurrency(Math.round(linePrice / item.quantity))} × {item.quantity}</span>
                    </div>
                    <p className="mt-3 text-xs text-[#5f6368]">Delivery by {deliveryLabel}</p>
                  </div>
                </div>
              </div>
              <div className="flex divide-x divide-[#f0f0f0] border-t border-[#f0f0f0] text-sm text-[#5f6368]">
                <button type="button" className="flex flex-1 items-center justify-center gap-2 px-4 py-3 font-semibold" disabled>
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h12a2 2 0 0 1 2 2v16l-8-3-8 3V6a2 2 0 0 1 2-2z" />
                  </svg>
                  Save for later
                </button>
                <button
                  type="button"
                  className="flex flex-1 items-center justify-center gap-2 px-4 py-3 font-semibold hover:text-[#d32f2f]"
                  onClick={() => handleRemove(item.id)}
                  disabled={isRemoving}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V7H6v12zm3.46-8.12 1.41-1.41L12 10.59l1.12-1.12 1.41 1.41L13.41 12l1.12 1.12-1.41 1.41L12 13.41l-1.12 1.12-1.41-1.41L10.59 12l-1.12-1.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                  {isRemoving ? "Removing..." : "Remove"}
                </button>
                <button type="button" className="flex flex-1 items-center justify-center gap-2 px-4 py-3 font-semibold text-[#5f6368]">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 2v9h9v2h-9v9h-2v-9H2v-2h9V2z" />
                  </svg>
                  Buy this now
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="space-y-4">
        <div className=" border border-[#e0e0e0] bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-[#878787]">Price details</h2>
          <div className="mt-4 space-y-3 text-sm text-[#212121]">
            <div className="flex items-center justify-between">
              <span>MRP ({totals.totalItems} items)</span>
              <span>{formatCurrency(totals.mrp)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Fees</span>
              <span>{formatCurrency(totals.fees)}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-[#388e3c]">
              <span className="flex items-center gap-1">
                Discounts
                <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5H7z" />
                </svg>
              </span>
              <span>-{formatCurrency(totals.discount)}</span>
            </div>
            <div className="border-t border-[#f0f0f0] pt-3 text-base font-semibold text-[#212121]">
              <div className="flex items-center justify-between">
                <span>Total Amount</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </div>
          <div className="mt-4 rounded-md border border-[#c8e6c9] bg-[#edf7ed] px-4 py-3 text-sm font-semibold text-[#1b5e20]">
            You'll save {formatCurrency(totals.discount)} on this order!
          </div>
        </div>
        <p className="text-sm text-[#616161] text-center">Safe and secure payments. Easy returns. 100% authentic products.</p>
        <div className="border border-[#e0e0e0] bg-white p-2 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-sm text-[#9e9e9e] line-through">{formatCurrency(totals.mrp)}</span>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-xl font-semibold text-[#212121]">{formatCurrency(totals.total)}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d0d0d0] text-xs font-semibold text-[#5f6368]">i</span>
              </div>
            </div>
            <Link
              href="/checkout"
              className="ml-auto inline-flex min-w-[140px] justify-center rounded-[8px] bg-yellow-300 px-6 py-3 text-base font-semibold text-[#212121] hover:bg-[#f7a600]"
            >
              Place Order
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
