// Audit Log / Activity Trail (Component 7) — verifiable, exportable history.
// Sora trust mech #3: kazda decyzja Council jest weryfikowalna na zewnatrz
// (0G Storage CID + tx hash on-chain).
//
// State variants via `state` prop:
//   'loading'   — fetching events, skeleton rows
//   'idle'      — full feed, all filters
//   'filtered'  — filter applied, narrowed list
//   'exporting' — export panel open, generating receipt
//   'empty'     — no events match filter

const auditStyles = {
  card: {
    width: '100%', height: '100%',
    background: 'oklch(0.18 0.025 255)',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  // Top bar
  topBar: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 22px', borderBottom: '1px solid oklch(0.30 0.030 255)',
    fontFamily: 'var(--font-mono)', fontSize: 11,
    background: 'oklch(0.20 0.025 255)',
    flexShrink: 0,
  },
  // Stats band
  statsBand: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 1,
    background: 'oklch(0.28 0.028 255)',
    borderBottom: '1px solid oklch(0.30 0.030 255)',
    flexShrink: 0,
  },
  statCell: {
    background: 'oklch(0.20 0.025 255)',
    padding: '14px 18px',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  statLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'oklch(0.66 0.014 255)',
  },
  statValue: {
    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
    lineHeight: 1, fontVariantNumeric: 'tabular-nums',
    color: 'oklch(0.97 0.008 255)',
  },
  // Filter bar
  filterBar: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '12px 22px', borderBottom: '1px solid oklch(0.28 0.028 255)',
    background: 'oklch(0.20 0.025 255)',
    flexShrink: 0, overflowX: 'auto',
  },
  filterChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '6px 12px', borderRadius: 4,
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    color: 'oklch(0.78 0.012 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.06em', cursor: 'pointer',
    flexShrink: 0,
  },
  filterChipActive: {
    background: 'color-mix(in oklch, oklch(0.78 0.14 75) 20%, transparent)',
    borderColor: 'oklch(0.78 0.14 75)',
    color: 'oklch(0.86 0.10 75)',
  },
  filterCount: {
    padding: '1px 5px', borderRadius: 3,
    background: 'oklch(0.30 0.030 255)',
    fontSize: 9, fontWeight: 700,
    color: 'oklch(0.78 0.012 255)',
  },
  // Event list
  scroll: { flex: 1, overflowY: 'auto' },
  eventRow: {
    display: 'grid', gridTemplateColumns: '120px 32px 1fr auto auto',
    gap: 14, alignItems: 'center',
    padding: '14px 22px',
    borderBottom: '1px solid oklch(0.26 0.026 255)',
    transition: 'background .12s',
  },
  eventTimestamp: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'oklch(0.66 0.014 255)',
    display: 'flex', flexDirection: 'column', gap: 2,
  },
  eventTimestampRel: {
    fontSize: 9, color: 'oklch(0.46 0.014 255)',
  },
  eventIcon: {
    width: 28, height: 28, borderRadius: 14,
    display: 'grid', placeItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
  },
  eventBody: { display: 'flex', flexDirection: 'column', gap: 3 },
  eventTitle: {
    fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500,
    color: 'oklch(0.92 0.008 255)', lineHeight: 1.3,
  },
  eventActor: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'oklch(0.66 0.014 255)',
  },
  eventSummary: {
    fontFamily: 'var(--font-sans)', fontSize: 12,
    color: 'oklch(0.72 0.012 255)', lineHeight: 1.4, marginTop: 2,
  },
  eventDelta: {
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
    padding: '4px 8px', borderRadius: 3,
    whiteSpace: 'nowrap',
  },
  eventLinks: {
    display: 'flex', gap: 6,
    fontFamily: 'var(--font-mono)', fontSize: 9,
  },
  eventLink: {
    padding: '3px 7px', borderRadius: 3,
    background: 'transparent',
    border: '1px solid oklch(0.30 0.030 255)',
    color: 'oklch(0.66 0.014 255)',
    cursor: 'pointer',
    textDecoration: 'none',
  },
  // Export panel (slide-in from right)
  exportPanel: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    width: 360, padding: 20,
    background: 'oklch(0.22 0.028 255)',
    borderLeft: '1px solid oklch(0.30 0.030 255)',
    display: 'flex', flexDirection: 'column', gap: 14,
    zIndex: 10,
  },
  // Footer
  footer: {
    padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 14,
    background: 'oklch(0.20 0.025 255)',
    borderTop: '1px solid oklch(0.30 0.030 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'oklch(0.66 0.014 255)', letterSpacing: '0.04em', flexShrink: 0,
  },
  footerBtn: {
    padding: '7px 12px', borderRadius: 4,
    background: 'transparent',
    border: '1px solid oklch(0.40 0.030 255)',
    color: 'oklch(0.92 0.008 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer',
  },
  footerBtnPrimary: {
    background: 'oklch(0.78 0.14 75)',
    borderColor: 'oklch(0.78 0.14 75)',
    color: 'oklch(0.18 0.04 75)',
  },
  // Skeleton
  skeleton: {
    height: 14, borderRadius: 3,
    background: 'linear-gradient(90deg, oklch(0.24 0.028 255), oklch(0.30 0.028 255), oklch(0.24 0.028 255))',
    backgroundSize: '200% 100%',
    animation: 'a-shimmer 1.4s ease-in-out infinite',
  },
};

