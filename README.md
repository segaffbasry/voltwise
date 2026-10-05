# Voltwise: homepage redesign (private prospect demo)

A one-page rebuild of [voltwisepower.com](https://www.voltwisepower.com/). It uses Voltwise's own wordmark (their vector SVG), brand film, photography, fonts and copy, restaged on the layout and motion of the reference site [virya-energy.com](https://virya-energy.com/). **Scope: homepage only.** Every other link points at the real page on voltwisepower.com.

Stack: Next.js 16 (App Router, TypeScript), GSAP + ScrollTrigger + CustomEase, and Lenis. No UI kit, no CSS framework and no other animation library. Plain CSS lives in `app/globals.css` and `styles/*.css`.

```bash
npm install
npm run dev        # http://127.0.0.1:3033
npm run build      # static build of the single route
npm run typecheck
npm run media      # re-download photography and films from the live CDN and re-grade them (needs ffmpeg)
npm run fonts      # re-download Overpass + Anek Latin from the live CSS and subset to woff2 (needs python3 + fontTools)
npm run logo       # split the live wordmark SVG into lib/logo.ts (needs python3)
npm run links      # check every outbound link against the live sitemap
npm run map        # rebuild public/media/uk-map.svg + lib/uk-map.ts (Natural Earth outline + project positions)
```

## Routes

| Route | What |
|---|---|
| `/` | The homepage. Statically generated. |
| `/icon.svg` | Favicon: the wordmark's own "v" on Green (the live favicon is a 32px JPG of the same). |

`next build` generates 4 static pages: `/`, `/_not-found` and `/icon.svg` in the route table (plus Next's internal page). There are no archive or detail pages.

## Recon (Phase 1)

**Live homepage, every section:**

| # | Live section | Items |
|---|---|---|
| 1 | Hero: brand film (portrait 1000×1094), h1 "Intelligent / Energy / Storage", "Accelerating the path to net zero", "Contact us" | 1 film + 1 CTA |
| 2 | Three pillars: Entire value chain partner, Going beyond ESG, Backed by Sandbrook | 3 |
| 3 | "Made for Net Zero / Who we are": 3 paragraphs, BESS photo, "Learn more" | 1 photo + 1 CTA |
| 4 | "Accelerating net zero": lead, intro, 3 bullets, closing line, engineers film, "View people" | 1 film + 3 bullets + 1 CTA |
| 5 | "Powered by" Sandbrook: logo, line, offshore-wind photo, "Visit Sandbrook" | 1 |
| 6 | "Latest news" + "View all news" | 7 posts |
| 7 | Two CTAs: "Talk to us about your BESS project", "Are you a landowner…" (each "Contact us" with a preselected enquiry type) | 2 |
| 8 | Footer: logo, LinkedIn, copyright, "Website by VSNRY", 4 legal links | — |

**Sitemap:** `/sitemap.xml` (94 URLs: 12 pages, 7 posts, 29 people, plus `/de` copies). Used to verify every outgoing link.

**Brand:**
- **Logo:** the live site serves real vectors (`Voltwise White Logo.svg`, `Voltwise Green Logo.svg`, 151×31). It is a wordmark only, with no separate symbol, made of 10 paths: `v o l t`, the t's wedge, `w`, the `i` with its slanted cut, the two halves of the `s`, and `e`. `scripts/logo.py` writes them to `lib/logo.ts` by name; `components/Logo.tsx` renders them in `currentColor`.
- **Films:** `VWP_WebHeader_Online_v002_1000x1094px.mp4` (18s; turbines, branded battery containers, grid, city at dusk) and "Voltwise Expert Renewable Energy Engineers Walking to Energy Storage System" (9s). Both are re-encoded muted H.264 (2.7MB and 0.9MB).
- **Fonts:** the live Webflow CSS loads two variable TTFs: "Overpass Custom Font" (wght 100–900) and "Anek Latin Custom Font" (wdth + wght). Both are SIL OFL; `scripts/fonts.sh` downloads those exact files and subsets them to Latin woff2. Overpass is the UI/body face; Anek Latin is the display face (hero, preloader, section headings).
- **Palette source:** the live CSS variables `--primary #15883c`, `--second-gradient-color #106e30`, `--accent #ccf375`, `--heading-color #232323`, `--text-color #424242`, and the light section ground `#f3f6f4`.

**Structure:** header = logo, About, Projects, People, Landowners, News, Contact, EN/DE. Footer = LinkedIn, copyright, VSNRY credit, Terms & Conditions, Privacy Policy, Cookies Policy, Corporate Info / Imprint. Offices (from `/contact`): London (Voltwise Power Holdings Limited) and Oberhaching (Voltwise DE GmbH). The only social account is LinkedIn.

## Decisions

| Bracket | Decision |
|---|---|
| Palette | **Confirmed:** Green `#15883c` (with its own dark shade Forest `#106e30`), Lime `#ccf375`, Ink `#232323`, Paper `#f3f6f4`. White only for cards and type on dark grounds. |
| Look + motion reference | virya-energy.com is both (one reference given). |
| Copied interaction | **Confirmed:** Virya's hero, film to collage (below). |
| Preloader | Originally once per session; **since review 1, a loading screen on every load** (client asked for one). |
| Typography | Overpass (UI/body) + Anek Latin (display): the live site's own two families. |
| PostHog key | The standing Regen EU key (`lib/posthog.ts`), overridable with `NEXT_PUBLIC_POSTHOG_KEY`. |
| "Website by VSNRY" | Left out of the footer: it credits the current site's agency, not Voltwise. |
| Email address | Not shown: the live site obfuscates it everywhere. |

## Review 1 (5 Oct 2026)

Client feedback: "this is really nice! But… their website is kind of similar, we have just added more movement to their sections. Could we add like a loading screen?" and, on the live projects map, "could we do something with this? like a nice heatmap of projects?"

| Ask | Change |
|---|---|
| Loading screen | The 1.7s once-per-session intro became a loading screen on every load: the Forest ground charges to Green like a battery (Lime edge) while a 0 to 100% counter runs and the wordmark builds; it waits for the hero's real assets (below). |
| Heatmap of projects | New "Our projects" section: Great Britain with a heat bloom per site sized by capacity, a 460MW counter, the 11-project list with capacity bars, rows and sites linked on hover/focus (`Projects.tsx`). |
| More movement, less like the live site | A Lime ticker band driven by scroll speed and direction (`Ticker.tsx`); photo panels that widen as they rise (`data-grow`); figures that count up (`data-count`); the heatmap's charge-up sequence and live pulses. |

## Page structure and pacing

Eight sections in the live page's own order plus the projects heatmap from `/projects` and a ticker band, imagery-led at the top. Spacing comes from one scale (`--section-y: clamp(48px, 6.4vw, 88px)`), with no section taller than its content except the pinned hero.

| # | Section | Component | Imagery |
|---|---|---|---|
| 1 | Hero: film shrinks into a card among five photos; "Made for Net Zero" rises underneath | `Hero.tsx` | brand film + 5 photos |
| 2 | Pillars over the BESS photograph | `Pillars.tsx` | BESS photo |
| 3 | Who we are: green card + two figures | `WhoWeAre.tsx` | (text and figures) |
| 4 | Our projects: heatmap of the 11 UK sites | `Projects.tsx` | map |
| – | Ticker band | `Ticker.tsx` | — |
| 5 | Accelerating net zero | `NetZero.tsx` | engineers film |
| 6 | Powered by Sandbrook | `Sandbrook.tsx` | offshore photo |
| 7 | Latest news (4) | `News.tsx` | 4 post images |
| 8 | Two closing CTAs | `Enquire.tsx` | — |

**Page height** (measured in the browser, `document.documentElement.scrollHeight`):

| Width × height | Total | Viewport heights |
|---|---|---|
| 1440 × 900 | 8,553px (includes the 990px hero pin and the 900px projects pin) | 9.5 |
| 768 × 1024 | 9,082px | 8.9 |
| 375 × 812 | 9,630px | 11.9 (single-column stacking, no projects pin) |

The page sits over the 8-screen target since reviews 1 and 2 added the projects section and its pinned sequence, both at the client's request; the four "Who we are" figures were cut to two (460MW and the 11 projects now live in the heatmap) to offset it.

## Content counts: live homepage vs this build

| Section | Live | Here | Note |
|---|---|---|---|
| Hero | 1 film, h1, line, 1 CTA | same + "Discover Voltwise" (scrolls to Who we are) | The second button mirrors Virya's two-button hero; it stays on the page. |
| Pillars | 3 | 3 | |
| Who we are | 3 paragraphs + photo | 3 paragraphs (first under the hero collage, two in the green card) + photo (with the pillars) + 2 figures | Figures restate the copy and news feed: UK + Germany, £154m financing. |
| Our projects (from `/projects`) | not on the live homepage | title, intro, "Operational", all 11 projects with MW, 460MW total | Added at the client's request (review 1). |
| Accelerating net zero | lead, intro, 3 bullets, close, film | same | |
| Sandbrook | logo, line, photo, CTA | same | |
| Latest news | 7 | **4** | Pacing cap: the four newest (Apr 2026 to Jun 2025). Not shown: "Voltwise readies first German BESS site for construction" (Oct 2024), "Q&A: Europe's BESS opportunity" (Jun 2024), "…equity commitment from Sandbrook Capital" (Jun 2023). "View all news" goes to `/news`. |
| CTAs | 2 | 2 | Same `?enquiry=4` / `?enquiry=3` targets. |
| Footer | LinkedIn, 4 legal, copyright | same + site links + both offices | |

Copy is verbatim except dashes (house rule: none in copy). Two live sentences use one; both become commas (`lib/content.ts` notes each), and the copyright range reads "2024 to 2026".

## Copied interaction: Virya's hero, film to collage

Source: `virya-energy.com/wp-content/themes/virya/assets/build/resources_js_blocks_hero_js.frontend.js` (`animateAboveTablet`, `animateAboveMobile`, `animateMobile`, `initMouseParallax`) and the `.hero__*` rules in the theme CSS. Rebuilt in `components/home/Hero.tsx` + `styles/hero.css`:

- **Structure:** the film (`.hero__attachment`) and five photos (`.hero__images--0…4`) share one grid cell. Photos sit behind with Virya's widths (desktop 206/219/249/183/238px, tablet 120/140/180/120/170, phone 74/78/89/65/82), aspect ratios (.854/.987/.973/.785/.856), z-orders (5/2/3/1/4) and radii (28/16/12px).
- **Timeline** (pinned, `scrub: true`, `power1.out`): headline fades at position -0.6 (GSAP shifts the rest forward, so the headline fades before anything moves); film to a 309×362, 28px-radius card at `x: 10` over duration 1; photos fan out to `(120,-130) (220,50) (-130,80) (-230,-80) (-60,-140)` at 0.2/0.25/0.3/0.3/0.35; film and photos lift together at 0.4; the description rises with `power2.out` at 0.2. Tablet (150×200, r16) and phone (110×119, r12) use Virya's own offsets.
- **Mouse parallax** past 70% progress: per-photo speeds .08/.12/.10/.15/.11 (film .13), 10% interpolation per tick, rotation = speed × 150 with perspective 1000, z-rotation = speed × 20. Applied to an inner wrapper so it never fights the scrub.
- **Deliberate changes:** the pin runs 110% of the viewport height (100% tablet, 90% phone) instead of Virya's 3000px, so the page stays short; the timeline is identical and plays faster per pixel. The desktop lift is -150px (capped at 17% of viewport height; -80px on phones) instead of -200px, and the description is anchored a fixed distance under the collage (`--lift` + `--below`), so it sits close at any screen height.
- **Curves as variables:** `--ease` / `"volt"` = power1.out (`lib/ease.ts`, `app/globals.css`).
- **Side by side:** Virya's own pin did not initialise in the browser tool under viewport emulation (it waits 2s and a `ready` class before building), so the comparison is value for value against its source, not frame by frame. The order of moves, card size, radius and fan-out geometry match it. Voltwise's portrait film fills the 309×362 card naturally.

## The opening moment (loading screen)

`components/Preloader.tsx`. Voltwise has no symbol, so the wordmark's three cuts play as a spark of current, while the screen charges like a battery behind it:

| Time | Stage |
|---|---|
| 0.10 to 0.65s | `v o l t w i e` rise and fade in, 0.06s apart; "Intelligent Energy Storage" and the counter fade up |
| 0.10 to 1.40s | the Green charge rises from the bottom of the Forest ground (its edge lit Lime) and the counter runs to 90% |
| then | waits for the hero's own assets (web fonts, the poster frame, `canplay` on the film), at most 0.8s more |
| +0.35s | 90 to 100%; the spark: the t's wedge drops in and the two halves of the `s` close on the bolt, lit Lime |
| +0.30s | the spark cools to Paper |
| +0.60s | the counter lifts away, the word glides into the header logo position (measured at exit time) and the charged ground wipes up, uncovering the film under its Green veil |

About 2.6s on a warm cache, never more than 3.4s (failsafe). This is longer than the brief's 2s on purpose: the client asked for a loading screen they would notice. Handover early in the exit: removes `is-loading`, sets `data-intro="done"`, dispatches `intro:done`; the hero headline, buttons, header and the film's settle wait for it and Lenis stays stopped until then. Plays on every load (boot script in `app/layout.tsx`, before first paint), skipped with reduced motion, hidden by `<noscript>`. Stages checked in screenshots at 0.8s (76%, letters building, charge edge visible), 1.8s (100%) and the exit.

GSAP owns every transform on the charge layer (CSS only hides it with `opacity: 0` before hydration): an initial CSS `translate`/`transform` gets folded into GSAP's own `y` and pushes the fill off-screen.

The hero film only starts after the handover: Chrome stops painting a muted video that starts autoplaying underneath a full-screen cover. The card also carries the poster frame as its CSS background, so it is never see-through.

## Our projects (heatmap)

`components/home/Projects.tsx`, data in `lib/uk-map.ts`, outline in `public/media/uk-map.svg`, both from `scripts/map.mjs`.

**Review 2 (5 Oct 2026):** "I want it scroll that grey bg expand to full. And make this most sophisticated." The section is now a three-act scroll piece:

1. **Expand.** The Ink panel is full-bleed but clipped to a rounded card on the page's content edge (measured from a zero-height `.wrap` ruler, so it is exact at every width). As it rises, the clip opens to the screen edges and the 28px corners square off, scrubbed from "top bottom" to "top top"; the map scales up from 90% with it. The content never moves: it sits on the page grid inset by `--panel-pad`, as it did inside the card.
2. **Charge the grid** (≥ 900px). The panel pins for one screen height. The scroll brings the 11 sites online one by one, north to south: bloom (with a slight overshoot) and dot light, the row turns on and its bar fills, the label card follows the newest site (name, MW, share of the 460MW), the counter adds the capacity, and a meter reads `07 / 11 sites`. Phones play the same sequence once, over 2.2s, when the panel enters.
3. **Explore.** When everything is online, the dots keep a staggered Lime pulse and the heat breathes. Hovering or focusing a row lights its site (the other blooms dim) and vice versa. The map leans up to 5° toward the pointer.

Reduced motion: no clip, no pin, every site online from the start. Without JS the server render shows the finished state.

- **Outline:** Natural Earth 1:10m (world-atlas `countries-10m.json`): Great Britain + Northern Ireland, Ireland faint for context, Mercator fitted to mainland Britain, specks under 3px² dropped. Shipped as a 106KB static SVG, outside the JS bundle.
- **Positions:** read off the live `/projects` map image. That image is a Web Mercator render, so it is calibrated on its own labelled cities (Edinburgh, Newcastle, Nottingham, Cardiff, London; least-squares fit) and each green dot is converted back to lat/lon (Wolverhampton, Brentwood and North Tawton land within ~0.1° of the real towns). Burwell I and II share a site; like the live map they sit side by side.
- **Heat:** one radial bloom per site (Lime core to Green to clear), radius ∝ √MW, Gaussian-blurred and screen-blended, so the 50MW sites glow wider and neighbours (Burwell, Brook Farm, Brentwood) merge into one warm patch.

## Motion system

`components/motion.tsx`. Lenis (`lerp: 0.1`, Virya's own parallax interpolation) on the GSAP ticker, synced with ScrollTrigger; anchor links go through Lenis; the menu and preloader stop it. All reveals play once, on power1.out, at 75% duration inside `[data-late]` sections.

| Move | Applies to | What |
|---|---|---|
| `heading` | section headings | whole phrase fades and rises 20px, 1s (Virya `fade-in`: `y: 20`, `duration: 1`) |
| `text` | paragraphs | words rise out of a line mask, 0.08s between lines, 0.9s |
| `label` | buttons, small links | 12px rise + fade, 0.6s |
| `card` | pillars, figures, bullets, news, CTAs | Virya's `ScrollTrigger.batch`: 20px rise + fade, 0.2s apart, 0.8s |
| `image` | photos and films | clip opens from the bottom (28px radius), 1.1s; `[data-parallax]` adds ±5% drift; `[data-grow]` panels (pillars photo, Sandbrook) widen from 92% to full size as they rise, scrubbed |
| `count` | figures | run up from zero once, 1.4s, power2.out |

The ticker band (`Ticker.tsx`) idles at 40px/s and speeds up with the Lenis velocity (up to ~900px/s), reversing when the reader scrolls back up; static with reduced motion.

No per-character effects outside the preloader and hero. Buttons are Virya's `c-button` (18px radius, `.3s ease-out`, `scale(.97)` on hover, 9px arrow) with its variants mapped onto the palette. The header has no bar: it takes Paper over `[data-tone="dark"]` areas (film, green cards, footer) and Ink elsewhere, hides on scroll down and returns on scroll up. The menu is a Green panel that opens from the toggle's corner as a rounded card (one GSAP timeline in, reversed out), with focus trap, Esc to close and focus returned to the toggle.

**Reduced motion:** the boot script adds no `js` or `is-loading` class, so every reveal target renders in place; no Lenis, no preloader, no pin (the film stays full-bleed and the description sits under it), films start paused with the play control. **No JS:** the same static layout, poster frames instead of films, `<noscript>` hides the preloader.

## Photography

All from voltwisepower.com's Webflow CDN (`scripts/media.sh`): the homepage's BESS-in-the-forest photo, offshore-wind photo, both films and news images, plus two `/about` photos for the collage. Photographs share one light grade (saturation 0.86, shadows nudged toward Green) so hi-vis orange and sunsets sit back inside the palette; branded news slides are untouched.

## Private-demo settings

- `robots: noindex, nofollow, nocache` (Next metadata), no sitemap, no robots.txt.
- PostHog EU (`lib/posthog.ts`): pageview, pageleave, autocapture, session recording, surveys off; `site` and UTM properties registered; `scroll_depth` fires once each at 25/50/75/100.
- Links never navigate: every href is the real URL (checked by `npm run links`: 20 links (including the new `/projects` link), all in the sitemap and answering 200, or external and live), but a capture-phase guard cancels clicks on anything not starting with `#`.
- No visible tracking or agency UI.

## Verification

- `npm run typecheck` and `npm run build` pass; 4 static pages (above).
- Browser at 375, 768 and 1440: no horizontal scroll, no console errors, no broken images; imagery in the hero and the two sections after it.
- Menu by keyboard: Enter opens, focus lands inside, Shift+Tab wraps within the panel, Esc closes and returns focus to the toggle.
- Built HTML: no em or en dashes in visible text, no `href="#"`.
- Reduced motion and no-JS were checked by code path and the server-rendered HTML (no emulation for `prefers-reduced-motion` is available in the browser tool used).
