// Council Rules JSON Editor (Component 8) — HITL editor dla on-chain rules.
// Sora trust mech #5: Council Rules sa transparentne, edytowalne,
// weryfikowalne on-chain. Alternatywa do form-based Settings.
//
// State variants via state prop: viewing | editing | validating | committing

const RULES_CURRENT = {
  version: '0.4',
  caps: { soft_per_protocol_pct: 7, hard_per_protocol_pct: 15, hard_per_asset_pct: 30 },
  governance: { quorum: 3, pass_threshold_pct: 60, min_agent_trust: 70, debate_timeout_minutes: 30 },
  execution_tiers: { tier_1_max_usd: 10000, tier_2_max_usd: 100000, tier_3_max_usd: 1000000, timelock_delay_hours: 48 },
  whitelisted_protocols: ['aave-v3', 'compound-v3', 'morpho-blue', 'yearn-v3'],
  banned_protocols: ['gmx-arbitrum'],
};

const RULES_DRAFT = {
  ...RULES_CURRENT,
  version: '0.5-draft',
  caps: { ...RULES_CURRENT.caps, soft_per_protocol_pct: 10 },
  governance: { ...RULES_CURRENT.governance, quorum: 4, min_agent_trust: 75 },
  whitelisted_protocols: [...RULES_CURRENT.whitelisted_protocols, 'spark-v1'],
};

const VALIDATION_FINDINGS = [
  { level: 'error', path: 'caps.soft_per_protocol_pct', message: 'Within 15% hard cap. OK.', resolved: true },
  { level: 'warning', path: 'governance.quorum', message: 'Quorum 4 of 5 may delay debates if any agent paused.' },
  { level: 'info', path: 'whitelisted_protocols[+]', message: 'spark-v1 audit confirmed by Spearbit + OpenZeppelin.' },
  { level: 'warning', path: 'governance.min_agent_trust', message: 'Sentiment agent (trust 76) at threshold.' },
];

const RJ_SIGNERS = [
  { ens: 'maxima.aicouncil.eth', signed: true,  ago: '2 min ago' },
  { ens: 'pico.aicouncil.eth',   signed: true,  ago: '1 min ago' },
  { ens: 'atlas.aicouncil.eth',  signed: false, ago: 'pending'   },
  { ens: 'zen.aicouncil.eth',    signed: false, ago: 'pending'   },
  { ens: 'rio.aicouncil.eth',    signed: false, ago: 'pending'   },
];

