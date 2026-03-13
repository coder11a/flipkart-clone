import Link from "next/link";
import { redirect } from "next/navigation";

import SiteHeaderTop from "@/app/components/SiteHeaderTop";
import LogoutButton from "./LogoutButton";
import { getSessionUser } from "@/lib/auth";

const containerClass = "mx-auto w-full max-w-[1200px] px-4";

export default async function AccountPage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/auth");
  }

  const initials = user.name
    ?.split(" ")
    .filter(Boolean)
    .map((segment) => segment[0]?.toUpperCase())
    .slice(0, 2)
    .join("") ?? user.email[0]?.toUpperCase() ?? "U";

  return (
    <div className="min-h-screen bg-[#f3f5fb]">
      <header className="border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <SiteHeaderTop containerClass={containerClass} />
      </header>

      <main className={`${containerClass} py-10 space-y-6`}>
        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#eef2ff] text-2xl font-semibold text-[#312e81]">
              {initials}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#9ca3af]">Account</p>
              <h1 className="text-2xl font-semibold text-[#0f172a]">{user.name ?? "Flipkart shopper"}</h1>
              <p className="text-sm text-[#6b7280]">{user.email}</p>
            </div>
            <div className="ml-auto">
              <LogoutButton />
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">Membership</p>
              <p className="mt-2 text-sm text-[#0f172a]">Signed in with email</p>
              <p className="text-xs text-[#6b7280]">Secure COD eligible</p>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">Perks</p>
              <p className="mt-2 text-sm text-[#0f172a]">Free delivery</p>
              <p className="text-xs text-[#6b7280]">No minimum order</p>
            </div>
            <div className="rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">Support</p>
              <p className="mt-2 text-sm text-[#0f172a]">Need help?</p>
              <p className="text-xs text-[#6b7280]">Reach us 24/7</p>
            </div>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-6 shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">Orders</p>
              <h2 className="text-xl font-semibold text-[#0f172a]">Track purchases</h2>
              <p className="text-sm text-[#6b7280]">View every COD order and its delivery progress.</p>
            </div>
            <Link href="/orders" className="rounded-full bg-[#2874f0] px-6 py-3 text-sm font-semibold text-white">
              View my orders
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
