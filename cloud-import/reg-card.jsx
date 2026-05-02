// Component 5: Protocol Registry — protocol card (compact) + protocol row (table) + data source row.

function RegProtocolCard({ protocol, theme, t, locale, onClick, selected }) {
  const desc = protocol.description[locale] || protocol.description.en;
  const auditCount = protocol.audits.length;
  const sourceCount = protocol.sources.length;
  const isBanned = protocol.status === 'banned';
  const isReview = protocol.status === 'review';
  const exposurePct = protocol.id === 'aave-v3-base' ? 3.2 : protocol.id === 'compound-v3-base' ? 1.8 : protocol.id === 'uniswap-v3-base' ? 0.4 : 0;

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 9,
        padding: '12px 13px 11px',
        background: selected ? theme.bgElev : theme.cardBg,
        border: `1px solid ${selected ? theme.text : theme.border}`,
        borderRadius: 6,
        textAlign: 'left',
        cursor: 'pointer',
        transition: 'border-color 0.15s, background 0.15s',
        position: 'relative',
        opacity: isBanned ? 0.65 : 1,
        minHeight: 168,
        font: 'inherit',
        color: 'inherit',
      }}
    >
      {/* line 1: name + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: 6,
            color: theme.text,
            fontSize: 14,
            fontWeight: 600,
            letterSpacing: -0.1,
          }}>
            {protocol.name}
            <span style={{
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              fontSize: 9.5,
              color: theme.muted,
              letterSpacing: 0.4,
              textTransform: 'uppercase',
            }}>{protocol.network}</span>
          </div>
          <div style={{
            fontSize: 9.5,
            color: theme.muted,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          }}>{regCategoryLabel(protocol.category, t)}</div>
        </div>
        <RegStatusBadge status={protocol.status} t={t} theme={theme} />
      </div>

      {/* description */}
      <div style={{
        fontSize: 11.5,
        color: theme.muted,
        lineHeight: 1.45,
        textWrap: 'pretty',
        flex: 1,
      }}>{desc}</div>

      {/* footer metrics */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 8,
        paddingTop: 8,
        borderTop: `1px solid ${theme.border}`,
      }}>
        <div>
          <div style={{ fontSize: 8.5, color: theme.muted, fontFamily: 'var(--font-mono, ui-monospace, monospace)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>APY</div>
          <div style={{
            fontSize: 12,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            color: protocol.apy.current ? theme.text : theme.muted,
            fontWeight: 600,
          }}>{protocol.apy.current ? `${protocol.apy.current}%` : '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 8.5, color: theme.muted, fontFamily: 'var(--font-mono, ui-monospace, monospace)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{t.columns.cap}</div>
          <div style={{
            fontSize: 12,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            color: protocol.caps.hard ? theme.text : theme.muted,
            fontWeight: 600,
          }}>{protocol.caps.hard ? `${protocol.caps.hard}%` : '—'}</div>
        </div>
        <div>
          <div style={{ fontSize: 8.5, color: theme.muted, fontFamily: 'var(--font-mono, ui-monospace, monospace)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>{t.columns.risk}</div>
          <div style={{ marginTop: -1 }}>
            <RegRiskPill tier={protocol.riskScore.tier} score={protocol.riskScore.value} theme={theme} />
          </div>
        </div>
      </div>

      {/* badges row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <span style={{
          fontSize: 9.5,
          color: theme.muted,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          letterSpacing: 0.4,
        }}>{auditCount}× audit · {sourceCount} src</span>
        {exposurePct > 0 && (
          <span style={{
            marginLeft: 'auto',
            fontSize: 9.5,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            color: 'oklch(0.78 0.13 252)',
            letterSpacing: 0.4,
          }}>· now {exposurePct}%</span>
        )}
      </div>
    </button>
  );
}

// Compact data source row (used in side widget)
function RegSourceRow({ source, theme, t }) {
  const statusColor = source.status === 'healthy'
    ? 'oklch(0.74 0.16 152)'
    : source.status === 'degraded'
      ? 'oklch(0.82 0.14 75)'
      : 'oklch(0.70 0.18 22)';
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '14px minmax(0, 1fr) auto auto',
      alignItems: 'center',
      gap: 10,
      padding: '7px 10px',
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 4,
    }}>
      <RegSourceIcon kind={source.kind} theme={theme} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 11.5,
          color: theme.text,
          fontWeight: 500,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}>{source.label}</div>
        <div style={{
          fontSize: 9.5,
          color: theme.muted,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          letterSpacing: 0.3,
        }}>{t.sourceKinds[source.kind]} · {source.usedBy.join(',')}</div>
      </div>
      <div style={{
        fontSize: 9.5,
        color: theme.muted,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        letterSpacing: 0.3,
        textAlign: 'right',
      }}>
        {source.lastSync}
        {source.latencyMs > 0 && <span style={{ display: 'block', color: theme.muted }}>{source.latencyMs}ms</span>}
      </div>
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontSize: 9,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        color: statusColor,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        fontWeight: 600,
      }}>
        <span style={{ width: 5, height: 5, borderRadius: 99, background: statusColor }} />
        {t[source.status] || source.status}
      </div>
    </div>
  );
}

Object.assign(window, { RegProtocolCard, RegSourceRow });
