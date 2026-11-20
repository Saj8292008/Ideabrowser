import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from './api.js';
import { navigate } from './main.jsx';

const DEMO_DOMAIN = 'FDA 510(k) medical device submissions';

function fmtCost(n) { return n < 0.01 ? '<$0.01' : `$${n.toFixed(2)}`; }
function fmtTokens(n) { return n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` : n >= 1e3 ? `${Math.round(n / 1e3)}k` : String(n); }

function StatusPill({ status, stage }) {
  const label = status === 'running' ? (stage === 'distill' ? 'Distilling' : 'Researching') : status === 'ready' ? 'Ready' : status === 'error' ? 'Error' : 'Idle';
  return <span className={`pill pill-${status}`}>{status === 'running' && <span className="dot" />}{label}</span>;
}

// ---------------- New project ----------------
function NewProject({ demo, onCreated }) {
  const [domain, setDomain] = useState(DEMO_DOMAIN);
  const [focus, setFocus] = useState('Regulatory-affairs teams at small device companies preparing their first submissions.');
  const [topicCount, setTopicCount] = useState(4);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try { onCreated(await api.create({ domain, focus, topicCount })); }
    catch (x) { setErr(x.message); } finally { setBusy(false); }
  }

  return (
    <form className="card newp" onSubmit={submit}>
      <h2>New research project</h2>
      <p className="muted">Describe a field. The agents plan sub-topics, research them on the web, and propose verified findings for you to approve.</p>
      <label>Domain
        <input value={domain} onChange={(e) => setDomain(e.target.value)} required minLength={3} maxLength={200} />
      </label>
      <label>Audience / focus <span className="muted">(optional)</span>
        <textarea rows={2} value={focus} onChange={(e) => setFocus(e.target.value)} maxLength={500} />
      </label>
      <label>Sub-topics to research
        <select value={topicCount} onChange={(e) => setTopicCount(Number(e.target.value))}>
          {[2, 3, 4, 5, 6, 8].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </label>
      {demo && <p className="note">Demo mode: no API key is configured, so the agents replay a pre-researched FDA 510(k) run with real sources.</p>}
      {!demo && <p className="note">Live mode: agents call Claude with web search. A 4-topic run typically uses a few dollars of API credit.</p>}
      {err && <p className="err" role="alert">{err}</p>}
      <button className="btn btn-primary" disabled={busy}>{busy ? 'Starting…' : 'Start research'}</button>
    </form>
  );
}

// ---------------- Tabs ----------------
function Activity({ p }) {
  const end = useRef(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }); }, [p.log.length]);
  return (
    <div className="activity">
      <aside className="topics card">
        <h3>Research plan</h3>
        {p.topics.length === 0 && <p className="muted">Planning…</p>}
        <ol>
          {p.topics.map((t) => (
            <li key={t.id} className={`topic t-${t.status}`}>
              <span className="tdot" />
              <div><strong>{t.title}</strong><p className="muted">{t.why}</p></div>
            </li>
          ))}
        </ol>
      </aside>
      <div className="log card" aria-live="polite">
        {p.log.map((l, i) => (
          <div key={i} className="log-row">
            <span className="log-t">{new Date(l.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}</span>
            <span className={`agent a-${l.agent.toLowerCase()}`}>{l.agent}</span>
            <span className="log-m">{l.message}</span>
          </div>
        ))}
        <div ref={end} />
      </div>
    </div>
  );
}

function Findings({ p, refresh }) {
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);
  const counts = useMemo(() => ({
    all: p.findings.length,
    pending: p.findings.filter((f) => f.status === 'pending').length,
    approved: p.findings.filter((f) => f.status === 'approved').length,
    rejected: p.findings.filter((f) => f.status === 'rejected').length,
  }), [p.findings]);

  async function set(fid, status) {
    setBusy(fid);
    try { refresh(await api.setFinding(p.id, fid, status)); } finally { setBusy(null); }
  }

  if (!p.findings.length) return <p className="empty">Findings appear here as each sub-topic is researched.</p>;
  const reviewed = p.findings.some((f) => f.verdict);

  return (
    <div>
      <div className="toolbar">
        <div className="seg" role="tablist" aria-label="Filter findings">
          {['all', 'pending', 'approved', 'rejected'].map((k) => (
            <button key={k} role="tab" aria-selected={filter === k} className={filter === k ? 'on' : ''} onClick={() => setFilter(k)}>
              {k[0].toUpperCase() + k.slice(1)} <span>{counts[k]}</span>
            </button>
          ))}
        </div>
        {reviewed && counts.pending > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={async () => refresh(await api.acceptAll(p.id))}>
            Accept reviewer recommendations ({counts.pending})
          </button>
        )}
      </div>
      {p.topics.map((t) => {
        const items = p.findings.filter((f) => f.topicId === t.id && (filter === 'all' || f.status === filter));
        if (!items.length) return null;
        return (
          <section key={t.id} className="fgroup">
            <h3>{t.title}</h3>
            {items.map((f) => (
              <article key={f.id} className={`card finding st-${f.status}`}>
                <div className="f-main">
                  <p className="f-claim">{f.claim}</p>
                  <p className="f-detail">{f.detail}</p>
                  <a className="f-src" href={f.sourceUrl} target="_blank" rel="noreferrer">{f.sourceTitle}</a>
                  {!f.sourceVerified && <span className="warn-tag">source not opened by researcher</span>}
                  {f.verdict && (
                    <p className={`f-review v-${f.verdict}`}>
                      <span className={`score s${f.score}`}>{f.score} / 5</span>
                      <span><strong>Reviewer {f.verdict === 'keep' ? 'recommends' : 'flags'}:</strong> {f.reviewNote}</span>
                    </p>
                  )}
                </div>
                <div className="f-actions">
                  <button className={`btn btn-sm ${f.status === 'approved' ? 'btn-primary' : 'btn-ghost'}`} disabled={busy === f.id}
                    aria-pressed={f.status === 'approved'} onClick={() => set(f.id, f.status === 'approved' ? 'pending' : 'approved')}>
                    {f.status === 'approved' ? 'Approved' : 'Approve'}
                  </button>
                  <button className={`btn btn-sm ${f.status === 'rejected' ? 'btn-dark' : 'btn-ghost'}`} disabled={busy === f.id}
                    aria-pressed={f.status === 'rejected'} onClick={() => set(f.id, f.status === 'rejected' ? 'pending' : 'rejected')}>
                    {f.status === 'rejected' ? 'Rejected' : 'Reject'}
                  </button>
                </div>
              </article>
            ))}
          </section>
        );
      })}
    </div>
  );
}

function Dataset({ p, refresh, running }) {
  const approved = p.findings.filter((f) => f.status === 'approved').length;
  const [err, setErr] = useState('');
  const build = async () => { setErr(''); try { refresh(await api.distill(p.id)); } catch (x) { setErr(x.message); } };
  const ds = p.dataset;
  return (
    <div className="dataset">
      <div className="card ds-head">
        <div>
          <h3>Training data</h3>
          <p className="muted">
            {ds.builtAt
              ? `${ds.examples.length} examples and ${ds.evals.length} held-out eval questions from ${approved} approved findings.`
              : `${approved} approved finding${approved === 1 ? '' : 's'} ready to distill into training examples.`}
          </p>
        </div>
        <div className="ds-actions">
          <button className="btn btn-primary btn-sm" onClick={build} disabled={running || approved === 0}>
            {ds.builtAt ? 'Rebuild from approved' : 'Build training data'}
          </button>
          {ds.builtAt && <>
            <a className="btn btn-ghost btn-sm" href={`/api/projects/${p.id}/export/train.jsonl`}>Download train.jsonl</a>
            <a className="btn btn-ghost btn-sm" href={`/api/projects/${p.id}/export/eval.jsonl`}>Download eval.jsonl</a>
          </>}
        </div>
      </div>
      {err && <p className="err" role="alert">{err}</p>}
      {approved === 0 && !ds.builtAt && <p className="empty">Approve findings in the Findings tab first. Only facts you approve become training data.</p>}
      {ds.examples.slice(0, 12).map((e) => (
        <div key={e.id} className="card ex">
          <p className="ex-q"><span>User</span>{e.question}</p>
          <p className="ex-a"><span>Model</span>{e.answer}</p>
        </div>
      ))}
      {ds.examples.length > 12 && <p className="muted center">+ {ds.examples.length - 12} more in the export</p>}
    </div>
  );
}

function Evals({ p }) {
  if (!p.dataset.evals.length) return <p className="empty">The held-out exam is generated with the training data. It's used to score the trained model against the base model.</p>;
  return (
    <div>
      {p.dataset.evals.map((e, i) => (
        <div key={e.id} className="card ex">
          <p className="ex-q"><span>Q{i + 1}</span>{e.question}</p>
          <p className="ex-a"><span>Ref</span>{e.reference}</p>
        </div>
      ))}
    </div>
  );
}

function Train({ p }) {
  const n = p.dataset.examples.length;
  return (
    <div className="card train">
      <h3>Train your model</h3>
      <p className="muted">Coming next: one click fine-tunes an open model on this dataset, then scores it on the held-out exam against the base model and a frontier model.</p>
      <dl className="train-spec">
        <div><dt>Base model</dt><dd>Open 8B instruct model (LoRA)</dd></div>
        <div><dt>Training examples</dt><dd>{n || '—'}</dd></div>
        <div><dt>Eval questions</dt><dd>{p.dataset.evals.length || '—'}</dd></div>
        <div><dt>Typical GPU cost</dt><dd>~$5–$50 per run</dd></div>
      </dl>
      <button className="btn btn-primary" disabled>Fine-tune: coming soon</button>
      <p className="muted small">Until then, download <code>train.jsonl</code> from the Dataset tab. It uses the standard chat "messages" format that most fine-tuning tools accept.</p>
    </div>
  );
}

// ---------------- Project view ----------------
function Project({ id, onDeleted, onStatus }) {
  const [p, setP] = useState(null);
  const [tab, setTab] = useState('activity');
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    api.project(id).then((x) => alive && setP(x)).catch((x) => setErr(x.message));
    const es = new EventSource(`/api/projects/${id}/events`);
    es.onmessage = (m) => {
      const evt = JSON.parse(m.data);
      if (evt.type === 'project') { setP(evt.project); onStatus?.(); }
      else if (evt.type === 'log') setP((cur) => (cur ? { ...cur, log: [...cur.log, evt.entry] } : cur));
    };
    return () => { alive = false; es.close(); };
  }, [id]);

  // Move the user along when a stage finishes.
  const prev = useRef({ status: null, stage: null });
  useEffect(() => {
    if (!p) return;
    if (prev.current.status === 'running' && p.status === 'ready') {
      setTab(prev.current.stage === 'distill' ? 'dataset' : 'findings');
    }
    prev.current = { status: p.status, stage: p.stage };
  }, [p?.status, p?.stage]); // eslint-disable-line react-hooks/exhaustive-deps

  if (err) return <p className="err">{err}</p>;
  if (!p) return <p className="muted pad">Loading…</p>;

  const running = p.status === 'running';
  const approved = p.findings.filter((f) => f.status === 'approved').length;
  const step = p.dataset.builtAt ? 3 : approved ? 2 : p.findings.some((f) => f.verdict) ? 1 : 0;
  const TABS = [
    ['activity', 'Activity'],
    ['findings', `Findings${p.findings.length ? ` (${p.findings.length})` : ''}`],
    ['dataset', 'Dataset'],
    ['evals', 'Eval set'],
    ['train', 'Train'],
  ];

  return (
    <div className="project">
      <div className="p-head">
        <div>
          <h1>{p.domain}</h1>
          <div className="p-meta">
            <StatusPill status={p.status} stage={p.stage} />
            {p.demo && <span className="pill pill-demo">Demo data</span>}
            {!p.demo && <span className="muted small">{fmtTokens(p.usage.inputTokens + p.usage.outputTokens)} tokens · {p.usage.searches} searches · est. {fmtCost(p.usage.costUsd)}</span>}
          </div>
        </div>
        <div className="p-actions">
          <button className="btn btn-ghost btn-sm" disabled={running}
            onClick={async () => { if (confirm('Re-run research? Current findings and dataset will be replaced.')) { setP(await api.research(p.id)); setTab('activity'); } }}>
            Re-run research
          </button>
          <button className="btn btn-ghost btn-sm" disabled={running}
            onClick={async () => { if (confirm('Delete this project?')) { await api.remove(p.id); onDeleted(); } }}>
            Delete
          </button>
        </div>
      </div>
      {p.error && <p className="err" role="alert">{p.error}</p>}

      <ol className="stepper" aria-label="Pipeline progress">
        {['Research', 'Review', 'Distill', 'Train'].map((s, i) => (
          <li key={s} className={i < step ? 'done' : i === step ? 'now' : ''}><span>{i + 1}</span>{s}</li>
        ))}
      </ol>

      <div className="tabs" role="tablist">
        {TABS.map(([k, l]) => (
          <button key={k} role="tab" aria-selected={tab === k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{l}</button>
        ))}
      </div>
      <div className="tabpanel">
        {tab === 'activity' && <Activity p={p} />}
        {tab === 'findings' && <Findings p={p} refresh={setP} />}
        {tab === 'dataset' && <Dataset p={p} refresh={(x) => { setP(x); }} running={running} />}
        {tab === 'evals' && <Evals p={p} />}
        {tab === 'train' && <Train p={p} />}
      </div>
    </div>
  );
}

// ---------------- Shell ----------------
export default function Workspace() {
  const [demo, setDemo] = useState(false);
  const [projects, setProjects] = useState([]);
  const [current, setCurrent] = useState(() => new URLSearchParams(location.search).get('p'));

  const load = useCallback(() => api.projects().then(setProjects).catch(() => {}), []);
  useEffect(() => { api.status().then((s) => setDemo(s.demo)).catch(() => {}); load(); }, [load]);
  useEffect(() => { const t = setInterval(load, 4000); return () => clearInterval(t); }, [load]);

  const open = (pid) => {
    setCurrent(pid);
    window.history.replaceState({}, '', pid ? `/app?p=${pid}` : '/app');
  };

  return (
    <div className="ws">
      <header className="ws-top">
        <a href="/" className="brand" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
          <img src="/logo.svg" alt="" width="24" height="24" />Distillery
        </a>
        {demo && <span className="pill pill-demo">Demo mode: no API key</span>}
        <a className="btn btn-ghost btn-sm" href="/#join" onClick={(e) => { e.preventDefault(); navigate('/'); setTimeout(() => document.getElementById('join')?.scrollIntoView(), 50); }}>Join waitlist</a>
      </header>
      <div className="ws-body">
        <nav className="ws-side" aria-label="Projects">
          <button className="btn btn-primary btn-sm btn-block" onClick={() => open(null)}>+ New project</button>
          <ul>
            {projects.map((x) => (
              <li key={x.id}>
                <button className={current === x.id ? 'on' : ''} onClick={() => open(x.id)}>
                  <span className="side-title">{x.domain}</span>
                  <span className="side-meta">
                    <StatusPill status={x.status} />
                    <span>{x.approvedCount}/{x.findingCount} approved</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <main className="ws-main">
          {current
            ? <Project key={current} id={current} onStatus={load} onDeleted={() => { open(null); load(); }} />
            : <NewProject demo={demo} onCreated={(p) => { load(); open(p.id); }} />}
        </main>
      </div>
    </div>
  );
}
