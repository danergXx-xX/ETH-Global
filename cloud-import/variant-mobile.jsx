// Mobile views — Live Debate + Treasury Dashboard zoptymalizowane pod 375x812.
// Eksportuje 2 komponenty: VariantMobileDebate, VariantMobileDash.

const mbStyles = {
  card: {
    width: 375, height: 812,
    background: 'oklch(0.18 0.025 255)',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: 12,
    border: '1px solid oklch(0.30 0.030 255)',
  },
  topBar: {
    padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 8,
    borderBottom: '1px solid oklch(0.30 0.030 255)',
    background: 'oklch(0.20 0.025 255)',
    flexShrink: 0,
  },
  walletPill: {
    marginLeft: 'auto', padding: '6px 10px', borderRadius: 16,
    background: 'oklch(0.26 0.030 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    color: 'oklch(0.92 0.008 255)',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  scroll: { flex: 1, overflowY: 'auto' },
  // Debate-specific
  proposalBlock: {
    padding: '16px 18px',
    borderBottom: '1px solid oklch(0.28 0.028 255)',
  },
  proposalLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'oklch(0.66 0.014 255)', marginBottom: 6,
  },
  proposalTitle: {
    fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600,
    lineHeight: 1.25, color: 'oklch(0.97 0.008 255)',
  },
  agentStack: { padding: '12px 0' },
  agentRow: {
    padding: '12px 18px',
    borderBottom: '1px solid oklch(0.26 0.026 255)',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  agentAvatar: {
    width: 40, height: 40, borderRadius: 20,
    flexShrink: 0,
  },
  agentBody: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  // Bottom sheet
  bottomSheet: {
    padding: '12px 16px',
    background: 'oklch(0.20 0.025 255)',
    borderTop: '1px solid oklch(0.30 0.030 255)',
    flexShrink: 0,
  },
  // Tab bar (Dashboard)
  tabBar: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    background: 'oklch(0.20 0.025 255)',
    borderTop: '1px solid oklch(0.30 0.030 255)',
    flexShrink: 0,
  },
  tab: {
    padding: '14px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase',
    cursor: 'pointer',
  },
  tabActive: { color: 'oklch(0.86 0.10 75)' },
  tabInactive: { color: 'oklch(0.66 0.014 255)' },
};

const MOBILE_AGENTS = [
  { id: 'bull',      name: 'Bull',      hue: 152, vote: 'FOR',     conf: 0.84, status: 'analyzing' },
  { id: 'bear',      name: 'Bear',      hue: 22,  vote: 'AGAINST', conf: 0.71, status: 'done' },
  { id: 'risk',      name: 'Risk',      hue: 78,  vote: 'FOR',     conf: 0.66, status: 'done' },
  { id: 'tech',      name: 'Tech',      hue: 245, vote: 'FOR',     conf: 0.78, status: 'done' },
  { id: 'sentiment', name: 'Sentiment', hue: 305, vote: 'ABSTAIN', conf: 0.52, status: 'analyzing' },
];

function MobileAgentRow({ a }) {
  const accent = `oklch(0.74 0.16 ${a.hue})`;
  const voteColor = a.vote === 'FOR' ? 'oklch(0.86 0.10 152)' : a.vote === 'AGAINST' ? 'oklch(0.86 0.10 22)' : 'oklch(0.66 0.014 255)';
  return (
    <div style={mbStyles.agentRow}>
      <div style={{
        ...mbStyles.agentAvatar,
        background: `linear-gradient(135deg, oklch(0.55 0.14 ${a.hue}) 0%, oklch(0.30 0.10 ${a.hue}) 100%)`,
        boxShadow: `0 0 0 1.5px color-mix(in oklch, ${accent} 60%, white)`,
        animation: a.status === 'analyzing' ? 'a-pulse 1.4s ease-out infinite' : 'none',
      }} />
      <div style={mbStyles.agentBody}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'oklch(0.97 0.008 255)' }}>{a.name}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: voteColor }}>{a.vote}</span>
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>
          {a.status === 'analyzing' ? 'analyzing...' : `conf ${(a.conf * 100).toFixed(0)}%`}
        </span>
      </div>
      <button style={{ padding: '5px 9px', borderRadius: 3, background: 'transparent', border: '1px solid oklch(0.40 0.030 255)', color: 'oklch(0.78 0.012 255)', fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, cursor: 'pointer' }}
        onClick={() => { if (window.openReasoningChat) window.openReasoningChat(a.id, a.name + ' voted ' + a.vote, 'en'); }}
      >↳</button>
    </div>
  );
}

