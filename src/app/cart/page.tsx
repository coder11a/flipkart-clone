import { redirect } from "next/navigation";

import SiteHeaderTop from "@/app/components/SiteHeaderTop";
import { getSessionUser } from "@/lib/auth";
import { fetchCartItems } from "@/lib/cart";

import CartClient from "./CartClient";

const containerClass = "mx-auto w-full max-w-[1200px] px-4";

export default async function CartPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const items = await fetchCartItems(user.id);

  return (
    <div className="min-h-screen bg-[#f3f5fb]">
      <header className="border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <SiteHeaderTop containerClass={containerClass} />
      </header>
      <main className={`${containerClass}`}>
        <CartClient initialItems={items} />
      </main>
    </div>
  );
}
