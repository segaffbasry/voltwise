"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import "@/components/motion";
import { Button, TwoTone, reducedMotion } from "@/components/ui";
import { projects } from "@/lib/content";
import { MAP_H, MAP_W, PROJECT_POINTS } from "@/lib/uk-map";

const TOTAL = PROJECT_POINTS.reduce((sum, p) => sum + p.mw, 0); // 460
const MAX = Math.max(...PROJECT_POINTS.map((p) => p.mw));
// Heat radius grows with capacity (area ∝ MW), so the 50MW sites glow wider than the 30MW ones and close
// neighbours (Burwell I + II, Brook Farm, Brentwood) merge into one warm patch, as a heatmap should.
const heat = (mw: number) => Math.sqrt(mw) * 8.4;

/* "Our projects": a heatmap of the 11 UK projects (client request on the first review).
   Left: the live /projects copy, a 460MW counter and the project list with capacity bars. Right: Great Britain with
   one heat bloom per site. Hovering or focusing a row lights its site on the map and the other way round.
   Entrance (once, on scroll): the land fades up, the sites charge one after another from north to south (bloom,
   then dot), the counter runs to 460MW and the bars fill. After that each dot keeps a slow pulse (CSS). */
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = root.current; if (!el) return;
    const count = el.querySelector<HTMLElement>(".projects-count");
    if (reducedMotion()) { el.classList.add("is-charged"); return; }
    const order = PROJECT_POINTS.map((p, i) => ({ i, y: p.y })).sort((a, b) => a.y - b.y).map((o) => o.i);
    const blooms = order.map((i) => el.querySelector(`[data-bloom="${i}"]`));
    const dots = order.map((i) => el.querySelector(`[data-dot="${i}"]`));
    const counter = { v: 0 };
    const ctx = gsap.context(() => {
      if (count) count.textContent = "0";
      gsap.set(".projects-land", { opacity: 0, scale: .96 });
      gsap.set(blooms, { scale: 0, opacity: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
      gsap.set(dots, { scale: 0, transformOrigin: "50% 50%", transformBox: "fill-box" });
      gsap.set(".project-bar i", { scaleX: 0 });
      const tl = gsap.timeline({ paused: true, defaults: { ease: "volt" }, onComplete: () => el.classList.add("is-charged") });
      tl.to(".projects-land", { opacity: 1, scale: 1, duration: 1 }, 0)
        .to(blooms, { scale: 1, opacity: 1, duration: 1.1, stagger: .12, ease: "power2.out" }, .3)
        .to(dots, { scale: 1, duration: .5, stagger: .12, ease: "back.out(2.2)" }, .45)
        .to(counter, { v: TOTAL, duration: 1.7, ease: "power2.out", onUpdate: () => { if (count) count.textContent = String(Math.round(counter.v)); } }, .3)
        .to(".project-bar i", { scaleX: 1, duration: .9, stagger: .05 }, .4);
      ScrollTrigger.create({ trigger: el, start: "top 70%", once: true, onEnter: () => tl.play() });
    }, el);
    return () => ctx.revert();
  }, []);

  return <section className="projects section" id="projects" tabIndex={-1} aria-labelledby="projects-title">
    <div className="wrap">
      <div className="projects-panel" data-tone="dark">
        <div className="projects-copy">
          <h2 id="projects-title" className="h2" data-reveal="heading"><TwoTone parts={projects.title} /></h2>
          <p className="projects-intro" data-reveal="text">{projects.intro}</p>
          <p className="projects-total" data-reveal="label">
            <span className="projects-num"><span className="projects-count">{TOTAL}</span><span className="projects-unit">MW</span></span>
            <span className="projects-total-label">{projects.totalLabel}</span>
          </p>
          <div className="projects-list-head" data-reveal="label">
            <span className="projects-status"><i aria-hidden="true" />{projects.status}</span>
            <span>{PROJECT_POINTS.length} projects</span>
          </div>
          <ul className="projects-list" onMouseLeave={() => setActive(null)}>
            {PROJECT_POINTS.map((p, i) => <li key={p.name}>
              <button type="button" className={`project-row${active === i ? " is-active" : ""}`} aria-pressed={active === i}
                onMouseEnter={() => setActive(i)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}>
                <span className="project-name">{p.name}</span>
                <span className="project-bar" aria-hidden="true"><i style={{ width: `${(p.mw / MAX) * 100}%` }} /></span>
                <span className="project-mw">{p.mw}MW</span>
              </button>
            </li>)}
          </ul>
          <Button href={projects.cta.href} tone="lime">{projects.cta.label}</Button>
        </div>

        <figure className="projects-map" aria-label={`Map of Great Britain showing the ${PROJECT_POINTS.length} Voltwise projects`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="projects-land" src="/media/uk-map.svg" alt="" width={MAP_W} height={MAP_H} loading="lazy" />
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
              {PROJECT_POINTS.map((p, i) => <circle key={p.name} data-bloom={i} cx={p.x} cy={p.y} r={heat(p.mw)} fill="url(#heat-fill)" className={active === i ? "is-active" : undefined} />)}
            </g>
            {PROJECT_POINTS.map((p, i) => <g key={p.name} className={`site${active === i ? " is-active" : ""}`} style={{ ["--d" as string]: `${i * .37}s` }}
              onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
              <circle className="site-pulse" cx={p.x} cy={p.y} r="6" />
              <circle data-dot={i} className="site-dot" cx={p.x} cy={p.y} r="5" />
            </g>)}
          </svg>
          {active !== null && <p className="site-label" style={{ left: `${(PROJECT_POINTS[active].x / MAP_W) * 100}%`, top: `${(PROJECT_POINTS[active].y / MAP_H) * 100}%` }} aria-hidden="true">
            <strong>{PROJECT_POINTS[active].name}</strong> {PROJECT_POINTS[active].mw}MW
          </p>}
          <figcaption className="sr-only">{PROJECT_POINTS.map((p) => `${p.name}, ${p.mw}MW`).join("; ")}.</figcaption>
        </figure>
      </div>
    </div>
  </section>;
}
