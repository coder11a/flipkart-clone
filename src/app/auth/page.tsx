"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import SiteHeaderTop from "../components/SiteHeaderTop";
import { containerClass } from "../components/categoryContent";

const inputClass =
  "w-full border-b border-[#d1d5db] bg-transparent py-3 text-sm text-[#111111] placeholder:text-[#9e9e9e] focus:border-[#2874f0] focus:outline-none";

const cardSectionClass = "w-full p-8 sm:p-10";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });

  const heading = mode === "login" ? "Login" : "Sign up";
  const subheading =
    mode === "login"
      ? "Get access to your Orders, Wishlist and Recommendations"
      : "Join Flipkart to explore exclusive deals";

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "signup" : "login"));
    setStatus({ type: "idle" });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus({ type: "loading" });

    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Something went wrong");
      }

      setStatus({ type: "success", message: mode === "login" ? "Logged in" : "Account created" });
      setTimeout(() => {
        router.replace("/");
        router.refresh();
      }, 600);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setStatus({ type: "error", message });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f1f3f6]">
      <header className="border-b border-[#e5e7eb] bg-white/95 backdrop-blur">
        <SiteHeaderTop containerClass={containerClass} />
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="flex w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-[0_10px_45px_rgba(15,23,42,0.08)]">
          <div className="hidden w-[40%] flex-col justify-between bg-[#2874f0] p-10 text-white md:flex">
            <div>
              <p className="text-xl font-semibold">Login</p>
              <p className="mt-3 text-sm text-white/90">{subheading}</p>
            </div>
            <div className="mt-10 flex flex-1 items-center justify-center">
              <img src="/assets/1.webp" alt="Login illustration" className="max-h-48 w-full object-contain" />
            </div>
            <p className="mt-10 text-sm text-white/80">Secure access to your Flipkart account</p>
          </div>

          <div className={cardSectionClass}>
            <form className="mx-auto max-w-sm space-y-6" onSubmit={handleSubmit}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.35em] text-[#b3b3b3]">{heading}</p>
              <p className="mt-2 text-2xl font-semibold text-[#1f1f1f]">
                {mode === "login" ? "Enter Email / Mobile number" : "Create your account"}
              </p>
            </div>

            {mode === "signup" && (
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-[#9e9e9e]" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className={inputClass}
                  placeholder="Rahul Sharma"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#9e9e9e]" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={inputClass}
                placeholder="you@email.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-[#9e9e9e]" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                className={inputClass}
                placeholder="••••••••"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
              />
            </div>

            <p className="text-xs text-[#9e9e9e]">
              By continuing, you agree to Flipkart&apos;s
              <a href="#" className="px-1 text-[#2874f0]">Terms of Use</a>
              and
              <a href="#" className="pl-1 text-[#2874f0]">Privacy Policy</a>.
            </p>

              <button
                type="submit"
                disabled={status.type === "loading"}
                className="w-full rounded-sm bg-[#fb641b] py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-[#e55a15] disabled:cursor-not-allowed disabled:bg-[#f4a482]"
              >
                {status.type === "loading" ? "Please wait" : mode === "login" ? "Log in" : "Create account"}
              </button>
            </form>

            <div className="mx-auto mt-6 max-w-sm text-center text-sm text-[#475569]">
              {status.type === "error" && <p className="text-[#dc2626]">{status.message}</p>}
              {status.type === "success" && <p className="text-[#16a34a]">{status.message}! Redirecting…</p>}
            </div>

            <div className="mx-auto mt-6 max-w-sm text-center text-sm text-[#2874f0]">
              {mode === "login" ? "New to Flipkart?" : "Already have an account?"}&nbsp;
              <button type="button" onClick={toggleMode} className="font-semibold">
                {mode === "login" ? "Create an account" : "Log in"}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
