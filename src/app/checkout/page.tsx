import { redirect } from "next/navigation";

import SiteHeaderTop from "@/app/components/SiteHeaderTop";
import CheckoutForm from "@/app/checkout/CheckoutForm";
import { getSessionUser } from "@/lib/auth";
import { fetchCartItems } from "@/lib/cart";

const containerClass = "mx-auto w-full max-w-[1200px] px-4";

export default async function CheckoutPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const items = await fetchCartItems(user.id);
  if (!items.length) {
    redirect("/cart");
  }

  return (
    <div className="min-h-screen bg-[#f3f5fb]">
      <header className="border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <SiteHeaderTop containerClass={containerClass} />
      </header>
      <main className={`${containerClass} py-2`}>
        <div className="flex flex-wrap items-baseline justify-between gap-3">
         
        </div>

        <CheckoutForm items={items} userName={user.name} userEmail={user.email} />
      </main>
    </div>
  );
}
