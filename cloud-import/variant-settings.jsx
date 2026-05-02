// Settings (Component 6) — governance rules, execution thresholds, agent roster.
// Single file, several sections. Sidebar nav + content panel layout.

const settingsStyles = {
  shell: {
    width: '100%', height: '100%',
    background: 'oklch(0.16 0.022 255)',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)',
    display: 'grid', gridTemplateColumns: '240px 1fr',
    overflow: 'hidden',
  },
  sidebar: {
    background: 'oklch(0.18 0.025 255)',
    borderRight: '1px solid oklch(0.28 0.028 255)',
    padding: '20px 14px',
    display: 'flex', flexDirection: 'column', gap: 4,
    overflowY: 'auto',
  },
  brand: {
    fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700,
    letterSpacing: '0.04em', padding: '4px 10px 18px',
    color: 'oklch(0.96 0.006 255)',
  },
  navGroup: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'oklch(0.50 0.014 255)',
    padding: '14px 10px 6px',
  },
  navItem: {
    padding: '8px 12px', borderRadius: 4,
    fontSize: 12.5, fontWeight: 500, color: 'oklch(0.78 0.012 255)',
    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
  },
  navItemActive: {
    background: 'oklch(0.24 0.030 255)',
    color: 'oklch(0.96 0.006 255)',
    fontWeight: 600,
  },
  main: { overflowY: 'auto', padding: '32px 40px 60px' },
  pageHead: {
    display: 'flex', alignItems: 'flex-end', gap: 16,
    paddingBottom: 20, borderBottom: '1px solid oklch(0.28 0.028 255)',
    marginBottom: 28,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 600,
    letterSpacing: '-0.01em', margin: 0, color: 'oklch(0.97 0.008 255)',
  },
  pageSub: { fontSize: 13, color: 'oklch(0.66 0.014 255)', lineHeight: 1.5, margin: 0, marginTop: 4 },
  section: {
    background: 'oklch(0.20 0.025 255)',
    border: '1px solid oklch(0.28 0.028 255)',
    borderRadius: 8, marginBottom: 20,
    overflow: 'hidden',
  },
  sectionHead: {
    padding: '16px 22px', borderBottom: '1px solid oklch(0.28 0.028 255)',
    display: 'flex', alignItems: 'center', gap: 12,
  },
  sectionTitle: {
    fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600,
    color: 'oklch(0.96 0.006 255)', letterSpacing: '-0.005em',
  },
  sectionMeta: {
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase',
    color: 'oklch(0.56 0.014 255)', marginLeft: 'auto',
  },
  sectionBody: { padding: '18px 22px' },
  // Form rows
  formRow: {
    display: 'grid', gridTemplateColumns: '220px 1fr',
    gap: 24, alignItems: 'flex-start',
    padding: '14px 0', borderBottom: '1px solid oklch(0.26 0.025 255)',
  },
  formLabel: {
    fontSize: 13, fontWeight: 500, color: 'oklch(0.92 0.008 255)',
  },
  formHelp: { fontSize: 11.5, color: 'oklch(0.62 0.014 255)', marginTop: 3, lineHeight: 1.4 },
  // Inputs
  input: {
    background: 'oklch(0.18 0.025 255)',
    border: '1px solid oklch(0.30 0.030 255)',
    borderRadius: 4, padding: '8px 12px',
    color: 'oklch(0.96 0.006 255)',
    fontFamily: 'var(--font-sans)', fontSize: 12.5, outline: 'none',
    width: '100%',
  },
  inputMono: { fontFamily: 'var(--font-mono)' },
  // Toggle
  toggle: (on) => ({
    width: 36, height: 20, borderRadius: 10,
    background: on ? 'oklch(0.55 0.16 152)' : 'oklch(0.30 0.030 255)',
    position: 'relative', cursor: 'pointer',
    transition: 'background .15s',
  }),
  toggleKnob: (on) => ({
    width: 14, height: 14, borderRadius: 7, background: 'oklch(0.97 0.008 255)',
    position: 'absolute', top: 3, left: on ? 19 : 3,
    transition: 'left .15s',
  }),
  // Buttons
  btn: {
    padding: '7px 14px', borderRadius: 4,
    background: 'transparent', border: '1px solid oklch(0.40 0.030 255)',
    color: 'oklch(0.92 0.008 255)',
    fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
    letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer',
  },
  btnPrimary: {
    background: 'oklch(0.55 0.16 152)', borderColor: 'oklch(0.55 0.16 152)',
    color: 'oklch(0.10 0.02 152)',
  },
  btnDanger: {
    color: 'oklch(0.78 0.18 22)', borderColor: 'oklch(0.55 0.16 22)',
  },
};

