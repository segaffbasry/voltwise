import Preloader from "@/components/Preloader";
import { Enquire } from "@/components/home/Enquire";
import { Hero } from "@/components/home/Hero";
import { NetZero } from "@/components/home/NetZero";
import { News } from "@/components/home/News";
import { Pillars } from "@/components/home/Pillars";
import { Sandbrook } from "@/components/home/Sandbrook";
import { WhoWeAre } from "@/components/home/WhoWeAre";

/* Section order and pacing: README "Page structure". Seven sections in the live homepage's own order; imagery in
   the hero (film + five photos) and the two sections after it; long lists capped. */
export function Home() {
  return <>
    <Preloader />
    <Hero />
    <Pillars />
    <WhoWeAre />
    <NetZero />
    <Sandbrook />
    <News />
    <Enquire />
  </>;
}
