// Verdict Card (Component 3) — final, share-able receipt after debate concludes.
// One self-contained card. Sections: header → tally hero → per-agent votes (challengeable)
// → counter-arguments addressed → execution panel → archive + share footer.
//
// State variants exposed via `state` prop:
//   'reveal'   — tally just landed, animate counters
//   'pending'  — multisig signatures collecting
//   'executed' — all signed, txs confirmed on-chain
//   'rejected' — quorum failed (alternate data path)

const verdictStyles = {
  card: {
    width: '100%', height: '100%',
    background: 'oklch(0.18 0.025 255)',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  scroll: { flex: 1, overflowY: 'auto' },
  // Top bar
  topBar: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 22px', borderBottom: '1px solid oklch(0.30 0.030 255)',
    fontFamily: 'var(--font-mono)', fontSize: 11,
    background: 'oklch(0.20 0.025 255)',
  },
  hero: {
    padding: '32px 32px 28px',
    borderBottom: '1px solid oklch(0.28 0.028 255)',
    background: 'linear-gradient(180deg, oklch(0.22 0.04 152) 0%, oklch(0.18 0.025 255) 100%)',
    position: 'relative',
  },
  passedBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '6px 12px', borderRadius: 4,
    background: 'oklch(0.30 0.10 152)',
    border: '1px solid oklch(0.55 0.16 152)',
    color: 'oklch(0.92 0.10 152)',
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
    letterSpacing: '0.10em', textTransform: 'uppercase',
  },
  proposalTitle: {
    fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600,
    lineHeight: 1.15, letterSpacing: '-0.01em', margin: '14px 0 8px',
    textWrap: 'balance', color: 'oklch(0.97 0.008 255)',
  },
  proposalMeta: {
    display: 'flex', gap: 14, flexWrap: 'wrap',
    fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'oklch(0.66 0.014 255)', marginTop: 8,
  },
  // Tally
  tallyRow: {
    display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 1, marginTop: 24,
    background: 'oklch(0.28 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    borderRadius: 6, overflow: 'hidden',
  },
  tallyCell: {
    background: 'oklch(0.20 0.025 255)',
    padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  tallyLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'oklch(0.56 0.014 255)',
  },
  tallyValue: {
    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600,
    lineHeight: 1, fontVariantNumeric: 'tabular-nums',
  },
  // Sections
  section: { padding: '24px 32px', borderBottom: '1px solid oklch(0.28 0.028 255)' },
  sectionLabel: {
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'oklch(0.56 0.014 255)', marginBottom: 12,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  // Agent vote row
  agentVote: {
    display: 'grid', gridTemplateColumns: '40px 1fr auto auto',
    gap: 14, alignItems: 'center', padding: '12px 14px',
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    borderRadius: 6, marginBottom: 8,
  },
  agentName: { fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'oklch(0.97 0.008 255)' },
  agentRationale: { fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'oklch(0.78 0.012 255)', lineHeight: 1.4, marginTop: 3 },
  voteChip: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 78, padding: '5px 10px', borderRadius: 4,
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
    letterSpacing: '0.10em', textTransform: 'uppercase',
  },
  challengeBtn: {
    padding: '5px 9px', borderRadius: 3,
    background: 'transparent', border: '1px solid oklch(0.40 0.030 255)',
    color: 'oklch(0.78 0.012 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.06em', cursor: 'pointer',
  },
  // Counter-arg row
  counterRow: {
    padding: '10px 14px', borderRadius: 6,
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    marginBottom: 8,
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  counterHead: { display: 'flex', alignItems: 'flex-start', gap: 10 },
  counterStatus: {
    flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
    padding: '2px 6px', borderRadius: 3, letterSpacing: '0.10em',
    textTransform: 'uppercase',
  },
  counterText: { fontSize: 13, color: 'oklch(0.92 0.008 255)', lineHeight: 1.5, flex: 1 },
  counterResolution: {
    fontSize: 11.5, color: 'oklch(0.70 0.012 255)', lineHeight: 1.5,
    paddingLeft: 14, borderLeft: '2px solid oklch(0.40 0.06 152)', fontStyle: 'italic',
  },
  // Execution
  execGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16,
  },
  txRow: {
    display: 'grid', gridTemplateColumns: '24px 1fr auto', gap: 12,
    padding: '10px 12px', alignItems: 'center',
    background: 'oklch(0.18 0.025 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    borderRadius: 4,
  },
  signerRow: {
    display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 10,
    padding: '8px 12px', alignItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 11,
  },
  // Footer
  footer: {
    padding: '16px 32px', display: 'flex', alignItems: 'center', gap: 16,
    background: 'oklch(0.20 0.025 255)', borderTop: '1px solid oklch(0.30 0.030 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'oklch(0.66 0.014 255)', letterSpacing: '0.04em', flexShrink: 0,
  },
  footerBtn: {
    padding: '8px 14px', borderRadius: 4,
    background: 'transparent', border: '1px solid oklch(0.40 0.030 255)',
    color: 'oklch(0.92 0.008 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', gap: 6,
  },
  footerBtnPrimary: {
    background: 'oklch(0.55 0.16 152)',
    borderColor: 'oklch(0.55 0.16 152)',
    color: 'oklch(0.10 0.02 152)',
  },
};

