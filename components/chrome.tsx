"use client";

import gsap from "gsap";
import type { ReactNode } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "@/components/Logo";
import { focusOverlay, usePageMotion } from "@/components/motion";
import { Arrow, Button, SocialIcon, linkProps, reducedMotion } from "@/components/ui";
import { contactLink, copyright, languages, legal, nav, offices, socials } from "@/lib/site";

// Menu shortcuts to the homepage's own sections (scrolled through Lenis).
const onPage = [
  { label: "Home", href: "#top" },
  { label: "Who we are", href: "#who-we-are" },
  { label: "Accelerating net zero", href: "#net-zero" },
  { label: "Powered by Sandbrook", href: "#sandbrook" },
  { label: "Latest news", href: "#news" },
  { label: "Contact", href: "#enquire" },
];

/* Full-screen menu. In: a green panel grows from the toggle's corner as a rounded card (Virya's 28px radius) and
   opens to the full screen, then the links rise one after another. One GSAP timeline; reverse() plays the way out.
   Focus is trapped, Esc closes, focus returns to the trigger. */
function Menu({ open, close, trigger }: { open: boolean; close: () => void; trigger: HTMLElement | null }) {
  const root = useRef<HTMLDivElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const el = root.current; if (!el) return;
    const tl = gsap.timeline({ paused: true, defaults: { ease: "volt" }, onReverseComplete: () => { el.style.visibility = "hidden"; } });
    tl.fromTo(el, { clipPath: "inset(0% 0% 100% 60% round 28px)" }, { clipPath: "inset(0% 0% 0% 0% round 0px)", duration: .7, ease: "power3.inOut" }, 0)
      .fromTo(el.querySelectorAll("[data-menu-in]"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .6, stagger: { amount: .35 } }, .3);
    timeline.current = tl;
    return () => { tl.kill(); timeline.current = null; };
  }, []);

  useEffect(() => {
    const el = root.current, tl = timeline.current; if (!el || !tl) return;
    if (open) {
      el.style.visibility = "visible";
      tl.timeScale(reducedMotion() ? 50 : 1).play();
      return focusOverlay(el, close, trigger);
    }
    if (tl.progress() > 0) tl.timeScale(reducedMotion() ? 50 : 1.6).reverse();
  }, [open, close, trigger]);

  return <div className="menu" id="site-menu" ref={root} role="dialog" aria-modal="true" aria-label="Site menu" aria-hidden={!open} inert={!open} data-lenis-prevent data-tone="dark">
    <div className="menu-top wrap">
      <a href="#top" className="brand" onClick={close} aria-label="Voltwise, back to the top"><Logo title="" /></a>
      <button className="menu-close" onClick={close}><span>Close</span><span className="menu-x" aria-hidden="true" /></button>
    </div>
    <div className="menu-body wrap">
      <nav className="menu-page" aria-label="On this page">
        <p className="menu-label" data-menu-in>On this page</p>
        <ul>{onPage.map((l) => <li key={l.href} data-menu-in><a href={l.href} onClick={close}><span>{l.label}</span><Arrow /></a></li>)}</ul>
      </nav>
      <div className="menu-side">
        <nav aria-label="Voltwise site">
          <p className="menu-label" data-menu-in>Voltwise</p>
          <ul className="menu-site">{[...nav, contactLink].map((l) => <li key={l.href} data-menu-in><a href={l.href} className="u-link" {...linkProps(l.href)}>{l.label}</a></li>)}</ul>
        </nav>
        <div className="menu-offices">
          {offices.map((o) => <address key={o.country} data-menu-in>
            <p className="menu-label">{o.country}</p>
            <p>{o.company}<br />{o.lines.join(", ")}</p>
          </address>)}
        </div>
        <div className="menu-foot" data-menu-in>
          <ul className="langs" aria-label="Language">{languages.map((l) => <li key={l.label}><a href={l.href} lang={l.label.toLowerCase()} aria-current={l.label === "EN" ? "true" : undefined} {...linkProps(l.href)}>{l.label}</a></li>)}</ul>
          <ul className="socials">{socials.map((s) => <li key={s.name}><a href={s.href} {...linkProps(s.href)} aria-label={`Voltwise on ${s.name}`}><SocialIcon icon={s.icon} /></a></li>)}</ul>
        </div>
      </div>
    </div>
  </div>;
}

