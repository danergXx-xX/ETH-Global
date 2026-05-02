// Component 2 — Proposal Submission Form
// State machine: 'empty' | 'noWallet' | 'noPermission' | 'filled' | 'warning' | 'error' | 'submitting' | 'success'
//
// Free-text-first: user writes "allocate 100k mUSDC to Aave v3 for 30 days",
// AI parses into structured fields (action / asset / amount / protocol / target / term)
// and shows them inline. User can edit any field. Then preview + convene.

function VariantForm({ locale, themeMode, theme, t, fixedState, fixedProposal }) {
  const fI = FORM_I18N[locale];
  const sharedI = I18N[locale];
  const tt = { ...sharedI, ...fI };

  // proposal state
  const [free, setFree] = React.useState(fixedProposal?.rationale || '');
  const [proposal, setProposal] = React.useState(fixedProposal || null);
  const [pageState, setPageState] = React.useState(fixedState || 'empty');

  // Derive validation
  const validation = React.useMemo(() => proposal ? validateProposal(proposal) : null, [proposal]);
  const hasError = validation && validation.errors.length > 0;
  const hasWarning = validation && validation.warnings.length > 0;

  // For canvas artboards, we render ONE state per artboard via fixedState/fixedProposal.
  // The interactive playground lives in another artboard.
  const handleParse = (text) => {
    const p = parseFreeText(text, locale);
    setProposal(p);
    setPageState('filled');
  };

  const updateProposal = (patch) => {
    setProposal((p) => ({ ...(p || {}), ...patch }));
  };

  // === Render by state ===
  if (pageState === 'empty') {
    return <FormShell theme={theme} t={tt} locale={locale}
      header={<FormHeader theme={theme} t={tt} step={1} />}>
      <EmptyView theme={theme} t={tt} locale={locale}
        free={free} setFree={setFree}
        onParse={() => handleParse(free)} />
    </FormShell>;
  }

  if (pageState === 'noWallet') {
    return <FormShell theme={theme} t={tt} locale={locale}
      header={<FormHeader theme={theme} t={tt} step={1} dimmed />}>
      <WalletGate theme={theme} t={tt} variant="connect" />
    </FormShell>;
  }

  if (pageState === 'noPermission') {
    return <FormShell theme={theme} t={tt} locale={locale}
      header={<FormHeader theme={theme} t={tt} step={1} dimmed />}>
      <WalletGate theme={theme} t={tt} variant="notMember" />
    </FormShell>;
  }

  if (pageState === 'submitting') {
    return <FormShell theme={theme} t={tt} locale={locale}
      header={<FormHeader theme={theme} t={tt} step={3} />}>
      <SubmittingView theme={theme} t={tt} proposal={proposal} />
    </FormShell>;
  }

  if (pageState === 'success') {
    return <FormShell theme={theme} t={tt} locale={locale}
      header={<FormHeader theme={theme} t={tt} step={3} done />}>
      <SuccessView theme={theme} t={tt} proposal={proposal} />
    </FormShell>;
  }

  // 'filled' / 'warning' / 'error' all use the same structured editor
  return <FormShell theme={theme} t={tt} locale={locale}
    header={<FormHeader theme={theme} t={tt} step={2} />}>
    <FilledView theme={theme} t={tt} locale={locale}
      free={free} setFree={setFree} proposal={proposal}
      updateProposal={updateProposal} validation={validation}
      onConvene={() => setPageState('submitting')} />
  </FormShell>;
}

// ---- Shells & headers ----

