// Top bar + footer + proposal row + tally row for variant D.

function DTopBar({ locale, setLocale, theme, setThemeMode, themeMode, t, mode, elapsed, etaSec, soundOn, setSoundOn, reduceMotion, setReduceMotion, gas }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'stretch',
      borderBottom: `1px solid ${theme.border}`,
      background: theme.bgPanel,
    }}>
      <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderRight: `1px solid ${theme.border}` }}>
        <ConclaveLogo size={22} color={theme.text} accent={theme.amber} dim={theme.textDim} strokeOpacity={0.3} />
        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.4,
            color: theme.text,
          }}>CONCLAVE</div>
          <div style={{ fontSize: 10, color: theme.textFaint, fontFamily: 'var(--font-mono)', marginTop: 1, letterSpacing: 0.3 }}>{t.subtitle}</div>
        </div>
      </div>
      <DCell label={locale === 'en' ? 'Treasury' : 'Skarbiec'} value="1,062,184 mUSDC" theme={theme} />
      <DCell label={locale === 'en' ? 'Agents' : 'Agenci'} value="5/5 online" theme={theme} valueColor={theme.voteFor} dot={theme.voteFor} />
      <DCell label={t.state}
        value={
          mode === 'debating' ? `${t.debating} ${elapsed.toFixed(1)}s${etaSec != null ? ` · ${t.eta} ${Math.max(0, Math.round(etaSec))}s ${t.remaining}` : ''}` :
          mode === 'paused' ? t.pause :
          mode === 'done' ? t.verdict :
          mode === 'error' ? t.error :
          t.waiting
        }
        theme={theme}
        valueColor={mode === 'debating' ? theme.amber : mode === 'paused' ? theme.textDim : mode === 'error' ? theme.voteAgainst : theme.text} />
      <DCell label={t.gas} value={gas} theme={theme} />
      <div style={{ flex: 1 }} />
      <DTooltip theme={theme} label={soundOn ? t.soundOff : t.soundOn}
        hint={locale === 'en' ? 'Subtle audio cues when agents finish or vote.' : 'Delikatne dzwieki gdy agenci koncza lub gloszuja.'}>
        <DIconBtn theme={theme} onClick={() => setSoundOn(!soundOn)}>
          {soundOn
            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 6h2.5l3-2.5v9L5.5 10H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><path d="M11 5.5a3.5 3.5 0 010 5M13 4a6 6 0 010 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 6h2.5l3-2.5v9L5.5 10H3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/><line x1="11" y1="6" x2="14" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/><line x1="14" y1="6" x2="11" y2="9" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
          }
        </DIconBtn>
      </DTooltip>
      <DTooltip theme={theme} label={t.reduceMotion}
        hint={locale === 'en' ? 'Disable typewriter, blinking dots, and waveforms.' : 'Wylacz typewriter, migajace kropki i waveformy.'}>
        <DIconBtn theme={theme} onClick={() => setReduceMotion(!reduceMotion)} active={reduceMotion}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
        </DIconBtn>
      </DTooltip>
      <DTooltip theme={theme} label={themeMode === 'dark' ? t.light : t.dark}
        hint={locale === 'en' ? 'Toggle light / dark theme.' : 'Przelacz motyw jasny / ciemny.'}>
        <DIconBtn theme={theme} onClick={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}>
          {themeMode === 'dark'
            ? <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="3" stroke="currentColor" strokeWidth="1.4"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.5 1.5M11.5 11.5L13 13M3 13l1.5-1.5M11.5 4.5L13 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            : <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M13 9.5A5.5 5.5 0 016.5 3a5.5 5.5 0 100 11 5.5 5.5 0 006.5-4.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/></svg>
          }
        </DIconBtn>
      </DTooltip>
      <DTooltip theme={theme} label={locale === 'en' ? 'Switch to Polish' : 'Switch to English'}
        hint={locale === 'en' ? 'Council debates and verdicts are translated live.' : 'Debaty i werdykty rady tlumaczone na zywo.'}>
        <button onClick={() => setLocale(locale === 'en' ? 'pl' : 'en')} style={{
          padding: '0 16px', background: 'transparent', border: 'none', borderLeft: `1px solid ${theme.border}`,
          color: theme.textDim, fontSize: 11.5, fontFamily: 'var(--font-mono)', cursor: 'pointer', fontWeight: 700, letterSpacing: '0.04em',
        }}>{t.languageToggle}</button>
      </DTooltip>
      <div style={{ padding: '0 14px', borderLeft: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: theme.textDim, fontFamily: 'var(--font-mono)' }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(from 0deg, oklch(0.74 0.16 305), oklch(0.78 0.16 152), oklch(0.82 0.15 75), oklch(0.74 0.16 305))' }} />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
          <span style={{ color: theme.text, fontWeight: 600 }}>treasury.aicouncil.eth</span>
          <span style={{ fontSize: 9.5, color: theme.textFaint }}>0xae...3f1c · 0.84 ETH</span>
        </div>
      </div>
    </div>
  );
}

