// The research → review → distill pipeline. Each agent is one focused Claude call.
import { z } from 'zod';
import { callJSON, research } from './claude.js';

const clampScore = (n) => Math.max(1, Math.min(5, Math.round(Number(n) || 1)));

// ---------- Planner ----------
const PlanSchema = z.object({
  topics: z.array(z.object({
    title: z.string(),
    why: z.string(),
    questions: z.array(z.string()),
  })),
});

export async function planTopics({ domain, focus, topicCount, ctx }) {
  const { topics } = await callJSON({
    label: 'Planner',
    effort: 'medium',
    onUsage: ctx.usage,
    schema: PlanSchema,
    system:
      'You plan research for building a domain-expert AI model. You break a field into the sub-topics a practitioner must know cold, ' +
      'prioritising procedural, numeric, and regulatory specifics that general-purpose models tend to get wrong.',
    prompt:
      `Domain: ${domain}\n${focus ? `Focus / audience: ${focus}\n` : ''}\n` +
      `Return exactly ${topicCount} sub-topics. For each, give a one-sentence reason it matters and 3-4 concrete research questions ` +
      'whose answers can be verified against authoritative public sources (regulators, standards bodies, official docs, peer-reviewed work).',
  });
  return topics.slice(0, topicCount);
}

// ---------- Researcher ----------
export async function researchTopic({ domain, topic, ctx }) {
  return research({
    onUsage: ctx.usage,
    onProgress: (m) => ctx.log('Researcher', m),
    system:
      'You are a meticulous research agent gathering facts to train a domain-expert model. Prefer primary, authoritative sources ' +
      '(government and regulator sites, official guidance, standards, statutes, peer-reviewed papers) over blogs and vendor marketing. ' +
      'Record specifics: numbers, deadlines, definitions, required steps, exceptions. Cite the source URL for every fact.',
    prompt:
      `Domain: ${domain}\nSub-topic: ${topic.title}\n\nAnswer these questions with sourced facts:\n` +
      topic.questions.map((q, i) => `${i + 1}. ${q}`).join('\n') +
      '\n\nWrite concise research notes. After each fact, put its source URL in square brackets. Note any point where sources disagree.',
  });
}

// ---------- Extractor ----------
const FindingsSchema = z.object({
  findings: z.array(z.object({
    claim: z.string(),
    detail: z.string(),
    sourceUrl: z.string(),
    quote: z.string(),
  })),
});

export async function extractFindings({ domain, topic, notes, sources, ctx }) {
  const { findings } = await callJSON({
    label: 'Extractor',
    effort: 'low',
    onUsage: ctx.usage,
    schema: FindingsSchema,
    system: 'You convert research notes into atomic, self-contained factual findings. You never add facts that are not in the notes.',
    prompt:
      `Domain: ${domain}\nSub-topic: ${topic.title}\n\nResearch notes:\n${notes}\n\nSources read:\n` +
      sources.map((s) => `- ${s.title} — ${s.url}`).join('\n') +
      '\n\nExtract 4-8 findings. Each: a one-sentence claim, 1-3 sentences of supporting detail, the single best source URL from the list ' +
      '(exactly as listed), and a short supporting phrase from the notes (empty string if none).',
  });
  const known = new Set(sources.map((s) => s.url));
  return findings.map((f) => ({
    ...f,
    sourceTitle: sources.find((s) => s.url === f.sourceUrl)?.title ?? f.sourceUrl,
    sourceVerified: known.has(f.sourceUrl),
  }));
}

// ---------- Reviewer ----------
const ReviewSchema = z.object({
  reviews: z.array(z.object({
    id: z.string(),
    score: z.number().int(),
    verdict: z.enum(['keep', 'reject']),
    note: z.string(),
  })),
});

export async function reviewFindings({ domain, findings, ctx }) {
  const { reviews } = await callJSON({
    label: 'Reviewer',
    effort: 'high',
    onUsage: ctx.usage,
    schema: ReviewSchema,
    system:
      'You are a skeptical subject-matter reviewer. You decide which findings are reliable enough to train a model on. ' +
      'Penalise: vague or unverifiable claims, weak or non-primary sources, duplicates of another finding, likely-outdated facts, ' +
      'and contradictions with other findings. Score 1-5 (5 = precise, primary-sourced, clearly correct).',
    prompt:
      `Domain: ${domain}\n\nFindings:\n` +
      findings.map((f) => `[${f.id}] ${f.claim}\n  Detail: ${f.detail}\n  Source: ${f.sourceUrl}${f.sourceVerified ? '' : ' (NOT among sources the researcher read)'}`).join('\n') +
      '\n\nReview every finding by id. verdict "keep" only for score >= 3 and no unresolved contradiction. The note is one sentence explaining the score.',
  });
  return reviews.map((r) => ({ ...r, score: clampScore(r.score) }));
}

// ---------- Distiller (dataset + eval set) ----------
const DatasetSchema = z.object({
  examples: z.array(z.object({
    findingIds: z.array(z.string()),
    question: z.string(),
    answer: z.string(),
  })),
  evals: z.array(z.object({
    findingId: z.string(),
    question: z.string(),
    reference: z.string(),
  })),
});

export async function distillDataset({ domain, findings, ctx }) {
  return callJSON({
    label: 'Distiller',
    effort: 'medium',
    onUsage: ctx.usage,
    schema: DatasetSchema,
    system:
      'You turn verified findings into supervised fine-tuning data for a small domain-expert model. Answers must be accurate, ' +
      'specific, and grounded only in the given findings — no outside facts. Write in the voice of an experienced practitioner.',
    prompt:
      `Domain: ${domain}\n\nVerified findings:\n` +
      findings.map((f) => `[${f.id}] ${f.claim} — ${f.detail} (source: ${f.sourceUrl})`).join('\n') +
      '\n\n1. examples: 2-3 diverse training examples per finding — direct questions, practical scenarios, and "what is the mistake here" ' +
      'prompts. Some examples may combine two related findings. Answers 2-6 sentences.\n' +
      '2. evals: one held-out question per finding, phrased differently from every training example, with a short reference answer. ' +
      'These are used to test the trained model, so they must not duplicate training questions.',
  });
}
