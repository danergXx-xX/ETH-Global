// Notifications Inbox (Component 10) — events ktorych user obserwuje.
// State variants via `state` prop: loading | with_unread | all_read | empty

const NOTIF_DATA = [
  { id: 'n1', type: 'verdict',     unread: true,  icon: '✓', color: 'oklch(0.74 0.16 152)', title: 'PROP-042 verdict: PASSED', summary: '4 FOR, 0 AGAINST, 1 ABSTAIN. Confidence 78%.', time: '12 min ago' },
  { id: 'n2', type: 'sig_request', unread: true,  icon: '✎', color: 'oklch(0.78 0.14 75)',  title: 'Multisig signature requested', summary: 'PROP-042 needs your signature (3/5 collected).', time: '14 min ago' },
  { id: 'n3', type: 'reputation',  unread: true,  icon: '∆', color: 'oklch(0.78 0.14 75)',  title: 'Sentiment agent reputation -3', summary: 'Recent abstain led to suboptimal verdict on PROP-039.', time: '2h ago' },
  { id: 'n4', type: 'rules',       unread: false, icon: '⚙', color: 'oklch(0.74 0.16 305)', title: 'Council Rules v0.4 deployed', summary: 'Soft cap raised: 5% → 7% per protocol.', time: '1d ago' },
  { id: 'n5', type: 'execution',   unread: false, icon: '◆', color: 'oklch(0.74 0.16 152)', title: 'PROP-039 executed on Base', summary: '25k USDC rotated from Compound to Morpho. Gas 184k.', time: '5h ago' },
  { id: 'n6', type: 'proposal',    unread: false, icon: '◇', color: 'oklch(0.74 0.15 245)', title: 'New proposal: PROP-043', summary: 'Lend 200k USDC on Yearn. Council convenes in 2 min.', time: '6h ago' },
  { id: 'n7', type: 'agent_added', unread: false, icon: '+', color: 'oklch(0.74 0.15 245)', title: 'Agent added: Macro', summary: 'New custom agent joined Council. Trust gate 75.', time: '4d ago' },
  { id: 'n8', type: 'rules',       unread: false, icon: '◇', color: 'oklch(0.74 0.16 305)', title: 'Rules update v0.4 proposed', summary: 'Maxima initiated rules amendment. Multisig sig needed.', time: '1d ago' },
];

