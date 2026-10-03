import type { LegalDoc } from "../components/LegalPage";
import { localPath } from "../i18n";
import { company, Email } from "./company";

export const UPDATED = "3 October 2026";

export const privacy: LegalDoc = {
  title: "Privacy policy",
  updated: UPDATED,
  summary:
    "What we collect when you visit meshrun.co or ask for early access, what we do with it, and how to have it changed or deleted. Short version: no cookies, no tracking, no ads, and we never sell your information.",
  sections: [
    {
      id: "who",
      heading: "Who we are",
      body: (
        <>
          <p>
            meshrun is made by {company.name}, a company incorporated in {company.province}, Canada. In this policy
            “we” and “us” mean {company.name}. We decide how the information described here is used, which makes us
            its controller.
          </p>
          <p>
            This policy covers the website at meshrun.co and the early access list. It doesn’t cover the meshrun app,
            which isn’t available yet. Before it is, we’ll update this policy to cover accounts, sessions, files and
            billing.
          </p>
        </>
      ),
    },
    {
      id: "glance",
      heading: "At a glance",
      body: (
        <ul>
          <li>The site sets no cookies and runs no analytics, advertising or tracking scripts.</li>
          <li>The only personal information we collect is what you type into the early access form, or send us by email.</li>
          <li>It’s stored privately with our host, Vercel, in the United States.</li>
          <li>We use it to plan what we build and to write to you about early access. Nothing else.</li>
          <li>We don’t sell it, rent it, or share it for advertising.</li>
          <li>You can ask to see, correct or delete it at any time.</li>
        </ul>
      ),
    },
    {
      id: "collect",
      heading: "What we collect",
      body: (
        <>
          <h3>When you ask for early access</h3>
          <p>The form asks:</p>
          <ul>
            <li>whether you’re a student, a maker or a professional;</li>
            <li>which software you need to run;</li>
            <li>what computer you work on today, and roughly how many hours a week you spend in heavy CAD.</li>
          </ul>
          <p>And, only if you choose to give them:</p>
          <ul>
            <li>your email address and name;</li>
            <li>your company or university;</li>
            <li>a note to the team.</li>
          </ul>
          <p>
            With your answers we keep the time you sent them and the address of the page you sent them from. Please
            don’t put sensitive information (health, financial or government ID details, for example) in the note.
            We don’t need it.
          </p>

          <h3>When you email us</h3>
          <p>Your email address, your name if you include it, and whatever you write.</p>

          <h3>When you visit the site</h3>
          <p>
            Like any website, ours can’t reach your browser without your browser’s address (your IP address). Our
            host, Vercel, processes it along with your browser type and the page you asked for to deliver the site
            and protect it from abuse, and keeps short-lived logs of those requests. Our form also holds your IP
            address in memory for about ten minutes to stop the same person sending it over and over; it isn’t saved
            with your answers.
          </p>
          <p>
            We don’t use cookies, pixels, fingerprinting or third-party analytics, and the site loads no content from
            other companies: our fonts and code are served from our own domain. See our{" "}
            <a href={localPath("/cookies")}>cookie policy</a>.
          </p>
        </>
      ),
    },
    {
      id: "use",
      heading: "How we use it",
      body: (
        <>
          <p>We use what you give us to:</p>
          <ul>
            <li>
              <strong>Reply about early access</strong>: to invite you when there’s a place, and to answer anything you
              ask us.
            </li>
            <li>
              <strong>Plan what we build</strong>: which software to support first, what machines to offer, and how to
              price them. We look at answers together and in aggregate.
            </li>
            <li>
              <strong>Keep the site working and safe</strong>: to stop spam and abuse.
            </li>
            <li>
              <strong>Meet our legal obligations</strong>, where a law requires us to keep or disclose something.
            </li>
          </ul>
          <p>
            We won’t add you to a newsletter or send you marketing unless you’ve separately said yes to it, and every
            such email will tell you how to stop them. We don’t make automated decisions about you, and we don’t use
            your information to build advertising profiles.
          </p>

          <h3>Consent, and our legal bases</h3>
          <p>
            In Canada, where the Personal Information Protection and Electronic Documents Act and British Columbia’s
            Personal Information Protection Act apply, we rely on your consent: by sending the form you agree to the
            uses above. You can withdraw it at any time by writing to <Email />, and we’ll delete what you sent.
          </p>
          <p>
            If you’re in the European Economic Area or the United Kingdom, the GDPR asks us to name a legal basis for
            each use. Replying about early access is a step you asked us to take before any contract (Article
            6(1)(b)). Planning the product and keeping the site safe are in our legitimate interests (Article 6(1)(f)),
            which we’ve weighed against yours: we collect little, keep it private and don’t use it for anything you
            wouldn’t expect. Keeping records the law requires is a legal obligation (Article 6(1)(c)). Giving us your
            email, name or organisation is optional; without an email we just can’t write to you.
          </p>
        </>
      ),
    },
    {
      id: "share",
      heading: "Who we share it with",
      body: (
        <>
          <p>Only the people and companies that help us run meshrun, and only what they need:</p>
          <ul>
            <li>
              <strong>Vercel Inc.</strong> hosts the site and stores early access requests on our behalf, in its
              Washington, D.C. (United States) region. It acts on our instructions and may not use your information
              for its own purposes.
            </li>
            <li>
              <strong>Our email provider</strong> carries any email you send us or we send you.
            </li>
            <li>
              <strong>Professional advisers</strong>, such as lawyers and accountants, where we need their advice.
            </li>
          </ul>
          <p>
            We’ll also disclose information if the law requires it, for example under a valid court order. If meshrun
            is ever sold or merged, the information would pass to the new owner under the same promises, and we’d
            tell you first. We never sell personal information.
          </p>
        </>
      ),
    },
    {
      id: "transfers",
      heading: "Where it’s stored",
      body: (
        <>
          <p>
            We’re in Canada and our host stores early access requests in the United States. While it’s there, your
            information is protected by our contract with Vercel, and it may be accessible to courts, law enforcement
            and national security authorities in the United States under US law.
          </p>
          <p>
            If you’re in the EEA or the UK, Canada is recognised by the European Commission as giving adequate
            protection to personal information handled by businesses. For the onward transfer to the United States we
            rely on the safeguards in our data processing agreement with Vercel, including the European Commission’s
            standard contractual clauses and the UK addendum to them. Write to us for a copy of the relevant terms.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      heading: "How long we keep it",
      body: (
        <ul>
          <li>
            <strong>Early access requests</strong>: until we’ve invited you and you’ve either joined or told us you’re
            not interested, and never more than 24 months after you sent the form. After that we delete it, or keep
            only totals that can’t identify you (“40% of requests mention Revit”).
          </li>
          <li>
            <strong>Emails</strong>: for as long as the conversation needs, and no more than 24 months after it ends,
            unless the law requires longer.
          </li>
          <li>
            <strong>Server logs</strong>: kept by Vercel for a short period under its own retention settings, then
            deleted.
          </li>
        </ul>
      ),
    },
    {
      id: "security",
      heading: "How we protect it",
      body: (
        <>
          <p>
            Everything between your browser and us is encrypted (HTTPS, enforced on every visit). Early access
            requests are stored in private storage that isn’t reachable from the web, encrypted at rest by our host,
            and only the people at meshrun who need them can read them.
          </p>
          <p>
            No system is perfectly secure. If a breach ever puts your information at real risk, we’ll tell you and
            the authorities that need to know, as the law requires.
          </p>
        </>
      ),
    },
    {
      id: "rights",
      heading: "Your rights",
      body: (
        <>
          <p>Wherever you are, you can ask us to:</p>
          <ul>
            <li>tell you what we hold about you, and give you a copy;</li>
            <li>correct anything that’s wrong;</li>
            <li>delete it;</li>
            <li>stop using it, or withdraw your consent.</li>
          </ul>
          <p>
            In the EEA and the UK you can also object to how we use it, ask us to restrict it, and ask for it in a
            portable format. Write to <Email /> from the address you gave us (or tell us which one you used). We may
            ask you to confirm it’s you, and we’ll answer within 30 days. It’s free.
          </p>
          <p>
            If you’re not happy with our answer, you can complain to the Office of the Privacy Commissioner of Canada
            (priv.gc.ca), to the privacy regulator in your province (in Québec, the Commission d’accès à
            l’information; in British Columbia or Alberta, the Information and Privacy Commissioner), or, in the EEA or
            the UK, to your local data protection authority or the Information Commissioner’s Office (ico.org.uk). We’d
            appreciate the chance to put it right first.
          </p>
        </>
      ),
    },
    {
      id: "children",
      heading: "Children",
      body: (
        <p>
          meshrun is for university students and professionals. The site isn’t meant for anyone under 16, and we don’t
          knowingly collect their information. If you think a child has sent us the form, write to us and we’ll delete
          it.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Changes to this policy",
      body: (
        <p>
          When we change this policy we’ll update the date at the top. If a change affects information you’ve already
          given us in a way you wouldn’t expect, we’ll email you before it takes effect, if we have your address.
        </p>
      ),
    },
    {
      id: "contact",
      heading: "Contact",
      body: (
        <>
          <p>
            Our Privacy Officer is responsible for how we handle personal information and for answering your
            requests. Write to the Privacy Officer at <Email />.
          </p>
        </>
      ),
    },
  ],
};
