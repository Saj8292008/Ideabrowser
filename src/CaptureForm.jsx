import { useId, useState } from 'react';
import { CTA_LABEL, capture } from './content.js';
import { saveLead } from './leads.js';

export default function CaptureForm({ source, tier = null, variant = 'light', autoFocus = false, showReassurance = false }) {
  const id = useId();
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'sending') return;
    setStatus('sending');
    setError('');
    const res = await saveLead({ email, source, tier, honeypot });
    if (res.ok) setStatus('done');
    else { setStatus('error'); setError(res.error); }
  }

  if (status === 'done') {
    return (
      <div className={`capture capture--${variant} capture--done`} role="status" aria-live="polite">
        <p className="capture__success">{capture.success}</p>
      </div>
    );
  }

  return (
    <form className={`capture capture--${variant}`} onSubmit={onSubmit} noValidate data-source={source}>
      <div className="capture__row">
        <label htmlFor={`${id}-email`} className="sr-only">Email address</label>
        <input
          id={`${id}-email`}
          className="capture__input"
          type="email"
          name="email"
          inputMode="email"
          autoComplete="email"
          required
          placeholder={capture.placeholder}
          value={email}
          autoFocus={autoFocus}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={status === 'error'}
          aria-describedby={`${id}-note`}
        />
        <button className="btn btn--primary" type="submit" disabled={status === 'sending'}>
          {status === 'sending' ? 'Saving…' : CTA_LABEL}
        </button>
      </div>
      {/* Honeypot: visually hidden, skipped by keyboard and screen readers. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Website</label>
        <input id={`${id}-website`} type="text" name="website" tabIndex={-1} autoComplete="off"
          value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>
      <p id={`${id}-note`} className="capture__note">
        {status === 'error' ? <span className="capture__error" role="alert">{error}</span> : capture.privacy}
      </p>
      {showReassurance && <p className="capture__note capture__reassure">{capture.reassurance}</p>}
    </form>
  );
}