function voteColor(vote) {
  if (vote === 'FOR') return { bg: 'oklch(0.30 0.10 152)', fg: 'oklch(0.92 0.10 152)', border: 'oklch(0.55 0.16 152)' };
  if (vote === 'AGAINST') return { bg: 'oklch(0.30 0.10 22)', fg: 'oklch(0.92 0.10 22)', border: 'oklch(0.55 0.16 22)' };
  return { bg: 'oklch(0.26 0.018 255)', fg: 'oklch(0.78 0.012 255)', border: 'oklch(0.40 0.020 255)' };
}

function CountUp({ end, duration = 700 }) {
  const [val, setVal] = React.useState(0);
  React.useEffect(() => {
    let raf; const start = performance.now();
    const loop = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(end * eased));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [end, duration]);
  return <>{val}</>;
}

function VerdictTopBar({ data }) {
  return (
    <div style={verdictStyles.topBar}>
      <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
      <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
      <span style={{ color: 'oklch(0.78 0.012 255)' }}>VERDICT · {data.proposal.id}</span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.74 0.16 152)' }} />
        <span>{data.proposal.network}</span>
        <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
        <span>BLOCK {data.proposal.block.toLocaleString()}</span>
      </span>
    </div>
  );
}

function VerdictHero({ data, state }) {
  const passed = data.tally.passed;
  const passColor = passed ? 'oklch(0.74 0.16 152)' : 'oklch(0.70 0.18 22)';
  const heroBg = passed
    ? 'linear-gradient(180deg, oklch(0.24 0.06 152) 0%, oklch(0.18 0.025 255) 100%)'
    : 'linear-gradient(180deg, oklch(0.24 0.06 22) 0%, oklch(0.18 0.025 255) 100%)';
  return (
    <div style={{ ...verdictStyles.hero, background: heroBg }}>
      <span style={{
        ...verdictStyles.passedBadge,
        background: `color-mix(in oklch, ${passColor} 24%, transparent)`,
        borderColor: passColor,
        color: passColor,
      }}>
        <span style={{ width: 7, height: 7, borderRadius: 4, background: passColor, boxShadow: `0 0 8px ${passColor}` }} />
        {passed ? 'Verdict · Passed' : 'Verdict · Rejected'}
      </span>
      <h1 style={verdictStyles.proposalTitle}>{data.proposal.title}</h1>
      <div style={verdictStyles.proposalMeta}>
        <span>By {data.proposal.submittedBy}</span>
        <span>·</span>
        <span>{data.proposal.submittedAt}</span>
        <span>·</span>
        <span>Debate {data.proposal.debateDuration}</span>
        <span>·</span>
        <span>Confidence {Math.round(data.tally.confidence * 100)}%</span>
      </div>

      <div style={verdictStyles.tallyRow}>
        <div style={verdictStyles.tallyCell}>
          <span style={verdictStyles.tallyLabel}>For</span>
          <span style={{ ...verdictStyles.tallyValue, color: 'oklch(0.74 0.16 152)' }}>
            <CountUp end={data.tally.for} />
          </span>
        </div>
        <div style={verdictStyles.tallyCell}>
          <span style={verdictStyles.tallyLabel}>Against</span>
          <span style={{ ...verdictStyles.tallyValue, color: data.tally.against > 0 ? 'oklch(0.70 0.18 22)' : 'oklch(0.56 0.014 255)' }}>
            <CountUp end={data.tally.against} />
          </span>
        </div>
        <div style={verdictStyles.tallyCell}>
          <span style={verdictStyles.tallyLabel}>Abstain</span>
          <span style={{ ...verdictStyles.tallyValue, color: 'oklch(0.66 0.014 255)' }}>
            <CountUp end={data.tally.abstain} />
          </span>
        </div>
        <div style={verdictStyles.tallyCell}>
          <span style={verdictStyles.tallyLabel}>Quorum / threshold</span>
          <span style={{ ...verdictStyles.tallyValue, fontSize: 14, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>
            {data.tally.for + data.tally.against + data.tally.abstain}/{data.tally.quorum} · 60%
          </span>
        </div>
      </div>
    </div>
  );
}

function AgentVoteRow({ vote, onChallenge }) {
  const c = voteColor(vote.vote);
  return (
    <div style={verdictStyles.agentVote}>
      <div style={{ width: 36, height: 36, borderRadius: 18, background: 'oklch(0.30 0.04 255)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: 'oklch(0.92 0.008 255)' }}>
        {vote.ens.slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div style={verdictStyles.agentName}>{vote.label} <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.56 0.014 255)', fontWeight: 400, marginLeft: 4 }}>· {vote.ens} · conf {(vote.conf * 100).toFixed(0)}%</span></div>
        <div style={verdictStyles.agentRationale}>{vote.key}</div>
      </div>
      <span style={{ ...verdictStyles.voteChip, background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}>
        {vote.vote}
      </span>
      <button style={verdictStyles.challengeBtn} onClick={onChallenge}>↳ Challenge</button>
    </div>
  );
}

function CounterArgRow({ row }) {
  const addressed = row.addressed;
  return (
    <div style={verdictStyles.counterRow}>
      <div style={verdictStyles.counterHead}>
        <span style={{
          ...verdictStyles.counterStatus,
          background: addressed ? 'oklch(0.30 0.10 152)' : 'oklch(0.30 0.10 75)',
          color: addressed ? 'oklch(0.92 0.10 152)' : 'oklch(0.92 0.10 75)',
          border: `1px solid ${addressed ? 'oklch(0.55 0.16 152)' : 'oklch(0.65 0.16 75)'}`,
        }}>
          {addressed ? '✓ Addressed' : '◯ Open'}
        </span>
        <div style={verdictStyles.counterText}>
          {row.text}
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.56 0.014 255)', marginLeft: 6 }}>— {row.from}</span>
        </div>
      </div>
      <div style={verdictStyles.counterResolution}>{row.resolution}</div>
    </div>
  );
}

function SignerRow({ s }) {
  return (
    <div style={verdictStyles.signerRow}>
      <span style={{
        width: 12, height: 12, borderRadius: 6,
        background: s.signed ? 'oklch(0.74 0.16 152)' : 'oklch(0.30 0.030 255)',
        border: s.signed ? '2px solid oklch(0.18 0.025 255)' : '1px solid oklch(0.40 0.030 255)',
        boxShadow: s.signed ? '0 0 6px oklch(0.74 0.16 152)' : 'none',
      }} />
      <span style={{ color: s.signed ? 'oklch(0.92 0.008 255)' : 'oklch(0.66 0.014 255)' }}>
        {s.ens} <span style={{ color: 'oklch(0.50 0.014 255)' }}>· {s.addr}</span>
      </span>
      <span style={{ color: s.signed ? 'oklch(0.74 0.16 152)' : 'oklch(0.56 0.014 255)', fontSize: 10 }}>
        {s.signed ? '✓ ' + s.ago : s.ago}
      </span>
    </div>
  );
}

function TxRow({ tx }) {
  return (
    <div style={verdictStyles.txRow}>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.56 0.014 255)', fontWeight: 600 }}>{String(tx.step).padStart(2, '0')}</span>
      <div>
        <div style={{ fontSize: 12.5, color: 'oklch(0.92 0.008 255)' }}>{tx.label}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.56 0.014 255)', marginTop: 2 }}>{tx.calldata}</div>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.78 0.012 255)' }}>{tx.gas} gas</span>
    </div>
  );
}

