/* One easing family for the whole site, measured on virya-energy.com (theme build/frontend.js and its lazy chunks).
   The CSS twins live in app/globals.css as --ease-* custom properties.

   Virya's reveals (global/animations.js): `gsap.set(el, { opacity: 0, y: 20 })`, then ScrollTrigger.batch at
   "top 80%" plays `{ opacity: 1, y: 0, stagger: .2, duration: 1 }` with GSAP's default ease, power1.out.
   Its hero scroll timeline (blocks/hero.js) also runs on power1.out. So power1.out is the family here. */

// GSAP power1.out as a cubic-bezier (the standard equivalent; used by CustomEase and the CSS twin --ease).
export const EASE = "0.25,0.46,0.45,0.94";
// Virya hero entrance: `gsap.to('.hero', { yPercent: 0, duration: .8, ease: "circ.out", delay: .2 })`.
export const EASE_ENTRANCE = "circ.out";

export const timing = {
  // Virya plays every reveal at 1s; headings and paragraphs keep that, small parts run shorter so labels never lag.
  label: 0.6,
  heading: 1,
  text: 0.9,
  lineStagger: 0.08,
  card: 0.8,
  cardStagger: 0.2, // Virya batch stagger
  image: 1.1,
  late: 0.75, // multiplier for sections marked data-late
  rise: 20, // Virya: y 20 → 0
};
