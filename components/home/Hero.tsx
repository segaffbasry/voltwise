"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import "@/components/motion";
import { Button, TwoTone, reducedMotion } from "@/components/ui";
import { hero, intro } from "@/lib/content";

/* THE COPIED INTERACTION (README "Copied interaction"): virya-energy.com's hero, blocks/hero.js `animateAboveTablet`,
   `animateAboveMobile`, `animateMobile`. Rebuilt value for value:
   - The film (Virya .hero__attachment) starts full-bleed; five photographs (.hero__images--0…4) sit stacked behind it.
   - One scrubbed, pinned timeline: the headline fades (at -0.6), the film shrinks to a rounded portrait card
     (desktop 309×362, radius 28px, x 10, power1.out, duration 1), the photos fan out to fixed offsets at 0.2–0.35,
     then the card and photos lift together (y -200, power1.out) at 0.4 while the description rises into place (0.2).
   - Past 70% progress, mouse parallax wakes up: each photo follows the pointer at its own speed with a 3D tilt,
     interpolated 10% per tick (Virya: speeds .08/.12/.10/.15/.11, film .13; rotation = speed × 150, z = speed × 20).
   Two deliberate changes: Virya pins for 3000px on desktop; this pins for 110% of the viewport height (90% on phones)
   so the page stays short (brief pacing rule), and the timeline simply plays faster per pixel. And the desktop lift is
   -150px (capped at 17% of the viewport height; -80px on phones) instead of -200px, so the description sits close under the collage
   rather than leaving a gap on a 900px-tall screen.
   Curves are CSS/JS variables: --ease (power1.out) for the scrub, circ.out for the entrance (lib/ease.ts). */