function Toggle({ value, onChange }) {
  return (
    <div style={settingsStyles.toggle(value)} onClick={() => onChange(!value)}>
      <div style={settingsStyles.toggleKnob(value)} />
    </div>
  );
}

function FormRow({ label, help, children }) {
  return (
    <div style={settingsStyles.formRow}>
      <div>
        <div style={settingsStyles.formLabel}>{label}</div>
        {help && <div style={settingsStyles.formHelp}>{help}</div>}
      </div>
      <div>{children}</div>
    </div>
  );
}

function SettingsTopBar() {
  return (
    <div style={{
      gridColumn: '1 / -1',
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 22px', borderBottom: '1px solid oklch(0.28 0.028 255)',
      fontFamily: 'var(--font-mono)', fontSize: 11,
      background: 'oklch(0.20 0.025 255)',
    }}>
      <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
      <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
      <span style={{ color: 'oklch(0.78 0.012 255)' }}>SETTINGS</span>
      <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, color: 'oklch(0.66 0.014 255)' }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.74 0.16 152)' }} />
        Last saved: just now · v0.4.2
      </span>
    </div>
  );
}

// — Rules Engine ————————————————————————————————————————————

function RulesSection() {
  const [rules, setRules] = React.useState({
    softCapPct: 5, hardCapPct: 15, perAssetMaxPct: 30,
    quorum: 3, threshold: 60, minTrust: 70,
    debateTimeout: 90, autoArchive: true,
  });
  return (
    <div style={settingsStyles.section}>
      <div style={settingsStyles.sectionHead}>
        <span style={settingsStyles.sectionTitle}>Rules engine</span>
        <span style={settingsStyles.sectionMeta}>v0.4 · 12 rules active</span>
      </div>
      <div style={settingsStyles.sectionBody}>
        <FormRow label="Soft cap per protocol" help="Warns council when concentration exceeds threshold. Can be waived with HITL signoff.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={rules.softCapPct} onChange={(e) => setRules({ ...rules, softCapPct: +e.target.value })} style={{ ...settingsStyles.input, width: 100 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)' }}>% of treasury</span>
          </div>
        </FormRow>
        <FormRow label="Hard cap per protocol" help="Blocks proposal regardless of agent votes. Cannot be waived.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={rules.hardCapPct} onChange={(e) => setRules({ ...rules, hardCapPct: +e.target.value })} style={{ ...settingsStyles.input, width: 100 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)' }}>% of treasury</span>
          </div>
        </FormRow>
        <FormRow label="Per-asset hard cap" help="Maximum concentration in any single asset (e.g. all USDC across protocols).">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={rules.perAssetMaxPct} onChange={(e) => setRules({ ...rules, perAssetMaxPct: +e.target.value })} style={{ ...settingsStyles.input, width: 100 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)' }}>% of treasury</span>
          </div>
        </FormRow>
        <FormRow label="Quorum" help="Minimum agent votes required to reach a verdict.">
          <input type="number" value={rules.quorum} onChange={(e) => setRules({ ...rules, quorum: +e.target.value })} style={{ ...settingsStyles.input, width: 100 }} />
        </FormRow>
        <FormRow label="Pass threshold" help="% FOR votes (of non-abstain) needed to pass. 60% = supermajority.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={rules.threshold} onChange={(e) => setRules({ ...rules, threshold: +e.target.value })} style={{ ...settingsStyles.input, width: 100 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)' }}>%</span>
          </div>
        </FormRow>
        <FormRow label="Minimum agent trust" help="Agents below this trust score are excluded from quorum (still allowed to comment).">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={rules.minTrust} onChange={(e) => setRules({ ...rules, minTrust: +e.target.value })} style={{ ...settingsStyles.input, width: 100 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)' }}>/100</span>
          </div>
        </FormRow>
        <FormRow label="Debate timeout" help="If verdict not reached within this duration, falls back to majority of votes-cast-so-far.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" value={rules.debateTimeout} onChange={(e) => setRules({ ...rules, debateTimeout: +e.target.value })} style={{ ...settingsStyles.input, width: 100 }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.66 0.014 255)' }}>seconds</span>
          </div>
        </FormRow>
        <FormRow label="Auto-archive verdicts" help="All verdicts archived to 0G storage with content-addressed CID. Can be disabled but not recommended.">
          <Toggle value={rules.autoArchive} onChange={(v) => setRules({ ...rules, autoArchive: v })} />
        </FormRow>
      </div>
    </div>
  );
}

// — Execution thresholds ————————————————————————————————————

function ExecutionTiers() {
  const tiers = [
    { id: 'auto',   label: 'Auto-execute',     range: '< $10,000',    color: 'oklch(0.74 0.16 152)', signers: 0, desc: 'Verdict + quorum is enough. Tx signed by treasury bot. Use for small recurring ops.' },
    { id: 'multi',  label: 'Multisig 3-of-5',  range: '$10k - $100k', color: 'oklch(0.82 0.14 75)',  signers: 3, desc: 'Council convenes, multisig signers must approve before execution. Most positions.' },
    { id: 'guard',  label: 'Multisig 5-of-7',  range: '$100k - $1M',  color: 'oklch(0.74 0.15 245)', signers: 5, desc: 'Larger pool of signers, longer timelock (24h). For meaningful treasury moves.' },
    { id: 'manual', label: 'Manual + DAO vote', range: '> $1M',       color: 'oklch(0.70 0.18 22)',  signers: 9, desc: 'Forum thread + on-chain governance proposal + 7d timelock. Council vote becomes advisory.' },
  ];
  return (
    <div style={settingsStyles.section}>
      <div style={settingsStyles.sectionHead}>
        <span style={settingsStyles.sectionTitle}>Execution thresholds</span>
        <span style={settingsStyles.sectionMeta}>4 tiers · USD-denominated</span>
      </div>
      <div style={settingsStyles.sectionBody}>
        <p style={{ fontSize: 12, color: 'oklch(0.66 0.014 255)', marginTop: 0, marginBottom: 16, lineHeight: 1.5 }}>
          Defines who has to approve a verdict before it executes on-chain, based on USD size of the action. Larger size → more friction.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {tiers.map((t) => (
            <div key={t.id} style={{
              display: 'grid', gridTemplateColumns: '12px 200px 160px 1fr auto',
              gap: 14, alignItems: 'center',
              padding: '14px 16px', borderRadius: 6,
              background: 'oklch(0.18 0.025 255)',
              border: '1px solid oklch(0.30 0.030 255)',
              borderLeft: `3px solid ${t.color}`,
            }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, background: t.color, boxShadow: `0 0 8px ${t.color}` }} />
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'oklch(0.96 0.006 255)' }}>{t.label}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.56 0.014 255)', marginTop: 2 }}>{t.signers ? `${t.signers} signers required` : 'no human required'}</div>
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 600, color: t.color }}>{t.range}</div>
              <div style={{ fontSize: 12, color: 'oklch(0.78 0.012 255)', lineHeight: 1.45 }}>{t.desc}</div>
              <button style={settingsStyles.btn}>Edit</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// — Agent roster ——————————————————————————————————————————————

function AgentsSection() {
  const agents = [
    { ens: 'risk.aicouncil.eth',      label: 'Risk Officer', enabled: true,  weight: 1.2, model: 'claude-3.7-sonnet', trust: 91 },
    { ens: 'bull.aicouncil.eth',      label: 'Bull Case',    enabled: true,  weight: 1.0, model: 'gpt-4-turbo',       trust: 78 },
    { ens: 'bear.aicouncil.eth',      label: 'Bear Case',    enabled: true,  weight: 1.0, model: 'claude-3.7-sonnet', trust: 88 },
    { ens: 'tech.aicouncil.eth',      label: 'Tech Auditor', enabled: true,  weight: 1.1, model: 'claude-3.7-sonnet', trust: 85 },
    { ens: 'sentiment.aicouncil.eth', label: 'Sentiment',    enabled: false, weight: 0.6, model: 'gpt-4o-mini',       trust: 64 },
  ];
  return (
    <div style={settingsStyles.section}>
      <div style={settingsStyles.sectionHead}>
        <span style={settingsStyles.sectionTitle}>Agent roster</span>
        <span style={settingsStyles.sectionMeta}>{agents.filter(a => a.enabled).length} active · {agents.length} total</span>
        <button style={{ ...settingsStyles.btn, marginLeft: 12 }}>+ Add agent</button>
      </div>
      <div style={settingsStyles.sectionBody}>
        <div style={{
          display: 'grid', gridTemplateColumns: '40px 1fr 110px 100px 120px 70px 100px',
          gap: 12, padding: '8px 14px', alignItems: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'oklch(0.50 0.014 255)', borderBottom: '1px solid oklch(0.28 0.028 255)',
          marginBottom: 4,
        }}>
          <span>On</span><span>Agent</span><span>Vote weight</span><span>Trust</span><span>LLM model</span><span>Trace</span><span>Actions</span>
        </div>
        {agents.map((a) => (
          <div key={a.ens} style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 110px 100px 120px 70px 100px',
            gap: 12, padding: '12px 14px', alignItems: 'center',
            background: a.enabled ? 'oklch(0.18 0.025 255)' : 'transparent',
            border: '1px solid oklch(0.28 0.028 255)',
            borderRadius: 4, marginBottom: 4,
            opacity: a.enabled ? 1 : 0.6,
          }}>
            <Toggle value={a.enabled} onChange={() => {}} />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: 'oklch(0.96 0.006 255)' }}>{a.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.56 0.014 255)', marginTop: 2 }}>{a.ens}</div>
            </div>
            <input type="number" defaultValue={a.weight} step="0.1" style={{ ...settingsStyles.input, ...settingsStyles.inputMono, width: 90, padding: '4px 8px', fontSize: 11 }} />
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 600, color: a.trust >= 85 ? 'oklch(0.74 0.16 152)' : a.trust >= 70 ? 'oklch(0.82 0.14 75)' : 'oklch(0.70 0.18 22)' }}>{a.trust}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.56 0.014 255)' }}>/100</span>
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.78 0.012 255)' }}>{a.model}</div>
            <button style={{ ...settingsStyles.btn, padding: '4px 8px', fontSize: 9 }}>View</button>
            <button style={{ ...settingsStyles.btn, padding: '4px 8px', fontSize: 9 }}>Configure</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// — Wallet / multisig ————————————————————————————————————————