const nfStyles = {
  card: {
    width: '100%', height: '100%',
    background: 'oklch(0.18 0.025 255)',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 22px', borderBottom: '1px solid oklch(0.30 0.030 255)',
    fontFamily: 'var(--font-mono)', fontSize: 11,
    background: 'oklch(0.20 0.025 255)',
    flexShrink: 0,
  },
  filterBar: {
    display: 'flex', gap: 8, padding: '12px 22px',
    background: 'oklch(0.20 0.025 255)',
    borderBottom: '1px solid oklch(0.28 0.028 255)',
    flexShrink: 0,
  },
  chip: {
    padding: '6px 12px', borderRadius: 4,
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.06em', cursor: 'pointer',
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    color: 'oklch(0.78 0.012 255)',
  },
  chipActive: {
    background: 'color-mix(in oklch, oklch(0.78 0.14 75) 20%, transparent)',
    borderColor: 'oklch(0.78 0.14 75)',
    color: 'oklch(0.86 0.10 75)',
  },
  scroll: { flex: 1, overflowY: 'auto' },
  notifRow: {
    display: 'grid', gridTemplateColumns: '4px 36px 1fr auto auto',
    gap: 14, alignItems: 'center',
    padding: '14px 22px',
    borderBottom: '1px solid oklch(0.26 0.026 255)',
    cursor: 'pointer',
    transition: 'background .12s',
  },
  unreadDot: {
    width: 4, height: 4, borderRadius: 2,
    background: 'oklch(0.78 0.14 75)',
    boxShadow: '0 0 6px oklch(0.78 0.14 75)',
  },
  iconCircle: {
    width: 32, height: 32, borderRadius: 16,
    display: 'grid', placeItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
  },
  body: { display: 'flex', flexDirection: 'column', gap: 3 },
  title: { fontFamily: 'var(--font-sans)', fontSize: 13.5, fontWeight: 500, color: 'oklch(0.92 0.008 255)' },
  summary: { fontFamily: 'var(--font-sans)', fontSize: 12, color: 'oklch(0.72 0.012 255)', lineHeight: 1.4 },
  time: { fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' },
  rowAction: {
    padding: '4px 8px', borderRadius: 3,
    background: 'transparent',
    border: '1px solid oklch(0.30 0.030 255)',
    color: 'oklch(0.66 0.014 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    cursor: 'pointer',
  },
};

function NotifRow({ n }) {
  return (
    <div style={{
      ...nfStyles.notifRow,
      background: n.unread ? 'color-mix(in oklch, oklch(0.78 0.14 75) 4%, transparent)' : 'transparent',
    }}>
      <div style={n.unread ? nfStyles.unreadDot : { width: 4 }} />
      <div style={{
        ...nfStyles.iconCircle,
        background: `color-mix(in oklch, ${n.color} 22%, oklch(0.22 0.028 255))`,
        color: n.color,
        border: `1px solid color-mix(in oklch, ${n.color} 50%, transparent)`,
      }}>{n.icon}</div>
      <div style={nfStyles.body}>
        <div style={nfStyles.title}>{n.title}</div>
        <div style={nfStyles.summary}>{n.summary}</div>
      </div>
      <span style={nfStyles.time}>{n.time}</span>
      <div style={{ display: 'flex', gap: 4 }}>
        <button style={nfStyles.rowAction}>Open</button>
        <button style={nfStyles.rowAction}>✕</button>
      </div>
    </div>
  );
}

function VariantNotifications({ overrides = {} }) {
  const state = overrides.state || 'with_unread';
  const filter = overrides.filter || 'all';

  let visible = NOTIF_DATA;
  if (filter === 'unread') visible = NOTIF_DATA.filter((n) => n.unread);
  if (state === 'all_read') visible = NOTIF_DATA.map((n) => ({ ...n, unread: false }));
  if (state === 'empty') visible = [];

  const unreadCount = NOTIF_DATA.filter((n) => n.unread).length;

  return (
    <div style={nfStyles.card}>
      <div style={nfStyles.topBar}>
        <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
        <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
        <span style={{ color: 'oklch(0.78 0.012 255)' }}>NOTIFICATIONS</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {state !== 'all_read' && state !== 'empty' && unreadCount > 0 && (
            <span style={{
              padding: '2px 7px', borderRadius: 3,
              background: 'color-mix(in oklch, oklch(0.78 0.14 75) 22%, transparent)',
              border: '1px solid oklch(0.78 0.14 75)',
              color: 'oklch(0.86 0.10 75)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
            }}>{unreadCount} UNREAD</span>
          )}
          <span style={{ color: 'oklch(0.78 0.012 255)' }}>{NOTIF_DATA.length} TOTAL</span>
        </span>
      </div>

      <div style={nfStyles.filterBar}>
        {['all', 'unread', 'important', 'verdicts', 'sigs', 'rules'].map((f) => {
          const isActive = f === filter;
          const label = f === 'all' ? 'All' : f === 'unread' ? `Unread (${unreadCount})` : f.charAt(0).toUpperCase() + f.slice(1);
          return (
            <button key={f} style={{ ...nfStyles.chip, ...(isActive ? nfStyles.chipActive : {}) }}>
              {label}
            </button>
          );
        })}
        <div style={{ flex: 1 }} />
        <button style={nfStyles.chip}>✓ Mark all read</button>
        <button style={nfStyles.chip}>⚙ Settings</button>
      </div>

      <div style={nfStyles.scroll}>
        {state === 'loading' && Array.from({ length: 6 }).map((_, i) => (
          <div key={i} style={nfStyles.notifRow}>
            <div style={{ width: 4 }} />
            <div style={{ ...nfStyles.iconCircle, background: 'oklch(0.26 0.022 255)' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ height: 14, borderRadius: 3, background: 'oklch(0.26 0.022 255)', width: '60%' }} />
              <div style={{ height: 11, borderRadius: 3, background: 'oklch(0.24 0.020 255)', width: '40%' }} />
            </div>
            <div style={{ height: 10, borderRadius: 3, background: 'oklch(0.24 0.020 255)', width: 60 }} />
            <div />
          </div>
        ))}

        {state !== 'loading' && visible.length === 0 && (
          <div style={{
            padding: '60px 22px', textAlign: 'center',
            display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
            color: 'oklch(0.66 0.014 255)',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, color: 'oklch(0.40 0.020 255)' }}>{state === 'all_read' ? '✓' : '◌'}</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'oklch(0.86 0.012 255)' }}>
              {state === 'all_read' ? 'All caught up' : 'No notifications'}
            </span>
            <span style={{ fontSize: 12 }}>
              {state === 'all_read' ? 'No unread events. Council activity will appear here.' : 'No events yet. Connect to council to receive updates.'}
            </span>
          </div>
        )}

        {state !== 'loading' && visible.map((n) => <NotifRow key={n.id} n={n} />)}
      </div>
    </div>
  );
}

window.VariantNotifications = VariantNotifications;
