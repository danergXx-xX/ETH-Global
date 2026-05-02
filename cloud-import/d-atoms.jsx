// Avatar + portrait + small visual atoms for variant D.

function DAvatar({ agent, pulsing, dimmed }) {
  return (
    <div style={{ position: 'relative', flexShrink: 0, opacity: dimmed ? 0.45 : 1, transition: 'opacity .25s' }}>
      {pulsing && (
        <div style={{
          position: 'absolute', inset: -4, borderRadius: '50%',
          border: `1.5px solid ${agent.color.accent}`,
          animation: 'a-pulse 1.4s ease-out infinite',
          pointerEvents: 'none',
        }} />
      )}
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        overflow: 'hidden', flexShrink: 0,
        boxShadow: `0 0 0 1.5px color-mix(in oklch, ${agent.color.accent} 60%, white)`,
      }}>
        <AgentPortrait id={agent.id} hue={agent.color.hue} accent={agent.color.accent} />
      </div>
    </div>
  );
}

function AgentPortrait({ id, hue, accent }) {
  const skin = `oklch(0.78 0.06 ${(hue + 30) % 360})`;
  const skinShadow = `oklch(0.62 0.07 ${(hue + 30) % 360})`;
  const bgTop = `oklch(0.55 0.14 ${hue})`;
  const bgBot = `oklch(0.30 0.10 ${hue})`;
  const cloth = `oklch(0.32 0.08 ${hue})`;
  const clothLight = `oklch(0.45 0.10 ${hue})`;
  const hair = id === 'bull' ? `oklch(0.28 0.06 60)`
    : id === 'bear' ? `oklch(0.22 0.04 30)`
    : id === 'risk' ? `oklch(0.45 0.08 50)`
    : id === 'tech' ? `oklch(0.20 0.03 250)`
    : `oklch(0.30 0.08 320)`;
  const accessory = (
    id === 'bull' ? <path d="M28 18 Q26 11 32 11 M40 18 Q42 11 36 11" stroke={`oklch(0.95 0.05 ${hue})`} strokeWidth="2" fill="none" strokeLinecap="round" />
    : id === 'bear' ? <g><circle cx="28" cy="30" r="4" fill="none" stroke={`oklch(0.20 0.02 250)`} strokeWidth="1.4" /><circle cx="40" cy="30" r="4" fill="none" stroke={`oklch(0.20 0.02 250)`} strokeWidth="1.4" /><line x1="32" y1="30" x2="36" y2="30" stroke={`oklch(0.20 0.02 250)`} strokeWidth="1.4" /></g>
    : id === 'risk' ? <path d="M22 28 Q34 22 46 28" stroke={hair} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    : id === 'tech' ? <g><rect x="24" y="27" width="8" height="6" rx="1" fill="none" stroke={`oklch(0.30 0.03 250)`} strokeWidth="1.3" /><rect x="36" y="27" width="8" height="6" rx="1" fill="none" stroke={`oklch(0.30 0.03 250)`} strokeWidth="1.3" /><line x1="32" y1="30" x2="36" y2="30" stroke={`oklch(0.30 0.03 250)`} strokeWidth="1.3" /></g>
    : <path d="M24 22 Q34 17 44 22" stroke={accent} strokeWidth="1.8" fill="none" strokeLinecap="round" />
  );
  return (
    <svg viewBox="0 0 68 68" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={`bg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={bgTop} />
          <stop offset="1" stopColor={bgBot} />
        </linearGradient>
      </defs>
      <rect width="68" height="68" fill={`url(#bg-${id})`} />
      <path d="M6 68 Q6 50 22 46 L46 46 Q62 50 62 68 Z" fill={cloth} />
      <path d="M22 46 Q34 50 46 46 L46 50 Q34 54 22 50 Z" fill={clothLight} opacity="0.7" />
      <path d="M28 42 L28 48 Q34 50 40 48 L40 42 Z" fill={skinShadow} />
      <ellipse cx="34" cy="30" rx="12" ry="13" fill={skin} />
      {id === 'sentiment' ? (
        <path d="M22 28 Q22 16 34 15 Q46 16 46 28 Q46 22 40 21 Q34 19 28 21 Q22 22 22 28 Z" fill={hair} />
      ) : id === 'bear' ? (
        <path d="M22 26 Q22 14 34 14 Q46 14 46 26 Q44 22 40 22 Q34 18 28 22 Q24 22 22 26 Z" fill={hair} />
      ) : id === 'bull' ? (
        <path d="M22 27 Q22 16 34 15 Q46 16 46 27 Q42 21 38 22 Q34 18 30 22 Q26 21 22 27 Z" fill={hair} />
      ) : id === 'tech' ? (
        <path d="M22 26 Q22 14 34 14 Q46 14 46 26 Q42 18 36 18 Q30 18 22 26 Z" fill={hair} />
      ) : (
        <path d="M22 28 Q24 16 34 15 Q44 16 46 28 Q42 23 38 23 Q34 21 30 23 Q26 23 22 28 Z" fill={hair} />
      )}
      <ellipse cx="34" cy="34" rx="10" ry="4" fill={skinShadow} opacity="0.18" />
      <ellipse cx="30" cy="30" rx="1.2" ry="1.6" fill="oklch(0.20 0.02 250)" />
      <ellipse cx="38" cy="30" rx="1.2" ry="1.6" fill="oklch(0.20 0.02 250)" />
      <path d={id === 'bear' ? "M30 36 Q34 35 38 36" : id === 'bull' ? "M30 36 Q34 38 38 36" : "M31 36 Q34 37 37 36"} stroke="oklch(0.40 0.06 30)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      {accessory}
    </svg>
  );
}

function AnimatedDots() {
  const [n, setN] = React.useState(1);
  React.useEffect(() => {
    const id = setInterval(() => setN((v) => (v % 3) + 1), 380);
    return () => clearInterval(id);
  }, []);
  return <span style={{ display: 'inline-block', width: 14, textAlign: 'left' }}>{'.'.repeat(n)}</span>;
}

function AWaveform({ color }) {
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: 1.5, height: 10 }}>
    {[0, 1, 2, 3, 4].map((i) => (
      <span key={i} style={{
        width: 2, height: '100%', background: color, borderRadius: 1,
        animation: `a-wave 0.9s ease-in-out infinite`,
        animationDelay: `${i * 0.12}s`,
        transformOrigin: 'center',
      }} />
    ))}
  </span>;
}

