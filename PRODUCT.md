# Product

<!-- impeccable:product-schema 1 -->

This is the marketing site for meshrun. Product truth is shared with the
application and lives in [../app/PRODUCT.md](../app/PRODUCT.md): who the
users are, what the product does, the three positioning claims, the operating
context, terminology, the absence of evidence, and the accessibility standard.
Read that file first. This one records only what is specific to the site.

## Platform

web

## Users

Same audiences and the same priority as the app: UBC engineering students on
MacBooks first; small engineering and design firms, solo engineers and
consultants, and academic labs and makerspaces second. Confirmed 2026-09-16.

On this surface the visitor has not yet used the product. They arrive from a
search, a link, or a recommendation, usually on a Mac, often near a deadline,
asking one question: can this run the CAD package my machine cannot?

## Product Purpose

The site exists to make the product's promise legible in one visit and to turn
interest into a request for a demo. Success is a visitor understanding, within
the first screen, that meshrun runs Windows-only CAD on a Mac by streaming a
cloud GPU workstation, and that it stops costing money when closed.

## Positioning

Inherited unchanged from the app's three claims: CAD-specific rather than a bare
machine; stops costing money when closed; a real Mac application, not a browser
tab. The site may explain these; it may not add claims beyond them.

## Operating Context

- A single-page site: hero, supported CAD ticker, claims, how it works, pricing
  tiers, FAQ, closing call to action, footer.
- Built with Vite, React and Tailwind v4. Run with `npm run dev` (port 5173);
  production with `npm run build` into `dist/`.
- Every string on the page lives in `src/content.ts`. Bracketed values there
  are facts not yet decided and are shown bracketed on the page on purpose.
- Light and dark appearance follow the OS; a visitor's explicit choice is
  stored. `?theme=light|dark` pins it for previews and screenshots.
- Developed on Windows via WSL2; nothing in the build or preview loop may
  require an Apple toolchain.

## Capabilities and Constraints

- **The primary call to action is undecided.** Every "Request a demo" and
  "Talk to us" control is deliberately disabled, and stays so until a real
  flow exists. Do not wire a mailto, form, or scheduling link on assumption.
  Confirmed 2026-09-16.
- **No pricing exists.** Tier prices and the billing unit are bracketed
  placeholders. The tier names and specs are placeholders too.
- **No launch date exists.** "Early access · [date]" stays bracketed.
- **The supported CAD list is unconfirmed.** The ticker and FAQ name packages
  as candidates; the FAQ says so in brackets.
- **No measurements may be published**: no latency, boot time, or performance
  figures.
- Terminology follows the app: machine, session, GPU-hours, workstation tier.

## Brand Commitments

- The name is **meshrun**, set lowercase as a wordmark, never bolded.
- The site now carries a brand mark: the isometric wireframe workstation used
  as the favicon (`public/favicon.svg`) and beside the wordmark
  (`src/components/Wordmark.tsx`). It is the one visual asset the product has.
- The red-orange accent from the app carries over as given.

## Evidence on Hand

**None**, exactly as in the app. No customers, users, pilots, usage data,
benchmarks, testimonials, press, partners, institution endorsements, pricing,
or licensing terms. The site may say what meshrun does; it may not state
adoption, performance, price, or endorsement. Where such a fact is needed it
appears as a visibly bracketed placeholder, never a plausible invention.

## Product Principles

Inherited from the app, with one addition for this surface:

6. **Say only what the product can already do.** The site describes the
   mechanism and the cost model; it never previews capacity, scale, or proof
   that does not exist. Placeholders are honest and visible.

## Accessibility & Inclusion

**WCAG 2.2 AA is binding**, as in the app: the primary audience is reached
through an institution, and public-sector procurement is a realistic path.
Muted and subtle text tokens must pass contrast on both grounds; colour is
never the only carrier of state; disabled controls must read as disabled
without relying on colour alone.
