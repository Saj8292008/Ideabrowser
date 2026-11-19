// Outline icons only (stroke = currentColor).
const base = {
  width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round',
  'aria-hidden': true,
};

const paths = {
  bars: (<><path d="M4 20V10"/><path d="M10 20V4"/><path d="M16 20v-7"/><path d="M22 20H2"/></>),
  tagSlash: (<><path d="M3 12V4h8l9 9-7 7-9-8z"/><circle cx="7.5" cy="7.5" r="1.25"/><path d="M3 21 21 3"/></>),
  wavePlus: (<><path d="M2 12h1"/><path d="M6 8v8"/><path d="M10 5v14"/><path d="M14 9v6"/><path d="M18 18v4"/><path d="M16 20h4"/><path d="M18 3v8"/></>),
  shield: (<><path d="M12 3 4 6v6c0 4.5 3.4 8 8 9 4.6-1 8-4.5 8-9V6z"/><path d="m9 12 2 2 4-4"/></>),
  swap: (<><path d="M4 8h14"/><path d="m15 4 4 4-4 4"/><path d="M20 16H6"/><path d="m9 20-4-4 4-4"/></>),
  clipboard: (<><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V3h6v1"/><path d="m9 13 2 2 4-4"/></>),
  check: (<path d="m5 12 5 5 9-10"/>),
  plus: (<><path d="M12 5v14"/><path d="M5 12h14"/></>),
  close: (<><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>),
};

export default function Icon({ name, size = 24, ...rest }) {
  return <svg {...base} width={size} height={size} {...rest}>{paths[name]}</svg>;
}
