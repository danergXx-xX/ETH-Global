// On-chain Vote+Execute Flow — 5 sub-states ze szczegolowym timelock countdown.
// Phase 1 wagmi v2 UX wzorzec dla Aiko: pelen flow signature collection →
// queue → timelock → execute → archive. Kazdy sub-state widoczny jako
// osobny artboard.
//
// State variants via `state` prop:
//   'collecting_sigs'    — 3/5 sigs, czeka na pozostalych
//   'threshold_reached'  — 5/5 sigs, gotowe do queue
//   'queued_timelock'    — w timelocku, countdown 48h
//   'executing'          — tx pending on-chain
//   'executed'           — mined + 0G archived

const executeStyles = {
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
  scroll: { flex: 1, overflowY: 'auto', padding: '24px 32px' },
  // Stage indicator (5 dots z labelami)
  stageStrip: {
    display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
    gap: 0, marginBottom: 28,
    position: 'relative',
  },
  stageDot: {
    width: 32, height: 32, borderRadius: 16,
    display: 'grid', placeItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
    margin: '0 auto', position: 'relative', zIndex: 2,
    transition: 'all .25s',
  },
  stageLine: {
    position: 'absolute', top: 16, left: '10%', right: '10%', height: 2,
    background: 'oklch(0.30 0.030 255)', zIndex: 1,
  },
  stageLineFilled: {
    position: 'absolute', top: 16, left: '10%', height: 2,
    background: 'oklch(0.74 0.16 152)', zIndex: 1,
    transition: 'width .35s ease-out',
  },
  stageLabel: {
    textAlign: 'center', marginTop: 10,
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.06em',
  },
  stageDesc: {
    textAlign: 'center', marginTop: 3,
    fontFamily: 'var(--font-sans)', fontSize: 10.5,
    color: 'oklch(0.66 0.014 255)',
  },
  // Hero block
  hero: {
    padding: '20px 24px',
    borderRadius: 8,
    background: 'linear-gradient(180deg, oklch(0.22 0.04 245) 0%, oklch(0.20 0.025 255) 100%)',
    border: '1px solid oklch(0.30 0.030 255)',
    marginBottom: 24,
  },
  heroLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.12em', textTransform: 'uppercase',
    color: 'oklch(0.66 0.014 255)', marginBottom: 8,
  },
  heroTitle: {
    fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 600,
    lineHeight: 1.2, color: 'oklch(0.97 0.008 255)',
    marginBottom: 6,
  },
  heroMeta: {
    display: 'flex', gap: 14, flexWrap: 'wrap',
    fontFamily: 'var(--font-mono)', fontSize: 10.5,
    color: 'oklch(0.66 0.014 255)',
  },
  // Two-column grid
  grid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
  },
  panel: {
    padding: 20, borderRadius: 8,
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
  },
  panelLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'oklch(0.66 0.014 255)', marginBottom: 14,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  // Signers
  signerRow: {
    display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 10,
    padding: '10px 0', alignItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 11.5,
    borderTop: '1px solid oklch(0.28 0.028 255)',
  },
  // Tx preview
  calldataBox: {
    background: 'oklch(0.16 0.020 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    borderRadius: 4, padding: 12,
    fontFamily: 'var(--font-mono)', fontSize: 10.5,
    color: 'oklch(0.86 0.012 255)', wordBreak: 'break-all',
    marginBottom: 12,
  },
  argRow: {
    display: 'grid', gridTemplateColumns: '90px 1fr',
    gap: 10, padding: '6px 0',
    fontFamily: 'var(--font-mono)', fontSize: 11,
    borderTop: '1px solid oklch(0.28 0.028 255)',
  },
  // Balance diff
  diffRow: {
    display: 'grid', gridTemplateColumns: '1fr auto auto auto',
    gap: 12, alignItems: 'center',
    padding: '10px 0',
    borderTop: '1px solid oklch(0.28 0.028 255)',
    fontFamily: 'var(--font-mono)', fontSize: 11.5,
  },
  // Footer / actions
  footer: {
    padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 12,
    background: 'oklch(0.20 0.025 255)',
    borderTop: '1px solid oklch(0.30 0.030 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'oklch(0.66 0.014 255)', letterSpacing: '0.04em', flexShrink: 0,
  },
  btn: {
    padding: '8px 14px', borderRadius: 4,
    background: 'transparent',
    border: '1px solid oklch(0.40 0.030 255)',
    color: 'oklch(0.92 0.008 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer',
  },
  btnPrimary: {
    background: 'oklch(0.74 0.16 152)',
    borderColor: 'oklch(0.74 0.16 152)',
    color: 'oklch(0.18 0.04 152)',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
};

