import type { Metadata, Viewport } from "next";
import { Shell } from "@/components/chrome";
import { posthogSnippet } from "@/lib/posthog";
import "./globals.css";
import "@/styles/ui.css";
import "@/styles/chrome.css";
import "@/styles/hero.css";
import "@/styles/home.css";

// Title and description are the live homepage's own (voltwisepower.com).
export const metadata: Metadata = {
  title: "Voltwise | Accelerating the path to net zero",
  description: "Voltwise is an Independent Power Producer (IPP) that develops, constructs and operates grid-scale battery energy storage system (BESS) projects.",
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

export const viewport: Viewport = { themeColor: "#15883c" };

/* `js` (and the preloader's `is-loading`/`is-landing`) is set before first paint, unless reduced motion is requested
   or the intro already played in this browser session, so reveal targets start hidden without a flash. Without
   JavaScript the classes are never added and everything renders in place; the <noscript> style hides the preloader. */
const boot = "(function(){var d=document.documentElement;if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;d.classList.add('js');var seen=false;try{seen=sessionStorage.getItem('voltwise-intro')==='1'}catch(e){}if(!seen)d.classList.add('is-loading','is-landing')})()";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" data-header="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
        <script dangerouslySetInnerHTML={{ __html: posthogSnippet }} />
        <link rel="preload" href="/fonts/overpass.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/fonts/anek.woff2" as="font" type="font/woff2" crossOrigin="" />
        <link rel="preload" href="/media/hero-poster.jpg" as="image" />
        <noscript><style>{".preloader{display:none!important}"}</style></noscript>
      </head>
      <body><Shell>{children}</Shell></body>
    </html>
  );
}