function WalletSection() {
  return (
    <div style={settingsStyles.section}>
      <div style={settingsStyles.sectionHead}>
        <span style={settingsStyles.sectionTitle}>Treasury &amp; multisig</span>
        <span style={settingsStyles.sectionMeta}>Safe v1.4 · Base</span>
      </div>
      <div style={settingsStyles.sectionBody}>
        <FormRow label="Treasury address" help="Multisig that holds DAO assets. All council actions execute against this.">
          <input value="treasury.aicouncil.eth · 0xae…3f1c" readOnly style={{ ...settingsStyles.input, ...settingsStyles.inputMono }} />
        </FormRow>
        <FormRow label="Default multisig threshold" help="Default signers required for tier-2 ($10k-$100k) actions. Per-tier overrides in Execution.">
          <input value="3 of 5" readOnly style={{ ...settingsStyles.input, ...settingsStyles.inputMono, width: 120 }} />
        </FormRow>
        <FormRow label="Network" help="Primary network for execution. Cross-chain actions trigger bridge intent.">
          <input value="Base Sepolia (testnet)" readOnly style={{ ...settingsStyles.input, ...settingsStyles.inputMono, width: 240 }} />
        </FormRow>
        <FormRow label="Governor contract" help="On-chain governance shim. Ratifies multisig actions on the public ledger.">
          <input value="0x4a…7d92" readOnly style={{ ...settingsStyles.input, ...settingsStyles.inputMono, width: 200 }} />
        </FormRow>
      </div>
    </div>
  );
}