function StateColor(state) {
  if (state === 'executed') return 'oklch(0.74 0.16 152)';
  if (state === 'executing') return 'oklch(0.78 0.14 75)';
  if (state === 'queued_timelock') return 'oklch(0.74 0.15 245)';
  if (state === 'threshold_reached') return 'oklch(0.74 0.16 152)';
  return 'oklch(0.78 0.14 75)';
}

function stageIndexForState(state) {
  if (state === 'collecting_sigs')   return 0;
  if (state === 'threshold_reached') return 1;
  if (state === 'queued_timelock')   return 2;
  if (state === 'executing')         return 3;
  if (state === 'executed')          return 4;
  return 0;
}

function ExecuteTopBar({ state }) {
  const colorMap = {
    collecting_sigs:    { dot: 'oklch(0.78 0.14 75)',  label: 'COLLECTING SIGNATURES' },
    threshold_reached:  { dot: 'oklch(0.74 0.16 152)', label: 'THRESHOLD REACHED · READY TO QUEUE' },
    queued_timelock:    { dot: 'oklch(0.74 0.15 245)', label: 'QUEUED IN TIMELOCK' },
    executing:          { dot: 'oklch(0.78 0.14 75)',  label: 'EXECUTING ON-CHAIN' },
    executed:           { dot: 'oklch(0.74 0.16 152)', label: 'EXECUTED · ARCHIVED' },
  };
  const c = colorMap[state] || colorMap.collecting_sigs;
  return (
    <div style={executeStyles.topBar}>
      <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
      <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
      <span style={{ color: 'oklch(0.78 0.012 255)' }}>EXECUTE · {EXECUTE_FLOW.proposal.id}</span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 7, height: 7, borderRadius: 4, background: c.dot,
          boxShadow: `0 0 6px ${c.dot}`,
          animation: state === 'executing' ? 'a-pulse 1.4s ease-out infinite' : 'none',
        }} />
        <span style={{ color: c.dot, fontWeight: 700 }}>{c.label}</span>
      </span>
    </div>
  );
}

function StageStrip({ activeIdx, stages }) {
  return (
    <div style={executeStyles.stageStrip}>
      <div style={executeStyles.stageLine} />
      <div style={{ ...executeStyles.stageLineFilled, width: `${(activeIdx / (stages.length - 1)) * 80}%` }} />
      {stages.map((s, i) => {
        const isActive = i === activeIdx;
        const isDone = i < activeIdx;
        const isFuture = i > activeIdx;
        const dotStyle = isDone
          ? { background: 'oklch(0.74 0.16 152)', color: 'oklch(0.18 0.04 152)', border: '2px solid oklch(0.74 0.16 152)' }
          : isActive
          ? { background: 'oklch(0.78 0.14 75)', color: 'oklch(0.18 0.04 75)', border: '2px solid oklch(0.78 0.14 75)', boxShadow: '0 0 12px oklch(0.78 0.14 75)' }
          : { background: 'oklch(0.22 0.028 255)', color: 'oklch(0.66 0.014 255)', border: '2px solid oklch(0.30 0.030 255)' };
        return (
          <div key={s.id}>
            <div style={{ ...executeStyles.stageDot, ...dotStyle }}>
              {isDone ? '✓' : i + 1}
            </div>
            <div style={{
              ...executeStyles.stageLabel,
              color: isFuture ? 'oklch(0.62 0.014 255)' : isActive ? 'oklch(0.86 0.10 75)' : 'oklch(0.86 0.012 255)',
            }}>{s.label}</div>
            <div style={executeStyles.stageDesc}>{s.desc}</div>
          </div>
        );
      })}
    </div>
  );
}