function FormShell({ children, theme, t, locale, header }) {
  return <div style={{
    width: '100%', height: '100%',
    background: theme.bg, color: theme.text,
    fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column',
  }}>
    {header}
    <div style={{ flex: 1, overflow: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {children}
    </div>
  </div>;
}

function FormHeader({ theme, t, step, done, dimmed }) {
  return <div style={{
    display: 'flex', alignItems: 'center',
    borderBottom: `1px solid ${theme.border}`, background: theme.bgPanel,
    padding: '12px 18px', gap: 14,
  }}>
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>{t.formTitle}</div>
      <div style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)', marginTop: 1 }}>
        {t.formSubtitle}
      </div>
    </div>
    <div style={{ flex: 1 }} />
    <Stepper step={step} done={done} theme={theme} dimmed={dimmed} />
  </div>;
}

function Stepper({ step, done, theme, dimmed }) {
  const steps = ['Describe', 'Review', 'Convene'];
  return <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: dimmed ? 0.5 : 1 }}>
    {steps.map((s, i) => {
      const idx = i + 1;
      const active = !done && idx === step;
      const past = done || idx < step;
      return <React.Fragment key={s}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <span style={{
            width: 16, height: 16, borderRadius: '50%',
            background: active ? theme.amber : past ? theme.voteFor : 'transparent',
            border: `1px solid ${active ? theme.amber : past ? theme.voteFor : theme.border}`,
            color: active || past ? theme.inverseText : theme.textFaint,
            fontSize: 9.5, fontFamily: 'var(--font-mono)', fontWeight: 700,
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}>{past ? '✓' : idx}</span>
          <span style={{ fontSize: 10.5, color: active ? theme.text : theme.textFaint, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', textTransform: 'uppercase', fontWeight: 600 }}>{s}</span>
        </div>
        {idx < steps.length && <span style={{ width: 14, height: 1, background: theme.border }} />}
      </React.Fragment>;
    })}
  </div>;
}

// ---- Empty state ----

function EmptyView({ theme, t, locale, free, setFree, onParse }) {
  const examples = locale === 'en' ? [
    'allocate 100k mUSDC to Aave v3 for 30 days',
    'send 0.5 ETH to grant.builder.eth',
    'swap 50,000 USDC for ETH on 1inch',
  ] : [
    'wploc 100k mUSDC na Aave v3 na 30 dni',
    'wyslij 0.5 ETH na grant.builder.eth',
    'wymien 50 000 USDC na ETH przez 1inch',
  ];
  return <>
    <div>
      <FLabel theme={theme} hint={<FConfidenceBar value={0} theme={theme} label={t.aiConfidence} />}>
        {t.free}
      </FLabel>
      <FTextArea value={free} onChange={setFree} placeholder={t.placeholder} theme={theme} rows={3} autoFocus />
    </div>

    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {examples.map((ex) => (
        <button key={ex} onClick={() => setFree(ex)} style={{
          padding: '6px 10px', background: 'transparent',
          border: `1px solid ${theme.border}`, borderRadius: 99,
          color: theme.textDim, fontSize: 11.5, fontFamily: 'var(--font-mono)',
          cursor: 'pointer',
        }}>{ex}</button>
      ))}
    </div>

    <div style={{
      padding: '10px 12px', background: theme.bgPanel, border: `1px dashed ${theme.border}`, borderRadius: 4,
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 11.5, color: theme.textDim, fontFamily: 'var(--font-mono)',
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5l1.6 4.4 4.7.3-3.6 3 1.2 4.5L8 11.4l-3.9 2.3 1.2-4.5-3.6-3 4.7-.3z" stroke={theme.amber} strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
      <span>{locale === 'en' ? 'AI parses your text into a structured proposal. You can edit every field afterwards.' : 'AI parsuje tekst na strukturyzowana propozycje. Mozesz edytowac każde pole.'}</span>
    </div>

    <div style={{ flex: 1 }} />

    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
      <button onClick={() => setFree('')} style={btnSecondary(theme)}>{t.cancel}</button>
      <button onClick={onParse} disabled={!free.trim()} style={{
        ...btnPrimary(theme),
        opacity: free.trim() ? 1 : 0.5, cursor: free.trim() ? 'pointer' : 'not-allowed',
      }}>{t.preview} →</button>
    </div>
  </>;
}

// ---- Filled / structured editor ----

function FilledView({ theme, t, locale, free, setFree, proposal, updateProposal, validation, onConvene }) {
  const conf = proposal?.confidence || 0;
  const blocked = validation && validation.errors.length > 0;
  return <>
    <div>
      <FLabel theme={theme} hint={<FConfidenceBar value={conf} theme={theme} label={t.aiConfidence} />}>
        {t.free}
      </FLabel>
      <FTextArea value={free} onChange={setFree} theme={theme} rows={2} />
    </div>

    <div style={{
      padding: '10px 12px', background: `color-mix(in oklch, ${theme.amber} 8%, ${theme.bgPanel})`,
      border: `1px solid color-mix(in oklch, ${theme.amber} 30%, ${theme.border})`,
      borderRadius: 4, display: 'flex', alignItems: 'center', gap: 8,
      fontSize: 11, color: theme.text, fontFamily: 'var(--font-mono)',
    }}>
      <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5l1.6 4.4 4.7.3-3.6 3 1.2 4.5L8 11.4l-3.9 2.3 1.2-4.5-3.6-3 4.7-.3z" fill={theme.amber} />
      </svg>
      <span style={{ color: theme.amber, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{t.aiDraft}</span>
      <span style={{ color: theme.textDim }}>· {t.aiHint}</span>
    </div>

    <div>
      <FLabel theme={theme}>{t.pickAction}</FLabel>
      <FActionCards value={proposal?.action} onChange={(v) => updateProposal({ action: v })} theme={theme} t={t} />
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 12 }}>
      <div>
        <FLabel theme={theme}>{t.asset}</FLabel>
        <FAssetPicker value={proposal?.asset || 'mUSDC'} onChange={(v) => updateProposal({ asset: v })} theme={theme} locale={locale} />
      </div>
      <div>
        <FLabel theme={theme} hint={
          <span style={{ display: 'inline-flex', gap: 4 }}>
            <button onClick={() => {
              const a = TREASURY.assets.find(a => a.sym === (proposal?.asset || 'mUSDC'));
              updateProposal({ amount: a ? a.balance / 2 : 0 });
            }} style={miniBtn(theme)}>{t.half}</button>
            <button onClick={() => {
              const a = TREASURY.assets.find(a => a.sym === (proposal?.asset || 'mUSDC'));
              updateProposal({ amount: a ? a.balance : 0 });
            }} style={miniBtn(theme)}>{t.max}</button>
          </span>
        }>{t.amount}</FLabel>
        <FInput value={proposal?.amount?.toLocaleString() || ''}
          onChange={(v) => updateProposal({ amount: parseFloat(v.replace(/[,\s]/g, '')) || 0 })}
          theme={theme} mono suffix={proposal?.asset || 'mUSDC'}
          error={validation?.errors.some(e => e.key === 'insufficient' || e.key === 'hardCap' || e.key === 'hardProto')} />
      </div>
    </div>

    {(proposal?.action === 'deposit' || proposal?.action === 'swap' || proposal?.action === 'transfer') && (
      <div>
        <FLabel theme={theme}>
          {proposal.action === 'transfer' ? t.target : t.protocol}
        </FLabel>
        {proposal.action === 'transfer' ? (
          <FInput value={proposal.target || ''} onChange={(v) => updateProposal({ target: v })}
            theme={theme} mono placeholder={t.targetPlaceholder} />
        ) : (
          <FProtoPicker action={proposal.action} value={proposal.protocol}
            onChange={(v) => updateProposal({ protocol: v })} theme={theme} locale={locale} />
        )}
      </div>
    )}

    {proposal?.action === 'deposit' && (
      <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 12, alignItems: 'end' }}>
        <div>
          <FLabel theme={theme}>{t.term}</FLabel>
          <FInput value={proposal?.term?.toString() || '30'}
            onChange={(v) => updateProposal({ term: parseInt(v) || 30 })}
            theme={theme} mono suffix={t.days} />
        </div>
        <div style={{ fontSize: 11, color: theme.textFaint, paddingBottom: 10, fontFamily: 'var(--font-mono)' }}>
          {locale === 'en' ? 'Auto-renew unless DAO cancels.' : 'Auto-odnowienie, chyba ze DAO anuluje.'}
        </div>
      </div>
    )}

    <FValidationBanner result={validation} theme={theme} t={t} locale={locale} />

    <FPreviewPanel proposal={proposal} theme={theme} t={t} locale={locale} />

    <div style={{ flex: 1, minHeight: 8 }} />

    <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 6, borderTop: `1px solid ${theme.borderSoft}` }}>
      <Proposer theme={theme} t={t} />
      <div style={{ flex: 1 }} />
      <button style={btnSecondary(theme)}>{t.back}</button>
      {blocked ? (
        <button onClick={() => updateProposal({ amount: TREASURY.assets[0].balance * 0.04 })} style={btnDanger(theme)}>{t.fixIt}</button>
      ) : (
        <button onClick={onConvene} style={btnPrimary(theme)}>{t.convene} →</button>
      )}
    </div>
  </>;
}

