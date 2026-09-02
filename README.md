# Select Handyman — one-page site

Static, no-build-step site: `index.html` + `css/style.css` + `js/main.js`. Open `index.html` directly in a browser, or deploy the folder as-is to any static host.

## What this replaces

The live selecthandyman.co.uk homepage runs on an unfinished template: a typo'd hero headline, contradictory contact details in three different places, and placeholder stats ("75,000+ VIP Customer", "594+", "498B", "0%"). This build keeps the real content (the four services, the "Why Select Handyman" reasons, the two genuine-sounding testimonials) and rebuilds everything else — including, as of this revision, the full visual design — with a coherent design system, real photography, and considered animation.

## Design direction — "Warm Craftsman"

Earth-tone palette (deep ink, warm parchment, terracotta clay accent, pine green secondary, brass tertiary) paired with `Fraunces` for display type and `Inter` for body/UI — an editorial, tactile feel in place of the generic navy-and-orange SaaS look of the first pass. Real curated photography (hands doing the work, natural light) replaces the earlier abstract WebGL background and SVG illustrations, each photo given a low-opacity ink/clay duotone gradient so it reads as branded rather than dropped-in stock.

### Image credits (Unsplash, free license — no attribution legally required, credited here as good practice)

| Section | Image URL | Subject |
|---|---|---|
| Hero | `https://images.unsplash.com/photo-1731168273756-e02cae42265b` | Cutting tile with an angle grinder, tools laid out on a workbench |
| About | `https://images.unsplash.com/photo-1786204697642-328c597b6f05` | Applying caulk in a kitchen |
| Plumbing card | `https://images.unsplash.com/photo-1609210884848-2d530cfb2a07` | Sink and faucet |
| Electrical card | `https://images.unsplash.com/photo-1621905251189-08b45d6a269e` | Electrician installing wiring |
| Stucco card | `https://images.unsplash.com/photo-1593792954028-d9e3c606b640` | Stucco-rendered exterior wall |
| TV Setup card | `https://images.unsplash.com/photo-1521607630287-ee2e81ad3ced` | Flat-screen TV mounted in a living room |

All confirmed loading (HTTP 200, `image/jpeg`) at time of writing. Hotlinking Unsplash's CDN is fine for a prototype/launch, but for a production business site it's worth downloading and self-hosting these (or licensing originals) so the page doesn't depend on an external CDN staying up.

## Before going live — fill in these placeholders

Search the files for `EDIT ME` / `REPLACE_WITH` / `[verify` / `[Placeholder` to find every spot, or use this list:

| Item | Where | Notes |
|---|---|---|
| Phone number | header, hero, contact section, footer (`tel:+441000000000`) | The crawl found 3 different numbers (header, contact page, footer) plus a Google listing for "Select Handyman Wimbledon" (07821 051010) — confirm the real one with the business before publishing. |
| Email address | contact section, footer, `js/main.js` (`REPLACE_WITH_BUSINESS_EMAIL@example.com`) | The header email had a typo (`gmial.com`) live — get a confirmed working address. |
| Service area / address | contact section, footer | Live site showed a US-looking address on one page and a UK Wimbledon listing elsewhere — needs the business to confirm which is correct. |
| Stats numbers | `#stats-strip` in `index.html` (`data-count-to` attributes: years trading, jobs completed, satisfaction %, response time) | Currently believable placeholder values, not real figures — swap for verified numbers. |
| Reviews | `#reviews` in `index.html` | Two testimonials (Sophia Smith, Devid Alava) were pulled from the live site and look genuine, but weren't independently verified — confirm with the business, and replace the third "[Placeholder review]" card with a real one (or remove the card). |

## Contact form

There's no backend, so the form validates client-side and then opens the visitor's email client via a pre-filled `mailto:` link (see `REPLACE_WITH_BUSINESS_EMAIL@example.com` in `js/main.js`). That works for a static site with zero setup, but mail-client popups are an imperfect UX and undeliverable if the visitor has no email client configured. For production, swap it for a real form backend — no code framework needed, e.g.:

- [Formspree](https://formspree.io) — point the form's `action` at your Formspree endpoint, remove the `js/main.js` mailto step, keep the existing client-side validation.
- Netlify Forms (if hosting on Netlify) — add `data-netlify="true"` to the `<form>`.

## Stack

- No build tooling — plain HTML/CSS/JS, all libraries loaded via CDN `<script>` tags at the bottom of `index.html`.
- **GSAP + ScrollTrigger** — hero entrance (word stagger + photo Ken Burns), all scroll reveals, stats count-up. The single scroll-animation engine site-wide, deliberately not doubled up with a second reveal library (e.g. AOS).
- **Vanilla-Tilt.js** — subtle 3D tilt on service cards, pointer devices only (`(hover: hover)`), skipped under `prefers-reduced-motion`.
- **Anime.js** — draws the small accent line under the hero headline (SVG stroke line-draw), the one thing GSAP wasn't already doing. Wrapped in try/catch; the line just renders as a plain solid stroke if it fails to load.
- A small vanilla-JS "spotlight" hover effect (pointer-tracked radial-gradient glow) on service cards — a from-scratch reimplementation of the hover-glow card pattern documented in the repo's `animated-component-libraries` skill (that skill's own components are React-only, so the pattern is rebuilt here in plain JS).
- Design tokens (color, type scale, spacing, radius, easing) live in `css/style.css`'s `:root` / `:root[data-theme="dark"]` blocks — a light/dark toggle in the header persists choice to `localStorage`.
- `prefers-reduced-motion: reduce` disables all entrance/scroll/hover-motion animation and shows content in its final state.

### Why not more of the repo's 3D/animation skills?

This is a single-page brochure site whose visual centerpiece is now real photography — pulling in a WebGL engine (Three.js, Babylon.js, R3F, PlayCanvas, etc.), a page-transition library (Barba.js), or a second scroll library (Locomotive Scroll, AOS) would add real weight and complexity for no matching benefit, which is exactly what the repo's own `modern-web-design` skill warns against under "performance-first design." The v1 build's WebGL hero background (Vanta.js) has been removed for the same reason — it read as generic abstract-tech and is what the real photography now replaces.
