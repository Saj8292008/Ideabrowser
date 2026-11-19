import { useEffect, useState, useCallback } from 'react';
import {
  CTA_LABEL, nav, hero, problem, howItWorks, leakReport, benefits, pricing, faq, finalCta,
} from './content.js';
import CaptureForm from './CaptureForm.jsx';
import CaptureModal from './CaptureModal.jsx';
import HeroArt from './HeroArt.jsx';
import Icon from './Icons.jsx';

// Reveal-on-scroll: elements with [data-reveal] enter from scale(.95)+opacity 0.
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const stagger = (i) => ({ '--d': `${i * 60}ms` });

function Logo() {
  return (
    <a href="#top" className="wordmark" aria-label="PodSweep home">
      <img src="/logo.svg" alt="" width="28" height="28" />
      <span>PodSweep</span>
    </a>
  );
}

function LeakReport() {
  return (
    <figure className="report card" data-reveal style={stagger(0)}>
      <figcaption className="report__head">
        <span className="report__title">{leakReport.title}</span>
        {leakReport.meta.map((m) => (
          <span key={m} className="report__meta"><span aria-hidden="true" className="report__dot">·</span>{m}</span>
        ))}
      </figcaption>
      <div className="report__table" role="table" aria-label="Leak report findings">
        <div className="report__row report__row--labels" role="row">
          <span role="columnheader">Episode</span>
          <span role="columnheader">Traffic</span>
          <span role="columnheader">Flag</span>
          <span role="columnheader">Outcome</span>
        </div>
        {leakReport.rows.map((r) => (
          <div className="report__row" role="row" key={r.episode}>
            <span role="cell" className="report__ep">
              <strong>{r.episode}</strong> — “{r.name}”
            </span>
            <span role="cell" className="report__traffic">{r.traffic}</span>
            <span role="cell" className="report__flag">
              <span className="accent-text" aria-label="Flag">⚑ </span>
              {r.flag.map((p, i) => (p.code
                ? <code key={i} className="accent-text">{p.t}</code>
                : <span key={i}>{p.t}</span>))}
            </span>
            <span role="cell" className="report__outcome"><span aria-hidden="true">→ </span>{r.outcome}</span>
          </div>
        ))}
      </div>
      <p className="report__foot">{leakReport.footer}</p>
    </figure>
  );
}