function actorIcon(actor) {
  if (actor.kind === 'agent') {
    return { letter: actor.label[0], bg: 'oklch(0.30 0.08 245)', fg: 'oklch(0.94 0.05 245)' };
  }
  if (actor.kind === 'multisig') {
    return { letter: 'M', bg: 'oklch(0.30 0.10 152)', fg: 'oklch(0.94 0.06 152)' };
  }
  if (actor.kind === 'council') {
    return { letter: 'C', bg: 'oklch(0.30 0.10 305)', fg: 'oklch(0.94 0.06 305)' };
  }
  if (actor.kind === 'system') {
    return { letter: '◴', bg: 'oklch(0.28 0.020 255)', fg: 'oklch(0.78 0.012 255)' };
  }
  // wallet
  return { letter: actor.ens.slice(0, 1).toUpperCase(), bg: 'oklch(0.30 0.04 255)', fg: 'oklch(0.92 0.008 255)' };
}

function deltaColor(delta) {
  if (!delta) return { bg: 'transparent', fg: 'oklch(0.66 0.014 255)' };
  if (delta.kind === 'verdict' && delta.value === 'PASSED') return { bg: 'color-mix(in oklch, oklch(0.74 0.16 152) 16%, transparent)', fg: 'oklch(0.86 0.10 152)' };
  if (delta.kind === 'verdict' && delta.value === 'REJECTED') return { bg: 'color-mix(in oklch, oklch(0.70 0.18 22) 16%, transparent)', fg: 'oklch(0.86 0.10 22)' };
  if (delta.kind === 'vote' && delta.value === 'FOR') return { bg: 'color-mix(in oklch, oklch(0.74 0.16 152) 14%, transparent)', fg: 'oklch(0.82 0.10 152)' };
  if (delta.kind === 'vote' && delta.value === 'AGAINST') return { bg: 'color-mix(in oklch, oklch(0.70 0.18 22) 14%, transparent)', fg: 'oklch(0.82 0.10 22)' };
  if (delta.kind === 'vote' && delta.value === 'ABSTAIN') return { bg: 'oklch(0.26 0.018 255)', fg: 'oklch(0.66 0.014 255)' };
  if (delta.kind === 'reputation' && String(delta.value).startsWith('+')) return { bg: 'color-mix(in oklch, oklch(0.74 0.16 152) 14%, transparent)', fg: 'oklch(0.82 0.10 152)' };
  if (delta.kind === 'reputation' && String(delta.value).startsWith('-')) return { bg: 'color-mix(in oklch, oklch(0.70 0.18 22) 14%, transparent)', fg: 'oklch(0.82 0.10 22)' };
  return { bg: 'oklch(0.26 0.018 255)', fg: 'oklch(0.86 0.012 255)' };
}

function formatDelta(delta) {
  if (!delta) return '';
  if (delta.kind === 'amount') {
    const sign = delta.direction === 'out' ? '−' : delta.direction === 'rotate' ? '↻' : '+';
    return `${sign}${delta.value.toLocaleString()} ${delta.asset}`;
  }
  if (delta.kind === 'duration') return delta.value;
  if (delta.kind === 'count') return delta.value;
  if (delta.kind === 'verdict') return delta.value;
  if (delta.kind === 'vote') return `${delta.value} · ${Math.round(delta.conf * 100)}%`;
  if (delta.kind === 'rules') return delta.value;
  if (delta.kind === 'reputation') return delta.value;
  if (delta.kind === 'agent') return delta.value;
  return String(delta.value);
}

function AuditTopBar() {
  return (
    <div style={auditStyles.topBar}>
      <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
      <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
      <span style={{ color: 'oklch(0.78 0.012 255)' }}>AUDIT TRAIL</span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.74 0.16 152)' }} />
        <span>0G STORAGE · LIVE</span>
      </span>
    </div>
  );
}

