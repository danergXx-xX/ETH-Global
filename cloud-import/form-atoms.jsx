// Component 2 — small atoms (label, field, asset picker, action cards, banners).
// Uses navy theme tokens (D_DARK / D_LIGHT) like Component 1.

function FLabel({ children, theme, hint }) {
  return <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
    <span style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{children}</span>
    {hint && <span style={{ fontSize: 10.5, color: theme.textFaint }}>{hint}</span>}
  </div>;
}

function FInput({ value, onChange, placeholder, theme, mono, suffix, prefix, error, autoFocus }) {
  return <div style={{
    display: 'flex', alignItems: 'center',
    background: theme.bg, border: `1px solid ${error ? theme.voteAgainst : theme.border}`,
    borderRadius: 4, padding: '0 10px',
    transition: 'border-color .15s',
  }}>
    {prefix && <span style={{ color: theme.textFaint, fontSize: 12.5, fontFamily: 'var(--font-mono)', marginRight: 6 }}>{prefix}</span>}
    <input value={value || ''} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} autoFocus={autoFocus}
      style={{
        flex: 1, padding: '9px 0', background: 'transparent', border: 'none', outline: 'none',
        color: theme.text, fontSize: 13.5, fontFamily: mono ? 'var(--font-mono)' : 'var(--font-sans)', fontWeight: 500,
      }} />
    {suffix && <span style={{ color: theme.textFaint, fontSize: 11.5, fontFamily: 'var(--font-mono)', marginLeft: 6 }}>{suffix}</span>}
  </div>;
}

function FTextArea({ value, onChange, placeholder, theme, rows = 3, autoFocus }) {
  return <textarea value={value || ''} onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder} rows={rows} autoFocus={autoFocus}
    style={{
      width: '100%', resize: 'vertical', padding: '10px 12px',
      background: theme.bg, border: `1px solid ${theme.border}`,
      borderRadius: 4, outline: 'none',
      color: theme.text, fontSize: 13.5, lineHeight: 1.5,
      fontFamily: 'var(--font-sans)', fontWeight: 500,
      transition: 'border-color .15s',
    }}
    onFocus={(e) => e.target.style.borderColor = theme.amber}
    onBlur={(e) => e.target.style.borderColor = theme.border} />;
}

function FAssetPicker({ value, onChange, theme, locale }) {
  const [open, setOpen] = React.useState(false);
  const sel = TREASURY.assets.find((a) => a.sym === value) || TREASURY.assets[0];
  return <div style={{ position: 'relative' }}>
    <button onClick={() => setOpen(!open)} style={{
      width: '100%', display: 'flex', alignItems: 'center', gap: 10,
      padding: '8px 10px', background: theme.bg, border: `1px solid ${theme.border}`,
      borderRadius: 4, cursor: 'pointer',
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', background: sel.color,
        color: theme.inverseText, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
      }}>{sel.icon}</span>
      <div style={{ flex: 1, textAlign: 'left' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: theme.text }}>{sel.sym}</div>
        <div style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>
          {sel.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })} avail
        </div>
      </div>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M3 4.5l3 3 3-3" stroke={theme.textDim} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
    {open && <div style={{
      position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 100,
      background: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: 4,
      boxShadow: '0 8px 28px -10px rgba(0,0,0,.4)',
      maxHeight: 220, overflow: 'auto',
    }}>
      {TREASURY.assets.map((a) => (
        <button key={a.sym} onClick={() => { onChange(a.sym); setOpen(false); }} style={{
          display: 'flex', alignItems: 'center', gap: 10, width: '100%',
          padding: '8px 10px', background: a.sym === value ? theme.bgRow : 'transparent',
          border: 'none', cursor: 'pointer', textAlign: 'left',
          borderBottom: `1px solid ${theme.borderSoft}`,
        }}>
          <span style={{
            width: 22, height: 22, borderRadius: '50%', background: a.color,
            color: theme.inverseText, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
          }}>{a.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12.5, color: theme.text, fontWeight: 600 }}>{a.sym}</div>
            <div style={{ fontSize: 10, color: theme.textFaint }}>{a.name}</div>
          </div>
          <div style={{ fontSize: 10.5, color: theme.textDim, fontFamily: 'var(--font-mono)' }}>
            {a.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </div>
        </button>
      ))}
    </div>}
  </div>;
}

