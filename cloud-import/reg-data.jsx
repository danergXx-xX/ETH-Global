// Component 5: Protocol Registry — data layer.
// Whitelist of approved DeFi protocols, audits, caps, oracle providers,
// and the data sources that the council uses to evaluate them.

const PROTOCOLS = [
  {
    id: 'aave-v3-base',
    name: 'Aave v3',
    network: 'Base',
    chainId: 8453,
    category: 'lending',
    status: 'whitelisted',          // whitelisted | review | deprecated | banned
    addedDate: '2026-09-12',
    addedBy: 'rules.aicouncil.eth',
    contracts: [
      { label: 'Pool',   address: '0xae...3f1c', verified: true,  proxyTo: '0x4a...7d92' },
      { label: 'aUSDC',  address: '0x4e...8b21', verified: true,  proxyTo: null },
    ],
    audits: [
      { firm: 'Spearbit',  date: '2026-01',  scope: 'v3.0.2 full',     verdict: 'pass',     reportShort: 'sb-aave-v3-2601' },
      { firm: 'Certora',   date: '2026-02',  scope: 'formal v3.0.2',   verdict: 'pass',     reportShort: 'crt-aave-v3-2602' },
      { firm: 'Trail of Bits', date: '2025-09', scope: 'v3.0.1',       verdict: 'pass-w-rec', reportShort: 'tob-aave-v3-2509' },
    ],
    caps: { soft: 5,  hard: 15, perTx: 200000 },   // % of treasury · $ per single tx
    apy: { current: 4.7, range7d: [4.4, 4.9], source: 'aave-api' },
    tvl: { usd: 184000000, source: 'defillama' },
    risks: ['paused-asset-history', 'governance-controlled-params'],
    oracleProvider: 'Chainlink',
    sources: ['defillama', 'aave-api', 'chainlink', 'spearbit', 'certora', 'tob'],
    description: { en: 'Lending pool. Supply USDC, earn variable APY. Withdrawals subject to utilization.', pl: 'Pula pozyczkowa. Dostarczasz USDC, otrzymujesz zmienne APY. Wypłaty zalezne od utylizacji.' },
    riskScore: { value: 88, tier: 'A' },        // 0-100
  },
  {
    id: 'compound-v3-base',
    name: 'Compound III',
    network: 'Base',
    chainId: 8453,
    category: 'lending',
    status: 'whitelisted',
    addedDate: '2026-08-04',
    addedBy: 'rules.aicouncil.eth',
    contracts: [
      { label: 'Comet',  address: '0xc3...e4b2', verified: true,  proxyTo: '0xb1...44e0' },
    ],
    audits: [
      { firm: 'OpenZeppelin', date: '2025-11', scope: 'Comet v0.10', verdict: 'pass',         reportShort: 'oz-cmp-v0.10' },
      { firm: 'ChainSecurity', date: '2025-11', scope: 'Comet v0.10', verdict: 'pass-w-rec', reportShort: 'cs-cmp-v0.10' },
    ],
    caps: { soft: 4,  hard: 12, perTx: 150000 },
    apy: { current: 3.8, range7d: [3.6, 4.0], source: 'compound-api' },
    tvl: { usd: 92000000, source: 'defillama' },
    risks: ['concentrated-collateral'],
    oracleProvider: 'Chainlink',
    sources: ['defillama', 'compound-api', 'chainlink', 'openzeppelin', 'chainsecurity'],
    description: { en: 'Single-base-asset money market. Lower APY than Aave but simpler risk profile.', pl: 'Single-base-asset money market. Nizsze APY niz Aave ale prostszy profil ryzyka.' },
    riskScore: { value: 82, tier: 'A-' },
  },
  {
    id: 'morpho-blue',
    name: 'Morpho Blue',
    network: 'Base',
    chainId: 8453,
    category: 'lending',
    status: 'review',                           // pending council review
    addedDate: '2026-10-28',
    addedBy: 'tech.aicouncil.eth',
    contracts: [
      { label: 'Morpho',  address: '0xmb...9ab1', verified: true,  proxyTo: null },
    ],
    audits: [
      { firm: 'Spearbit',     date: '2025-04', scope: 'core',         verdict: 'pass',  reportShort: 'sb-morpho-2504' },
      { firm: 'Cantina',      date: '2025-04', scope: 'core',         verdict: 'pass-w-rec', reportShort: 'ctn-morpho-2504' },
    ],
    caps: { soft: 0,  hard: 0, perTx: 0 },     // not yet allocated
    apy: { current: 5.4, range7d: [5.1, 5.7], source: 'morpho-api' },
    tvl: { usd: 41000000, source: 'defillama' },
    risks: ['immutable-but-young', 'curator-quality-varies', 'isolated-markets'],
    oracleProvider: 'Chainlink + Pyth',
    sources: ['defillama', 'morpho-api', 'chainlink', 'pyth', 'spearbit', 'cantina'],
    description: { en: 'Permissionless isolated lending markets. Council must approve specific market curators per allocation.', pl: 'Bezzezwolaniowe izolowane rynki pozyczkowe. Rada musi zatwierdzic kuratora danego rynku.' },
    riskScore: { value: 71, tier: 'B+' },
  },
  {
    id: 'uniswap-v3-base',
    name: 'Uniswap v3',
    network: 'Base',
    chainId: 8453,
    category: 'dex',
    status: 'whitelisted',
    addedDate: '2026-07-19',
    addedBy: 'rules.aicouncil.eth',
    contracts: [
      { label: 'Router',  address: '0xun...c3d2', verified: true,  proxyTo: null },
      { label: 'Factory', address: '0xuf...91a4', verified: true,  proxyTo: null },
    ],
    audits: [
      { firm: 'Trail of Bits', date: '2024-12', scope: 'v3 router',   verdict: 'pass',  reportShort: 'tob-uni-v3-2412' },
      { firm: 'ABDK',          date: '2024-08', scope: 'core math',   verdict: 'pass',  reportShort: 'abdk-uni-v3-2408' },
    ],
    caps: { soft: null,  hard: null, perTx: 50000 },  // dex — not held, just routed; per-tx slippage cap
    apy: { current: null, range7d: null, source: null },
    tvl: { usd: 1240000000, source: 'defillama' },
    risks: ['mev-exposure', 'stale-pool-liquidity'],
    oracleProvider: 'TWAP self',
    sources: ['defillama', 'uniswap-api', 'tob', 'abdk'],
    description: { en: 'Concentrated-liquidity DEX. Used for swaps; not a holding venue.', pl: 'DEX z koncentrowana plynnoscia. Uzywany do swapow; nie miejsce przechowywania.' },
    riskScore: { value: 91, tier: 'A' },
  },
  {
    id: 'pendle-base',
    name: 'Pendle',
    network: 'Base',
    chainId: 8453,
    category: 'yield',
    status: 'review',
    addedDate: '2026-11-01',
    addedBy: 'bull.aicouncil.eth',
    contracts: [
      { label: 'Router',  address: '0xpd...77ee', verified: true,  proxyTo: null },
    ],
    audits: [
      { firm: 'Spearbit', date: '2025-06', scope: 'v2', verdict: 'pass-w-rec', reportShort: 'sb-pendle-v2' },
    ],
    caps: { soft: 0,  hard: 0, perTx: 0 },
    apy: { current: 9.2, range7d: [8.4, 10.1], source: 'pendle-api' },
    tvl: { usd: 28000000, source: 'defillama' },
    risks: ['fixed-yield-tokens-illiquid', 'maturity-risk', 'newer-on-base'],
    oracleProvider: 'Chainlink + custom',
    sources: ['defillama', 'pendle-api', 'spearbit'],
    description: { en: 'Yield tokenization. Splits assets into PT (principal) and YT (yield). High APY, more complex.', pl: 'Tokenizacja yieldu. Dzieli aktywa na PT (kapitał) i YT (zysk). Wyższe APY, większa zlozonosc.' },
    riskScore: { value: 64, tier: 'B' },
  },
  {
    id: 'gmx-arbitrum',
    name: 'GMX',
    network: 'Arbitrum',
    chainId: 42161,
    category: 'perps',
    status: 'banned',                           // explicitly disallowed by current rules
    addedDate: '2026-04-10',
    addedBy: 'risk.aicouncil.eth',
    contracts: [
      { label: 'Vault',  address: '0xgm...10b0', verified: true,  proxyTo: null },
    ],
    audits: [
      { firm: 'ABDK',  date: '2024-03', scope: 'v2', verdict: 'pass-w-rec', reportShort: 'abdk-gmx-v2' },
    ],
    caps: { soft: 0, hard: 0, perTx: 0 },
    apy: { current: 18.5, range7d: [12.0, 22.0], source: 'gmx-api' },
    tvl: { usd: 460000000, source: 'defillama' },
    risks: ['perp-counterparty', 'high-volatility', 'cross-chain-bridging-required'],
    oracleProvider: 'Chainlink',
    sources: ['defillama', 'gmx-api', 'chainlink', 'abdk'],
    description: { en: 'Perp DEX. Banned by current treasury policy: directional exposure outside mandate.', pl: 'Perp DEX. Zabroniony przez obecna polityke skarbca: ekspozycja kierunkowa poza mandatem.' },
    riskScore: { value: 38, tier: 'C' },
    bannedReason: { en: 'Directional perps outside treasury mandate (rules-v2.1 § 4.2)', pl: 'Perpy kierunkowe poza mandatem skarbca (rules-v2.1 § 4.2)' },
  },
  {
    id: 'eigenlayer',
    name: 'EigenLayer',
    network: 'Ethereum',
    chainId: 1,
    category: 'restaking',
    status: 'deprecated',
    addedDate: '2026-02-15',
    addedBy: 'tech.aicouncil.eth',
    contracts: [
      { label: 'StrategyManager', address: '0xel...50aa', verified: true,  proxyTo: '0xel...88cc' },
    ],
    audits: [
      { firm: 'Spearbit',     date: '2024-10', scope: 'mainnet',  verdict: 'pass',  reportShort: 'sb-eig-2410' },
    ],
    caps: { soft: 0,  hard: 5, perTx: 0 },
    apy: { current: 3.1, range7d: [2.9, 3.3], source: 'defillama' },
    tvl: { usd: 7800000000, source: 'defillama' },
    risks: ['slashing-conditions-evolving', 'long-unbonding'],
    oracleProvider: 'Chainlink',
    sources: ['defillama', 'spearbit'],
    description: { en: 'Restaking. Whitelisted but deprecated for new allocations pending policy review.', pl: 'Restaking. Zatwierdzony ale wycofywany dla nowych alokacji do czasu rewizji polityki.' },
    riskScore: { value: 76, tier: 'B+' },
    deprecatedReason: { en: 'New allocations paused pending rules-v2.2 review', pl: 'Nowe alokacje wstrzymane do czasu rewizji rules-v2.2' },
  },
];

