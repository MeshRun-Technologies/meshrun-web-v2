import type { LegalDoc } from "../components/LegalPage";
import { Email } from "./company";
import { MIS_A_JOUR } from "./privacy.fr";

export const cookies: LegalDoc = {
  title: "Politique relative aux témoins",
  updated: MIS_A_JOUR,
  summary:
    "meshrun.co n’utilise aucun témoin (cookie). Voici exactement ce que le site garde dans votre navigateur : un seul réglage, et seulement si vous le demandez.",
  sections: [
    {
      id: "none",
      heading: "Aucun témoin",
      body: (
        <p>
          Les témoins sont de petits fichiers qu’un site demande à votre navigateur de garder, souvent pour que lui, ou
          une entreprise avec laquelle il travaille, puisse vous reconnaître plus tard. Ce site n’en dépose aucun. Il
          n’exécute aucun script d’analyse, de publicité, de réseaux sociaux ou de pistage, et ne charge rien d’autres
          entreprises&nbsp;: nos polices et notre code viennent de notre propre domaine. Il n’y a donc rien à accepter,
          et aucune bannière.
        </p>
      ),
    },
    {
      id: "storage",
      heading: "La seule chose que nous gardons dans votre navigateur",
      body: (
        <>
          <p>
            Si vous appuyez sur <strong>Mettre l’animation en pause</strong>, le site retient ce choix dans le stockage
            local de votre navigateur, pour que le rendu 3D reste immobile à votre prochaine visite.
          </p>
          <div className="table">
            <table>
              <thead>
                <tr>
                  <th scope="col">Nom</th>
                  <th scope="col">Contenu</th>
                  <th scope="col">Raison</th>
                  <th scope="col">Durée</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <code>meshrun:motion</code>
                  </td>
                  <td>Le mot «&nbsp;paused&nbsp;»</td>
                  <td>Garder l’animation en pause, parce que vous l’avez demandé</td>
                  <td>Jusqu’à ce que vous relanciez l’animation ou effaciez les données du site</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p>
            Il ne quitte jamais votre appareil&nbsp;: il n’est envoyé ni à nous ni à personne d’autre, et il ne permet
            pas de vous identifier. Comme il ne sert qu’à faire ce que vous avez demandé, la loi ne nous oblige pas à
            vous demander la permission.
          </p>
        </>
      ),
    },
    {
      id: "host",
      heading: "Notre hébergeur",
      body: (
        <p>
          Le site est hébergé par Vercel. Si les systèmes de sécurité de Vercel soupçonnent un jour votre navigateur
          d’être automatisé, ils peuvent afficher une vérification et déposer un témoin de courte durée pour se
          souvenir que vous l’avez réussie. Ce témoin est strictement nécessaire à la protection du site, ne sert à
          rien d’autre et n’apparaît pas lors des visites ordinaires.
        </p>
      ),
    },
    {
      id: "control",
      heading: "Garder le contrôle",
      body: (
        <p>
          Tous les navigateurs permettent de voir, de bloquer et de supprimer les témoins et les données des sites,
          généralement dans Paramètres, puis Confidentialité. Les bloquer ne brise rien ici&nbsp;: l’animation ne se
          souviendra simplement pas d’avoir été mise en pause.
        </p>
      ),
    },
    {
      id: "changes",
      heading: "Si cela change",
      body: (
        <p>
          Si nous voulons un jour utiliser des témoins ou une technologie semblable pour autre chose que le strict
          nécessaire, comme l’analyse d’audience, nous vous le demanderons d’abord, avant de déposer quoi que ce soit,
          et nous mettrons cette page à jour. Vos questions à <Email />.
        </p>
      ),
    },
  ],
};
