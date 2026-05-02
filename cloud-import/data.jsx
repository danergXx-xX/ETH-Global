// Shared mock data + i18n + typewriter hook for all debate viewer variants.
// Single source of truth — variants only restyle, never re-author content.

const PROPOSAL = {
  en: 'Allocate 100,000 USDC from treasury to Aave v3 USDC supply for 4.2% est. APY. 30-day initial term, auto-renew unless DAO cancels. Withdraw at any time (no lock).',
  pl: 'Przeznaczyć 100 000 USDC ze skarbca DAO na Aave v3 USDC supply dla szacowanego APY 4,2%. Okres początkowy 30 dni, auto-odnowienie chyba ze DAO anuluje. Wypłata w dowolnej chwili (bez locka).',
  meta: { id: 'PROP-042', amount: '100,000 USDC', target: 'Aave v3 (Base)', est_apy: '4.2%' },
};

// Five agents. Each has bilingual reasoning broken into "claims" — a claim
// is a sentence + an inline source citation. The typewriter renders claims
// in order; sources resolve to entries in the SOURCES table.
const AGENTS = [
  {
    id: 'bull',
    ens: 'bull.aicouncil.eth',
    label: { en: 'Bull', pl: 'Optymista' },
    bias: { en: 'opportunity-seeking', pl: 'szuka okazji' },
    rep: 87,
    statements: 412,
    color: { hue: 152, accent: 'oklch(0.78 0.16 152)', soft: 'oklch(0.32 0.07 152)', headerBg: 'oklch(0.30 0.085 152)', headerText: 'oklch(0.94 0.05 152)' },
    decision: 'FOR',
    confidence: 0.84,
    claims: {
      en: [
        { t: 'Aave v3 USDC supply on Base has held a 30d rolling APY between 3.9 and 4.6 percent through Q1 2026', s: 1 },
        { t: 'TVL on the pool sits at 184M USDC with utilization at 72 percent, comfortably below the kink point', s: 2 },
        { t: 'Estimated yield on 100k over 30 days is ~345 USDC after gas, net of standard reserve factor', s: 3 },
        { t: 'Pool is flagged as no-lock - exit liquidity tested at 50M+ in single-block redemptions over the past quarter', s: 1 },
      ],
      pl: [
        { t: 'Aave v3 USDC supply na Base utrzymuje 30-dniowy APY w przedziale 3,9 - 4,6 procent przez Q1 2026', s: 1 },
        { t: 'TVL na puli wynosi 184M USDC przy wykorzystaniu 72 procent, wyraznie poniżej kink point', s: 2 },
        { t: 'Szacowany zwrot ze 100k w 30 dni to ~345 USDC po koszcie gas, netto reserve factor', s: 3 },
        { t: 'Pula bez locka - plynnosc wyjscia testowana przy 50M+ w jednoblokowych wyplatach w ostatnim kwartale', s: 1 },
      ],
    },
  },
  {
    id: 'bear',
    ens: 'bear.aicouncil.eth',
    label: { en: 'Bear', pl: 'Sceptyk' },
    bias: { en: 'risk-aware', pl: 'wyczulony na ryzyko' },
    rep: 91,
    statements: 503,
    color: { hue: 22, accent: 'oklch(0.73 0.17 22)', soft: 'oklch(0.30 0.09 22)', headerBg: 'oklch(0.28 0.10 22)', headerText: 'oklch(0.94 0.06 22)' },
    decision: 'AGAINST',
    confidence: 0.71,
    claims: {
      en: [
        { t: 'Smart-contract risk is non-zero - Aave v3 had a paused-asset incident in Nov 2025 affecting GHO collateral', s: 4 },
        { t: 'Concentration is the real issue - 100k is 9.4 percent of stated treasury, breaching the proposed 5 percent solo-protocol cap', s: 5 },
        { t: 'Yield premium over short T-bill equivalents is roughly 90bps after gas - thin compensation for added surface', s: 3 },
        { t: 'Recommend laddering across two protocols or capping at 50k for a 14-day pilot', s: null },
      ],
      pl: [
        { t: 'Ryzyko smart-kontraktu jest niezerowe - Aave v3 mial incydent paused-asset w listopadzie 2025 dotyczacy GHO', s: 4 },
        { t: 'Realny problem to koncentracja - 100k to 9,4 procent skarbca, łamie proponowany cap 5 procent na pojedynczy protokol', s: 5 },
        { t: 'Premia ponad T-bill po koszcie gas to okolo 90bps - cienka rekompensata za dodatkowa powierzchnie ataku', s: 3 },
        { t: 'Rekomenduję rozłożyć na dwa protokoly lub ograniczyć do 50k jako 14-dniowy pilot', s: null },
      ],
    },
  },
  {
    id: 'risk',
    ens: 'risk.aicouncil.eth',
    label: { en: 'Risk', pl: 'Ryzyko' },
    bias: { en: 'quantitative', pl: 'kwantytatywny' },
    rep: 94,
    statements: 388,
    color: { hue: 78, accent: 'oklch(0.82 0.15 78)', soft: 'oklch(0.32 0.08 78)', headerBg: 'oklch(0.32 0.09 78)', headerText: 'oklch(0.96 0.06 95)' },
    decision: 'FOR',
    confidence: 0.66,
    claims: {
      en: [
        { t: 'VaR(95) on 100k USDC supply over 30 days, given historical depeg events, is bounded at 1,840 USDC', s: 6 },
        { t: 'Sharpe of allocation versus idle stable is 1.7 on trailing 90 days', s: 6 },
        { t: 'Rule check - exceeds the 5 percent solo-protocol soft cap by 4.4 points but stays within 30 percent per-asset hard cap', s: 7 },
        { t: 'Net position - quant case clears, governance case requires HITL sign-off on the soft-cap waiver', s: null },
      ],
      pl: [
        { t: 'VaR(95) na 100k USDC supply w 30 dni, biorąc historyczne depegs, ograniczony do 1840 USDC', s: 6 },
        { t: 'Sharpe alokacji vs idle stable wynosi 1,7 na trailing 90 dni', s: 6 },
        { t: 'Sprawdzenie zasad - przekracza soft cap 5 procent na pojedynczy protokol o 4,4 pkt, ale miesci się w hard cap 30 procent na aktywo', s: 7 },
        { t: 'Pozycja netto - kwant case zalicza, governance wymaga HITL na waiver soft-capa', s: null },
      ],
    },
  },
  {
    id: 'tech',
    ens: 'tech.aicouncil.eth',
    label: { en: 'Tech', pl: 'Technologia' },
    bias: { en: 'technical due diligence', pl: 'audyt techniczny' },
    rep: 82,
    statements: 271,
    color: { hue: 245, accent: 'oklch(0.74 0.15 245)', soft: 'oklch(0.30 0.09 245)', headerBg: 'oklch(0.28 0.11 245)', headerText: 'oklch(0.94 0.05 245)' },
    decision: 'FOR',
    confidence: 0.78,
    claims: {
      en: [
        { t: 'Aave v3 contracts on Base are at v3.0.2, audited by Spearbit and Certora, last formal verification April 2026', s: 8 },
        { t: 'aUSDC token integrates cleanly with our existing OpenZeppelin governance executor - no custom adapter needed', s: 9 },
        { t: 'Pool oracle uses Chainlink USDC/USD with 0.5 percent deviation threshold and 24h heartbeat - acceptable', s: 8 },
        { t: 'Single tx execution path. Gas estimate 184k on Base - approximately 0.04 USDC at current basefee', s: 9 },
      ],
      pl: [
        { t: 'Kontrakty Aave v3 na Base sa w wersji 3.0.2, audytowane przez Spearbit i Certora, ostatnia formal verification kwiecien 2026', s: 8 },
        { t: 'Token aUSDC integruje się czysto z naszym executorem OpenZeppelin governance - brak custom adaptera', s: 9 },
        { t: 'Oracle puli to Chainlink USDC/USD z progiem dewiacji 0,5 procent i heartbeat 24h - akceptowalne', s: 8 },
        { t: 'Ścieżka egzekucji single tx. Gas estimate 184k na Base - okolo 0,04 USDC przy obecnym basefee', s: 9 },
      ],
    },
  },
  {
    id: 'sentiment',
    ens: 'sentiment.aicouncil.eth',
    label: { en: 'Sentiment', pl: 'Sentyment' },
    bias: { en: 'market psychology', pl: 'psychologia rynku' },
    rep: 76,
    statements: 198,
    color: { hue: 305, accent: 'oklch(0.74 0.16 305)', soft: 'oklch(0.30 0.09 305)', headerBg: 'oklch(0.28 0.10 305)', headerText: 'oklch(0.94 0.05 305)' },
    decision: 'ABSTAIN',
    confidence: 0.52,
    claims: {
      en: [
        { t: 'aixbt sentiment score on Aave is +0.31 over trailing 7 days - mildly positive, not euphoric', s: 10 },
        { t: 'CT discussion volume around Aave v3 Base is up 18 percent week-over-week, mostly neutral framing', s: 10 },
        { t: 'No signal in either direction strong enough to override quant-driven outcome', s: null },
        { t: 'Abstaining - ceding the call to risk and tech who have higher-conviction reads here', s: null },
      ],
      pl: [
        { t: 'Aixbt sentiment score na Aave to +0,31 w trailing 7 dni - lekko pozytywny, nie euforyczny', s: 10 },
        { t: 'Wolumen dyskusji CT wokol Aave v3 Base wzrosl 18 procent w/w, glownie framing neutralny', s: 10 },
        { t: 'Brak sygnalu w ktoryms kierunku wystarczajaco mocnego by przewazyc kwant-driven wynik', s: null },
        { t: 'Wstrzymuję się - oddaje głos risk i tech, które maja tu wyższa konwikcje', s: null },
      ],
    },
  },
];