// Data sources used by the council to evaluate protocols.
const DATA_SOURCES = [
  { id: 'defillama',     label: 'DefiLlama',       kind: 'tvl',      url: 'defillama.com',     status: 'healthy', latencyMs: 142, lastSync: 'T-12s', usedBy: ['risk', 'tech'], protocols: 47 },
  { id: 'chainlink',     label: 'Chainlink',       kind: 'oracle',   url: 'data.chain.link',    status: 'healthy', latencyMs: 84,  lastSync: 'T-3s',  usedBy: ['risk'],         protocols: 32 },
  { id: 'pyth',          label: 'Pyth',            kind: 'oracle',   url: 'pyth.network',       status: 'healthy', latencyMs: 61,  lastSync: 'T-2s',  usedBy: ['risk'],         protocols: 18 },
  { id: 'aave-api',      label: 'Aave API',        kind: 'protocol', url: 'aave.com/api',       status: 'healthy', latencyMs: 178, lastSync: 'T-22s', usedBy: ['bull', 'tech'], protocols: 1 },
  { id: 'compound-api',  label: 'Compound API',    kind: 'protocol', url: 'compound.finance',   status: 'healthy', latencyMs: 201, lastSync: 'T-31s', usedBy: ['bull', 'tech'], protocols: 1 },
  { id: 'morpho-api',    label: 'Morpho API',      kind: 'protocol', url: 'morpho.org/api',     status: 'healthy', latencyMs: 154, lastSync: 'T-18s', usedBy: ['bull', 'tech'], protocols: 1 },
  { id: 'spearbit',      label: 'Spearbit',        kind: 'audit',    url: 'spearbit.com',       status: 'healthy', latencyMs: 0,   lastSync: 'manual', usedBy: ['risk', 'tech'], protocols: 4 },
  { id: 'certora',       label: 'Certora',         kind: 'audit',    url: 'certora.com',        status: 'healthy', latencyMs: 0,   lastSync: 'manual', usedBy: ['tech'],         protocols: 1 },
  { id: 'tob',           label: 'Trail of Bits',   kind: 'audit',    url: 'trailofbits.com',    status: 'healthy', latencyMs: 0,   lastSync: 'manual', usedBy: ['tech'],         protocols: 2 },
  { id: 'openzeppelin',  label: 'OpenZeppelin',    kind: 'audit',    url: 'openzeppelin.com',   status: 'healthy', latencyMs: 0,   lastSync: 'manual', usedBy: ['tech'],         protocols: 1 },
  { id: 'chainsecurity', label: 'ChainSecurity',   kind: 'audit',    url: 'chainsecurity.com',  status: 'healthy', latencyMs: 0,   lastSync: 'manual', usedBy: ['tech'],         protocols: 1 },
  { id: 'cantina',       label: 'Cantina',         kind: 'audit',    url: 'cantina.xyz',        status: 'healthy', latencyMs: 0,   lastSync: 'manual', usedBy: ['tech'],         protocols: 1 },
  { id: 'abdk',          label: 'ABDK',            kind: 'audit',    url: 'abdk.consulting',    status: 'healthy', latencyMs: 0,   lastSync: 'manual', usedBy: ['tech'],         protocols: 2 },
  { id: 'perplexity',    label: 'Perplexity',      kind: 'sentiment',url: 'perplexity.ai',      status: 'degraded', latencyMs: 1840, lastSync: 'T-4m', usedBy: ['sentiment'],    protocols: null },
  { id: 'aixbt',         label: 'aixbt',           kind: 'sentiment',url: 'aixbt.com',          status: 'healthy', latencyMs: 320, lastSync: 'T-1m',  usedBy: ['sentiment'],    protocols: null },
  { id: 'coingecko',     label: 'CoinGecko',       kind: 'price',    url: 'coingecko.com',      status: 'healthy', latencyMs: 132, lastSync: 'T-8s',  usedBy: ['bull', 'bear'], protocols: null },
];