function VariantMobileDebate({ overrides = {} }) {
  const tally = { for: 3, against: 1, abstain: 1 };
  return (
    <div style={mbStyles.card}>
      <div style={mbStyles.topBar}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: 'oklch(0.78 0.13 252)', display: 'grid', placeItems: 'center', color: 'oklch(0.18 0.025 255)', fontSize: 11, fontWeight: 700 }}>●</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'oklch(0.96 0.006 255)' }}>CONCLAVE</span>
        <span style={mbStyles.walletPill}>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: 'oklch(0.74 0.16 152)' }} />
          0xa1b2…e5f6
        </span>
      </div>

      <div style={mbStyles.scroll}>
        <div style={mbStyles.proposalBlock}>
          <div style={mbStyles.proposalLabel}>Proposal · PROP-042</div>
          <div style={mbStyles.proposalTitle}>Allocate 100k USDC to Aave v3</div>
          <div style={{ display: 'flex', gap: 12, marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>
            <span>Base · 4.2% APY · 30d</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <span style={{
              padding: '4px 10px', borderRadius: 3,
              background: 'color-mix(in oklch, oklch(0.78 0.14 75) 22%, transparent)',
              border: '1px solid oklch(0.78 0.14 75)',
              color: 'oklch(0.86 0.10 75)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase',
            }}>● DEBATING</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>T+0:34 elapsed</span>
          </div>
        </div>

        <div style={mbStyles.agentStack}>
          {MOBILE_AGENTS.map((a) => <MobileAgentRow key={a.id} a={a} />)}
        </div>
      </div>

      <div style={mbStyles.bottomSheet}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 10 }}>
          {[
            { label: 'For', value: tally.for, color: 'oklch(0.86 0.10 152)' },
            { label: 'Against', value: tally.against, color: 'oklch(0.86 0.10 22)' },
            { label: 'Abstain', value: tally.abstain, color: 'oklch(0.66 0.014 255)' },
          ].map((t) => (
            <div key={t.label} style={{ padding: '10px 12px', background: 'oklch(0.22 0.028 255)', borderRadius: 6, border: '1px solid oklch(0.30 0.030 255)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 8, color: 'oklch(0.66 0.014 255)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>{t.label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: t.color }}>{t.value}</div>
            </div>
          ))}
        </div>
        <button style={{
          width: '100%', padding: '12px', borderRadius: 4,
          background: 'oklch(0.78 0.14 75)', border: 'none',
          color: 'oklch(0.18 0.04 75)',
          fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer',
        }}
        onClick={() => { if (window.openReasoningChat) window.openReasoningChat('bull', 'PROP-042 debate', 'en'); }}
        >↳ Challenge any agent</button>
      </div>
    </div>
  );
}

const POSITIONS = [
  { protocol: 'Aave v3',   asset: 'USDC',  amount: 100_000, apy: 4.2, color: 'oklch(0.74 0.16 245)' },
  { protocol: 'Morpho',    asset: 'USDC',  amount: 50_000,  apy: 4.6, color: 'oklch(0.74 0.16 305)' },
  { protocol: 'Compound',  asset: 'USDC',  amount: 25_000,  apy: 3.8, color: 'oklch(0.74 0.16 152)' },
  { protocol: 'Yearn v3',  asset: 'USDC',  amount: 30_000,  apy: 5.1, color: 'oklch(0.78 0.14 75)' },
];

