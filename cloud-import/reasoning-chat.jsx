// Reasoning Chat — drawer with full chain of thought + chat with agent.
// Mounted as a portal-style overlay; opened via window.openReasoningChat(agent, claim).

const reasoningStyles = {
  scrim: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
    zIndex: 200, opacity: 0, transition: 'opacity 220ms',
    pointerEvents: 'none',
  },
  scrimOpen: { opacity: 1, pointerEvents: 'auto' },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 'min(560px, 92vw)',
    background: 'var(--bg-elev)',
    borderLeft: '1px solid var(--border-strong)',
    boxShadow: '-24px 0 64px rgba(0,0,0,0.45)',
    zIndex: 201, display: 'flex', flexDirection: 'column',
    transform: 'translateX(100%)', transition: 'transform 280ms cubic-bezier(.2,.8,.2,1)',
  },
  panelOpen: { transform: 'translateX(0)' },
  header: {
    padding: '20px 24px 16px',
    borderBottom: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: 12,
  },
  headerTop: { display: 'flex', alignItems: 'flex-start', gap: 14 },
  headerTitle: { flex: 1, display: 'flex', flexDirection: 'column', gap: 4 },
  eyebrow: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
    color: 'var(--text-tertiary)', textTransform: 'uppercase',
  },
  agentName: {
    fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600,
    color: 'var(--text)', letterSpacing: '-0.01em', lineHeight: 1.1,
  },
  agentMeta: {
    fontFamily: 'var(--font-mono)', fontSize: 11,
    color: 'var(--text-secondary)', letterSpacing: '0.04em',
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)',
    background: 'var(--bg)', color: 'var(--text-secondary)',
    cursor: 'pointer', display: 'grid', placeItems: 'center', flexShrink: 0,
    fontFamily: 'var(--font-mono)', fontSize: 13,
  },
  voteChip: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
    fontFamily: 'var(--font-mono)', letterSpacing: '0.04em',
    textTransform: 'uppercase',
  },
  claim: {
    padding: '10px 12px', background: 'var(--bg)', borderRadius: 8,
    border: '1px solid var(--border)', borderLeft: '3px solid var(--accent)',
    fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.45,
    fontStyle: 'italic',
  },
  body: { flex: 1, overflowY: 'auto', padding: '20px 24px 8px' },
  sectionLabel: {
    fontSize: 10, fontWeight: 600, letterSpacing: '0.16em',
    color: 'var(--text-tertiary)', textTransform: 'uppercase',
    marginBottom: 10,
  },
  chainList: { display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 },
  chainStep: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '10px 12px', background: 'var(--bg)', borderRadius: 8,
    border: '1px solid var(--border)',
  },
  stepKind: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '2px 6px', borderRadius: 4, flexShrink: 0,
    minWidth: 64, textAlign: 'center',
  },
  stepText: { flex: 1, fontSize: 13, color: 'var(--text)', lineHeight: 1.5 },
  stepSources: { display: 'inline-flex', gap: 4, marginLeft: 6 },
  sourceRef: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    minWidth: 18, height: 18, padding: '0 5px', borderRadius: 4,
    background: 'var(--accent-subtle)', color: 'var(--accent)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    cursor: 'pointer', border: '1px solid transparent',
  },
  suggested: { display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 },
  suggestedBtn: {
    textAlign: 'left', padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg)',
    color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13,
    cursor: 'pointer', lineHeight: 1.4,
    display: 'flex', alignItems: 'center', gap: 10,
  },
  suggestedArrow: { color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', fontSize: 11 },
  thread: { display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 },
  msgUser: {
    alignSelf: 'flex-end', maxWidth: '85%',
    padding: '10px 14px', borderRadius: '12px 12px 2px 12px',
    background: 'var(--accent)', color: 'var(--bg-elev)',
    fontSize: 13, lineHeight: 1.5, fontWeight: 500,
  },
  msgAgent: {
    alignSelf: 'flex-start', maxWidth: '92%',
    padding: '12px 14px', borderRadius: '12px 12px 12px 2px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    fontSize: 13, lineHeight: 1.55, color: 'var(--text)',
  },
  msgLabel: {
    fontSize: 9, fontWeight: 600, letterSpacing: '0.12em',
    textTransform: 'uppercase', marginBottom: 4, opacity: 0.7,
  },
  typing: {
    alignSelf: 'flex-start',
    padding: '12px 14px', borderRadius: '12px 12px 12px 2px',
    background: 'var(--bg)', border: '1px solid var(--border)',
    display: 'inline-flex', alignItems: 'center', gap: 8,
    fontSize: 12, color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
  },
  footer: {
    padding: '14px 24px 18px',
    borderTop: '1px solid var(--border)',
    display: 'flex', flexDirection: 'column', gap: 10,
    background: 'var(--bg)',
  },
  inputRow: {
    display: 'flex', gap: 8, alignItems: 'flex-end',
  },
  textarea: {
    flex: 1, resize: 'none', minHeight: 40, maxHeight: 120,
    padding: '10px 12px', borderRadius: 8,
    border: '1px solid var(--border)', background: 'var(--bg-elev)',
    color: 'var(--text)', fontFamily: 'var(--font-sans)', fontSize: 13,
    lineHeight: 1.4, outline: 'none',
  },
  sendBtn: {
    height: 40, padding: '0 16px', borderRadius: 8,
    background: 'var(--accent)', color: 'var(--bg-elev)',
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    border: 'none', cursor: 'pointer',
  },
  actionRow: { display: 'flex', gap: 8 },
  actionBtn: {
    flex: 1, padding: '8px 12px', borderRadius: 6,
    border: '1px solid var(--border)', background: 'transparent',
    color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
    fontSize: 10, fontWeight: 600, letterSpacing: '0.08em',
    textTransform: 'uppercase', cursor: 'pointer',
  },
  actionBtnPrimary: {
    color: 'var(--vote-for)', borderColor: 'var(--vote-for)',
  },
};

