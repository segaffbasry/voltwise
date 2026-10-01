import type { ReactNode } from "react";
import { brandIcons, type BrandIcon } from "@/lib/brand-icons";

export const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Links that leave the page open in a new tab with rel="noopener" (brief); motion.tsx keeps them from navigating at all.
export const linkProps = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {});

/* Virya's c-button icon: a 9px arrow stroked in currentColor. */
export function Arrow({ className = "arrow" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 10 10" aria-hidden="true" focusable="false">
    <path d="M1 5h8M5.5 1.5 9 5 5.5 8.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
  </svg>;
}

/* Rounded button in Virya's c-button shape (virya-energy.com theme CSS):
     .c-button  border-radius 18px · padding 17px 28px · transition .3s ease-out · hover/focus scale(.97)
     .has-icon  8px gap, 9px arrow
   Tones map Virya's variants onto the palette: "lime" is c-button--primary (its :after veil darkens on hover),
   "green" is c-button--secondary (turns light on hover), "light" is c-button--white (outlined, fills clear on hover),
   "paper" is c-button--small/being (a neutral chip that lifts to white). */
export function Button({ href, children, tone = "lime", className = "", reveal = true, onClick }: {
  href: string; children: ReactNode; tone?: "lime" | "green" | "light" | "paper" | "ink"; className?: string; reveal?: boolean; onClick?: () => void;
}) {
  return <a href={href} className={`btn btn-${tone} ${className}`} data-reveal={reveal ? "label" : undefined} onClick={onClick} {...linkProps(href)}>
    <span>{children}</span><span className="btn-icon"><Arrow /></span>
  </a>;
}

export function SocialIcon({ icon, size = 18 }: { icon: BrandIcon; size?: number }) {
  return <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false"><path d={brandIcons[icon]} fill="currentColor" /></svg>;
}

/* Two-tone headline (Virya: "We develop <span>sustainable energy solutions</span>", the second phrase muted).
   Here the second phrase takes the brand accent of whatever ground it sits on (green on paper, lime on green). */
export function TwoTone({ parts }: { parts: string[] }) {
  return <>{parts[0]}{parts[1] && <>{" "}<span className="tone">{parts[1]}</span></>}</>;
}