const DIconBtn = React.forwardRef(function DIconBtn({ children, onClick, theme, active, ...rest }, ref) {
  return <button ref={ref} onClick={onClick} {...rest} style={{
    padding: '0 12px', background: active ? `color-mix(in oklch, ${theme.amber} 18%, transparent)` : 'transparent',
    border: 'none', borderLeft: `1px solid ${theme.border}`,
    color: active ? theme.amber : theme.textDim, cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  }}>{children}</button>;
});

function DCell({ label, value, theme, valueColor, dot }) {
  return <div style={{ padding: '8px 16px', borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', justifyContent: 'center', minWidth: 110 }}>
    <span style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontSize: 11.5, color: valueColor || theme.text, fontWeight: 600, marginTop: 2, fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot }} />}
      {value}
    </span>
  </div>;
}

function DProposalRow({ locale, t, theme, mode, onConvene, onPause, onResume, onStop, onSkip, elapsed }) {
  const isWaiting = mode === 'waiting';
  const isDebating = mode === 'debating';
  const isPaused = mode === 'paused';
  return (
    <div style={{
      background: theme.bgPanel, border: `1px solid ${theme.border}`,
      borderRadius: 4, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'stretch' }}>
        <div style={{
          padding: '8px 13px', background: theme.amber,
          color: theme.inverseText, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'var(--font-mono)',
          display: 'flex', alignItems: 'center', textTransform: 'uppercase',
        }}>{t.proposalLabel} · {PROPOSAL.meta.id}</div>
        <div style={{
          padding: '8px 13px', borderRight: `1px solid ${theme.borderSoft}`,
          fontSize: 11.5, color: theme.textDim, display: 'flex', alignItems: 'center',
          fontFamily: 'var(--font-mono)',
        }}>
          deposit · 100,000 USDC → Aave v3 Base · est 4.2% APY
        </div>
        <div style={{ flex: 1 }} />
        {(isDebating || isPaused) && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '0 13px', borderLeft: `1px solid ${theme.borderSoft}`,
            color: isPaused ? theme.textDim : theme.amber, fontSize: 11, fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: isPaused ? theme.textDim : theme.amber, animation: isPaused ? 'none' : 'a-blink 1s infinite' }} />
            {isPaused ? t.pause.toUpperCase() : 'LIVE'} · {elapsed.toFixed(1)}s
          </div>
        )}
        {isWaiting && (
          <button onClick={onConvene} style={{
            padding: '0 22px', background: theme.text, color: theme.bg, border: 'none',
            fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
            cursor: 'pointer', textTransform: 'uppercase',
          }}>{t.convene}</button>
        )}
        {isDebating && <>
          <DTooltip theme={theme} label={t.pause} shortcut="Space"
            hint={locale === 'en' ? 'Halt the debate. Reasoning resumes from where it stopped.' : 'Zatrzymaj debate. Rozumowanie wznowi się od tego punktu.'}>
            <button onClick={onPause} style={ctrlBtn(theme, false)}>{t.pause}</button>
          </DTooltip>
          <DTooltip theme={theme} label={t.skip} shortcut="→"
            hint={locale === 'en' ? 'Jump straight to verdict. Agents finalize on partial reasoning.' : 'Przeskocz do werdyktu. Agenci finalizuja na niepelnym rozumowaniu.'}>
            <button onClick={onSkip} style={ctrlBtn(theme, false)}>{t.skip}</button>
          </DTooltip>
          <DTooltip theme={theme} label={t.stop} shortcut="Esc"
            hint={locale === 'en' ? 'Abort the council. Proposal returns to draft.' : 'Przerwij radę. Propozycja wraca do szkicu.'}>
            <button onClick={onStop} style={ctrlBtn(theme, true)}>{t.stop}</button>
          </DTooltip>
        </>}
        {isPaused && <>
          <DTooltip theme={theme} label={t.resume} shortcut="Space"
            hint={locale === 'en' ? 'Continue the debate from where it paused.' : 'Kontynuuj debate od miejsca pauzy.'}>
            <button onClick={onResume} style={ctrlBtn(theme, false)}>{t.resume}</button>
          </DTooltip>
          <DTooltip theme={theme} label={t.skip} shortcut="→"
            hint={locale === 'en' ? 'Jump straight to verdict.' : 'Przeskocz do werdyktu.'}>
            <button onClick={onSkip} style={ctrlBtn(theme, false)}>{t.skip}</button>
          </DTooltip>
          <DTooltip theme={theme} label={t.stop} shortcut="Esc"
            hint={locale === 'en' ? 'Abort the council.' : 'Przerwij radę.'}>
            <button onClick={onStop} style={ctrlBtn(theme, true)}>{t.stop}</button>
          </DTooltip>
        </>}
      </div>
      <div style={{ padding: '14px 16px', fontSize: 13.5, lineHeight: 1.55, color: theme.text, textWrap: 'pretty' }}>
        {PROPOSAL[locale]}
      </div>
    </div>
  );
}