function StepKindBadge({ kind, t }) {
  const colors = {
    premise:    { bg: 'rgba(120,140,170,0.12)', fg: '#8a96ad' },
    check:      { bg: 'rgba(46,160,67,0.14)',   fg: 'var(--vote-for)' },
    risk:       { bg: 'rgba(218,143,46,0.16)',  fg: 'var(--accent)' },
    concern:    { bg: 'rgba(218,143,46,0.16)',  fg: 'var(--accent)' },
    opportunity:{ bg: 'rgba(46,160,67,0.14)',   fg: 'var(--vote-for)' },
    verdict:    { bg: 'rgba(167,139,250,0.16)', fg: '#a78bfa' },
  };
  const c = colors[kind] || colors.check;
  return (
    <span style={{ ...reasoningStyles.stepKind, background: c.bg, color: c.fg }}>
      {t.kindLabels[kind] || kind}
    </span>
  );
}

function ChainStep({ step, t, onSourceClick }) {
  return (
    <div style={reasoningStyles.chainStep}>
      <StepKindBadge kind={step.kind} t={t} />
      <div style={reasoningStyles.stepText}>
        {step.text}
        {step.sources.length > 0 && (
          <span style={reasoningStyles.stepSources}>
            {step.sources.map(n => (
              <span key={n} style={reasoningStyles.sourceRef} onClick={() => onSourceClick(n)}>
                {n}
              </span>
            ))}
          </span>
        )}
      </div>
    </div>
  );
}

function TypingBubble({ t }) {
  return (
    <div style={reasoningStyles.typing}>
      <AnimatedDots />
      <span>{t.typing}…</span>
    </div>
  );
}

// — Reputation strip components ————————————————————————————————