/* Frameless header: no bar or box. Its colour follows what is underneath (motion.tsx sets html[data-header]);
   it slides away on the way down and returns on the way up. */
function Header() {
  const [open, setOpen] = useState(false);
  const [trigger, setTrigger] = useState<HTMLElement | null>(null);
  const bar = useRef<HTMLElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = bar.current; if (!el) return;
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY, delta = y - last;
      if (y < 120) { el.classList.remove("is-hidden"); last = y; return; }
      if (Math.abs(delta) < 6) return;
      el.classList.toggle("is-hidden", delta > 0 && !document.documentElement.classList.contains("overlay-open"));
      last = y;
    };
    const reveal = () => el.classList.remove("is-hidden");
    el.addEventListener("focusin", reveal);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => { el.removeEventListener("focusin", reveal); window.removeEventListener("scroll", onScroll); };
  }, []);

  return <>
    <header className="site-header" ref={bar}>
      <div className="wrap site-header-inner">
        <a href="#top" className="brand" aria-label="Voltwise, back to the top"><Logo title="" /></a>
        <div className="header-actions" data-hero-part>
          <ul className="langs header-langs" aria-label="Language">{languages.map((l) => <li key={l.label}><a href={l.href} lang={l.label.toLowerCase()} aria-current={l.label === "EN" ? "true" : undefined} {...linkProps(l.href)}>{l.label}</a></li>)}</ul>
          <Button href={contactLink.href} tone="lime" className="btn-sm header-cta" reveal={false}>Contact us</Button>
          <button className="menu-toggle" aria-haspopup="dialog" aria-expanded={open} aria-controls="site-menu" onClick={(e) => { setTrigger(e.currentTarget); setOpen(true); }}>
            <span>Menu</span><span className="menu-lines" aria-hidden="true"><i /><i /></span>
          </button>
        </div>
      </div>
    </header>
    <Menu open={open} close={close} trigger={trigger} />
  </>;
}

/* Footer: the live footer's legal row and LinkedIn, plus the two offices from /contact and the site links.
   The live "Website by VSNRY" credit is left out: it names the current site's agency, not Voltwise. */
function Footer() {
  return <footer className="site-footer" data-tone="dark" data-late>
    <div className="wrap">
      <div className="footer-grid">
        <a href="#top" className="footer-logo" aria-label="Voltwise, back to the top" data-reveal="label"><Logo title="" /></a>
        <nav className="footer-col" aria-label="Voltwise site" data-reveal="card">
          <h2 className="footer-label">Explore</h2>
          <ul>{[...nav, contactLink].map((l) => <li key={l.href}><a href={l.href} className="u-link" {...linkProps(l.href)}>{l.label}</a></li>)}</ul>
        </nav>
        {offices.map((o) => <address key={o.country} className="footer-col" data-reveal="card">
          <h2 className="footer-label">{o.country}</h2>
          <p>{o.company}</p>
          <p>{o.lines.map((line) => <span key={line}>{line}<br /></span>)}</p>
        </address>)}
        <div className="footer-col" data-reveal="card">
          <h2 className="footer-label">Follow</h2>
          <ul className="socials">{socials.map((s) => <li key={s.name}><a href={s.href} {...linkProps(s.href)} aria-label={`Voltwise on ${s.name}`}><SocialIcon icon={s.icon} size={22} /></a></li>)}</ul>
        </div>
      </div>
      <div className="footer-bar">
        <p>{copyright}</p>
        <ul className="footer-legal">{legal.map((l) => <li key={l.label}><a href={l.href} className="u-link" {...linkProps(l.href)}>{l.label}</a></li>)}</ul>
      </div>
    </div>
  </footer>;
}

/* Everything around the page: header and menu, footer, smooth scroll and reveals. */
export function Shell({ children }: { children: ReactNode }) {
  usePageMotion();
  return <>
    <a className="skip-link" href="#main">Skip to content</a>
    <div id="top" tabIndex={-1} />
    <Header />
    <main id="main" tabIndex={-1}>{children}</main>
    <Footer />
  </>;
}
