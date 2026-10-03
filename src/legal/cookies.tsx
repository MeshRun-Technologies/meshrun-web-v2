import type { LegalDoc } from "../components/LegalPage";
import { Email } from "./company";
import { UPDATED } from "./privacy";

export const cookies: LegalDoc = {
  title: "Cookie policy",
  updated: UPDATED,
  summary:
    "meshrun.co doesn’t use cookies. Here’s exactly what the site does keep in your browser, which is one setting, and only if you ask for it.",
  sections: [
    {
      id: "none",
      heading: "No cookies",
      body: (
        <>
          <p>
            Cookies are small files a website asks your browser to keep, often so that it, or a company it works
            with, can recognise you later. This site doesn’t set any. It runs no analytics, advertising, social media
            or tracking scripts, and it loads nothing from other companies: our fonts and code come from our own
            domain. So there’s nothing to accept, and no banner.
          </p>
        </>
      ),
    },
    {
      id: "storage",
      heading: "The one thing we keep in your browser",
      body: (
        <>
          <p>
            If you press <strong>Pause animation</strong>, the site remembers that choice in your browser’s local
            storage, so the 3D render stays still the next time you visit.
          </p>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">What it holds</th>
                  <th scope="col">Why</th>
                  <th scope="col">How long</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>meshrun:motion</code>
                  </td>
                  <td>The word “paused”</td>
                  <td>Keeps the animation paused, because you asked</td>
                  <td>Until you press Play animation or clear your browser’s site data</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            It never leaves your device: it isn’t sent to us or anyone else, and it can’t identify you. Because it
            only exists to do what you asked, the law doesn’t require us to ask permission for it.
          </p>
        </>
      ),
    },
    {
      id: "host",
      heading: "Our host",
      body: (
        <p>
          The site is hosted by Vercel. If Vercel’s security systems ever suspect your browser of being automated, they
          may show a check and set a short-lived cookie to remember that you passed it. That cookie is strictly
          necessary to protect the site, isn’t used for anything else, and doesn’t appear on ordinary visits.
        </p>
      ),
    },
    {
      id: "control",
      heading: "Controlling it yourself",
      body: (
        <p>
          Every browser lets you see, block and delete cookies and stored site data, usually under Settings, then
          Privacy. Blocking them won’t break anything here; the animation just won’t remember being paused.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "If this changes",
      body: (
        <p>
          If we ever want to use cookies or similar technology for anything beyond what’s strictly necessary, such as
          analytics, we’ll ask you first, before setting anything, and update this page. Questions to <Email />.
        </p>
      ),
    },
  ],
};
