// Hero visual: a studio monitor on a warm desk showing a charcoal waveform;
// one segment (orange) lifts out, leaving a clean gap behind.
// Palette limited to text-primary, accent and background tokens.

// Deterministic pseudo-random waveform heights.
const heights = Array.from({ length: 44 }, (_, i) => {
  const v = Math.abs(Math.sin(i * 1.7) * 0.6 + Math.sin(i * 0.43) * 0.4);
  return 10 + Math.round(v * 70);
});
const BAR_W = 5;
const STEP = 8.5;
const X0 = 92;
const MID = 186;
const GAP_FROM = 22;
const GAP_TO = 29; // exclusive

export default function HeroArt() {
  return (
    <svg className="hero-art" viewBox="0 0 560 460" role="img"
      aria-label="A studio monitor showing an audio waveform with one orange segment lifted out, leaving a clean gap">
      {/* soft daylight from the left */}
      <circle cx="250" cy="200" r="190" fill="var(--text-on-accent)" opacity="0.9" />
      {/* desk */}
      <ellipse cx="280" cy="384" rx="270" ry="14" fill="var(--text-primary)" opacity="0.06" />
      {/* stand */}
      <path d="M262 330h36l10 48h-56z" fill="var(--text-primary)" opacity="0.85" />
      <rect x="222" y="374" width="116" height="8" rx="4" fill="var(--text-primary)" />
      {/* monitor */}
      <rect x="60" y="70" width="440" height="268" rx="14" fill="var(--text-primary)" />
      <rect x="72" y="82" width="416" height="232" rx="6" fill="var(--bg)" />
      {/* editor chrome */}
      <rect x="72" y="82" width="416" height="26" rx="6" fill="var(--text-primary)" opacity="0.06" />
      <circle cx="88" cy="95" r="3.5" fill="var(--text-primary)" opacity="0.25" />
      <circle cx="100" cy="95" r="3.5" fill="var(--text-primary)" opacity="0.25" />
      <circle cx="112" cy="95" r="3.5" fill="var(--text-primary)" opacity="0.25" />
      {/* timeline ticks */}
      {Array.from({ length: 13 }, (_, i) => (
        <path key={i} d={`M${92 + i * 31} 290v${i % 2 ? 4 : 8}`} stroke="var(--text-primary)" strokeOpacity="0.3" />
      ))}
      {/* center line */}
      <path d={`M88 ${MID}H${X0 + GAP_FROM * STEP - 4}M${X0 + GAP_TO * STEP - 3.5} ${MID}H472`}
        stroke="var(--text-primary)" strokeOpacity="0.2" />
      {/* waveform, with gap */}
      {heights.map((h, i) =>
        i >= GAP_FROM && i < GAP_TO ? null : (
          <rect key={i} x={X0 + i * STEP} y={MID - h / 2} width={BAR_W} height={h} rx="2.5"
            fill="var(--text-primary)" />
        ))}
      {/* the clean gap left behind */}
      <rect x={X0 + GAP_FROM * STEP - 4} y={MID - 44} width={(GAP_TO - GAP_FROM) * STEP + 0.5} height="88" rx="6"
        fill="none" stroke="var(--text-primary)" strokeOpacity="0.35" strokeDasharray="4 4" />
      {/* lifted segment */}
      <g className="hero-art__lift">
        <rect x={X0 + GAP_FROM * STEP - 8} y="16" width={(GAP_TO - GAP_FROM) * STEP + 8} height="96" rx="8"
          fill="var(--text-on-accent)" stroke="var(--accent)" strokeWidth="2" />
        {heights.slice(GAP_FROM, GAP_TO).map((h, j) => (
          <rect key={j} x={X0 + (GAP_FROM + j) * STEP} y={64 - (h * 0.5) / 2 - 4} width={BAR_W} height={h * 0.5 + 8} rx="2.5"
            fill="var(--accent)" />
        ))}
      </g>
      {/* lift arrow */}
      <path d={`M${X0 + 25.5 * STEP} ${MID - 52}v-58`} stroke="var(--accent)" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" />
      {/* microphone on desk */}
      <g fill="var(--text-primary)">
        <rect x="512" y="300" width="28" height="56" rx="14" />
        <rect x="523" y="354" width="6" height="22" />
        <rect x="507" y="374" width="38" height="7" rx="3.5" />
      </g>
      {/* mug */}
      <path d="M22 344h40v30a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6z" fill="var(--text-primary)" opacity="0.85" />
      <path d="M62 352h6a8 8 0 0 1 0 16h-6" fill="none" stroke="var(--text-primary)" strokeOpacity="0.85" strokeWidth="4" />
    </svg>
  );
}
