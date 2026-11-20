// Demo mode: used when no Anthropic credentials are configured.
// Same interface as agents.js, returns pre-researched FDA 510(k) content
// (with real source URLs) and simulates agent timing. Clearly labeled in the UI.

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const SRC = {
  overview: ['https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/premarket-notification-510k', 'Premarket Notification 510(k) — FDA'],
  cfr: ['https://www.ecfr.gov/current/title-21/chapter-I/subchapter-H/part-807/subpart-E', '21 CFR Part 807 Subpart E — eCFR'],
  se: ['https://www.fda.gov/regulatory-information/search-fda-guidance-documents/510k-program-evaluating-substantial-equivalence-premarket-notifications-510k', 'The 510(k) Program: Evaluating Substantial Equivalence — FDA guidance'],
  estar: ['https://www.fda.gov/medical-devices/how-study-and-market-your-device/estar-program', 'eSTAR Program — FDA'],
  rta: ['https://www.fda.gov/regulatory-information/search-fda-guidance-documents/acceptance-review-510k-submissions', 'Acceptance Review for 510(k)s — FDA guidance'],
  clock: ['https://www.fda.gov/regulatory-information/search-fda-guidance-documents/fda-and-industry-actions-premarket-notification-510k-submissions-effect-fda-review-clock-and-goals', 'FDA and Industry Actions on 510(k) Submissions — FDA guidance'],
  special: ['https://www.fda.gov/regulatory-information/search-fda-guidance-documents/special-510k-program', 'The Special 510(k) Program — FDA guidance'],
  change: ['https://www.fda.gov/regulatory-information/search-fda-guidance-documents/deciding-when-submit-510k-change-existing-device', 'Deciding When to Submit a 510(k) for a Change to an Existing Device — FDA guidance'],
  denovo: ['https://www.fda.gov/medical-devices/premarket-submissions-selecting-and-preparing-correct-submission/de-novo-classification-request', 'De Novo Classification Request — FDA'],
  blog: ['https://example-regconsult.com/blog/510k-timelines', 'How long does a 510(k) take? — consultancy blog'],
};

const f = (claim, detail, src, quote, review) => ({
  claim, detail, sourceUrl: SRC[src][0], sourceTitle: SRC[src][1], sourceVerified: true, quote, review,
});

const QA = {
  "A 510(k) demonstrates that a device": [
    "What does a 510(k) actually have to demonstrate to FDA?",
    "We're preparing our first 510(k). What is the core argument the submission needs to make?",
    "What is the purpose of a 510(k) premarket notification?"
  ],
  "A device is SE if": [
    "When does FDA consider a device substantially equivalent to its predicate?",
    "Our device has the same intended use as the predicate but uses a different sensor technology. Can we still claim substantial equivalence?",
    "What two conditions define substantial equivalence?"
  ],
  "A predicate can be": [
    "What kinds of devices can serve as a legally marketed predicate?",
    "Can a device that was on the market before 1976 be used as a predicate?",
    "List the valid sources of a predicate device for a 510(k)."
  ],
  "Many Class I and some Class II": [
    "Does every Class I or Class II device need a 510(k)?",
    "Our Class II device's product code is listed as 510(k)-exempt, but we've modified it. Are we automatically exempt?",
    "Which device classes can be exempt from 510(k)?"
  ],
  "A 510(k) must be submitted at least": [
    "How far ahead of launch must a 510(k) be submitted?",
    "Marketing wants to ship next month and plans to file the 510(k) next week. What's the problem?",
    "What is the minimum lead time between submitting a 510(k) and marketing the device?"
  ],
  "Since October 1, 2023": [
    "What format must a 510(k) submission use?",
    "A team is preparing a 510(k) as a set of separate PDFs. What should they know?",
    "What is eSTAR and when did it become required for 510(k)s?"
  ],
  "A 510(k) requires a user fee": [
    "Do 510(k) submissions require a fee, and can small companies pay less?",
    "We're a 40-person startup. How do we qualify for the reduced 510(k) fee?",
    "How does the small business fee reduction work for 510(k)s?"
  ],
  "FDA performs an acceptance": [
    "What is the Refuse to Accept review and how long does it take?",
    "Two weeks after submitting, we received an RTA hold. What happened?",
    "How quickly does FDA decide whether to accept a 510(k) for substantive review?"
  ],
  "When FDA issues an Additional Information": [
    "What happens when FDA sends an Additional Information request on a 510(k)?",
    "We got an AI letter five months ago and haven't responded yet. What's the risk?",
    "How long does a submitter have to respond to an Additional Information request?"
  ],
  "The MDUFA performance goal": [
    "What is FDA's review goal for a traditional 510(k)?",
    "Leadership expects clearance exactly 90 days after submission. Is that realistic?",
    "Explain the difference between FDA days and calendar days for a 510(k) review."
  ],
  "A new 510(k) is required for a change": [
    "When does a change to a cleared device require a new 510(k)?",
    "We changed a material in our cleared device. How do we decide whether a new 510(k) is needed?",
    "What standard determines whether a device modification needs a new 510(k)?"
  ],
  "A Special 510(k) can be used": [
    "What is a Special 510(k) and when can it be used?",
    "We're modifying our own cleared device and have well-established test methods. Is there a faster pathway?",
    "What is FDA's review goal for a Special 510(k)?"
  ],
  "Novel low-to-moderate-risk": [
    "What pathway applies to a novel low-risk device with no predicate?",
    "We can't find any predicate for our new device. Should we force a weak predicate comparison?",
    "What is the De Novo pathway and what happens after a De Novo is granted?"
  ]
};
const qaFor = (claim) => QA[Object.keys(QA).find((k) => claim.startsWith(k))];

