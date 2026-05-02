// Component 5: Protocol Registry — UI atoms (badges, audit chips, risk pill, contract row).

function RegStatusBadge({ status, t, theme, size = 'sm' }) {
  const c = regStatusColor(status, theme);
  const label = {
    whitelisted: t.statusWhitelisted,
    review: t.statusReview,
    deprecated: t.statusDeprecated,
    banned: t.statusBanned,
  }[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '2px 7px' : '3px 9px',
      borderRadius: 4,
      background: c.bg,
      color: c.text,
      fontSize: size === 'sm' ? 9.5 : 10.5,
      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 99, background: c.dot }} />
      {label}
    </span>
  );
}

// Tier pill: A / A- / B+ / C
function RegRiskPill({ tier, score, theme, size = 'sm' }) {
  const color = regRiskColor(tier);
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: size === 'sm' ? '2px 6px' : '3px 8px',
      borderRadius: 4,
      background: theme.cardBg,
      border: `1px solid ${color}40`,
      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
      fontSize: size === 'sm' ? 10 : 11,
      color,
      fontWeight: 700,
      letterSpacing: 0.4,
    }}>
      {tier}
      {score != null && (
        <span style={{ color: theme.muted, fontWeight: 500, fontSize: 9.5 }}>{score}</span>
      )}
    </span>
  );
}

// Audit chip — firm + verdict color
function RegAuditChip({ audit, t, theme }) {
  const verdictColor = audit.verdict === 'pass'
    ? 'oklch(0.74 0.16 152)'
    : audit.verdict === 'pass-w-rec'
      ? 'oklch(0.82 0.14 75)'
      : 'oklch(0.78 0.18 22)';
  const verdictLabel = audit.verdict === 'pass' ? t.pass : audit.verdict === 'pass-w-rec' ? t.passWithRec : t.fail;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 7px 3px 8px',
      borderRadius: 4,
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
      fontSize: 10,
      color: theme.text,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontWeight: 600 }}>{audit.firm}</span>
      <span style={{ color: theme.muted }}>·</span>
      <span style={{ color: theme.muted }}>{audit.date}</span>
      <span style={{ width: 1, height: 9, background: theme.border }} />
      <span style={{ color: verdictColor, fontWeight: 600 }}>{verdictLabel}</span>
    </span>
  );
}

// Source kind icon (just colored letter or shape)
function RegSourceIcon({ kind, theme, size = 14 }) {
  const colors = {
    tvl:       { bg: 'oklch(0.30 0.10 252 / 0.4)', fg: 'oklch(0.78 0.13 252)', glyph: 'L' },
    oracle:    { bg: 'oklch(0.30 0.07 152 / 0.4)', fg: 'oklch(0.78 0.13 152)', glyph: 'O' },
    protocol:  { bg: 'oklch(0.30 0.05 280 / 0.4)', fg: 'oklch(0.80 0.12 280)', glyph: 'P' },
    audit:     { bg: 'oklch(0.30 0.06 75 / 0.4)',  fg: 'oklch(0.85 0.14 75)',  glyph: 'A' },
    sentiment: { bg: 'oklch(0.30 0.07 22 / 0.4)',  fg: 'oklch(0.80 0.16 22)',  glyph: 'S' },
    price:     { bg: 'oklch(0.30 0.05 200 / 0.4)', fg: 'oklch(0.78 0.10 200)', glyph: '$' },
  };
  const c = colors[kind] || colors.protocol;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: size,
      height: size,
      borderRadius: 3,
      background: c.bg,
      color: c.fg,
      fontFamily: 'var(--font-mono, ui-monospace, monospace)',
      fontSize: size * 0.7,
      fontWeight: 700,
    }}>{c.glyph}</span>
  );
}

// Contract row: label, address mono, verified check, optional proxy
function RegContractRow({ contract, theme, t }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '7px 10px',
      background: theme.bgElev,
      border: `1px solid ${theme.border}`,
      borderRadius: 4,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
        <span style={{
          fontSize: 9.5,
          color: theme.muted,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          textTransform: 'uppercase',
          letterSpacing: 0.5,
          minWidth: 60,
        }}>{contract.label}</span>
        <span style={{
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontSize: 11,
          color: theme.text,
          letterSpacing: 0.2,
        }}>{contract.address}</span>
        {contract.verified && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 3,
            color: 'oklch(0.74 0.16 152)',
            fontSize: 9.5,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}>
            <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {t.detail.verifiedOn}
          </span>
        )}
      </div>
      {contract.proxyTo && (
        <span style={{
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontSize: 9.5,
          color: theme.muted,
          letterSpacing: 0.3,
        }}>{t.detail.proxy} {contract.proxyTo}</span>
      )}
    </div>
  );
}

// Cap bar — shows soft/hard caps as a bar with current usage
function RegCapBar({ caps, currentPct, theme, t }) {
  const hard = caps.hard || 0;
  const soft = caps.soft || 0;
  const cur = currentPct || 0;
  if (hard === 0) {
    return (
      <div style={{
        padding: '6px 9px',
        background: theme.cardBg,
        border: `1px dashed ${theme.border}`,
        borderRadius: 4,
        fontSize: 10.5,
        color: theme.muted,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        letterSpacing: 0.3,
      }}>no allocation cap set</div>
    );
  }
  const softPct = (soft / hard) * 100;
  const curPct = Math.min((cur / hard) * 100, 100);
  return (
    <div>
      <div style={{
        position: 'relative',
        height: 10,
        background: theme.cardBg,
        border: `1px solid ${theme.border}`,
        borderRadius: 3,
        overflow: 'hidden',
      }}>
        {/* current usage */}
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0,
          width: `${curPct}%`,
          background: cur >= soft ? 'oklch(0.65 0.14 75)' : 'oklch(0.65 0.13 252)',
        }} />
        {/* soft cap line */}
        <div style={{
          position: 'absolute', top: 0, bottom: 0,
          left: `${softPct}%`,
          width: 1,
          background: 'oklch(0.85 0.14 75)',
        }} />
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 4,
        fontSize: 9.5,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        letterSpacing: 0.4,
        color: theme.muted,
      }}>
        <span>now: <span style={{ color: theme.text }}>{cur.toFixed(1)}%</span></span>
        <span>soft <span style={{ color: 'oklch(0.85 0.14 75)' }}>{soft}%</span></span>
        <span>hard <span style={{ color: theme.text }}>{hard}%</span></span>
      </div>
    </div>
  );
}

Object.assign(window, {
  RegStatusBadge, RegRiskPill, RegAuditChip, RegSourceIcon, RegContractRow, RegCapBar,
});