function ctrlBtn(theme, danger) {
  return {
    padding: '0 16px', background: 'transparent',
    color: danger ? theme.voteAgainst : theme.text,
    border: 'none', borderLeft: `1px solid ${theme.borderSoft}`,
    fontFamily: 'var(--font-mono)', fontSize: 11.5, fontWeight: 600, letterSpacing: '0.04em',
    cursor: 'pointer', textTransform: 'uppercase',
  };
}

function DTallyRow({ agents, locale, t, theme, mode, agentModes, archiveStatus }) {
  const counts = { FOR: 0, AGAINST: 0, ABSTAIN: 0 };
  agents.forEach((a) => { if (agentModes[a.id] === 'done') counts[a.decision] += 1; });
  const allDone = agents.every((a) => agentModes[a.id] === 'done' || agentModes[a.id] === 'skipped' || agentModes[a.id] === 'error');
  const verdict = !allDone ? null : (counts.FOR > counts.AGAINST && counts.FOR >= 3 ? 'approve' : counts.AGAINST > counts.FOR ? 'reject' : 'split');
  const verdictColor = !verdict ? theme.textDim : verdict === 'approve' ? theme.voteFor : verdict === 'reject' ? theme.voteAgainst : theme.voteAbstain;
  const verdictText = !verdict ? t.verdictWaiting : verdict === 'approve' ? t.verdictApprove : verdict === 'reject' ? t.verdictReject : t.verdictSplit;
  return (
    <div style={{
      background: theme.bgPanel, border: `1px solid ${theme.border}`,
      borderRadius: 4, display: 'flex', alignItems: 'stretch', overflow: 'hidden',
    }}>
      <div style={{ padding: '12px 16px', borderRight: `1px solid ${theme.border}`, minWidth: 240 }}>
        <div style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>{t.tally}</div>
        <div style={{ display: 'flex', height: 6, borderRadius: 1, overflow: 'hidden', background: theme.bgRow, marginBottom: 8 }}>
          <div style={{ flex: counts.FOR || 0.001, background: counts.FOR ? theme.voteFor : 'transparent', transition: 'flex .4s' }} />
          <div style={{ flex: counts.AGAINST || 0.001, background: counts.AGAINST ? theme.voteAgainst : 'transparent', transition: 'flex .4s' }} />
          <div style={{ flex: counts.ABSTAIN || 0.001, background: counts.ABSTAIN ? theme.voteAbstain : 'transparent', transition: 'flex .4s' }} />
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: theme.voteFor }}>{t.voteFor}: {counts.FOR}</span>
          <span style={{ color: theme.voteAgainst }}>{t.voteAgainst}: {counts.AGAINST}</span>
          <span style={{ color: theme.voteAbstain }}>{t.voteAbstain}: {counts.ABSTAIN}</span>
        </div>
      </div>
      <div style={{ flex: 1, padding: '12px 18px' }}>
        <div style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{t.verdict}</div>
        <div style={{ fontSize: 22, fontWeight: 600, color: verdictColor, letterSpacing: '-0.02em', marginTop: 4 }}>{verdictText}</div>
        {allDone && <div style={{ fontSize: 10.5, color: theme.textFaint, marginTop: 6, fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {archiveStatus === 'pending'
            ? <><span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.amber, animation: 'a-blink 1s infinite' }} />{t.archiving} · {t.cidPending}</>
            : <><span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.voteFor }} />{t.archived} · bafy...q4hzx</>
          }
        </div>}
      </div>
      {verdict === 'approve' && (
        <button style={{
          padding: '0 24px', background: theme.voteFor, color: theme.inverseText,
          border: 'none', fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
          cursor: 'pointer', textTransform: 'uppercase',
        }}>{t.submitOnchain}</button>
      )}
    </div>
  );
}

function DFooter({ theme, t, locale }) {
  return <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '8px 16px', borderTop: `1px solid ${theme.border}`, background: theme.bgPanel,
    fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: theme.voteFor }} />
        {t.network}: Base Sepolia · {t.block} 18,234,012
      </span>
      <span style={{ opacity: 0.7 }}>governor 0x7f...a92e</span>
      <span style={{ opacity: 0.7 }}>0G storage gateway online</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <span style={{ opacity: 0.7 }}>{t.keyboardHint}</span>
      <span style={{ padding: '2px 7px', borderRadius: 2, border: `1px solid ${theme.border}`, color: theme.textDim, fontSize: 9.5, letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
        {t.notFinAdvice}
      </span>
    </div>
  </div>;
}

window.DTopBar = DTopBar;
window.DProposalRow = DProposalRow;
window.DTallyRow = DTallyRow;
window.DFooter = DFooter;