function Proposer({ theme, t }) {
  return <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>
    <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'conic-gradient(from 0deg, oklch(0.74 0.16 305), oklch(0.78 0.16 152), oklch(0.82 0.15 75))' }} />
    <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
      <span style={{ color: theme.text, fontWeight: 600 }}>danergy.eth</span>
      <span style={{ color: theme.textFaint }}>{t.youMember} · {t.rep} 92</span>
    </div>
  </div>;
}

// ---- Wallet gates ----

function WalletGate({ theme, t, variant }) {
  const isConnect = variant === 'connect';
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, flex: 1, padding: 24, textAlign: 'center' }}>
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: `color-mix(in oklch, ${isConnect ? theme.amber : theme.voteAgainst} 16%, transparent)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid color-mix(in oklch, ${isConnect ? theme.amber : theme.voteAgainst} 40%, ${theme.border})`,
    }}>
      {isConnect ? (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="6" width="18" height="14" rx="2" stroke={theme.amber} strokeWidth="1.6"/>
          <path d="M16 13a1 1 0 100-2 1 1 0 000 2z" fill={theme.amber} />
          <path d="M3 10h18" stroke={theme.amber} strokeWidth="1.6"/>
        </svg>
      ) : (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke={theme.voteAgainst} strokeWidth="1.6"/>
          <path d="M8 12h8" stroke={theme.voteAgainst} strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      )}
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>
        {isConnect ? t.walletNotConnected : t.notMember}
      </div>
      <div style={{ fontSize: 12.5, color: theme.textDim, marginTop: 6, maxWidth: 360, lineHeight: 1.5 }}>
        {isConnect ? t.walletHint : t.notMemberHint}
      </div>
    </div>
    <div style={{ display: 'flex', gap: 8 }}>
      {isConnect ? (
        <button style={btnPrimary(theme)}>{t.connect} →</button>
      ) : (
        <>
          <button style={btnSecondary(theme)}>{t.switchWallet}</button>
          <button style={btnPrimary(theme)}>{t.memberApply} →</button>
        </>
      )}
    </div>
  </div>;
}

