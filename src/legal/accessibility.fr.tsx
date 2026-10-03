import type { LegalDoc } from "../components/LegalPage";
import { company, Email } from "./company";
import { MIS_A_JOUR } from "./privacy.fr";

export const accessibility: LegalDoc = {
  title: "Accessibilité",
  updated: MIS_A_JOUR,
  summary:
    "Nous voulons que meshrun.co fonctionne pour tout le monde, peu importe comment on navigue. Voici la norme que nous visons, ce que nous avons fait, ce que nous savons encore imparfait, et comment nous signaler le reste.",
  sections: [
    {
      id: "standard",
      heading: "Notre norme",
      body: (
        <p>
          Nous visons la conformité aux Règles pour l’accessibilité des contenus Web (WCAG)&nbsp;2.2, niveau AA, sur
          tout le site, y compris le formulaire d’accès anticipé, et nous appliquerons la même norme à l’application
          meshrun.
        </p>
      ),
    },
    {
      id: "done",
      heading: "Ce que nous avons fait",
      body: (
        <ul>
          <li>Tout fonctionne au clavier, avec un contour de focus visible et un lien pour passer directement au contenu.</li>
          <li>Le menu et le formulaire d’accès anticipé gardent le focus tant qu’ils sont ouverts, et la touche Échap les ferme.</li>
          <li>Le texte et le contour des champs respectent les contrastes minimaux des WCAG sur le fond sombre.</li>
          <li>
            Le rendu 3D est décoratif et masqué aux lecteurs d’écran. Appuyez sur{" "}
            <strong>Mettre l’animation en pause</strong> (sur le premier écran et dans le pied de page) pour l’arrêter.
          </li>
          <li>
            Si votre appareil est réglé pour réduire les animations, le rendu reste immobile et la page n’anime plus ses
            textes ni ses sections.
          </li>
          <li>Les titres, les régions et les étiquettes de formulaire sont balisés pour que les lecteurs d’écran s’y retrouvent.</li>
          <li>La page se réorganise aux petites largeurs et jusqu’à un zoom de 400&nbsp;% sans défilement horizontal.</li>
          <li>En mode de contraste élevé de Windows, le pointeur personnalisé cède la place à celui de votre système.</li>
          <li>Tout le site est offert en anglais et en français.</li>
        </ul>
      ),
    },
    {
      id: "known",
      heading: "Limites connues",
      body: (
        <ul>
          <li>
            Sur les grands écrans, la section «&nbsp;Du Dock au design&nbsp;» avance d’une étape à chaque cran de la
            molette. Les flèches, les touches Page précédente et Page suivante, les pavés tactiles et la barre de
            défilement la parcourent normalement, et les lecteurs d’écran reçoivent les quatre étapes d’un coup.
          </li>
          <li>
            Dans le formulaire d’accès anticipé, chaque choix est un arrêt de tabulation distinct, plutôt que de passer
            d’un choix à l’autre avec les flèches comme certains utilisateurs de lecteurs d’écran s’y attendent pour les
            boutons radio. Les deux méthodes fonctionnent.
          </li>
          <li>
            Nous avons testé au clavier, avec des vérifications automatisées, le zoom et les réglages de réduction des
            animations. Nous n’avons pas encore fait faire d’audit indépendant ni testé tous les lecteurs d’écran; il
            peut donc rester des problèmes que nous n’avons pas trouvés.
          </li>
        </ul>
      ),
    },
    {
      id: "feedback",
      heading: "Écrivez-nous",
      body: (
        <p>
          Si quoi que ce soit sur le site vous bloque, écrivez à <Email to={company.contact} /> en nous disant ce que
          vous tentiez de faire et ce qui s’est passé. Nous vous répondrons dans les cinq jours ouvrables et, si nous ne
          pouvons pas corriger le problème rapidement, nous vous transmettrons l’information autrement. Vous pouvez
          aussi nous demander tout contenu du site, y compris nos politiques, dans un autre format.
        </p>
      ),
    },
  ],
};
