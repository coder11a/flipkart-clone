import Link from "next/link";
import { redirect } from "next/navigation";

import SiteHeaderTop from "@/app/components/SiteHeaderTop";
import { getSessionUser } from "@/lib/auth";
import { fetchUserOrders } from "@/lib/orders";
import type { OrderSummary } from "@/types/order";

const containerClass = "mx-auto w-full max-w-[1100px] px-4";

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;
const formatDate = (value: string) => new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

const ShippingAddress = ({ order }: { order: OrderSummary }) => (
  <div className="rounded-2xl border border-[#e5e7eb] bg-white p-4 text-sm text-[#374151]">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#9ca3af]">Shipping to</p>
    <p className="mt-1 font-semibold text-[#0f172a]">{order.shippingName}</p>
    <p>{order.shippingAddress1}</p>
    {order.shippingAddress2 ? <p>{order.shippingAddress2}</p> : null}
    <p>
      {order.shippingCity}, {order.shippingState} - {order.shippingPostalCode}
    </p>
  </div>
);

export default async function OrdersPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const orders = await fetchUserOrders(user.id);

  return (
    <div className="min-h-screen bg-[#f3f5fb]">
      <header className="border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <SiteHeaderTop containerClass={containerClass} />
      </header>
      <main className={`${containerClass} py-10 space-y-6`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-[#9ca3af]">Orders</p>
            <h1 className="text-2xl font-semibold text-[#111827]">Hello, {user.name ?? user.email}</h1>
            <p className="text-sm text-[#6b7280]">Track deliveries and view past orders</p>
          </div>
          <Link href="/" className="rounded-full border border-[#d1d5db] px-4 py-2 text-sm font-semibold text-[#111827]">
            Continue shopping
          </Link>
        </div>

        {!orders.length ? (
          <div className="rounded-3xl bg-white p-10 text-center shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
            <p className="text-lg font-semibold text-[#0f172a]">No orders yet</p>
            <p className="mt-1 text-sm text-[#6b7280]">Add items to your cart and complete checkout to see them here.</p>
            <Link href="/" className="mt-5 inline-flex rounded-full bg-[#2874f0] px-6 py-3 text-sm font-semibold text-white">
              Shop now
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => (
              <section key={order.id} className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef2ff] pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">Order</p>
                    <h2 className="text-lg font-semibold text-[#0f172a]">#{order.id}</h2>
                    <p className="text-sm text-[#6b7280]">Placed {formatDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-[#0f172a]">{formatCurrency(order.totalAmount)}</p>
                    <p className="text-xs uppercase tracking-wider text-[#059669]">{order.status}</p>
                    <p className="text-xs text-[#6b7280]">Payment: {order.paymentMethod}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-[2fr_1fr]">
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div key={`${order.id}-${item.productSlug}-${index}`} className="rounded-2xl border border-[#e5e7eb] p-3 text-sm text-[#374151]">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-base font-semibold text-[#0f172a]">
                          <Link href={`/product/${item.productSlug}`} className="hover:text-[#2874f0]">
                            {item.title}
                          </Link>
                          <span>{formatCurrency(item.unitPrice * item.quantity)}</span>
                        </div>
                        <p className="text-xs text-[#6b7280]">{item.brand}</p>
                        <div className="mt-2 flex flex-wrap gap-4 text-xs text-[#4b5563]">
                          <span>Color: {item.color || "Default"}</span>
                          <span>Size: {item.size || "Free"}</span>
                          <span>Qty: {item.quantity}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <ShippingAddress order={order} />
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
