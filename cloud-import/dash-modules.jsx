// Component 4: Dashboard modules — primitives + KPI band + allocation viz.
// Uses theme objects from d-theme.jsx (D_DARK / D_LIGHT).

// ----- Primitives ------------------------------------------------------------

function DashCard({ theme, title, hint, action, children, padding = 16, style = {} }) {
  return (
    <div style={{
      background: theme.bgPanel,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      ...style,
    }}>
      {(title || action) && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 14px 9px', gap: 12,
          borderBottom: `1px solid ${theme.borderSoft}`,
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0, overflow: 'hidden' }}>
            {title && <div style={{ fontSize: 10.5, fontWeight: 600, color: theme.textDim, textTransform: 'uppercase', letterSpacing: 0.6, whiteSpace: 'nowrap' }}>{title}</div>}
            {hint && <div style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{hint}</div>}
          </div>
          {action && <div style={{ flexShrink: 0 }}>{action}</div>}
        </div>
      )}
      <div style={{ padding, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>{children}</div>
    </div>
  );
}

function Sparkline({ data, color, theme, width = 70, height = 22, fill = true }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const w = width;
  const h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (w - 2) + 1;
    const y = h - 2 - ((v - min) / span) * (h - 4);
    return [x, y];
  });
  const path = pts.map(([x, y], i) => (i === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `L ${x.toFixed(1)} ${y.toFixed(1)}`)).join(' ');
  const areaPath = `${path} L ${w - 1} ${h - 1} L 1 ${h - 1} Z`;
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      {fill && <path d={areaPath} fill={color} fillOpacity={0.14} />}
      <path d={path} fill="none" stroke={color} strokeWidth={1.4} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => i === pts.length - 1 ? <circle key={i} cx={x} cy={y} r={2} fill={color} /> : null)}
    </svg>
  );
}

function StatusDot({ color, pulse, size = 7 }) {
  return (
    <span style={{ position: 'relative', display: 'inline-block', width: size, height: size }}>
      <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color }} />
      {pulse && <span style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: color, animation: 'a-pulse 2s ease-out infinite' }} />}
    </span>
  );
}

function fmtUsd(n, opts = {}) {
  const { compact = false, sign = false } = opts;
  if (n === 0) return '$0';
  if (compact && Math.abs(n) >= 10000) {
    return (n < 0 ? '-' : (sign ? '+' : '')) + '$' + (Math.abs(n) / 1000).toFixed(Math.abs(n) >= 100000 ? 0 : 1) + 'k';
  }
  const abs = Math.abs(n);
  const s = abs.toLocaleString('en-US', { maximumFractionDigits: abs < 100 ? 2 : 0 });
  return (n < 0 ? '-' : (sign ? '+' : '')) + '$' + s;
}

function fmtPct(n, decimals = 2) {
  return (n >= 0 ? '+' : '') + n.toFixed(decimals) + '%';
}

// ----- Top bar (web3 chrome) -------------------------------------------------

