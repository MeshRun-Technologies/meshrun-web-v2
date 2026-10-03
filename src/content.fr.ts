// Every string on the site, in Canadian French: the same shape as content.ts,
// which is the source. Office québécois de la langue française usage: CAO for
// CAD, courriel, témoins; a non-breaking space ( ) before a colon and
// inside « », none before ? or !.

import type * as en from './content'
import type { Widen } from './i18n'

type Same<T> = Widen<T>

export const contact: Same<typeof en.contact> = 'info@meshrun.co'

export const nav: Same<typeof en.nav> = {
  links: [
    ['Plateforme', '#platform'],
    ['Fonctionnement', '#session'],
    ['Confidentialité et conformité', '#privacy'],
    ['Tarifs', '#pricing'],
  ],
  cta: 'Demander un accès anticipé',
  ctaShort: 'Accès anticipé',
  main: 'Principale',
  menu: 'Menu',
  openMenu: 'Ouvrir le menu',
  closeMenu: 'Fermer le menu',
  skip: 'Passer au contenu',
  pause: 'Mettre l’animation en pause',
  play: 'Relancer l’animation',
  language: 'Langue',
}

export const hero: Same<typeof en.hero> = {
  hook: 'La CAO partout',
  line: 'La CAO Windows complète, sur Mac.',
}

export const platform: Same<typeof en.platform> = {
  title: 'La CAO dans le nuage',
  sub: 'Diffusez vos logiciels de CAO complets sur n’importe quel écran, sans contrainte de matériel ni de système d’exploitation. Mac compris.',
}

export const targets: Same<typeof en.targets> = [
  { figure: '120 IPS', caption: 'Ultrafluide en 1440p' },
  { figure: '20 ms', caption: 'Latence ultrafaible en Amérique du Nord et en Europe' },
  { figure: 'RTX 4000', caption: 'Processeurs graphiques NVIDIA dédiés' },
  { figure: 'Branchez', caption: 'Souris 3D et périphériques reconnus directement' },
]

export const targetsNote: Same<typeof en.targetsNote> =
  'La latence et les performances réelles dépendent de la région et du réseau local.'

export const experience: Same<typeof en.experience> = {
  title: 'Ce que nous offrons',
  sub: 'Pas une solution de fortune. Simplement vos logiciels qui tournent proprement sur Mac.',
}

export const pillars: Same<typeof en.pillars> = [
  {
    title: 'Expérience native',
    body: 'Utilisez les vraies versions de bureau de vos logiciels de CAO, même sur Apple Silicon, sans fonctions manquantes ni bogues de compatibilité.',
  },
  {
    title: 'Pensé d’abord pour Mac',
    body: 'Conçu de A à Z pour macOS : les raccourcis, le pavé tactile et la gestion des fenêtres se comportent naturellement.',
  },
  {
    title: 'Enregistrement automatique',
    body: 'Votre travail s’enregistre sur votre ordinateur au fur et à mesure. Vous ne perdez rien, même si la connexion coupe.',
  },
  {
    title: 'Données protégées',
    body: 'Chaque session vous donne un ordinateur neuf, entièrement effacé dès que vous partez. Aucun résidu, aucun regard indiscret.',
  },
]

export const cost: Same<typeof en.cost> = {
  title: 'Louez la puissance, pas la machine',
  sub: 'Pas besoin de posséder une station de travail. Il vous faut de la puissance quelques heures par semaine.',
  compare: 'Comparer',
  own: 'Posséder une station',
  rent: 'Louer avec meshrun',
}

export const trades: Same<typeof en.trades> = [
  {
    cost: 'Coincé avec un portable de 3 kg',
    gain: 'Travaillez sur un ultraportable léger et bien construit',
  },
  {
    cost: 'Batterie à plat avant le dîner',
    gain: 'Une autonomie d’une journée complète',
  },
  {
    cost: 'Ventilateurs de réacté et cuisses brûlantes',
    gain: 'Ventilateurs silencieux, aucun bridage thermique',
  },
  {
    cost: '3 000 $ et plus pour quelques heures par semaine',
    gain: 'Tarification souple, facturée à la minute',
  },
  {
    cost: 'Se déprécie et ralentit chaque année',
    gain: 'Les derniers processeurs graphiques, sans frais de mise à niveau',
  },
  {
    cost: 'Des heures perdues en pilotes qui plantent et en mises à jour',
    gain: 'Un système propre et entretenu à chaque session',
  },
]