const REG_I18N = {
  en: {
    regTitle: 'Protocol Registry',
    regSubtitle: 'Approved venues for treasury allocations · last sync',
    sectionWhitelist: 'Whitelisted',
    sectionReview: 'Under review',
    sectionDeprecated: 'Deprecated',
    sectionBanned: 'Banned',
    statusWhitelisted: 'Whitelisted',
    statusReview: 'Under review',
    statusDeprecated: 'Deprecated',
    statusBanned: 'Banned',
    proposeAdd: 'Propose new protocol',
    columns: { name: 'Protocol', category: 'Category', network: 'Network', tvl: 'TVL', apy: 'APY', cap: 'Cap', risk: 'Risk', audits: 'Audits' },
    filters: { all: 'All', lending: 'Lending', dex: 'DEX', yield: 'Yield', perps: 'Perps', restaking: 'Restaking' },
    detail: {
      contracts: 'Contracts', audits: 'Audits', caps: 'Allocation caps', risks: 'Known risks',
      sources: 'Data sources', oracle: 'Oracle', addedBy: 'Added by',
      currentExposure: 'Current exposure', proposeAllocation: 'Propose allocation',
      auditFirm: 'Firm', auditDate: 'Date', auditScope: 'Scope', auditVerdict: 'Verdict',
      verifiedOn: 'Verified', proxy: 'Proxy →',
      softCap: 'Soft cap', hardCap: 'Hard cap', perTx: 'Per tx',
      ofTreasury: 'of treasury',
      councilEligible: 'Council eligible', councilNotEligible: 'Not eligible',
      lastReviewed: 'Last reviewed',
      reportShort: 'Report',
    },
    pass: 'pass', passWithRec: 'pass + rec', fail: 'fail',
    healthy: 'healthy', degraded: 'degraded', down: 'down',
    sourceKinds: { tvl: 'TVL', oracle: 'Oracle', protocol: 'Protocol', audit: 'Audit', sentiment: 'Sentiment', price: 'Price' },
    dataSources: 'Data sources',
    sourcesSubtitle: 'External signals the council pulls when evaluating',
    usedBy: 'Used by',
    latency: 'p50',
    lastSync: 'Last sync',
    coverage: 'Coverage',
    showSource: 'Show source on dashboard',
  },
  pl: {
    regTitle: 'Rejestr protokolow',
    regSubtitle: 'Dopuszczone miejsca alokacji skarbca · ostatnia synchronizacja',
    sectionWhitelist: 'Zatwierdzone',
    sectionReview: 'W ocenie',
    sectionDeprecated: 'Wycofywane',
    sectionBanned: 'Zabronione',
    statusWhitelisted: 'Zatwierdzony',
    statusReview: 'W ocenie',
    statusDeprecated: 'Wycofywany',
    statusBanned: 'Zabroniony',
    proposeAdd: 'Zaproponuj nowy protokol',
    columns: { name: 'Protokol', category: 'Kategoria', network: 'Siec', tvl: 'TVL', apy: 'APY', cap: 'Limit', risk: 'Ryzyko', audits: 'Audyty' },
    filters: { all: 'Wszystkie', lending: 'Pozyczki', dex: 'DEX', yield: 'Yield', perps: 'Perpy', restaking: 'Restaking' },
    detail: {
      contracts: 'Kontrakty', audits: 'Audyty', caps: 'Limity alokacji', risks: 'Znane ryzyka',
      sources: 'Źródła danych', oracle: 'Oracle', addedBy: 'Dodal',
      currentExposure: 'Obecna ekspozycja', proposeAllocation: 'Zaproponuj alokacje',
      auditFirm: 'Firma', auditDate: 'Data', auditScope: 'Zakres', auditVerdict: 'Werdykt',
      verifiedOn: 'Zweryfikowany', proxy: 'Proxy →',
      softCap: 'Limit miekki', hardCap: 'Limit twardy', perTx: 'Na tx',
      ofTreasury: 'skarbca',
      councilEligible: 'Można alokowac', councilNotEligible: 'Nie można',
      lastReviewed: 'Ostatnia rewizja',
      reportShort: 'Raport',
    },
    pass: 'pass', passWithRec: 'pass + zal.', fail: 'fail',
    healthy: 'OK', degraded: 'wolne', down: 'down',
    sourceKinds: { tvl: 'TVL', oracle: 'Oracle', protocol: 'Protokol', audit: 'Audyt', sentiment: 'Sentyment', price: 'Cena' },
    dataSources: 'Źródła danych',
    sourcesSubtitle: 'Sygnały zewnetrzne uzywane przez radę',
    usedBy: 'Uzywa',
    latency: 'p50',
    lastSync: 'Ost. sync',
    coverage: 'Pokrycie',
    showSource: 'Pokaz źródło na pulpicie',
  },
};

