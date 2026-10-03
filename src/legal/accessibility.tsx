import type { LegalDoc } from "../components/LegalPage";
import { company, Email } from "./company";
import { UPDATED } from "./privacy";

export const accessibility: LegalDoc = {
  title: "Accessibility",
  updated: UPDATED,
  summary:
    "We want meshrun.co to work for everyone, however they browse. Here’s the standard we hold it to, what we’ve done, what we know still falls short, and how to tell us about anything else.",
  sections: [
    {
      id: "standard",
      heading: "Our standard",
      body: (
        <p>
          We aim to meet the Web Content Accessibility Guidelines (WCAG) 2.2 at level AA across the site, including the
          early access form, and we’ll hold the meshrun app to the same standard.
        </p>
      ),
    },
    {
      id: "done",
      heading: "What we’ve done",
      body: (
        <ul>
          <li>Everything works from a keyboard, with a visible focus outline, and a link to skip straight to the content.</li>
          <li>The menu and the early access form keep focus inside them while open, and Escape closes them.</li>
          <li>Text and the edges of form fields meet WCAG contrast minimums against the dark background.</li>
          <li>
            The 3D render is decoration and hidden from screen readers. Press <strong>Pause animation</strong> (on the
            first screen, and in the footer) to stop it.
          </li>
          <li>
            If your device is set to reduce motion, the render holds still and the page stops animating its type and
            sections.
          </li>
          <li>Headings, landmarks and form labels are marked up so screen readers can find their way around.</li>
          <li>The page reflows at narrow widths and up to 400% zoom without scrolling sideways.</li>
          <li>In Windows high contrast mode, the custom pointer gives way to your system pointer.</li>
          <li>The whole site is available in English and French.</li>
        </ul>
      ),
    },
    {
      id: "known",
      heading: "Known limitations",
      body: (
        <ul>
          <li>
            On large screens, the “From Dock to design” section moves one step for each turn of a mouse wheel. Arrow
            keys, Page Up and Page Down, trackpads and the scrollbar still move through it normally, and screen
            readers get all four steps at once.
          </li>
          <li>
            In the early access form, each choice is its own Tab stop, rather than moving between choices with the arrow
            keys as some screen reader users expect from radio buttons. Both still work.
          </li>
          <li>
            We’ve tested with keyboards, automated checks, zoom and reduced-motion settings. We haven’t yet had an
            independent audit or tested with every screen reader, so there may be issues we haven’t found.
          </li>
        </ul>
      ),
    },
    {
      id: "feedback",
      heading: "Tell us",
      body: (
        <p>
          If anything on the site gets in your way, write to <Email to={company.contact} /> and say what you were
          trying to do and what happened. We’ll reply within five working days, and if we can’t fix it quickly we’ll
          get you the information another way. You can also ask us for anything on this site, including our policies,
          in another format.
        </p>
      ),
    },
  ],
};