export default function App() {
  useReveal();
  const [modal, setModal] = useState({ open: false, source: 'nav', tier: null });
  const openCapture = useCallback((source, tier = null) => setModal({ open: true, source, tier }), []);
  const close = useCallback(() => setModal((m) => ({ ...m, open: false })), []);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="nav">
        <div className="container nav__inner">
          <Logo />
          <nav aria-label="Primary" className="nav__links">
            {nav.links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          </nav>
          <button type="button" className="btn btn--primary btn--sm" onClick={() => openCapture('nav')}>
            {CTA_LABEL}
          </button>
        </div>
      </header>

      <main id="main">
        {/* HERO — background, split layout, no card */}
        <section id="top" className="section section--bg hero">
          <div className="container hero__grid">
            <div className="hero__copy">
              <h1 className="h1" data-reveal style={stagger(0)}>{hero.headline}</h1>
              <p className="lede" data-reveal style={stagger(1)}>{hero.subheadline}</p>
              <div data-reveal style={stagger(2)}>
                <CaptureForm source="hero" />
              </div>
              <p className="hero__cred small" data-reveal style={stagger(3)}>{hero.credibility}</p>
            </div>
            <div className="hero__art" data-reveal style={stagger(2)}>
              <HeroArt />
            </div>
          </div>
        </section>

        {/* PROBLEM — white band, four open columns */}
        <section className="section section--surface" aria-labelledby="problem-h">
          <div className="container">
            <h2 id="problem-h" className="h2 section__title" data-reveal>{problem.headline}</h2>
            <ul className="problem__grid">
              {problem.points.map((p, i) => (
                <li key={i} className="problem__item" data-reveal style={stagger(i)}>
                  <span className="problem__num" aria-hidden="true">0{i + 1}</span>
                  <p>{p}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HOW IT WORKS — background, three numbered cards + worked example */}
        <section id="how-it-works" className="section section--bg" aria-labelledby="how-h">
          <div className="container">
            <h2 id="how-h" className="h2 section__title" data-reveal>{howItWorks.headline}</h2>
            <ol className="steps">
              {howItWorks.steps.map((s, i) => (
                <li key={s.title} className="card step" data-reveal style={stagger(i)}>
                  <span className="step__num" aria-hidden="true">{i + 1}</span>
                  <h3 className="h3"><span className="sr-only">Step {i + 1} — </span>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
            <p className="demo-intro" data-reveal>{howItWorks.demoIntro}</p>
            <LeakReport />
            <div className="after-report" data-reveal>
              <CaptureForm source="leak-report" showReassurance />
            </div>
          </div>
        </section>

        {/* BENEFITS — white band, 3-col bordered cards */}
        <section className="section section--surface" aria-label="Benefits">
          <div className="container">
            <ul className="benefits">
              {benefits.map((b, i) => (
                <li key={b.title} className="card benefit" data-reveal style={stagger(i % 3)}>
                  <span className="benefit__icon"><Icon name={b.icon} /></span>
                  <h3 className="h3">{b.title}</h3>
                  <p>{b.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* PRICING — background, three cards, recommended stands out */}
        <section id="pricing" className="section section--bg" aria-labelledby="pricing-h">
          <div className="container">
            <h2 id="pricing-h" className="h2 section__title" data-reveal>Pricing</h2>
            <ul className="tiers">
              {pricing.map((t, i) => (
                <li key={t.id} className={`card tier${t.recommended ? ' tier--rec' : ''}`} data-reveal style={stagger(i)}>
                  {t.recommended && <span className="badge">Recommended</span>}
                  <h3 className="h3">{t.name}</h3>
                  <p className="tier__price">
                    <span className="tier__amount">{t.price}</span>
                    <span className="tier__cadence">{t.cadence.startsWith('/') ? t.cadence : ` ${t.cadence}`}</span>
                  </p>
                  <p className="tier__best"><strong>Best for:</strong> {t.bestFor}</p>
                  <ul className="tier__features">
                    {t.features.map((f) => (
                      <li key={f}><Icon name="check" size={18} />{f}</li>
                    ))}
                  </ul>
                  <button type="button" className={`btn ${t.recommended ? 'btn--primary' : 'btn--secondary'} btn--block`}
                    onClick={() => openCapture('pricing', t.name)}>
                    {t.button}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* FAQ — white band, open accordion with dividers */}
        <section id="faq" className="section section--surface" aria-labelledby="faq-h">
          <div className="container container--narrow">
            <h2 id="faq-h" className="h2 section__title" data-reveal>FAQ</h2>
            <div className="faq">
              {faq.map((f, i) => (
                <details key={f.q} className="faq__item" open={i === 0}>
                  <summary>
                    <span className="h3">{f.q}</span>
                    <Icon name="plus" size={20} className="faq__icon" />
                  </summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA — dark band */}
        <section className="section section--dark" aria-labelledby="final-h">
          <div className="container final">
            <h2 id="final-h" className="h2" data-reveal>{finalCta.line}</h2>
            <p className="final__risk" data-reveal style={stagger(1)}>{finalCta.riskReversal}</p>
            <div data-reveal style={stagger(2)} className="final__form">
              <CaptureForm source="final-cta" variant="dark" />
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer__inner">
          <Logo />
          <p className="small">© {new Date().getFullYear()} PodSweep. Founding early access.</p>
        </div>
      </footer>

      <CaptureModal open={modal.open} source={modal.source} tier={modal.tier} onClose={close} />
    </>
  );
}
