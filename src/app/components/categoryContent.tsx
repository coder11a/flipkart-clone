import React from "react";

export const containerClass = "mx-auto w-full max-w-[1200px] px-4";

const CategoryIcon = ({ children }: { children: React.ReactNode }) => (
  <svg
    className="h-7 w-7"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#1a1a1a"
    strokeWidth={1.2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {children}
  </svg>
);

export const categoryIcons = {
  bag: (
    <CategoryIcon>
      <path d="M8 9V7a4 4 0 0 1 8 0v2" />
      <rect x="5" y="9" width="14" height="11" rx="2" />
      <path d="M10 13h4" />
    </CategoryIcon>
  ),
  fashion: (
    <CategoryIcon>
      <path d="M7 5 9.5 7h5L17 5l3 2-2 4v8H6V11L4 7Z" />
    </CategoryIcon>
  ),
  mobile: (
    <CategoryIcon>
      <rect x="7" y="4" width="10" height="16" rx="2" />
      <path d="M10 6h4" />
      <path d="M12 18h.01" />
    </CategoryIcon>
  ),
  beauty: (
    <CategoryIcon>
      <rect x="9" y="6" width="6" height="13" rx="2" />
      <path d="M10 6V3h4v3" />
      <path d="M10 11h4" />
    </CategoryIcon>
  ),
  electronics: (
    <CategoryIcon>
      <rect x="4" y="6" width="16" height="11" rx="2" />
      <path d="M12 17v3" />
      <path d="M9 20h6" />
    </CategoryIcon>
  ),
  home: (
    <CategoryIcon>
      <path d="M12 4 5 11h14Z" />
      <path d="M12 11v7" />
      <path d="M9 18h6" />
      <path d="M8 21h8" />
    </CategoryIcon>
  ),
  appliance: (
    <CategoryIcon>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <circle cx="12" cy="13" r="4" />
      <circle cx="12" cy="13" r="2" />
      <path d="M9 7h6" />
      <path d="M8 5h2" />
    </CategoryIcon>
  ),
  toys: (
    <CategoryIcon>
      <rect x="6" y="15" width="12" height="5" rx="1.5" />
      <rect x="9" y="9" width="6" height="5" rx="1" />
      <path d="M12 4l3 5H9Z" />
    </CategoryIcon>
  ),
  food: (
    <CategoryIcon>
      <rect x="7" y="7" width="10" height="12" rx="2" />
      <path d="M9 7V4h6v3" />
      <path d="M9 12h6" />
    </CategoryIcon>
  ),
  auto: (
    <CategoryIcon>
      <path d="M5 15h14l-1.2-4-3-2H9.2l-3 2Z" />
      <circle cx="8" cy="17" r="1.4" />
      <circle cx="16" cy="17" r="1.4" />
      <path d="M3 15h2" />
      <path d="M19 15h2" />
    </CategoryIcon>
  ),
  scooter: (
    <CategoryIcon>
      <path d="M6 17a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm16 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
      <path d="M4 17h8l3-6h4l2 6" />
      <path d="M11 11V7h2" />
    </CategoryIcon>
  ),
  sports: (
    <CategoryIcon>
      <path d="M4 9v6" />
      <path d="M8 7v10" />
      <path d="M16 7v10" />
      <path d="M20 9v6" />
      <path d="M8 12h8" />
    </CategoryIcon>
  ),
  books: (
    <CategoryIcon>
      <path d="M4 5h8v14H6a2 2 0 0 0-2 2Z" />
      <path d="M20 5h-8v14h6a2 2 0 0 1 2 2Z" />
      <path d="M12 5v14" />
    </CategoryIcon>
  ),
  furniture: (
    <CategoryIcon>
      <path d="M5 12a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3v5H5Z" />
      <path d="M5 17v3" />
      <path d="M19 17v3" />
    </CategoryIcon>
  ),
} as const;

export type CategoryIconKey = keyof typeof categoryIcons;

export const resolveIconKey = (iconKey: string): CategoryIconKey => {
  return (iconKey in categoryIcons ? iconKey : "bag") as CategoryIconKey;
};

export const heroBanners = [
  {
    title: "Phone (4a) Pro",
    price: "From ₹34,999*",
    body: "Sale starts 13th March, 12 PM",
    tag: "NOTHING (R)",
    image: "/assets/1.webp",
    tone: "bg-[#f5f6fb]",
  },
  {
    title: "vivo T5x 5G",
    price: "Launch 17th Mar, 12 PM",
    body: "Segment's smartest smartphone",
    tag: "Flipkart Unique",
    image: "/assets/2.webp",
    tone: "bg-[#0c1424] text-white",
  },
  {
    title: "Phone (4a)",
    price: "From ₹24,999*",
    body: "Sale starts 13th March, 12 PM",
    tag: "NOTHING (R)",
    image: "/assets/3.webp",
    tone: "bg-[#f5f6fb]",
  },
];

export const formatCurrency = (value?: number | null) => {
  if (typeof value !== "number") return undefined;
  return `₹${value.toLocaleString("en-IN")}`;
};
