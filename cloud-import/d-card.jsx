// Agent card for variant D — full feature set.

function DCard({ agent, mode, locale, t, theme, onSourceClick, dimmed, focused, onToggleFocus, onRetry, onContinueWithout, reduceMotion }) {
  const tw = useTypewriter(agent, locale, mode === 'paused' ? 'waiting' : mode, reduceMotion ? 999 : 1);
  const isTyping = mode === 'debating' && tw.status === 'typing';
  const isDone = mode === 'done' || mode === 'skipped' || (mode === 'debating' && tw.status === 'done');
  const isWaiting = mode === 'waiting' || mode === 'paused' || !mode;
  const isError = mode === 'error';
  const decisionColor = agent.decision === 'FOR' ? theme.voteFor : agent.decision === 'AGAINST' ? theme.voteAgainst : theme.voteAbstain;
  const decisionLabel = agent.decision === 'FOR' ? t.voteFor : agent.decision === 'AGAINST' ? t.voteAgainst : t.voteAbstain;
  const [hovered, setHovered] = React.useState(null);
  const [copied, setCopied] = React.useState(null);

  const onCopy = (i, text) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 1400);
  };

  return (
    <div onClick={onToggleFocus} style={{
      background: theme.bgPanel,
      border: `1px solid ${isError ? theme.voteAgainst : isTyping ? agent.color.accent : focused ? agent.color.accent : theme.border}`,
      borderRadius: 4,
      display: 'flex', flexDirection: 'column',
      transition: 'border-color .3s, box-shadow .3s, opacity .25s, transform .25s',
      boxShadow: isTyping || focused ? `0 0 0 1px ${agent.color.accent}55` : 'none',
      overflow: 'hidden',
      opacity: dimmed ? 0.42 : 1,
      transform: focused ? 'scale(1.005)' : 'none',
      cursor: onToggleFocus ? 'pointer' : 'default',
    }}>
      <div style={{
        background: agent.color.headerBg, color: agent.color.headerText,
        padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11,
      }}>
        <DAvatar agent={agent} pulsing={isTyping && !reduceMotion} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-mono)', fontSize: 12.5, fontWeight: 600,
            letterSpacing: '-0.005em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>{agent.ens}</div>
          <div style={{ fontSize: 11, marginTop: 2, opacity: 0.78, fontWeight: 500 }}>
            {agent.label[locale]}
            <span style={{ opacity: 0.6, margin: '0 5px' }}>·</span>
            <span style={{ fontStyle: 'italic', fontWeight: 400 }}>{agent.bias[locale]}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 700, letterSpacing: '0.02em' }}>
            {agent.rep}%
          </div>
          <div style={{ fontSize: 9.5, opacity: 0.72, marginTop: 1, fontFamily: 'var(--font-mono)' }}>
            {agent.statements} {locale === 'en' ? 'stmt' : 'wyp'}
          </div>
        </div>
      </div>

      {/* Confidence progress under header — visible when done */}
      {isDone && (
        <div style={{ height: 3, background: theme.bgRow }}>
          <div style={{ width: `${agent.confidence * 100}%`, height: '100%', background: decisionColor, transition: 'width .5s' }} />
        </div>
      )}

      <div style={{
        padding: '8px 14px', borderBottom: `1px solid ${theme.borderSoft}`,
        background: theme.bgRow,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
        minHeight: 34,
      }}>
        {isWaiting && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: theme.textFaint, fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
            <span style={{ width: 6, height: 6, borderRadius: 1, background: theme.textFaint, opacity: 0.6 }} />
            {mode === 'paused' ? t.pause : t.waiting}
          </span>
        )}
        {isError && (
          <span style={{ color: theme.voteAgainst, fontSize: 11.5, fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
            {locale === 'en' ? 'fetch failed · ETIMEDOUT' : 'pobranie nieudane · ETIMEDOUT'}
          </span>
        )}
        {isDone && (
          <>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, color: theme.textDim, fontSize: 11.5 }}>
              <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 5.5l2 2 5-5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {mode === 'skipped' ? t.skippedTo : t.done}
              <span style={{ fontFamily: 'var(--font-mono)', color: theme.textFaint, marginLeft: 4 }}>{Math.round(agent.confidence * 100)}% {t.confidence.toLowerCase()}</span>
            </span>
            <div style={{
              padding: '3px 9px', borderRadius: 3,
              background: `color-mix(in oklch, ${decisionColor} 16%, transparent)`,
              color: decisionColor,
              border: `1px solid color-mix(in oklch, ${decisionColor} 35%, transparent)`,
              fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
            }}>{decisionLabel.toUpperCase()}</div>
          </>
        )}
        {isTyping && (
          <>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '3px 9px 3px 8px', borderRadius: 3,
              background: `color-mix(in oklch, ${agent.color.accent} 14%, transparent)`,
              color: agent.color.accent,
              fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 500,
              border: `1px solid color-mix(in oklch, ${agent.color.accent} 30%, transparent)`,
            }}>
              {!reduceMotion && <AWaveform color={agent.color.accent} />}
              {t[tw.statusKey]}{!reduceMotion && <AnimatedDots />}
            </span>
            <DProgressGlyph progress={tw.progress} color={agent.color.accent} bg={theme.bg} />
          </>
        )}
      </div>

      {isTyping && !reduceMotion && <div style={{
        height: 1.5, background: `linear-gradient(90deg, transparent, ${agent.color.accent}, transparent)`,
        animation: 'a-scan 1.6s linear infinite',
      }} />}

      <div style={{ flex: 1, minHeight: 220, display: 'flex', flexDirection: 'column' }}>
        {isWaiting && <div style={{ padding: '14px', color: theme.textFaint, fontSize: 12, fontStyle: 'italic' }}>
          {locale === 'en' ? 'Awaiting council convocation.' : 'Oczekuje na zwolanie rady.'}
        </div>}
        {isError && (
          <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ color: theme.text, fontSize: 12.5, lineHeight: 1.55, margin: 0 }}>
              {locale === 'en' ? 'Could not fetch DeFiLlama pool data after 3 retries (8.4s). Cause: upstream rate limit.' : 'Nie udalo się pobrac danych puli DeFiLlama po 3 probach (8,4s). Powod: limit zapytan upstream.'}
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={(e) => { e.stopPropagation(); onRetry && onRetry(agent.id); }} style={{
                padding: '5px 12px', borderRadius: 3,
                background: 'transparent', border: `1px solid ${theme.voteAgainst}`,
                color: theme.voteAgainst, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
              }}>{t.retryFetch}</button>
              <button onClick={(e) => { e.stopPropagation(); onContinueWithout && onContinueWithout(agent.id); }} style={{
                padding: '5px 12px', borderRadius: 3,
                background: 'transparent', border: `1px solid ${theme.border}`,
                color: theme.textDim, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                fontFamily: 'var(--font-mono)', letterSpacing: '0.03em',
              }}>{t.continueWithout}</button>
            </div>
          </div>
        )}
        {(isTyping || isDone) && tw.claims.map((c, i) => (
          <div key={i}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{
              padding: '10px 14px',
              borderBottom: i < tw.claims.length - 1 ? `1px solid ${theme.borderSoft}` : 'none',
              display: 'flex', gap: 10, alignItems: 'flex-start',
              background: hovered === i ? theme.bgRow : 'transparent',
              transition: 'background .15s',
              position: 'relative',
            }}>
            <span style={{
              flexShrink: 0, marginTop: 2,
              width: 18, height: 18, borderRadius: 2,
              background: `color-mix(in oklch, ${agent.color.accent} 14%, transparent)`,
              color: agent.color.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}>{(i + 1).toString().padStart(2, '0')}</span>
            <div style={{ fontSize: 12.5, lineHeight: 1.55, color: theme.text, flex: 1, textWrap: 'pretty' }}>
              {c.text}
              {c.s != null && !c.partial && (
                <button onClick={(e) => { e.stopPropagation(); onSourceClick(c.s); }} style={{
                  marginLeft: 4, padding: '0 5px', height: 15,
                  background: `color-mix(in oklch, ${agent.color.accent} 16%, transparent)`,
                  border: `1px solid color-mix(in oklch, ${agent.color.accent} 35%, transparent)`,
                  color: agent.color.accent,
                  fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600,
                  borderRadius: 2, cursor: 'pointer', verticalAlign: 'baseline',
                }}>[{c.s}]</button>
              )}
              {c.partial && <span style={{
                display: 'inline-block', width: 7, height: 13, marginLeft: 1,
                background: agent.color.accent, verticalAlign: '-2px',
                animation: reduceMotion ? 'none' : 'a-blink 1s steps(2) infinite',
              }} />}
              {!c.partial && (
                <div style={{
                  marginTop: 4, fontSize: 9.5, fontFamily: 'var(--font-mono)',
                  color: theme.textFaint, letterSpacing: '0.04em',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span>{t.timestamp}{(i * 3.2 + 1.4).toFixed(1)}s</span>
                  {hovered === i && (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); onCopy(i, c.text); }} style={inlineActionBtn(theme)}>
                        {copied === i ? t.copied : t.copy}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); onCopy(i, `${window.location.href}#${agent.id}-${i}`); }} style={inlineActionBtn(theme)}>
                        {t.share}
                      </button>
                      <button onClick={(e) => {
                        e.stopPropagation();
                        if (window.openReasoningChat) window.openReasoningChat(agent.ens, c.text, locale);
                      }} style={{
                        ...inlineActionBtn(theme),
                        color: agent.color.accent,
                        borderColor: `color-mix(in oklch, ${agent.color.accent} 45%, transparent)`,
                      }}>
                        {locale === 'pl' ? '↳ Wykaz' : '↳ Challenge'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function inlineActionBtn(theme) {
  return {
    padding: '0 6px', height: 16, background: 'transparent',
    border: `1px solid ${theme.border}`, color: theme.textDim,
    fontFamily: 'var(--font-mono)', fontSize: 9.5, fontWeight: 600,
    borderRadius: 2, cursor: 'pointer', letterSpacing: '0.04em',
    textTransform: 'uppercase',
  };
}

window.DCard = DCard;
