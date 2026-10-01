"use client";

import { useEffect, useRef, useState } from "react";
import { Button, TwoTone, reducedMotion } from "@/components/ui";
import { netZero } from "@/lib/content";

/* "Accelerating net zero": Virya's text-left, media-right content block. The film is the live homepage's own
   (engineers walking to a storage site): muted, with a pause control, paused whenever it is off-screen. */
export function NetZero() {
  const film = useRef<HTMLVideoElement>(null);
  const [paused, setPaused] = useState(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const video = film.current; if (!video) return;
    if (reducedMotion()) { userPaused.current = true; setPaused(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !userPaused.current) void video.play().catch(() => setPaused(true));
      else video.pause();
    }, { threshold: .15 });
    io.observe(video);
    return () => io.disconnect();
  }, []);

  const toggle = () => {
    const video = film.current; if (!video) return;
    if (video.paused) { userPaused.current = false; void video.play(); setPaused(false); }
    else { userPaused.current = true; video.pause(); setPaused(true); }
  };

  return <section className="netzero section section-paper" id="net-zero" tabIndex={-1} aria-labelledby="netzero-title">
    <div className="wrap netzero-grid">
      <div className="netzero-copy">
        <h2 id="netzero-title" className="h2" data-reveal="heading"><TwoTone parts={netZero.title} /></h2>
        <p className="lede" data-reveal="text">{netZero.lead}</p>
        <p data-reveal="text">{netZero.listIntro}</p>
        <ul className="ticks">
          {netZero.list.map((item) => <li key={item} data-reveal="card"><span className="tick" aria-hidden="true" />{item}</li>)}
        </ul>
        <p data-reveal="text">{netZero.close}</p>
        <Button href={netZero.cta.href} tone="green">{netZero.cta.label}</Button>
      </div>
      <figure className="netzero-film media" data-reveal="image">
        <video ref={film} src={netZero.film.src} poster={netZero.film.poster} muted loop playsInline preload="metadata" aria-label="Voltwise engineers walking along a track between wind turbines" />
        <button className="film-toggle" onClick={toggle} aria-label={paused ? "Play the film" : "Pause the film"} aria-pressed={paused}>
          {paused ? <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" fill="currentColor" /></svg>
            : <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5h2v9H3zM7 1.5h2v9H7z" fill="currentColor" /></svg>}
        </button>
      </figure>
    </div>
  </section>;
}
