"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const serviceBadges = [
  { label: "Flipkart", image: "/assets/logo.png" },
  { label: "Minutes", image: "/assets/minutes.png" },
  { label: "Travel", image: "/assets/travel.png" },
];

const secondaryActions = [
  { label: "More", icon: "dots" },
  { label: "Cart", icon: "cart", badge: 0 },
];

const moreMenuItems = [
  { label: "Become a Seller", icon: "store" },
  { label: "Notification Settings", icon: "bell" },
  { label: "24x7 Customer Care", icon: "support" },
  { label: "Advertise on Flipkart", icon: "ads" },
];

type ProductSuggestion = {
  slug: string;
  title: string;
  brand: string;
  price: number;
  imageUrl: string;
};

const ActionIcon = ({ icon }: { icon: string }) => {
  if (icon === "user") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm7 9a7 7 0 0 0-14 0" />
      </svg>
    );
  }

  if (icon === "cart") {
    return (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 5h2l1.5 11h11L20 8H7" />
        <circle cx="10" cy="18" r="1.4" />
        <circle cx="17" cy="18" r="1.4" />
      </svg>
    );
  }

  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </svg>
  );
};

const ActionIconCircle = ({ icon }: { icon: string }) => (
  <span className="flex h-8 w-8 items-center justify-center rounded-full text-slate-800">
    <ActionIcon icon={icon} />
  </span>
);

const MoreMenuItemIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case "store":
      return (
        <svg className="h-5 w-5 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16l-1 4H5L4 7Zm1 4h14v8H5v-8Zm4 0v8m6-8v8" />
        </svg>
      );
    case "bell":
      return (
        <svg className="h-5 w-5 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9l-1-1V11a4 4 0 1 1 8 0v5l-1 1Zm-6 0a3 3 0 0 0 6 0" />
        </svg>
      );
    case "support":
      return (
        <svg className="h-5 w-5 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 8a6 6 0 0 0-12 0v6a4 4 0 0 0 4 4h1" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 10H4v3h2m12-3h2v3h-2" />
        </svg>
      );
    case "ads":
    default:
      return (
        <svg className="h-5 w-5 text-[#0f172a]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <rect x="4" y="4" width="16" height="12" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 20h8" />
        </svg>
      );
  }
};

const formatCurrency = (value: number) => `₹${value.toLocaleString("en-IN")}`;

const SearchBar = () => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    if (query.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    fetchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=6`);
        if (!response.ok) {
          throw new Error("Failed to search");
        }
        const data = (await response.json()) as { products: ProductSuggestion[] };
        setSuggestions(data.products ?? []);
        setActiveIndex(data.products.length ? 0 : -1);
      } catch (error) {
        console.error("Search failed", error);
        setSuggestions([]);
        setActiveIndex(-1);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [query]);

  const navigateToProduct = (slug: string) => {
    if (!slug) return;
    router.push(`/product/${slug}`);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => (prev + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const target = suggestions[activeIndex >= 0 ? activeIndex : 0];
      if (target) navigateToProduct(target.slug);
    }
  };

  const showResults = isOpen && (query.trim().length >= 2 || suggestions.length > 0);

  return (
    <div className="relative w-full">
      <div className="flex w-full flex-1 items-center gap-2 rounded-xl border-2 border-blue-500 bg-white px-4 py-2 text-sm text-[#5e616a] shadow-inner">
        <svg className="h-4 w-4 text-black" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="m19 19-4-4m1-4a6 6 0 1 1-12 0 6 6 0 0 1 12 0Z" />
        </svg>
        <input
          className="w-full bg-white text-md font-medium text-[#1c1f23] placeholder:text-[#7e8087] placeholder:text-md focus:outline-none"
          placeholder="Search for Products, Brands and More"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          onKeyDown={handleKeyDown}
        />
      </div>

      {showResults && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 rounded-2xl border border-[#e5e7eb] bg-white/95 shadow-xl">
          {isLoading ? (
            <div className="px-4 py-3 text-sm text-[#6b7280]">Searching…</div>
          ) : suggestions.length ? (
            <ul className="divide-y divide-[#f1f5f9]">
              {suggestions.map((product, index) => (
                <li
                  key={product.slug}
                  className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition ${
                    index === activeIndex ? "bg-[#eef2ff]" : "hover:bg-[#f8fafc]"
                  }`}
                  onMouseDown={(event) => {
                    event.preventDefault();
                    navigateToProduct(product.slug);
                  }}
                  onMouseEnter={() => setActiveIndex(index)}
                >
                  <Image
                    src={product.imageUrl}
                    alt={product.title}
                    width={48}
                    height={48}
                    className="h-12 w-12 rounded-xl object-cover"
                    unoptimized
                  />
                  <div className="flex flex-1 flex-col">
                    <span className="font-semibold text-[#0f172a]">{product.title}</span>
                    <span className="text-xs text-[#6b7280]">{product.brand}</span>
                  </div>
                  <span className="text-sm font-semibold text-[#0f172a]">{formatCurrency(product.price)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-3 text-sm text-[#6b7280]">No products found</div>
          )}
        </div>
      )}
    </div>
  );
};