function StatsBand({ stats }) {
  const cells = [
    { label: 'Total events', value: stats.total },
    { label: 'Last 24h', value: stats.last24h },
    { label: 'Proposals', value: stats.proposals },
    { label: 'Executions', value: stats.executions },
    { label: 'Archive', value: stats.archiveSize },
  ];
  return (
    <div style={auditStyles.statsBand}>
      {cells.map((c) => (
        <div key={c.label} style={auditStyles.statCell}>
          <span style={auditStyles.statLabel}>{c.label}</span>
          <span style={auditStyles.statValue}>{c.value}</span>
        </div>
      ))}
    </div>
  );
}

function FilterBar({ filters, active, onSelect }) {
  return (
    <div style={auditStyles.filterBar}>
      {filters.map((f) => {
        const isActive = f.id === active;
        return (
          <button key={f.id} onClick={() => onSelect(f.id)}
            style={{ ...auditStyles.filterChip, ...(isActive ? auditStyles.filterChipActive : {}) }}>
            {f.label.en}
            <span style={{
              ...auditStyles.filterCount,
              background: isActive ? 'color-mix(in oklch, oklch(0.78 0.14 75) 30%, transparent)' : 'oklch(0.30 0.030 255)',
              color: isActive ? 'oklch(0.86 0.10 75)' : 'oklch(0.78 0.012 255)',
            }}>{f.count}</span>
          </button>
        );
      })}
    </div>
  );
}

function EventRow({ ev, typeMeta }) {
  const meta = typeMeta[ev.type] || { color: 'oklch(0.66 0.014 255)', icon: '◌', label: '?' };
  const actor = actorIcon(ev.actor);
  const dColor = deltaColor(ev.delta);
  return (
    <div style={auditStyles.eventRow}>
      {/* Timestamp */}
      <div style={auditStyles.eventTimestamp}>
        <span>{new Date(ev.timestamp).toISOString().slice(11, 19)}</span>
        <span style={auditStyles.eventTimestampRel}>{ev.relativeTime}</span>
      </div>

      {/* Type icon */}
      <div style={{
        ...auditStyles.eventIcon,
        background: `color-mix(in oklch, ${meta.color} 22%, oklch(0.22 0.028 255))`,
        color: meta.color,
        border: `1px solid color-mix(in oklch, ${meta.color} 50%, transparent)`,
      }}>{meta.icon}</div>

      {/* Body */}
      <div style={auditStyles.eventBody}>
        <span style={auditStyles.eventTitle}>{ev.title}</span>
        <span style={auditStyles.eventActor}>by {ev.actor.ens}</span>
        {ev.summary && <span style={auditStyles.eventSummary}>{ev.summary}</span>}
      </div>

      {/* Delta */}
      {ev.delta && (
        <span style={{ ...auditStyles.eventDelta, background: dColor.bg, color: dColor.fg }}>
          {formatDelta(ev.delta)}
        </span>
      )}

      {/* Links */}
      <div style={auditStyles.eventLinks}>
        {ev.cid && <span style={auditStyles.eventLink} title={ev.cid}>0G</span>}
        {ev.txHash && <span style={auditStyles.eventLink} title={ev.txHash}>↗ tx</span>}
      </div>
    </div>
  );
}

