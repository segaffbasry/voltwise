/* Site structure from the live voltwisepower.com header, footer and contact page (checked 2026-10-01).
   Only the homepage is rebuilt, so every link here goes to the real URL on the live site, each one checked against
   /sitemap.xml by `npm run links` (scripts/check-links.mjs). */
import type { BrandIcon } from "@/lib/brand-icons";

export type Link = { label: string; href: string };

export const LIVE = "https://www.voltwisepower.com";

// The live header, in order. The language switch keeps both its real targets.
export const nav: Link[] = [
  { label: "About", href: `${LIVE}/about` },
  { label: "Projects", href: `${LIVE}/projects` },
  { label: "People", href: `${LIVE}/people` },
  { label: "Landowners", href: `${LIVE}/landowners` },
  { label: "News", href: `${LIVE}/news` },
];

export const contactLink: Link = { label: "Contact", href: `${LIVE}/contact` };

export const languages: Link[] = [
  { label: "EN", href: LIVE },
  { label: "DE", href: `${LIVE}/de` },
];

// The live footer's legal row.
export const legal: Link[] = [
  { label: "Terms & Conditions", href: `${LIVE}/terms-and-conditions` },
  { label: "Privacy Policy", href: `${LIVE}/privacy-policy` },
  { label: "Cookies Policy", href: `${LIVE}/cookies-policy` },
  { label: "Corporate Info / Imprint", href: `${LIVE}/corporate-info-imprint` },
];

export const socials: { name: string; href: string; icon: BrandIcon }[] = [
  { name: "LinkedIn", href: "https://www.linkedin.com/company/voltwise-power/posts/?feedView=all", icon: "linkedin" },
];

// "Our offices" from /contact. The live site obfuscates its email address, so none is shown here.
export const offices = [
  { country: "United Kingdom", company: "Voltwise Power Holdings Limited (UK)", lines: ["1 Leadenhall Street", "London", "EC3V 1AB"] },
  { country: "Germany", company: "Voltwise DE GmbH", lines: ["Grünwalder Weg 32", "82041 Oberhaching"] },
];

// Live: "© Copyright 2024 - 2026."; the range is written out (no dashes in copy).
export const copyright = "© Copyright 2024 to 2026. All Rights Reserved.";
