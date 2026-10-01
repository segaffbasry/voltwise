import Image from "next/image";
import { pillars, pillarsImage } from "@/lib/content";

/* The three pillars that sit directly under the live hero, set over the homepage's own BESS photograph.
   Layout follows Virya's rounded image blocks: a 28px-radius photo with white cards overlapping its lower edge. */
export function Pillars() {
  return <section className="pillars section" aria-label="Why Voltwise">
    <div className="wrap">
      <figure className="pillars-image media" data-reveal="image" data-parallax>
        <Image src={pillarsImage.src} alt={pillarsImage.alt} width={pillarsImage.w} height={pillarsImage.h} sizes="(min-width: 1440px) 1360px, 100vw" />
      </figure>
      <ul className="pillars-list">
        {pillars.map((p) => <li key={p.title} className="pillar card" data-reveal="card">
          <h2 className="h4">{p.title}</h2>
          <p>{p.body}</p>
        </li>)}
      </ul>
    </div>
  </section>;
}
