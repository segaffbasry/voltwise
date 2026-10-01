import { Button, TwoTone } from "@/components/ui";
import { enquire } from "@/lib/content";

/* The live page's two closing calls to action, as Virya's rounded pre-footer cards: one green, one lime. */
export function Enquire() {
  return <section className="enquire section" id="enquire" tabIndex={-1} aria-label="Contact Voltwise" data-late>
    <div className="wrap enquire-grid">
      {enquire.map((e, i) => <div key={e.cta.href} className={`enquire-card enquire-${i === 0 ? "green" : "lime"}`} data-tone={i === 0 ? "dark" : undefined} data-reveal="card">
        <h2 className="h3"><TwoTone parts={e.title} /></h2>
        <Button href={e.cta.href} tone={i === 0 ? "lime" : "ink"} reveal={false}>{e.cta.label}</Button>
      </div>)}
    </div>
  </section>;
}