const SOURCES = {
  1: { title: 'DeFiLlama - Aave v3 USDC pool (Base)', type: 'defillama', url: 'https://defillama.com/yields/pool/aave-v3-usdc-base', conf: 0.92, snippet: '30d rolling APY 4.21%, TVL 184.3M USDC, utilization 72.4%, deposits 24h: 6.1M' },
  2: { title: 'Aave v3 risk parameters - Base USDC reserve', type: 'defillama', url: 'https://app.aave.com/reserve-overview/?underlyingAsset=usdc&marketName=base', conf: 0.94, snippet: 'Optimal utilization 80%. Slope1 4%, Slope2 60%. Reserve factor 10%. Current state: below kink.' },
  3: { title: 'CoinGecko - USDC stable benchmarks', type: 'coingecko', url: 'https://www.coingecko.com/en/coins/usd-coin', conf: 0.88, snippet: '30d depeg max 0.18%, T-bill equiv yield 3.31% Apr 2026, base risk-free spread vs Aave: ~89bps' },
  4: { title: 'Aave Governance forum - Nov 2025 GHO incident retro', type: 'rss', url: 'https://governance.aave.com/t/gho-collateral-pause-retrospective', conf: 0.81, snippet: 'GHO collateral was paused for 4h11m; root cause oracle staleness; mitigations deployed v3.0.2.' },
  5: { title: 'Council Rules v0.4 - per-protocol concentration cap', type: 'perplexity', url: 'https://aicouncil.eth.limo/rules', conf: 0.99, snippet: 'max_per_protocol_pct: 5 (soft), max_per_asset_pct: 30 (hard). Soft requires HITL waiver.' },
  6: { title: 'Internal risk model - VaR backtest 90d', type: 'perplexity', url: 'https://0g.ai/storage/cid/bafy...risk-q1-2026', conf: 0.86, snippet: 'VaR(95) for 100k USDC supplied to Aave v3 over 30 days bounded at 1.84% under historical depeg distribution.' },
  7: { title: 'Council Rules v0.4 - hard caps', type: 'perplexity', url: 'https://aicouncil.eth.limo/rules#caps', conf: 0.99, snippet: 'Hard cap per asset: 30%. Hard cap per protocol: 15%. Soft cap per protocol: 5%, requires HITL.' },
  8: { title: 'Spearbit audit report - Aave v3.0.2', type: 'rss', url: 'https://github.com/spearbit/portfolio/aave-v3-0-2.pdf', conf: 0.93, snippet: 'No critical or high findings. 3 medium accepted, 7 low fixed in v3.0.2-rc1. Formal verification by Certora attached.' },
  9: { title: 'Aave v3 dev docs - aToken integration', type: 'rss', url: 'https://docs.aave.com/developers/tokens/atoken', conf: 0.90, snippet: 'aTokens are ERC-20 with rebasing balance. Standard transfer/approve. No custom adapter required for OZ governance.' },
  10: { title: 'aixbt - Aave sentiment trailing 7d', type: 'aixbt', url: 'https://aixbt.tech/asset/aave', conf: 0.74, snippet: 'Composite score: +0.31. Volume index: +18% wow. Top themes: stability, rate competitiveness, Base growth.' },
};

