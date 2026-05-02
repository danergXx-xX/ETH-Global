// Component 4: Treasury Dashboard — orchestrator.
// Bloomberg-density layout: top bar + side nav + KPI band + grid of modules.
// 3 simulated states: 'idle' | 'active' | 'post-verdict'.
// Plus 'empty' state (no funds).

// Default tweaks live at module scope so artboard overrides can reference
// the same shape and the EDITMODE markers can be parsed by the host.
const DASH_TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "themeMode": "dark",
  "locale": "en",
  "state": "active",
  "showStatsStrip": true,
  "showQuickPropose": true,
  "showTweaksPanel": true
}/*EDITMODE-END*/;

function VariantDash({ overrides = {} }) {
  // overrides: per-artboard locks (themeMode/locale/state). When set,
  // those keys are pinned and not surfaced in the Tweaks panel.
  const TWEAK_DEFAULTS = { ...DASH_TWEAK_DEFAULTS, ...overrides };
  const [rawTweaks, setRawTweak] = useTweaks(TWEAK_DEFAULTS);
  const tweaks = { ...rawTweaks, ...overrides };
  const setTweak = (k, v) => {
    if (k in overrides) return; // locked
    setRawTweak(k, v);
  };
  const theme = tweaks.themeMode === 'light' ? D_LIGHT : D_DARK;
  const t = { ...I18N[tweaks.locale], ...DASH_I18N[tweaks.locale] };

  // ----- Active-state simulated debate clock -----
  const [elapsed, setElapsed] = React.useState(7.2);
  React.useEffect(() => {
    if (tweaks.state !== 'active') { setElapsed(7.2); return; }
    const id = setInterval(() => {
      setElapsed(e => {
        const next = e + 0.1;
        return next > 18 ? 7.2 : next;  // loop
      });
    }, 100);
    return () => clearInterval(id);
  }, [tweaks.state]);

  // ----- Block height ticking -----
  const [block, setBlock] = React.useState(18420317);
  React.useEffect(() => {
    const id = setInterval(() => setBlock(b => b + 1), 2000);
    return () => clearInterval(id);
  }, []);

  // ----- Verdicts based on state -----
  const verdicts = React.useMemo(() => {
    if (tweaks.state === 'idle') {
      // No PROP-042 in flight
      return DASH_VERDICTS.filter(v => v.status !== 'pending');
    }
    if (tweaks.state === 'post-verdict') {
      // PROP-042 just executed
      return [
        { ...DASH_VERDICTS[0], status: 'executing', tally: { for: 4, against: 0, abstain: 1 }, when: { en: 'just now', pl: 'wlasnie' }, archived: false, cidShort: 'pending' },
        ...DASH_VERDICTS.slice(1),
      ];
    }
    return DASH_VERDICTS;
  }, [tweaks.state]);

  const lastVerdict = verdicts[0];

  // ----- Activity feed (state-dependent first row) -----
  const activity = React.useMemo(() => {
    if (tweaks.state === 'idle') return DASH_ACTIVITY.slice(1);
    if (tweaks.state === 'post-verdict') {
      return [
        { ts: 'T-2s',  type: 'exec',     actor: 'treasury.aicouncil.eth', en: 'executing PROP-042',  pl: 'wykonuje PROP-042', detail: { en: '100k USDC → aUSDC',     pl: '100k USDC → aUSDC' } },
        { ts: 'T-3s',  type: 'archive',  actor: '0g.storage',             en: 'archiving PROP-042',  pl: 'archiwizuje PROP-042', detail: { en: 'CID pending',          pl: 'CID w toku' } },
        { ts: 'T-3s',  type: 'vote',     actor: 'bear.aicouncil.eth',     en: 'voted ABSTAIN',       pl: 'glos WSTRZ.', detail: { en: 'PROP-042',                pl: 'PROP-042' } },
        ...DASH_ACTIVITY,
      ];
    }
    return DASH_ACTIVITY;
  }, [tweaks.state]);

  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column',
      background: theme.bg, color: theme.text,
      fontFamily: 'var(--font-sans)',
      fontSize: 13,
      letterSpacing: '-0.005em',
    }}>
      <DashTopBar
        theme={theme} t={t}
        walletEns="treasury.aicouncil.eth"
        walletShort="0xae...3f1c"
        walletEth="0.84"
        blockHeight={block}
        gasUsd={0.81}
        locale={tweaks.locale}
        onLocale={(l) => setTweak('locale', l)}
        themeMode={tweaks.themeMode}
        onThemeMode={(m) => setTweak('themeMode', m)}
      />

      <div style={{ flex: 1, display: 'flex', minHeight: 0 }}>
        <DashSideNav theme={theme} t={t} current="home" />

        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>

          {/* KPI band */}
          <DashKpiBand theme={theme} t={t} />

          {/* Live Council strip — full width */}
          <LiveCouncilStrip
            theme={theme} t={t}
            state={tweaks.state}
            elapsed={elapsed}
            eta={18}
            lastVerdict={lastVerdict}
            onConvene={() => setTweak('state', 'active')}
            onExpand={() => {}}
          />

          {/* Main grid — 3 columns × 2 rows.
              row 1: allocation+positions | recent verdicts | agents+quick (spans 2 rows)
              row 2: activity feed spans col 1+2 (wide), kol 3 nadal agents+quick */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.1fr) minmax(0, 1fr) minmax(0, 0.95fr)',
            gridTemplateRows: 'minmax(380px, auto) minmax(170px, auto)',
            gap: 10,
          }}>
            {/* Col 1 row 1: allocation + positions */}
            <div style={{ gridColumn: 1, gridRow: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
              <AllocationBar theme={theme} t={t} allocation={DASH_ALLOCATION} />
              <ActivePositions theme={theme} t={t} allocation={DASH_ALLOCATION} />
            </div>

            {/* Col 2 row 1: verdicts */}
            <div style={{ gridColumn: 2, gridRow: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <RecentVerdicts theme={theme} t={t} locale={tweaks.locale} verdicts={verdicts} />
            </div>

            {/* Col 1+2 row 2: activity (wide) */}
            <div style={{ gridColumn: '1 / 3', gridRow: 2, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
              <ActivityFeed theme={theme} t={t} activity={activity} locale={tweaks.locale} />
            </div>

            {/* Col 3 row 1+2: agents + quick propose */}
            <div style={{ gridColumn: 3, gridRow: '1 / 3', display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
              <AgentsOnline theme={theme} t={t} />
              {tweaks.showQuickPropose && (
                <QuickPropose theme={theme} t={t} onSubmit={() => setTweak('state', 'active')} />
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 4px 4px',
            fontSize: 10.5, color: theme.textFaint,
            fontFamily: 'var(--font-mono)', letterSpacing: 0.3,
            borderTop: `1px solid ${theme.borderSoft}`,
            marginTop: 4,
          }}>
            {tweaks.showStatsStrip && <StatsStrip theme={theme} t={t} />}
            <div style={{ flex: 1 }} />
            <span>{t.notFinAdvice}</span>
          </div>

          {/* Tweaks panel — only on the master artboard (no overrides) */}
          {Object.keys(overrides).length === 0 && (
          <TweaksPanel title="Tweaks" defaults={TWEAK_DEFAULTS} tweaks={tweaks} setTweak={setTweak}>
            <TweakSection title="State">
              <TweakRadio label="Council" value={tweaks.state} onChange={v => setTweak('state', v)}
                options={[
                  { value: 'idle', label: 'Idle' },
                  { value: 'active', label: 'Active' },
                  { value: 'post-verdict', label: 'Post-verdict' },
                ]} />
            </TweakSection>
            <TweakSection title="Display">
              <TweakRadio label="Theme" value={tweaks.themeMode} onChange={v => setTweak('themeMode', v)}
                options={[{ value: 'dark', label: 'Dark' }, { value: 'light', label: 'Light' }]} />
              <TweakRadio label="Language" value={tweaks.locale} onChange={v => setTweak('locale', v)}
                options={[{ value: 'en', label: 'EN' }, { value: 'pl', label: 'PL' }]} />
              <TweakToggle label="Stats strip" value={tweaks.showStatsStrip} onChange={v => setTweak('showStatsStrip', v)} />
              <TweakToggle label="Quick propose" value={tweaks.showQuickPropose} onChange={v => setTweak('showQuickPropose', v)} />
            </TweakSection>
          </TweaksPanel>
          )}

        </div>
      </div>
    </div>
  );
}

Object.assign(window, { VariantDash });