function ExportPanel({ onClose, state }) {
  return (
    <div style={auditStyles.exportPanel}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>Export audit trail</span>
        <button onClick={onClose} style={{
          background: 'transparent', border: 'none', color: 'oklch(0.66 0.014 255)',
          fontSize: 18, cursor: 'pointer',
        }}>✕</button>
      </div>

      <div style={{
        padding: 12, borderRadius: 6,
        background: 'oklch(0.18 0.025 255)',
        border: '1px solid oklch(0.30 0.030 255)',
        fontSize: 11.5, color: 'oklch(0.86 0.012 255)', lineHeight: 1.5,
      }}>
        Export combines on-chain transactions with 0G Storage CIDs into one signed receipt.
        Verifiable by anyone with the CID and tx hash.
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'oklch(0.66 0.014 255)',
        }}>Format</span>
        {['JSON (full events + signatures)', 'CSV (timestamps + summaries)', 'PDF receipt (notarized)'].map((opt, i) => (
          <label key={i} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 4,
            background: i === 0 ? 'color-mix(in oklch, oklch(0.78 0.14 75) 12%, transparent)' : 'oklch(0.18 0.025 255)',
            border: `1px solid ${i === 0 ? 'oklch(0.78 0.14 75)' : 'oklch(0.30 0.030 255)'}`,
            cursor: 'pointer', fontSize: 12.5,
            color: 'oklch(0.92 0.008 255)',
          }}>
            <input type="radio" name="exp-fmt" defaultChecked={i === 0} />
            {opt}
          </label>
        ))}
      </div>

      <div style={{
        marginTop: 'auto',
        padding: 12, borderRadius: 6,
        background: 'color-mix(in oklch, oklch(0.74 0.16 152) 8%, transparent)',
        border: '1px solid color-mix(in oklch, oklch(0.74 0.16 152) 30%, transparent)',
        fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.86 0.10 152)',
      }}>
        ✓ 0G Storage CID will be embedded in receipt header
        <br />✓ Multisig signatures replayable from on-chain calldata
      </div>

      <button style={{
        padding: '10px 16px', borderRadius: 4,
        background: 'oklch(0.78 0.14 75)', border: 'none',
        color: 'oklch(0.18 0.04 75)',
        fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
        letterSpacing: '0.10em', textTransform: 'uppercase',
        cursor: 'pointer',
      }}>{state === 'exporting' ? 'Generating…' : '↓ Generate receipt'}</button>
    </div>
  );
}

function VariantAudit({ overrides = {} }) {
  const data = AUDIT_DATA;
  const stateProp = overrides.state || 'idle';
  const initialFilter = overrides.filter || (stateProp === 'filtered' ? 'executions' : 'all');
  const [filter, setFilter] = React.useState(initialFilter);
  const [exportOpen, setExportOpen] = React.useState(stateProp === 'exporting');

  const activeFilter = data.filters.find((f) => f.id === filter);
  let visibleEvents = data.events;
  if (filter !== 'all' && activeFilter?.types) {
    visibleEvents = data.events.filter((e) => activeFilter.types.includes(e.type));
  }
  if (stateProp === 'empty') visibleEvents = [];

  return (
    <div style={{ ...auditStyles.card, position: 'relative' }}>
      <AuditTopBar />
      <StatsBand stats={data.stats} />
      <FilterBar filters={data.filters} active={filter} onSelect={setFilter} />

      <div style={auditStyles.scroll}>
        {stateProp === 'loading' && Array.from({ length: 8 }).map((_, i) => (
          <div key={i} style={{ ...auditStyles.eventRow, gap: 14 }}>
            <div style={{ ...auditStyles.skeleton, width: 60 }} />
            <div style={{ ...auditStyles.skeleton, width: 28, height: 28, borderRadius: '50%' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ ...auditStyles.skeleton, width: '80%' }} />
              <div style={{ ...auditStyles.skeleton, width: '50%', height: 10 }} />
            </div>
            <div style={{ ...auditStyles.skeleton, width: 80 }} />
            <div style={{ ...auditStyles.skeleton, width: 60 }} />
          </div>
        ))}

        {stateProp !== 'loading' && visibleEvents.length === 0 && (
          <div style={{
            padding: '60px 22px', textAlign: 'center',
            color: 'oklch(0.66 0.014 255)',
            display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center',
          }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 24, color: 'oklch(0.40 0.020 255)' }}>◌</span>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: 'oklch(0.86 0.012 255)' }}>No events match filter</span>
            <span style={{ fontSize: 12 }}>Try a different filter or check back later.</span>
          </div>
        )}

        {stateProp !== 'loading' && visibleEvents.map((ev) => (
          <EventRow key={ev.id} ev={ev} typeMeta={data.typeMeta} />
        ))}
      </div>

      <div style={auditStyles.footer}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.74 0.16 152)' }} />
          ARCHIVED · 0G STORAGE · {data.stats.archiveSize}
        </span>
        <code style={{ fontSize: 10, color: 'oklch(0.78 0.012 255)' }}>bafy...latest-cid</code>
        <div style={{ flex: 1 }} />
        <span style={{ color: 'oklch(0.66 0.014 255)' }}>
          Showing {visibleEvents.length} of {data.stats.total}
        </span>
        <button style={auditStyles.footerBtn}>↻ Refresh</button>
        <button style={auditStyles.footerBtn} onClick={() => setExportOpen(true)}>↓ Export</button>
        <button style={{ ...auditStyles.footerBtn, ...auditStyles.footerBtnPrimary }}>↗ Verify on Basescan</button>
      </div>

      {exportOpen && <ExportPanel onClose={() => setExportOpen(false)} state={stateProp} />}
    </div>
  );
}

window.VariantAudit = VariantAudit;
