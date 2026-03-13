"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

const inputClass =
  "w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#111827] placeholder:text-[#9ca3af] focus:border-[#2874f0] focus:outline-none";

const cardClass =
  "w-full max-w-md rounded-3xl border border-[#e5e7eb] bg-white/90 p-8 shadow-[0_15px_55px_rgba(15,23,42,0.12)] backdrop-blur";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<{ type: "idle" | "loading" | "success" | "error"; message?: string }>({ type: "idle" });

  const heading = mode === "login" ? "Welcome back" : "Create your account";
  const subheading = mode === "login" ? "Log in to continue shopping" : "Join Flipkart to explore exclusive deals";

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
    <div className="flex min-h-screen bg-linear-to-br from-[#eef2ff] via-[#f8fbff] to-[#e0f2fe] px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 lg:flex-row lg:items-stretch">
        <div className="flex-1 rounded-[32px] bg-[radial-gradient(circle_at_top,#2874f0,#1a2980)] p-10 text-white shadow-2xl">
          <p className="text-sm uppercase tracking-[0.3em] text-white/80">Flipkart Exclusive</p>
          <h1 className="mt-6 text-4xl font-semibold leading-tight">Unlock member-only prices & perks</h1>
          <ul className="mt-8 space-y-4 text-lg text-white/80">
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">1</span>
              Discover curated deals crafted for you
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">2</span>
              Track orders seamlessly across devices
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/15">3</span>
              Save your wishlists and checkout faster
            </li>
          </ul>
        </div>

        <div className={cardClass}>
          <div className="space-y-1 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.4em] text-[#9ca3af]">{mode === "login" ? "Login" : "Sign up"}</p>
            <h2 className="text-2xl font-semibold text-[#0f172a]">{heading}</h2>
            <p className="text-sm text-[#64748b]">{subheading}</p>
          </div>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            {mode === "signup" && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-[#1f2937]" htmlFor="name">
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

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1f2937]" htmlFor="email">
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

            <div className="space-y-1">
              <label className="text-sm font-medium text-[#1f2937]" htmlFor="password">
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

            <button
              type="submit"
              disabled={status.type === "loading"}
              className="mt-6 w-full rounded-2xl bg-[#2874f0] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#1956b5] disabled:cursor-not-allowed disabled:bg-[#6b7280]"
            >
              {status.type === "loading" ? "Please wait" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>

            <div className="mt-4 text-center text-sm text-[#475569]">
              {status.type === "error" && <p className="text-[#dc2626]">{status.message}</p>}
              {status.type === "success" && <p className="text-[#16a34a]">{status.message}! Redirecting…</p>}
            </div>

          <div className="mt-6 text-center text-sm text-[#475569]">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}&nbsp;
            <button type="button" onClick={toggleMode} className="font-semibold text-[#2874f0] hover:underline">
              {mode === "login" ? "Create one" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
