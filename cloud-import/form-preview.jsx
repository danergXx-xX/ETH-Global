// Component 2 — Preview / simulation panel (Safe-style).
// Shows the structured tx that would execute if the council approves.

function FPreviewPanel({ proposal, theme, t, locale }) {
  if (!proposal || !proposal.action) return null;
  const asset = TREASURY.assets.find((a) => a.sym === proposal.asset) || TREASURY.assets[0];
  const amount = proposal.amount || 0;
  const usdValue = amount * (asset.usd / Math.max(1, asset.balance));
  const proto = (PROTOCOLS[proposal.action] || []).find((p) => p.id === proposal.protocol);
  const apy = proto?.apy || 0;
  const days = proposal.term || 30;
  const expectedYield = (usdValue * (apy / 100) * (days / 365));

  // Mocked tx
  const calldata = '0x' + (
    proposal.action === 'deposit' ? 'a0712d68' :
    proposal.action === 'transfer' ? 'a9059cbb' :
    '7c025200'
  ) + '0000…' + (proposal.target || '6c5f2c8e').slice(-6);

  const target = proposal.target || (proto ? `0x${proto.id}…aav3` : '0x…');
  const gasUsd = '0.04 USDC';

  return <div style={{
    background: theme.bgPanel, border: `1px solid ${theme.border}`, borderRadius: 4,
    overflow: 'hidden',
  }}>
    <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, display: 'flex', alignItems: 'center', gap: 8, background: theme.bgRow }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%', background: theme.amber,
        animation: 'a-blink 1.4s infinite',
      }} />
      <span style={{ fontSize: 11, color: theme.text, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
        {t.previewTitle}
      </span>
      <span style={{ fontSize: 10.5, color: theme.textFaint, marginLeft: 'auto' }}>{t.previewSubtitle}</span>
    </div>

    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: `1px solid ${theme.borderSoft}` }}>
      <PCell label={t.from} theme={theme}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: theme.text, fontWeight: 600 }}>treasury.aicouncil.eth</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: theme.textFaint, marginTop: 1 }}>0xae...3f1c</div>
      </PCell>
      <PCell label={t.to} theme={theme} borderL>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: theme.text, fontWeight: 600 }}>{target}</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: theme.textFaint, marginTop: 1 }}>{proto?.label[locale] || proposal.action}</div>
      </PCell>
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: `1px solid ${theme.borderSoft}` }}>
      <PCell label={t.value} theme={theme}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: theme.text, fontWeight: 700 }}>
          {amount.toLocaleString()} {proposal.asset}
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: theme.textFaint, marginTop: 1 }}>≈ ${usdValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
      </PCell>
      <PCell label={t.gasEst} theme={theme} borderL>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: theme.text, fontWeight: 700 }}>184k gas</div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9.5, color: theme.textFaint, marginTop: 1 }}>≈ {gasUsd}</div>
      </PCell>
      <PCell label={t.calldata} theme={theme} borderL>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: theme.text, fontWeight: 500, wordBreak: 'break-all' }}>{calldata}</div>
      </PCell>
    </div>

    {proposal.action === 'deposit' && apy > 0 && (
      <div style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.borderSoft}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div>
          <div style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>{t.expectedYield}</div>
          <div style={{ fontSize: 13, color: theme.voteFor, fontWeight: 700, fontFamily: 'var(--font-mono)', marginTop: 2 }}>
            +${expectedYield.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t.over} {days} {t.days}
          </div>
        </div>
        <div style={{ flex: 1 }} />
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: theme.textDim }}>
          {t.estApy}: {apy}%
        </div>
      </div>
    )}

    <div style={{ padding: '10px 14px' }}>
      <div style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>{t.afterExec}</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
        <DiffCell theme={theme} label={t.treasuryNow}
          value={`${asset.balance.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${asset.sym}`}
          color={theme.text} />
        <span style={{ color: theme.textFaint, fontFamily: 'var(--font-mono)', fontSize: 14 }}>→</span>
        <DiffCell theme={theme} label={t.treasuryAfter}
          value={`${(asset.balance - amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${asset.sym}`}
          delta={`${t.minus}${amount.toLocaleString()}`} deltaColor={theme.voteAgainst}
          color={theme.text} />
      </div>
      {proposal.action === 'deposit' && proposal.protocol && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center', marginTop: 8 }}>
          <DiffCell theme={theme} label={`a${asset.sym} @ ${proto?.label.en || proposal.protocol}`}
            value={`0 a${asset.sym}`} color={theme.textFaint} />
          <span style={{ color: theme.textFaint, fontFamily: 'var(--font-mono)', fontSize: 14 }}>→</span>
          <DiffCell theme={theme} label={`a${asset.sym} @ ${proto?.label.en || proposal.protocol}`}
            value={`${amount.toLocaleString()} a${asset.sym}`}
            delta={`${t.plus}${amount.toLocaleString()}`} deltaColor={theme.voteFor}
            color={theme.text} />
        </div>
      )}
    </div>
  </div>;
}

function PCell({ label, children, theme, borderL }) {
  return <div style={{
    padding: '10px 14px',
    borderLeft: borderL ? `1px solid ${theme.borderSoft}` : 'none',
  }}>
    <div style={{ fontSize: 9.5, color: theme.textFaint, letterSpacing: '0.06em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{label}</div>
    {children}
  </div>;
}

function DiffCell({ label, value, delta, deltaColor, theme, color }) {
  return <div>
    <div style={{ fontSize: 9.5, color: theme.textFaint, fontFamily: 'var(--font-mono)' }}>{label}</div>
    <div style={{ fontSize: 12, color: color, fontWeight: 600, fontFamily: 'var(--font-mono)', marginTop: 2 }}>{value}</div>
    {delta && <div style={{ fontSize: 10, color: deltaColor, fontFamily: 'var(--font-mono)', marginTop: 1 }}>{delta}</div>}
  </div>;
}

window.FPreviewPanel = FPreviewPanel;
