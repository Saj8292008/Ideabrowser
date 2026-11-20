// Project storage + pipeline orchestration with live events.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { EventEmitter } from 'node:events';
import * as real from './agents.js';
import * as mock from './mock.js';
import { hasCredentials, costOf, describeError } from './claude.js';

const DATA_DIR = process.env.DATA_DIR || path.resolve('data');
const PROJ_DIR = path.join(DATA_DIR, 'projects');
fs.mkdirSync(PROJ_DIR, { recursive: true });

export const bus = new EventEmitter();
bus.setMaxListeners(100);

const id = (p) => `${p}_${crypto.randomBytes(5).toString('hex')}`;
const file = (pid) => path.join(PROJ_DIR, `${pid.replace(/[^a-z0-9_]/gi, '')}.json`);

export function demoMode() { return !hasCredentials(); }
const agents = () => (demoMode() ? mock : real);

export function listProjects() {
  return fs.readdirSync(PROJ_DIR).filter((f) => f.endsWith('.json'))
    .map((f) => JSON.parse(fs.readFileSync(path.join(PROJ_DIR, f), 'utf8')))
    .map(({ id, domain, status, createdAt, findings, dataset, demo }) => ({
      id, domain, status, createdAt, demo,
      findingCount: findings.length,
      approvedCount: findings.filter((x) => x.status === 'approved').length,
      exampleCount: dataset.examples.length,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getProject(pid) {
  try { return JSON.parse(fs.readFileSync(file(pid), 'utf8')); } catch { return null; }
}

function save(p) {
  fs.writeFileSync(file(p.id), JSON.stringify(p, null, 2));
  bus.emit(p.id, { type: 'project', project: p });
}

export function createProject({ domain, focus, topicCount }) {
  const p = {
    id: id('prj'),
    domain: String(domain).trim().slice(0, 200),
    focus: String(focus || '').trim().slice(0, 500),
    topicCount: Math.max(2, Math.min(8, Number(topicCount) || 4)),
    demo: demoMode(),
    status: 'idle',
    stage: null,
    error: null,
    createdAt: new Date().toISOString(),
    topics: [],
    findings: [],
    dataset: { examples: [], evals: [], builtAt: null },
    log: [],
    usage: { inputTokens: 0, outputTokens: 0, searches: 0, costUsd: 0 },
  };
  save(p);
  return p;
}

function context(p) {
  return {
    log(agent, message) {
      const entry = { at: new Date().toISOString(), agent, message };
      p.log.push(entry);
      if (p.log.length > 500) p.log.shift();
      bus.emit(p.id, { type: 'log', entry });
    },
    usage(u) {
      if (!u) return;
      p.usage.inputTokens += (u.input_tokens ?? 0) + (u.cache_read_input_tokens ?? 0);
      p.usage.outputTokens += u.output_tokens ?? 0;
      p.usage.searches += u.server_tool_use?.web_search_requests ?? 0;
      p.usage.costUsd += costOf(u);
    },
  };
}

const running = new Set();

async function run(p, stage, fn) {
  if (running.has(p.id)) throw new Error('This project is already running.');
  running.add(p.id);
  p.status = 'running'; p.stage = stage; p.error = null;
  save(p);
  const ctx = context(p);
  try {
    await fn(ctx);
    p.status = 'ready';
  } catch (err) {
    p.status = 'error';
    p.error = describeError(err);
    ctx.log('System', `Stopped: ${p.error}`);
  } finally {
    p.stage = null;
    running.delete(p.id);
    save(p);
  }
}

/** Plan → research each topic → extract findings → review. */
export function startResearch(pid) {
  const p = getProject(pid);
  if (!p) throw new Error('Project not found.');
  const A = agents();
  run(p, 'research', async (ctx) => {
    ctx.log('Planner', `Planning research for “${p.domain}”…`);
    const topics = await A.planTopics({ domain: p.domain, focus: p.focus, topicCount: p.topicCount, ctx });
    p.topics = topics.map((t) => ({ ...t, id: id('top'), status: 'queued' }));
    p.findings = []; p.dataset = { examples: [], evals: [], builtAt: null };
    save(p);
    ctx.log('Planner', `Planned ${p.topics.length} sub-topics.`);

    for (const topic of p.topics) {
      topic.status = 'researching'; save(p);
      ctx.log('Researcher', `Researching “${topic.title}”`);
      const { notes, sources } = await A.researchTopic({ domain: p.domain, topic, ctx });
      ctx.log('Extractor', `Extracting findings from ${sources.length} sources…`);
      const found = await A.extractFindings({ domain: p.domain, topic, notes, sources, ctx });
      for (const fnd of found) {
        p.findings.push({ ...fnd, id: id('fnd'), topicId: topic.id, status: 'pending', score: null, verdict: null, reviewNote: '' });
      }
      topic.status = 'done';
      save(p);
      ctx.log('Extractor', `${found.length} findings from “${topic.title}”.`);
    }

    ctx.log('Reviewer', `Cross-checking ${p.findings.length} findings…`);
    const reviews = await A.reviewFindings({ domain: p.domain, findings: p.findings, ctx });
    const byId = new Map(reviews.map((r) => [r.id, r]));
    for (const fnd of p.findings) {
      const r = byId.get(fnd.id);
      delete fnd._demoReview;
      if (!r) continue;
      fnd.score = r.score; fnd.verdict = r.verdict; fnd.reviewNote = r.note;
    }
    const kept = p.findings.filter((x) => x.verdict === 'keep').length;
    ctx.log('Reviewer', `Recommended ${kept} of ${p.findings.length} findings. Your approval is needed before training data is built.`);
  });
  return p;
}

export function setFindingStatus(pid, fid, status) {
  const p = getProject(pid);
  if (!p) throw new Error('Project not found.');
  if (!['approved', 'rejected', 'pending'].includes(status)) throw new Error('Bad status.');
  const fnd = p.findings.find((x) => x.id === fid);
  if (!fnd) throw new Error('Finding not found.');
  fnd.status = status;
  save(p);
  return p;
}

export function acceptRecommendations(pid) {
  const p = getProject(pid);
  if (!p) throw new Error('Project not found.');
  for (const fnd of p.findings) {
    if (fnd.status === 'pending' && fnd.verdict) fnd.status = fnd.verdict === 'keep' ? 'approved' : 'rejected';
  }
  save(p);
  return p;
}

/** Turn approved findings into training examples + held-out eval set. */
export function startDistill(pid) {
  const p = getProject(pid);
  if (!p) throw new Error('Project not found.');
  const approved = p.findings.filter((x) => x.status === 'approved');
  if (!approved.length) throw new Error('Approve at least one finding first.');
  const A = agents();
  run(p, 'distill', async (ctx) => {
    ctx.log('Distiller', `Writing training data from ${approved.length} approved findings…`);
    const out = await A.distillDataset({ domain: p.domain, findings: approved, ctx });
    const valid = new Set(approved.map((x) => x.id));
    p.dataset = {
      examples: out.examples.filter((e) => e.findingIds.some((x) => valid.has(x))).map((e) => ({ ...e, id: id('ex') })),
      evals: out.evals.filter((e) => valid.has(e.findingId)).map((e) => ({ ...e, id: id('ev') })),
      builtAt: new Date().toISOString(),
    };
    ctx.log('Distiller', `Built ${p.dataset.examples.length} training examples and ${p.dataset.evals.length} held-out eval questions.`);
  });
  return p;
}

const SYSTEM_PROMPT = (domain) => `You are an expert assistant specialising in ${domain}. Answer precisely and note when a rule has exceptions.`;

/** JSONL in the chat "messages" format accepted by common fine-tuning tools. */
export function exportJSONL(pid, kind) {
  const p = getProject(pid);
  if (!p) throw new Error('Project not found.');
  const rows = kind === 'eval'
    ? p.dataset.evals.map((e) => ({ messages: [{ role: 'system', content: SYSTEM_PROMPT(p.domain) }, { role: 'user', content: e.question }], reference: e.reference }))
    : p.dataset.examples.map((e) => ({ messages: [{ role: 'system', content: SYSTEM_PROMPT(p.domain) }, { role: 'user', content: e.question }, { role: 'assistant', content: e.answer }] }));
  return rows.map((r) => JSON.stringify(r)).join('\n') + '\n';
}

export function deleteProject(pid) {
  if (running.has(pid)) throw new Error('Stop the run before deleting.');
  fs.rmSync(file(pid), { force: true });
}

// Waitlist for the landing page.
export function addToWaitlist({ email, role, source }) {
  const clean = String(email || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(clean) || clean.length > 254) throw new Error('Please enter a valid email address.');
  const row = { email: clean, role: String(role || '').slice(0, 80), source: String(source || '').slice(0, 40), at: new Date().toISOString() };
  fs.appendFileSync(path.join(DATA_DIR, 'waitlist.jsonl'), JSON.stringify(row) + '\n');
}
