"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import "@/components/motion";
import { Button, TwoTone, reducedMotion } from "@/components/ui";
import { projects } from "@/lib/content";
import { MAP_H, MAP_W, PROJECT_POINTS } from "@/lib/uk-map";

const SITES = PROJECT_POINTS; // already ordered north to south (scripts/map.mjs)
const N = SITES.length;
const TOTAL = SITES.reduce((sum, p) => sum + p.mw, 0); // 460
const MAX = Math.max(...SITES.map((p) => p.mw));
// Running total after the first k sites come online.
const cumulative = (k: number) => SITES.slice(0, k).reduce((sum, p) => sum + p.mw, 0);
// Heat radius grows with capacity (area ∝ MW), so the 50MW sites glow wider than the 30MW ones and close
// neighbours (Burwell I + II, Brook Farm, Brentwood) merge into one warm patch, as a heatmap should.
const heat = (mw: number) => Math.sqrt(mw) * 9.4;

/* "Our projects": a heatmap of the 11 UK projects (client requests, reviews 1 and 2).

   1. Expand. The Ink panel starts as a rounded card inside the page margins and, as it rises, its clip opens to
      the full width and its corners square off (scrubbed from "top bottom" to "top top").
   2. Charge the grid (desktop, ≥ 900px wide). The section pins for one screen height and the scroll brings the
      sites online one by one, north to south: each one's heat bloom and dot light up, its row in the list turns
      on, the label follows the newest site and the counter adds its capacity until it reads 460MW, 11 / 11.
      Smaller screens play the same sequence once, on a timer, when the panel enters.
   3. Explore. Hovering or focusing a row lights its site (and the other way round). The map leans a few degrees
      toward the pointer, and once every site is online each dot keeps a slow Lime pulse.
   Reduced motion: no clip, no pin, everything online from the start. */
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const [step, setStep] = useState(N); // sites online; the effect resets it to 0 when motion is allowed
  const [hover, setHover] = useState<number | null>(null);
  const counter = useRef({ v: TOTAL });

  // The counter follows the running total.
  useEffect(() => {
    const el = root.current?.querySelector(".projects-count"); if (!el) return;
    const tween = gsap.to(counter.current, { v: cumulative(step), duration: .6, ease: "power2.out", onUpdate: () => { el.textContent = String(Math.round(counter.current.v)); } });
    return () => { tween.kill(); };
  }, [step]);

  useEffect(() => {
    const el = root.current; if (!el) return;
    if (reducedMotion()) return;
    const panel = el.querySelector<HTMLElement>(".projects-panel")!;
    const map = el.querySelector<HTMLElement>(".projects-map-tilt")!;
    setStep(0);
    counter.current.v = 0;

    const mm = gsap.matchMedia();
    const ctx = gsap.context(() => {
      // 1. Expand: the clip starts on the page's content edge (where the old card sat) and opens to the screen edges.
      // A zero-height .wrap ruler gives that edge in resolved pixels at any width.
      const inset = () => {
        const ruler = el.querySelector<HTMLElement>(".projects-ruler")!;
        return Math.max(0, ruler.getBoundingClientRect().left + parseFloat(getComputedStyle(ruler).paddingLeft));
      };
      gsap.fromTo(panel,
        { clipPath: () => `inset(0px ${inset()}px 0px ${inset()}px round 28px)` },
        { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "none", immediateRender: true, scrollTrigger: { trigger: panel, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(".projects-map", { scale: .9, opacity: .35 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: panel, start: "top 85%", end: "top top", scrub: true } });
    }, el);

    // 2. Charge the grid.
    mm.add("(min-width: 900px)", () => {
      ScrollTrigger.create({
        trigger: panel, start: "top top", end: "+=100%", pin: true, anticipatePin: 1,
        onUpdate: (self) => setStep(Math.min(N, Math.floor(self.progress * (N + .999)))),
      });
    });
    mm.add("(max-width: 899px)", () => {
      const n = { v: 0 };
      ScrollTrigger.create({ trigger: el, start: "top 55%", once: true, onEnter: () => gsap.to(n, { v: N, duration: 2.2, ease: "power1.inOut", onUpdate: () => setStep(Math.round(n.v)) }) });
    });

    // 3. The map leans toward the pointer (at most 5°), eased 8% per tick.
    let tx = 0, ty = 0, cx = 0, cy = 0;
    const onMove = (e: PointerEvent) => {
      const r = map.getBoundingClientRect();
      tx = gsap.utils.clamp(-1, 1, (e.clientX - r.left - r.width / 2) / (r.width / 2));
      ty = gsap.utils.clamp(-1, 1, (e.clientY - r.top - r.height / 2) / (r.height / 2));
    };
    const onLeave = () => { tx = 0; ty = 0; };
    const tick = () => {
      cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      map.style.transform = `perspective(1400px) rotateY(${(cx * 5).toFixed(2)}deg) rotateX(${(-cy * 5).toFixed(2)}deg)`;
    };
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine) { panel.addEventListener("pointermove", onMove); panel.addEventListener("pointerleave", onLeave); gsap.ticker.add(tick); }

    return () => {
      mm.revert(); ctx.revert();
      if (fine) { panel.removeEventListener("pointermove", onMove); panel.removeEventListener("pointerleave", onLeave); gsap.ticker.remove(tick); }
    };
  }, []);

  const current = step > 0 ? step - 1 : null;
  const focus = hover ?? (step < N ? current : null); // while charging, the label follows the newest site
  const done = step >= N;

  return <section className={`projects${done ? " is-charged" : ""}`} ref={root} id="projects" tabIndex={-1} aria-labelledby="projects-title">
    <div className="wrap projects-ruler" aria-hidden="true" />
    <div className="projects-panel" data-tone="dark">
      <div className="wrap projects-inner">
        <div className="projects-copy">
          <h2 id="projects-title" className="h2" data-reveal="heading"><TwoTone parts={projects.title} /></h2>
          <p className="projects-intro" data-reveal="text">{projects.intro}</p>
          <p className="projects-total">
            <span className="projects-num"><span className="projects-count">{cumulative(step)}</span><span className="projects-unit">MW</span></span>
            <span className="projects-total-label">{projects.totalLabel}</span>
          </p>
          <div className="projects-list-head">
            <span className="projects-status"><i aria-hidden="true" />{projects.status}</span>
            <span className="projects-progress" aria-hidden="true">
              <span className="projects-meter"><i style={{ transform: `scaleX(${step / N})` }} /></span>
              <span className="projects-steps">{String(step).padStart(2, "0")} / {N} sites</span>
            </span>
          </div>
          <ul className="projects-list" onMouseLeave={() => setHover(null)}>
            {SITES.map((p, i) => <li key={p.name}>
              <button type="button" className={`project-row${i < step ? " is-on" : ""}${focus === i ? " is-active" : ""}`} aria-pressed={hover === i}
                onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
                <span className="project-name">{p.name}</span>
                <span className="project-bar" aria-hidden="true"><i style={{ width: `${(p.mw / MAX) * 100}%` }} /></span>
                <span className="project-mw">{p.mw}MW</span>
              </button>
            </li>)}
          </ul>
          <Button href={projects.cta.href} tone="lime" reveal={false}>{projects.cta.label}</Button>
        </div>

        <figure className="projects-map" aria-label={`Map of Great Britain showing the ${N} Voltwise projects`}>
          <div className="projects-map-tilt">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="projects-land" src="/media/uk-map.svg" alt="" width={MAP_W} height={MAP_H} />
            <svg className="projects-heat" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
              <defs>
                <filter id="heat-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
                <radialGradient id="heat-fill">
                  <stop offset="0" stopColor="#ccf375" stopOpacity="1" />
                  <stop offset=".4" stopColor="#15883c" stopOpacity=".85" />
                  <stop offset="1" stopColor="#106e30" stopOpacity="0" />
                </radialGradient>
              </defs>
              <g filter="url(#heat-blur)" className="heat-layer">
                {SITES.map((p, i) => <circle key={p.name} cx={p.x} cy={p.y} r={heat(p.mw)} fill="url(#heat-fill)"
                  className={`bloom${i < step ? " is-on" : ""}${hover !== null && hover !== i ? " is-dim" : ""}`} />)}
              </g>
              {SITES.map((p, i) => <g key={p.name} className={`site${i < step ? " is-on" : ""}${focus === i ? " is-active" : ""}`} style={{ ["--d" as string]: `${i * .37}s` }}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}>
                <circle className="site-pulse" cx={p.x} cy={p.y} r="6" />
                <circle className="site-ring" cx={p.x} cy={p.y} r="12" />
                <circle className="site-dot" cx={p.x} cy={p.y} r="5" />
              </g>)}
            </svg>
            {focus !== null && <div className="site-label" key={focus} style={{ left: `${(SITES[focus].x / MAP_W) * 100}%`, top: `${(SITES[focus].y / MAP_H) * 100}%` }} aria-hidden="true">
              <span className="site-label-name">{SITES[focus].name}</span>
              <span className="site-label-meta"><b>{SITES[focus].mw}MW</b> · {Math.round((SITES[focus].mw / TOTAL) * 100)}% of the portfolio</span>
            </div>}
          </div>
          <figcaption className="sr-only">{SITES.map((p) => `${p.name}, ${p.mw}MW`).join("; ")}.</figcaption>
        </figure>
      </div>
    </div>
  </section>;
}
