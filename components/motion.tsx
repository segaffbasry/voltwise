"use client";

import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { useEffect } from "react";
import { reducedMotion } from "@/components/ui";
import { EASE, timing } from "@/lib/ease";
import { getLenis, setLenis } from "@/lib/scroll";
import { splitLines } from "@/lib/split";

// Registered at module load so the preloader, hero and menu can build timelines on "volt" in their own effects.
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, CustomEase);
  CustomEase.create("volt", EASE);
}

/* The reveal set (README "Motion system"): one small fixed set of moves, applied the same way everywhere.
   label    eyebrows, buttons, small links: 12px rise and fade
   heading  the whole phrase fades and rises 20px (Virya's fade-in: y 20 → 0, 1s), never split
   text     paragraphs: words rise out of a mask, one line a beat after another
   card     cards: Virya's ScrollTrigger.batch, 20px rise and fade, 0.2s apart
   image    photography clips open from the bottom edge; [data-parallax] adds ±5% drift while it crosses the screen;
            [data-grow] panels widen from 92% to full size as they rise (scrubbed)
   count    [data-count] figures run up from zero once
   All play once on power1.out ("volt"); inside [data-late] sections they run at 75% of the duration.
   Trigger line: Virya fires at "top 80%"; it is set a little lower here (85 to 90%) so short sections settle sooner. */
