import Preloader from "@/components/Preloader";
import { Enquire } from "@/components/home/Enquire";
import { Hero } from "@/components/home/Hero";
import { NetZero } from "@/components/home/NetZero";
import { News } from "@/components/home/News";
import { Pillars } from "@/components/home/Pillars";
import { Projects } from "@/components/home/Projects";
import { Sandbrook } from "@/components/home/Sandbrook";
import { Ticker } from "@/components/home/Ticker";
import { WhoWeAre } from "@/components/home/WhoWeAre";

/* Section order and pacing: README "Page structure". The live homepage's own order, plus the projects heatmap from
   /projects after "Who we are" and a ticker band between it and "Accelerating net zero"; imagery in the hero
   (film + five photos) and the two sections after it; long lists capped. */
export function Home() {
  return <>
    <Preloader />
    <Hero />
    <Pillars />
    <WhoWeAre />
    <Projects />
    <Ticker />
    <NetZero />
    <Sandbrook />
    <News />
    <Enquire />
  </>;
}
