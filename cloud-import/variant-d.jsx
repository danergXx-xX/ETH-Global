// Variant D — main orchestrator. Wires Top bar + Proposal + Tally + Cards + Footer.
// Manages: pause/resume/stop, skip, replay, focus, theme, sound, reduce-motion,
// gas estimate, archive status, keyboard shortcuts.

function VariantD({ locale, mode: extMode, agentModes: extAgentModes, onConvene: extConvene, elapsed: extElapsed, theme: extTheme }) {
  const [src, setSrc] = React.useState(null);
  const [selfLocale, setSelfLocale] = React.useState(locale);
  const [themeMode, setThemeMode] = React.useState('dark');
  const [soundOn, setSoundOn] = React.useState(false);
  const [reduceMotionOverride, setReduceMotionOverride] = React.useState(null);
  const [focusedId, setFocusedId] = React.useState(null);
  const [localOverride, setLocalOverride] = React.useState(null); // 'paused' | 'skipped' | 'stopped' | null
  const [perAgentOverride, setPerAgentOverride] = React.useState({});

  const prefReduce = usePrefersReducedMotion();
  const reduceMotion = reduceMotionOverride != null ? reduceMotionOverride : prefReduce;
  const theme = themeMode === 'dark' ? D_DARK : D_LIGHT;

  React.useEffect(() => setSelfLocale(locale), [locale]);
  const t = I18N[selfLocale];

  // Resolve effective mode (apply local pause/skip/stop overrides)
  let mode = extMode;
  if (localOverride === 'paused') mode = 'paused';
  if (localOverride === 'stopped') mode = 'waiting';
  if (localOverride === 'skipped') mode = 'done';

  // Resolve effective agent modes
  const agentModes = React.useMemo(() => {
    const next = { ...extAgentModes };
    if (localOverride === 'paused') {
      AGENTS.forEach((a) => { if (next[a.id] === 'debating') next[a.id] = 'paused'; });
    }
    if (localOverride === 'skipped' || localOverride === 'stopped') {
      AGENTS.forEach((a) => { next[a.id] = localOverride === 'skipped' ? 'done' : 'waiting'; });
    }
    Object.keys(perAgentOverride).forEach((id) => { next[id] = perAgentOverride[id]; });
    return next;
  }, [extAgentModes, localOverride, perAgentOverride]);

  // ETA: estimate based on remaining agents not done yet
  const remaining = AGENTS.filter((a) => agentModes[a.id] !== 'done' && agentModes[a.id] !== 'skipped' && agentModes[a.id] !== 'error').length;
  const etaSec = mode === 'debating' ? remaining * 4.5 : null;

  // Archive simulated: pending for 2s after all-done, then archived
  const allDone = AGENTS.every((a) => agentModes[a.id] === 'done' || agentModes[a.id] === 'skipped' || agentModes[a.id] === 'error');
  const [archiveStatus, setArchiveStatus] = React.useState('pending');
  React.useEffect(() => {
    if (!allDone) { setArchiveStatus('pending'); return; }
    const id = setTimeout(() => setArchiveStatus('archived'), 2400);
    return () => clearTimeout(id);
  }, [allDone]);

  // Reset overrides whenever extMode resets to waiting
  React.useEffect(() => {
    if (extMode === 'waiting') {
      setLocalOverride(null);
      setPerAgentOverride({});
    }
  }, [extMode]);

  // Keyboard shortcuts
  React.useEffect(() => {
    const onKey = (e) => {
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      if (e.key === ' ') {
        e.preventDefault();
        if (mode === 'debating') setLocalOverride('paused');
        else if (mode === 'paused') setLocalOverride(null);
      } else if (e.key === 'ArrowRight') {
        if (mode === 'debating' || mode === 'paused') setLocalOverride('skipped');
      } else if (e.key === 'r' || e.key === 'R') {
        setLocalOverride(null);
        setPerAgentOverride({});
        extConvene && extConvene();
      } else if (e.key === 'Escape') {
        if (mode === 'debating' || mode === 'paused') setLocalOverride('stopped');
        if (focusedId) setFocusedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mode, focusedId, extConvene]);

  const onPause = () => setLocalOverride('paused');
  const onResume = () => setLocalOverride(null);
  const onStop = () => setLocalOverride('stopped');
  const onSkip = () => setLocalOverride('skipped');
  const onConvene = () => { setLocalOverride(null); setPerAgentOverride({}); extConvene && extConvene(); };

  const onRetry = (id) => setPerAgentOverride((p) => ({ ...p, [id]: 'debating' }));
  const onContinueWithout = (id) => setPerAgentOverride((p) => ({ ...p, [id]: 'skipped' }));

  const gasStr = mode === 'debating' ? '~0.0024 ETH' : '0.0021 ETH';

  const isWaiting = mode === 'waiting';

  return (
    <div style={{
      width: '100%', height: '100%',
      background: theme.bg, color: theme.text,
      display: 'flex', flexDirection: 'column', overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>
      <DTopBar
        locale={selfLocale} setLocale={setSelfLocale}
        theme={theme} setThemeMode={setThemeMode} themeMode={themeMode}
        t={t} mode={mode} elapsed={extElapsed} etaSec={etaSec}
        soundOn={soundOn} setSoundOn={setSoundOn}
        reduceMotion={reduceMotion} setReduceMotion={(v) => setReduceMotionOverride(v)}
        gas={gasStr}
      />

      {isWaiting ? (
        <DEmptyState theme={theme} t={t} onConvene={onConvene} />
      ) : (
        <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12, flex: 1, overflow: 'auto' }}>
          <DProposalRow locale={selfLocale} t={t} theme={theme} mode={mode} elapsed={extElapsed}
            onConvene={onConvene} onPause={onPause} onResume={onResume} onStop={onStop} onSkip={onSkip} />
          <DTallyRow agents={AGENTS} locale={selfLocale} t={t} theme={theme} mode={mode}
            agentModes={agentModes} archiveStatus={archiveStatus} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 12 }}>
            {AGENTS.map((a) => (
              <DCard key={a.id} agent={a} mode={agentModes[a.id] || 'waiting'} locale={selfLocale}
                t={t} theme={theme} onSourceClick={setSrc}
                dimmed={focusedId && focusedId !== a.id}
                focused={focusedId === a.id}
                onToggleFocus={() => setFocusedId(focusedId === a.id ? null : a.id)}
                onRetry={onRetry}
                onContinueWithout={onContinueWithout}
                reduceMotion={reduceMotion}
              />
            ))}
          </div>
        </div>
      )}

      <DFooter theme={theme} t={t} locale={selfLocale} />
      <ASourcePopover srcId={src} theme={{ ...theme, bgCard: theme.bgPanel, accent: theme.amber }} locale={selfLocale} onClose={() => setSrc(null)} />
    </div>
  );
}