function Sparkline({ data, color, width = 100, height = 22 }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / (data.length - 1);
  const points = data.map((v, i) => `${i * step},${height - ((v - min) / range) * height}`).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline fill="none" stroke={color} strokeWidth="1.5" points={points} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) * step} cy={height - ((data[data.length - 1] - min) / range) * height} r="2.5" fill={color} />
    </svg>
  );
}

function ReputationStrip({ ensId }) {
  const rep = AGENT_REPUTATION[ensId];
  if (!rep) return null;
  const trustColor = rep.trustScore >= 85 ? 'var(--vote-for)'
    : rep.trustScore >= 70 ? 'var(--accent)'
    : 'var(--vote-against)';
  const trendStr = rep.trustTrend > 0 ? `+${rep.trustTrend}` : `${rep.trustTrend}`;
  const trendColor = rep.trustTrend > 0 ? 'var(--vote-for)' : rep.trustTrend < 0 ? 'var(--vote-against)' : 'var(--text-tertiary)';
  const streakColor = rep.streak.startsWith('+') ? 'var(--vote-for)' : 'var(--vote-against)';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto',
      gap: 16, padding: '12px 14px', background: 'var(--bg)',
      border: '1px solid var(--border)', borderRadius: 8,
      alignItems: 'center',
    }}>
      <div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Trust</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: trustColor, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{rep.trustScore}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: trendColor, fontWeight: 600 }}>{trendStr}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)' }}>30d</span>
        </div>
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Accuracy</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text)', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
          {Math.round(rep.accuracy * 100)}<span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>%</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>{rep.totalVotes} votes</div>
      </div>
      <div>
        <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>Streak</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: streakColor, lineHeight: 1 }}>{rep.streak}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)' }}>calls</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>vol {rep.volatility.toFixed(2)}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <Sparkline data={rep.sparkline} color={trustColor} />
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
          padding: '2px 6px', borderRadius: 3, letterSpacing: '0.06em',
          background: 'color-mix(in oklch, var(--vote-for) 14%, transparent)',
          color: 'var(--vote-for)',
          border: '1px solid color-mix(in oklch, var(--vote-for) 35%, transparent)',
        }}>{rep.badge}</span>
      </div>
    </div>
  );
}

function VoteHistoryRow({ row }) {
  const voteColor = row.vote === 'FOR' ? 'var(--vote-for)' : row.vote === 'AGAINST' ? 'var(--vote-against)' : 'var(--text-tertiary)';
  const outcomeColor = row.outcome === 'won' ? 'var(--vote-for)' : row.outcome === 'lost' ? 'var(--vote-against)' : 'var(--text-tertiary)';
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '60px 1fr 70px 100px',
      gap: 10, padding: '10px 12px', borderBottom: '1px solid var(--border)',
      alignItems: 'center', fontSize: 11.5,
    }}>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', fontSize: 10 }}>{row.id}</span>
      <div>
        <div style={{ color: 'var(--text)', lineHeight: 1.3 }}>{row.title}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>
          conf {(row.conf * 100).toFixed(0)}% · {row.ago} ago
        </div>
      </div>
      <span style={{
        fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
        color: voteColor, letterSpacing: '0.04em',
      }}>{row.vote}</span>
      <div style={{ textAlign: 'right' }}>
        <span style={{
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
          textTransform: 'uppercase', letterSpacing: '0.06em',
          color: outcomeColor,
        }}>{row.outcome}</span>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text)', marginTop: 1, fontVariantNumeric: 'tabular-nums' }}>{row.pnl}</div>
      </div>
    </div>
  );
}

