const linkSections = [
  {
    title: "About",
    links: ["Contact Us", "About Us", "Careers", "Flipkart Stories", "Press", "Corporate Information"],
  },
  {
    title: "Group Companies",
    links: ["Myntra", "Cleartrip", "Shopsy"],
  },
  {
    title: "Help",
    links: ["Payments", "Shipping", "Cancellation & Returns", "FAQ"],
  },
  {
    title: "Consumer Policy",
    links: ["Cancellation & Returns", "Terms Of Use", "Security", "Privacy", "Sitemap", "Grievance Redressal", "EPR Compliance", "FSSAI License"],
  },
];

const contactSections = [
  {
    title: "Mail Us:",
    lines: [
      "Flipkart Internet Private Limited,",
      "Buildings Alyssa, Begonia &",
      "Clove Embassy Tech Village,",
      "Outer Ring Road, Devarabeesanahalli Village,",
      "Bengaluru, 560103,",
      "Karnataka, India",
    ],
  },

];

const socialLinks = [
  { label: "Facebook", icon: "facebook.com" },
  { label: "Twitter", icon: "twitter.com" },
  { label: "YouTube", icon: "youtube.com" },
  { label: "Instagram", icon: "instagram.com" },
];

const footerActions = [
  { label: "Become a Seller", icon: "store" },
  { label: "Advertise", icon: "megaphone" },
  { label: "Gift Cards", icon: "gift" },
  { label: "Help Center", icon: "help" },
];



const containerClass = "mx-auto w-full max-w-[1600px] px-4";

const ActionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "store":
      return (
        <svg className="h-4 w-4 text-[#f2b700]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 9h16l-1 4H5L4 9Zm1 4h14v7H5v-7Zm4 0v7m6-7v7" />
        </svg>
      );
    case "megaphone":
      return (
        <svg className="h-4 w-4 text-[#f2b700]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 11V7l12-4v18l-12-4v-4m0 0H2m2 0h4" />
        </svg>
      );
    case "gift":
      return (
        <svg className="h-4 w-4 text-[#f2b700]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <rect x="3" y="8" width="18" height="13" rx="2" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18M12 8v13" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M7 6a2.5 2.5 0 1 1 5 0c0 1.5-2.5 2-2.5 2S7 7.5 7 6Zm10 0a2.5 2.5 0 1 0-5 0c0 1.5 2.5 2 2.5 2S17 7.5 17 6Z" />
        </svg>
      );
    default:
      return (
        <svg className="h-4 w-4 text-[#f2b700]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
          <circle cx="12" cy="12" r="9" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2 2" />
        </svg>
      );
  }
};

const SiteFooter = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="bg-[#172337] text-white">
      <div className={`${containerClass} py-10 space-y-8`}>
        <div className="grid gap-8 lg:grid-cols-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
            {linkSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b93a7]">{section.title}</p>
                <ul className="mt-3 space-y-1 text-sm text-[#dde3f4]">
                  {section.links.map((label) => (
                    <li key={label} className="hover:text-white">
                      <a href="#">{label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 space-y-6 border-t border-[#22304d] pt-6 lg:border-l lg:border-t-0 lg:pl-10">
            {contactSections.map((section) => (
              <div key={section.title}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b93a7]">{section.title}</p>
                <p className="mt-3 text-sm leading-relaxed text-[#dde3f4]">
                  {section.lines.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </p>
              </div>
            ))}

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b93a7]">Social</p>
              <div className="mt-3 flex gap-3">
                {socialLinks.map((item) => (
                  <a
                    key={item.label}
                    href={`https://${item.icon}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 text-white hover:border-white"
                    aria-label={item.label}
                  >
                    <span className="text-xs font-semibold">{item.label[0]}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 border-t border-[#22304d] pt-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-[#dde3f4]">
            {footerActions.map((action) => (
              <button
                key={action.label}
                type="button"
                className="flex items-center gap-2 rounded-full border border-white/20 bg-[#142033] px-4 py-2 text-left text-xs font-semibold text-[#f2b700] shadow-sm"
              >
                <ActionIcon type={action.icon} />
                <span className="text-white">{action.label}</span>
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b93a7]">
            <p>© {currentYear} Flipkart.com</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
