"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import "@/components/motion";
import { reducedMotion } from "@/components/ui";

// Palette values as literals: GSAP tweens fills between colours, not between CSS variables (app/globals.css).
const LIME = "#ccf375", PAPER = "#f3f6f4";

/* Loading screen: the company signing its name while the screen charges like a battery (client request on the
   first review: "could we add a loading screen?"; the first version was a 1.7s once-per-session intro).

   The wordmark is built from its own ten vector parts (lib/logo.ts). Voltwise has no separate symbol: its mark
   lives in three cuts that read as a spark of current, the wedge off the t, the slanted cut on the i and the s
   split by a diagonal bolt. Behind it, the Forest ground fills with Green from the bottom up, its edge lit Lime,
   while a counter runs 0 to 100%.
     Build   0.10–0.65s  v o l t, the t's wedge (Lime), w i, the two halves of the s closing on the bolt (Lime), e
     Charge  0.10–1.40s  ground and counter run to 90%
             then waits for the hero's assets (fonts, poster frame, enough film to play), at most 0.8s more
     Full    +0.35s      90 to 100%; the Lime spark flashes once
     Hold    +0.30s      the spark cools to Paper
     Exit    +0.60s      the word glides into the header logo position while the charged ground wipes up off the
                         screen, uncovering the hero film under its Green veil (no colour jump)
   About 2.6s on a warm cache, never more than 3.4s (a failsafe ends it whatever happens). The handover fires early
   in the exit: removes `is-loading`, sets `data-intro="done"`, dispatches `intro:done`; Lenis waits for it.
   Plays on every load, never with reduced motion, hidden by <noscript>. */

/* Read once, when the module loads: did the boot script (app/layout.tsx) decide the intro plays on this load?
   Reading it here rather than inside the effect keeps React's development double-mount from skipping the intro. */
const shouldPlay = typeof document !== "undefined" && document.documentElement.classList.contains("is-loading");

// Resolves when what the hero shows first is ready: web fonts, the film's poster frame, and enough film to play.
function heroReady() {
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const poster = new Promise<void>((resolve) => { const img = new Image(); img.onload = img.onerror = () => resolve(); img.src = "/media/hero-poster.jpg"; });
  const film = new Promise<void>((resolve) => {
    const video = document.querySelector<HTMLVideoElement>(".hero-film video");
    if (!video || video.readyState >= 3) return resolve();
    video.addEventListener("canplay", () => resolve(), { once: true });
    video.addEventListener("error", () => resolve(), { once: true });
  });
  return Promise.all([fonts, poster, film]);
}

