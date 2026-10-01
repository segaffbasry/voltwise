"use client";

import gsap from "gsap";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/Logo";
import "@/components/motion";
import { reducedMotion } from "@/components/ui";

export const INTRO_KEY = "voltwise-intro";
// Palette values as literals: GSAP tweens fills between colours, not between CSS variables (app/globals.css).
const LIME = "#ccf375", PAPER = "#f3f6f4";

/* The company signing its name, assembled from the wordmark's own ten vector parts (lib/logo.ts).
   Voltwise has no separate symbol: its mark lives inside the word, in three cuts that read as a spark of current,
   the wedge off the t, the slanted cut on the i and the s split into two halves by a diagonal bolt. So the build is:
     Build  0.10–0.62s  the plain letters v o l t w i e rise and fade in, one after another (0.06s apart)
            0.50–0.85s  the spark: the t's wedge drops in and the two halves of the s close on the bolt, lit in Lime,
                        then cool to Paper with the rest of the word
     Hold   0.85–1.15s
     Exit   1.15–1.70s  the word glides into the header logo position while the Green ground wipes up off the screen,
                        uncovering the hero film (whose opening frame sits under the same Green veil, so no colour jump)
   One GSAP timeline, 1.7s in all; the handover fires at 1.25s so the hero entrance overlaps the exit.
   Plays once per browser session (sessionStorage), never with reduced motion, hidden by <noscript>. */
/* Read once, when the module loads: did the boot script (app/layout.tsx) decide the intro plays on this load?
   Reading it here rather than inside the effect keeps React's development double-mount from skipping the intro. */
const shouldPlay = typeof document !== "undefined" && document.documentElement.classList.contains("is-loading");

export default function Preloader() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    const root = document.documentElement;
    let handed = false;
    const handover = () => {
      if (handed) return; handed = true;
      root.classList.remove("is-loading");
      root.dataset.intro = "done";
      document.dispatchEvent(new Event("intro:done"));
    };
    // The header logo stays hidden (is-landing) until the travelling word arrives; then the two swap in one frame.
    const finish = () => {
      handover(); root.classList.remove("is-landing"); el.style.display = "none";
      try { sessionStorage.setItem(INTRO_KEY, "1"); } catch { /* storage blocked: it simply plays again next load */ }
    };
    delete root.dataset.intro;
    if (reducedMotion() || !shouldPlay) { finish(); return; }
    root.classList.add("is-loading", "is-landing"); // set by the boot script; restored if a dev re-mount removed them

    const part = (id: string) => el.querySelector<SVGPathElement>(`[data-part="${id}"]`);
    const logo = el.querySelector<SVGSVGElement>(".logo")!;
    const target = document.querySelector<SVGSVGElement>(".site-header .brand .logo");
    const plain = ["v", "o", "l", "t", "w", "i", "e"].map(part);

    const tl = gsap.timeline({ defaults: { ease: "power3.out", duration: .45 }, onComplete: finish });
    tl.set(el.querySelector(".preloader-sign"), { autoAlpha: 1 })
      .fromTo(plain, { yPercent: 60, opacity: 0 }, { yPercent: 0, opacity: 1, stagger: .06 }, .1)
      .fromTo(part("t-flag"), { y: -12, opacity: 0, fill: LIME }, { y: 0, opacity: 1, fill: LIME, duration: .35 }, .5)
      .fromTo(part("s-high"), { x: 6, y: -6, opacity: 0, fill: LIME }, { x: 0, y: 0, opacity: 1, fill: LIME, duration: .35 }, .55)
      .fromTo(part("s-low"), { x: -6, y: 6, opacity: 0, fill: LIME }, { x: 0, y: 0, opacity: 1, fill: LIME, duration: .35 }, .55)
      .to([part("t-flag"), part("s-high"), part("s-low")], { fill: PAPER, duration: .3, ease: "volt" }, .85)
      .addLabel("exit", 1.15)
      .add(() => {
        // Measured at exit time so a late web-font or a resize cannot misplace the landing.
        if (!target || !target.getBoundingClientRect().width) return;
        const from = logo.getBoundingClientRect(), to = target.getBoundingClientRect();
        gsap.to(logo, { x: to.left - from.left + (to.width - from.width) / 2, y: to.top - from.top + (to.height - from.height) / 2, scale: to.width / from.width, transformOrigin: "50% 50%", duration: .55, ease: "power3.inOut" });
      }, "exit")
      .to(el.querySelector(".preloader-ground"), { clipPath: "inset(0% 0% 100% 0%)", duration: .55, ease: "power3.inOut" }, "exit")
      .add(handover, "exit+=.1")
      .set({}, {}, "exit+=.55");

    // Never hold the page beyond ~2s, even if a frame stalls.
    const failsafe = window.setTimeout(finish, 2200);
    return () => { window.clearTimeout(failsafe); tl.kill(); gsap.killTweensOf(logo); root.classList.remove("is-loading", "is-landing"); };
  }, []);

  return <div className="preloader" ref={ref} aria-hidden="true">
    <div className="preloader-ground" />
    <div className="preloader-sign"><Logo parts title="" /></div>
  </div>;
}
