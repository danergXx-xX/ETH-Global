// Add Custom Agent (Component 9) — modal dla DAO contributors.
// State variants via `state` prop: empty | filled | testing | submitting

const aaStyles = {
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
  body: { flex: 1, overflowY: 'auto', padding: '24px 32px', display: 'flex', flexDirection: 'column', gap: 18 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'oklch(0.66 0.014 255)',
  },
  input: {
    padding: '10px 14px', borderRadius: 4,
    background: 'oklch(0.16 0.020 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)', fontSize: 13,
    outline: 'none',
  },
  hint: {
    fontFamily: 'var(--font-mono)', fontSize: 10,
    color: 'oklch(0.66 0.014 255)',
  },
  // Persona picker
  personaGrid: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 },
  personaTile: {
    padding: '14px 8px', borderRadius: 6,
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    cursor: 'pointer', textAlign: 'center',
    transition: 'all .15s',
  },
  personaTileActive: {
    background: 'color-mix(in oklch, oklch(0.78 0.14 75) 18%, transparent)',
    border: '1px solid oklch(0.78 0.14 75)',
  },
  // Slider
  sliderRow: { display: 'flex', alignItems: 'center', gap: 12 },
  slider: {
    flex: 1, appearance: 'none', height: 4, borderRadius: 2,
    background: 'oklch(0.30 0.030 255)',
    outline: 'none',
  },
  // LLM picker
  llmGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 },
  llmCard: {
    padding: 12, borderRadius: 6,
    background: 'oklch(0.22 0.028 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    cursor: 'pointer',
  },
  // Test arena
  testArena: {
    padding: 16, borderRadius: 8,
    background: 'linear-gradient(135deg, oklch(0.22 0.04 245) 0%, oklch(0.20 0.025 255) 100%)',
    border: '1px solid oklch(0.55 0.14 245)',
    display: 'flex', flexDirection: 'column', gap: 10,
  },
  // Footer
  footer: {
    padding: '16px 32px',
    display: 'flex', alignItems: 'center', gap: 12,
    background: 'oklch(0.20 0.025 255)',
    borderTop: '1px solid oklch(0.30 0.030 255)',
    flexShrink: 0,
  },
  btn: {
    padding: '10px 16px', borderRadius: 4,
    background: 'transparent',
    border: '1px solid oklch(0.40 0.030 255)',
    color: 'oklch(0.92 0.008 255)',
    fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer',
  },
  btnPrimary: { background: 'oklch(0.78 0.14 75)', borderColor: 'oklch(0.78 0.14 75)', color: 'oklch(0.18 0.04 75)' },
};

const PERSONAS = [
  { id: 'bull',      name: 'Bull',      hue: 152 },
  { id: 'bear',      name: 'Bear',      hue: 22 },
  { id: 'risk',      name: 'Risk',      hue: 78 },
  { id: 'tech',      name: 'Tech',      hue: 245 },
  { id: 'sentiment', name: 'Sentiment', hue: 305 },
  { id: 'custom',    name: 'Custom',    hue: 200 },
];

const LLM_MODELS = [
  { id: 'opus',  name: 'Claude Opus 4.7',  desc: 'Highest quality, deep reasoning. ~$0.04/debate.' },
  { id: 'sonnet', name: 'Claude Sonnet 4.6', desc: 'Balanced. ~$0.012/debate. (Recommended)' },
  { id: 'gpt4',  name: 'GPT-4 Turbo',     desc: '~$0.03/debate. Different perspective.' },
  { id: 'gemini', name: 'Gemini Pro 1.5', desc: '~$0.008/debate. Fast.' },
];