// — Notifications ———————————————————————————————————————————

function NotificationsSection() {
  const channels = [
    { id: 'email', label: 'Email', target: 'team@aicouncil.eth', enabled: true },
    { id: 'tg', label: 'Telegram', target: '@aicouncil_bot', enabled: true },
    { id: 'discord', label: 'Discord', target: '#proposals (1247 members)', enabled: false },
    { id: 'farcaster', label: 'Farcaster', target: '@aicouncil', enabled: false },
    { id: 'webhook', label: 'Webhook', target: 'https://api.aicouncil.eth/hook', enabled: true },
  ];
  return (
    <div style={settingsStyles.section}>
      <div style={settingsStyles.sectionHead}>
        <span style={settingsStyles.sectionTitle}>Notifications</span>
        <span style={settingsStyles.sectionMeta}>3 channels active</span>
      </div>
      <div style={settingsStyles.sectionBody}>
        {channels.map((c) => (
          <div key={c.id} style={{
            display: 'grid', gridTemplateColumns: '40px 120px 1fr auto',
            gap: 12, padding: '12px 14px', alignItems: 'center',
            borderBottom: '1px solid oklch(0.26 0.025 255)',
          }}>
            <Toggle value={c.enabled} onChange={() => {}} />
            <div style={{ fontWeight: 600, fontSize: 13, color: 'oklch(0.96 0.006 255)' }}>{c.label}</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'oklch(0.78 0.012 255)' }}>{c.target}</div>
            <button style={settingsStyles.btn}>Configure</button>
          </div>
        ))}
      </div>
    </div>
  );
}

