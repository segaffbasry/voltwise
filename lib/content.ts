/* Every word on the page, taken from the live voltwisepower.com homepage (checked 2026-10-01) unless a comment says
   otherwise. Copy is verbatim except for dashes: the house rule is no em or en dashes, so the two places the live
   copy uses one are rewritten with a comma (noted inline). Images are local copies made by scripts/media.sh. */
import { LIVE } from "@/lib/site";

export type Img = { src: string; alt: string; w: number; h: number };

export const hero = {
  // Live h1 is set over three lines: "Intelligent / Energy / Storage".
  title: ["Intelligent", "Energy", "Storage"],
  sub: "Accelerating the path to net zero",
  cta: { label: "Contact us", href: `${LIVE}/contact` },
  film: { src: "/media/hero.mp4", poster: "/media/hero-poster.jpg" }, // VWP_WebHeader_Online_v002_1000x1094px.mp4
  /* The five photographs that fan out of the film in the collage (copied Virya interaction). All are Voltwise's own:
     two from /about, three from the homepage's news feed. Order matches Virya's .hero__images--0 … --4 slots. */
  collage: [
    { src: "/media/field-engineer.jpg", alt: "A Voltwise engineer in a wheat field beside wind turbines and battery containers", w: 900, h: 1062 },
    { src: "/media/bess-units.jpg", alt: "Rows of battery storage units on a gravel site", w: 1400, h: 933 },
    { src: "/media/offshore.jpg", alt: "An offshore wind turbine seen from above over rough sea", w: 2000, h: 1125 },
    { src: "/media/site-team.jpg", alt: "Engineers in hard hats reviewing plans on a construction site", w: 1400, h: 786 },
    { src: "/media/bess-row.jpg", alt: "A row of Voltwise battery containers", w: 1400, h: 875 },
  ] satisfies Img[],
};

// "Made for Net Zero / Who we are", first paragraph. Shown under the collage once the film has settled.
export const intro = {
  title: ["Made for", "Net Zero"],
  body: "Voltwise is an Independent Power Producer (IPP) that develops, constructs and operates grid-scale battery energy storage system (BESS) projects.",
};

// The three pillars directly under the live hero.
export const pillars = [
  { title: "Entire value chain partner", body: "We have the technical and commercial experience across development, construction, and operation." },
  { title: "Going beyond ESG", body: "We track and aim to reduce the environmental footprint of all our operations." },
  { title: "Backed by Sandbrook", body: "We’re uniquely well-capitalised to buy, build, and accelerate net-zero projects." },
];

// The homepage's "Who we are" photo.
export const pillarsImage: Img = { src: "/media/bess-nature.jpg", alt: "Voltwise battery energy storage containers among pine trees, with solar panels behind", w: 2400, h: 1080 };

export const whoWeAre = {
  title: ["Who", "we are"],
  body: [
    // Live: "…operational and under construction - with more in our development pipeline." (dash → comma)
    "First launched in the UK and Germany, our mission is to provide intelligent, safe and reliable BESS across Europe. We currently have 460MW of BESS across 11 projects that are operational and under construction, with more in our development pipeline.",
    "Using BESS to balance the grid at the most critical times is just the beginning for Voltwise. We believe there’s a better way to use data to operate our BESS assets to accelerate net zero.",
  ],
  cta: { label: "Learn more", href: `${LIVE}/about` },
  /* Figures stated in the homepage's own copy and news feed, set where Virya puts its "in a few numbers" cards.
     Each label quotes or closely follows the line it comes from. */
  // 460MW and the 11 projects are told by the projects heatmap right after this section.
  figures: [
    { value: "2", unit: "", label: "launch markets: the UK and Germany" },
    { value: "£154", unit: "m", label: "acquisition financing closed and syndicated" },
  ],
};

export const netZero = {
  title: ["Accelerating", "net zero"],
  lead: "We’re a determined team of energy storage experts who are passionate about net zero.",
  listIntro: "Voltwise believes that being different is better. That’s why:",
  list: [
    "we establish a local presence in each of our markets",
    "we hire unique skillsets to deliver results that scale",
    // Live: "we work to benefit our partners – and their customers too" (en dash → comma)
    "we work to benefit our partners, and their customers too",
  ],
  close: "If we can scale and operate BESS better and faster than it's been done before, we can accelerate the energy transition.",
  cta: { label: "View people", href: `${LIVE}/people` },
  film: { src: "/media/engineers.mp4", poster: "/media/engineers-poster.jpg" }, // "Voltwise Expert Renewable Energy Engineers Walking to Energy Storage System"
};

