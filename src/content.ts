// Every string on the site, in English. content.fr.ts says the same things in
// French and has to have the same shape: change wording here, then there.
// The legal pages are in src/legal/, one file per language.

export const contact = 'info@meshrun.co'

export const nav = {
  /** The bar that drops in once the landing has been scrolled past, and the menu. */
  links: [
    ['Platform', '#platform'],
    ['How it works', '#session'],
    ['Privacy & Compliance', '#privacy'],
    ['Pricing', '#pricing'],
  ],
  cta: 'Request early access',
  /** Where there's less room: the bars at the top. */
  ctaShort: 'Request early access',
  main: 'Main',
  menu: 'Menu',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  skip: 'Skip to content',
  pause: 'Pause animation',
  play: 'Play animation',
  language: 'Language',
}

export const hero = {
  hook: 'CAD on anything',
  line: 'Full-featured Windows CAD on Mac.',
}

export const platform = {
  title: 'Cloud CAD',
  sub: 'Stream full CAD software to any screen, with zero hardware or OS constraints. Macs included.',
}

export const targets = [
  { figure: '120 FPS', caption: 'Ultra-smooth at 1440p' },
  { figure: '20ms', caption: 'Ultra-low latency across NA & EU' },
  { figure: 'RTX 4000', caption: 'Dedicated NVIDIA workstation GPUs' },
  { figure: 'No setup', caption: 'Full 3D mouse & peripheral passthrough' },
]

export const targetsNote = 'Real-world latency and performance depend on region and local network conditions.'

export const experience = {
  title: 'What we deliver',
  sub: 'Not a clunky band-aid solution. Just your apps running cleanly on Mac.',
}

export const pillars = [
  {
    title: 'Native experience',
    body: 'Run the real desktop versions of your CAD apps, even on Apple Silicon, without missing features or compatibility bugs.',
  },
  {
    title: 'Built Mac-first',
    body: 'Designed from the ground up for macOS, so shortcuts, your trackpad and window management feel natural.',
  },
  {
    title: 'Automatic saves',
    body: 'Your work saves back to your computer as you go, so you won’t lose progress even if you disconnect.',
  },
  {
    title: 'Secure data',
    body: 'Every session gives you a fresh computer that’s completely wiped the second you leave. No leftover clutter or snooping eyes.',
  },
]

export const cost = {
  title: 'Rent the power, not the box',
  sub: 'You don’t need to own a workstation. You need power for a few hours a week.',
  compare: 'Compare',
  own: 'Own a workstation',
  rent: 'Rent with meshrun',
}

/** Each row is the same decision seen twice: what buying costs, what renting returns. */
export const trades = [
  {
    cost: 'Tied to a heavy, 6-lb brick of a laptop',
    gain: 'Work from a well-built, lightweight ultrabook',
  },
  {
    cost: 'Dead battery before your lunch break',
    gain: 'All-day battery life',
  },
  {
    cost: 'Jet-engine fans and a burning-hot lap',
    gain: 'Dead-silent fans and zero thermal throttling',
  },
  {
    cost: '$3,000+ for a few hours a week',
    gain: 'Flexible pricing, billed by the minute',
  },
  {
    cost: 'Depreciates and slows down every year',
    gain: 'The latest GPUs, with no upgrade costs',
  },
  {
    cost: 'Hours lost to driver crashes and updates',
    gain: 'A clean, maintained system every session',
  },
]

export const session = {
  title: 'From Dock to design',
  sub: 'Using the cloud has never been smoother.',
  /** "02 of 04". */
  of: 'of',
  /** What the machine is doing at each step, as the app shows it. */
  machine: [
    { label: 'Asleep', detail: 'Not using hours' },
    { label: 'Revit', detail: '~/Projects/tower-B' },
    { label: 'Waking up', detail: 'Mounting your folder' },
    { label: 'Live', detail: 'Hours stop when you close it' },
  ],
}

export const steps = [
  {
    number: '01',
    title: 'Open the app',
    body: 'Launch meshrun from your Dock. It signs you in and connects you to the fastest server automatically.',
  },
  {
    number: '02',
    title: 'Pick a project',
    body: 'Choose a recent project, and meshrun remembers which software to open it in.',
  },
  {
    number: '03',
    title: 'Your PC boots',
    body: 'A dedicated GPU machine starts up just for you, with your files already loaded.',
  },
  {
    number: '04',
    title: 'Get to work',
    body: 'Your project is open and ready. When you end the session, the clock stops.',
  },
]

export const yoursSection = {
  title: 'Your files and licences stay yours',
  sub: 'You don’t need to surrender your files or your licences.',
}

export const yours = [
  {
    title: 'Your files stay on your laptop',
    body: 'Pick the folders you want and they show up in the session as a normal drive. Nothing has to be uploaded before you can open it.',
  },
  {
    title: 'The machine is yours alone',
    body: 'Every session gets its own machine, wiped the moment you disconnect. Nobody else has been on it, and nobody else gets it after.',
  },
  {
    title: 'Use your existing licence',
    body: 'Sign in with your own accounts or licence keys. We don’t resell licences or touch your subscription.',
  },
]