// Helpers — theme-aware so colors stay legible on both light + dark cards.
function regStatusColor(status, theme) {
  const isLight = theme && theme.name === 'light';
  if (isLight) {
    return {
      whitelisted: { bg: 'oklch(0.93 0.06 152)',  text: 'oklch(0.36 0.13 152)', dot: 'oklch(0.50 0.16 152)' },
      review:      { bg: 'oklch(0.94 0.06 75)',   text: 'oklch(0.38 0.12 75)',  dot: 'oklch(0.55 0.14 65)' },
      deprecated:  { bg: 'oklch(0.92 0.012 255)', text: 'oklch(0.42 0.014 255)',dot: 'oklch(0.55 0.014 255)' },
      banned:      { bg: 'oklch(0.94 0.07 22)',   text: 'oklch(0.40 0.16 22)',  dot: 'oklch(0.50 0.20 22)' },
    }[status];
  }
  return {
    whitelisted: { bg: 'oklch(0.30 0.07 152 / 0.5)', text: 'oklch(0.84 0.16 152)', dot: 'oklch(0.74 0.16 152)' },
    review:      { bg: 'oklch(0.32 0.10 75 / 0.5)',  text: 'oklch(0.85 0.14 75)',  dot: 'oklch(0.82 0.14 75)' },
    deprecated:  { bg: 'oklch(0.30 0.02 255 / 0.5)', text: 'oklch(0.70 0.014 255)',dot: 'oklch(0.55 0.014 255)' },
    banned:      { bg: 'oklch(0.28 0.10 22 / 0.5)',  text: 'oklch(0.78 0.18 22)',  dot: 'oklch(0.70 0.18 22)' },
  }[status];
}

function regCategoryLabel(cat, t) {
  return t.filters[cat] || cat;
}

function regRiskColor(tier, theme) {
  const isLight = theme && theme.name === 'light';
  if (isLight) {
    if (tier.startsWith('A')) return 'oklch(0.45 0.15 152)';
    if (tier.startsWith('B')) return 'oklch(0.50 0.13 65)';
    if (tier.startsWith('C')) return 'oklch(0.50 0.18 22)';
    return 'oklch(0.50 0.014 255)';
  }
  if (tier.startsWith('A')) return 'oklch(0.74 0.16 152)';
  if (tier.startsWith('B')) return 'oklch(0.82 0.14 75)';
  if (tier.startsWith('C')) return 'oklch(0.78 0.18 22)';
  return 'oklch(0.66 0.014 255)';
}

Object.assign(window, { PROTOCOLS, DATA_SOURCES, REG_I18N, regStatusColor, regCategoryLabel, regRiskColor });
