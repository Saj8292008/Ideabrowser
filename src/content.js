// All landing-page copy, verbatim from the validation brief.
// If anything here conflicts with the brief, the brief wins.

export const CTA_LABEL = 'Get my free archive scan';

export const nav = {
  links: [
    { href: '#how-it-works', label: 'How it works' },
    { href: '#pricing', label: 'Pricing' },
    { href: '#faq', label: 'FAQ' },
  ],
};

export const hero = {
  headline: 'Your back catalog is still playing dead sponsor ads',
  subheadline:
    'PodSweep finds every stale baked-in read in your archive and turns it into a sellable dynamic ad slot.',
  credibility:
    '93.6% of US podcast ad revenue now runs through dynamic insertion — every baked-in read from a lapsed sponsor is blocking a slot you could sell.',
};

export const problem = {
  headline: 'The episodes still earning downloads are working against you',
  points: [
    'New listeners binge your back catalog every week — and hear a promo code that died in 2023.',
    "Somewhere in your 200 episodes is a live read for a sponsor who stopped paying. You don't know which ones.",
    'Finding them means re-listening to your entire archive. Nobody has those hours.',
    'Switching hosts? Stale baked-in ads come with you — permanently — unless you catch them first.',
  ],
};

export const howItWorks = {
  headline: 'Scan. Approve. Swap. Verified.',
  steps: [
    {
      title: 'Scan your archive.',
      body: 'Share your episode transcripts and recent download numbers. PodSweep flags every baked-in sponsor read, dead promo code, and dated CTA — with timestamps.',
    },
    {
      title: 'Approve each swap.',
      body: 'Review a queue ranked by traffic, highest-earning episodes first. Approve or skip every change. Originals are preserved, nothing moves without your sign-off.',
    },
    {
      title: 'Swap and verify.',
      body: "Follow exact steps for your host's own editor — Captivate, Megaphone, or Buzzsprout — then PodSweep confirms the clean version is live and logs it.",
    },
  ],
  demoIntro:
    "Here's the exact report PodSweep produces — this one is from a sample 212-episode archive.",
};

// Worked example. `parts` lets us color only the flag mark and the dead
// promo-code text in the accent, per the design spec usage rule.
export const leakReport = {
  title: 'Leak Report — The Trailhead Podcast',
  meta: [
    '10 episodes scanned',
    '7 stale reads found',
    '~21,400 downloads last 90 days playing dead ads',
  ],
  rows: [
    {
      episode: 'Ep 112',
      name: 'Thru-Hiking the Collegiate Loop',
      traffic: '4,210 downloads (90d)',
      flag: [
        { t: 'Baked-in mid-roll at 14:32 — 62-sec live read for BrewTrail Coffee, ' },
        { t: '"code TRAILHEAD20"', code: true },
        { t: ' — promo code dead since Nov 2023' },
      ],
      outcome: 'Opens one sellable 60-sec mid-roll DAI slot.',
    },
    {
      episode: 'Ep 87',
      name: 'Ultralight Pack Audit',
      traffic: '3,540 downloads (90d)',
      flag: [
        { t: 'Baked-in pre-roll at 00:48 — 45-sec read for Summit Insoles, ' },
        { t: '"summitinsoles.com/trail"', code: true },
        { t: ' — offer page returns 404' },
      ],
      outcome: 'Opens one sellable pre-roll slot.',
    },
    {
      episode: 'Ep 134',
      name: 'Winter Trail Safety Q&A',
      traffic: '2,980 downloads (90d)',
      flag: [
        { t: 'Dated CTA at 31:05 — "Join our live meetup this June in Boulder" (event passed)' },
      ],
      outcome: 'Clean cut, no replacement needed.',
    },
  ],
  footer: 'Estimated open inventory: 7 DAI slots across your top 10 episodes.',
};

export const benefits = [
  {
    icon: 'bars',
    title: 'Fix the 10 that matter',
    body: 'PodSweep ranks your archive by real downloads, so you never waste an hour on episodes nobody plays.',
  },
  {
    icon: 'tagSlash',
    title: 'Kill dead promo codes',
    body: 'Every expired offer and 404 link gets found and flagged before another listener hears it.',
  },
  {
    icon: 'wavePlus',
    title: 'Open inventory you can sell',
    body: 'Each removed read becomes a dynamic slot in the format carrying nearly all podcast ad money.',
  },
  {
    icon: 'shield',
    title: 'Nothing breaks',
    body: 'Preserved originals, per-swap approval, and a published-version check on every change.',
  },
  {
    icon: 'swap',
    title: 'Migration-ready',
    body: 'Catch every baked-in ad before a host switch locks it in forever.',
  },
  {
    icon: 'clipboard',
    title: 'A paper trail for every edit',
    body: 'Who approved what, when, and proof it published clean.',
  },
];