function VariantAddAgent({ overrides = {} }) {
  const state = overrides.state || 'empty';
  const filled = state !== 'empty';
  const isTesting = state === 'testing';
  const isSubmitting = state === 'submitting';

  const sampleName = filled ? 'macro.aicouncil.eth' : '';
  const samplePrompt = filled ? 'You are a macroeconomic analyst. Evaluate proposals through the lens of central bank policy, inflation expectations, and capital flows. Cite Fed/ECB statements where relevant.' : '';

  return (
    <div style={aaStyles.card}>
      <div style={aaStyles.topBar}>
        <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
        <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
        <span style={{ color: 'oklch(0.78 0.012 255)' }}>ADD CUSTOM AGENT</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.78 0.14 75)' }} />
          <span>HITL · 5-OF-7 MULTISIG REQUIRED</span>
        </span>
      </div>

      <div style={aaStyles.body}>
        {/* Persona */}
        <div style={aaStyles.field}>
          <label style={aaStyles.label}>Persona type</label>
          <div style={aaStyles.personaGrid}>
            {PERSONAS.map((p) => {
              const isActive = filled && p.id === 'custom';
              return (
                <div key={p.id} style={{ ...aaStyles.personaTile, ...(isActive ? aaStyles.personaTileActive : {}) }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: 16, margin: '0 auto 6px',
                    background: `linear-gradient(135deg, oklch(0.55 0.14 ${p.hue}) 0%, oklch(0.30 0.10 ${p.hue}) 100%)`,
                    boxShadow: `0 0 0 1.5px color-mix(in oklch, oklch(0.74 0.16 ${p.hue}) 60%, white)`,
                  }} />
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{p.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ENS subname */}
        <div style={aaStyles.field}>
          <label style={aaStyles.label}>ENS subname</label>
          <input style={aaStyles.input} placeholder="macro.aicouncil.eth" value={sampleName} readOnly />
          <span style={aaStyles.hint}>Will be deployed under aicouncil.eth (NameStone)</span>
        </div>

        {/* LLM model picker */}
        <div style={aaStyles.field}>
          <label style={aaStyles.label}>LLM model</label>
          <div style={aaStyles.llmGrid}>
            {LLM_MODELS.map((m, i) => {
              const isSelected = filled && i === 1;  // Sonnet recommended
              return (
                <div key={m.id} style={{
                  ...aaStyles.llmCard,
                  ...(isSelected ? aaStyles.personaTileActive : {}),
                }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'oklch(0.92 0.008 255)' }}>{m.name}</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'oklch(0.66 0.014 255)', marginTop: 4 }}>{m.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vote weight + Trust gate */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div style={aaStyles.field}>
            <label style={aaStyles.label}>Vote weight (0.5 - 2.0)</label>
            <div style={aaStyles.sliderRow}>
              <input type="range" min="0.5" max="2.0" step="0.1" defaultValue={filled ? 1.0 : 1.0} style={aaStyles.slider} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'oklch(0.92 0.008 255)', minWidth: 40 }}>1.0</span>
            </div>
            <span style={aaStyles.hint}>Influence in tally vs. baseline (1.0)</span>
          </div>
          <div style={aaStyles.field}>
            <label style={aaStyles.label}>Trust gate</label>
            <div style={aaStyles.sliderRow}>
              <input type="range" min="50" max="95" step="5" defaultValue={filled ? 75 : 70} style={aaStyles.slider} />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'oklch(0.92 0.008 255)', minWidth: 40 }}>75</span>
            </div>
            <span style={aaStyles.hint}>Min trust score to vote</span>
          </div>
        </div>

        {/* System prompt */}
        <div style={aaStyles.field}>
          <label style={aaStyles.label}>System prompt</label>
          <textarea rows={5} style={{ ...aaStyles.input, fontFamily: 'var(--font-sans)', resize: 'vertical' }}
            value={samplePrompt} readOnly />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={aaStyles.hint}>{samplePrompt.length} characters · {Math.ceil(samplePrompt.length / 4)} tokens</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.86 0.10 152)' }}>✓ Within budget</span>
          </div>
        </div>

        {/* Test arena */}
        <div style={aaStyles.testArena}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ ...aaStyles.label, color: 'oklch(0.86 0.10 245)' }}>Test arena</div>
            {isTesting && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.86 0.10 75)' }}>● Running test debate...</span>}
          </div>
          <div style={{ fontFamily: 'var(--font-sans)', fontSize: 12.5, color: 'oklch(0.86 0.012 255)', lineHeight: 1.5 }}>
            Send a sample proposal. Agent debates against existing 5 to verify behavior before deploying live.
          </div>
          {isTesting && (
            <div style={{ padding: 10, background: 'oklch(0.16 0.020 255)', borderRadius: 4, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.78 0.012 255)' }}>
              <div>Test PROP-T01: Allocate 50k USDC to Aave...</div>
              <div style={{ color: 'oklch(0.86 0.10 75)', marginTop: 6 }}>● Macro analyzing... ETA 8s</div>
            </div>
          )}
          {filled && !isTesting && (
            <button style={{ ...aaStyles.btn, alignSelf: 'flex-start' }}>▶ Run test debate</button>
          )}
        </div>
      </div>

      <div style={aaStyles.footer}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)' }}>
          Gas estimate: ~0.08 USDC · Sigs needed: 5 of 7 multisig
        </span>
        <div style={{ flex: 1 }} />
        <button style={aaStyles.btn}>Cancel</button>
        <button style={{ ...aaStyles.btn, ...aaStyles.btnPrimary, opacity: isSubmitting ? 0.6 : 1 }}>
          {isSubmitting ? '⌛ Submitting...' : '+ Submit for multisig'}
        </button>
      </div>
    </div>
  );
}

window.VariantAddAgent = VariantAddAgent;
