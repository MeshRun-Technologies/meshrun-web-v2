import type { LegalDoc } from "../components/LegalPage";
import { localPath } from "../i18n";
import { company, Email } from "./company";

export const MIS_A_JOUR = "3 octobre 2026";

export const privacy: LegalDoc = {
  title: "Politique de confidentialité",
  updated: MIS_A_JOUR,
  summary:
    "Ce que nous recueillons quand vous visitez meshrun.co ou demandez un accès anticipé, ce que nous en faisons, et comment le faire corriger ou supprimer. En bref : aucun témoin, aucun pistage, aucune publicité, et nous ne vendons jamais vos renseignements.",
  sections: [
    {
      id: "who",
      heading: "Qui nous sommes",
      body: (
        <>
          <p>
            meshrun est conçu par {company.name}, une société constituée en Colombie-Britannique, au Canada. Dans
            cette politique, «&nbsp;nous&nbsp;» désigne {company.name}. C’est nous qui décidons de l’utilisation
            des renseignements décrits ici&nbsp;: nous en sommes donc responsables.
          </p>
          <p>
            Cette politique couvre le site meshrun.co et la liste d’accès anticipé. Elle ne couvre pas l’application
            meshrun, qui n’est pas encore offerte. Avant son lancement, nous mettrons cette politique à jour pour
            couvrir les comptes, les sessions, les fichiers et la facturation.
          </p>
        </>
      ),
    },
    {
      id: "glance",
      heading: "En un coup d’œil",
      body: (
        <ul>
          <li>Le site ne dépose aucun témoin et n’exécute aucun script d’analyse, de publicité ou de pistage.</li>
          <li>
            Les seuls renseignements personnels que nous recueillons sont ceux que vous saisissez dans le formulaire
            d’accès anticipé ou que vous nous envoyez par courriel.
          </li>
          <li>Ils sont conservés de façon privée chez notre hébergeur, Vercel, aux États-Unis.</li>
          <li>Nous nous en servons pour planifier ce que nous construisons et pour vous écrire au sujet de l’accès anticipé. Rien d’autre.</li>
          <li>Nous ne les vendons pas, ne les louons pas et ne les communiquons pas à des fins publicitaires.</li>
          <li>Vous pouvez demander à les consulter, à les corriger ou à les supprimer en tout temps.</li>
        </ul>
      ),
    },
    {
      id: "collect",
      heading: "Ce que nous recueillons",
      body: (
        <>
          <h3>Quand vous demandez un accès anticipé</h3>
          <p>Le formulaire vous demande&nbsp;:</p>
          <ul>
            <li>si vous êtes aux études, si vous faites des projets personnels ou si vous l’utilisez au travail;</li>
            <li>quels logiciels vous devez utiliser;</li>
            <li>sur quel ordinateur vous travaillez aujourd’hui, et combien d’heures par semaine environ vous consacrez à la CAO exigeante.</li>
          </ul>
          <p>Et, seulement si vous choisissez de les fournir&nbsp;:</p>
          <ul>
            <li>votre adresse courriel et votre nom;</li>
            <li>votre entreprise ou votre université;</li>
            <li>une note pour l’équipe.</li>
          </ul>
          <p>
            Avec vos réponses, nous conservons l’heure de leur envoi et l’adresse de la page d’où vous les avez
            envoyées. Veuillez ne pas inscrire de renseignements sensibles (sur votre santé, vos finances ou une pièce
            d’identité, par exemple) dans la note&nbsp;: nous n’en avons pas besoin.
          </p>

          <h3>Quand vous nous écrivez</h3>
          <p>Votre adresse courriel, votre nom si vous l’indiquez, et le contenu de votre message.</p>

          <h3>Quand vous visitez le site</h3>
          <p>
            Comme tout site Web, le nôtre ne peut joindre votre navigateur sans son adresse (votre adresse IP). Notre
            hébergeur, Vercel, la traite avec le type de votre navigateur et la page demandée pour vous servir le site
            et le protéger contre les abus, et conserve brièvement des journaux de ces requêtes. Notre formulaire garde
            aussi votre adresse IP en mémoire pendant une dizaine de minutes pour empêcher une même personne de l’envoyer
            à répétition; elle n’est pas enregistrée avec vos réponses.
          </p>
          <p>
            Nous n’utilisons ni témoins, ni pixels, ni prise d’empreinte, ni outil d’analyse tiers, et le site ne
            charge aucun contenu d’autres entreprises&nbsp;: nos polices et notre code sont servis depuis notre propre
            domaine. Voir notre <a href={localPath("/cookies")}>politique relative aux témoins</a>.
          </p>
        </>
      ),
    },
    {
      id: "use",
      heading: "Comment nous les utilisons",
      body: (
        <>
          <p>Nous utilisons ce que vous nous transmettez pour&nbsp;:</p>
          <ul>
            <li>
              <strong>Vous répondre au sujet de l’accès anticipé</strong>&nbsp;: vous inviter quand une place se
              libère, et répondre à vos questions.
            </li>
            <li>
              <strong>Planifier ce que nous construisons</strong>&nbsp;: quels logiciels prendre en charge d’abord,
              quelles machines offrir et à quel prix. Nous analysons les réponses ensemble, de façon globale.
            </li>
            <li>
              <strong>Assurer le bon fonctionnement et la sécurité du site</strong>&nbsp;: contrer les pourriels et
              les abus.
            </li>
            <li>
              <strong>Respecter nos obligations légales</strong>, lorsqu’une loi nous oblige à conserver ou à
              communiquer un renseignement.
            </li>
          </ul>
          <p>
            Nous ne vous inscrirons à aucune infolettre et ne vous enverrons aucun message promotionnel sans votre
            consentement distinct, et chacun de ces messages vous indiquera comment vous désabonner. Nous ne prenons
            aucune décision automatisée à votre sujet et n’utilisons pas vos renseignements pour établir des profils
            publicitaires.
          </p>

          <h3>Consentement et fondements juridiques</h3>
          <p>
            Au Canada, où s’appliquent la Loi sur la protection des renseignements personnels et les documents
            électroniques et la Personal Information Protection Act de la Colombie-Britannique, nous nous fondons sur
            votre consentement&nbsp;: en envoyant le formulaire, vous acceptez les utilisations décrites ci-dessus. Vous
            pouvez le retirer en tout temps en écrivant à <Email />, et nous supprimerons ce que vous nous avez envoyé.
          </p>
          <p>
            Si vous vous trouvez dans l’Espace économique européen ou au Royaume-Uni, le RGPD nous demande d’indiquer
            un fondement juridique pour chaque utilisation. Vous répondre au sujet de l’accès anticipé est une mesure
            prise à votre demande avant tout contrat (article&nbsp;6(1)(b)). Planifier le produit et protéger le site
            relèvent de nos intérêts légitimes (article&nbsp;6(1)(f)), que nous avons mis en balance avec les vôtres&nbsp;:
            nous recueillons peu, gardons tout confidentiel et n’en faisons rien d’inattendu. Conserver les documents
            exigés par la loi est une obligation légale (article&nbsp;6(1)(c)). Fournir votre courriel, votre nom ou
            votre organisation est facultatif; sans courriel, nous ne pouvons simplement pas vous écrire.
          </p>
        </>
      ),
    },
    {
      id: "share",
      heading: "Avec qui nous les partageons",
      body: (
        <>
          <p>Uniquement avec les personnes et entreprises qui nous aident à faire fonctionner meshrun, et seulement ce dont elles ont besoin&nbsp;:</p>
          <ul>
            <li>
              <strong>Vercel Inc.</strong> héberge le site et conserve les demandes d’accès anticipé pour notre
              compte, dans sa région de Washington (États-Unis). Elle agit selon nos instructions et ne peut pas
              utiliser vos renseignements à ses propres fins.
            </li>
            <li>
              <strong>Notre fournisseur de courriel</strong> achemine les courriels que vous nous envoyez ou que nous
              vous envoyons.
            </li>
            <li>
              <strong>Nos conseillers professionnels</strong>, comme des avocats et des comptables, lorsque nous avons
              besoin de leurs conseils.
            </li>
          </ul>
          <p>
            Nous communiquerons aussi des renseignements si la loi l’exige, par exemple en vertu d’une ordonnance
            judiciaire valide. Si meshrun était vendue ou fusionnée, les renseignements passeraient au nouveau
            propriétaire aux mêmes conditions, et nous vous en avertirions d’abord. Nous ne vendons jamais de
            renseignements personnels.
          </p>
        </>
      ),
    },
    {
      id: "transfers",
      heading: "Où ils sont conservés",
      body: (
        <>
          <p>
            Nous sommes au Canada et notre hébergeur conserve les demandes d’accès anticipé aux États-Unis. Pendant
            qu’ils s’y trouvent, vos renseignements sont protégés par notre contrat avec Vercel, et ils peuvent être
            accessibles aux tribunaux, aux forces de l’ordre et aux autorités de sécurité nationale des États-Unis en
            vertu des lois américaines.
          </p>
          <p>
            Si vous vous trouvez dans l’EEE ou au Royaume-Uni, la Commission européenne reconnaît que le Canada assure
            une protection adéquate aux renseignements personnels traités par les entreprises. Pour le transfert
            ultérieur vers les États-Unis, nous nous appuyons sur les garanties de notre entente de traitement des
            données avec Vercel, notamment les clauses contractuelles types de la Commission européenne et leur
            addenda pour le Royaume-Uni. Écrivez-nous pour obtenir une copie des modalités pertinentes.
          </p>
        </>
      ),
    },
    {
      id: "retention",
      heading: "Combien de temps nous les gardons",
      body: (
        <ul>
          <li>
            <strong>Demandes d’accès anticipé</strong>&nbsp;: jusqu’à ce que nous vous ayons invité et que vous vous
            soyez inscrit ou nous ayez dit que cela ne vous intéresse pas, et jamais plus de 24&nbsp;mois après l’envoi
            du formulaire. Ensuite, nous les supprimons, ou ne gardons que des totaux qui ne permettent pas de vous
            identifier («&nbsp;40&nbsp;% des demandes mentionnent Revit&nbsp;»).
          </li>
          <li>
            <strong>Courriels</strong>&nbsp;: aussi longtemps que la conversation l’exige, et au plus 24&nbsp;mois après
            sa fin, sauf si la loi exige plus longtemps.
          </li>
          <li>
            <strong>Journaux du serveur</strong>&nbsp;: conservés brièvement par Vercel selon ses propres paramètres,
            puis supprimés.
          </li>
        </ul>
      ),
    },
    {
      id: "security",
      heading: "Comment nous les protégeons",
      body: (
        <>
          <p>
            Tout ce qui circule entre votre navigateur et nous est chiffré (HTTPS, imposé à chaque visite). Les demandes
            d’accès anticipé sont conservées dans un espace privé inaccessible depuis le Web, chiffré au repos par notre
            hébergeur, et seules les personnes de meshrun qui en ont besoin peuvent les lire.
          </p>
          <p>
            Aucun système n’est parfaitement sûr. Si un incident de confidentialité mettait réellement vos
            renseignements en danger, nous vous en aviserions, ainsi que les autorités concernées, comme la loi l’exige.
          </p>
        </>
      ),
    },
    {
      id: "rights",
      heading: "Vos droits",
      body: (
        <>
          <p>Où que vous soyez, vous pouvez nous demander&nbsp;:</p>
          <ul>
            <li>de vous dire quels renseignements nous détenons à votre sujet, et de vous en remettre une copie;</li>
            <li>de corriger ce qui est inexact;</li>
            <li>de les supprimer;</li>
            <li>de cesser de les utiliser, ou retirer votre consentement.</li>
          </ul>
          <p>
            Dans l’EEE et au Royaume-Uni, vous pouvez aussi vous opposer à leur utilisation, en demander la limitation
            et les obtenir dans un format portable. Écrivez à <Email /> depuis l’adresse que vous nous avez donnée (ou
            indiquez-nous laquelle). Nous pourrions vous demander de confirmer votre identité, et nous vous répondrons
            dans les 30&nbsp;jours. C’est gratuit.
          </p>
          <p>
            Si notre réponse ne vous satisfait pas, vous pouvez porter plainte auprès du Commissariat à la protection
            de la vie privée du Canada (priv.gc.ca), de l’organisme de votre province (au Québec, la Commission d’accès
            à l’information; en Colombie-Britannique ou en Alberta, le commissaire à l’information et à la protection
            de la vie privée) ou, dans l’EEE ou au Royaume-Uni, de votre autorité locale de protection des données ou
            de l’Information Commissioner’s Office (ico.org.uk). Nous aimerions toutefois avoir d’abord l’occasion de
            corriger la situation.
          </p>
        </>
      ),
    },
    {
      id: "children",
      heading: "Enfants",
      body: (
        <p>
          meshrun s’adresse aux étudiants universitaires et aux professionnels. Le site n’est pas destiné aux personnes
          de moins de 16&nbsp;ans, et nous ne recueillons pas sciemment leurs renseignements. Si vous croyez qu’un enfant
          nous a envoyé le formulaire, écrivez-nous et nous le supprimerons.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Modifications de cette politique",
      body: (
        <p>
          Quand nous modifions cette politique, nous mettons à jour la date en haut de la page. Si un changement touche
          des renseignements que vous nous avez déjà fournis d’une façon à laquelle vous ne vous attendriez pas, nous
          vous écrirons avant son entrée en vigueur, si nous avons votre adresse.
        </p>
      ),
    },
    {
      id: "contact",
      heading: "Nous joindre",
      body: (
        <p>
          Notre responsable de la protection des renseignements personnels veille à la façon dont nous traitons les
          renseignements personnels et répond à vos demandes. Écrivez-lui à <Email />.
        </p>
      ),
    },
  ],
};