export const session: Same<typeof en.session> = {
  title: 'Du Dock au design',
  sub: 'Le nuage n’a jamais été aussi fluide.',
  of: 'sur',
  machine: [
    { label: 'En veille', detail: 'Aucune heure utilisée' },
    { label: 'Revit', detail: '~/Projets/tour-B' },
    { label: 'Réveil', detail: 'Montage de votre dossier' },
    { label: 'En ligne', detail: 'Les heures s’arrêtent à la fermeture' },
  ],
}

export const steps: Same<typeof en.steps> = [
  {
    number: '01',
    title: 'Ouvrez l’app',
    body: 'Lancez meshrun depuis le Dock. L’app vous connecte et vous relie automatiquement au serveur le plus rapide.',
  },
  {
    number: '02',
    title: 'Choisissez un projet',
    body: 'Choisissez un projet récent : meshrun se souvient du logiciel avec lequel l’ouvrir.',
  },
  {
    number: '03',
    title: 'Votre PC démarre',
    body: 'Une machine à processeur graphique dédié démarre juste pour vous, vos fichiers déjà chargés.',
  },
  {
    number: '04',
    title: 'Au travail',
    body: 'Votre projet est ouvert et prêt. Quand vous terminez la session, le compteur s’arrête.',
  },
]

export const yoursSection: Same<typeof en.yoursSection> = {
  title: 'Vos fichiers et vos licences restent à vous',
  sub: 'Pas besoin de céder vos fichiers ni vos licences.',
}

export const yours: Same<typeof en.yours> = [
  {
    title: 'Vos fichiers restent sur votre portable',
    body: 'Choisissez vos dossiers : ils apparaissent dans la session comme un lecteur ordinaire. Rien à téléverser avant de les ouvrir.',
  },
  {
    title: 'Une machine rien qu’à vous',
    body: 'Chaque session a sa propre machine, effacée dès que vous vous déconnectez. Personne ne l’a utilisée avant vous, et personne ne l’aura après.',
  },
  {
    title: 'Gardez votre licence',
    body: 'Connectez-vous avec vos propres comptes ou clés de licence. Nous ne revendons pas de licences et ne touchons pas à votre abonnement.',
  },
]

export const pricing: Same<typeof en.pricing> = {
  title: 'Payez ce dont vous avez besoin',
  sub: 'Des forfaits adaptés à votre façon de travailler, pour ne jamais payer d’heures inutilisées. Les licences viennent de votre fournisseur de logiciels, pas de nous.',
  soon: 'Tarifs à venir',
  note: 'Nous sommes encore en développement et publierons nos forfaits dès qu’ils seront prêts.',
}

export const closing: Same<typeof en.closing> = {
  title: 'Choisissez votre appareil',
  body: 'Gardez le portable que vous aimez. Faites tourner les logiciels qu’il ne peut pas exécuter. meshrun n’est pas encore offert : dites-nous comment vous travaillez et nous vous écrirons.',
}

export const legalLinks: Same<typeof en.legalLinks> = [
  ['Politique de confidentialité', '/privacy'],
  ['Politique relative aux témoins', '/cookies'],
  ['Conditions d’utilisation', '/terms'],
  ['Accessibilité', '/accessibility'],
]

export const footer: Same<typeof en.footer> = {
  blurb:
    'La CAO Windows complète, diffusée sur l’appareil de votre choix. Apportez votre licence et ne payez que le temps utilisé.',
  product: 'Produit',
  productLinks: [
    ['Plateforme', '#platform'],
    ['Ce que nous offrons', '#experience'],
    ['Fonctionnement', '#session'],
    ['Tarifs', '#pricing'],
  ],
  legal: 'Juridique',
  company: 'Entreprise',
  earlyAccess: 'Accès anticipé',
  copyright: '© 2026 MeshRun Technologies Inc. Tous droits réservés. Fièrement conçu au Canada 🍁',
  notices: [
    'Autodesk est une marque déposée d’Autodesk, Inc. aux États-Unis et dans d’autres pays. SOLIDWORKS est une marque déposée de Dassault Systèmes SolidWorks Corporation. MeshRun Technologies Inc. est un fournisseur indépendant de logiciels et de plateforme d’orchestration; elle n’est ni affiliée à Autodesk, Inc., à Dassault Systèmes ou à tout autre éditeur de logiciels nommé sur ce site, ni approuvée ou commanditée par eux.',
    'NVIDIA et RTX sont des marques de commerce de NVIDIA Corporation. Apple, macOS, Metal et Apple Silicon sont des marques de commerce d’Apple Inc. 3Dconnexion et SpaceMouse sont des marques de commerce de 3Dconnexion. Toutes les autres marques appartiennent à leurs propriétaires respectifs et ne sont mentionnées qu’à des fins de compatibilité et d’interopérabilité.',
  ],
}