export const pricing = [
  {
    id: 'pilot',
    name: 'Pilot Sweep',
    price: '$399',
    cadence: 'one-time',
    bestFor: 'testing PodSweep on your highest-traffic episodes.',
    features: [
      'Full-archive scan and ranked leak report',
      'Top 10 episodes cleaned, with approval queue',
      'Preserved originals and sign-off log',
      'Published-version verification on every swap',
    ],
    button: 'Reserve my pilot sweep',
  },
  {
    id: 'retainer',
    name: 'Archive Retainer',
    price: '$599',
    cadence: '/month',
    recommended: true,
    bestFor: 'active shows where sponsors rotate and the archive keeps growing.',
    features: [
      'Everything in Pilot Sweep, ongoing',
      'Up to 25 episodes swept per month',
      'Recurring scan of new flags each month',
      'Priority email support',
    ],
    button: 'Reserve my retainer spot',
  },
  {
    id: 'migration',
    name: 'Migration Cleanup',
    price: '$1,500',
    cadence: 'flat',
    bestFor: 'shows switching hosts in the next 90 days.',
    features: [
      'Full-archive scan, every episode',
      'Every baked-in read flagged and swapped before the move',
      'Migration-readiness checklist',
      'Post-migration verification report',
    ],
    button: 'Reserve my migration cleanup',
  },
];

export const faq = [
  {
    q: 'Will editing old episodes break my feed or my download stats?',
    a: "No. Swaps happen inside your hosting platform's own editor — the same tools Captivate, Megaphone, and Buzzsprout built for this. Your episode URLs and stats stay intact, originals are preserved, and every change is verified after publishing.",
  },
  {
    q: 'Is PodSweep available right now?',
    a: "Not yet — this page is for founding early access. Sign up and you'll get first access when we open, plus a free leak scan of your top 10 episodes. We'll never pretend otherwise: you're joining early, and early members shape what gets built.",
  },
  {
    q: 'My host already has segment editing. Why would I pay for this?',
    a: "The editor is the easy part. The labor is finding every stale read across 200 episodes, knowing which ones are worth fixing, and confirming the swap actually published. That's what PodSweep does — your host's tools execute it.",
  },
  {
    q: 'Is $399 actually worth it for 10 episodes?',
    a: 'If your top 10 back-catalog episodes pull a few thousand downloads a quarter, each one playing a dead read is unsellable inventory. One filled mid-roll slot across those downloads typically covers the sweep — and the slots keep paying every quarter after.',
  },
  {
    q: 'Do I have to hand over my hosting login?',
    a: 'No. The scan works from your transcripts and download numbers. You approve every swap yourself, and you (or a teammate) execute it in your own host account with our exact checklist.',
  },
  {
    q: 'Which hosting platforms do you support?',
    a: 'At launch: Captivate, Megaphone (Spotify), and Buzzsprout — any host with segment editing or dynamic content tools. On something else? Sign up anyway and tell us your host; it directly shapes what we add next.',
  },
];

export const finalCta = {
  line: 'Your archive is still earning downloads. Make it earn money again.',
  riskReversal:
    'Founding members get first access and a free leak scan of their top 10 episodes — before paying a cent.',
};

export const capture = {
  offer:
    "Founding early access to PodSweep plus a free Leak Scan of your top 10 episodes when we launch — see exactly what's stale and what it's blocking before you pay anything.",
  placeholder: 'you@yourshow.com',
  privacy: 'No spam, no list-selling. One email when your scan is ready to run.',
  success:
    "You're in. When PodSweep opens in the coming weeks, you'll get an email with a link to run your free 10-episode leak scan — keep an eye out for 'PodSweep' in your inbox.",
  // Short answer to the #1 follow-up objection, condensed from FAQ #1.
  reassurance:
    "Swaps run inside your host's own editor — originals preserved, every change verified after publishing.",
};
