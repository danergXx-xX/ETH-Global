// Onboarding Flow (Component 6) — pierwszy raz user.
// 4-step wizard: connect wallet → verify DAO membership → read rules → first proposal.
// State variants via `step` prop: 1 | 2 | 3 | 4 | 'completed'

const ONBOARDING_STEPS = [
  { num: 1, label: 'Connect wallet',  hint: 'Coinbase, Rainbow, MetaMask, or any WalletConnect.' },
  { num: 2, label: 'Verify DAO',     hint: 'Your wallet must hold AICOUNCIL tokens to participate.' },
  { num: 3, label: 'Read rules',     hint: 'Council operates within hard-coded constraints. Quick scan, then accept.' },
  { num: 4, label: 'First proposal', hint: 'Submit your first treasury allocation proposal. Council convenes.' },
];

const obStyles = {
  card: {
    width: '100%', height: '100%',
    background: 'oklch(0.18 0.025 255)',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  hero: {
    padding: '40px 40px 0',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    flexShrink: 0,
  },
  heroTitle: {
    fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 600,
    lineHeight: 1.1, color: 'oklch(0.97 0.008 255)',
    marginTop: 18, marginBottom: 6, textAlign: 'center',
  },
  heroSub: {
    fontFamily: 'var(--font-sans)', fontSize: 14,
    color: 'oklch(0.78 0.012 255)', textAlign: 'center', maxWidth: 460,
  },
  // Progress dots
  dotsRow: {
    display: 'flex', justifyContent: 'center', gap: 12,
    margin: '32px 0 24px',
  },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    display: 'grid', placeItems: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
    transition: 'all .25s',
  },
  // Step body
  stepBody: {
    flex: 1, padding: '0 40px 24px',
    overflowY: 'auto',
    display: 'flex', flexDirection: 'column', gap: 14,
  },
  walletOption: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px', borderRadius: 8,
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    cursor: 'pointer',
  },
  walletIcon: {
    width: 40, height: 40, borderRadius: 10,
    display: 'grid', placeItems: 'center',
    fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700,
  },
  // Footer
  footer: {
    padding: '16px 40px',
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'oklch(0.20 0.025 255)',
    borderTop: '1px solid oklch(0.30 0.030 255)',
    flexShrink: 0,
  },
  btn: {
    padding: '10px 18px', borderRadius: 4,
    background: 'transparent',
    border: '1px solid oklch(0.40 0.030 255)',
    color: 'oklch(0.92 0.008 255)',
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer',
  },
  btnPrimary: {
    background: 'oklch(0.78 0.14 75)', borderColor: 'oklch(0.78 0.14 75)',
    color: 'oklch(0.18 0.04 75)',
  },
};

function StepDots({ activeStep }) {
  return (
    <div style={obStyles.dotsRow}>
      {ONBOARDING_STEPS.map((s) => {
        const isActive = s.num === activeStep;
        const isDone = s.num < activeStep;
        const style = isDone
          ? { background: 'oklch(0.74 0.16 152)', color: 'oklch(0.18 0.04 152)', border: '2px solid oklch(0.74 0.16 152)' }
          : isActive
          ? { background: 'oklch(0.78 0.14 75)', color: 'oklch(0.18 0.04 75)', border: '2px solid oklch(0.78 0.14 75)', boxShadow: '0 0 12px oklch(0.78 0.14 75)' }
          : { background: 'oklch(0.22 0.028 255)', color: 'oklch(0.66 0.014 255)', border: '2px solid oklch(0.30 0.030 255)' };
        return <div key={s.num} style={{ ...obStyles.dot, ...style }}>{isDone ? '✓' : s.num}</div>;
      })}
    </div>
  );
}

function Step1({}) {
  const wallets = [
    { id: 'cb', name: 'Coinbase Wallet', hint: 'Recommended for new users', bg: 'oklch(0.55 0.18 245)', fg: 'oklch(0.96 0.06 245)' },
    { id: 'rb', name: 'Rainbow', hint: 'Mobile-first, beginner-friendly', bg: 'linear-gradient(135deg, oklch(0.70 0.20 30) 0%, oklch(0.65 0.22 305) 100%)', fg: 'oklch(0.96 0.06 305)' },
    { id: 'mm', name: 'MetaMask', hint: 'Browser extension', bg: 'oklch(0.62 0.18 60)', fg: 'oklch(0.96 0.05 60)' },
    { id: 'wc', name: 'WalletConnect', hint: 'Any other wallet', bg: 'oklch(0.55 0.16 245)', fg: 'oklch(0.96 0.06 245)' },
  ];
  return wallets.map((w) => (
    <div key={w.id} style={obStyles.walletOption}>
      <div style={{ ...obStyles.walletIcon, background: w.bg, color: w.fg }}>{w.name[0]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{w.name}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)', marginTop: 2 }}>{w.hint}</div>
      </div>
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'oklch(0.78 0.012 255)' }}>→</span>
    </div>
  ));
}