export const form: Same<typeof en.form> = {
  title: 'Demander un accès anticipé',
  close: 'Fermer',
  back: 'Retour',
  next: 'Continuer',
  skip: 'Passer',
  send: 'Envoyer',
  sending: 'Envoi…',
  progress: (at: number, of: number) => `${at} sur ${of}`,
  tellMore: 'Dites-nous-en plus',
  optional: 'facultatif',

  role: {
    title: 'Qui êtes-vous?',
    options: {
      Student: { label: 'Aux études', desc: 'En architecture, en génie ou en design' },
      Maker: { label: 'Projets personnels', desc: 'Projets perso, à-côtés ou travail autonome' },
      Professional: { label: 'Usage professionnel', desc: 'La CAO fait partie de mon travail' },
    },
  },
  apps: {
    title: 'Quels logiciels devez-vous utiliser?',
    hint: 'Choisissez parmi les incontournables, ou cherchez-en un autre.',
    search: 'Chercher un logiciel',
    placeholder: (count: number) => `Chercher parmi ${count} logiciels et plus, ou saisir le vôtre`,
    popular: 'Logiciels populaires',
    matching: 'Logiciels correspondants',
    addOwn: 'Ajouter le vôtre',
    add: (name: string) => `Ajouter « ${name} »`,
    remove: (name: string) => `Retirer ${name}`,
  },
  setup: {
    title: 'Votre configuration',
    hint: 'Pour bien dimensionner les machines et les forfaits.',
    machine: 'Sur quoi travaillez-vous aujourd’hui?',
    hours: 'CAO exigeante dans une semaine typique',
    hourOptions: {
      'Under 5 hours': 'Moins de 5 heures',
      '5–15 hours': '5 à 15 heures',
      '15–30 hours': '15 à 30 heures',
      'More than 30': 'Plus de 30',
    },
  },
  details: {
    title: 'Où pouvons-nous vous joindre?',
    hint: 'Nous vous écrirons quand une place se libérera. Tous les champs sont facultatifs.',
    email: 'Courriel',
    emailPlaceholder: 'vous@exemple.com',
    emailError: 'Ce courriel ne semble pas tout à fait correct. Vérifiez-le ou laissez le champ vide.',
    name: 'Nom',
    company: 'Entreprise',
    university: 'Université',
    orgPlaceholder: (kind: 'Company' | 'University') =>
      `Commencez à taper pour chercher ${kind === 'University' ? 'une université' : 'une entreprise'}`,
    orgMatching: (kind: 'Company' | 'University') =>
      kind === 'University' ? 'Universités correspondantes' : 'Entreprises correspondantes',
    useTyped: (name: string) => `Utiliser « ${name} »`,
    addNote: 'Ajouter une note pour l’équipe',
    note: 'Note',
    notePlaceholder: 'Qu’est-ce qui rendrait meshrun indispensable pour vous?',
    privacy: [
      'Nous utilisons vos réponses pour planifier ce que nous construisons, et votre courriel uniquement pour vous écrire au sujet de l’accès anticipé. Elles sont conservées chez notre hébergeur, aux États-Unis. Pour en savoir plus, consultez notre ',
      'politique de confidentialité',
      '.',
    ],
    newTab: ' (s’ouvre dans un nouvel onglet)',
  },
  done: {
    title: 'Merci',
    lead: 'C’est très utile.',
    withEmail: (email: string) => `Nous écrirons à ${email} quand une place se libérera.`,
    withoutEmail: 'Nous lisons chaque réponse, et elles orientent directement nos priorités.',
  },
  errors: {
    failed: `L’envoi n’a pas fonctionné. Réessayez, ou écrivez-nous à ${contact}.`,
    tooMany: 'Vous en avez déjà envoyé quelques-unes. Réessayez dans quelques minutes.',
    incomplete: 'Il manque une réponse. Revenez à l’étape précédente pour la compléter.',
  },
}

export const legalPage: Same<typeof en.legalPage> = {
  back: 'Retour à meshrun',
  updated: 'Dernière mise à jour :',
  contents: 'Sommaire',
}