const I18N = {
  en: {
    proposalLabel: 'Proposal',
    convene: 'Convene Council',
    debating: 'Debating',
    waiting: 'Waiting',
    done: 'Done',
    error: 'Error - retry',
    rep: 'Rep',
    confidence: 'Conf',
    sources: 'Sources',
    analyzing: 'Analyzing sources',
    fetchingChain: 'Fetching on-chain data',
    weighingArgs: 'Weighing arguments',
    castingVote: 'Casting vote',
    decision: 'Decision',
    voteFor: 'For',
    voteAgainst: 'Against',
    voteAbstain: 'Abstain',
    tally: 'Vote tally',
    verdict: 'Council verdict',
    verdictApprove: 'Approve',
    verdictReject: 'Reject',
    verdictSplit: 'No consensus',
    statements: 'statements',
    bias: 'Bias',
    elapsed: 'Elapsed',
    submitOnchain: 'Submit on-chain',
    languageToggle: 'PL',
    title: 'CONCLAVE',
    subtitle: 'Live Debate Viewer',
    state: 'State',
    sourceConfidence: 'Source confidence',
    stop: 'Stop',
    pause: 'Pause',
    resume: 'Resume',
    skip: 'Skip to verdict',
    replay: 'Replay',
    soundOn: 'Sound on',
    soundOff: 'Sound off',
    reduceMotion: 'Reduce motion',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    eta: 'Est',
    remaining: 'remaining',
    gas: 'Gas',
    network: 'Network',
    block: 'block',
    archiving: 'Archiving',
    archived: 'Archived to 0G',
    cidPending: 'CID pending',
    notFinAdvice: 'Not financial advice',
    copy: 'Copy',
    share: 'Share link',
    copied: 'Copied',
    focus: 'Focus on agent',
    unfocus: 'Show all',
    waitingTitle: 'Awaiting proposal',
    waitingHint: 'Submit a treasury proposal to convene the council. Five agents will debate, vote, and produce an on-chain audit trail.',
    connectWallet: 'Connect wallet',
    skippedTo: 'Skipped to verdict',
    keyboardHint: 'Space pause · → skip · R replay · Esc stop',
    continueWithout: 'Continue without this agent',
    retryFetch: 'Retry fetch',
    timestamp: 'T+',
    verdictWaiting: 'Awaiting verdict',
  },
  pl: {
    proposalLabel: 'Propozycja',
    convene: 'Zwolaj Radę',
    debating: 'Debata w toku',
    waiting: 'Oczekiwanie',
    done: 'Gotowe',
    error: 'Blad - sprobuj ponownie',
    rep: 'Rep',
    confidence: 'Konw',
    sources: 'Źródła',
    analyzing: 'Analizuje źródła',
    fetchingChain: 'Pobieram dane on-chain',
    weighingArgs: 'Wazenie argumentow',
    castingVote: 'Oddaje głos',
    decision: 'Decyzja',
    voteFor: 'Za',
    voteAgainst: 'Przeciw',
    voteAbstain: 'Wstrzymanie',
    tally: 'Wynik glosowania',
    verdict: 'Werdykt rady',
    verdictApprove: 'Przyjac',
    verdictReject: 'Odrzucic',
    verdictSplit: 'Brak konsensusu',
    statements: 'wypowiedzi',
    bias: 'Bias',
    elapsed: 'Czas',
    submitOnchain: 'Zglos on-chain',
    languageToggle: 'EN',
    title: 'CONCLAVE',
    subtitle: 'Podglad debaty na zywo',
    state: 'Stan',
    sourceConfidence: 'Pewność źródła',
    stop: 'Zatrzymaj',
    pause: 'Pauza',
    resume: 'Wznow',
    skip: 'Pomin do werdyktu',
    replay: 'Powtorz',
    soundOn: 'Dzwiek wlaczony',
    soundOff: 'Dzwiek wylaczony',
    reduceMotion: 'Mniej animacji',
    theme: 'Motyw',
    light: 'Jasny',
    dark: 'Ciemny',
    eta: 'Ok.',
    remaining: 'pozostalo',
    gas: 'Gas',
    network: 'Siec',
    block: 'blok',
    archiving: 'Archiwizuje',
    archived: 'Zarchiwizowano w 0G',
    cidPending: 'CID oczekuje',
    notFinAdvice: 'To nie porada finansowa',
    copy: 'Kopiuj',
    share: 'Udostepnij link',
    copied: 'Skopiowano',
    focus: 'Skup na agencie',
    unfocus: 'Pokaz wszystkich',
    waitingTitle: 'Oczekiwanie na propozycje',
    waitingHint: 'Złożenie propozycji skarbcowej zwola radę. Piec agentow przeprowadzi debate, zaglosuje i zapisze sciezke audytu on-chain.',
    connectWallet: 'Polacz portfel',
    skippedTo: 'Pominieto do werdyktu',
    keyboardHint: 'Spacja pauza · → pomin · R powtorz · Esc stop',
    continueWithout: 'Kontynuuj bez tego agenta',
    retryFetch: 'Sprobuj ponownie',
    timestamp: 'T+',
    verdictWaiting: 'Oczekiwanie na werdykt',
  },
};

