// Component 2: Proposal Submission Form — data layer.
// Treasury assets, action types, validation rules, AI parser hints.

const TREASURY = {
  totalUsd: 1062184,
  assets: [
    { sym: 'mUSDC', name: 'Mock USDC', balance: 1062184, usd: 1062184, decimals: 6, color: 'oklch(0.74 0.16 245)', icon: '$' },
    { sym: 'ETH',   name: 'Ethereum',  balance: 0.84,    usd: 2812,    decimals: 18, color: 'oklch(0.70 0.10 280)', icon: 'Ξ' },
    { sym: 'WETH',  name: 'Wrapped ETH', balance: 0,    usd: 0,       decimals: 18, color: 'oklch(0.70 0.10 280)', icon: 'Ξ' },
    { sym: 'DAI',   name: 'Dai',        balance: 0,    usd: 0,       decimals: 18, color: 'oklch(0.78 0.14 75)',  icon: '◈' },
    { sym: 'USDT',  name: 'Tether',     balance: 0,    usd: 0,       decimals: 6,  color: 'oklch(0.74 0.16 152)', icon: '₮' },
  ],
};

// Action protocols / venues.
const PROTOCOLS = {
  transfer: [
    { id: 'eoa', label: { en: 'External wallet', pl: 'Zewnętrzny portfel' }, hint: 'EOA / multisig' },
    { id: 'safe', label: { en: 'Safe wallet', pl: 'Safe wallet' }, hint: 'Gnosis Safe' },
    { id: 'grant', label: { en: 'Grant payout', pl: 'Wypłata grantu' }, hint: 'tagged' },
  ],
  swap: [
    { id: '1inch', label: { en: '1inch aggregator', pl: '1inch aggregator' }, hint: 'best route' },
    { id: 'uniswap', label: { en: 'Uniswap v3', pl: 'Uniswap v3' }, hint: 'direct' },
    { id: 'cowswap', label: { en: 'CoW Swap', pl: 'CoW Swap' }, hint: 'mev-protected' },
  ],
  deposit: [
    { id: 'aave', label: { en: 'Aave v3', pl: 'Aave v3' }, hint: '~4.2% APY · Base', apy: 4.2, tvl: '184M' },
    { id: 'compound', label: { en: 'Compound v3', pl: 'Compound v3' }, hint: '~3.8% APY · Base', apy: 3.8, tvl: '92M' },
    { id: 'morpho', label: { en: 'Morpho Blue', pl: 'Morpho Blue' }, hint: '~4.6% APY · Base', apy: 4.6, tvl: '54M' },
    { id: 'yearn', label: { en: 'Yearn v3', pl: 'Yearn v3' }, hint: '~5.1% APY · Base', apy: 5.1, tvl: '38M' },
  ],
};

// Council Rules — used for validation (mixed: soft warnings + hard blocks).
const COUNCIL_RULES = {
  // Hard: blocked entirely
  max_per_asset_pct: 30,      // single asset > 30% of treasury -> block
  max_per_protocol_pct: 15,   // single protocol > 15% of treasury -> block
  // Soft: warning only, requires HITL waiver but user can still submit
  soft_per_protocol_pct: 5,   // > 5% -> soft warning
  // Other guards
  min_amount: 100,            // < 100 USD -> not worth gas
};