const rjStyles = {
  card: { width: '100%', height: '100%', background: 'oklch(0.18 0.025 255)', color: 'oklch(0.96 0.006 255)', fontFamily: 'var(--font-sans)', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  topBar: { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 22px', borderBottom: '1px solid oklch(0.30 0.030 255)', fontFamily: 'var(--font-mono)', fontSize: 11, background: 'oklch(0.20 0.025 255)', flexShrink: 0 },
  body: { flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, overflow: 'hidden', minHeight: 0 },
  leftPane: { borderRight: '1px solid oklch(0.30 0.030 255)', display: 'flex', flexDirection: 'column' },
  paneHeader: { padding: '10px 18px', borderBottom: '1px solid oklch(0.28 0.028 255)', background: 'oklch(0.20 0.025 255)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.66 0.014 255)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  editor: { flex: 1, overflowY: 'auto', fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.55, padding: '14px 0', background: 'oklch(0.16 0.020 255)' },
  editorLine: { display: 'grid', gridTemplateColumns: '40px 1fr', gap: 14, padding: '1px 18px 1px 0' },
  lineNum: { color: 'oklch(0.40 0.020 255)', textAlign: 'right', paddingRight: 10, fontVariantNumeric: 'tabular-nums', userSelect: 'none' },
  diffChanged: { background: 'color-mix(in oklch, oklch(0.78 0.14 75) 12%, transparent)', borderLeft: '2px solid oklch(0.78 0.14 75)' },
  diffAdded: { background: 'color-mix(in oklch, oklch(0.74 0.16 152) 14%, transparent)', borderLeft: '2px solid oklch(0.74 0.16 152)' },
  rightPane: { display: 'flex', flexDirection: 'column' },
  preview: { flex: 1, overflowY: 'auto', padding: '18px 22px' },
  previewSection: { padding: 14, borderRadius: 6, background: 'oklch(0.22 0.028 255)', border: '1px solid oklch(0.30 0.030 255)', marginBottom: 14 },
  previewSectionLabel: { fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.56 0.014 255)', marginBottom: 10 },
  validation: { padding: 14, borderTop: '1px solid oklch(0.28 0.028 255)', background: 'oklch(0.20 0.025 255)', maxHeight: 200, overflowY: 'auto' },
  validationRow: { display: 'grid', gridTemplateColumns: '90px 1fr', gap: 12, padding: '6px 0', fontFamily: 'var(--font-mono)', fontSize: 11, borderTop: '1px solid oklch(0.28 0.028 255)' },
  footer: { padding: '12px 22px', display: 'flex', alignItems: 'center', gap: 12, background: 'oklch(0.20 0.025 255)', borderTop: '1px solid oklch(0.30 0.030 255)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'oklch(0.66 0.014 255)', letterSpacing: '0.04em', flexShrink: 0 },
  btn: { padding: '7px 12px', borderRadius: 4, background: 'transparent', border: '1px solid oklch(0.40 0.030 255)', color: 'oklch(0.92 0.008 255)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.10em', textTransform: 'uppercase', cursor: 'pointer' },
  btnPrimary: { background: 'oklch(0.78 0.14 75)', borderColor: 'oklch(0.78 0.14 75)', color: 'oklch(0.18 0.04 75)' },
};

function tokenizeJsonLine(line) {
  const out = [];
  const re = /("(?:[^"\\]|\\.)*")\s*(:?)|(-?\d+(?:\.\d+)?)|\b(true|false|null)\b|([{}\[\],])|(\s+)|(.+?)/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    if (m[1]) out.push({ t: m[1] + (m[2] || ''), c: m[2] ? 'oklch(0.74 0.15 245)' : 'oklch(0.86 0.10 152)' });
    else if (m[3]) out.push({ t: m[3], c: 'oklch(0.86 0.10 75)' });
    else if (m[4]) out.push({ t: m[4], c: 'oklch(0.86 0.10 22)' });
    else if (m[5] || m[6] || m[7]) out.push({ t: (m[5] || m[6] || m[7]), c: 'oklch(0.86 0.012 255)' });
  }
  return out;
}

function rjJsonLines(obj, diffMap) {
  const text = JSON.stringify(obj, null, 2);
  return text.split('\n').map((line, i) => {
    const trimmed = line.trim();
    let kind = 'normal';
    Object.keys(diffMap).forEach((path) => {
      const lastKey = path.split('.').pop().replace(/\[.*\]/, '');
      if (trimmed.startsWith(`"${lastKey}"`)) kind = diffMap[path];
    });
    return { num: i + 1, text: line, kind };
  });
}

function RjEditorPane({ rules, diffMap }) {
  const lines = rjJsonLines(rules, diffMap);
  return (
    <div style={rjStyles.editor}>
      {lines.map((l) => {
        const baseStyle = { ...rjStyles.editorLine };
        if (l.kind === 'changed') Object.assign(baseStyle, rjStyles.diffChanged);
        if (l.kind === 'added')   Object.assign(baseStyle, rjStyles.diffAdded);
        return (
          <div key={l.num} style={baseStyle}>
            <span style={rjStyles.lineNum}>{l.num}</span>
            <span>{tokenizeJsonLine(l.text).map((p, i) => <span key={i} style={{ color: p.c }}>{p.t}</span>)}</span>
          </div>
        );
      })}
    </div>
  );
}

function RjPreview({ rules, isDirty }) {
  return (
    <div style={rjStyles.preview}>
      <div style={rjStyles.previewSection}>
        <div style={rjStyles.previewSectionLabel}>Caps</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            ['Soft cap per protocol', `${rules.caps.soft_per_protocol_pct}%`, isDirty],
            ['Hard cap per protocol', `${rules.caps.hard_per_protocol_pct}%`, false],
            ['Hard cap per asset', `${rules.caps.hard_per_asset_pct}%`, false],
          ].map(([k, v, dirty]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'oklch(0.78 0.012 255)', fontSize: 12 }}>{k}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: dirty ? 'oklch(0.86 0.10 75)' : 'oklch(0.92 0.008 255)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={rjStyles.previewSection}>
        <div style={rjStyles.previewSectionLabel}>Governance</div>
        <div style={{ display: 'grid', gap: 8 }}>
          {[
            ['Quorum', `${rules.governance.quorum} agents`, isDirty],
            ['Pass threshold', `${rules.governance.pass_threshold_pct}%`, false],
            ['Min agent trust', String(rules.governance.min_agent_trust), isDirty],
          ].map(([k, v, dirty]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'oklch(0.78 0.012 255)', fontSize: 12 }}>{k}</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: dirty ? 'oklch(0.86 0.10 75)' : 'oklch(0.92 0.008 255)' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={rjStyles.previewSection}>
        <div style={rjStyles.previewSectionLabel}>Whitelisted protocols ({rules.whitelisted_protocols.length})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {rules.whitelisted_protocols.map((p) => {
            const isNew = p === 'spark-v1' && isDirty;
            return (
              <span key={p} style={{
                padding: '4px 10px', borderRadius: 3,
                background: isNew ? 'color-mix(in oklch, oklch(0.74 0.16 152) 22%, transparent)' : 'oklch(0.26 0.018 255)',
                border: `1px solid ${isNew ? 'oklch(0.55 0.16 152)' : 'oklch(0.40 0.030 255)'}`,
                color: isNew ? 'oklch(0.86 0.10 152)' : 'oklch(0.86 0.012 255)',
                fontFamily: 'var(--font-mono)', fontSize: 10.5, fontWeight: 600,
              }}>{p}{isNew ? ' (new)' : ''}</span>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function RjValidation({ findings }) {
  const errCount = findings.filter((f) => f.level === 'error' && !f.resolved).length;
  const warnCount = findings.filter((f) => f.level === 'warning').length;
  return (
    <div style={rjStyles.validation}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.66 0.014 255)', marginBottom: 8, display: 'flex', justifyContent: 'space-between' }}>
        <span>Validation</span>
        <span style={{ color: errCount > 0 ? 'oklch(0.86 0.10 22)' : warnCount > 0 ? 'oklch(0.86 0.10 75)' : 'oklch(0.86 0.10 152)' }}>
          {errCount} errors · {warnCount} warnings
        </span>
      </div>
      {findings.map((f, i) => {
        const c = f.level === 'error' ? 'oklch(0.86 0.10 22)' : f.level === 'warning' ? 'oklch(0.86 0.10 75)' : 'oklch(0.78 0.012 255)';
        const icon = f.level === 'error' ? (f.resolved ? '✓' : '✕') : f.level === 'warning' ? '!' : 'i';
        return (
          <div key={i} style={rjStyles.validationRow}>
            <span style={{ color: c, fontWeight: 700 }}>{icon} {f.level}{f.resolved ? ' (resolved)' : ''}</span>
            <div>
              <code style={{ color: 'oklch(0.66 0.014 255)' }}>{f.path}</code>
              <div style={{ color: 'oklch(0.86 0.012 255)', marginTop: 2, fontFamily: 'var(--font-sans)' }}>{f.message}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function VariantRulesJson({ overrides = {} }) {
  const state = overrides.state || 'editing';
  const isDirty = state === 'editing' || state === 'validating' || state === 'committing';
  const rules = isDirty ? RULES_DRAFT : RULES_CURRENT;
  const findings = state === 'validating' ? VALIDATION_FINDINGS : (isDirty ? VALIDATION_FINDINGS.slice(0, 2) : []);
  const diffMap = isDirty ? {
    'caps.soft_per_protocol_pct': 'changed',
    'governance.quorum': 'changed',
    'governance.min_agent_trust': 'changed',
    'whitelisted_protocols[+]': 'added',
    'version': 'changed',
  } : {};

  const signedCount = RJ_SIGNERS.filter((s) => s.signed).length;
  const required = 3;

  return (
    <div style={rjStyles.card}>
      <div style={rjStyles.topBar}>
        <span style={{ color: 'oklch(0.96 0.006 255)', fontWeight: 600 }}>CONCLAVE</span>
        <span style={{ color: 'oklch(0.40 0.020 255)' }}>·</span>
        <span style={{ color: 'oklch(0.78 0.012 255)' }}>RULES · {rules.version}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: state === 'committing' ? 'oklch(0.74 0.16 152)' : isDirty ? 'oklch(0.78 0.14 75)' : 'oklch(0.74 0.16 152)' }} />
          <span style={{ color: state === 'committing' ? 'oklch(0.86 0.10 152)' : isDirty ? 'oklch(0.86 0.10 75)' : 'oklch(0.86 0.10 152)', fontWeight: 700 }}>
            {state === 'committing' ? `COMMITTING ${signedCount}/${required}` : isDirty ? 'UNCOMMITTED' : 'IN SYNC ON-CHAIN'}
          </span>
        </span>
      </div>

      <div style={rjStyles.body}>
        <div style={rjStyles.leftPane}>
          <div style={rjStyles.paneHeader}>
            <span>JSON · rules.json</span>
            {isDirty && <span style={{ color: 'oklch(0.86 0.10 75)' }}>● dirty (4 changes)</span>}
          </div>
          <RjEditorPane rules={rules} diffMap={diffMap} />
          {(state === 'validating' || state === 'editing') && <RjValidation findings={findings} />}
        </div>

        <div style={rjStyles.rightPane}>
          <div style={rjStyles.paneHeader}>
            <span>Compiled preview</span>
            <span style={{ color: 'oklch(0.66 0.014 255)' }}>diff vs. on-chain</span>
          </div>
          <RjPreview rules={rules} isDirty={isDirty} />
          {state === 'committing' && (
            <div style={{ padding: 16, borderTop: '1px solid oklch(0.28 0.028 255)', background: 'oklch(0.20 0.025 255)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'oklch(0.56 0.014 255)', marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                <span>Multisig sigs</span>
                <span style={{ color: signedCount >= required ? 'oklch(0.86 0.10 152)' : 'oklch(0.86 0.10 75)' }}>{signedCount} / {required} required</span>
              </div>
              {RJ_SIGNERS.map((s) => (
                <div key={s.ens} style={{ display: 'grid', gridTemplateColumns: '14px 1fr auto', gap: 10, padding: '6px 0', fontFamily: 'var(--font-mono)', fontSize: 11, borderTop: '1px solid oklch(0.28 0.028 255)' }}>
                  <span style={{ width: 12, height: 12, borderRadius: 6, background: s.signed ? 'oklch(0.74 0.16 152)' : 'oklch(0.30 0.030 255)' }} />
                  <span style={{ color: s.signed ? 'oklch(0.92 0.008 255)' : 'oklch(0.66 0.014 255)' }}>{s.ens}</span>
                  <span style={{ color: s.signed ? 'oklch(0.74 0.16 152)' : 'oklch(0.56 0.014 255)' }}>{s.signed ? '✓ ' + s.ago : s.ago}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div style={rjStyles.footer}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'oklch(0.74 0.15 245)' }} />
          ON-CHAIN · {rules.version}
        </span>
        <code style={{ fontSize: 10, color: 'oklch(0.78 0.012 255)' }}>0xc796...e301f0</code>
        <div style={{ flex: 1 }} />
        {!isDirty && <button style={rjStyles.btn}>✎ Edit rules</button>}
        {isDirty && state !== 'committing' && (
          <>
            <button style={rjStyles.btn}>↶ Discard</button>
            <button style={rjStyles.btn}>✓ Validate</button>
            <button style={{ ...rjStyles.btn, ...rjStyles.btnPrimary }}>→ Commit on-chain</button>
          </>
        )}
        {state === 'committing' && (
          <>
            <button style={rjStyles.btn}>✕ Cancel</button>
            <button style={{ ...rjStyles.btn, ...rjStyles.btnPrimary }}>✓ Sign</button>
          </>
        )}
      </div>
    </div>
  );
}

window.VariantRulesJson = VariantRulesJson;