function DEmptyState({ theme, t, onConvene }) {
  return <div style={{
    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 32,
  }}>
    <div style={{
      maxWidth: 560, textAlign: 'center',
      padding: 32,
      border: `1px dashed ${theme.border}`, borderRadius: 6,
      background: theme.bgPanel,
    }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
        {AGENTS.map((a) => (
          <div key={a.id} style={{
            width: 36, height: 36, borderRadius: '50%', overflow: 'hidden',
            boxShadow: `0 0 0 1.5px color-mix(in oklch, ${a.color.accent} 50%, white)`,
          }}>
            <AgentPortrait id={a.id} hue={a.color.hue} accent={a.color.accent} />
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 600, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.015em' }}>
        {t.waitingTitle}
      </h2>
      <p style={{ fontSize: 13, lineHeight: 1.6, color: theme.textDim, margin: '0 0 22px', textWrap: 'pretty' }}>
        {t.waitingHint}
      </p>
      <div style={{ display: 'inline-flex', gap: 10 }}>
        <button onClick={onConvene} style={{
          padding: '10px 22px', background: theme.text, color: theme.bg, border: 'none',
          fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.05em',
          cursor: 'pointer', textTransform: 'uppercase', borderRadius: 3,
        }}>{t.convene}</button>
        <button style={{
          padding: '10px 18px', background: 'transparent', color: theme.textDim,
          border: `1px solid ${theme.border}`,
          fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
          cursor: 'pointer', textTransform: 'uppercase', borderRadius: 3,
        }}>{t.connectWallet}</button>
      </div>
      <div style={{ marginTop: 22, fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>
        {t.keyboardHint}
      </div>
    </div>
  </div>;
}

window.VariantD = VariantD;