function ExecutionPanel({ data, state }) {
  const exec = data.execution;
  const signedCount = exec.signers.filter(s => s.signed).length;
  const required = parseInt(exec.threshold.split(' ')[0], 10);
  return (
    <div style={verdictStyles.execGrid}>
      <div>
        <div style={verdictStyles.sectionLabel}>
          Multisig signatures
          <span style={{
            marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontSize: 10,
            color: signedCount >= required ? 'oklch(0.74 0.16 152)' : 'oklch(0.82 0.14 75)',
            fontWeight: 700,
          }}>
            {signedCount} / {required} required
          </span>
        </div>
        <div style={{
          background: 'oklch(0.18 0.025 255)', border: '1px solid oklch(0.30 0.030 255)',
          borderRadius: 6, overflow: 'hidden',
        }}>
          {exec.signers.map((s, i) => (
            <div key={i} style={{ borderTop: i ? '1px solid oklch(0.28 0.028 255)' : 'none' }}>
              <SignerRow s={s} />
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={verdictStyles.sectionLabel}>Transactions to execute</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {exec.txs.map(tx => <TxRow key={tx.step} tx={tx} />)}
        </div>
        <div style={{
          marginTop: 12, padding: '10px 12px', borderRadius: 6,
          background: 'color-mix(in oklch, oklch(0.74 0.16 152) 8%, transparent)',
          border: '1px solid color-mix(in oklch, oklch(0.74 0.16 152) 30%, transparent)',
          fontSize: 11.5, color: 'oklch(0.86 0.012 255)', lineHeight: 1.5,
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: 'oklch(0.74 0.16 152)', textTransform: 'uppercase' }}>Expected yield</span>
          <div style={{ display: 'flex', gap: 14, marginTop: 4, fontFamily: 'var(--font-mono)' }}>
            <span><strong style={{ color: 'oklch(0.92 0.008 255)', fontSize: 13 }}>{exec.expectedYield.apy}%</strong> APY</span>
            <span style={{ color: 'oklch(0.66 0.014 255)' }}>·</span>
            <span><strong style={{ color: 'oklch(0.92 0.008 255)', fontSize: 13 }}>+${exec.expectedYield.monthly.toFixed(2)}</strong>/mo</span>
            <span style={{ color: 'oklch(0.66 0.014 255)' }}>·</span>
            <span>+${exec.expectedYield.annual.toFixed(0)}/yr</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function VerdictFooter({ data, state, trustVote, setTrustVote }) {
  return (
    <div style={verdictStyles.footer}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.74 0.16 152)' }} />
        ARCHIVED · 0G STORAGE
      </span>
      <code style={{ fontSize: 10, color: 'oklch(0.78 0.012 255)' }}>{data.proposal.archive.cid}</code>
      <div style={{ flex: 1 }} />
      {/* Trust verdict */}
      <div style={{ display: 'flex', gap: 4, padding: 3, background: 'oklch(0.22 0.028 255)', borderRadius: 4, border: '1px solid oklch(0.30 0.030 255)' }}>
        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'oklch(0.56 0.014 255)', textTransform: 'uppercase', alignSelf: 'center', padding: '0 8px' }}>
          Trust this verdict
        </span>
        <button onClick={() => setTrustVote(v => v === 'trust' ? null : 'trust')} style={{
          padding: '5px 10px', borderRadius: 3,
          background: trustVote === 'trust' ? 'color-mix(in oklch, oklch(0.74 0.16 152) 24%, transparent)' : 'transparent',
          border: trustVote === 'trust' ? '1px solid oklch(0.74 0.16 152)' : '1px solid transparent',
          color: trustVote === 'trust' ? 'oklch(0.74 0.16 152)' : 'oklch(0.78 0.012 255)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
        }}>↑ Trust</button>
        <button onClick={() => setTrustVote(v => v === 'distrust' ? null : 'distrust')} style={{
          padding: '5px 10px', borderRadius: 3,
          background: trustVote === 'distrust' ? 'color-mix(in oklch, oklch(0.70 0.18 22) 24%, transparent)' : 'transparent',
          border: trustVote === 'distrust' ? '1px solid oklch(0.70 0.18 22)' : '1px solid transparent',
          color: trustVote === 'distrust' ? 'oklch(0.70 0.18 22)' : 'oklch(0.78 0.012 255)',
          fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
          letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
        }}>↓ Distrust</button>
      </div>
      <button style={verdictStyles.footerBtn}>↗ Share link</button>
      <button style={verdictStyles.footerBtn}>↓ Export tx</button>
      {state === 'pending' && (
        <button style={{ ...verdictStyles.footerBtn, ...verdictStyles.footerBtnPrimary }}>✓ Sign multisig</button>
      )}
      {state === 'reveal' && (
        <button style={{ ...verdictStyles.footerBtn, ...verdictStyles.footerBtnPrimary }}>→ Queue execution</button>
      )}
      {state === 'executed' && (
        <button style={verdictStyles.footerBtn}>↗ View on Basescan</button>
      )}
    </div>
  );
}

function VariantVerdict({ overrides = {} }) {
  const data = VERDICT_DATA;
  const state = overrides.state || 'pending';
  const [trustVote, setTrustVote] = React.useState(null);
  const [followupOpen, setFollowupOpen] = React.useState(false);
  return (
    <div style={verdictStyles.card}>
      <VerdictTopBar data={data} />
      <div style={verdictStyles.scroll}>
        <VerdictHero data={data} state={state} />

        <div style={verdictStyles.section}>
          <div style={verdictStyles.sectionLabel}>Per-agent votes</div>
          {data.agentVotes.map((v) => (
            <AgentVoteRow key={v.ens} vote={v} onChallenge={() => {
              if (window.openReasoningChat) window.openReasoningChat(v.ens, v.key, 'en');
            }} />
          ))}
        </div>

        <div style={verdictStyles.section}>
          <div style={verdictStyles.sectionLabel}>
            Counter-arguments raised
            <span style={{ marginLeft: 'auto', fontWeight: 400, color: 'oklch(0.66 0.014 255)' }}>
              {data.counterArguments.filter(c => c.addressed).length}/{data.counterArguments.length} addressed
            </span>
          </div>
          {data.counterArguments.map(row => <CounterArgRow key={row.id} row={row} />)}
        </div>

        <div style={verdictStyles.section}>
          <ExecutionPanel data={data} state={state} />
        </div>

        <div style={verdictStyles.section}>
          <div style={verdictStyles.sectionLabel}>Next actions</div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button style={verdictStyles.footerBtn} onClick={() => setFollowupOpen(true)}>+ Ask follow-up question</button>
            <button style={verdictStyles.footerBtn}>↻ Run another round</button>
            <button style={verdictStyles.footerBtn}>⚙ Custom quorum</button>
            <button style={verdictStyles.footerBtn}>✕ Cancel verdict</button>
          </div>
          {followupOpen && (
            <div style={{
              marginTop: 12, padding: 12, borderRadius: 6,
              background: 'oklch(0.22 0.028 255)', border: '1px solid oklch(0.30 0.030 255)',
              display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <input
                placeholder="Ask the council a follow-up — they reconvene with full context…"
                style={{
                  flex: 1, padding: '8px 12px', borderRadius: 4,
                  background: 'oklch(0.18 0.025 255)', border: '1px solid oklch(0.30 0.030 255)',
                  color: 'oklch(0.96 0.006 255)', fontFamily: 'var(--font-sans)', fontSize: 12,
                  outline: 'none',
                }}
              />
              <button style={{ ...verdictStyles.footerBtn, ...verdictStyles.footerBtnPrimary }}>Reconvene</button>
              <button style={verdictStyles.footerBtn} onClick={() => setFollowupOpen(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
      <VerdictFooter data={data} state={state} trustVote={trustVote} setTrustVote={setTrustVote} />
    </div>
  );
}

window.VariantVerdict = VariantVerdict;
