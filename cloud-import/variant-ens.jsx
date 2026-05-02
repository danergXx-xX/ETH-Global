// ENS Identity Card (Component 9) — Phase 2 ENSGlobal partner prize.
// 6 ENS identities w jednej karcie: 1 treasury wallet + 5 agentow.
// Live resolution z viem (mocked w tym mockup'ie).
//
// State variants via `state` prop:
//   'resolving'  — ENS lookup in flight, skeleton/spinner
//   'resolved'   — full grid widoczny (default)
//   'error'      — ENS resolver down lub network issue
//   'not_found'  — ENS subname nie istnieje (Phase 2 not deployed yet)

const ensStyles = {
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
  scroll: { flex: 1, overflowY: 'auto', padding: '24px 28px' },
  parentBanner: {
    padding: '14px 18px',
    background: 'linear-gradient(135deg, oklch(0.24 0.06 245) 0%, oklch(0.20 0.025 255) 100%)',
    border: '1px solid oklch(0.55 0.14 245)',
    borderRadius: 8, marginBottom: 24,
    display: 'flex', alignItems: 'center', gap: 16,
  },
  treasuryCard: {
    padding: 20,
    background: 'linear-gradient(135deg, oklch(0.24 0.06 152) 0%, oklch(0.20 0.025 255) 100%)',
    border: '1px solid oklch(0.55 0.16 152)',
    borderRadius: 8, marginBottom: 24,
  },
  agentsGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: 14,
  },
  agentCard: {
    padding: 18, borderRadius: 8,
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    display: 'flex', flexDirection: 'column', gap: 12,
    transition: 'border-color .15s, background .15s',
    cursor: 'pointer',
  },
  ensName: {
    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600,
    letterSpacing: '0.02em',
  },
  address: {
    fontFamily: 'var(--font-mono)', fontSize: 10.5,
    color: 'oklch(0.66 0.014 255)',
    wordBreak: 'break-all',
  },
  recordRow: {
    display: 'grid', gridTemplateColumns: '90px 1fr',
    gap: 10, padding: '6px 0',
    fontFamily: 'var(--font-mono)', fontSize: 10.5,
    borderTop: '1px solid oklch(0.28 0.028 255)',
  },
  resolutionBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '3px 7px', borderRadius: 3,
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
    letterSpacing: '0.10em', textTransform: 'uppercase',
  },
  // Resolution log (footer)
  logRow: {
    display: 'grid', gridTemplateColumns: '1fr 60px 60px 130px',
    gap: 10, padding: '6px 0',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    borderTop: '1px solid oklch(0.28 0.028 255)',
  },
};

function ENSResolutionBadge({ state, latencyMs }) {
  const styles = {
    resolved: { bg: 'color-mix(in oklch, oklch(0.74 0.16 152) 22%, transparent)', fg: 'oklch(0.86 0.10 152)', border: 'oklch(0.55 0.16 152)', icon: '✓', label: 'Resolved' },
    resolving: { bg: 'color-mix(in oklch, oklch(0.78 0.14 75) 22%, transparent)', fg: 'oklch(0.86 0.10 75)', border: 'oklch(0.65 0.14 75)', icon: '…', label: 'Resolving' },
    error: { bg: 'color-mix(in oklch, oklch(0.70 0.18 22) 22%, transparent)', fg: 'oklch(0.86 0.10 22)', border: 'oklch(0.55 0.16 22)', icon: '✕', label: 'Error' },
    not_found: { bg: 'oklch(0.26 0.018 255)', fg: 'oklch(0.66 0.014 255)', border: 'oklch(0.40 0.020 255)', icon: '◌', label: 'Not found' },
  };
  const s = styles[state] || styles.resolved;
  return (
    <span style={{ ...ensStyles.resolutionBadge, background: s.bg, color: s.fg, border: `1px solid ${s.border}` }}>
      <span>{s.icon}</span>
      {s.label}
      {latencyMs && <span style={{ color: 'oklch(0.56 0.014 255)', fontWeight: 400 }}>· {latencyMs}ms</span>}
    </span>
  );
}

