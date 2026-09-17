// Every string on the page. Bracketed values are facts not yet decided; see
// PRODUCT.md in the app repo. Fill them in here, nowhere else.

export const cad = [
  'SolidWorks',
  'Inventor',
  'Fusion 360',
  'CATIA',
  'Creo',
  'NX',
  'Rhino',
  'Ansys',
  'Revit',
  'AutoCAD',
]

export const claims = [
  {
    icon: 'cube',
    title: 'CAD-specific, not a bare machine',
    body: 'Workstations arrive with the CAD stack installed, licensed and GPU-tuned. You never touch Windows, drivers or a licence server.',
  },
  {
    icon: 'stop',
    title: 'Stops costing money when you close it',
    body: 'Per-second billing with an aggressive auto-stop. The disk persists, the GPU does not. Idle is free.',
  },
  {
    icon: 'mac',
    title: 'A real Mac application',
    body: 'Not a browser tab. Native window, native shortcuts, follows your appearance, and your machines are where you left them.',
  },
] as const

export const steps = [
  {
    title: 'Sign in',
    body: 'Open meshrun on your Mac. No cloud console, no vocabulary to learn.',
  },
  {
    title: 'Pick a workstation',
    body: 'Choose a tier for the work: drafting, assemblies or simulation. It boots in the region nearest you.',
  },
  {
    title: 'Stream it to your Mac',
    body: 'Your CAD package opens in a window at your display’s resolution. Close the lid and the meter stops.',
  },
]

export const tiers = [
  {
    name: 'Drafting',
    gpu: 'RTX 4000 class',
    spec: '8 vCPU · 32 GB',
    price: '[$— / GPU-hr]',
    fit: 'Parts, drawings and small assemblies.',
    bullets: ['Per-second billing', 'Auto-stop when idle', 'Persistent disk', 'One region'],
    cta: 'Request a demo',
    featured: false,
  },
  {
    name: 'Assembly',
    gpu: 'A4000 class',
    spec: '16 vCPU · 64 GB',
    price: '[$— / GPU-hr]',
    fit: 'Large assemblies, rendering and light simulation.',
    bullets: ['Everything in Drafting', 'More CPU and RAM per session', 'Priority boot', 'Choice of region'],
    cta: 'Request a demo',
    featured: true,
  },
  {
    name: 'Team',
    gpu: 'A6000 / L40S class',
    spec: 'Custom',
    price: '[Custom]',
    fit: 'Firms, labs and courses with shared seats.',
    bullets: ['Everything in Assembly', 'Shared seats and roles', 'Pooled GPU-hours', 'Invoicing'],
    cta: 'Talk to us',
    featured: false,
  },
]

export const faq = [
  {
    q: 'Which CAD packages run on meshrun?',
    a: 'Windows-only packages your Mac cannot open: SolidWorks, Inventor and comparable tools. [Confirm the launch list before publishing.]',
  },
  {
    q: 'Do I need a Windows or CAD licence?',
    a: 'Workstations arrive with the stack installed and licensed. Bring your own licence where your school or firm already has one. [Licensing terms TBD.]',
  },
  {
    q: 'What happens to my files when the machine stops?',
    a: 'The disk persists between sessions; only the GPU is released. Your workstation is where you left it next time you sign in.',
  },
  {
    q: 'How is usage measured?',
    a: 'In GPU-hours, billed per second while a workstation is running. An idle workstation auto-stops, and a stopped one costs nothing.',
  },
  {
    q: 'Does it work on Apple silicon?',
    a: 'Yes. Nothing runs locally except the meshrun app; the workstation does the work and streams the picture.',
  },
  {
    q: 'What about latency?',
    a: 'Workstations boot in the region nearest you. Under load the stream drops resolution before it drops frames. [No measurements published yet.]',
  },
]