// — Danger zone —————————————————————————————————————————————

function DangerZone() {
  return (
    <div style={{ ...settingsStyles.section, borderColor: 'oklch(0.40 0.16 22)' }}>
      <div style={{ ...settingsStyles.sectionHead, borderColor: 'oklch(0.40 0.16 22)' }}>
        <span style={{ ...settingsStyles.sectionTitle, color: 'oklch(0.78 0.18 22)' }}>Danger zone</span>
      </div>
      <div style={settingsStyles.sectionBody}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid oklch(0.26 0.025 255)' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: 'oklch(0.96 0.006 255)' }}>Pause council</div>
            <div style={settingsStyles.formHelp}>All proposals frozen. Existing positions remain active. Safe-emergency mode.</div>
          </div>
          <button style={{ ...settingsStyles.btn, ...settingsStyles.btnDanger }}>Pause</button>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 500, fontSize: 13, color: 'oklch(0.96 0.006 255)' }}>Withdraw all to safe wallet</div>
            <div style={settingsStyles.formHelp}>Liquidates open positions and routes all assets to a recovery address. Irreversible.</div>
          </div>
          <button style={{ ...settingsStyles.btn, ...settingsStyles.btnDanger }}>Initiate withdrawal</button>
        </div>
      </div>
    </div>
  );
}

// — Variant ————————————————————————————————————————————————

