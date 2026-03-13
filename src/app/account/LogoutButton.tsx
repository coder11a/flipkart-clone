"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    try {
      setPending(true);
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Failed to log out");
      }

      router.replace("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="rounded-full border border-[#e5e7eb] bg-white px-5 py-2 text-sm font-semibold text-[#0f172a] shadow-sm transition hover:border-[#d1d5db] hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Signing out..." : "Logout"}
    </button>
  );
}
