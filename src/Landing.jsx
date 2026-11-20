import { useState } from 'react';
import { api } from './api.js';
import { navigate } from './main.jsx';

const STEPS = [
  { n: '01', t: 'Research', d: 'Agents split your field into sub-topics, then search and read regulators, standards, official docs and papers — not SEO blogs.' },
  { n: '02', t: 'Verify', d: 'A skeptical reviewer agent scores every fact, rejects weak sources and contradictions, and you approve what goes in.' },
  { n: '03', t: 'Distill', d: 'Approved facts become training examples and a held-out exam, every line traceable to its source.' },
  { n: '04', t: 'Train', d: 'Fine-tune an open model you own, measure it against the exam, and send the agents back to research its weak spots.' },
];

const WHY = [
  { t: 'Yours, not rented', d: 'Open weights you can run on your own servers. Your questions never leave your network.' },
  { t: 'Expert where it counts', d: 'Small models trained on verified domain facts beat general models on the specifics general models get wrong.' },
  { t: 'Every answer has a paper trail', d: 'Each training example links back to the finding and source it came from, so you can audit what the model learned.' },
];

function Waitlist({ source }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [hp, setHp] = useState('');
  const [state, setState] = useState('idle');
  const [err, setErr] = useState('');

  async function submit(e) {
    e.preventDefault();
    if (hp) { setState('done'); return; }
    setState('sending'); setErr('');
    try { await api.waitlist({ email, role, source }); setState('done'); }
    catch (x) { setErr(x.message); setState('idle'); }
  }

  if (state === 'done') {
    return <p className="wl-done" role="status">You're on the list. We'll email you when your spot in the private beta opens.</p>;
  }
  return (
    <form className="wl" onSubmit={submit} noValidate>
      <label className="sr-only" htmlFor={`em-${source}`}>Work email</label>
      <input id={`em-${source}`} type="email" required placeholder="you@company.com" value={email}
        onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
      <label className="sr-only" htmlFor={`ro-${source}`}>Your field</label>
      <input id={`ro-${source}`} type="text" placeholder="Your field (e.g. medical devices)" value={role}
        onChange={(e) => setRole(e.target.value)} />
      <input className="hp" tabIndex={-1} aria-hidden="true" autoComplete="off" value={hp} onChange={(e) => setHp(e.target.value)} />
      <button className="btn btn-primary" disabled={state === 'sending'}>{state === 'sending' ? 'Joining…' : 'Join the waitlist'}</button>
      {err && <p className="wl-err" role="alert">{err}</p>}
    </form>
  );
}

export default function Landing() {
  return (
    <div className="landing">
      <header className="lnav">
        <div className="wrap lnav-in">
          <a href="/" className="brand"><img src="/logo.svg" alt="" width="26" height="26" />Distillery</a>
          <nav className="lnav-links">
            <a href="#how">How it works</a>
            <a href="#why">Why your own model</a>
          </nav>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/app')}>Try the demo</button>
        </div>
      </header>

      <section className="hero wrap">
        <p className="eyebrow">Research agents → your own expert model</p>
        <h1>Turn any field into an AI model you own</h1>
        <p className="lede">
          Distillery's agents research a domain from authoritative sources, verify every fact, and distill it into
          training data for a private model, so it knows your field's specifics as well as your best specialist.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={() => navigate('/app')}>Watch the agents work</button>
          <a className="btn btn-ghost" href="#join">Join the waitlist</a>
        </div>

        <div className="hero-card card" aria-label="Example verified finding">
          <div className="hc-head">
            <span className="tag">FDA 510(k) · Review process</span>
            <span className="score s5">5 / 5</span>
          </div>
          <p className="hc-claim">When FDA issues an Additional Information request, the 510(k) goes on hold and the submitter has 180 calendar days to respond or the submission is considered withdrawn.</p>
          <p className="hc-src">Source: FDA guidance, “FDA and Industry Actions on 510(k) Submissions”</p>
          <p className="hc-note"><strong>Reviewer:</strong> Correct and highly practical; primary FDA guidance.</p>
        </div>
      </section>

      <section id="how" className="section">
        <div className="wrap">
          <h2>From a one-line brief to a trained specialist</h2>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s.n} className="card step">
                <span className="step-n">{s.n}</span>
                <h3>{s.t}</h3>
                <p>{s.d}</p>
              </li>
            ))}
          </ol>
          <p className="status-note">
            Available in the demo today: research, review, and training-data export (JSONL for any fine-tuning stack).
            One-click training and evaluation are next, for waitlist members first.
          </p>
        </div>
      </section>

      <section id="why" className="section section-alt">
        <div className="wrap">
          <h2>Why train your own model?</h2>
          <ul className="why">
            {WHY.map((w) => (
              <li key={w.t}><h3>{w.t}</h3><p>{w.d}</p></li>
            ))}
          </ul>
        </div>
      </section>

      <section id="join" className="section join">
        <div className="wrap join-in">
          <h2>Get early access</h2>
          <p className="lede">We're onboarding teams in regulated and specialist fields first. Tell us yours.</p>
          <Waitlist source="landing-footer" />
          <p className="fine">No spam. One email when your spot opens.</p>
        </div>
      </section>

      <footer className="lfoot wrap">
        <span className="brand small"><img src="/logo.svg" alt="" width="20" height="20" />Distillery</span>
        <span className="muted">Built on Claude.</span>
      </footer>
    </div>
  );
}