function HistoryView({ ensId }) {
  const rep = AGENT_REPUTATION[ensId];
  if (!rep) return null;
  return (
    <div>
      <div style={reasoningStyles.sectionLabel}>Recent votes · last 7 of {rep.totalVotes}</div>
      <div style={{
        background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)',
        overflow: 'hidden', marginBottom: 14,
      }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '60px 1fr 70px 100px',
          gap: 10, padding: '8px 12px', background: 'var(--bg-elev)',
          borderBottom: '1px solid var(--border)',
          fontSize: 9, fontWeight: 600, color: 'var(--text-tertiary)',
          letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          <span>Prop</span><span>Subject</span><span>Vote</span><span style={{ textAlign: 'right' }}>Outcome / pnl</span>
        </div>
        {rep.history.map((row, i) => <VoteHistoryRow key={i} row={row} />)}
      </div>
      <div style={{
        padding: '10px 12px', background: 'var(--bg)', borderRadius: 8,
        border: '1px solid var(--border)', fontSize: 11, color: 'var(--text-secondary)',
        lineHeight: 1.5,
      }}>
        <strong style={{ color: 'var(--text)' }}>About this score.</strong> Trust score (0-100) is a weighted blend of: prediction accuracy on closed proposals, community trust votes from this drawer, recency, and confidence-calibration (overconfident misses cost more than humble misses). Updated after every settled proposal. Full methodology on 0G storage: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--accent)' }}>bafy…rep-v3</code>.
      </div>
    </div>
  );
}