// Validate a parsed proposal. Returns { errors: [], warnings: [], info: [] }.
function validateProposal(p, treasury = TREASURY) {
  const out = { errors: [], warnings: [], info: [] };
  if (!p) return out;
  if (p.action === 'transfer' || p.action === 'deposit' || p.action === 'swap') {
    if (!p.amount || p.amount <= 0) {
      out.errors.push({ key: 'noAmount', en: 'Amount is required.', pl: 'Kwota jest wymagana.' });
      return out;
    }
    const asset = treasury.assets.find((a) => a.sym === p.asset);
    if (!asset) {
      out.errors.push({ key: 'noAsset', en: 'Pick an asset from the treasury.', pl: 'Wybierz aktywo ze skarbca.' });
      return out;
    }
    if (p.amount > asset.balance) {
      out.errors.push({ key: 'insufficient',
        en: `Insufficient balance — treasury holds ${asset.balance.toLocaleString()} ${asset.sym}.`,
        pl: `Brak srodkow — skarbiec posiada ${asset.balance.toLocaleString()} ${asset.sym}.` });
      return out;
    }
    const usdValue = p.amount * (asset.usd / Math.max(1, asset.balance));
    const pctOfTreasury = (usdValue / treasury.totalUsd) * 100;
    if (pctOfTreasury > COUNCIL_RULES.max_per_asset_pct) {
      out.errors.push({ key: 'hardCap',
        en: `Exceeds 30% per-asset hard cap (${pctOfTreasury.toFixed(1)}% of treasury). Council Rules block this.`,
        pl: `Przekracza twardy limit 30% na aktywo (${pctOfTreasury.toFixed(1)}% skarbca). Zasady Rady to blokuja.` });
    } else if (pctOfTreasury > COUNCIL_RULES.max_per_protocol_pct && p.action === 'deposit') {
      out.errors.push({ key: 'hardProto',
        en: `Exceeds 15% per-protocol hard cap (${pctOfTreasury.toFixed(1)}%).`,
        pl: `Przekracza twardy limit 15% na protokol (${pctOfTreasury.toFixed(1)}%).` });
    } else if (pctOfTreasury > COUNCIL_RULES.soft_per_protocol_pct && p.action === 'deposit') {
      out.warnings.push({ key: 'softCap',
        en: `${pctOfTreasury.toFixed(1)}% of treasury — exceeds 5% soft cap. Council can pass it but will require an HITL waiver.`,
        pl: `${pctOfTreasury.toFixed(1)}% skarbca — przekracza miekki limit 5%. Rada moze to przepuscic, ale wymaga zgody HITL.` });
    }
    if (usdValue < COUNCIL_RULES.min_amount) {
      out.warnings.push({ key: 'tiny',
        en: `Amount under $100 — gas may exceed the move's value.`,
        pl: `Kwota poniżej $100 — koszt gas może przekroczyc wartość operacji.` });
    }
    out.info.push({ key: 'pct', en: `${pctOfTreasury.toFixed(1)}% of treasury`, pl: `${pctOfTreasury.toFixed(1)}% skarbca` });
  }
  return out;
}

// Lightweight natural-language parser. Recognizes:
//   "allocate 100k usdc to aave"
//   "send 50,000 usdc to 0x..."
//   "swap 0.5 eth for usdc"
//   "deposit 100k mUSDC into morpho for 30 days"
function parseFreeText(text, locale = 'en') {
  if (!text) return null;
  const lower = text.toLowerCase();
  const parsed = { action: null, amount: null, asset: null, protocol: null, target: null, term: 30, rationale: text.trim(), confidence: 0 };

  // amount: 100k, 100,000, 1.5
  const amountMatch = lower.match(/(\d{1,3}(?:[,_]\d{3})*(?:\.\d+)?)\s*(k|m|b)?/i);
  if (amountMatch) {
    let n = parseFloat(amountMatch[1].replace(/[,_]/g, ''));
    const suf = (amountMatch[2] || '').toLowerCase();
    if (suf === 'k') n *= 1000;
    else if (suf === 'm') n *= 1_000_000;
    else if (suf === 'b') n *= 1_000_000_000;
    parsed.amount = n;
    parsed.confidence += 0.25;
  }

  // asset
  const assetMatches = ['musdc', 'usdc', 'eth', 'weth', 'dai', 'usdt'];
  for (const a of assetMatches) {
    if (lower.includes(a)) {
      parsed.asset = a === 'musdc' ? 'mUSDC' : a.toUpperCase();
      parsed.confidence += 0.2;
      break;
    }
  }
  if (!parsed.asset) parsed.asset = 'mUSDC'; // default

  // action verb
  if (/(deposit|allocate|supply|stake|lend|earn|yield)/i.test(lower)) { parsed.action = 'deposit'; parsed.confidence += 0.25; }
  else if (/(swap|trade|convert|exchange)/i.test(lower)) { parsed.action = 'swap'; parsed.confidence += 0.25; }
  else if (/(send|transfer|pay|payout|grant)/i.test(lower)) { parsed.action = 'transfer'; parsed.confidence += 0.25; }

  // protocol
  if (/(aave)/i.test(lower)) { parsed.protocol = 'aave'; parsed.action = parsed.action || 'deposit'; parsed.confidence += 0.15; }
  else if (/(compound)/i.test(lower)) { parsed.protocol = 'compound'; parsed.action = parsed.action || 'deposit'; parsed.confidence += 0.15; }
  else if (/(morpho)/i.test(lower)) { parsed.protocol = 'morpho'; parsed.action = parsed.action || 'deposit'; parsed.confidence += 0.15; }
  else if (/(yearn)/i.test(lower)) { parsed.protocol = 'yearn'; parsed.action = parsed.action || 'deposit'; parsed.confidence += 0.15; }
  else if (/(uniswap|uni)/i.test(lower)) { parsed.protocol = 'uniswap'; parsed.action = parsed.action || 'swap'; parsed.confidence += 0.1; }
  else if (/(1inch)/i.test(lower)) { parsed.protocol = '1inch'; parsed.action = parsed.action || 'swap'; parsed.confidence += 0.1; }
  else if (/(cowswap|cow swap)/i.test(lower)) { parsed.protocol = 'cowswap'; parsed.action = parsed.action || 'swap'; parsed.confidence += 0.1; }

  // address (target for transfer)
  const addrMatch = text.match(/0x[a-fA-F0-9]{6,}/);
  if (addrMatch) { parsed.target = addrMatch[0]; parsed.confidence += 0.1; }
  // ENS-style
  const ensMatch = text.match(/[a-z0-9-]+\.eth/i);
  if (ensMatch) { parsed.target = ensMatch[0]; parsed.confidence += 0.1; }

  // term
  const termMatch = lower.match(/(\d+)\s*(d|day|days|dni)/);
  if (termMatch) parsed.term = parseInt(termMatch[1]);

  parsed.confidence = Math.min(1, parsed.confidence);
  return parsed;
}