export default function SiteHeaderTop({ containerClass }: { containerClass: string }) {
  return (
    <div className={`${containerClass} space-y-3 py-4`}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            {serviceBadges.map((badge) => (
              <Link key={badge.label} href="/">
                <div className="flex items-center rounded-xl border border-[#e5e7eb] bg-white">
                  <Image
                    src={badge.image}
                    alt={badge.label}
                    width={80}
                    height={32}
                    className="h-10 w-auto rounded-xl object-fill"
                  />
                  <span className="sr-only">{badge.label}</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 text-md font-medium text-[#3b3d43] text-right">
            <div className="flex items-center gap-2 text-sm text-[#4d4f59]">
              <svg className="h-4 w-4 text-[#183b56]" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 21c4.2-3.5 7-7.4 7-11.2A7 7 0 0 0 5 9.8C5 13.6 7.8 17.5 12 21Z" />
                <circle cx="12" cy="9" r="2" />
              </svg>
              <span>
                <span className="font-semibold">Location not set</span> ·
              </span>
            </div>
            <button className="text-sm font-semibold text-[#2874f0] hover:underline">Select delivery location &gt;</button>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 justify-between">
          <div className="flex-1 min-w-[260px]">
            <SearchBar />
          </div>

          <HeaderActions />
        </div>
      </div>
    </div>
  );
}

type SessionUser = {
  name: string;
  email: string;
};

const HeaderActions = () => {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(false);
  const [logoutPending, setLogoutPending] = useState(false);
  const [cartCount, setCartCount] = useState<number | null>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSession = async () => {
      try {
        const response = await fetch("/api/auth/me", { credentials: "same-origin" });
        if (!response.ok) {
          if (isMounted) {
            setSessionUser(null);
          }
          return;
        }
        const data = (await response.json()) as { user: SessionUser | null };
        if (isMounted) {
          setSessionUser(data.user);
        }
      } catch (error) {
        console.error("Failed to load session", error);
        if (isMounted) {
          setSessionUser(null);
        }
      } finally {
        if (isMounted) {
          setSessionLoaded(true);
        }
      }
    };

    fetchSession();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    const fetchCartCount = async () => {
      try {
        const response = await fetch("/api/cart/count", { credentials: "same-origin" });
        if (!response.ok) {
          if (isMounted) setCartCount(0);
          return;
        }
        const data = (await response.json()) as { count: number };
        if (isMounted) setCartCount(data.count);
      } catch (error) {
        console.error("Failed to load cart count", error);
        if (isMounted) setCartCount(0);
      }
    };

    const handleCartUpdated = () => {
      fetchCartCount();
    };

    fetchCartCount();
    const intervalId = setInterval(fetchCartCount, 60_000);
    window.addEventListener("fk:cart-updated", handleCartUpdated);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener("fk:cart-updated", handleCartUpdated);
    };
  }, []);

  const handleLogout = async () => {
    try {
      setLogoutPending(true);
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
      setSessionUser(null);
      window.location.reload();
    } catch (error) {
      console.error("Failed to log out", error);
    } finally {
      setLogoutPending(false);
    }
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!moreMenuRef.current) return;
      if (!moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, []);

  const firstName = sessionUser?.name?.split(" ")[0] ?? "";
  const initials = sessionUser?.name
    ? sessionUser.name
        .split(" ")
        .filter(Boolean)
        .map((segment) => segment[0]?.toUpperCase())
        .slice(0, 2)
        .join("")
    : "";

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm font-normal text-slate-700">
      {sessionUser ? (
        <>
          <Link
            href="/account"
            className="flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[#0f172a] transition hover:shadow"
            aria-label="Go to account"
          >
            <ActionIconCircle icon="user" />
            <div className="text-left">
              <p className="text-xs uppercase tracking-wide text-slate-800">Account</p>
            </div>
          </Link>
         
        </>
      ) : (
        <Link
          href="/auth"
          className="rounded-full bg-[#2874f0] px-4 py-2 text-sm font-semibold text-white shadow hover:bg-[#1956b5]"
        >
          {sessionLoaded ? "Login" : "Loading..."}
        </Link>
      )}

      {secondaryActions.map((action) => {
        const isCart = action.label === "Cart";
        const content = (
          <div className="flex items-center gap-2 rounded-full px-3 py-2 text-sm hover:bg-[#f4f6f9]">
            <span className={isCart ? "relative inline-flex" : undefined}>
              <ActionIcon icon={action.icon} />
              {isCart && (
                <span className="absolute -top-2 -right-2 min-w-[20px] rounded-full border-2 border-white bg-[#ef4444] px-1 text-[10px] font-semibold leading-tight text-white">
                  {cartCount ?? "–"}
                </span>
              )}
            </span>
            {action.label}
            {!isCart && action.badge !== undefined ? (
              <span className="rounded-full bg-[#2874f0] px-1.5 text-xs text-white">{action.badge}</span>
            ) : null}
          </div>
        );

        if (isCart) {
          return (
            <Link key={action.label} href="/cart">
              {content}
            </Link>
          );
        }

        if (action.label === "More") {
          return (
            <div key={action.label} className="relative" ref={moreMenuRef}>
              <button
                type="button"
                className="rounded-full"
                onClick={() => setIsMoreOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={isMoreOpen}
              >
                {content}
              </button>
              {isMoreOpen ? (
                <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-[#e5e7eb] bg-white p-4 text-left shadow-xl">
                  <p className="text-xs uppercase tracking-[0.3em] text-[#9ca3af]">More</p>
                  <div className="mt-3 space-y-2">
                    {moreMenuItems.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        disabled
                        aria-disabled
                        className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-medium text-[#0f172a] opacity-80"
                      >
                        <MoreMenuItemIcon icon={item.icon} />
                        {item.label}
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-xs text-[#94a3b8]">Coming soon</p>
                </div>
              ) : null}
            </div>
          );
        }

        return (
          <button key={action.label} className="rounded-full">
            {content}
          </button>
        );
      })}
    </div>
  );
};