const TOPICS = [
  {
    title: 'When a 510(k) is required and the substantial-equivalence standard',
    why: 'Everything downstream depends on choosing the right pathway and predicate.',
    questions: ['Which devices require a 510(k)?', 'What does "substantially equivalent" mean legally?', 'What counts as a legally marketed predicate?'],
    findings: [
      f('A 510(k) demonstrates that a device is substantially equivalent (SE) to a legally marketed predicate device.',
        'The submitter compares the new device to one or more similar legally marketed devices and supports the SE claim with data.',
        'overview', 'demonstrate that the device to be marketed is at least as safe and effective', { score: 5, verdict: 'keep', note: 'Core definition from the primary FDA source.' }),
      f('A device is SE if it has the same intended use as the predicate and either the same technological characteristics, or different characteristics that do not raise different questions of safety and effectiveness.',
        'Where technology differs, the submitter must show the device is as safe and effective as the predicate, typically with performance data.',
        'se', 'same intended use as the predicate', { score: 5, verdict: 'keep', note: 'Precise statement of the SE decision standard.' }),
      f('A predicate can be a device legally marketed before May 28, 1976, a device reclassified to Class I or II, or a device already found SE through the 510(k) process.',
        'Pre-amendments devices (marketed before the Medical Device Amendments of 1976) are a common basis for predicate chains.',
        'overview', 'legally marketed prior to May 28, 1976', { score: 4, verdict: 'keep', note: 'Correct; the full list of predicate types is in 21 CFR 807.92(a)(3).' }),
      f('Many Class I and some Class II devices are exempt from 510(k) requirements, subject to limitations in the device classification regulations.',
        'Exemption status is checked per product code in the classification regulation; exemptions have limits, so a modified exempt device can still need a 510(k).',
        'overview', 'exempt from 510(k)', { score: 4, verdict: 'keep', note: 'Accurate; a practitioner should still confirm per product code.' }),
    ],
  },
  {
    title: 'Submission format, timing and fees',
    why: 'Filing mistakes are the most common cause of avoidable delays.',
    questions: ['When must a 510(k) be submitted?', 'What submission format is required?', 'Are there user fees?'],
    findings: [
      f('A 510(k) must be submitted at least 90 days before the device is introduced into interstate commercial distribution.',
        'The device cannot be marketed until the submitter receives an order from FDA finding it substantially equivalent.',
        'cfr', 'at least 90 days before', { score: 5, verdict: 'keep', note: 'Regulatory requirement under 21 CFR 807.81, primary source.' }),
      f('Since October 1, 2023, 510(k) submissions must be submitted electronically using eSTAR unless exempted.',
        'eSTAR is an interactive PDF template that guides the submitter through required content and supports a more consistent review.',
        'estar', 'must be submitted as electronic submissions using eSTAR', { score: 5, verdict: 'keep', note: 'Specific, dated and from the FDA program page.' }),
      f('A 510(k) requires a user fee, and qualified small businesses can pay a reduced fee after obtaining a small business determination.',
        'Fees are set each fiscal year; the small business determination must be obtained before submission.',
        'overview', 'user fee', { score: 4, verdict: 'keep', note: 'Correct; exact fee amounts change annually and are intentionally omitted.' }),
    ],
  },
  {
    title: 'Review process: acceptance, holds and decisions',
    why: 'Understanding the review clock lets teams plan launches realistically.',
    questions: ['What is the Refuse to Accept review?', 'What happens when FDA requests additional information?', 'How long does review take?'],
    findings: [
      f('FDA performs an acceptance (Refuse to Accept) review and aims to notify the submitter within 15 calendar days whether the 510(k) is accepted for substantive review.',
        'Submissions missing required elements can be placed on RTA hold; for eSTAR submissions a technical screening replaces much of the RTA checklist.',
        'rta', 'within 15 calendar days', { score: 5, verdict: 'keep', note: 'Precise number from the FDA acceptance-review guidance.' }),
      f('When FDA issues an Additional Information request, the 510(k) goes on hold and the submitter has 180 calendar days to respond or the submission is considered withdrawn.',
        'The FDA review clock stops during the hold and resumes when a complete response is received.',
        'clock', '180 calendar days', { score: 5, verdict: 'keep', note: 'Correct and highly practical; primary FDA guidance.' }),
      f('The MDUFA performance goal for a traditional 510(k) decision is 90 FDA days.',
        'FDA days exclude time the submission is on hold, so total elapsed time is usually longer than 90 calendar days.',
        'clock', '90 FDA days', { score: 4, verdict: 'keep', note: 'Correct; the FDA-days vs calendar-days distinction is the key nuance.' }),
      f('Most 510(k)s are cleared in about three months.',
        'A consultancy blog states typical clearance takes roughly three months.',
        'blog', 'about three months', { score: 2, verdict: 'reject', note: 'Secondary source, conflates FDA days with calendar time; contradicts the hold rules above.' }),
    ],
  },
  {
    title: 'Device changes and alternative pathways',
    why: 'Post-clearance changes and novel devices are where teams most often pick the wrong route.',
    questions: ['When does a change to a cleared device need a new 510(k)?', 'What is a Special 510(k)?', 'What if there is no predicate?'],
    findings: [
      f('A new 510(k) is required for a change to a cleared device that could significantly affect safety or effectiveness, or a major change to its intended use.',
        "FDA's change guidance provides decision flowcharts for labeling, technology, design, and materials changes; the decision and rationale should be documented.",
        'change', 'could significantly affect the safety or effectiveness', { score: 5, verdict: 'keep', note: 'Matches 21 CFR 807.81(a)(3) and the FDA change guidance.' }),
      f("A Special 510(k) can be used for certain changes to a manufacturer's own legally marketed device, with an FDA review goal of 30 days.",
        'It suits changes where well-established methods are available to evaluate the change and the results can be reviewed in summary or risk-analysis format.',
        'special', '30 days', { score: 5, verdict: 'keep', note: 'Accurate summary of the Special 510(k) program.' }),
      f('Novel low-to-moderate-risk devices with no valid predicate can request classification through the De Novo pathway.',
        'A granted De Novo creates a new classification regulation, and the device can then serve as a predicate for future 510(k)s.',
        'denovo', 'no legally marketed predicate', { score: 5, verdict: 'keep', note: 'Correct and important alternative to forcing a weak predicate.' }),
      f('If no predicate exists, a 510(k) can still be cleared by comparing to the closest device.',
        'Restates predicate selection loosely.',
        'blog', '', { score: 1, verdict: 'reject', note: 'Incorrect: without a valid predicate the device is NSE; De Novo or PMA applies.' }),
    ],
  },
];

