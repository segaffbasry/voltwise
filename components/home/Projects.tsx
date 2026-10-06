"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import "@/components/motion";
import { Button, TwoTone, reducedMotion } from "@/components/ui";
import { projects } from "@/lib/content";
import { MAP_H, MAP_W, PROJECT_POINTS } from "@/lib/uk-map";

const SITES = PROJECT_POINTS; // ordered north to south (scripts/map.mjs)
const N = SITES.length;
const TOTAL = SITES.reduce((sum, p) => sum + p.mw, 0); // 460
const MAX = Math.max(...SITES.map((p) => p.mw));
// Heat radius grows with capacity (area ∝ MW), so the 50MW sites glow wider than the 30MW ones and close
// neighbours (Burwell I + II, Brook Farm, Brentwood) merge into one warm patch, as a heatmap should.
const heat = (mw: number) => Math.sqrt(mw) * 9.4;

/* The map's hover sections: the 11 sites grouped by the UK region each one sits in (from its position on the live
   projects map: Erskine is Renfrewshire, Drumcross West Lothian, Barnsley South Yorkshire, Newtonwood north
   Derbyshire, Burwell Cambridgeshire, Brook Farm Suffolk, Brentwood Essex, Berkeley Gloucestershire, North Tawton
   Devon). Region totals add up to the 460MW. */
const REGIONS = [
  { name: "Scotland", short: "Scotland", sites: ["Erskine", "Drumcross"] },
  { name: "Yorkshire & the East Midlands", short: "Yorkshire & E. Midlands", sites: ["Barnsley", "Newtonwood"] },
  { name: "the West Midlands", short: "W. Midlands", sites: ["Wolverhampton"] },
  { name: "the East of England", short: "East of England", sites: ["Burwell I", "Burwell II", "Brook Farm", "Brentwood"] },
  { name: "the South West", short: "South West", sites: ["Berkeley", "North Tawton"] },
].map((r) => {
  const idx = r.sites.map((name) => SITES.findIndex((s) => s.name === name));
  const pts = idx.map((i) => SITES[i]);
  return {
    ...r, idx,
    mw: pts.reduce((sum, p) => sum + p.mw, 0),
    // Label anchor: above the region's northernmost site, centred on the group.
    x: pts.reduce((sum, p) => sum + p.x, 0) / pts.length,
    y: Math.min(...pts.map((p) => p.y)),
  };
});
const regionOf = SITES.map((_, i) => REGIONS.findIndex((r) => r.idx.includes(i)));
const label = (name: string) => name.replace(/^the /, "").replace(/^./, (c) => c.toUpperCase());

type Selection = { kind: "site"; i: number } | { kind: "region"; r: number } | null;

/* "Our projects": a heatmap of the 11 UK projects (client reviews 1 to 3).
   - Expand: the Ink panel starts as a rounded card inside the page margins and opens to the full width as it rises
     (scrubbed clip, review 2). No pin: review 3 asked for no scroll-jacking here.
   - Entrance: once, when the panel arrives, the sites light up north to south and the counter runs up to 460MW.
   - Hover the map and it answers by region: the nearest region lights up (its sites bright, the rest dimmed), a
     card names it, and the big number counts up from zero to that region's capacity, with the site count under
     it. The region chips do the same for keyboard and touch, and each row in the list does it for a single site.
     Leaving brings the number back to the 460MW total. The map leans a few degrees toward the pointer.
   Reduced motion: no clip, everything lit, numbers change without counting. */