function FActionCards({ value, onChange, theme, t }) {
  const opts = [
    { id: 'transfer', label: t.transfer, hint: t.transferHint, icon:
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M5 12h14m0 0l-5-5m5 5l-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    },
    { id: 'swap', label: t.swap, hint: t.swapHint, icon:
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M7 7h12m0 0l-3-3m3 3l-3 3M17 17H5m0 0l3 3m-3-3l3-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    },
    { id: 'deposit', label: t.deposit, hint: t.depositHint, icon:
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M12 4v12m0 0l-4-4m4 4l4-4M5 20h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
    },
  ];
  return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
    {opts.map((o) => {
      const active = o.id === value;
      return <button key={o.id} onClick={() => onChange(o.id)} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6,
        padding: '11px 12px', textAlign: 'left',
        background: active ? `color-mix(in oklch, ${theme.amber} 14%, ${theme.bg})` : theme.bg,
        border: `1px solid ${active ? theme.amber : theme.border}`,
        borderRadius: 4, cursor: 'pointer',
        color: active ? theme.amber : theme.text, transition: 'border-color .15s, background .15s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: active ? theme.amber : theme.textDim }}>{o.icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: active ? theme.amber : theme.text, letterSpacing: '-0.005em' }}>{o.label}</span>
        </div>
        <div style={{ fontSize: 10.5, color: theme.textFaint, lineHeight: 1.35 }}>{o.hint}</div>
      </button>;
    })}
  </div>;
}

function FProtoPicker({ action, value, onChange, theme, locale }) {
  const opts = PROTOCOLS[action] || [];
  return <div style={{ display: 'grid', gridTemplateColumns: action === 'deposit' ? '1fr 1fr' : '1fr 1fr 1fr', gap: 6 }}>
    {opts.map((p) => {
      const active = p.id === value;
      return <button key={p.id} onClick={() => onChange(p.id)} style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3,
        padding: '8px 10px', textAlign: 'left',
        background: active ? `color-mix(in oklch, ${theme.amber} 14%, ${theme.bg})` : theme.bg,
        border: `1px solid ${active ? theme.amber : theme.border}`,
        borderRadius: 3, cursor: 'pointer', transition: 'border-color .15s',
      }}>
        <span style={{ fontSize: 11.5, fontWeight: 600, color: active ? theme.amber : theme.text }}>{p.label[locale]}</span>
        <span style={{ fontSize: 10, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>{p.hint}</span>
      </button>;
    })}
  </div>;
}

// Validation banner — collapses errors / warnings / info into a single ribbon.
function FValidationBanner({ result, theme, t, locale }) {
  if (!result) return null;
  const { errors, warnings, info } = result;
  const has = errors.length > 0 || warnings.length > 0;
  if (!has && info.length === 0) return null;
  const isError = errors.length > 0;
  const isWarn = !isError && warnings.length > 0;
  const color = isError ? theme.voteAgainst : isWarn ? theme.amber : theme.voteFor;
  const bgTint = `color-mix(in oklch, ${color} 12%, ${theme.bg})`;
  const items = isError ? errors : (isWarn ? warnings : info);
  const label = isError ? t.hardBlock : isWarn ? t.softWarning : t.rulesPassed;
  return <div style={{
    background: bgTint, border: `1px solid color-mix(in oklch, ${color} 40%, ${theme.border})`,
    borderRadius: 4, padding: '9px 12px',
    display: 'flex', flexDirection: 'column', gap: 4,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span style={{
        width: 14, height: 14, borderRadius: '50%', background: color,
        color: theme.inverseText, fontSize: 10, fontWeight: 800,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-mono)',
      }}>{isError ? '!' : isWarn ? '!' : '✓'}</span>
      <span style={{ fontSize: 11, color, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{label}</span>
      <span style={{ fontSize: 10.5, color: theme.textFaint, marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
        {t.rule}: max_per_protocol_pct
      </span>
    </div>
    {items.map((m, i) => (
      <div key={i} style={{ fontSize: 12, color: theme.text, lineHeight: 1.45, paddingLeft: 22 }}>
        {m[locale] || m.en}
      </div>
    ))}
  </div>;
}

// AI confidence bar with label
function FConfidenceBar({ value, theme, label }) {
  const pct = Math.round(value * 100);
  const color = value > 0.7 ? theme.voteFor : value > 0.4 ? theme.amber : theme.voteAgainst;
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <span style={{ fontSize: 10, color: theme.textFaint, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
    <div style={{ flex: 1, height: 4, background: theme.bgRow, borderRadius: 2, overflow: 'hidden', maxWidth: 100 }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width .3s' }} />
    </div>
    <span style={{ fontSize: 10.5, color: theme.text, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{pct}%</span>
  </div>;
}

Object.assign(window, { FLabel, FInput, FTextArea, FAssetPicker, FActionCards, FProtoPicker, FValidationBanner, FConfidenceBar });