// I18N — extends I18N with Component-2-specific keys.
const FORM_I18N = {
  en: {
    formTitle: 'New proposal',
    formSubtitle: 'Describe the action in plain English. AI will draft the structured proposal — review before convening.',
    placeholder: 'e.g. "allocate 100k mUSDC to Aave v3 for 30 days"',
    or: 'or',
    pickAction: 'Pick an action',
    transfer: 'Transfer',
    transferHint: 'Send assets to a wallet or grantee',
    swap: 'Swap',
    swapHint: 'Trade one asset for another',
    deposit: 'Deposit',
    depositHint: 'Earn yield on a DeFi protocol',
    asset: 'Asset',
    amount: 'Amount',
    max: 'Max',
    half: '50%',
    target: 'To',
    targetPlaceholder: '0x… or name.eth',
    protocol: 'Protocol',
    term: 'Term (days)',
    rationale: 'Rationale',
    rationaleHint: 'Optional context the council will consider.',
    rationalePlaceholder: 'Why this proposal? What outcome do you expect?',
    aiDraft: 'AI draft',
    aiConfidence: 'AI confidence',
    aiHint: 'Edit any field below — the council will see your final version.',
    parseAgain: 'Re-parse',
    cancel: 'Discard',
    preview: 'Preview & convene',
    previewTitle: 'Preview transaction',
    previewSubtitle: 'This is what will execute on-chain if council approves.',
    from: 'From',
    to: 'To',
    value: 'Value',
    calldata: 'Calldata',
    gasEst: 'Gas estimate',
    council: 'Council',
    councilHint: '5 agents will debate this proposal',
    afterExec: 'After execution',
    treasuryNow: 'Treasury now',
    treasuryAfter: 'Treasury after',
    expectedYield: 'Expected yield',
    over: 'over',
    days: 'days',
    convene: 'Convene Council',
    back: 'Edit',
    submitting: 'Submitting…',
    success: 'Council convened',
    successHint: 'Watch the live debate above. The verdict will execute automatically if approved.',
    seeDebate: 'See live debate',
    walletNotConnected: 'Connect a wallet to submit',
    walletHint: 'Only DAO members can convene the council. Connect to verify membership.',
    connect: 'Connect wallet',
    notMember: 'Not a DAO member',
    notMemberHint: 'This wallet is not a member of AI Treasury Council. Submit a member application or switch wallets.',
    memberApply: 'Apply for membership',
    switchWallet: 'Switch wallet',
    countCheck: 'Council Rules check',
    rulesPassed: 'All checks pass',
    softWarning: 'Soft cap warning',
    hardBlock: 'Council Rules block',
    submitDespite: 'Submit anyway (HITL)',
    fixIt: 'Fix amount',
    proposer: 'Proposer',
    youMember: 'DAO member',
    rep: 'Rep',
    diff: 'Diff',
    minus: '−',
    plus: '+',
    aiSuggests: 'AI suggests',
    pickFromTreasury: 'Pick from treasury',
    rule: 'Rule',
    riskScore: 'Risk score',
    risk_low: 'Low',
    risk_medium: 'Medium',
    risk_high: 'High',
    estApy: 'est. APY',
    perAsset: 'per-asset cap',
    perProtocol: 'per-protocol cap',
    minAmount: 'min amount',
    soft: 'soft',
    hard: 'hard',
    free: 'Free description',
    structured: 'Structured form',
  },
  pl: {
    formTitle: 'Nowa propozycja',
    formSubtitle: 'Opisz akcje wlasnymi slowami. AI wygeneruje strukturyzowana propozycje — sprawdz przed zwolaniem.',
    placeholder: 'np. "wploc 100k mUSDC na Aave v3 na 30 dni"',
    or: 'lub',
    pickAction: 'Wybierz akcje',
    transfer: 'Transfer',
    transferHint: 'Wyslij srodki do portfela lub odbiorcy grantu',
    swap: 'Wymien',
    swapHint: 'Wymien jedno aktywo na inne',
    deposit: 'Wploc',
    depositHint: 'Zarabiaj yield na protokole DeFi',
    asset: 'Aktywo',
    amount: 'Kwota',
    max: 'Max',
    half: '50%',
    target: 'Do',
    targetPlaceholder: '0x… lub nazwa.eth',
    protocol: 'Protokol',
    term: 'Okres (dni)',
    rationale: 'Uzasadnienie',
    rationaleHint: 'Opcjonalny kontekst dla rady.',
    rationalePlaceholder: 'Dlaczego ta propozycja? Jakiego rezultatu oczekujesz?',
    aiDraft: 'Szkic AI',
    aiConfidence: 'Pewnosc AI',
    aiHint: 'Edytuj dowolne pole — rada zobaczy Twoja koncowa wersje.',
    parseAgain: 'Parsuj ponownie',
    cancel: 'Odrzuc',
    preview: 'Podglad i zwolaj',
    previewTitle: 'Podglad transakcji',
    previewSubtitle: 'To zostanie wykonane on-chain jezeli rada zatwierdzi.',
    from: 'Z',
    to: 'Do',
    value: 'Wartosc',
    calldata: 'Calldata',
    gasEst: 'Szacowany gas',
    council: 'Rada',
    councilHint: '5 agentow przedebatuje ta propozycje',
    afterExec: 'Po wykonaniu',
    treasuryNow: 'Skarbiec teraz',
    treasuryAfter: 'Skarbiec po',
    expectedYield: 'Oczekiwany yield',
    over: 'przez',
    days: 'dni',
    convene: 'Zwolaj Rade',
    back: 'Edytuj',
    submitting: 'Wysylam…',
    success: 'Rada zwolana',
    successHint: 'Obserwuj debate na zywo wyzej. Werdykt wykona sie automatycznie po zatwierdzeniu.',
    seeDebate: 'Zobacz debate',
    walletNotConnected: 'Polacz portfel aby zlozyc propozycje',
    walletHint: 'Tylko czlonkowie DAO moga zwolac rade. Polacz portfel, aby zweryfikowac czlonkostwo.',
    connect: 'Polacz portfel',
    notMember: 'Nie jestes czlonkiem DAO',
    notMemberHint: 'Ten portfel nie jest czlonkiem AI Treasury Council. Zloz wniosek o czlonkostwo lub zmien portfel.',
    memberApply: 'Aplikuj o czlonkostwo',
    switchWallet: 'Zmien portfel',
    countCheck: 'Sprawdzenie zasad rady',
    rulesPassed: 'Wszystkie reguly OK',
    softWarning: 'Ostrzezenie miekkiego limitu',
    hardBlock: 'Twardy limit rady',
    submitDespite: 'Wyslij mimo to (HITL)',
    fixIt: 'Popraw kwote',
    proposer: 'Wnioskodawca',
    youMember: 'Czlonek DAO',
    rep: 'Rep',
    diff: 'Diff',
    minus: '−',
    plus: '+',
    aiSuggests: 'AI sugeruje',
    pickFromTreasury: 'Wybierz ze skarbca',
    rule: 'Regula',
    riskScore: 'Ocena ryzyka',
    risk_low: 'Niska',
    risk_medium: 'Srednia',
    risk_high: 'Wysoka',
    estApy: 'szac. APY',
    perAsset: 'limit na aktywo',
    perProtocol: 'limit na protokol',
    minAmount: 'min kwota',
    soft: 'soft',
    hard: 'hard',
    free: 'Opis tekstowy',
    structured: 'Strukturyzowany formularz',
  },
};

Object.assign(window, { TREASURY, PROTOCOLS, COUNCIL_RULES, validateProposal, parseFreeText, FORM_I18N });
