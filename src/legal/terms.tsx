import type { LegalDoc } from "../components/LegalPage";
import { localPath } from "../i18n";
import { company, Email } from "./company";
import { UPDATED } from "./privacy";

/**
 * Terms for the website and the early access list only. The app will need its
 * own terms of service before anyone signs up: accounts, billing, usage,
 * acceptable use of the machines, files, licences, uptime, suspension.
 */
export const terms: LegalDoc = {
  title: "Terms of use",
  updated: UPDATED,
  summary:
    "The rules for using meshrun.co and joining the early access list. The meshrun app will come with its own terms of service, which you’ll see and agree to before you use it.",
  sections: [
    {
      id: "about",
      heading: "About these terms",
      body: (
        <>
          <p>
            These terms are an agreement between you and {company.name} (“meshrun”, “we”, “us”). They apply when you
            use meshrun.co or ask for early access. By using the site you accept them; if you don’t, please don’t use
            it.
          </p>
          <p>
            They don’t cover the meshrun app. When the app is ready, it will have its own terms of service, and
            those will govern your use of it.
          </p>
        </>
      ),
    },
    {
      id: "early-access",
      heading: "Early access",
      body: (
        <>
          <p>
            Asking for early access puts you on a list. It isn’t an order, a reservation or a contract for any
            service, and it doesn’t cost anything. We invite people a few at a time, in an order that suits what we’re
            testing, and we can’t promise you a place, a date, particular features or a particular price.
          </p>
          <p>
            You can leave the list whenever you like by writing to <Email />. How we handle what you send us is set out
            in our <a href={localPath("/privacy")}>privacy policy</a>.
          </p>
        </>
      ),
    },
    {
      id: "descriptions",
      heading: "What the site describes",
      body: (
        <>
          <p>
            meshrun is still being built. The site describes what we’re building and how we expect it to work.
            Features, supported software, hardware, regions and plans may change before launch, and some may not ship.
          </p>
          <p>
            Performance figures on the site come from our own testing in particular conditions. What you get will
            depend on your internet connection, your distance from our servers, your computer and the software you
            run, so they’re a guide, not a promise.
          </p>
        </>
      ),
    },
    {
      id: "licences",
      heading: "Your software licences",
      body: (
        <p>
          meshrun doesn’t sell or include licences for the software you run with it. You’re responsible for holding
          valid licences for that software and for using it as its publisher’s terms allow. Names of software and
          hardware on this site belong to their owners and are used only to say what meshrun works with; their owners
          don’t endorse or sponsor meshrun.
        </p>
      ),
    },
    {
      id: "use",
      heading: "Using the site",
      body: (
        <>
          <p>You agree to use the site lawfully and in good faith, and in particular not to:</p>
          <ul>
            <li>break into, overload or disrupt the site, or probe it for weaknesses without our permission;</li>
            <li>send the form automatically, in bulk, or on someone else’s behalf without their permission;</li>
            <li>send anything unlawful, abusive, or that you don’t have the right to share;</li>
            <li>copy or scrape the site’s content to republish it, or to train machine learning models on it.</li>
          </ul>
          <p>
            If you find a security problem, please tell us at <Email /> instead. We’ll thank you, and we won’t take
            action against good-faith research that respects people’s privacy and doesn’t disrupt the site.
          </p>
        </>
      ),
    },
    {
      id: "feedback",
      heading: "Ideas you send us",
      body: (
        <p>
          We read every note and suggestion. If you send us one, you agree we can use it to improve meshrun without
          owing you anything for it. We won’t publish your name or what you wrote without asking you.
        </p>
      ),
    },
    {
      id: "ip",
      heading: "Our content",
      body: (
        <p>
          The site, its design, the meshrun name and mark, the 3D render and the words are ours or licensed to us, and
          are protected by copyright and trademark law. You’re welcome to link to the site and to quote it fairly, for
          example in a review. Otherwise, you may not copy or reuse them without our written permission.
        </p>
      ),
    },
    {
      id: "links",
      heading: "Links elsewhere",
      body: (
        <p>
          If we link to another site, it’s for your convenience. We don’t control those sites and aren’t responsible for
          them.
        </p>
      ),
    },
    {
      id: "liability",
      heading: "Warranties and liability",
      body: (
        <>
          <p>
            We work to keep the site accurate and available, but we provide it “as is”, without promises that it will
            always be available, error-free or complete.
          </p>
          <p>
            As far as the law allows, we aren’t liable for indirect or consequential losses arising from your use of
            the site, and our total liability to you in connection with it is limited to CAD $100. The site is free and
            we sell nothing through it, which is why these limits are what they are.
          </p>
          <p>
            None of this limits any right you have that the law doesn’t allow us to limit, including your rights as a
            consumer where you live, or our liability for fraud, or for harm we cause deliberately or through gross
            negligence.
          </p>
        </>
      ),
    },
    {
      id: "law",
      heading: "Law and disputes",
      body: (
        <p>
          These terms are governed by the laws of {company.province} and the federal laws of Canada that apply there.
          If we ever disagree, please write to us first and we’ll try to sort it out. If that doesn’t work, the courts
          of {company.province} have jurisdiction, though if you’re a consumer you may also be able to bring a claim
          where you live.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Changes",
      body: (
        <p>
          We may update these terms as the site changes. We’ll change the date at the top when we do, and the version
          in force when you use the site is the one that applies.
        </p>
      ),
    },
    {
      id: "contact",
      heading: "Contact",
      body: (
        <p>
          Questions about these terms go to {company.name} at <Email />.
        </p>
      ),
    },
  ],
};