function TimelockCountdown({ remaining, total }) {
  // Circular progress: kolorowy luk = remaining time, kurczy się gdy zostaje mniej.
  // remaining w sekundach. Mockup statyczny - Aiko Phase 1B doda useEffect+RAF tick.
  const pct = Math.max(0, Math.min(1, remaining / total));
  const size = 140;
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  // strokeDashoffset = c * (1 - pct) → luk pokazuje pct = remaining/total (kurczy się)
  const offset = c * (1 - pct);
  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="oklch(0.28 0.028 255)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="oklch(0.74 0.15 245)" strokeWidth={stroke}
          strokeDasharray={c} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset .5s' }} />
      </svg>
      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: 'oklch(0.66 0.014 255)', marginBottom: 4,
        }}>Timelock ETA</div>
        <div style={{
          fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 600,
          lineHeight: 1, color: 'oklch(0.74 0.15 245)',
          fontVariantNumeric: 'tabular-nums',
        }}>{hours}h {String(minutes).padStart(2, '0')}m</div>
        <div style={{
          fontFamily: 'var(--font-sans)', fontSize: 12,
          color: 'oklch(0.66 0.014 255)', marginTop: 6,
        }}>remaining of 48h delay</div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'oklch(0.46 0.014 255)', marginTop: 2,
        }}>ETA: 2026-05-04 16:18 UTC</div>
      </div>
    </div>
  );
}

function SignerRow({ s }) {
  return (
    <div style={executeStyles.signerRow}>
      <span style={{
        width: 12, height: 12, borderRadius: 6,
        background: s.signed ? 'oklch(0.74 0.16 152)' : 'oklch(0.30 0.030 255)',
        border: s.signed ? '2px solid oklch(0.18 0.025 255)' : '1px solid oklch(0.40 0.030 255)',
        boxShadow: s.signed ? '0 0 6px oklch(0.74 0.16 152)' : 'none',
      }} />
      <span style={{ color: s.signed ? 'oklch(0.92 0.008 255)' : 'oklch(0.66 0.014 255)' }}>
        {s.ens} <span style={{ color: 'oklch(0.62 0.014 255)' }}>· {s.addr}</span>
      </span>
      <span style={{ color: s.signed ? 'oklch(0.74 0.16 152)' : 'oklch(0.66 0.014 255)', fontSize: 10 }}>
        {s.signed ? '✓ ' + s.ago : s.ago}
      </span>
    </div>
  );
}