export const sandbrook = {
  label: "Powered by",
  body: "We’re proud to be part of Sandbrook Capital’s portfolio of companies that are transforming the world’s energy infrastructure.",
  cta: { label: "Visit Sandbrook", href: "https://sandbrook.com/" },
  logo: "/media/sandbrook.svg",
  image: { src: "/media/offshore.jpg", alt: "", w: 2000, h: 1125 } satisfies Img, // decorative ground behind the copy
};

export type Post = { title: string; sub: string; date: string; iso: string; href: string; image: Img };

/* "Latest news": the live homepage lists all seven posts, newest first. The four newest are shown here (pacing cap);
   "View all news" links to the full list. Dates come from each post page. */
export const news = {
  title: ["Latest", "news"],
  all: { label: "View all news", href: `${LIVE}/news` },
  total: 7,
  posts: [
    { title: "Voltwise announces leadership change", sub: "John Jones appointed Interim CEO", date: "16 April 2026", iso: "2026-04-16",
      href: `${LIVE}/post/voltwise-announces-leadership-change`,
      image: { src: "/media/news-leadership-change.jpg", alt: "Voltwise leadership transition card with a portrait of John Jones, Interim CEO", w: 1200, h: 817 } },
    { title: "Voltwise successfully closes and completes syndication of £154 million acquisition financing for UK battery storage portfolio", sub: "Senior debt financing of our 2025 purchase of a 460MW UK BESS portfolio", date: "26 January 2026", iso: "2026-01-26",
      href: `${LIVE}/post/voltwise-successfully-closes-and-completes-syndication-of-154-million-acquisition-financing-for-uk-battery-storage-portfolio`,
      image: { src: "/media/news-financing.jpg", alt: "Battery storage units on a gravel site under a blue sky", w: 1400, h: 933 } },
    { title: "Voltwise strengthens leadership team with CFO appointment and new Board member", sub: "Chris Bott appointed CFO and John Jones joins Voltwise Board", date: "10 October 2025", iso: "2025-10-10",
      href: `${LIVE}/post/voltwise-strengthens-leadership-team-with-cfo-appointment-and-new-board-member`,
      image: { src: "/media/news-cfo.jpg", alt: "Voltwise leadership hires card with portraits of Chris Bott and John Jones", w: 1200, h: 842 } },
    { title: "Voltwise significantly strengthens battery storage platform through the acquisition of the BESS business of Smart Metering Systems (“SMS”)", sub: "460MW of BESS assets in operation and under construction across the UK", date: "23 June 2025", iso: "2025-06-23",
      href: `${LIVE}/post/voltwise-significantly-strengthens-battery-storage-platform-through-the-acquisition-of-the-bess-business-of-smart-metering-systems-sms`,
      image: { src: "/media/news-sms.jpg", alt: "Engineers in hard hats reviewing plans on a construction site", w: 1400, h: 786 } },
  ] satisfies Post[],
};

// The two closing calls to action, each with the enquiry type the live link preselects.
export const enquire = [
  { title: ["Talk to us about", "your BESS project"], cta: { label: "Contact us", href: `${LIVE}/contact?enquiry=4` } },
  { title: ["Are you a landowner", "interested in knowing how BESS could work for you?"], cta: { label: "Contact us", href: `${LIVE}/contact?enquiry=3` } },
];

/* "Our projects", from the live /projects page (title, intro, the "Operational" status and the 11 projects with their
   capacities). Positions on the map: lib/uk-map.ts, read off the live projects map. */
export const projects = {
  title: ["Our", "projects"],
  intro: "The first 11 projects in our UK portfolio. Each one reflects our commitment to providing intelligent, flexible BESS where it matters most.",
  status: "Operational",
  totalLabel: "of projects that are operational and under construction", // /projects: "We have 460MW of projects that are…"
  cta: { label: "Discover our projects", href: `${LIVE}/projects` },
};

/* The ticker band: three lines the live site already uses (hero h1, hero strapline, "Made for Net Zero"). */
export const ticker = ["Intelligent Energy Storage", "Accelerating the path to net zero", "Made for Net Zero"];