function Step2({}) {
  return (
    <>
      <div style={{
        padding: '20px 24px', borderRadius: 8,
        background: 'linear-gradient(135deg, oklch(0.24 0.06 152) 0%, oklch(0.20 0.025 255) 100%)',
        border: '1px solid oklch(0.55 0.16 152)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <span style={{ width: 28, height: 28, borderRadius: 14, background: 'oklch(0.74 0.16 152)', color: 'oklch(0.18 0.04 152)', display: 'grid', placeItems: 'center', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700 }}>✓</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600 }}>You hold 1,250 AICOUNCIL tokens</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)' }}>
          Voting power: 1.25%. Proposal creation threshold: 100 tokens. You qualify.
        </div>
      </div>
      <div style={{
        padding: '14px 18px', borderRadius: 6,
        background: 'oklch(0.22 0.028 255)',
        border: '1px solid oklch(0.30 0.030 255)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.66 0.014 255)', marginBottom: 6 }}>Wallet connected</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'oklch(0.92 0.008 255)' }}>0xa1b2c3d4...e5f6</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: 'oklch(0.78 0.012 255)', marginTop: 4 }}>Network: Base Sepolia (84532)</div>
      </div>
    </>
  );
}

function Step3({}) {
  const summary = [
    { k: 'Hard cap per protocol',    v: '15%' },
    { k: 'Hard cap per asset',       v: '30%' },
    { k: 'Soft cap per protocol',    v: '7% (HITL waiver)' },
    { k: 'Quorum',                  v: '3 of 5 agents' },
    { k: 'Pass threshold',          v: '60% confidence' },
    { k: 'Timelock delay',          v: '48h after multisig' },
  ];
  return (
    <>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'oklch(0.86 0.012 255)', lineHeight: 1.5, marginBottom: 8 }}>
        Council operates within hard-coded constraints. These can be amended by HITL multisig but never bypassed by an agent.
      </div>
      {summary.map((s, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 14px', borderRadius: 4, background: 'oklch(0.22 0.028 255)', border: '1px solid oklch(0.30 0.030 255)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'oklch(0.86 0.012 255)' }}>{s.k}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'oklch(0.92 0.008 255)' }}>{s.v}</span>
        </div>
      ))}
      <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, fontSize: 12.5, color: 'oklch(0.86 0.012 255)' }}>
        <input type="checkbox" />
        I understand and accept Council Rules v0.4
      </label>
    </>
  );
}

function Step4({}) {
  return (
    <>
      <textarea placeholder="Describe your treasury allocation in plain English..." rows={6} style={{
        width: '100%', padding: 14, borderRadius: 6,
        background: 'oklch(0.16 0.020 255)',
        border: '1px solid oklch(0.30 0.030 255)',
        color: 'oklch(0.96 0.006 255)',
        fontFamily: 'var(--font-sans)', fontSize: 13, lineHeight: 1.5,
        outline: 'none', resize: 'vertical',
      }} defaultValue="" />
      <div style={{
        padding: '14px 18px', borderRadius: 6,
        background: 'color-mix(in oklch, oklch(0.78 0.14 75) 12%, transparent)',
        border: '1px solid color-mix(in oklch, oklch(0.78 0.14 75) 40%, transparent)',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.86 0.10 75)', marginBottom: 4 }}>Tip</div>
        <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'oklch(0.86 0.012 255)' }}>Try: "Allocate 50,000 USDC to Aave v3 supply for 30 days, expected APY 4.2%."</div>
      </div>
    </>
  );
}

function StepCompleted({}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 60, textAlign: 'center' }}>
      <div style={{
        width: 80, height: 80, borderRadius: 40,
        background: 'linear-gradient(135deg, oklch(0.74 0.16 152) 0%, oklch(0.55 0.16 152) 100%)',
        boxShadow: '0 0 40px oklch(0.74 0.16 152)',
        display: 'grid', placeItems: 'center',
        fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 700,
        color: 'oklch(0.18 0.04 152)',
        marginBottom: 20,
      }}>✓</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 600, color: 'oklch(0.97 0.008 255)' }}>
        Welcome to Conclave
      </div>
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'oklch(0.78 0.012 255)', marginTop: 8, maxWidth: 380 }}>
        Council convenes on your first proposal. Live debate starts in seconds.
      </div>
    </div>
  );
}

function VariantOnboarding({ overrides = {} }) {
  const step = overrides.step || 1;

  const isCompleted = step === 'completed';
  const stepDef = isCompleted ? {} : (ONBOARDING_STEPS[step - 1] || {});

  return (
    <div style={obStyles.card}>
      <div style={obStyles.hero}>
        {!isCompleted && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, color: 'oklch(0.96 0.006 255)', fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 700, letterSpacing: 1.5 }}>
            <div style={{ width: 40, height: 40, borderRadius: 20, background: 'oklch(0.78 0.13 252)', display: 'grid', placeItems: 'center', color: 'oklch(0.18 0.025 255)' }}>●</div>
            CONCLAVE
          </div>
        )}
        {!isCompleted && (
          <>
            <h2 style={obStyles.heroTitle}>{stepDef.label}</h2>
            <p style={obStyles.heroSub}>{stepDef.hint}</p>
            <StepDots activeStep={step} />
          </>
        )}
      </div>

      <div style={obStyles.stepBody}>
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}
        {step === 4 && <Step4 />}
        {isCompleted && <StepCompleted />}
      </div>

      <div style={obStyles.footer}>
        {!isCompleted && step > 1 && <button style={obStyles.btn}>← Back</button>}
        <div style={{ flex: 1 }} />
        {!isCompleted && <button style={{ ...obStyles.btn, ...obStyles.btnPrimary }}>{step === 4 ? 'Submit proposal' : 'Continue →'}</button>}
        {isCompleted && <button style={{ ...obStyles.btn, ...obStyles.btnPrimary }}>→ View live debate</button>}
      </div>
    </div>
  );
}

window.VariantOnboarding = VariantOnboarding;