export function Projects() {
  const root = useRef<HTMLElement>(null);
  const [lit, setLit] = useState(N); // sites lit by the entrance; the effect resets it to 0 when motion is allowed
  const [sel, setSel] = useState<Selection>(null);
  const counter = useRef({ v: TOTAL });
  const entered = useRef(false);

  const value = sel?.kind === "site" ? SITES[sel.i].mw : sel?.kind === "region" ? REGIONS[sel.r].mw : null;
  const inSel = (i: number) => sel === null || (sel.kind === "site" ? sel.i === i : regionOf[i] === sel.r);

  // The number: counts up from zero to whatever is hovered; returns to the total (from where it is) on leave.
  useEffect(() => {
    const el = root.current?.querySelector(".projects-count"); if (!el) return;
    if (!entered.current && value === null) return; // the entrance drives it until then
    if (value !== null) entered.current = true; // a hover takes the number over (overwrite kills the entrance tween)
    const target = value ?? TOTAL;
    if (reducedMotion()) { counter.current.v = target; el.textContent = String(target); return; }
    if (value !== null) counter.current.v = 0;
    const tween = gsap.to(counter.current, { v: target, duration: value !== null ? .8 : .6, ease: "power2.out", overwrite: true, onUpdate: () => { el.textContent = String(Math.round(counter.current.v)); } });
    return () => { tween.kill(); };
  }, [value]);

  useEffect(() => {
    const el = root.current; if (!el) return;
    if (reducedMotion()) { entered.current = true; return; }
    const panel = el.querySelector<HTMLElement>(".projects-panel")!;
    const map = el.querySelector<HTMLElement>(".projects-map-tilt")!;
    const count = el.querySelector(".projects-count");
    setLit(0);
    counter.current.v = 0;
    if (count) count.textContent = "0";

    const ctx = gsap.context(() => {
      // Expand: the clip starts on the page's content edge (where the card sat) and opens to the screen edges.
      // A zero-height .wrap ruler gives that edge in resolved pixels at any width.
      const inset = () => {
        const ruler = el.querySelector<HTMLElement>(".projects-ruler")!;
        return Math.max(0, ruler.getBoundingClientRect().left + parseFloat(getComputedStyle(ruler).paddingLeft));
      };
      gsap.fromTo(panel,
        { clipPath: () => `inset(0px ${inset()}px 0px ${inset()}px round 28px)` },
        { clipPath: "inset(0px 0px 0px 0px round 0px)", ease: "none", immediateRender: true, scrollTrigger: { trigger: panel, start: "top bottom", end: "top 15%", scrub: true, invalidateOnRefresh: true } });
      gsap.fromTo(".projects-map", { scale: .9, opacity: .35 }, { scale: 1, opacity: 1, ease: "none", scrollTrigger: { trigger: panel, start: "top 85%", end: "top 15%", scrub: true } });

      // Entrance: sites light north to south while the number runs up to the total.
      const n = { v: 0 };
      ScrollTrigger.create({
        trigger: panel, start: "top 45%", once: true,
        onEnter: () => {
          gsap.to(n, { v: N, duration: 1.8, ease: "power1.inOut", onUpdate: () => setLit(Math.round(n.v)) });
          gsap.to(counter.current, { v: TOTAL, duration: 2, ease: "power2.out", onUpdate: () => { if (count) count.textContent = String(Math.round(counter.current.v)); }, onComplete: () => { entered.current = true; } });
        },
      });
    }, el);

    // The map leans toward the pointer (at most 5°), eased 8% per tick.
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
      ctx.revert();
      if (fine) { panel.removeEventListener("pointermove", onMove); panel.removeEventListener("pointerleave", onLeave); gsap.ticker.remove(tick); }
    };
  }, []);

  // Map hover: the region of the nearest site, within ~95 map units (about a region's reach); nothing over open sea.
  const pickRegion = (e: ReactPointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width) * MAP_W, y = ((e.clientY - r.top) / r.height) * MAP_H;
    let best = -1, dist = Infinity;
    SITES.forEach((p, i) => { const d = Math.hypot(p.x - x, p.y - y); if (d < dist) { dist = d; best = i; } });
    const next = dist < 95 ? regionOf[best] : null;
    setSel((cur) => (next === null ? (cur?.kind === "region" ? null : cur) : cur?.kind === "region" && cur.r === next ? cur : { kind: "region", r: next }));
  };

  const card = sel?.kind === "site"
    ? { x: SITES[sel.i].x, y: SITES[sel.i].y, name: SITES[sel.i].name, mw: SITES[sel.i].mw, meta: `${Math.round((SITES[sel.i].mw / TOTAL) * 100)}% of the portfolio` }
    : sel?.kind === "region"
      ? { x: REGIONS[sel.r].x, y: REGIONS[sel.r].y, name: label(REGIONS[sel.r].name), mw: REGIONS[sel.r].mw, meta: `${REGIONS[sel.r].idx.length} ${REGIONS[sel.r].idx.length === 1 ? "site" : "sites"}` }
      : null;
  const totalLabel = sel?.kind === "region"
    ? `across ${REGIONS[sel.r].idx.length} ${REGIONS[sel.r].idx.length === 1 ? "site" : "sites"} in ${REGIONS[sel.r].name}`
    : sel?.kind === "site" ? `at ${SITES[sel.i].name}, ${Math.round((SITES[sel.i].mw / TOTAL) * 100)}% of the portfolio` : projects.totalLabel;

  return <section className={`projects${lit >= N ? " is-charged" : ""}${sel ? " has-sel" : ""}`} ref={root} id="projects" tabIndex={-1} aria-labelledby="projects-title">
    <div className="wrap projects-ruler" aria-hidden="true" />
    <div className="projects-panel" data-tone="dark">
      <div className="wrap projects-inner">
        <div className="projects-copy">
          <h2 id="projects-title" className="h2" data-reveal="heading"><TwoTone parts={projects.title} /></h2>
          <p className="projects-intro" data-reveal="text">{projects.intro}</p>
          <p className="projects-total" aria-live="polite">
            <span className="projects-num"><span className="projects-count">{TOTAL}</span><span className="projects-unit">MW</span></span>
            <span className="projects-total-label" key={totalLabel}>{totalLabel}</span>
          </p>
          <div className="projects-regions" role="group" aria-label="Capacity by region" onMouseLeave={() => setSel(null)}>
            {REGIONS.map((r, ri) => <button key={r.name} type="button" className={`region-chip${sel?.kind === "region" && sel.r === ri ? " is-active" : ""}`}
              aria-pressed={sel?.kind === "region" && sel.r === ri}
              onMouseEnter={() => setSel({ kind: "region", r: ri })} onFocus={() => setSel({ kind: "region", r: ri })} onBlur={() => setSel(null)}
              onClick={() => setSel((cur) => (cur?.kind === "region" && cur.r === ri ? null : { kind: "region", r: ri }))}>
              {r.short}<span>{r.mw}MW</span>
            </button>)}
          </div>
          <div className="projects-list-head">
            <span className="projects-status"><i aria-hidden="true" />{projects.status}</span>
            <span>{N} sites</span>
          </div>
          <ul className="projects-list" onMouseLeave={() => setSel(null)}>
            {SITES.map((p, i) => <li key={p.name}>
              <button type="button" className={`project-row${i < lit ? " is-on" : ""}${sel && inSel(i) ? " is-active" : ""}${sel && !inSel(i) ? " is-dim" : ""}`}
                aria-pressed={sel?.kind === "site" && sel.i === i}
                onMouseEnter={() => setSel({ kind: "site", i })} onFocus={() => setSel({ kind: "site", i })} onBlur={() => setSel(null)}>
                <span className="project-name">{p.name}</span>
                <span className="project-bar" aria-hidden="true"><i style={{ width: `${(p.mw / MAX) * 100}%` }} /></span>
                <span className="project-mw">{p.mw}MW</span>
              </button>
            </li>)}
          </ul>
          <Button href={projects.cta.href} tone="lime" reveal={false}>{projects.cta.label}</Button>
        </div>

        <figure className="projects-map" aria-label={`Map of Great Britain showing the ${N} Voltwise projects`}>
          <div className="projects-map-tilt" style={{ aspectRatio: `${MAP_W} / ${MAP_H}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="projects-land" src="/media/uk-map.svg" alt="" width={MAP_W} height={MAP_H} />
            <svg className="projects-heat" viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true"
              onPointerMove={pickRegion} onPointerDown={pickRegion} onPointerLeave={() => setSel(null)}>
              <defs>
                <filter id="heat-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="14" /></filter>
                <radialGradient id="heat-fill">
                  <stop offset="0" stopColor="#ccf375" stopOpacity="1" />
                  <stop offset=".4" stopColor="#15883c" stopOpacity=".85" />
                  <stop offset="1" stopColor="#106e30" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width={MAP_W} height={MAP_H} fill="transparent" />
              <g filter="url(#heat-blur)" className="heat-layer">
                {SITES.map((p, i) => <circle key={p.name} cx={p.x} cy={p.y} r={heat(p.mw)} fill="url(#heat-fill)"
                  className={`bloom${i < lit ? " is-on" : ""}${sel && inSel(i) ? " is-hot" : ""}${sel && !inSel(i) ? " is-dim" : ""}`} />)}
              </g>
              {SITES.map((p, i) => <g key={p.name} className={`site${i < lit ? " is-on" : ""}${sel && inSel(i) ? " is-active" : ""}${sel && !inSel(i) ? " is-dim" : ""}`} style={{ ["--d" as string]: `${i * .37}s` }}>
                <circle className="site-pulse" cx={p.x} cy={p.y} r="6" />
                <circle className="site-ring" cx={p.x} cy={p.y} r="12" />
                <circle className="site-dot" cx={p.x} cy={p.y} r="5" />
              </g>)}
            </svg>
            {card && <div className="site-label" key={card.name} style={{ left: `${(card.x / MAP_W) * 100}%`, top: `${(card.y / MAP_H) * 100}%` }} aria-hidden="true">
              <span className="site-label-name">{card.name}</span>
              <span className="site-label-meta"><b>{card.mw}MW</b> · {card.meta}</span>
            </div>}
          </div>
          <figcaption className="sr-only">{REGIONS.map((r) => `${label(r.name)}: ${r.idx.map((i) => `${SITES[i].name} ${SITES[i].mw}MW`).join(", ")}`).join(". ")}.</figcaption>
        </figure>
      </div>
    </div>
  </section>;
}