function DashTopBar({ theme, t, walletEns, walletShort, walletEth, blockHeight, gasUsd, locale, onLocale, themeMode, onThemeMode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '0 18px', height: 52,
      borderBottom: `1px solid ${theme.border}`,
      background: theme.bgPanel,
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
        <ConclaveLogo size={22} color={theme.text} accent={theme.amber} dim={theme.textDim} strokeOpacity={0.3} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.05 }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            color: theme.text,
            letterSpacing: 1.4,
          }}>CONCLAVE</span>
          <span style={{ fontSize: 9.5, color: theme.textFaint, fontFamily: 'var(--font-mono)', letterSpacing: 0.3 }}>{t.dashSubtitle}</span>
        </div>
      </div>

      {/* Network pill */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '4px 9px', borderRadius: 6,
        background: theme.bgRow, border: `1px solid ${theme.borderSoft}`,
        fontSize: 10.5, color: theme.textDim, fontFamily: 'var(--font-mono)', letterSpacing: 0.3,
        whiteSpace: 'nowrap', flexShrink: 0,
      }}>
        <StatusDot color={'oklch(0.74 0.16 152)'} size={6} />
        <span>Base Sepolia</span>
        <span style={{ color: theme.textFaint }}>· {t.blockShort} {blockHeight.toLocaleString()}</span>
      </div>

      {/* Gas */}
      <div style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)', letterSpacing: 0.3, whiteSpace: 'nowrap', flexShrink: 0 }}>
        <span style={{ color: theme.textDim }}>{t.gas}</span> ${gasUsd.toFixed(3)}
      </div>

      <div style={{ flex: 1 }} />

      {/* Locale */}
      <button
        onClick={() => onLocale(locale === 'en' ? 'pl' : 'en')}
        style={{
          background: 'transparent', border: `1px solid ${theme.borderSoft}`,
          color: theme.textDim, padding: '4px 8px', borderRadius: 6,
          fontSize: 10.5, fontFamily: 'var(--font-mono)', cursor: 'pointer',
        }}
        title="Toggle language"
      >{locale === 'en' ? 'PL' : 'EN'}</button>

      {/* Theme */}
      <button
        onClick={() => onThemeMode(themeMode === 'light' ? 'dark' : 'light')}
        style={{
          background: 'transparent', border: `1px solid ${theme.borderSoft}`,
          color: theme.textDim, padding: '4px 8px', borderRadius: 6,
          fontSize: 12, cursor: 'pointer', lineHeight: 1,
        }}
        title="Toggle theme"
      >{themeMode === 'light' ? '☾' : '☀'}</button>

      {/* Wallet identity */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '4px 10px', borderRadius: 6,
        background: theme.bgRow, border: `1px solid ${theme.borderSoft}`,
      }}>
        <div style={{
          width: 16, height: 16, borderRadius: '50%',
          background: 'linear-gradient(135deg, oklch(0.78 0.16 152), oklch(0.74 0.16 245))',
        }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
          <span style={{ fontSize: 11, color: theme.text, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{walletEns}</span>
          <span style={{ fontSize: 9.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>{walletShort} · {walletEth} ETH</span>
        </div>
      </div>
    </div>
  );
}

// ----- Side nav (left rail) --------------------------------------------------

function DashSideNav({ theme, t, current = 'home' }) {
  const items = [
    { id: 'home',       label: t.nav.home,       icon: '◫' },
    { id: 'proposals',  label: t.nav.proposals,  icon: '◇', badge: 1 },
    { id: 'positions',  label: t.nav.positions,  icon: '⊞' },
    { id: 'agents',     label: t.nav.agents,     icon: '◉' },
    { id: 'rules',      label: t.nav.rules,      icon: '§' },
    { id: 'activity',   label: t.nav.activity,   icon: '~' },
  ];
  return (
    <div style={{
      width: 200, flexShrink: 0,
      background: theme.bgPanel,
      borderRight: `1px solid ${theme.border}`,
      display: 'flex', flexDirection: 'column',
      padding: '14px 10px',
    }}>
      <div style={{ fontSize: 10, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: 0.8, padding: '4px 8px 8px' }}>
        Workspace
      </div>
      {items.map(it => {
        const active = it.id === current;
        return (
          <button key={it.id}
            style={{
              all: 'unset', cursor: active ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '7px 10px', borderRadius: 6,
              background: active ? theme.bgRow : 'transparent',
              color: active ? theme.text : theme.textDim,
              fontSize: 12.5, fontWeight: active ? 500 : 400,
              marginBottom: 2,
            }}>
            <span style={{ fontSize: 13, opacity: 0.85, width: 14, textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{it.icon}</span>
            <span style={{ flex: 1 }}>{it.label}</span>
            {it.badge != null && (
              <span style={{
                fontSize: 9.5, padding: '1px 6px', borderRadius: 999,
                background: 'oklch(0.74 0.16 245)', color: theme.inverseText,
                fontWeight: 600, fontFamily: 'var(--font-mono)',
              }}>{it.badge}</span>
            )}
          </button>
        );
      })}

      <div style={{ flex: 1 }} />

      {/* Bottom system status */}
      <div style={{
        marginTop: 12, padding: '10px 8px',
        borderTop: `1px solid ${theme.borderSoft}`,
        display: 'flex', flexDirection: 'column', gap: 6,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: theme.textFaint }}>{t.storage}</span>
          <span style={{ color: 'oklch(0.74 0.16 152)' }}>● 0G</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: theme.textFaint }}>RPC</span>
          <span style={{ color: 'oklch(0.74 0.16 152)' }}>● {t.healthy}</span>
        </div>
      </div>
    </div>
  );
}

// ----- KPI band --------------------------------------------------------------

function KpiTile({ theme, label, value, sub, accent, sparkData, sparkColor }) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      background: theme.bgPanel,
      border: `1px solid ${theme.border}`,
      borderRadius: 10,
      padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <span style={{ fontSize: 10, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}>{label}</span>
        {sparkData && <div style={{ flexShrink: 0 }}><Sparkline data={sparkData} color={sparkColor || theme.amber} theme={theme} width={56} height={18} /></div>}
      </div>
      <div style={{
        fontSize: 22, fontWeight: 600, color: theme.text,
        letterSpacing: '-0.02em', lineHeight: 1.05,
        fontFamily: 'var(--font-serif)',
        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
      }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, color: accent || theme.textDim, fontFamily: 'var(--font-mono)', letterSpacing: 0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function DashKpiBand({ theme, t }) {
  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <KpiTile theme={theme}
        label={t.kpiTotalValue}
        value={fmtUsd(DASH_TREASURY.totalUsd, { compact: true })}
        sub={fmtPct(DASH_TREASURY.delta7dPct) + ' · 7d'}
        accent={DASH_TREASURY.delta7dPct >= 0 ? 'oklch(0.74 0.16 152)' : 'oklch(0.70 0.18 22)'}
        sparkData={DASH_SPARK_TREASURY}
        sparkColor={'oklch(0.74 0.16 152)'}
      />
      <KpiTile theme={theme}
        label={t.kpiNetApy}
        value={DASH_TREASURY.netApy.toFixed(2) + '%'}
        sub={t.weighted}
        sparkData={DASH_SPARK_APY}
        sparkColor={'oklch(0.74 0.16 245)'}
      />
      <KpiTile theme={theme}
        label={t.kpiIdle}
        value={Math.round((DASH_ALLOCATION.find(a => a.id === 'idle').usd / DASH_TREASURY.totalUsd) * 100) + '%'}
        sub={fmtUsd(DASH_ALLOCATION.find(a => a.id === 'idle').usd, { compact: true }) + ' ' + t.of + ' ' + t.treasury}
        accent={'oklch(0.82 0.14 75)'}
      />
      <KpiTile theme={theme}
        label={t.kpiRunway}
        value={DASH_TREASURY.runwayMonths + ' ' + t.months}
        sub={fmtUsd(DASH_TREASURY.burnMonthlyUsd, { compact: true }) + '/mo'}
      />
      <KpiTile theme={theme}
        label={t.kpiYieldYtd}
        value={fmtUsd(DASH_TREASURY.yieldEarnedUsd, { compact: true, sign: true })}
        sub={'+' + ((DASH_TREASURY.yieldEarnedUsd / DASH_TREASURY.totalUsd) * 100).toFixed(2) + '% APY-effective'}
        accent={'oklch(0.74 0.16 152)'}
      />
    </div>
  );
}

// ----- Allocation horizontal stacked bar -------------------------------------

function AllocationBar({ theme, t, allocation }) {
  return (
    <DashCard theme={theme} title={t.allocation} hint={fmtUsd(DASH_TREASURY.totalUsd, { compact: false })} padding={14}>
      {/* Stacked bar */}
      <div style={{
        display: 'flex', gap: 2, height: 14, borderRadius: 4, overflow: 'hidden',
        marginBottom: 12,
      }}>
        {allocation.map(p => (
          <div key={p.id} style={{
            width: p.pct + '%', minWidth: p.pct < 1 ? 2 : 'auto',
            background: p.color,
          }} title={`${p.label} ${p.pct.toFixed(2)}%`} />
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 14px' }}>
        {allocation.map(p => (
          <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: theme.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.label}</span>
            <span style={{ fontSize: 11, color: theme.textDim, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>{p.pct.toFixed(p.pct < 1 ? 2 : 1)}%</span>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

Object.assign(window, {
  DashCard, Sparkline, StatusDot, fmtUsd, fmtPct,
  DashTopBar, DashSideNav, DashKpiBand, KpiTile, AllocationBar,
});
