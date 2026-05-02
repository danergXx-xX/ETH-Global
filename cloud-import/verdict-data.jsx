// Verdict Card — closing flow after a debate. Share-able, archive-ready receipt.
// Multi-state: tally reveal → execution preview → executed (success) / signed-pending (multisig).

const VERDICT_DATA = {
  proposal: {
    id: 'PROP-042',
    title: 'Allocate 50,000 mUSDC to Aave v3 USDC pool on Base',
    submittedBy: 'treasury.aicouncil.eth',
    submittedAt: '2026-05-02 14:23:08 UTC',
    debateDuration: '47.3s',
    block: 18403291,
    network: 'Base Sepolia',
    archive: { status: 'archived', cid: 'bafy…q4hzx', gateway: '0g.ai/storage/cid/bafy…q4hzx' },
  },
  tally: {
    for: 4, against: 0, abstain: 1,
    quorum: 3, threshold: '60% supermajority', passed: true,
    confidence: 0.81,  // weighted by trust score
  },
  agentVotes: [
    { ens: 'risk.aicouncil.eth',      label: 'Risk',      vote: 'FOR',     conf: 0.66, key: 'Within concentration rules. VaR(95) bounded at $170 over 30d. Within governance frame.' },
    { ens: 'bull.aicouncil.eth',      label: 'Bull',      vote: 'FOR',     conf: 0.84, key: '4.21% APY vs 3.31% T-bill. $45/mo on idle capital. Trivial size, clear win.' },
    { ens: 'bear.aicouncil.eth',      label: 'Bear',      vote: 'ABSTAIN', conf: 0.71, key: 'Concerns are real but small. Position is reversible, size is below 10% threshold.' },
    { ens: 'tech.aicouncil.eth',      label: 'Tech',      vote: 'FOR',     conf: 0.78, key: 'Aave v3.0.2 audited. No critical findings. Standard ERC-20 aToken integration.' },
    { ens: 'sentiment.aicouncil.eth', label: 'Sentiment', vote: 'FOR',     conf: 0.62, key: 'aixbt composite +0.31. No adverse narratives in last 7d.' },
  ],
  // Counter-arguments surfaced during debate (challengeable)
  counterArguments: [
    { id: 'ca-1', text: 'mUSDC bridge dependency on LayerZero relayers is not whitelisted as audited.', from: 'bear.aicouncil.eth', addressed: true,  resolution: 'Tech confirmed LayerZero v2 has 2 audits + zero CVEs in 18mo.' },
    { id: 'ca-2', text: 'Spread over T-bills (0.90%) is thin vs added smart-contract surface.',         from: 'bear.aicouncil.eth', addressed: true,  resolution: 'Risk: VaR(95) is 0.34% over 30d; net expected ≈ $42 still positive after stress.' },
    { id: 'ca-3', text: 'Aave governance speed (7d median) shorter than our 30d exposure window.',     from: 'bear.aicouncil.eth', addressed: false, resolution: 'Open: Settings rule pauses position if active proposal queued.' },
  ],
  execution: {
    type: 'multisig',  // 'auto' | 'multisig' | 'manual'
    threshold: '3 of 5',
    signers: [
      { ens: 'treasury.aicouncil.eth', addr: '0xae…3f1c', signed: true,  ago: 'just now' },
      { ens: 'ops.aicouncil.eth',      addr: '0x4a…7d92', signed: true,  ago: '2m ago' },
      { ens: 'risk-officer.eth',       addr: '0x91…2bdf', signed: false, ago: 'pending' },
      { ens: 'community-multisig.eth', addr: '0x33…ea0e', signed: false, ago: 'pending' },
      { ens: 'guardian.aicouncil.eth', addr: '0xff…c100', signed: false, ago: 'pending' },
    ],
    txs: [
      { step: 1, label: 'Approve USDC',            calldata: '0x095ea7b3…000bebc200', gas: '46,210', status: 'queued' },
      { step: 2, label: 'Pool.supply(USDC, 50k)',  calldata: '0x617ba037…0000000000', gas: '94,872', status: 'queued' },
    ],
    expectedYield: { apy: 4.21, monthly: 175.42, annual: 2105.00, currency: 'USDC' },
  },
};

window.VERDICT_DATA = VERDICT_DATA;