export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const root = document.documentElement;
    let handed = false, dead = false;
    const handover = () => {
      if (handed) return; handed = true;
      root.classList.remove("is-loading");
      root.dataset.intro = "done";
      document.dispatchEvent(new Event("intro:done"));
    };
    // The header logo stays hidden (is-landing) until the travelling word arrives; then the two swap in one frame.
    const finish = () => { handover(); root.classList.remove("is-landing"); el.style.display = "none"; };
    delete root.dataset.intro;
    if (reducedMotion() || !shouldPlay) { finish(); return; }
    root.classList.add("is-loading", "is-landing"); // set by the boot script; restored if a dev re-mount removed them

    const part = (id: string) => el.querySelector<SVGPathElement>(`[data-part="${id}"]`);
    const logo = el.querySelector<SVGSVGElement>(".logo")!;
    const target = document.querySelector<SVGSVGElement>(".site-header .brand .logo");
    const plain = ["v", "o", "l", "t", "w", "i", "e"].map(part);
    const spark = [part("t-flag"), part("s-high"), part("s-low")];
    const charge = el.querySelector(".preloader-charge");
    const count = el.querySelector(".preloader-count span");
    const level = { v: 0 };
    const show = () => { if (count) count.textContent = String(Math.round(level.v)); };

    // The word builds left to right, the spark pieces in their own places: the t's wedge snaps on right after the
    // t, the two halves of the s close on the bolt between the i and the e (review 3: they used to wait for 100%).
    const build = gsap.timeline({ defaults: { ease: "power3.out", duration: .45 } });
    build.set(el.querySelector(".preloader-sign"), { autoAlpha: 1 })
      .fromTo(plain.slice(0, 4), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .06 }, .1) // v o l t
      .fromTo(part("t-flag"), { y: -10, opacity: 0, fill: LIME }, { y: 0, opacity: 1, fill: LIME, duration: .3 }, .3)
      .fromTo(plain.slice(4, 6), { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .06 }, .34) // w i
      .fromTo(part("s-high"), { x: 6, y: -6, opacity: 0, fill: LIME }, { x: 0, y: 0, opacity: 1, fill: LIME, duration: .3 }, .44)
      .fromTo(part("s-low"), { x: -6, y: 6, opacity: 0, fill: LIME }, { x: 0, y: 0, opacity: 1, fill: LIME, duration: .3 }, .44)
      .fromTo(plain[6], { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1 }, .5) // e
      .fromTo(el.querySelector(".preloader-meta"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .5 }, .2)
      .to(level, { v: 90, duration: 1.3, ease: "power1.inOut", onUpdate: show }, .1)
      .fromTo(charge, { yPercent: 100, opacity: 1 }, { yPercent: 10, opacity: 1, duration: 1.3, ease: "power1.inOut", immediateRender: true }, .1);

    let land: gsap.core.Timeline | null = null;
    const complete = () => {
      if (dead || land) return;
      land = gsap.timeline({ defaults: { ease: "power3.out" }, onComplete: finish });
      land.to(level, { v: 100, duration: .35, ease: "power2.out", onUpdate: show }, 0)
        .to(charge, { yPercent: 0, duration: .35, ease: "power2.out" }, 0)
        // Full charge: the spark flashes brighter for a beat, then cools to Paper with the rest of the word.
        .to(spark, { scale: 1.08, transformOrigin: "50% 50%", duration: .18, ease: "power2.out", yoyo: true, repeat: 1 }, .05)
        .to(spark, { fill: PAPER, duration: .3, ease: "volt" }, .4)
        .addLabel("exit", .7)
        .to(el.querySelector(".preloader-meta"), { opacity: 0, y: -10, duration: .3, ease: "power2.in" }, "exit")
        .add(() => {
          // Measured at exit time so a late web-font or a resize cannot misplace the landing.
          if (!target || !target.getBoundingClientRect().width) return;
          const from = logo.getBoundingClientRect(), to = target.getBoundingClientRect();
          gsap.to(logo, { x: to.left - from.left + (to.width - from.width) / 2, y: to.top - from.top + (to.height - from.height) / 2, scale: to.width / from.width, transformOrigin: "50% 50%", duration: .6, ease: "power3.inOut" });
        }, "exit")
        .to(el.querySelector(".preloader-ground"), { clipPath: "inset(0% 0% 100% 0%)", duration: .6, ease: "power3.inOut" }, "exit")
        .add(handover, "exit+=.12")
        .set({}, {}, "exit+=.6");
    };
    // Full charge needs both: the build's first 1.4s, and the hero's assets (or 0.8s of waiting, whichever is first).
    const wait = Promise.race([heroReady(), new Promise((r) => setTimeout(r, 2200))]);
    build.eventCallback("onComplete", () => { void wait.then(complete); });

    // Never hold the page beyond ~3.4s, even if a frame stalls or an asset hangs.
    const failsafe = window.setTimeout(finish, 3400);
    return () => {
      dead = true; window.clearTimeout(failsafe); build.kill(); land?.kill(); gsap.killTweensOf([logo, level]);
      root.classList.remove("is-loading", "is-landing");
    };
  }, []);

  return <div className="preloader" ref={ref} aria-hidden="true">
    <div className="preloader-ground"><div className="preloader-charge" /></div>
    <div className="preloader-sign"><Logo parts title="" /></div>
    <div className="preloader-meta wrap">
      <span className="preloader-line">Intelligent Energy Storage</span>
      <span className="preloader-count"><span>0</span>%</span>
    </div>
  </div>;
}