function ReasoningChat() {
  const [state, setState] = React.useState({ open: false, ensId: null, claim: null, lang: 'en' });
  const [thread, setThread] = React.useState([]); // { role: 'user'|'agent', text, feedback?: 'up'|'down' }
  const [draft, setDraft] = React.useState('');
  const [thinking, setThinking] = React.useState(false);
  const [view, setView] = React.useState('reasoning'); // 'reasoning' | 'history'
  const [trustVote, setTrustVote] = React.useState(null); // 'trust' | 'distrust' | null
  const bodyRef = React.useRef(null);

  // Public open API
  React.useEffect(() => {
    window.openReasoningChat = (ensId, claim, lang) => {
      setState({ open: true, ensId, claim: claim || null, lang: lang || 'en' });
      setThread([]);
      setDraft('');
      setThinking(false);
      setView('reasoning');
      setTrustVote(null);
    };
    window.closeReasoningChat = () => setState(s => ({ ...s, open: false }));
    return () => { delete window.openReasoningChat; delete window.closeReasoningChat; };
  }, []);

  // Esc to close
  React.useEffect(() => {
    if (!state.open) return;
    const onKey = (e) => { if (e.key === 'Escape') setState(s => ({ ...s, open: false })); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.open]);

  // Auto-scroll body when thread changes
  React.useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [thread, thinking]);

  if (!state.ensId) return null;
  const data = REASONING_THREADS[state.ensId];
  if (!data) return null;
  const t = RC_I18N[state.lang] || RC_I18N.en;
  const agentMeta = AGENTS.find(a => a.ens === state.ensId);

  function pushUser(text) {
    setThread(th => [...th, { role: 'user', text }]);
    setThinking(true);
    // canned response if matches suggested
    const canned = data.cannedAnswers[state.lang]?.[text];
    const reply = canned || (state.lang === 'pl'
      ? 'Dobry punkt. Pozwol mi przemyslec to ponownie z Twoja perspektywa.\n\n…Po analizie podtrzymuje stanowisko. Klucz jest w skali pozycji (4.7%) i odwracalnosci. Twoja troska jest ważna ale nie zmienia kalkulacji w tej skali. Jezeli pozycja byla by 5x większa — zgodzilbym się z Toba.'
      : 'Good point. Let me reconsider with your framing.\n\n…After review, I stand by my position. The key is position size (4.7%) and reversibility. Your concern is valid but doesn\'t change the calculus at this scale. If the position were 5x larger — I\'d agree with you.'
    );
    setTimeout(() => {
      setThinking(false);
      setThread(th => [...th, { role: 'agent', text: reply }]);
    }, 1100 + Math.random() * 500);
  }

  function handleSend() {
    const text = draft.trim();
    if (!text) return;
    setDraft('');
    pushUser(text);
  }

  const voteColor = data.voteColor === 'voteFor' ? 'var(--vote-for)'
    : data.voteColor === 'voteAgainst' ? 'var(--vote-against)'
    : 'var(--text-tertiary)';

  return (
    <>
      <div
        style={{ ...reasoningStyles.scrim, ...(state.open ? reasoningStyles.scrimOpen : {}) }}
        onClick={() => setState(s => ({ ...s, open: false }))}
      />
      <aside style={{ ...reasoningStyles.panel, ...(state.open ? reasoningStyles.panelOpen : {}) }}>
        <div style={reasoningStyles.header}>
          <div style={reasoningStyles.headerTop}>
      <DAvatar agent={agentMeta} />
            <div style={reasoningStyles.headerTitle}>
              <div style={reasoningStyles.eyebrow}>{t.title}</div>
              <div style={reasoningStyles.agentName}>{data.agentLabel}</div>
              <div style={reasoningStyles.agentMeta}>{state.ensId}</div>
              <div style={{ marginTop: 6 }}>
                <span style={{
                  ...reasoningStyles.voteChip,
                  background: voteColor === 'var(--text-tertiary)' ? 'var(--bg)' : 'rgba(46,160,67,0.14)',
                  color: voteColor,
                  border: `1px solid ${voteColor}`,
                }}>
                  {t.voteLabel}: {data.voteLabel[state.lang]} · {t.onProp}
                </span>
              </div>
            </div>
            <button style={reasoningStyles.closeBtn} onClick={() => setState(s => ({ ...s, open: false }))}>×</button>
          </div>
          {state.claim && (
            <div style={reasoningStyles.claim}>"{state.claim}"</div>
          )}
          <ReputationStrip ensId={state.ensId} />
          <div style={{ display: 'flex', gap: 4, padding: '4px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
            {[
              { id: 'reasoning', label: 'Reasoning' },
              { id: 'history', label: 'Vote history' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setView(tab.id)} style={{
                flex: 1, padding: '7px 10px', borderRadius: 6,
                background: view === tab.id ? 'var(--bg-elev)' : 'transparent',
                border: 'none', color: view === tab.id ? 'var(--text)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
                letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
              }}>{tab.label}</button>
            ))}
          </div>
        </div>

        <div style={reasoningStyles.body} ref={bodyRef}>
          {view === 'history' ? (
            <HistoryView ensId={state.ensId} />
          ) : (<>
          <div style={reasoningStyles.sectionLabel}>{t.fullChain}</div>
          <div style={reasoningStyles.chainList}>
            {data.fullReasoning[state.lang].map((step, i) => (
              <ChainStep key={i} step={step} t={t} onSourceClick={(n) => {
                if (window.showSourcePopover) window.showSourcePopover(n);
              }} />
            ))}
          </div>

          {thread.length === 0 && (
            <>
              <div style={reasoningStyles.sectionLabel}>{t.suggested}</div>
              <div style={reasoningStyles.suggested}>
                {data.suggestedQuestions[state.lang].map((q, i) => (
                  <button key={i} style={reasoningStyles.suggestedBtn} onClick={() => pushUser(q)}>
                    <span style={reasoningStyles.suggestedArrow}>→</span>
                    <span>{q}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {thread.length > 0 && (
            <div style={reasoningStyles.thread}>
              {thread.map((msg, i) => (
                msg.role === 'user' ? (
                  <div key={i} style={reasoningStyles.msgUser}>{msg.text}</div>
                ) : (
                  <div key={i} style={reasoningStyles.msgAgent}>
                    <div style={reasoningStyles.msgLabel}>{data.agentLabel}</div>
                    {msg.text.split('\n\n').map((para, j) => (
                      <p key={j} style={{ margin: j === 0 ? 0 : '8px 0 0' }}>{para}</p>
                    ))}
                    <div style={{
                      display: 'flex', gap: 6, marginTop: 8, paddingTop: 8,
                      borderTop: '1px dashed var(--border)',
                      alignItems: 'center',
                    }}>
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginRight: 'auto' }}>
                        Helpful?
                      </span>
                      <button onClick={() => setThread(th => th.map((m, idx) => idx === i ? { ...m, feedback: m.feedback === 'up' ? null : 'up' } : m))} style={{
                        width: 26, height: 22, borderRadius: 4,
                        background: msg.feedback === 'up' ? 'color-mix(in oklch, var(--vote-for) 18%, transparent)' : 'transparent',
                        border: msg.feedback === 'up' ? '1px solid var(--vote-for)' : '1px solid var(--border)',
                        color: msg.feedback === 'up' ? 'var(--vote-for)' : 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer',
                      }}>↑</button>
                      <button onClick={() => setThread(th => th.map((m, idx) => idx === i ? { ...m, feedback: m.feedback === 'down' ? null : 'down' } : m))} style={{
                        width: 26, height: 22, borderRadius: 4,
                        background: msg.feedback === 'down' ? 'color-mix(in oklch, var(--vote-against) 18%, transparent)' : 'transparent',
                        border: msg.feedback === 'down' ? '1px solid var(--vote-against)' : '1px solid var(--border)',
                        color: msg.feedback === 'down' ? 'var(--vote-against)' : 'var(--text-tertiary)',
                        fontFamily: 'var(--font-mono)', fontSize: 11, cursor: 'pointer',
                      }}>↓</button>
                    </div>
                  </div>
                )
              ))}
              {thinking && <TypingBubble t={t} />}
            </div>
          )}
          </>)}
        </div>

        <div style={reasoningStyles.footer}>
          <div style={{
            display: 'flex', gap: 6, padding: 4, marginBottom: 2,
            borderRadius: 8, background: 'var(--bg-elev)',
            border: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', alignSelf: 'center', padding: '0 8px' }}>
              Trust agent
            </span>
            <button onClick={() => setTrustVote(v => v === 'trust' ? null : 'trust')} style={{
              flex: 1, padding: '7px 10px', borderRadius: 6,
              background: trustVote === 'trust' ? 'color-mix(in oklch, var(--vote-for) 18%, transparent)' : 'transparent',
              border: trustVote === 'trust' ? '1px solid var(--vote-for)' : '1px solid transparent',
              color: trustVote === 'trust' ? 'var(--vote-for)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}>↑ Trust</button>
            <button onClick={() => setTrustVote(v => v === 'distrust' ? null : 'distrust')} style={{
              flex: 1, padding: '7px 10px', borderRadius: 6,
              background: trustVote === 'distrust' ? 'color-mix(in oklch, var(--vote-against) 18%, transparent)' : 'transparent',
              border: trustVote === 'distrust' ? '1px solid var(--vote-against)' : '1px solid transparent',
              color: trustVote === 'distrust' ? 'var(--vote-against)' : 'var(--text-secondary)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.08em', textTransform: 'uppercase', cursor: 'pointer',
            }}>↓ Distrust</button>
          </div>
          <div style={reasoningStyles.inputRow}>
            <textarea
              style={reasoningStyles.textarea}
              placeholder={t.askPlaceholder}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
              }}
              rows={1}
            />
            <button style={reasoningStyles.sendBtn} onClick={handleSend} disabled={!draft.trim()}>
              {t.askLabel}
            </button>
          </div>
          {thread.length > 0 && (
            <div style={reasoningStyles.actionRow}>
              <button style={reasoningStyles.actionBtn}>↩ {t.standFirm}</button>
              <button style={{ ...reasoningStyles.actionBtn, ...reasoningStyles.actionBtnPrimary }}>
                ✓ {t.concede}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

Object.assign(window, { ReasoningChat });
