// Component 5: Protocol Registry — detail panel (right side, when protocol selected).

function RegDetailPanel({ protocol, theme, t, locale, onClose }) {
  if (!protocol) return null;
  const desc = protocol.description[locale] || protocol.description.en;
  const isBanned = protocol.status === 'banned';
  const isReview = protocol.status === 'review';
  const isDeprecated = protocol.status === 'deprecated';
  const eligible = protocol.status === 'whitelisted';
  const exposurePct = protocol.id === 'aave-v3-base' ? 3.2 : protocol.id === 'compound-v3-base' ? 1.8 : protocol.id === 'uniswap-v3-base' ? 0.4 : 0;
  const lastReviewedDays = protocol.id === 'aave-v3-base' ? 12 : protocol.id === 'morpho-blue' ? 3 : 47;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      background: theme.bgElev,
      border: `1px solid ${theme.border}`,
      borderRadius: 8,
      overflow: 'hidden',
      maxHeight: '100%',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 12px',
        borderBottom: `1px solid ${theme.border}`,
        background: theme.cardBg,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              fontSize: 17,
              fontWeight: 600,
              color: theme.text,
              letterSpacing: -0.2,
            }}>
              {protocol.name}
              <span style={{
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                fontSize: 10.5,
                color: theme.muted,
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                fontWeight: 500,
              }}>{protocol.network} · chain {protocol.chainId}</span>
            </div>
            <div style={{
              fontSize: 10,
              color: theme.muted,
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              marginTop: 3,
            }}>{regCategoryLabel(protocol.category, t)} · added {protocol.addedDate} by {protocol.addedBy}</div>
          </div>
          <button onClick={onClose} style={{
            background: 'transparent',
            border: `1px solid ${theme.border}`,
            color: theme.muted,
            width: 24, height: 24,
            borderRadius: 4,
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="10" height="10" viewBox="0 0 12 12"><path d="M2 2L10 10M10 2L2 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <RegStatusBadge status={protocol.status} t={t} theme={theme} size="md" />
          <RegRiskPill tier={protocol.riskScore.tier} score={protocol.riskScore.value} theme={theme} size="md" />
          <span style={{
            fontSize: 10,
            color: theme.muted,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            letterSpacing: 0.4,
          }}>· {t.detail.lastReviewed} {lastReviewedDays}d ago</span>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: '12px 16px 14px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Banned/deprecated banner */}
        {isBanned && protocol.bannedReason && (
          <div style={{
            padding: '8px 10px',
            background: 'oklch(0.28 0.10 22 / 0.4)',
            border: '1px solid oklch(0.55 0.16 22 / 0.5)',
            borderRadius: 4,
            fontSize: 11,
            color: 'oklch(0.85 0.14 22)',
            lineHeight: 1.45,
          }}>{protocol.bannedReason[locale] || protocol.bannedReason.en}</div>
        )}
        {isDeprecated && protocol.deprecatedReason && (
          <div style={{
            padding: '8px 10px',
            background: 'oklch(0.32 0.04 75 / 0.3)',
            border: '1px solid oklch(0.55 0.10 75 / 0.4)',
            borderRadius: 4,
            fontSize: 11,
            color: 'oklch(0.85 0.13 75)',
            lineHeight: 1.45,
          }}>{protocol.deprecatedReason[locale] || protocol.deprecatedReason.en}</div>
        )}

        {/* Description */}
        <div style={{
          fontSize: 12.5,
          color: theme.text,
          lineHeight: 1.55,
          textWrap: 'pretty',
        }}>{desc}</div>

        {/* Caps */}
        <RegSection title={t.detail.caps} theme={theme}>
          <RegCapBar caps={protocol.caps} currentPct={exposurePct} theme={theme} t={t} />
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 8,
            marginTop: 8,
            fontSize: 10.5,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            color: theme.muted,
            letterSpacing: 0.3,
          }}>
            <div><span style={{ color: theme.muted }}>{t.detail.perTx}: </span><span style={{ color: theme.text }}>${(protocol.caps.perTx / 1000).toFixed(0)}k</span></div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: theme.muted }}>{t.detail.currentExposure}: </span>
              <span style={{ color: theme.text }}>{exposurePct.toFixed(1)}%</span>
            </div>
          </div>
        </RegSection>

        {/* Contracts */}
        <RegSection title={t.detail.contracts} theme={theme}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {protocol.contracts.map(c => (
              <RegContractRow key={c.label} contract={c} theme={theme} t={t} />
            ))}
          </div>
        </RegSection>

        {/* Audits */}
        <RegSection title={t.detail.audits} theme={theme}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {protocol.audits.map((a, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 10px',
                background: theme.cardBg,
                border: `1px solid ${theme.border}`,
                borderRadius: 4,
              }}>
                <RegAuditChip audit={a} t={t} theme={theme} />
                <span style={{
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: 9.5,
                  color: theme.muted,
                  letterSpacing: 0.3,
                }}>{a.scope}</span>
                <a href="#" onClick={e => e.preventDefault()} style={{
                  fontSize: 9.5,
                  color: 'oklch(0.78 0.13 252)',
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  textDecoration: 'none',
                  letterSpacing: 0.3,
                }}>{a.reportShort} →</a>
              </div>
            ))}
          </div>
        </RegSection>

        {/* Risks */}
        <RegSection title={t.detail.risks} theme={theme}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            {protocol.risks.map((r, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontSize: 11,
                color: theme.text,
                lineHeight: 1.4,
              }}>
                <span style={{
                  width: 4, height: 4, borderRadius: 99,
                  background: 'oklch(0.78 0.18 22)',
                  marginTop: 6,
                  flexShrink: 0,
                }} />
                <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)', fontSize: 10.5, letterSpacing: 0.2 }}>{r}</span>
              </div>
            ))}
          </div>
        </RegSection>

        {/* Sources */}
        <RegSection title={t.detail.sources} theme={theme}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            {protocol.sources.map(srcId => {
              const src = DATA_SOURCES.find(s => s.id === srcId);
              if (!src) return null;
              return (
                <div key={srcId} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 5,
                  padding: '3px 7px 3px 5px',
                  background: theme.cardBg,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 4,
                  fontSize: 10.5,
                  color: theme.text,
                }}>
                  <RegSourceIcon kind={src.kind} theme={theme} size={11} />
                  {src.label}
                </div>
              );
            })}
          </div>
          <div style={{
            marginTop: 8,
            fontSize: 10.5,
            color: theme.muted,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            letterSpacing: 0.3,
          }}>{t.detail.oracle}: <span style={{ color: theme.text }}>{protocol.oracleProvider}</span></div>
        </RegSection>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4, paddingTop: 12, borderTop: `1px solid ${theme.border}` }}>
          <button disabled={!eligible} style={{
            flex: 1,
            padding: '9px 12px',
            background: eligible ? theme.text : theme.cardBg,
            color: eligible ? theme.bg : theme.muted,
            border: `1px solid ${eligible ? theme.text : theme.border}`,
            borderRadius: 5,
            fontSize: 11.5,
            fontWeight: 600,
            letterSpacing: 0.2,
            cursor: eligible ? 'pointer' : 'not-allowed',
            fontFamily: 'inherit',
          }}>{eligible ? t.detail.proposeAllocation : t.detail.councilNotEligible}</button>
          <button style={{
            padding: '9px 12px',
            background: 'transparent',
            color: theme.text,
            border: `1px solid ${theme.border}`,
            borderRadius: 5,
            fontSize: 11.5,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>etherscan →</button>
        </div>
      </div>
    </div>
  );
}

function RegSection({ title, theme, children }) {
  return (
    <div>
      <div style={{
        fontSize: 9.5,
        color: theme.muted,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
        marginBottom: 7,
      }}>{title}</div>
      {children}
    </div>
  );
}

Object.assign(window, { RegDetailPanel, RegSection });