function DProgressGlyph({ progress, color, bg }) {
  const cells = 10;
  const filled = Math.round(progress * cells);
  return <span style={{ display: 'inline-flex', gap: 2 }}>
    {Array.from({ length: cells }).map((_, i) => (
      <span key={i} style={{ width: 4, height: 8, background: i < filled ? color : 'oklch(0.36 0.020 255)' }} />
    ))}
  </span>;
}

// shadcn-style tooltip with description + keyboard shortcut.
// Wraps a single child trigger; renders a fixed-positioned popover on hover/focus.
function DTooltip({ children, label, hint, shortcut, theme, side = 'bottom', delay = 350 }) {
  const [open, setOpen] = React.useState(false);
  const [pos, setPos] = React.useState(null);
  const triggerRef = React.useRef(null);
  const timerRef = React.useRef(null);
  const tipTheme = theme || { bg: 'oklch(0.18 0.02 255)', text: 'oklch(0.96 0.006 255)', border: 'oklch(0.30 0.02 255)', muted: 'oklch(0.60 0.015 255)' };

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const el = triggerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      let top, left;
      if (side === 'bottom') { top = r.bottom + 6; left = r.left + r.width / 2; }
      else if (side === 'top') { top = r.top - 6; left = r.left + r.width / 2; }
      else if (side === 'right') { top = r.top + r.height / 2; left = r.right + 6; }
      else { top = r.top + r.height / 2; left = r.left - 6; }
      setPos({ top, left });
      setOpen(true);
    }, delay);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setOpen(false);
  };

  // Clone child to attach ref + handlers without wrapping in another span (preserves layout)
  const child = React.Children.only(children);
  const trigger = React.cloneElement(child, {
    ref: (node) => {
      triggerRef.current = node;
      const orig = child.ref;
      if (typeof orig === 'function') orig(node);
      else if (orig && typeof orig === 'object') orig.current = node;
    },
    onMouseEnter: (e) => { show(); child.props.onMouseEnter?.(e); },
    onMouseLeave: (e) => { hide(); child.props.onMouseLeave?.(e); },
    onFocus: (e) => { show(); child.props.onFocus?.(e); },
    onBlur: (e) => { hide(); child.props.onBlur?.(e); },
  });

  const transform = side === 'bottom' ? 'translate(-50%, 0)'
    : side === 'top' ? 'translate(-50%, -100%)'
    : side === 'right' ? 'translate(0, -50%)'
    : 'translate(-100%, -50%)';

  return <>
    {trigger}
    {open && pos && ReactDOM.createPortal(
      <div style={{
        position: 'fixed', top: pos.top, left: pos.left, transform,
        zIndex: 999999, pointerEvents: 'none',
        background: tipTheme.bg,
        border: `1px solid ${tipTheme.border}`,
        boxShadow: '0 8px 24px -8px rgba(0,0,0,.5)',
        borderRadius: 6,
        padding: '7px 10px',
        fontFamily: 'var(--font-sans)', fontSize: 11.5, lineHeight: 1.4,
        color: tipTheme.text,
        maxWidth: 240, minWidth: 'max-content',
        opacity: 0, animation: 'a-tooltip-in 0.12s ease-out forwards',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600, letterSpacing: '-0.005em' }}>{label}</span>
          {shortcut && <kbd style={{
            fontFamily: 'var(--font-mono)', fontSize: 10,
            padding: '1px 5px', borderRadius: 3,
            background: 'rgba(255,255,255,.08)', border: `1px solid ${tipTheme.border}`,
            color: tipTheme.muted, fontWeight: 500,
          }}>{shortcut}</kbd>}
        </div>
        {hint && <div style={{ marginTop: 3, color: tipTheme.muted, fontSize: 11, fontWeight: 400 }}>{hint}</div>}
      </div>,
      document.body
    )}
  </>;
}

window.DAvatar = DAvatar;
window.AgentPortrait = AgentPortrait;
window.AnimatedDots = AnimatedDots;
window.AWaveform = AWaveform;
window.DProgressGlyph = DProgressGlyph;
window.DTooltip = DTooltip;