function VariantMobileDash({ overrides = {} }) {
  const total = POSITIONS.reduce((s, p) => s + p.amount, 0);
  return (
    <div style={mbStyles.card}>
      <div style={mbStyles.topBar}>
        <div style={{ width: 20, height: 20, borderRadius: 10, background: 'oklch(0.78 0.13 252)', display: 'grid', placeItems: 'center', color: 'oklch(0.18 0.025 255)', fontSize: 11, fontWeight: 700 }}>●</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, color: 'oklch(0.96 0.006 255)' }}>CONCLAVE</span>
        <span style={mbStyles.walletPill}>
          <span style={{ width: 5, height: 5, borderRadius: 3, background: 'oklch(0.74 0.16 152)' }} />
          0xa1b2…e5f6
        </span>
      </div>

      <div style={mbStyles.scroll}>
        {/* Portfolio hero */}
        <div style={{
          padding: '24px 18px',
          background: 'linear-gradient(135deg, oklch(0.24 0.06 152) 0%, oklch(0.18 0.025 255) 100%)',
          borderBottom: '1px solid oklch(0.28 0.028 255)',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.66 0.014 255)', marginBottom: 6 }}>Treasury value</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 36, fontWeight: 600, color: 'oklch(0.97 0.008 255)', lineHeight: 1 }}>${total.toLocaleString()}</div>
          <div style={{ display: 'flex', gap: 10, marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 11 }}>
            <span style={{ color: 'oklch(0.86 0.10 152)' }}>+$2,847 (24h)</span>
            <span style={{ color: 'oklch(0.66 0.014 255)' }}>· 4.4% blended APY</span>
          </div>
        </div>

        {/* Active proposals card */}
        <div style={{ padding: '16px 18px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.66 0.014 255)', marginBottom: 8 }}>Active</div>
          <div style={{
            padding: '12px 14px', borderRadius: 8,
            background: 'color-mix(in oklch, oklch(0.78 0.14 75) 10%, transparent)',
            border: '1px solid color-mix(in oklch, oklch(0.78 0.14 75) 40%, transparent)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.78 0.14 75)' }} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700, color: 'oklch(0.86 0.10 75)' }}>DEBATING NOW</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'oklch(0.97 0.008 255)' }}>PROP-042 · Allocate 100k USDC</div>
          </div>
        </div>

        {/* Positions */}
        <div style={{ padding: '4px 18px 16px' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.66 0.014 255)', marginBottom: 8 }}>Positions ({POSITIONS.length})</div>
          {POSITIONS.map((p) => (
            <div key={p.protocol} style={{
              display: 'grid', gridTemplateColumns: '8px 1fr auto auto',
              gap: 10, padding: '10px 0',
              alignItems: 'center',
              borderBottom: '1px solid oklch(0.26 0.026 255)',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 4, background: p.color }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{p.protocol}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>{p.asset}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>${p.amount.toLocaleString()}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.86 0.10 152)' }}>{p.apy}%</div>
            </div>
          ))}
        </div>
      </div>

      <div style={mbStyles.tabBar}>
        {[
          { id: 'home',     icon: '◇', label: 'Home',     active: true },
          { id: 'debate',   icon: '◉', label: 'Debate',   active: false },
          { id: 'vote',     icon: '✓', label: 'Vote',     active: false },
          { id: 'profile',  icon: '◐', label: 'Profile',  active: false },
        ].map((t) => (
          <div key={t.id} style={{ ...mbStyles.tab, ...(t.active ? mbStyles.tabActive : mbStyles.tabInactive) }}>
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

window.VariantMobileDebate = VariantMobileDebate;
window.VariantMobileDash = VariantMobileDash;