// useTypewriter — drives a per-agent typewriter that advances claim-by-claim.
// Returns { typed: string, claimIdx, status: 'idle'|'typing'|'pausing'|'done',
// statusKey: i18n key for status pill }.
function useTypewriter(agent, locale, mode, speed = 1) {
  // mode: 'waiting' | 'debating' | 'done' | 'error'
  const claims = agent.claims[locale];
  const [tick, setTick] = React.useState(0);
  const stateRef = React.useRef({ claimIdx: 0, charIdx: 0, status: 'idle', startedAt: 0, statusStage: 0 });
  const rafRef = React.useRef(null);

  React.useEffect(() => {
    if (mode === 'waiting') {
      stateRef.current = { claimIdx: 0, charIdx: 0, status: 'idle', startedAt: 0, statusStage: 0 };
      setTick((t) => t + 1);
      return;
    }
    if (mode === 'done') {
      stateRef.current = { claimIdx: claims.length, charIdx: 0, status: 'done', startedAt: 0, statusStage: 0 };
      setTick((t) => t + 1);
      return;
    }
    if (mode === 'error') {
      stateRef.current = { claimIdx: 0, charIdx: 0, status: 'error', startedAt: 0, statusStage: 0 };
      setTick((t) => t + 1);
      return;
    }
    // debating - drive typewriter
    let last = performance.now();
    let acc = 0;
    stateRef.current = { claimIdx: 0, charIdx: 0, status: 'typing', startedAt: last, statusStage: 0 };
    const baseMsPerChar = 22 / Math.max(0.25, speed);
    const punctPause = 220 / Math.max(0.25, speed);
    const sentencePause = 380 / Math.max(0.25, speed);

    const loop = (now) => {
      const dt = now - last;
      last = now;
      acc += dt;
      const s = stateRef.current;
      // status stage rotates roughly every 1.6s during typing
      const stage = Math.floor((now - s.startedAt) / 1600) % 4;
      if (stage !== s.statusStage) { s.statusStage = stage; }

      while (acc > 0 && s.claimIdx < claims.length) {
        const cur = claims[s.claimIdx].t;
        if (s.charIdx < cur.length) {
          const ch = cur[s.charIdx];
          const cost = (ch === '.' || ch === ',' || ch === ':') ? punctPause : baseMsPerChar;
          if (acc < cost) break;
          acc -= cost;
          s.charIdx += 1;
        } else {
          if (acc < sentencePause) break;
          acc -= sentencePause;
          s.claimIdx += 1;
          s.charIdx = 0;
        }
      }
      if (s.claimIdx >= claims.length) {
        s.status = 'done';
        setTick((t) => t + 1);
        return;
      }
      setTick((t) => t + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [mode, locale, agent.id, speed]);

  const s = stateRef.current;
  // build typed list of claims (full ones + the current partial)
  const typedClaims = [];
  for (let i = 0; i < claims.length; i++) {
    if (i < s.claimIdx) typedClaims.push({ ...claims[i], partial: false, text: claims[i].t });
    else if (i === s.claimIdx && s.status === 'typing') typedClaims.push({ ...claims[i], partial: true, text: claims[i].t.slice(0, s.charIdx) });
    else if (s.status === 'done' && mode === 'done') typedClaims.push({ ...claims[i], partial: false, text: claims[i].t });
  }
  const statusKeys = ['analyzing', 'fetchingChain', 'weighingArgs', 'castingVote'];
  return {
    claims: typedClaims,
    status: s.status,
    statusKey: statusKeys[s.statusStage] || 'analyzing',
    progress: claims.length === 0 ? 0 : (s.claimIdx + (claims[s.claimIdx] ? s.charIdx / claims[s.claimIdx].t.length : 0)) / claims.length,
  };
}

// useStaggered — returns per-agent mode based on a global mode + per-agent stagger.
// In 'debating' mode, agents start at 0ms, 700ms, 1400ms, 2100ms, 2800ms.
function usePerAgentMode(globalMode, agents, errorAgentId = null) {
  const [perAgent, setPerAgent] = React.useState({});
  React.useEffect(() => {
    setPerAgent({});
    if (globalMode === 'waiting' || globalMode === 'done' || globalMode === 'error') {
      const next = {};
      agents.forEach((a) => {
        next[a.id] = globalMode === 'error' && a.id === (errorAgentId || agents[2].id) ? 'error' : globalMode;
      });
      setPerAgent(next);
      return;
    }
    if (globalMode === 'debating') {
      const timers = [];
      agents.forEach((a, i) => {
        timers.push(setTimeout(() => {
          setPerAgent((p) => ({ ...p, [a.id]: 'debating' }));
        }, i * 700));
      });
      return () => timers.forEach(clearTimeout);
    }
  }, [globalMode, errorAgentId]);
  return perAgent;
}

Object.assign(window, { PROPOSAL, AGENTS, SOURCES, I18N, useTypewriter, usePerAgentMode });