function AgentEnsCard({ agent, state }) {
  const accent = `oklch(0.74 0.16 ${agent.hue})`;
  const portraitBg = `linear-gradient(135deg, oklch(0.55 0.14 ${agent.hue}) 0%, oklch(0.30 0.10 ${agent.hue}) 100%)`;
  const cardState = state === 'resolving' ? 'resolving' : state === 'error' ? 'error' : state === 'not_found' ? 'not_found' : agent.state;
  return (
    <div style={ensStyles.agentCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 22, overflow: 'hidden',
          background: portraitBg,
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
          color: 'oklch(0.96 0.04 ' + agent.hue + ')',
          boxShadow: `0 0 0 1.5px color-mix(in oklch, ${accent} 60%, white)`,
        }}>
          {agent.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ ...ensStyles.ensName, color: 'oklch(0.97 0.008 255)' }}>{agent.name}</div>
          <div style={{ ...ensStyles.address, marginTop: 2 }}>{agent.address.slice(0, 12)}…{agent.address.slice(-6)}</div>
        </div>
        <ENSResolutionBadge state={cardState} latencyMs={cardState === 'resolved' ? 92 : null} />
      </div>

      <div>
        {Object.entries(agent.records).map(([k, v]) => (
          <div key={k} style={ensStyles.recordRow}>
            <span style={{ color: 'oklch(0.56 0.014 255)' }}>{k}</span>
            <span style={{ color: 'oklch(0.86 0.012 255)' }}>{v}</span>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        <button style={{
          padding: '5px 9px', borderRadius: 3,
          background: 'transparent', border: '1px solid oklch(0.40 0.030 255)',
          color: 'oklch(0.78 0.012 255)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.06em', cursor: 'pointer', flex: 1,
        }}>↗ ENS app</button>
        <button style={{
          padding: '5px 9px', borderRadius: 3,
          background: 'transparent', border: '1px solid oklch(0.40 0.030 255)',
          color: 'oklch(0.78 0.012 255)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.06em', cursor: 'pointer', flex: 1,
        }}
        onClick={() => { if (window.openReasoningChat) window.openReasoningChat(agent.id, agent.records?.description || '', 'en'); }}
        >↳ Challenge</button>
      </div>
    </div>
  );
}

function TreasuryEnsCard({ treasury, state }) {
  const cardState = state === 'resolving' ? 'resolving' : state === 'error' ? 'error' : treasury.state;
  return (
    <div style={ensStyles.treasuryCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 26,
          background: 'linear-gradient(135deg, oklch(0.55 0.14 152) 0%, oklch(0.30 0.10 152) 100%)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700,
          color: 'oklch(0.96 0.04 152)',
          boxShadow: '0 0 0 2px oklch(0.55 0.16 152)',
        }}>T</div>
        <div style={{ flex: 1 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'oklch(0.66 0.014 255)', marginBottom: 4,
          }}>Treasury wallet</div>
          <div style={{ ...ensStyles.ensName, fontSize: 18, color: 'oklch(0.97 0.008 255)' }}>{treasury.name}</div>
          <div style={{ ...ensStyles.address, marginTop: 4 }}>{treasury.address}</div>
        </div>
        <ENSResolutionBadge state={cardState} latencyMs={cardState === 'resolved' ? 121 : null} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'oklch(0.66 0.014 255)', marginBottom: 8,
          }}>Text records</div>
          {Object.entries(treasury.records).map(([k, v]) => (
            <div key={k} style={ensStyles.recordRow}>
              <span style={{ color: 'oklch(0.56 0.014 255)' }}>{k}</span>
              <span style={{ color: 'oklch(0.86 0.012 255)' }}>{v}</span>
            </div>
          ))}
        </div>
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'oklch(0.66 0.014 255)', marginBottom: 8,
          }}>Live balance</div>
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{
              padding: '10px 12px', borderRadius: 6,
              background: 'oklch(0.18 0.025 255)',
              border: '1px solid oklch(0.30 0.030 255)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'oklch(0.56 0.014 255)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>USDC</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{treasury.balance.usdc.toLocaleString()}</div>
            </div>
            <div style={{
              padding: '10px 12px', borderRadius: 6,
              background: 'oklch(0.18 0.025 255)',
              border: '1px solid oklch(0.30 0.030 255)',
            }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'oklch(0.56 0.014 255)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>ETH</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{treasury.balance.eth}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function VariantEns({ overrides = {} }) {
  const data = ENS_DATA;
  const state = overrides.state || 'resolved';

  return (
    <div style={ensStyles.card}>
      <div style={ensStyles.topBar}>
        <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
        <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
        <span style={{ color: 'oklch(0.78 0.012 255)' }}>ENS IDENTITY</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: state === 'resolved' ? 'oklch(0.74 0.16 152)' : state === 'error' ? 'oklch(0.70 0.18 22)' : 'oklch(0.78 0.14 75)' }} />
          <span>{data.parent} · {data.agents.length + 1} SUBNAMES</span>
        </span>
      </div>

      <div style={ensStyles.scroll}>
        {/* Parent banner */}
        <div style={ensStyles.parentBanner}>
          <div>
            <div style={{
              fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'oklch(0.66 0.014 255)', marginBottom: 4,
            }}>Parent ENS · NameStone Phase 2</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'oklch(0.97 0.008 255)' }}>{data.parent}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.78 0.012 255)', marginTop: 4 }}>
              Resolver · {data.resolver.slice(0, 14)}…{data.resolver.slice(-6)}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <ENSResolutionBadge state="resolved" latencyMs={84} />
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)', marginTop: 6 }}>
              {data.registrar}
            </div>
          </div>
        </div>

        {/* Treasury card (1 prominent) */}
        <TreasuryEnsCard treasury={data.treasury} state={state} />

        {/* Agents grid (5 cards) */}
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'oklch(0.56 0.014 255)', marginBottom: 12,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span>Council agents · 5 subnames</span>
          <span>Avg latency · 92ms</span>
        </div>
        <div style={ensStyles.agentsGrid}>
          {data.agents.map((a) => <AgentEnsCard key={a.id} agent={a} state={state} />)}
        </div>

        {/* Resolution log */}
        <div style={{ marginTop: 24 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'oklch(0.56 0.014 255)', marginBottom: 12,
          }}>Resolution log (debug)</div>
          <div style={{
            background: 'oklch(0.20 0.025 255)',
            border: '1px solid oklch(0.30 0.030 255)',
            borderRadius: 6, padding: 14,
          }}>
            <div style={{ ...ensStyles.logRow, color: 'oklch(0.56 0.014 255)', fontWeight: 600 }}>
              <span>Name</span>
              <span>Status</span>
              <span>Latency</span>
              <span>Resolver</span>
            </div>
            {data.resolutionLog.map((r, i) => (
              <div key={i} style={ensStyles.logRow}>
                <span style={{ color: 'oklch(0.86 0.012 255)' }}>{r.name}</span>
                <span style={{ color: r.status === 'OK' ? 'oklch(0.86 0.10 152)' : 'oklch(0.86 0.10 22)' }}>{r.status}</span>
                <span style={{ color: 'oklch(0.78 0.012 255)' }}>{r.latencyMs}ms</span>
                <span style={{ color: 'oklch(0.66 0.014 255)' }}>{r.resolver}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

window.VariantEns = VariantEns;