export function usePageMotion() {
  useEffect(() => {
    const reduced = reducedMotion();
    const root = document.documentElement;

    /* Links never leave the page (standing rule for these private demos): hrefs stay real and verifiable,
       but a capture-phase guard cancels any click or middle-click on a link that doesn't start with "#". */
    const stayOnPage = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a[href]");
      if (link && !link.getAttribute("href")!.startsWith("#")) event.preventDefault();
    };
    document.addEventListener("click", stayOnPage, true);
    document.addEventListener("auxclick", stayOnPage, true);

    /* Smooth scroll. Virya scrolls natively and smooths only its hero parallax, by interpolating 10% of the way to
       the target each tick (`currentParallaxX += (mouseX - currentParallaxX) * 0.1`). Lenis uses the same 0.1 lerp,
       driven by the GSAP ticker so ScrollTrigger reads the same frame. */
    let lenis: Lenis | null = null;
    let tick: ((time: number) => void) | null = null;
    if (!reduced) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
      setLenis(lenis);
      lenis.on("scroll", ScrollTrigger.update);
      tick = (time: number) => lenis!.raf(time * 1000);
      gsap.ticker.add(tick);
      gsap.ticker.lagSmoothing(0);
      if (root.classList.contains("is-loading")) lenis.stop();
    }
    const start = () => getLenis()?.start();
    document.addEventListener("intro:done", start);

    // In-page anchors go through Lenis (Virya: ScrollToPlugin, power2.inOut) and move focus to the target.
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element).closest<HTMLAnchorElement>("a[href^='#']");
      if (!link) return;
      const hash = link.getAttribute("href")!;
      const target = hash === "#top" ? null : document.querySelector<HTMLElement>(hash);
      if (hash !== "#top" && !target) return;
      event.preventDefault();
      if (lenis) { lenis.start(); lenis.scrollTo(target ?? 0, { duration: 1.2, easing: (t) => (t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2) }); }
      else (target ?? document.body).scrollIntoView();
      target?.focus({ preventScroll: true });
    };
    document.addEventListener("click", onClick);

    /* Reveals. */
    const splits: { revert: () => void }[] = [];
    const scale = (el: Element) => (el.closest("[data-late]") ? timing.late : 1);
    // data-shown lifts the CSS start-state guards (globals.css) once GSAP has set its own start states.
    const mark = () => document.querySelectorAll("[data-reveal]").forEach((el) => el.setAttribute("data-shown", ""));
    const ctx = gsap.context(() => {
      if (reduced) { mark(); return; }
      const all = (kind: string) => gsap.utils.toArray<HTMLElement>(`[data-reveal="${kind}"]:not([data-hero] [data-reveal])`);

      all("label").forEach((el) => {
        gsap.set(el, { opacity: 0, y: 12 });
        ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: timing.label * scale(el), ease: "volt", clearProps: "transform" }) });
      });

      all("heading").forEach((el) => {
        gsap.set(el, { opacity: 0, y: timing.rise });
        ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => gsap.to(el, { opacity: 1, y: 0, duration: timing.heading * scale(el), ease: "volt", clearProps: "transform" }) });
      });

      all("text").forEach((el) => {
        const split = splitLines(el);
        splits.push(split);
        gsap.set(split.words, { yPercent: 105 });
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => {
          split.lines.forEach((line, i) => gsap.to(line, { yPercent: 0, duration: timing.text * scale(el), ease: "volt", delay: i * timing.lineStagger * scale(el) }));
        } });
      });

      const cards = all("card");
      gsap.set(cards, { opacity: 0, y: timing.rise });
      ScrollTrigger.batch(cards, { start: "top 90%", once: true, onEnter: (batch) => gsap.to(batch, { opacity: 1, y: 0, duration: timing.card * scale(batch[0]), ease: "volt", stagger: timing.cardStagger * scale(batch[0]), overwrite: true, clearProps: "transform" }) });

      all("image").forEach((el) => {
        gsap.set(el, { clipPath: "inset(100% 0% 0% 0% round 28px)" });
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(el, { clipPath: "inset(0% 0% 0% 0% round 28px)", duration: timing.image * scale(el), ease: "volt", clearProps: "clipPath" }) });
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const media = el.querySelector("img, video"); if (!media) return;
        gsap.fromTo(media, { yPercent: -5, scale: 1.1 }, { yPercent: 5, scale: 1.1, ease: "none", scrollTrigger: { trigger: el, scrub: true, start: "top bottom", end: "bottom top" } });
      });
      // grow: large photo panels widen from 92% to full size while they travel up the screen (scrubbed).
      gsap.utils.toArray<HTMLElement>("[data-grow]").forEach((el) => {
        gsap.fromTo(el, { scale: .92 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, scrub: true, start: "top bottom", end: "top 30%" } });
      });

      // count: figures run up from zero to their value once, when they enter.
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const to = Number(el.dataset.count), n = { v: 0 };
        el.textContent = "0";
        ScrollTrigger.create({ trigger: el, start: "top 90%", once: true, onEnter: () => gsap.to(n, { v: to, duration: 1.4 * scale(el), ease: "power2.out", onUpdate: () => { el.textContent = String(Math.round(n.v)); } }) });
      });
      mark();
    });

    /* The header takes its colour from whatever is under it: [data-tone="dark"] areas flip it to paper. */
    let frame = 0;
    const update = () => {
      frame = 0;
      const probe = 40;
      const dark = Array.from(document.querySelectorAll<HTMLElement>("[data-tone='dark']:not(.menu)")).some((el) => {
        const r = el.getBoundingClientRect(); return r.top <= probe && r.bottom >= probe && r.left <= 60 && r.right >= 60;
      });
      root.dataset.header = dark ? "dark" : "light";
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    window.addEventListener("scroll", queue, { passive: true });
    window.addEventListener("resize", queue);
    document.addEventListener("hero:update", queue);
    update();
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    void document.fonts?.ready.then(refresh);

    return () => {
      document.removeEventListener("click", stayOnPage, true);
      document.removeEventListener("auxclick", stayOnPage, true);
      document.removeEventListener("click", onClick);
      document.removeEventListener("intro:done", start);
      document.removeEventListener("hero:update", queue);
      window.removeEventListener("scroll", queue); window.removeEventListener("resize", queue); window.removeEventListener("load", refresh);
      cancelAnimationFrame(frame);
      ctx.revert();
      splits.forEach((split) => split.revert());
      if (tick) gsap.ticker.remove(tick);
      lenis?.destroy(); setLenis(null);
    };
  }, []);
}

/* Traps focus inside an overlay, closes on Escape, pauses the page scroll and returns focus to the trigger. */
export function focusOverlay(container: HTMLElement, close: () => void, trigger?: HTMLElement | null) {
  const previous = trigger ?? (document.activeElement as HTMLElement);
  getLenis()?.stop();
  document.documentElement.classList.add("overlay-open");
  const focusable = () => Array.from(container.querySelectorAll<HTMLElement>("a[href], button:not([disabled]), [tabindex='0']")).filter((el) => el.offsetParent !== null);
  focusable()[0]?.focus({ preventScroll: true });
  const handleKey = (event: KeyboardEvent) => {
    if (event.key === "Escape") { event.preventDefault(); close(); }
    if (event.key === "Tab") {
      const items = focusable(); const first = items[0]; const last = items[items.length - 1];
      if (!first) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  };
  document.addEventListener("keydown", handleKey);
  return () => {
    document.removeEventListener("keydown", handleKey);
    document.documentElement.classList.remove("overlay-open");
    getLenis()?.start();
    previous?.focus({ preventScroll: true });
  };
}
