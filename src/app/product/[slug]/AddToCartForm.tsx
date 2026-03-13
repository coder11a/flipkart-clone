"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

const MAX_QUANTITY = 10;

type Props = {
  productSlug: string;
  price: number;
  colorOptions?: string[] | null;
  sizeOptions?: string[] | null;
};

type ToastState = {
  variant: "success" | "error";
  message: string;
};

const normalizeOptions = (values?: string[] | null, fallbackLabel?: string) => {
  if (!values || values.length === 0) {
    return fallbackLabel ? [fallbackLabel] : [];
  }
  return values.filter(Boolean);
};

export default function AddToCartForm({ productSlug, price, colorOptions, sizeOptions }: Props) {
  const router = useRouter();

  const colors = useMemo(() => normalizeOptions(colorOptions, "Default"), [colorOptions]);
  const sizes = useMemo(() => normalizeOptions(sizeOptions, "Free size"), [sizeOptions]);

  const [selectedColor, setSelectedColor] = useState(colors[0] ?? "");
  const [selectedSize, setSelectedSize] = useState(sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [pendingAction, setPendingAction] = useState<"add" | "buy" | null>(null);
  const [isPending, startTransition] = useTransition();

  const subtotal = useMemo(() => quantity * price, [quantity, price]);

  const clampedQuantity = (value: number) => {
    if (!Number.isFinite(value)) return 1;
    return Math.min(Math.max(value, 1), MAX_QUANTITY);
  };

  const updateQuantity = (value: number) => {
    setQuantity(clampedQuantity(value));
  };

  useEffect(() => {
    if (!toast) return;
    const timeoutId = window.setTimeout(() => setToast(null), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [toast]);

  const showToast = (message: string, variant: ToastState["variant"]) => {
    setToast({ message, variant });
  };

  const submitCart = (action: "add" | "buy") => {
    setPendingAction(action);
    startTransition(async () => {
      try {
        const payload: Record<string, unknown> = {
          productSlug,
          color: selectedColor,
          size: selectedSize,
          quantity,
        };
        if (action === "buy") {
          payload.replaceExisting = true;
        }

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { message?: string } | null;
          const message = data?.message ?? "Unable to add to cart";
          throw new Error(message);
        }

        window.dispatchEvent(new CustomEvent("fk:cart-updated"));
        if (action === "buy") {
          router.push("/cart");
        } else {
          showToast("Added to cart", "success");
          router.refresh();
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : "Something went wrong";
        showToast(message, "error");
      } finally {
        setPendingAction(null);
      }
    });
  };

  const handleAddToCart = () => submitCart("add");
  const handleBuyNow = () => submitCart("buy");

  const colorLabel = colors.length ? "Choose color" : "Color";
  const sizeLabel = sizes.length ? "Choose size" : "Size";

  return (
    <div className="relative space-y-6 pb-32">
      <div className="rounded-2xl border border-[#e5e7eb] p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">{colorLabel}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {colors.length ? (
            colors.map((color) => (
              <button
                key={color}
                type="button"
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  color === selectedColor ? "border-[#2874f0] bg-[#eef4ff] text-[#1e3a8a]" : "border-[#e5e7eb] text-[#4b5563] hover:border-[#c7d2fe]"
                }`}
                onClick={() => setSelectedColor(color)}
                disabled={isPending}
              >
                {color}
              </button>
            ))
          ) : (
            <span className="text-sm text-[#4b5563]">Default</span>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-[#e5e7eb] p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">{sizeLabel}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {sizes.length ? (
            sizes.map((size) => (
              <button
                key={size}
                type="button"
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
                  size === selectedSize ? "border-[#111827] bg-[#0f172a] text-white" : "border-[#e5e7eb] text-[#4b5563] hover:border-[#94a3b8]"
                }`}
                onClick={() => setSelectedSize(size)}
                disabled={isPending}
              >
                {size}
              </button>
            ))
          ) : (
            <span className="text-sm text-[#4b5563]">Free size</span>
          )}
        </div>
        
      </div>

      <div className="rounded-2xl border border-[#e5e7eb] p-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#9ca3af]">Quantity</p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center overflow-hidden rounded-full border border-[#d1d5db]">
            <button
              type="button"
              className="px-4 py-2 text-lg text-[#111827] disabled:text-[#cbd5f5]"
              onClick={() => updateQuantity(quantity - 1)}
              disabled={isPending || quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              max={MAX_QUANTITY}
              value={quantity}
              onChange={(event) => updateQuantity(Number(event.target.value))}
              className="w-16 border-x border-[#e5e7eb] py-2 text-center text-base font-semibold text-[#0f172a] focus:outline-none"
            />
            <button
              type="button"
              className="px-4 py-2 text-lg text-[#111827] disabled:text-[#cbd5f5]"
              onClick={() => updateQuantity(quantity + 1)}
              disabled={isPending || quantity >= MAX_QUANTITY}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-sm text-[#6b7280]">(Max {MAX_QUANTITY})</span>
        </div>
      </div>

      <div className="rounded-3xl border border-[#ebebff] bg-[#f4f6ff] p-4 text-sm text-[#1f2937]">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[#4c1d95]">Subtotal</span>
          <span className="text-xl font-bold text-[#0f172a]">₹{subtotal.toLocaleString("en-IN")}</span>
        </div>
        <p className="mt-1 text-xs text-[#6b7280]">Inclusive of taxes, shipping calculated at checkout.</p>
      </div>

      <div className="sticky bottom-0 left-0 right-0 z-20">
        <div className="flex flex-col gap-2 rounded-3xl bg-white/95 p-3 shadow-[0_10px_25px_rgba(15,23,42,0.1)] backdrop-blur sm:flex-row sm:items-center sm:gap-3">
          <button
            type="button"
            className="flex-1 rounded-2xl border border-[#d1d5db] px-4 py-3 text-base font-semibold text-[#111827] transition hover:border-[#a5b4fc] disabled:opacity-60"
            onClick={handleAddToCart}
            disabled={isPending}
          >
            {isPending ? "Adding..." : "Add to cart"}
          </button>
          <button
            className="flex-1 rounded-2xl bg-[#ffe259] px-4 py-3 text-base font-semibold text-[#111827] shadow-inner transition hover:from-[#ffd148] hover:to-[#ff9f43]"
            type="button"
            onClick={handleBuyNow}
            disabled={isPending}
          >
            {pendingAction === "buy" && isPending ? "Processing..." : `Buy at ₹${price.toLocaleString("en-IN")}`}
          </button>
        </div>
      </div>
      {toast && (
        <div className="pointer-events-none fixed left-1/2 top-4 z-50 w-full max-w-md -translate-x-1/2 px-4">
          <div
            className={`pointer-events-auto rounded-2xl px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.variant === "success"
                ? "border border-[#bbf7d0] bg-white text-[#166534]"
                : "border border-[#fecaca] bg-white text-[#b91c1c]"
            }`}
            role="status"
            aria-live="polite"
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}
