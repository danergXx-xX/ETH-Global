// Source citation popover — shared across variants.
// Centered modal-style card with backdrop. Closes on Esc / backdrop / X.

function ASourcePopover({ srcId, theme, locale, onClose }) {
  React.useEffect(() => {
    if (!srcId) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [srcId, onClose]);
  if (!srcId) return null;
  const src = SOURCES[srcId];
  if (!src) return null;
  const t = I18N[locale];
  const typeColors = {
    defillama: 'oklch(0.74 0.16 220)',
    coingecko: 'oklch(0.78 0.15 80)',
    rss: 'oklch(0.74 0.14 35)',
    perplexity: 'oklch(0.74 0.16 280)',
    aixbt: 'oklch(0.74 0.16 305)',
  };
  const typeColor = typeColors[src.type] || theme.accent;
  return (
    <div onClick={onClose} style={{
      position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50,
      backdropFilter: 'blur(4px)',
    }}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: 460, maxWidth: '92%',
        background: theme.bgCard, border: `1px solid ${theme.border}`,
        borderRadius: 6, overflow: 'hidden',
        fontFamily: 'var(--font-sans)',
      }}>
        <div style={{
          padding: '12px 16px', borderBottom: `1px solid ${theme.borderSoft || theme.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{
              padding: '2px 8px', borderRadius: 3,
              background: `color-mix(in oklch, ${typeColor} 18%, transparent)`,
              color: typeColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.05em',
              fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
            }}>{src.type}</span>
            <span style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
              {locale === 'en' ? 'Source' : 'Źródło'} [{srcId}]
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: theme.textDim,
            cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: 4,
          }}>×</button>
        </div>
        <div style={{ padding: '14px 16px' }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: theme.text, lineHeight: 1.35, marginBottom: 6 }}>
            {src.title}
          </div>
          <a href={src.url} target="_blank" rel="noopener" style={{
            fontSize: 11.5, color: typeColor, fontFamily: 'var(--font-mono)', wordBreak: 'break-all',
            textDecoration: 'none',
          }}>{src.url}</a>
          <div style={{
            marginTop: 12, padding: 10, borderRadius: 3,
            background: theme.bg, border: `1px solid ${theme.borderSoft || theme.border}`,
            fontSize: 12, lineHeight: 1.55, color: theme.textDim, textWrap: 'pretty',
          }}>
            "{src.snippet}"
          </div>
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>
              {t.sourceConfidence}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 4, borderRadius: 2, background: theme.bg, overflow: 'hidden' }}>
                <div style={{ width: `${src.conf * 100}%`, height: '100%', background: typeColor }} />
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: theme.text, fontWeight: 600 }}>
                {Math.round(src.conf * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

window.ASourcePopover = ASourcePopover;
