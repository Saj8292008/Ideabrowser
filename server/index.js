import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import {
  bus, demoMode, listProjects, getProject, createProject, startResearch, setFindingStatus,
  acceptRecommendations, startDistill, exportJSONL, deleteProject, addToWaitlist,
} from './pipeline.js';

const app = express();
app.use(express.json({ limit: '100kb' }));

const wrap = (fn) => (req, res) => {
  try {
    const out = fn(req, res);
    if (out !== undefined) res.json(out);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

app.get('/api/status', wrap(() => ({ demo: demoMode() })));
app.get('/api/projects', wrap(() => listProjects()));
app.post('/api/projects', wrap((req) => {
  const { domain, focus, topicCount } = req.body ?? {};
  if (!domain || String(domain).trim().length < 3) throw new Error('Describe the domain to research.');
  const p = createProject({ domain, focus, topicCount });
  startResearch(p.id);
  return getProject(p.id);
}));
app.get('/api/projects/:id', wrap((req, res) => {
  const p = getProject(req.params.id);
  if (!p) { res.status(404).json({ error: 'Not found' }); return; }
  return p;
}));
app.delete('/api/projects/:id', wrap((req) => { deleteProject(req.params.id); return { ok: true }; }));
app.post('/api/projects/:id/research', wrap((req) => startResearch(req.params.id)));
app.post('/api/projects/:id/findings/:fid', wrap((req) => setFindingStatus(req.params.id, req.params.fid, req.body?.status)));
app.post('/api/projects/:id/accept-recommendations', wrap((req) => acceptRecommendations(req.params.id)));
app.post('/api/projects/:id/distill', wrap((req) => startDistill(req.params.id)));
app.get('/api/projects/:id/export/:kind.jsonl', wrap((req, res) => {
  const p = getProject(req.params.id);
  if (!p) throw new Error('Not found');
  const kind = req.params.kind === 'eval' ? 'eval' : 'train';
  const slug = p.domain.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40);
  res.setHeader('Content-Type', 'application/jsonl; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${slug}-${kind}.jsonl"`);
  res.send(exportJSONL(p.id, kind));
}));

// Live progress (Server-Sent Events).
app.get('/api/projects/:id/events', (req, res) => {
  const pid = req.params.id;
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
  const send = (evt) => res.write(`data: ${JSON.stringify(evt)}\n\n`);
  bus.on(pid, send);
  const ping = setInterval(() => res.write(': ping\n\n'), 20000);
  req.on('close', () => { bus.off(pid, send); clearInterval(ping); });
});

app.post('/api/waitlist', wrap((req) => { addToWaitlist(req.body ?? {}); return { ok: true }; }));

// Serve the built frontend in production.
const dist = path.resolve('dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.PORT) || 8787;
app.listen(port, () => console.log(`Distillery API on :${port} (${demoMode() ? 'DEMO mode — no Anthropic credentials' : 'live Claude mode'})`));
