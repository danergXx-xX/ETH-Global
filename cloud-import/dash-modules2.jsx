// Component 4: Dashboard modules — feature modules.
// Live Council strip, Active positions, Recent verdicts, Activity feed,
// Agents online, Quick propose, Stats, Empty state.

// ----- Live Council strip ----------------------------------------------------
// Three states: 'idle' (no proposal), 'active' (debate in progress, mini-summary),
// 'post-verdict' (just executed, archived).

function LiveCouncilStrip({ theme, t, state = 'idle', elapsed = 0, eta = 18, lastVerdict, onConvene, onExpand }) {
  if (state === 'idle') {
    return (
      <DashCard theme={theme} title={t.liveCouncil} hint={t.councilIdle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
          <div style={{ display: 'flex', gap: -6 }}>
            {AGENTS.map((a, i) => (
              <div key={a.id} title={a.label.en} style={{
                width: 28, height: 28, borderRadius: '50%',
                marginLeft: i === 0 ? 0 : -8,
                background: a.color.headerBg,
                color: a.color.headerText,
                border: `2px solid ${theme.bgPanel}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10.5, fontWeight: 600, fontFamily: 'var(--font-mono)',
                position: 'relative', zIndex: AGENTS.length - i,
              }}>{a.label.en[0]}</div>
            ))}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12.5, color: theme.text, fontWeight: 500 }}>5 / 5 {t.online}</div>
            <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 2 }}>{t.awaitingProposal}</div>
          </div>
          <button
            onClick={onConvene}
            style={{
              all: 'unset', cursor: 'pointer',
              padding: '7px 14px', borderRadius: 6,
              background: theme.text, color: theme.inverseText,
              fontSize: 12, fontWeight: 600,
            }}>{t.conveneNow}</button>
        </div>
      </DashCard>
    );
  }

  if (state === 'post-verdict') {
    const v = lastVerdict;
    return (
      <DashCard theme={theme} title={t.liveCouncil}
        hint={<span style={{ color: 'oklch(0.82 0.14 75)' }}>● {t.txExecuting}</span>}
        action={
          <button onClick={onExpand} style={{
            all: 'unset', cursor: 'pointer',
            fontSize: 11, color: theme.textDim, fontFamily: 'var(--font-mono)',
            padding: '3px 8px', borderRadius: 4, border: `1px solid ${theme.borderSoft}`,
          }}>{t.expandDebate} →</button>
        }>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 8,
            background: 'oklch(0.30 0.07 152)',
            color: 'oklch(0.84 0.16 152)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 700,
          }}>✓</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, color: theme.text, fontWeight: 600 }}>{v.title.en} · {t.statusApproved}</div>
            <div style={{ fontSize: 11, color: theme.textFaint, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
              {v.tally.for}-{v.tally.against}-{v.tally.abstain} · CID {v.cidShort} · ~12s ago
            </div>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '4px 10px', borderRadius: 6,
            background: 'oklch(0.30 0.07 152 / 0.4)',
            border: `1px solid oklch(0.50 0.10 152)`,
            fontSize: 10.5, fontFamily: 'var(--font-mono)',
            color: 'oklch(0.84 0.16 152)',
          }}>
            <StatusDot color={'oklch(0.74 0.16 152)'} pulse size={6} />
            <span>{t.txExecuting}</span>
          </div>
        </div>
      </DashCard>
    );
  }

  // active
  const remaining = Math.max(0, eta - elapsed);
  return (
    <DashCard theme={theme} title={t.liveCouncil}
      hint={<span style={{ color: theme.amber }}>● {t.debating}</span>}
      action={
        <button onClick={onExpand} style={{
          all: 'unset', cursor: 'pointer',
          fontSize: 11, color: theme.textDim, fontFamily: 'var(--font-mono)',
          padding: '3px 8px', borderRadius: 4, border: `1px solid ${theme.borderSoft}`,
        }}>{t.expandDebate} →</button>
      }>
      <div>
        <div style={{ fontSize: 13.5, color: theme.text, fontWeight: 500, marginBottom: 10, letterSpacing: '-0.005em' }}>
          PROP-042 · 100k USDC → Aave v3 USDC supply
        </div>

        {/* 5 agent slim rows */}
        <div style={{ display: 'flex', gap: 8 }}>
          {AGENTS.map((a, i) => {
            // mock per-agent state for active mode
            const status = i < 2 ? 'done' : i < 4 ? 'typing' : 'waiting';
            const decision = a.decision;
            return (
              <div key={a.id} style={{
                flex: 1, minWidth: 0,
                background: theme.bgRow, borderRadius: 6,
                border: `1px solid ${theme.borderSoft}`,
                padding: '8px 9px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{
                    width: 18, height: 18, borderRadius: '50%',
                    background: a.color.headerBg, color: a.color.headerText,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 9, fontWeight: 600, fontFamily: 'var(--font-mono)',
                  }}>{a.label.en[0]}</span>
                  <span style={{ fontSize: 11, color: theme.text, fontWeight: 500, flex: 1 }}>{a.label.en}</span>
                </div>
                <div style={{ fontSize: 10, color: theme.textFaint, fontFamily: 'var(--font-mono)', height: 14 }}>
                  {status === 'done' && (
                    <span style={{ color: decision === 'FOR' ? 'oklch(0.74 0.16 152)' : decision === 'AGAINST' ? 'oklch(0.70 0.18 22)' : theme.textDim }}>
                      {decision === 'FOR' ? '✓ For' : decision === 'AGAINST' ? '✗ Against' : '— Abstain'}
                    </span>
                  )}
                  {status === 'typing' && (
                    <span style={{ color: theme.amber }}>
                      <span style={{
                        display: 'inline-block', width: 4, height: 8, background: theme.amber, verticalAlign: 'middle', marginRight: 4,
                        animation: 'a-blink 1s steps(2, end) infinite',
                      }} />
                      thinking…
                    </span>
                  )}
                  {status === 'waiting' && <span>queued</span>}
                </div>
              </div>
            );
          })}
        </div>

        {/* progress + ETA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 12 }}>
          <div style={{ flex: 1, height: 4, background: theme.bgRow, borderRadius: 2, overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: Math.min(100, (elapsed / eta) * 100) + '%',
              background: theme.amber, transition: 'width 200ms linear',
            }} />
          </div>
          <div style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>
            {elapsed.toFixed(1)}s · {t.eta} {remaining.toFixed(1)}s {t.remaining}
          </div>
        </div>
      </div>
    </DashCard>
  );
}

// ----- Active positions ------------------------------------------------------

function ActivePositions({ theme, t, allocation }) {
  const positions = allocation.filter(p => p.kind !== 'idle');
  return (
    <DashCard theme={theme} title={t.activePositions} hint={positions.length + ''}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {positions.map(p => (
          <div key={p.id}
            title={`${p.label} · ${p.contractShort || '—'}\n${t.sinceDays} ${p.sinceDays || '—'}${p.sinceDays ? t.daysShort : ''}`}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '8px 10px',
              background: theme.bgRow, borderRadius: 6,
              border: `1px solid ${theme.borderSoft}`,
              cursor: 'pointer',
              transition: 'border-color 120ms',
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = theme.border}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = theme.borderSoft}
          >
            <div style={{
              width: 26, height: 26, borderRadius: 6,
              background: p.color, opacity: 0.85,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 600, color: 'oklch(0.18 0.012 255)',
              fontFamily: 'var(--font-mono)',
            }}>
              {p.label[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6 }}>
                <span style={{ fontSize: 12, color: theme.text, fontWeight: 500 }}>{p.label}</span>
                <span style={{ fontSize: 12, color: theme.text, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>
                  {fmtUsd(p.usd, { compact: true })}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 6, marginTop: 2 }}>
                <span style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>
                  {p.kind === 'deposit' ? t.deposit : t.spot} · {p.asset}
                  {p.sinceDays ? ` · ${t.sinceDays} ${p.sinceDays}${t.daysShort}` : ''}
                </span>
                {p.apy > 0 && (
                  <span style={{ fontSize: 10.5, color: 'oklch(0.74 0.16 152)', fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                    {p.apy.toFixed(1)}% {t.apy}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

// ----- Recent verdicts -------------------------------------------------------

function VerdictRow({ theme, t, v, locale }) {
  const colors = {
    approved: { bg: 'oklch(0.30 0.07 152)', text: 'oklch(0.84 0.16 152)', sym: '✓' },
    rejected: { bg: 'oklch(0.28 0.10 22)',  text: 'oklch(0.78 0.18 22)',  sym: '✗' },
    split:    { bg: 'oklch(0.32 0.05 75)',  text: 'oklch(0.85 0.14 75)',  sym: '◐' },
    pending:  { bg: 'oklch(0.30 0.05 245)', text: 'oklch(0.78 0.14 245)', sym: '◷' },
    executing:{ bg: 'oklch(0.30 0.05 245)', text: 'oklch(0.78 0.14 245)', sym: '↑' },
  }[v.status];
  const labelKey = { approved: 'statusApproved', rejected: 'statusRejected', split: 'statusSplit', pending: 'statusPending', executing: 'statusExecuting' }[v.status];

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '9px 10px',
      background: theme.bgRow, borderRadius: 6,
      border: `1px solid ${theme.borderSoft}`,
    }}>
      <div style={{
        width: 24, height: 24, borderRadius: 5,
        background: colors.bg, color: colors.text,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 13, fontWeight: 600,
      }}>{colors.sym}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)', flexShrink: 0, whiteSpace: 'nowrap' }}>{v.id}</span>
          <span style={{ fontSize: 12, color: theme.text, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {v.title[locale]}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 10, color: theme.textFaint, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>
          <span style={{ color: colors.text, letterSpacing: 0.3 }}>
            {t[labelKey]}{v.status !== 'pending' ? ` ${v.tally.for}-${v.tally.against}-${v.tally.abstain}` : ''}
          </span>
          <span>·</span>
          <span>{v.when[locale]}</span>
          {v.archived && (
            <>
              <span>·</span>
              <span title={`${t.archivedTo} · ${v.cidShort}`} style={{ color: 'oklch(0.74 0.14 305)' }}>0G</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function RecentVerdicts({ theme, t, locale, verdicts }) {
  const [filter, setFilter] = React.useState('all');
  const filters = [
    { id: 'all',      label: t.filterAll },
    { id: 'approved', label: t.filterApproved },
    { id: 'rejected', label: t.filterRejected },
    { id: 'pending',  label: t.filterPending },
  ];
  const filtered = verdicts.filter(v => filter === 'all' ? true : v.status === filter);

  return (
    <DashCard theme={theme} title={t.recentVerdicts} hint={verdicts.length + ''}
      action={
        <div style={{ display: 'flex', gap: 2, padding: 2, background: theme.bgRow, borderRadius: 5, border: `1px solid ${theme.borderSoft}` }}>
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)} style={{
              all: 'unset', cursor: 'pointer',
              padding: '3px 8px', borderRadius: 3,
              background: filter === f.id ? theme.bgPanel : 'transparent',
              color: filter === f.id ? theme.text : theme.textFaint,
              fontSize: 10.5, fontFamily: 'var(--font-mono)',
            }}>{f.label}</button>
          ))}
        </div>
      }>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1 }}>
        {filtered.map(v => <VerdictRow key={v.id} theme={theme} t={t} v={v} locale={locale} />)}
      </div>
    </DashCard>
  );
}

// ----- Agents online --------------------------------------------------------

function AgentsOnline({ theme, t }) {
  return (
    <DashCard theme={theme} title={t.agentsOnline} hint={`5 / 5 ${t.online}`}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {AGENTS.map(a => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '7px 8px',
            background: theme.bgRow, borderRadius: 5,
          }}>
            <span style={{
              width: 22, height: 22, borderRadius: '50%',
              background: a.color.headerBg, color: a.color.headerText,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)',
              position: 'relative',
            }}>
              {a.label.en[0]}
              <span style={{
                position: 'absolute', bottom: -1, right: -1,
                width: 7, height: 7, borderRadius: '50%',
                background: 'oklch(0.74 0.16 152)',
                border: `1.5px solid ${theme.bgPanel}`,
              }} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 11.5, color: theme.text, fontWeight: 500 }}>{a.label.en}</div>
              <div style={{ fontSize: 10, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>
                {a.statements} {t.statementsShort} · {a.rep} rep
              </div>
            </div>
            <div style={{ fontSize: 10, color: theme.textDim, fontFamily: 'var(--font-mono)' }}>
              ●
            </div>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

// ----- Activity feed (Bloomberg/terminal style) -----------------------------

function ActivityFeed({ theme, t, activity, locale }) {
  const typeColors = {
    proposal: 'oklch(0.78 0.14 245)',
    vote:     theme.amber,
    exec:     'oklch(0.74 0.16 152)',
    archive:  'oklch(0.74 0.14 305)',
    rule:     'oklch(0.78 0.18 22)',
    agent:    'oklch(0.66 0.014 255)',
  };
  const typeLabels = { proposal: 'PROP', vote: 'VOTE', exec: 'EXEC', archive: 'ARCH', rule: 'RULE', agent: 'AGNT' };

  return (
    <DashCard theme={theme} title={t.activityFeed} hint="live"
      action={<StatusDot color={'oklch(0.74 0.16 152)'} pulse size={6} />}
      padding={0}>
      <div style={{
        flex: 1, overflowY: 'auto',
        fontFamily: 'var(--font-mono)',
        fontSize: 10.5, lineHeight: 1.6,
      }}>
        {activity.map((e, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: 'auto auto 1fr',
            columnGap: 10,
            padding: '6px 14px',
            borderBottom: i === activity.length - 1 ? 'none' : `1px solid ${theme.borderSoft}`,
            alignItems: 'baseline',
          }}>
            <span style={{ color: theme.textFaint, fontVariantNumeric: 'tabular-nums', minWidth: 38 }}>{e.ts}</span>
            <span style={{ color: typeColors[e.type], fontWeight: 600, letterSpacing: 0.5, minWidth: 38 }}>{typeLabels[e.type]}</span>
            <span style={{ color: theme.textDim, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              <span style={{ color: theme.text }}>{e.actor.split('.')[0]}</span>{' '}
              <span>{e[locale]}</span>
              {' '}<span style={{ color: theme.textFaint }}>{e.detail[locale]}</span>
            </span>
          </div>
        ))}
      </div>
    </DashCard>
  );
}

// ----- Quick propose ---------------------------------------------------------

function QuickPropose({ theme, t, onSubmit }) {
  const [text, setText] = React.useState('');
  return (
    <DashCard theme={theme} title={t.quickPropose}>
      <div style={{ fontSize: 10.5, color: theme.textFaint, marginBottom: 8 }}>{t.quickProposeHint}</div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder={'allocate 50k USDC to Aave v3'}
        style={{
          background: theme.bgRow, border: `1px solid ${theme.borderSoft}`,
          borderRadius: 5, padding: '8px 10px',
          color: theme.text, fontSize: 12, fontFamily: 'inherit',
          resize: 'none', height: 64, outline: 'none', marginBottom: 8,
        }}
      />
      <button
        onClick={() => onSubmit && onSubmit(text)}
        disabled={text.trim().length < 4}
        style={{
          all: 'unset', cursor: text.trim().length < 4 ? 'default' : 'pointer',
          padding: '8px 12px', borderRadius: 5,
          background: text.trim().length < 4 ? theme.bgRow : theme.text,
          color: text.trim().length < 4 ? theme.textFaint : theme.inverseText,
          fontSize: 12, fontWeight: 600,
          textAlign: 'center',
        }}>{t.proposeButton} →</button>
    </DashCard>
  );
}

// ----- Stats strip -----------------------------------------------------------

function StatsStrip({ theme, t }) {
  return (
    <div style={{ display: 'flex', gap: 18, padding: '0 14px' }}>
      <div>
        <div style={{ fontSize: 9.5, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: 0.7 }}>{t.proposalsTotal}</div>
        <div style={{ fontSize: 14, color: theme.text, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{DASH_STATS.proposalsTotal}</div>
      </div>
      <div>
        <div style={{ fontSize: 9.5, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: 0.7 }}>{t.approvalRate}</div>
        <div style={{ fontSize: 14, color: theme.text, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{Math.round(DASH_STATS.approvalRate * 100)}%</div>
      </div>
      <div>
        <div style={{ fontSize: 9.5, color: theme.textFaint, textTransform: 'uppercase', letterSpacing: 0.7 }}>{t.avgDebate}</div>
        <div style={{ fontSize: 14, color: theme.text, fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums', marginTop: 1 }}>{DASH_STATS.avgDebateSeconds.toFixed(1)}{t.seconds}</div>
      </div>
    </div>
  );
}

// ----- Empty state -----------------------------------------------------------

function DashEmptyState({ theme, t }) {
  return (
    <div style={{
      flex: 1,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 18, padding: 40,
    }}>
      <div style={{
        width: 80, height: 80, borderRadius: 16,
        background: theme.bgPanel, border: `1px solid ${theme.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 32, color: theme.textDim,
        fontFamily: 'var(--font-serif)',
      }}>◫</div>
      <div style={{ textAlign: 'center', maxWidth: 380 }}>
        <div style={{ fontSize: 18, color: theme.text, fontWeight: 600, fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', marginBottom: 6 }}>{t.emptyTitle}</div>
        <div style={{ fontSize: 12.5, color: theme.textFaint, lineHeight: 1.5 }}>{t.emptyHint}</div>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button style={{
          all: 'unset', cursor: 'pointer',
          padding: '9px 16px', borderRadius: 6,
          background: theme.text, color: theme.inverseText,
          fontSize: 12.5, fontWeight: 600,
        }}>{t.fundTreasury}</button>
        <button style={{
          all: 'unset', cursor: 'pointer',
          padding: '9px 16px', borderRadius: 6,
          background: 'transparent', color: theme.text,
          border: `1px solid ${theme.border}`,
          fontSize: 12.5, fontWeight: 500,
        }}>{t.importMultisig}</button>
      </div>
    </div>
  );
}

Object.assign(window, {
  LiveCouncilStrip, ActivePositions, RecentVerdicts, AgentsOnline, ActivityFeed,
  QuickPropose, StatsStrip, DashEmptyState, VerdictRow,
});
