"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import "@/components/motion";
import { reducedMotion } from "@/components/ui";
import { getLenis } from "@/lib/scroll";
import { ticker } from "@/lib/content";

/* A Lime band of the site's own three lines, drifting sideways. It idles at 40px/s and speeds up with the scroll
   (Lenis velocity), turning round when the reader scrolls back up, so the page answers the hand. Decorative: the
   lines all appear elsewhere on the page, so the band is aria-hidden. Static with reduced motion. */
export function Ticker() {
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = track.current; if (!el || reducedMotion()) return;
    let x = 0, dir = -1, speed = 0;
    const tick = (_t: number, dt: number) => {
      const lenis = getLenis();
      const v = lenis?.velocity ?? 0;
      if (Math.abs(v) > .5) dir = v > 0 ? -1 : 1;
      speed += (40 + Math.min(Math.abs(v) * 28, 900) - speed) * .08; // ease toward the target, px/s
      x += dir * speed * (dt / 1000);
      const half = el.scrollWidth / 2;
      if (x <= -half) x += half; else if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  const run = [...ticker, ...ticker];
  return <div className="ticker" aria-hidden="true">
    <div className="ticker-track" ref={track}>
      {[0, 1].map((copy) => <div className="ticker-run" key={copy}>
        {run.map((line, i) => <span key={i} className="ticker-item">{line}<svg viewBox="0 0 12 16" className="ticker-spark"><path d="M7 0 1 9h4l-1 7 7-10H7l1-6Z" fill="currentColor" /></svg></span>)}
      </div>)}
    </div>
  </div>;
}
