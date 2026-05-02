// Component 5: Protocol Registry — main variant. Composes data + UI.
// Single artboard with: top stats bar, filter row, two-pane (cards left, detail right when selected),
// data sources panel below.

function VariantReg({ overrides = {} }) {
  const themeMode = overrides.themeMode || 'dark';
  const locale = overrides.locale || 'en';
  const filter = overrides.filter || 'all';   // all | lending | dex | yield | perps | restaking
  const selectedId = overrides.selectedId || null;
  const showDetail = !!selectedId;

  const baseTheme = themeMode === 'dark' ? D_DARK : D_LIGHT;
  // Adapter: Reg components use {muted, cardBg, bgElev}; underlying theme exposes
  // {textFaint/textDim, bgRow, bgPanel}. Map them once here so atoms stay decoupled.
  const theme = {
    ...baseTheme,
    muted: baseTheme.textDim,
    cardBg: baseTheme.bgRow,
    bgElev: baseTheme.bgPanel,
  };
  const t = REG_I18N[locale];

  const [internalSelected, setInternalSelected] = React.useState(selectedId);
  React.useEffect(() => { setInternalSelected(selectedId); }, [selectedId]);
  const sel = internalSelected ? PROTOCOLS.find(p => p.id === internalSelected) : null;

  const filtered = filter === 'all' ? PROTOCOLS : PROTOCOLS.filter(p => p.category === filter);
  const grouped = {
    whitelisted: filtered.filter(p => p.status === 'whitelisted'),
    review: filtered.filter(p => p.status === 'review'),
    deprecated: filtered.filter(p => p.status === 'deprecated'),
    banned: filtered.filter(p => p.status === 'banned'),
  };

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: theme.bg,
      color: theme.text,
      fontFamily: 'var(--font-body, ui-sans-serif, system-ui, sans-serif)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Top header */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        padding: '14px 18px 12px',
        borderBottom: `1px solid ${theme.border}`,
        gap: 16,
      }}>
        <div>
          <div style={{
            fontSize: 9.5,
            color: theme.muted,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            textTransform: 'uppercase',
            letterSpacing: 0.7,
            marginBottom: 4,
          }}>governance · rules-v2.1</div>
          <div style={{
            fontSize: 18,
            fontWeight: 600,
            color: theme.text,
            letterSpacing: -0.3,
            lineHeight: 1.1,
          }}>{t.regTitle}</div>
          <div style={{
            fontSize: 11,
            color: theme.muted,
            marginTop: 4,
          }}>{t.regSubtitle} <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>T-12s</span></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RegHeaderStat label={t.statusWhitelisted} value={grouped.whitelisted.length} color="oklch(0.74 0.16 152)" theme={theme} />
          <RegHeaderStat label={t.statusReview} value={grouped.review.length} color="oklch(0.82 0.14 75)" theme={theme} />
          <RegHeaderStat label={t.statusDeprecated} value={grouped.deprecated.length} color="oklch(0.55 0.014 255)" theme={theme} />
          <RegHeaderStat label={t.statusBanned} value={grouped.banned.length} color="oklch(0.78 0.18 22)" theme={theme} />
          <button style={{
            marginLeft: 8,
            padding: '7px 11px',
            background: theme.text,
            color: theme.bg,
            border: 'none',
            borderRadius: 5,
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}>+ {t.proposeAdd}</button>
        </div>
      </div>

      {/* Filter row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '8px 18px',
        borderBottom: `1px solid ${theme.border}`,
        background: theme.bgElev,
      }}>
        {Object.entries(t.filters).map(([key, label]) => (
          <button key={key} style={{
            padding: '5px 9px',
            background: filter === key ? theme.cardBg : 'transparent',
            color: filter === key ? theme.text : theme.muted,
            border: `1px solid ${filter === key ? theme.border : 'transparent'}`,
            borderRadius: 4,
            fontSize: 10.5,
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            letterSpacing: 0.3,
            textTransform: 'uppercase',
            cursor: 'pointer',
          }}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <span style={{
          fontSize: 10,
          color: theme.muted,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          letterSpacing: 0.4,
        }}>{filtered.length} protocols · {DATA_SOURCES.length} sources</span>
      </div>

      {/* Body: cards (left) + detail (right) + sources (bottom) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: showDetail ? 'minmax(0, 1fr) 360px' : '1fr',
        flex: 1,
        minHeight: 0,
      }}>
        {/* LEFT: cards in groups */}
        <div style={{
          padding: '14px 18px 10px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
          borderRight: showDetail ? `1px solid ${theme.border}` : 'none',
        }}>
          {grouped.whitelisted.length > 0 && (
            <RegGroup title={t.sectionWhitelist} count={grouped.whitelisted.length} accent="oklch(0.74 0.16 152)" theme={theme}>
              <RegCardGrid>
                {grouped.whitelisted.map(p => (
                  <RegProtocolCard key={p.id} protocol={p} theme={theme} t={t} locale={locale} selected={internalSelected === p.id} onClick={() => setInternalSelected(p.id)} />
                ))}
              </RegCardGrid>
            </RegGroup>
          )}
          {grouped.review.length > 0 && (
            <RegGroup title={t.sectionReview} count={grouped.review.length} accent="oklch(0.82 0.14 75)" theme={theme}>
              <RegCardGrid>
                {grouped.review.map(p => (
                  <RegProtocolCard key={p.id} protocol={p} theme={theme} t={t} locale={locale} selected={internalSelected === p.id} onClick={() => setInternalSelected(p.id)} />
                ))}
              </RegCardGrid>
            </RegGroup>
          )}
          {grouped.deprecated.length > 0 && (
            <RegGroup title={t.sectionDeprecated} count={grouped.deprecated.length} accent="oklch(0.55 0.014 255)" theme={theme}>
              <RegCardGrid>
                {grouped.deprecated.map(p => (
                  <RegProtocolCard key={p.id} protocol={p} theme={theme} t={t} locale={locale} selected={internalSelected === p.id} onClick={() => setInternalSelected(p.id)} />
                ))}
              </RegCardGrid>
            </RegGroup>
          )}
          {grouped.banned.length > 0 && (
            <RegGroup title={t.sectionBanned} count={grouped.banned.length} accent="oklch(0.78 0.18 22)" theme={theme}>
              <RegCardGrid>
                {grouped.banned.map(p => (
                  <RegProtocolCard key={p.id} protocol={p} theme={theme} t={t} locale={locale} selected={internalSelected === p.id} onClick={() => setInternalSelected(p.id)} />
                ))}
              </RegCardGrid>
            </RegGroup>
          )}

          {/* Data sources widget */}
          <RegGroup title={t.dataSources} count={DATA_SOURCES.length} accent="oklch(0.78 0.13 252)" theme={theme} subtitle={t.sourcesSubtitle}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 6,
            }}>
              {DATA_SOURCES.map(s => (
                <RegSourceRow key={s.id} source={s} theme={theme} t={t} />
              ))}
            </div>
          </RegGroup>
        </div>

        {/* RIGHT: detail panel */}
        {showDetail && sel && (
          <div style={{ padding: '14px 16px 14px', minHeight: 0, overflow: 'hidden' }}>
            <RegDetailPanel protocol={sel} theme={theme} t={t} locale={locale} onClose={() => setInternalSelected(null)} />
          </div>
        )}
      </div>
    </div>
  );
}