// ---- Submitting / Success ----

function SubmittingView({ theme, t, proposal }) {
  const stages = ['Validating proposal…', 'Allocating PROP-043…', 'Spinning up agents…', 'Awaiting first reasoning…'];
  const [idx, setIdx] = React.useState(0);
  React.useEffect(() => {
    const timer = setInterval(() => setIdx((i) => Math.min(i + 1, stages.length - 1)), 700);
    return () => clearInterval(timer);
  }, []);
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20, flex: 1 }}>
    <div style={{ position: 'relative', width: 64, height: 64 }}>
      <div style={{
        position: 'absolute', inset: 0, borderRadius: '50%',
        border: `2px solid ${theme.border}`, borderTopColor: theme.amber,
        animation: 'spin 0.9s linear infinite',
      }} />
    </div>
    <div style={{ fontSize: 13, color: theme.text, fontFamily: 'var(--font-mono)' }}>{t.submitting}</div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 11, color: theme.textFaint, fontFamily: 'var(--font-mono)', minWidth: 240 }}>
      {stages.map((s, i) => (
        <div key={s} style={{ opacity: i <= idx ? 1 : 0.3, color: i === idx ? theme.amber : theme.textFaint }}>
          [{i < idx ? '✓' : i === idx ? '·' : ' '}] {s}
        </div>
      ))}
    </div>
    <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
  </div>;
}

function SuccessView({ theme, t, proposal }) {
  return <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14, flex: 1, textAlign: 'center' }}>
    <div style={{
      width: 56, height: 56, borderRadius: '50%',
      background: `color-mix(in oklch, ${theme.voteFor} 16%, transparent)`,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      border: `1px solid color-mix(in oklch, ${theme.voteFor} 40%, ${theme.border})`,
    }}>
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M5 12.5l4.5 4.5L19 7" stroke={theme.voteFor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: theme.text, letterSpacing: '-0.01em' }}>{t.success}</div>
      <div style={{ fontSize: 12.5, color: theme.textDim, marginTop: 6, maxWidth: 360, lineHeight: 1.5 }}>
        {t.successHint}
      </div>
    </div>
    <div style={{ fontSize: 10.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>
      PROP-043 · 0xab12…f9c8 · Base Sepolia
    </div>
    <button style={btnPrimary(theme)}>{t.seeDebate} →</button>
  </div>;
}

// ---- Buttons ----

function btnPrimary(theme) {
  return {
    padding: '8px 16px', background: theme.text, color: theme.bg, border: 'none',
    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
    cursor: 'pointer', borderRadius: 3, textTransform: 'uppercase',
  };
}
function btnSecondary(theme) {
  return {
    padding: '8px 14px', background: 'transparent', color: theme.textDim,
    border: `1px solid ${theme.border}`,
    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, letterSpacing: '0.04em',
    cursor: 'pointer', borderRadius: 3, textTransform: 'uppercase',
  };
}
function btnDanger(theme) {
  return {
    padding: '8px 14px', background: theme.voteAgainst, color: theme.inverseText, border: 'none',
    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
    cursor: 'pointer', borderRadius: 3, textTransform: 'uppercase',
  };
}
function miniBtn(theme) {
  return {
    padding: '2px 7px', background: 'transparent', color: theme.textDim,
    border: `1px solid ${theme.border}`, borderRadius: 3,
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    cursor: 'pointer',
  };
}

window.VariantForm = VariantForm;