function SignersPanel({ signers, threshold, state }) {
  const signedCount = signers.filter((s) => s.signed).length;
  const reached = signedCount >= threshold;
  return (
    <div style={executeStyles.panel}>
      <div style={executeStyles.panelLabel}>
        Multisig signatures
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 11,
          color: reached ? 'oklch(0.74 0.16 152)' : 'oklch(0.78 0.14 75)',
          fontWeight: 700,
        }}>{signedCount} / {threshold} required</span>
      </div>
      {/* Progress bar */}
      <div style={{
        height: 4, borderRadius: 2,
        background: 'oklch(0.28 0.028 255)',
        marginBottom: 14, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${Math.min(100, (signedCount / threshold) * 100)}%`,
          background: reached ? 'oklch(0.74 0.16 152)' : 'oklch(0.78 0.14 75)',
          transition: 'width .35s',
        }} />
      </div>
      {signers.map((s) => <SignerRow key={s.ens} s={s} />)}
    </div>
  );
}

function TxPreviewPanel({ tx }) {
  return (
    <div style={executeStyles.panel}>
      <div style={executeStyles.panelLabel}>
        Transaction preview
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 10,
          color: 'oklch(0.78 0.012 255)',
        }}>{tx.gas} gas · ~${tx.estCostUsd}</span>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'oklch(0.66 0.014 255)', marginBottom: 4 }}>Target contract</div>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.92 0.008 255)' }}>{tx.target}</code>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)', marginTop: 2 }}>{tx.targetLabel}</div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'oklch(0.66 0.014 255)', marginBottom: 4 }}>Function</div>
        <code style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: 'oklch(0.86 0.10 75)' }}>{tx.function}</code>
      </div>

      <div style={executeStyles.calldataBox}>
        <span style={{ color: 'oklch(0.66 0.014 255)' }}>calldata</span>
        <br />{tx.calldata}
      </div>

      <div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.10em', textTransform: 'uppercase',
          color: 'oklch(0.66 0.014 255)', marginBottom: 6,
        }}>Decoded args</div>
        {tx.decodedArgs.map((arg, i) => (
          <div key={i} style={executeStyles.argRow}>
            <span style={{ color: 'oklch(0.66 0.014 255)' }}>{arg.name}</span>
            <div>
              <div style={{ color: 'oklch(0.92 0.008 255)' }}>{arg.value}</div>
              <div style={{ fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>{arg.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BalanceDiffPanel({ diff }) {
  return (
    <div style={executeStyles.panel}>
      <div style={executeStyles.panelLabel}>Balance diff (pre → post)</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 8 }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>BEFORE</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>AFTER</span>
      </div>
      {diff.pre.map((p, i) => {
        const post = diff.post[i];
        const changed = p.amount !== post.amount;
        return (
          <div key={i} style={executeStyles.diffRow}>
            <div>
              <div style={{ color: 'oklch(0.92 0.008 255)' }}>{p.asset}</div>
              <div style={{ fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>{p.location}</div>
            </div>
            <span style={{ color: 'oklch(0.78 0.012 255)' }}>{p.amount.toLocaleString()}</span>
            <span style={{ color: 'oklch(0.62 0.014 255)' }}>→</span>
            <span style={{
              color: changed ? (post.amount > p.amount ? 'oklch(0.86 0.10 152)' : 'oklch(0.86 0.10 22)') : 'oklch(0.78 0.012 255)',
              fontWeight: changed ? 700 : 400,
            }}>{post.amount.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
}

function ExecutedReceipt({ exec, archive, expectedYield }) {
  return (
    <div style={{
      ...executeStyles.panel,
      gridColumn: 'span 2',
      background: 'linear-gradient(135deg, oklch(0.24 0.06 152) 0%, oklch(0.20 0.025 255) 100%)',
      border: '1px solid oklch(0.55 0.16 152)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{
          width: 28, height: 28, borderRadius: 14, background: 'oklch(0.74 0.16 152)',
          color: 'oklch(0.18 0.04 152)',
          display: 'grid', placeItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
        }}>✓</span>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600 }}>Executed on Base · archived to 0G</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'oklch(0.66 0.014 255)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Block</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{exec.block.toLocaleString()}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'oklch(0.66 0.014 255)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Gas used</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{exec.gasUsed}</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'oklch(0.66 0.014 255)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Expected APY</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'oklch(0.86 0.10 152)' }}>{expectedYield.apy}%</div>
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'oklch(0.66 0.014 255)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Yield/yr</div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'oklch(0.86 0.10 152)' }}>+${expectedYield.annual.toLocaleString()}</div>
        </div>
      </div>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid oklch(0.30 0.030 255)' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)', marginBottom: 4 }}>tx · {exec.txHash}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>0G CID · {archive.cid.slice(0, 50)}…</div>
      </div>
    </div>
  );
}

function VariantExecute({ overrides = {} }) {
  const data = EXECUTE_FLOW;
  const state = overrides.state || 'collecting_sigs';
  const activeIdx = stageIndexForState(state);

  const remainingSec = state === 'queued_timelock'
    ? Math.max(0, data.timelock.delay - data.timelock.elapsed)
    : 0;

  const showTimelock = state === 'queued_timelock';
  const showExecuted = state === 'executed';

  return (
    <div style={executeStyles.card}>
      <ExecuteTopBar state={state} />

      <div style={executeStyles.scroll}>
        {/* Stage indicator */}
        <StageStrip activeIdx={activeIdx} stages={data.stages} />

        {/* Hero */}
        <div style={executeStyles.hero}>
          <div style={executeStyles.heroLabel}>Proposal · {data.proposal.id}</div>
          <h2 style={executeStyles.heroTitle}>{data.proposal.title}</h2>
          <div style={executeStyles.heroMeta}>
            <span>Network · {data.proposal.network}</span>
            <span>·</span>
            <span>Governor · {data.proposal.governor.slice(0, 10)}…</span>
            <span>·</span>
            <span>Timelock · {data.proposal.timelock.slice(0, 10)}…</span>
          </div>
        </div>

        {/* Timelock countdown (only state='queued_timelock') */}
        {showTimelock && (
          <div style={{
            ...executeStyles.panel,
            marginBottom: 20,
            background: 'linear-gradient(135deg, oklch(0.22 0.05 245) 0%, oklch(0.20 0.025 255) 100%)',
            border: '1px solid oklch(0.55 0.14 245)',
          }}>
            <TimelockCountdown remaining={remainingSec} total={data.timelock.delay} />
          </div>
        )}

        {/* Executed receipt (only state='executed') */}
        {showExecuted && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 20, marginBottom: 20 }}>
            <ExecutedReceipt exec={data.execution} archive={data.archive} expectedYield={data.expectedYield} />
          </div>
        )}

        {/* Two-column grid: signers + tx preview */}
        <div style={executeStyles.grid}>
          <SignersPanel signers={data.signers} threshold={data.threshold} state={state} />
          <TxPreviewPanel tx={data.txPreview} />
        </div>

        {/* Balance diff */}
        <div style={{ marginTop: 20 }}>
          <BalanceDiffPanel diff={data.balanceDiff} />
        </div>
      </div>

      {/* Footer actions */}
      <div style={executeStyles.footer}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: StateColor(state) }} />
          {state.toUpperCase().replace(/_/g, ' ')}
        </span>
        <div style={{ flex: 1 }} />
        {state === 'collecting_sigs' && (
          <>
            <button style={executeStyles.btn}>↗ View on Safe UI</button>
            <button style={{ ...executeStyles.btn, ...executeStyles.btnPrimary }}>✓ Sign multisig</button>
          </>
        )}
        {state === 'threshold_reached' && (
          <>
            <button style={executeStyles.btn}>↗ View calldata</button>
            <button style={{ ...executeStyles.btn, ...executeStyles.btnPrimary }}>→ Queue in Timelock</button>
          </>
        )}
        {state === 'queued_timelock' && (
          <>
            <button style={executeStyles.btn}>✕ Cancel (5/7 sigs)</button>
            <button style={{ ...executeStyles.btn, ...executeStyles.btnDisabled }} disabled>⏳ Execute (waiting)</button>
          </>
        )}
        {state === 'executing' && (
          <button style={{ ...executeStyles.btn, ...executeStyles.btnPrimary }} disabled>⌛ Pending on-chain…</button>
        )}
        {state === 'executed' && (
          <>
            <button style={executeStyles.btn}>↗ View on Basescan</button>
            <button style={executeStyles.btn}>↗ View 0G archive</button>
            <button style={{ ...executeStyles.btn, ...executeStyles.btnPrimary }}>✓ Done</button>
          </>
        )}
      </div>
    </div>
  );
}

window.VariantExecute = VariantExecute;