function RegHeaderStat({ label, value, color, theme }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      padding: '5px 10px',
      background: theme.cardBg,
      border: `1px solid ${theme.border}`,
      borderRadius: 5,
      minWidth: 56,
    }}>
      <div style={{
        fontSize: 8.5,
        color: theme.muted,
        fontFamily: 'var(--font-mono, ui-monospace, monospace)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
      }}>{label}</div>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 5,
      }}>
        <span style={{
          width: 5, height: 5, borderRadius: 99, background: color,
          display: 'inline-block',
        }} />
        <span style={{
          fontSize: 15,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontWeight: 600,
          color: theme.text,
        }}>{value}</span>
      </div>
    </div>
  );
}

function RegGroup({ title, count, accent, theme, subtitle, children }) {
  return (
    <section>
      <div style={{
        display: 'flex', alignItems: 'baseline', gap: 8,
        marginBottom: 8,
        paddingBottom: 6,
        borderBottom: `1px solid ${theme.border}`,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 99, background: accent }} />
        <span style={{
          fontSize: 10.5,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          textTransform: 'uppercase',
          letterSpacing: 0.7,
          color: theme.text,
          fontWeight: 600,
        }}>{title}</span>
        <span style={{
          fontSize: 10,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          color: theme.muted,
          letterSpacing: 0.4,
        }}>· {count}</span>
        {subtitle && (
          <span style={{ fontSize: 11, color: theme.muted, marginLeft: 6 }}>{subtitle}</span>
        )}
      </div>
      {children}
    </section>
  );
}

function RegCardGrid({ children }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
      gap: 8,
    }}>{children}</div>
  );
}

Object.assign(window, { VariantReg, RegHeaderStat, RegGroup, RegCardGrid });
