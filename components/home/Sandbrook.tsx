import Image from "next/image";
import { Button } from "@/components/ui";
import { sandbrook } from "@/lib/content";

/* "Powered by Sandbrook": the live section's offshore-wind photograph becomes a rounded, image-led panel with the
   Sandbrook wordmark (their own SVG from the live page) and the line about the portfolio. */
export function Sandbrook() {
  return <section className="sandbrook section" id="sandbrook" tabIndex={-1} aria-labelledby="sandbrook-title">
    <div className="wrap">
      <div className="sandbrook-panel media" data-reveal="image" data-parallax data-grow data-tone="dark">
        <Image src={sandbrook.image.src} alt="" width={sandbrook.image.w} height={sandbrook.image.h} sizes="(min-width: 1440px) 1360px, 100vw" />
        <div className="sandbrook-copy">
          <h2 id="sandbrook-title" className="sandbrook-title">
            <span className="label">{sandbrook.label}</span>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={sandbrook.logo} alt="Sandbrook" width={307} height={35} className="sandbrook-logo" />
          </h2>
          <p className="lede">{sandbrook.body}</p>
          <Button href={sandbrook.cta.href} tone="light">{sandbrook.cta.label}</Button>
        </div>
      </div>
    </div>
  </section>;
}
