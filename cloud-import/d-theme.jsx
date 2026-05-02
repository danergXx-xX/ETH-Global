// Variant D — "Hybrid" — navy palette, generated portrait avatars,
// full-feature live debate viewer.
//
// Features beyond mockup-baseline:
//   - Pause / Resume / Stop debate (Space, Esc keyboard)
//   - Skip to verdict (Right arrow)
//   - Replay (R)
//   - Empty state with CTA + keyboard hint
//   - prefers-reduced-motion respect (instant reveal)
//   - Confidence progress bar
//   - ETA "est. 18s remaining"
//   - Light / Dark theme toggle
//   - Gas estimate + network indicator + block height
//   - Wallet identity with ENS reverse resolve (mocked)
//   - 0G Storage archive status
//   - "Not financial advice" disclaimer
//   - Hover Copy / Share per claim
//   - Timestamp per claim (T+12.4s)
//   - Focus / Unfocus an agent
//   - Per-agent retry + continue-without on error

const D_DARK = {
  name: 'dark',
  bg: 'oklch(0.18 0.025 255)',
  bgPanel: 'oklch(0.22 0.028 255)',
  bgRow: 'oklch(0.25 0.030 255)',
  border: 'oklch(0.33 0.030 255)',
  borderSoft: 'oklch(0.28 0.028 255)',
  text: 'oklch(0.96 0.006 255)',
  textDim: 'oklch(0.76 0.012 255)',
  textFaint: 'oklch(0.56 0.014 255)',
  amber: 'oklch(0.82 0.14 75)',
  voteFor: 'oklch(0.74 0.16 152)',
  voteAgainst: 'oklch(0.70 0.18 22)',
  voteAbstain: 'oklch(0.66 0.014 255)',
  inverseText: 'oklch(0.18 0.012 255)',
};

const D_LIGHT = {
  name: 'light',
  bg: 'oklch(0.97 0.008 255)',
  bgPanel: 'oklch(1.00 0 0)',
  bgRow: 'oklch(0.94 0.010 255)',
  border: 'oklch(0.86 0.014 255)',
  borderSoft: 'oklch(0.91 0.012 255)',
  text: 'oklch(0.22 0.025 255)',
  textDim: 'oklch(0.40 0.020 255)',
  textFaint: 'oklch(0.58 0.014 255)',
  amber: 'oklch(0.55 0.14 65)',
  voteFor: 'oklch(0.50 0.16 152)',
  voteAgainst: 'oklch(0.50 0.20 22)',
  voteAbstain: 'oklch(0.55 0.012 255)',
  inverseText: 'oklch(0.98 0.005 255)',
};

const D_THEME = D_DARK;

function usePrefersReducedMotion() {
  const [reduce, setReduce] = React.useState(false);
  React.useEffect(() => {
    const m = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(m.matches);
    const fn = (e) => setReduce(e.matches);
    m.addEventListener('change', fn);
    return () => m.removeEventListener('change', fn);
  }, []);
  return reduce;
}

window.D_THEME = D_THEME;
window.D_DARK = D_DARK;
window.D_LIGHT = D_LIGHT;
window.usePrefersReducedMotion = usePrefersReducedMotion;
