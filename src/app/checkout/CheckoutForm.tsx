"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { CartItem } from "@/types/cart";

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const MAX_POSTAL_LENGTH = 10;

const emptyForm = {
  shippingName: "",
  shippingPhone: "",
  shippingAddress1: "",
  shippingAddress2: "",
  shippingCity: "",
  shippingState: "",
  shippingPostalCode: "",
};

type FormState = typeof emptyForm;

type RequestState = {
  status: "idle" | "submitting" | "success" | "error";
  message: string | null;
};

const CHECKOUT_STEPS = [
  { label: "Address", status: "complete" },
  { label: "Order Summary", status: "current" },
  { label: "Payment", status: "upcoming" },
] as const;

const DEAL_BADGES = [
  { label: "Hot Deal", bg: "bg-[#e7f8ed]", color: "text-[#1a7f37]" },
  { label: "Super Deal", bg: "bg-[#e5f2ff]", color: "text-[#1a5fd6]" },
];

type Props = {
  items: CartItem[];
  userName?: string | null;
  userEmail: string;
};

export default function CheckoutForm({ items, userName, userEmail }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({
    ...emptyForm,
    shippingName: userName ?? "",
  });
  const [requestState, setRequestState] = useState<RequestState>({ status: "idle", message: null });
  const [isPending, startTransition] = useTransition();
  const [showAddressForm, setShowAddressForm] = useState(() => {
    return !form.shippingName || !form.shippingPhone || !form.shippingAddress1 || !form.shippingCity || !form.shippingState || !form.shippingPostalCode;
  });

  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const mrp = items.reduce((sum, item) => sum + Math.round(item.unitPrice * item.quantity * 1.25), 0);
    const discount = Math.max(0, mrp - subtotal);
    const fees = items.length ? 19 : 0;
    const total = subtotal + fees;
    return { subtotal, totalItems, mrp, discount, fees, total };
  }, [items]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) {
      setRequestState({ status: "error", message: "Cart is empty" });
      return;
    }

    setRequestState({ status: "submitting", message: null });
    startTransition(async () => {
      try {
        const response = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify(form),
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as { message?: string } | null;
          throw new Error(data?.message ?? "Unable to place order");
        }

        const data = (await response.json()) as { orderId: number };
        setRequestState({ status: "success", message: "Order placed" });
        window.dispatchEvent(new CustomEvent("fk:cart-updated"));
        router.push(`/checkout/success?orderId=${data.orderId}`);
      } catch (error) {
        setRequestState({
          status: "error",
          message: error instanceof Error ? error.message : "Something went wrong",
        });
      }
    });
  };

  const displayName = form.shippingName || userName || userEmail.split("@")[0];
  const addressLineOne = form.shippingAddress1 || "Add your address to proceed";
  const addressLineTwo = [form.shippingAddress2, form.shippingCity, form.shippingState, form.shippingPostalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
      <section className="space-y-4">
        <div className=" border border-[#e0e0e0] bg-white p-4">
          <ol className="flex items-center justify-between text-sm font-semibold">
            {CHECKOUT_STEPS.map((step, index) => (
              <li key={step.label} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                    step.status === "complete"
                      ? "border-[#2874f0] bg-[#2874f0] text-white"
                      : step.status === "current"
                        ? "border-[#2874f0] text-[#2874f0]"
                        : "border-[#d1d5db] text-[#9ca3af]"
                  }`}
                >
                  {index + 1}
                </div>
                <span className={`${step.status === "current" ? "text-[#111827]" : "text-[#6b7280]"}`}>{step.label}</span>
                {index < CHECKOUT_STEPS.length - 1 && <span className="ml-3 flex-1 border-t border-dashed border-[#d1d5db]" />}
              </li>
            ))}
          </ol>
        </div>

        <div className=" border border-[#e0e0e0] bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm text-[#5f6368]">Deliver to:</p>
              <p className="mt-1 text-lg font-semibold text-[#212121]">
                {displayName}
                <span className="ml-2 rounded border border-[#e0e0e0] px-2 py-0.5 text-xs font-semibold text-[#5f6368]">HOME</span>
              </p>
              <p className="mt-2 text-sm text-[#5f6368]">{addressLineOne}</p>
              {addressLineTwo && <p className="text-sm text-[#5f6368]">{addressLineTwo}</p>}
              <p className="mt-2 text-sm text-[#5f6368]">{form.shippingPhone || "Add phone number"}</p>
            </div>
            <button
              type="button"
              className="rounded border border-[#d0d5dd] px-4 py-2 text-sm font-semibold text-[#2874f0]"
              onClick={() => setShowAddressForm((prev) => !prev)}
            >
              {showAddressForm ? "Done" : "Change"}
            </button>
          </div>

          {showAddressForm && (
            <div className="mt-4 space-y-4 border-t border-[#f0f0f0] pt-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="text-sm font-medium text-[#374151]">
                  Full name
                  <input
                    required
                    value={form.shippingName}
                    onChange={(event) => handleChange("shippingName", event.target.value)}
                    className="mt-1 w-full rounded-[8px] border border-[#d7d7d7] px-3 py-2 text-sm text-[#111827] focus:border-[#2874f0] focus:outline-none"
                  />
                </label>
                <label className="text-sm font-medium text-[#374151]">
                  Phone number
                  <input
                    required
                    value={form.shippingPhone}
                    onChange={(event) => handleChange("shippingPhone", event.target.value)}
                    className="mt-1 w-full rounded-[8px] border border-[#d7d7d7] px-3 py-2 text-sm text-[#111827] focus:border-[#2874f0] focus:outline-none"
                    inputMode="tel"
                    placeholder="10-digit mobile"
                  />
                </label>
              </div>
              <label className="text-sm font-medium text-[#374151]">
                Address line 1
                <input
                  required
                  value={form.shippingAddress1}
                  onChange={(event) => handleChange("shippingAddress1", event.target.value)}
                  className="mt-1 w-full rounded-[8px] border border-[#d7d7d7] px-3 py-2 text-sm text-[#111827] focus:border-[#2874f0] focus:outline-none"
                  placeholder="House no, building, street"
                />
              </label>
              <label className="text-sm font-medium text-[#374151]">
                Address line 2 (optional)
                <input
                  value={form.shippingAddress2}
                  onChange={(event) => handleChange("shippingAddress2", event.target.value)}
                  className="mt-1 w-full rounded-[8px] border border-[#d7d7d7] px-3 py-2 text-sm text-[#111827] focus:border-[#2874f0] focus:outline-none"
                  placeholder="Area, landmark"
                />
              </label>
              <div className="grid gap-4 md:grid-cols-3">
                <label className="text-sm font-medium text-[#374151]">
                  City
                  <input
                    required
                    value={form.shippingCity}
                    onChange={(event) => handleChange("shippingCity", event.target.value)}
                    className="mt-1 w-full rounded-[8px] border border-[#d7d7d7] px-3 py-2 text-sm text-[#111827] focus:border-[#2874f0] focus:outline-none"
                  />
                </label>
                <label className="text-sm font-medium text-[#374151]">
                  State
                  <input
                    required
                    value={form.shippingState}
                    onChange={(event) => handleChange("shippingState", event.target.value)}
                    className="mt-1 w-full rounded-[8px] border border-[#d7d7d7] px-3 py-2 text-sm text-[#111827] focus:border-[#2874f0] focus:outline-none"
                  />
                </label>
                <label className="text-sm font-medium text-[#374151]">
                  PIN code
                  <input
                    required
                    value={form.shippingPostalCode}
                    onChange={(event) => handleChange("shippingPostalCode", event.target.value.slice(0, MAX_POSTAL_LENGTH))}
                    className="mt-1 w-full rounded-[8px] border border-[#d7d7d7] px-3 py-2 text-sm text-[#111827] focus:border-[#2874f0] focus:outline-none"
                    inputMode="numeric"
                    placeholder="6-digit"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        <div className=" border border-[#e0e0e0] bg-white">
          <div className="border-b border-[#f0f0f0] px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#5f6368]">
            Order Summary ({totals.totalItems} items)
          </div>
          <div className="divide-y divide-[#f0f0f0]">
            {items.map((item, index) => {
              const badge = DEAL_BADGES[index % DEAL_BADGES.length];
              const linePrice = item.unitPrice * item.quantity;
              const lineMrp = Math.max(linePrice + 150, Math.round(linePrice * 1.25));
              const discountPercent = Math.max(5, Math.round(((lineMrp - linePrice) / lineMrp) * 100));
              return (
                <div key={item.id} className="flex flex-col gap-4 px-5 py-4 md:flex-row">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-20 w-20 overflow-hidden rounded-[12px] border border-[#e0e0e0] bg-[#f5f5f5]">
                        <Image src={item.imageUrl} alt={item.title} width={120} height={120} className="h-full w-full object-cover" unoptimized />
                      </div>
                      <label className="text-xs font-semibold text-[#878787]">
                        Qty:
                        <span className="ml-1 inline-block rounded-[6px] bg-[#f1f3f6] px-2 py-0.5 text-[#212121]">{item.quantity}</span>
                      </label>
                    </div>
                    <div>
                      <span className={`${badge.bg} ${badge.color} inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide`}>
                        {badge.label}
                      </span>
                      <p className="mt-2 text-base font-semibold text-[#212121]">{item.title}</p>
                      <p className="text-sm text-[#878787]">{item.brand}</p>
                      <p className="mt-2 text-sm text-[#5f6368]">{item.color || "Default"} • Size {item.size || "Free"}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                        <span className="text-[#388e3c] font-semibold">{discountPercent}% off</span>
                        <span className="text-[#878787] line-through">{formatCurrency(lineMrp)}</span>
                        <span className="text-lg font-semibold text-[#212121]">{formatCurrency(linePrice)}</span>
                      </div>
                      <p className="mt-2 text-xs text-[#5f6368]">Delivery by {new Date(Date.now() + (index + 4) * 86400000).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

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
        <p className="text-center text-sm text-[#616161]">Safe and secure payments. Easy returns. 100% authentic products.</p>
        <div className="border border-[#e0e0e0] bg-white p-4 shadow-sm">
          <div className="flex items-center gap-6">
            <div>
              <span className="block text-sm text-[#9e9e9e] line-through">{formatCurrency(totals.mrp)}</span>
              <div className="mt-1 flex items-center gap-1">
                <span className="text-3xl font-semibold text-[#212121]">{formatCurrency(totals.total)}</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full border border-[#d0d0d0] text-xs font-semibold text-[#5f6368]">i</span>
              </div>
            </div>
            <button
              type="submit"
              disabled={isPending || requestState.status === "success"}
              className="ml-auto inline-flex min-w-[140px] justify-center rounded-[8px] bg-[#ff9f00] px-6 py-3 text-base font-semibold text-[#212121] hover:bg-[#f7a600] disabled:opacity-60"
            >
              {isPending ? "Processing..." : "Place Order"}
            </button>
          </div>
          {requestState.message && (
            <div
              className={`mt-3 rounded-md border px-3 py-2 text-sm ${
                requestState.status === "error"
                  ? "border-[#fecaca] bg-[#fef2f2] text-[#b91c1c]"
                  : requestState.status === "success"
                    ? "border-[#bbf7d0] bg-[#ecfdf5] text-[#166534]"
                    : "border-[#e0e0e0] bg-[#f9fafb] text-[#4b5563]"
              }`}
            >
              {requestState.message}
            </div>
          )}
        </div>
      </aside>
    </form>
  );
}
