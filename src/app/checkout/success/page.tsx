import Link from "next/link";

import SiteHeaderTop from "@/app/components/SiteHeaderTop";
import { getSessionUser } from "@/lib/auth";

const containerClass = "mx-auto w-full max-w-[800px] px-4";

type SearchParams = {
  orderId?: string;
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const user = await getSessionUser();
  const params = await searchParams;
  const orderId = params.orderId ?? "";

  return (
    <div className="min-h-screen bg-[#f3f5fb]">
    
      <main className={`${containerClass} py-16 space-y-6 text-center`}>
        <div className="mx-auto max-w-xl rounded-3xl bg-white p-8 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <p className="text-xs uppercase tracking-[0.4em] text-[#059669]">Order placed</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#0f172a]">Thank you{user?.name ? `, ${user.name}` : ""}!</h1>
          <p className="mt-2 text-sm text-[#6b7280]">Your COD order has been confirmed. Well send delivery updates to your email and phone.</p>

          <div className="mt-6 rounded-2xl border border-[#d1fae5] bg-[#ecfdf5] px-4 py-3 text-sm text-[#065f46]">
            <p className="font-semibold">Order ID</p>
            <p className="text-lg font-mono">{orderId || "Pending"}</p>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm">
            <Link href="/" className="rounded-full bg-[#2874f0] px-6 py-3 text-white">
              Continue shopping
            </Link>
            <Link href="/orders" className="rounded-full border border-[#e5e7eb] px-6 py-3 text-[#111827]">
              View all orders
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