export const pricing = {
  title: 'Pay for what you need',
  sub: 'Plans sized to how you actually work, so you never pay for hours you don’t use. Licences come from your software provider, not us.',
  soon: 'Pricing coming soon',
  note: 'We’re still in development and will post plans when they’re ready.',
}

export const closing = {
  title: 'Choose any device',
  body: 'Carry the laptop you love. Run the software it can’t. meshrun isn’t available yet; tell us how you work and we’ll be in touch.',
}

/** The legal pages, in the footer of every page. Paths are within the language. */
export const legalLinks = [
  ['Privacy policy', '/privacy'],
  ['Cookie policy', '/cookies'],
  ['Terms of use', '/terms'],
  ['Accessibility', '/accessibility'],
]

export const footer = {
  blurb:
    'Full-featured Windows CAD, streamed to any device you want. Bring your own licence and pay only for the time you use.',
  product: 'Product',
  productLinks: [
    ['Platform', '#platform'],
    ['What we deliver', '#experience'],
    ['How it works', '#session'],
    ['Pricing', '#pricing'],
  ],
  legal: 'Legal',
  company: 'Company',
  earlyAccess: 'Early access',
  copyright: '© 2026 MeshRun Technologies Inc. All rights reserved. Proudly built in Canada 🍁',
  notices: [
    'Autodesk is a registered trademark of Autodesk, Inc. in the USA and other countries. SOLIDWORKS is a registered trademark of Dassault Systèmes SolidWorks Corporation. MeshRun Technologies Inc. is an independent software and orchestration platform provider and is not affiliated with, endorsed by, or sponsored by Autodesk, Inc., Dassault Systèmes, or any other software publisher named on this site.',
    'NVIDIA and RTX are trademarks of NVIDIA Corporation. Apple, macOS, Metal, and Apple Silicon are trademarks of Apple Inc. 3Dconnexion and SpaceMouse are trademarks of 3Dconnexion. All other trademarks are the property of their respective owners and are referenced for compatibility and interoperability purposes only.',
  ],
}

/** The early access dialog. Option keys are what's sent to us; only the labels change with the language. */
export const form = {
  title: 'Request early access',
  close: 'Close',
  back: 'Back',
  next: 'Continue',
  skip: 'Skip',
  send: 'Send',
  sending: 'Sending…',
  progress: (at: number, of: number) => `${at} of ${of}`,
  tellMore: 'Tell us more',
  optional: 'optional',

  role: {
    title: 'Who are you?',
    options: {
      Student: { label: 'Student', desc: 'Studying architecture, engineering or design' },
      Maker: { label: 'Maker', desc: 'Personal projects, side work or freelancing' },
      Professional: { label: 'Professional', desc: 'CAD is part of my day job' },
    },
  },
  apps: {
    title: 'Which software do you need to run?',
    hint: 'Pick from the usual suspects, or search for anything else.',
    search: 'Search software',
    placeholder: (count: number) => `Search ${count}+ apps, or type your own`,
    popular: 'Popular software',
    matching: 'Matching software',
    addOwn: 'Add your own',
    add: (name: string) => `Add “${name}”`,
    remove: (name: string) => `Remove ${name}`,
  },
  setup: {
    title: 'Your setup',
    hint: 'So we size the machines and the plans right.',
    machine: 'What do you work on today?',
    hours: 'Heavy CAD in a typical week',
    hourOptions: {
      'Under 5 hours': 'Under 5 hours',
      '5–15 hours': '5–15 hours',
      '15–30 hours': '15–30 hours',
      'More than 30': 'More than 30',
    },
  },
  details: {
    title: 'Where do we reach you?',
    hint: 'We’ll write when there’s a spot for you. Everything here is optional.',
    email: 'Email',
    emailPlaceholder: 'you@example.com',
    emailError: 'That email doesn’t look quite right. Check it for a typo, or leave it blank.',
    name: 'Name',
    company: 'Company',
    university: 'University',
    orgPlaceholder: (kind: 'Company' | 'University') =>
      `Start typing to search ${kind === 'University' ? 'universities' : 'companies'}`,
    orgMatching: (kind: 'Company' | 'University') =>
      `Matching ${kind === 'University' ? 'universities' : 'companies'}`,
    useTyped: (name: string) => `Use “${name}”`,
    addNote: 'Add a note for the team',
    note: 'Note',
    notePlaceholder: 'What would make meshrun a must-have for you?',
    /** Before the link, the link, after it. */
    privacy: [
      'We use your answers to plan what we build, and your email only to write to you about early access. They’re stored with our host in the United States. More in our ',
      'privacy policy',
      '.',
    ],
    newTab: ' (opens in a new tab)',
  },
  done: {
    title: 'Thank you',
    lead: 'That’s really useful.',
    withEmail: (email: string) => `We’ll write to ${email} when there’s a spot for you.`,
    withoutEmail: 'We read every response, and this goes straight into what we build first.',
  },
  errors: {
    failed: `That didn’t go through. Try again, or write to ${contact}.`,
    tooMany: 'You’ve sent a few of these already. Try again in a few minutes.',
    incomplete: 'An answer is missing. Go back a step and fill it in.',
  },
}

/** Around the legal pages. */
export const legalPage = {
  back: 'Back to meshrun',
  updated: 'Last updated',
  contents: 'Contents',
}