export async function planTopics({ topicCount, ctx }) {
  await wait(900);
  ctx.log('Planner', 'Mapped the field into sub-topics (demo data).');
  return TOPICS.slice(0, topicCount).map(({ title, why, questions }) => ({ title, why, questions }));
}

export async function researchTopic({ topic, ctx }) {
  const t = TOPICS.find((x) => x.title === topic.title);
  for (const q of t.questions) {
    ctx.log('Researcher', `Searching: “${q.replace(/\?$/, '')} FDA 510(k)”`);
    await wait(500);
  }
  const urls = [...new Set(t.findings.map((x) => x.sourceUrl))];
  for (const u of urls.slice(0, 2)) { ctx.log('Researcher', `Reading: ${u}`); await wait(450); }
  return { notes: '(demo)', sources: t.findings.map((x) => ({ url: x.sourceUrl, title: x.sourceTitle })) };
}

export async function extractFindings({ topic }) {
  await wait(400);
  const t = TOPICS.find((x) => x.title === topic.title);
  return t.findings.map(({ review, ...rest }) => ({ ...rest, _demoReview: review }));
}

export async function reviewFindings({ findings }) {
  await wait(1200);
  return findings.map((x) => ({ id: x.id, ...(x._demoReview ?? { score: 3, verdict: 'keep', note: 'Demo review.' }) }));
}

export async function distillDataset({ findings }) {
  await wait(1500);
  const examples = [];
  const evals = [];
  for (const x of findings) {
    const qa = qaFor(x.claim) ?? [`Explain: ${x.claim}`, `Explain: ${x.claim}`, `Explain: ${x.claim}`];
    examples.push({ findingIds: [x.id], question: qa[0], answer: `${x.claim} ${x.detail}` });
    examples.push({ findingIds: [x.id], question: qa[1], answer: `${x.detail} The underlying rule: ${x.claim.charAt(0).toLowerCase()}${x.claim.slice(1)} (Source: ${x.sourceTitle}.)` });
    evals.push({ findingId: x.id, question: qa[2], reference: x.claim });
  }
  return { examples, evals };
}
