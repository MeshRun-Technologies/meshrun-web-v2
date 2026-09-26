// Every string on the page. The copy is the v1 site's, carried over word for
// word; only the presentation is this site's. Change wording here, nowhere else.

export const targets = [
  {
    icon: 'monitor',
    label: 'High-Quality',
    value: 'Smooth 120 FPS at 2K',
    detail: 'Orbit, pan, and zoom without stuttering or low-res blur.',
  },
  {
    icon: 'gauge',
    label: 'Low-Latency',
    value: 'Fast & Responsive (20ms+)',
    detail: 'Low latency across North America & Western Europe.',
  },
  {
    icon: 'cpu',
    label: 'Industry Standard',
    value: 'NVIDIA Workstations',
    detail: 'Powered by industry-leading RTX 4000 GPUs.',
  },
  {
    icon: 'pointer',
    label: 'Full Passthrough',
    value: 'Plug & Play',
    detail: 'Just plug your peripherals in and start designing.',
  },
] as const

export const targetsNote =
  'Performance based on internal testing - real-world speeds depend on your internet connection.'

export const pillars = [
  {
    icon: 'layers',
    title: 'Full Windows Software',
    body: 'Run the real desktop versions of your CAD apps, even on Apple Silicon, without missing features or compatibility bugs.',
  },
  {
    icon: 'cpu',
    title: 'Built for Mac First',
    body: 'Designed from the ground up for macOS, so shortcuts, your trackpad, and window management feel natural.',
  },
  {
    icon: 'drive',
    title: 'Automatic Saves You Can Trust',
    body: "Your work automatically saves back to your computer as you go, so you won't lose your progress even if you disconnect.",
  },
  {
    icon: 'shield',
    title: 'Your Data is Secure',
    body: 'Every session gives you a fresh computer that gets completely wiped the second you leave. No leftover clutter or snooping eyes.',
  },
] as const

/** Each row is the same decision seen twice: what buying costs, what renting returns. */
export const trades = [
  {
    cost: 'Heavy in your bag every single day',
    gain: 'Keep carrying the laptop you actually like',
  },
  {
    cost: "Battery that doesn't make it to lunch",
    gain: 'All-day battery life from the most efficient laptops',
  },
  {
    cost: 'Your fans sound like a plane taking off',
    gain: "Dead silent fans and a laptop that doesn't burn your lap",
  },
  {
    cost: 'Paid for in full, whether you use it or not',
    gain: 'Only pay for the usage you need',
  },
  {
    cost: "Slower every year, and you can't do anything about it",
    gain: 'Fresh cloud GPUs every year without buying new hardware',
  },
]

export const steps = [
  {
    icon: 'terminal',
    step: 'Step 01',
    title: 'Open the app',
    body: 'Launch MeshRun from your Dock. It signs you in and connects to the fastest nearby server automatically.',
  },
  {
    icon: 'layers',
    step: 'Step 02',
    title: 'Pick your project',
    body: 'Select from recently opened projects and the CAD program you want to use.',
  },
  {
    icon: 'server',
    step: 'Step 03',
    title: 'Your cloud PC boots',
    body: 'A dedicated GPU machine starts up just for you, with your chosen folder already open and ready.',
  },
  {
    icon: 'zap',
    step: 'Step 04',
    title: 'Get right to work',
    body: 'Your software opens on screen. When you close the window your session ends and your hours stop ticking.',
  },
] as const

export const yours = [
  {
    icon: 'drive',
    title: 'Your files stay on your laptop',
    body: 'Pick the folders you want and they show up in the session as a normal drive. Nothing has to be uploaded before you can open it.',
  },
  {
    icon: 'lock',
    title: 'The machine is yours alone',
    body: 'Every session gets its own machine, wiped the moment you disconnect. Nobody else has been on it, and nobody else gets it after.',
  },
  {
    icon: 'shield',
    title: 'Use your existing license',
    body: "Sign in with your own Autodesk account, exactly as you do now. We don't resell licences and your subscription doesn't change.",
  },
] as const

export const contact = 'info@meshrun.co'

export const footer = {
  blurb:
    'Full-featured Windows CAD, streamed to the machine you already carry. GPU compute on demand, your licence and your files your own.',
  entity: 'MeshRun Technologies Inc. · Built in Canada 🍁',
  copyright: '© 2026 MeshRun Technologies Inc. All rights reserved.',
  notices: [
    'Autodesk, AutoCAD, and Revit are registered trademarks of Autodesk, Inc. in the USA and other countries. MeshRun Technologies Inc. is an independent software and orchestration platform provider and is not affiliated with, endorsed by, or sponsored by Autodesk, Inc.',
    'NVIDIA and RTX are trademarks of NVIDIA Corporation. Apple, macOS, Metal, and Apple Silicon are trademarks of Apple Inc. 3Dconnexion and SpaceMouse are trademarks of 3Dconnexion. All other trademarks are the property of their respective owners and are referenced for compatibility and interoperability purposes only.',
  ],
}