type Layout = { card: [number, number, number]; cardX: number; lift: number; offsets: [number, number][]; descAt: number; pin: string };
// [width, height, radius] of the card, the photos' fan-out offsets, and the pin distance, per Virya breakpoint.
const layouts: Record<"desktop" | "tablet" | "mobile", Layout> = {
  desktop: { card: [309, 362, 28], cardX: 10, lift: -150, offsets: [[120, -130], [220, 50], [-130, 80], [-230, -80], [-60, -140]], descAt: .2, pin: "+=110%" },
  tablet: { card: [150, 200, 16], cardX: 0, lift: -200, offsets: [[80, -80], [120, 20], [-60, 60], [-180, -40], [-80, -110]], descAt: .4, pin: "+=100%" },
  mobile: { card: [110, 119, 12], cardX: 0, lift: -80, offsets: [[50, -45], [85, 10], [-50, 30], [-110, -40], [-45, -60]], descAt: .4, pin: "+=90%" },
};
const speeds = [.08, .12, .1, .15, .11];
const FILM_SPEED = .13;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const film = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  // Entrance: waits for the preloader's handover. Virya slides its hero in with circ.out over .8s; here the headline
  // lines rise out of their masks on the same curve while the film settles from a 6% zoom.
  useEffect(() => {
    const el = root.current; if (!el) return;
    if (reducedMotion()) return;
    // Like Virya (`window.scrollTo(0, 0)` before its hero plays), always start at the top: the hero is a pinned scene.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
    const lines = el.querySelectorAll(".hero-line > span");
    const parts = el.querySelectorAll("[data-hero-in]");
    const header = document.querySelectorAll(".site-header [data-hero-part]");
    gsap.set(lines, { yPercent: 110 });
    gsap.set([...parts, ...header], { opacity: 0, y: 16 });
    gsap.set(el.querySelector(".hero-film-zoom"), { scale: 1.06 });
    const play = () => {
      const tl = gsap.timeline({ defaults: { ease: "circ.out" } });
      tl.to(el.querySelector(".hero-film-zoom"), { scale: 1, duration: 1.6, ease: "volt" }, 0)
        .to(lines, { yPercent: 0, duration: .8, stagger: .08 }, .05)
        .to(parts, { opacity: 1, y: 0, duration: .8, stagger: .08, clearProps: "transform" }, .3)
        .to(header, { opacity: 1, y: 0, duration: .8, clearProps: "transform" }, .35);
    };
    if (document.documentElement.dataset.intro === "done") play();
    else document.addEventListener("intro:done", play, { once: true });
    return () => document.removeEventListener("intro:done", play);
  }, []);

  // The pinned film-to-collage timeline and the mouse parallax.
  useEffect(() => {
    const el = root.current; if (!el) return;
    if (reducedMotion()) return;
    const card = el.querySelector<HTMLElement>(".hero-film")!;
    const images = gsap.utils.toArray<HTMLElement>(".hero-img", el);
    const tilts = [...images.map((img) => img.querySelector<HTMLElement>(".hero-img-tilt")!), el.querySelector<HTMLElement>(".hero-film-tilt")!];
    const content = el.querySelector(".hero-content");
    const desc = el.querySelector(".hero-desc");

    // Parallax (Virya initMouseParallax / updateParallax), applied to an inner wrapper so it never fights the scrub.
    let enabled = false, mx = 0, my = 0, cx = 0, cy = 0;
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx = gsap.utils.clamp(-1, 1, (e.clientX - r.left - r.width / 2) / (r.width / 2));
      my = gsap.utils.clamp(-1, 1, (e.clientY - r.top - r.height / 2) / (r.height / 2));
    };
    const onLeave = () => { mx = 0; my = 0; };
    const tick = () => {
      if (!enabled) return;
      cx += (mx - cx) * .1; cy += (my - cy) * .1;
      tilts.forEach((t, i) => {
        const s = i < speeds.length ? speeds[i] : FILM_SPEED;
        gsap.set(t, { x: cx * s * 100, y: cy * s * 100, rotationX: -cy * s * 150, rotationY: cx * s * 150, rotationZ: cx * s * 20, transformPerspective: 1000, force3D: true });
      });
    };
    const setEnabled = (on: boolean) => {
      if (on === enabled) return;
      enabled = on;
      if (!on) gsap.to(tilts, { x: 0, y: 0, rotationX: 0, rotationY: 0, rotationZ: 0, duration: .3, ease: "power2.out" });
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine) { el.addEventListener("mousemove", onMove); el.addEventListener("mouseleave", onLeave); gsap.ticker.add(tick); }

    const mm = gsap.matchMedia();
    const build = (l: Layout) => {
      el.classList.add("is-scroll");
      const [w, h, radius] = l.card;
      // Never lift the collage further than the viewport allows, so short laptop screens keep the description in view.
      const lift = () => Math.max(l.lift, -window.innerHeight * .17);
      // The description is anchored under the lifted collage (styles/hero.css reads --lift), not to the screen edge.
      const setLift = () => el.style.setProperty("--lift", `${lift()}px`);
      setLift();
      const tl = gsap.timeline({
        defaults: { ease: "power1.out" },
        scrollTrigger: {
          trigger: el, start: "top top", end: l.pin, pin: true, scrub: true, invalidateOnRefresh: true,
          onRefresh: setLift,
          onUpdate: (self) => { setEnabled(self.progress >= .7); document.dispatchEvent(new Event("hero:update")); },
        },
      });
      // Virya's position -0.6: GSAP shifts every child forward, so the headline fades out (0–0.5) before the film moves.
      tl.to(content, { opacity: 0 }, -.6)
        // From-values are functions of the viewport so a resize re-records them (invalidateOnRefresh).
        .fromTo(card, { width: () => document.documentElement.clientWidth, height: () => window.innerHeight, borderRadius: 0, x: 0 },
          { duration: 1, x: l.cardX, width: w, height: h, borderRadius: radius, immediateRender: false }, 0)
        .to(el.querySelector(".hero-film-veil"), { opacity: 0, duration: .6, ease: "none" }, 0)
        // The pause control shrinks into the card's corner with it (it stays usable on the 110px phone card).
        .to(el.querySelector(".hero .film-toggle"), { scale: w < 200 ? .7 : .85, right: 8, bottom: 8, transformOrigin: "100% 100%", duration: 1 }, 0);
      l.offsets.forEach(([x, y], i) => tl.to(images[i], { x, y }, [.2, .25, .3, .3, .35][i]));
      tl.to([card, el.querySelector(".hero-images")], { y: lift, duration: 1 }, .4)
        .fromTo(desc, { y: () => window.innerHeight * .5, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power2.out" }, l.descAt)
        .set(content, { pointerEvents: "none" }, .4);
      return () => { el.classList.remove("is-scroll"); gsap.set(card, { clearProps: "width,height,borderRadius,x,y" }); };
    };
    mm.add("(min-width: 768px)", () => build(layouts.desktop));
    mm.add("(min-width: 640px) and (max-width: 767px)", () => build(layouts.tablet));
    mm.add("(max-width: 639px)", () => build(layouts.mobile));
    ScrollTrigger.sort();

    return () => {
      mm.revert();
      if (fine) { el.removeEventListener("mousemove", onMove); el.removeEventListener("mouseleave", onLeave); gsap.ticker.remove(tick); }
    };
  }, []);

  // The film is muted, has a pause control and pauses itself whenever it is off-screen. It starts only after the
  // preloader hands over: Chrome stops painting a muted autoplay video that starts underneath a full-screen cover.
  useEffect(() => {
    const video = film.current; if (!video) return;
    if (reducedMotion()) { video.pause(); setPaused(true); userPaused.current = true; return; }
    let visible = false;
    const ready = () => document.documentElement.dataset.intro === "done";
    const sync = () => {
      if (visible && ready() && !userPaused.current) void video.play().catch(() => setPaused(true));
      else video.pause();
    };
    const io = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
    io.observe(video);
    document.addEventListener("intro:done", sync);
    return () => { io.disconnect(); document.removeEventListener("intro:done", sync); };
  }, []);

  const toggle = () => {
    const video = film.current; if (!video) return;
    if (video.paused) { userPaused.current = false; void video.play(); setPaused(false); }
    else { userPaused.current = true; video.pause(); setPaused(true); }
  };

  return <section className="hero" ref={root} data-hero aria-labelledby="hero-title">
    <div className="hero-stage">
      <div className="hero-images" aria-hidden="true">
        {hero.collage.map((img, i) => <div key={img.src} className={`hero-img hero-img-${i}`}>
          <div className="hero-img-tilt"><Image src={img.src} alt="" width={img.w} height={img.h} sizes="260px" priority={i < 2} /></div>
        </div>)}
      </div>
      <div className="hero-film" data-tone="dark">
        <div className="hero-film-tilt">
          <div className="hero-film-zoom"><video ref={film} src={hero.film.src} poster={hero.film.poster} muted loop playsInline preload="auto" aria-label="Voltwise brand film: wind turbines, battery containers and the grid at dusk" /></div>
          <div className="hero-film-veil" aria-hidden="true" />
          <button className="film-toggle" onClick={toggle} aria-label={paused ? "Play the film" : "Pause the film"} aria-pressed={paused}>
            {paused ? <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
              : <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" /></svg>}
          </button>
        </div>
      </div>
      <div className="hero-content wrap">
        <h1 id="hero-title" className="hero-title">
          {hero.title.map((word) => <span key={word} className="hero-line"><span>{word}</span></span>)}
        </h1>
        <p className="hero-sub" data-hero-in>{hero.sub}</p>
        <div className="hero-buttons" data-hero-in>
          <Button href={hero.cta.href} tone="lime" reveal={false}>{hero.cta.label}</Button>
          <Button href="#who-we-are" tone="light" reveal={false}>Discover Voltwise</Button>
        </div>
      </div>
      <div className="hero-desc">
        <h2 className="h2"><TwoTone parts={intro.title} /></h2>
        <p className="lede">{intro.body}</p>
      </div>
    </div>
  </section>;
}
