import { Button, TwoTone } from "@/components/ui";
import { whoWeAre } from "@/lib/content";

/* "Who we are": Virya's "in a few numbers" block. A tall green card carries the heading, copy and button; the
   figures from the same copy sit in four white cards beside it. */
export function WhoWeAre() {
  return <section className="who section" id="who-we-are" tabIndex={-1} aria-labelledby="who-title">
    <div className="wrap who-grid">
      <div className="who-card" data-tone="dark">
        <h2 id="who-title" className="h2" data-reveal="heading"><TwoTone parts={whoWeAre.title} /></h2>
        <div className="who-copy">
          {whoWeAre.body.map((p) => <p key={p.slice(0, 20)} data-reveal="text">{p}</p>)}
        </div>
        <Button href={whoWeAre.cta.href} tone="lime">{whoWeAre.cta.label}</Button>
      </div>
      <ul className="who-figures">
        {whoWeAre.figures.map((f) => <li key={f.label} className="figure card" data-reveal="card">
          <p className="figure-value"><span>{f.value}</span>{f.unit && <span className="figure-unit">{f.unit}</span>}</p>
          <p className="figure-label">{f.label}</p>
        </li>)}
      </ul>
    </div>
  </section>;
}
