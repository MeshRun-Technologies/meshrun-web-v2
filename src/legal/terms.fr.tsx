import type { LegalDoc } from "../components/LegalPage";
import { localPath } from "../i18n";
import { company, Email } from "./company";
import { MIS_A_JOUR } from "./privacy.fr";

/**
 * Conditions du site et de la liste d’accès anticipé seulement. L’application
 * aura ses propres conditions de service avant toute inscription.
 */
export const terms: LegalDoc = {
  title: "Conditions d’utilisation",
  updated: MIS_A_JOUR,
  summary:
    "Les règles d’utilisation de meshrun.co et de la liste d’accès anticipé. L’application meshrun aura ses propres conditions de service, que vous verrez et accepterez avant de l’utiliser.",
  sections: [
    {
      id: "about",
      heading: "À propos de ces conditions",
      body: (
        <>
          <p>
            Ces conditions constituent une entente entre vous et {company.name} («&nbsp;meshrun&nbsp;»,
            «&nbsp;nous&nbsp;»). Elles s’appliquent lorsque vous utilisez meshrun.co ou demandez un accès anticipé.
            En utilisant le site, vous les acceptez; si vous ne les acceptez pas, veuillez ne pas l’utiliser.
          </p>
          <p>
            Elles ne couvrent pas l’application meshrun. Quand l’application sera prête, elle aura ses propres
            conditions de service, qui en régiront l’utilisation.
          </p>
        </>
      ),
    },
    {
      id: "early-access",
      heading: "Accès anticipé",
      body: (
        <>
          <p>
            Demander un accès anticipé vous inscrit sur une liste. Ce n’est ni une commande, ni une réservation, ni un
            contrat de service, et c’est gratuit. Nous invitons les gens petit à petit, dans un ordre qui convient à ce
            que nous testons, et nous ne pouvons vous garantir ni une place, ni une date, ni des fonctions ou un prix
            en particulier.
          </p>
          <p>
            Vous pouvez quitter la liste quand vous le voulez en écrivant à <Email />. La façon dont nous traitons ce
            que vous nous envoyez est décrite dans notre{" "}
            <a href={localPath("/privacy")}>politique de confidentialité</a>.
          </p>
        </>
      ),
    },
    {
      id: "descriptions",
      heading: "Ce que décrit le site",
      body: (
        <>
          <p>
            meshrun est encore en construction. Le site décrit ce que nous construisons et la façon dont nous
            prévoyons que cela fonctionne. Les fonctions, les logiciels pris en charge, le matériel, les régions et les
            forfaits peuvent changer avant le lancement, et certains pourraient ne pas voir le jour.
          </p>
          <p>
            Les chiffres de performance sur le site proviennent de nos propres tests, dans des conditions précises. Ce
            que vous obtiendrez dépendra de votre connexion Internet, de votre distance de nos serveurs, de votre
            ordinateur et des logiciels que vous utilisez&nbsp;: ce sont des repères, pas des promesses.
          </p>
        </>
      ),
    },
    {
      id: "licences",
      heading: "Vos licences de logiciels",
      body: (
        <p>
          meshrun ne vend pas et n’inclut pas de licences pour les logiciels que vous utilisez avec elle. Il vous
          incombe de détenir des licences valides pour ces logiciels et de les utiliser comme le permettent les
          conditions de leur éditeur. Les noms de logiciels et de matériel mentionnés sur ce site appartiennent à leurs
          propriétaires et ne servent qu’à indiquer avec quoi meshrun fonctionne; leurs propriétaires n’approuvent ni
          ne commanditent meshrun.
        </p>
      ),
    },
    {
      id: "use",
      heading: "Utilisation du site",
      body: (
        <>
          <p>Vous acceptez d’utiliser le site légalement et de bonne foi et, notamment, de ne pas&nbsp;:</p>
          <ul>
            <li>vous y introduire, le surcharger ou le perturber, ou y chercher des failles sans notre permission;</li>
            <li>envoyer le formulaire de façon automatisée, en masse, ou au nom de quelqu’un sans sa permission;</li>
            <li>envoyer quoi que ce soit d’illégal, d’abusif ou que vous n’avez pas le droit de communiquer;</li>
            <li>
              copier ou extraire le contenu du site pour le republier, ou pour entraîner des modèles d’apprentissage
              automatique.
            </li>
          </ul>
          <p>
            Si vous trouvez un problème de sécurité, signalez-le plutôt à <Email />. Nous vous en remercierons, et nous
            n’entreprendrons aucune action contre une recherche de bonne foi qui respecte la vie privée des gens et ne
            perturbe pas le site.
          </p>
        </>
      ),
    },
    {
      id: "feedback",
      heading: "Les idées que vous nous envoyez",
      body: (
        <p>
          Nous lisons chaque note et chaque suggestion. Si vous nous en envoyez une, vous acceptez que nous l’utilisions
          pour améliorer meshrun sans rien vous devoir en retour. Nous ne publierons ni votre nom ni vos propos sans
          vous le demander.
        </p>
      ),
    },
    {
      id: "ip",
      heading: "Notre contenu",
      body: (
        <p>
          Le site, son design, le nom et le logo meshrun, le rendu 3D et les textes nous appartiennent ou nous sont
          concédés sous licence, et sont protégés par les lois sur le droit d’auteur et les marques de commerce. Vous
          pouvez faire un lien vers le site et le citer équitablement, par exemple dans une critique. Autrement, vous ne
          pouvez pas les copier ni les réutiliser sans notre permission écrite.
        </p>
      ),
    },
    {
      id: "links",
      heading: "Liens vers d’autres sites",
      body: (
        <p>
          Si nous faisons un lien vers un autre site, c’est pour votre commodité. Nous ne contrôlons pas ces sites et
          n’en sommes pas responsables.
        </p>
      ),
    },
    {
      id: "liability",
      heading: "Garanties et responsabilité",
      body: (
        <>
          <p>
            Nous travaillons à garder le site exact et accessible, mais nous le fournissons «&nbsp;tel quel&nbsp;», sans
            garantie qu’il sera toujours disponible, exempt d’erreurs ou complet.
          </p>
          <p>
            Dans la mesure permise par la loi, nous ne sommes pas responsables des pertes indirectes ou consécutives
            découlant de votre utilisation du site, et notre responsabilité totale envers vous à cet égard est limitée à
            100&nbsp;$&nbsp;CA. Le site est gratuit et nous n’y vendons rien, ce qui explique ces limites.
          </p>
          <p>
            Rien de ceci ne limite un droit que la loi ne nous permet pas de limiter, y compris vos droits de
            consommateur là où vous vivez, ni notre responsabilité en cas de fraude ou de préjudice causé
            intentionnellement ou par faute lourde.
          </p>
        </>
      ),
    },
    {
      id: "law",
      heading: "Droit applicable et litiges",
      body: (
        <p>
          Ces conditions sont régies par les lois de la Colombie-Britannique et les lois fédérales du Canada qui s’y
          appliquent. En cas de désaccord, écrivez-nous d’abord et nous tenterons de trouver une solution. À défaut, les
          tribunaux de la Colombie-Britannique sont compétents, bien que, si vous êtes un consommateur, vous puissiez
          aussi intenter un recours là où vous vivez.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Modifications",
      body: (
        <p>
          Nous pouvons mettre ces conditions à jour à mesure que le site évolue. Nous changerons alors la date en haut
          de la page, et la version en vigueur au moment où vous utilisez le site est celle qui s’applique.
        </p>
      ),
    },
    {
      id: "contact",
      heading: "Nous joindre",
      body: (
        <p>
          Vos questions sur ces conditions peuvent être adressées à {company.name} à <Email />.
        </p>
      ),
    },
  ],
};