function VariantSettings({ overrides = {} }) {
  const tab = overrides.tab || 'rules';
  const tabs = [
    { id: 'rules',         label: 'Rules engine',     group: 'Governance' },
    { id: 'execution',     label: 'Execution tiers',  group: 'Governance' },
    { id: 'agents',        label: 'Agent roster',     group: 'Governance' },
    { id: 'wallet',        label: 'Treasury & wallet', group: 'Governance' },
    { id: 'notifications', label: 'Notifications',    group: 'Workspace' },
    { id: 'whitelist',     label: 'Protocol registry',group: 'Workspace' },
    { id: 'logs',          label: 'Activity log',     group: 'Workspace' },
    { id: 'api',           label: 'API & webhooks',   group: 'Workspace' },
    { id: 'danger',        label: 'Danger zone',      group: 'Critical' },
  ];

  let content;
  if (tab === 'rules')              content = <><RulesSection /></>;
  else if (tab === 'execution')     content = <><ExecutionTiers /></>;
  else if (tab === 'agents')        content = <><AgentsSection /></>;
  else if (tab === 'wallet')        content = <><WalletSection /></>;
  else if (tab === 'notifications') content = <><NotificationsSection /></>;
  else if (tab === 'danger')        content = <><DangerZone /></>;
  else if (tab === 'all')           content = <><RulesSection /><ExecutionTiers /><AgentsSection /><WalletSection /><NotificationsSection /><DangerZone /></>;
  else content = <div style={{ color: 'oklch(0.66 0.014 255)', fontStyle: 'italic' }}>Section not yet wired in this mockup.</div>;

  const activeTab = tabs.find(x => x.id === tab) || tabs[0];

  // Group nav
  const groups = ['Governance', 'Workspace', 'Critical'];

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', background: 'oklch(0.16 0.022 255)' }}>
      <SettingsTopBar />
      <div style={settingsStyles.shell}>
        <aside style={settingsStyles.sidebar}>
          <div style={settingsStyles.brand}>Settings</div>
          {groups.map((g) => (
            <React.Fragment key={g}>
              <div style={settingsStyles.navGroup}>{g}</div>
              {tabs.filter(x => x.group === g).map((x) => (
                <div key={x.id} style={{
                  ...settingsStyles.navItem,
                  ...(x.id === tab ? settingsStyles.navItemActive : {}),
                  ...(x.id === 'danger' ? { color: 'oklch(0.78 0.18 22)' } : {}),
                }}>{x.label}</div>
              ))}
            </React.Fragment>
          ))}
        </aside>
        <main style={settingsStyles.main}>
          <div style={settingsStyles.pageHead}>
            <div>
              <h1 style={settingsStyles.pageTitle}>{activeTab.label}</h1>
              <p style={settingsStyles.pageSub}>
                {tab === 'rules' && 'Hard caps, quorum, thresholds. These rules are checked by the Risk agent on every proposal — failures block execution before any vote happens.'}
                {tab === 'execution' && 'How verdicts get to the chain. Friction scales with USD size. Auto-execute for small ops, multisig for treasury moves, DAO vote for the largest.'}
                {tab === 'agents' && 'Council members and their LLM models. Agents below minimum trust are excluded from quorum but can still comment.'}
                {tab === 'wallet' && 'Where the money lives. The treasury multisig and the on-chain governor that ratifies council decisions.'}
                {tab === 'notifications' && 'Where proposal events get pushed. Email for humans, webhook for ops, social for the DAO.'}
                {tab === 'danger' && 'Operations that pause the council or move funds to a recovery wallet. Use only in emergency.'}
                {tab === 'all' && 'Everything in one scroll — useful for snapshot review.'}
              </p>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
              <button style={settingsStyles.btn}>Discard</button>
              <button style={{ ...settingsStyles.btn, ...settingsStyles.btnPrimary }}>Save changes</button>
            </div>
          </div>
          {content}
        </main>
      </div>
    </div>
  );
}

window.VariantSettings = VariantSettings;
