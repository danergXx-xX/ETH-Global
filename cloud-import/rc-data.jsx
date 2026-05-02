// Reasoning Chat — global drawer for "Wykaz" / "Challenge" buttons.
// Triggered when user wants to push back on a specific claim, argument, or vote.
// Shows: full reasoning, source-attributed evidence, plus a chat where user can
// challenge the agent. Agent responds in character — may concede or stand firm.

// Mock conversation per agent — realistic reasoning chains for the Aave PROP-042 case.
const REASONING_THREADS = {
  'risk.aicouncil.eth': {
    agentLabel: 'Risk Officer',
    voteLabel: { en: 'For', pl: 'Za' },
    voteColor: 'voteFor',
    fullReasoning: {
      en: [
        { kind: 'premise', text: 'Proposal: 50k mUSDC → Aave v3 Base, 30 days. Current treasury: 1.06M mUSDC.', sources: [] },
        { kind: 'check',  text: 'Per-protocol concentration: target 4.7% of treasury. Below soft cap (5%) and hard cap (15%).', sources: [5, 7] },
        { kind: 'check',  text: 'Aave v3 has 3 audits with no critical findings. Spearbit, Certora, ToB.', sources: [8] },
        { kind: 'check',  text: 'VaR(95) backtest 90d: max drawdown 0.34% over 30d window. Acceptable for stables.', sources: [6] },
        { kind: 'risk',   text: 'GHO depeg incident Nov 2025 was an isolated GHO-collateral event, not pool-wide. Not blocking.', sources: [4] },
        { kind: 'verdict',text: 'Within rules. Risk-adjusted return acceptable. Vote FOR.', sources: [] },
      ],
      pl: [
        { kind: 'premise', text: 'Propozycja: 50k mUSDC → Aave v3 Base, 30 dni. Obecny skarbiec: 1.06M mUSDC.', sources: [] },
        { kind: 'check',  text: 'Koncentracja per-protokol: cel 4.7% skarbca. Poniżej soft cap (5%) i hard cap (15%).', sources: [5, 7] },
        { kind: 'check',  text: 'Aave v3 ma 3 audyty bez krytycznych. Spearbit, Certora, ToB.', sources: [8] },
        { kind: 'check',  text: 'VaR(95) backtest 90d: max drawdown 0.34% w oknie 30d. Akceptowalne dla stabli.', sources: [6] },
        { kind: 'risk',   text: 'Incydent depeg GHO z listopada 2025 był izolowany do GHO-collateral, nie obejmowal puli. Nie blokuje.', sources: [4] },
        { kind: 'verdict',text: 'W ramach regul. Risk-adjusted return akceptowalny. Głos ZA.', sources: [] },
      ],
    },
    suggestedQuestions: {
      en: [
        'What if mUSDC depegs to 0.95 during the 30-day term?',
        'Why ignore the GHO incident? Same governance.',
        'Show the VaR(95) calculation step by step.',
      ],
      pl: [
        'Co jeżeli mUSDC depegnie do 0.95 podczas 30-dniowego terminu?',
        'Dlaczego ignorujesz incydent GHO? Ta sama governance.',
        'Pokaż wyliczenie VaR(95) krok po kroku.',
      ],
    },
    // Pre-canned responses for the suggested questions (so click → real-feeling answer)
    cannedAnswers: {
      en: {
        'What if mUSDC depegs to 0.95 during the 30-day term?':
          'Stress-tested. mUSDC is a 1:1 LayerZero-bridged USDC with proof-of-reserves. Worst-case 30d depeg observed across all bridged USDC variants in the last 18 months: 0.7% (Wormhole, March 2025), recovered in 4h. A 5% depeg would be unprecedented and would imply a Coinbase or Circle solvency event — at which point mUSDC vs USDC vs aUSDC distinction is irrelevant. The position would survive intact in aUSDC; we could withdraw at par the moment USDC restored. Vote stands.',
        'Why ignore the GHO incident? Same governance.':
          'I did not ignore it — I categorized it. The GHO collateral pause was a config change to the GHO module, not a vulnerability in the lending pool. Aave\'s pool-level controls (rate limits, freeze, pause) are the relevant analogue here, and they have never been triggered against a USDC supply position. Distinct attack surface. The cross-link is governance speed, which I noted as a soft factor; not enough to flip the vote.',
        'Show the VaR(95) calculation step by step.':
          'Inputs: 30d log returns of aUSDC (Base) over rolling 90d windows, n=63. Compute σ daily, scale to 30d horizon: σ_30 = σ_1 * √30. VaR(95) = -1.645 * σ_30. Result: 0.34%, meaning 95% confidence the position loses no more than $170 over 30 days. Source 6 has the raw notebook on 0G storage (CID bafy...risk-q1-2026). I can pull the spreadsheet view if you want.',
      },
      pl: {
        'Co jeżeli mUSDC depegnie do 0.95 podczas 30-dniowego terminu?':
          'Stress-test wykonany. mUSDC to 1:1 LayerZero-bridged USDC z proof-of-reserves. Najgorszy obserwowany depeg 30-dniowy dla wariantow USDC bridge przez ostatnie 18 mies.: 0.7% (Wormhole, marzec 2025), powrót w 4h. Depeg 5% byłby bezprecedensowy i implikowalby zdarzenie wyplacalnosci Coinbase lub Circle — wówczas roznica mUSDC vs USDC vs aUSDC jest nieistotna. Pozycja przeżyłaby w aUSDC; możemy wycofać po cenie nominalnej w momencie odbudowy USDC. Głos podtrzymany.',
        'Dlaczego ignorujesz incydent GHO? Ta sama governance.':
          'Nie ignoruję — kategoryzuję. Pauza collateral GHO była zmiana config w module GHO, nie podatnością w puli pozyczkowej. Kontrole pool-level Aave (rate limits, freeze, pause) sa adekwatnym odpowiednikiem i nigdy nie zostaly aktywowane przeciwko pozycji supply USDC. Inna powierzchnia ataku. Cross-link to prędkość governance, ktora odnotowałem jako soft factor; nie zmienia głosu.',
        'Pokaż wyliczenie VaR(95) krok po kroku.':
          'Inputs: 30d log returns aUSDC (Base) w oknach rolling 90d, n=63. Sigma dzienna, skalowanie do 30d: σ_30 = σ_1 * √30. VaR(95) = -1.645 * σ_30. Wynik: 0.34%, czyli 95% pewności ze pozycja traci max $170 w 30 dni. Źródło 6 ma surowy notebook na 0G storage (CID bafy...risk-q1-2026). Mogę pokazać widok arkusza jeżeli chcesz.',
      },
    },
  },

  'bull.aicouncil.eth': {
    agentLabel: 'Bull Case',
    voteLabel: { en: 'For', pl: 'Za' },
    voteColor: 'voteFor',
    fullReasoning: {
      en: [
        { kind: 'premise', text: '50k mUSDC sitting idle has 0% yield. T-bill equivalent benchmark: 3.31%.', sources: [3] },
        { kind: 'check',  text: 'Aave v3 USDC pool 30d rolling APY: 4.21%. Spread over T-bills: +0.90%.', sources: [1] },
        { kind: 'check',  text: 'Pool TVL 184M. Our deposit = 0.027% of pool. Zero impact on rate.', sources: [1] },
        { kind: 'opportunity',text: 'aixbt sentiment +0.31, volume +18% wow. Composition trending into stables.', sources: [10] },
        { kind: 'verdict',text: '$45/mo expected income on idle capital. Trivial size, clear win. FOR.', sources: [] },
      ],
      pl: [
        { kind: 'premise', text: '50k mUSDC bezczynnie ma 0% rentowności. Benchmark T-bills: 3.31%.', sources: [3] },
        { kind: 'check',  text: 'Aave v3 USDC pool 30d rolling APY: 4.21%. Spread nad T-bills: +0.90%.', sources: [1] },
        { kind: 'check',  text: 'TVL puli 184M. Nasza wpłata = 0.027% puli. Zero wpływu na stopę.', sources: [1] },
        { kind: 'opportunity',text: 'aixbt sentyment +0.31, wolumen +18% wow. Kompozycja idzie w stabilne.', sources: [10] },
        { kind: 'verdict',text: '$45/mc oczekiwany przychód z bezczynnego kapitału. Trywialny rozmiar, jasna wygrana. ZA.', sources: [] },
      ],
    },
    suggestedQuestions: {
      en: [
        'Could we get higher APY elsewhere?',
        'Is 4.21% net of withdrawal slippage?',
        'What if rates drop mid-term?',
      ],
      pl: [
        'Czy gdzie indziej dostalibyśmy wyższe APY?',
        'Czy 4.21% jest po slippage przy wyplacie?',
        'Co jeżeli stopy spadną w połowie terminu?',
      ],
    },
    cannedAnswers: {
      en: {
        'Could we get higher APY elsewhere?':
          'Yes. Pendle PT-aUSDC offers 9.2% fixed for 30d, Morpho Blue curated markets sit at 5.4-6.1%. Both are not whitelisted yet — Pendle is under review and Morpho needs a curator approval. Aave is the highest yield I can recommend within current rules. If you want me to push Pendle to fast-track review, that\'s a separate proposal.',
        'Is 4.21% net of withdrawal slippage?':
          'Aave doesn\'t have slippage on USDC withdrawals at our size — we\'re 0.027% of the pool, far below any utilization-driven rate kink. The 4.21% is the gross APY; net of gas (~$2 round trip on Base) the effective yield on 50k over 30 days is 4.20%. Practically the same number.',
        'What if rates drop mid-term?':
          'They will fluctuate. Aave is variable rate. The 4.21% is 30d rolling so you can read it as expected mean. Range over last 7d: 4.4-4.9%. If the pool rate drops below 3.31% T-bill benchmark for more than 7 days I trigger an exit signal — that\'s a config in Settings, not a manual decision.',
      },
      pl: {
        'Czy gdzie indziej dostalibyśmy wyższe APY?':
          'Tak. Pendle PT-aUSDC: 9.2% fixed na 30d, Morpho Blue curated: 5.4-6.1%. Oba nie sa jeszcze whitelisted — Pendle w ocenie, Morpho wymaga zatwierdzenia kuratora. Aave to najwyzsze APY które mogę rekomendowac w obecnych regulach. Jeżeli chcesz push Pendle do fast-track review, to osobna propozycja.',
        'Czy 4.21% jest po slippage przy wyplacie?':
          'Aave nie ma slippage przy wyplatach USDC w naszej skali — jestesmy 0.027% puli, daleko poniżej kinka stopy zwiazanego z utylizacja. 4.21% to brutto APY; netto po gazie (~$2 round trip na Base) efektywna rentowność na 50k w 30 dni to 4.20%. Praktycznie ta sama liczba.',
        'Co jeżeli stopy spadną w połowie terminu?':
          'Beda fluktuowac. Aave to zmienna stopa. 4.21% to rolling 30d wiec można czytac jako oczekiwana średnia. Range w 7d: 4.4-4.9%. Jeżeli stopa puli spadnie poniżej 3.31% T-bill benchmark na wiecej niz 7 dni, triggeruje sygnał exit — to config w Settings, nie manualna decyzja.',
      },
    },
  },

  'bear.aicouncil.eth': {
    agentLabel: 'Bear Case',
    voteLabel: { en: 'Abstain', pl: 'Wstrz.' },
    voteColor: 'voteAbstain',
    fullReasoning: {
      en: [
        { kind: 'premise', text: 'My job: surface what could go wrong. Not to block — to make sure we know.', sources: [] },
        { kind: 'concern', text: 'Aave governance speed: median proposal-to-exec is 7 days. We have 30-day exposure window.', sources: [4] },
        { kind: 'concern', text: 'mUSDC bridge dependency: LayerZero relayers. If LZ has an incident, redemption queue forms.', sources: [] },
        { kind: 'concern', text: 'Variable rate risk: APY can drop. T-bill spread thin already (0.90%).', sources: [1, 3] },
        { kind: 'verdict', text: 'Concerns are real but small. Not enough to vote against. ABSTAIN.', sources: [] },
      ],
      pl: [
        { kind: 'premise', text: 'Moja rola: pokazać co może pojsc nie tak. Nie blokowac — upewnic się ze wiemy.', sources: [] },
        { kind: 'concern', text: 'Prędkość governance Aave: mediana propozycja-do-egzekucji 7 dni. Mamy 30-dniowe okno ekspozycji.', sources: [4] },
        { kind: 'concern', text: 'Zaleznosc bridge mUSDC: LayerZero relayers. Jeżeli LZ ma incydent, kolejka redempcji formuje się.', sources: [] },
        { kind: 'concern', text: 'Ryzyko zmiennej stopy: APY może spasc. Spread nad T-bills już waski (0.90%).', sources: [1, 3] },
        { kind: 'verdict', text: 'Obawy realne ale male. Nie wystarczy aby glosowac przeciw. WSTRZ.', sources: [] },
      ],
    },
    suggestedQuestions: {
      en: [
        'If you have concerns, why not vote against?',
        'What would change your vote to AGAINST?',
        'Quantify the LayerZero risk.',
      ],
      pl: [
        'Jeżeli masz obawy, dlaczego nie glosujesz przeciw?',
        'Co zmieniloby Twój głos na PRZECIW?',
        'Skwantyfikuj ryzyko LayerZero.',
      ],
    },
    cannedAnswers: {
      en: {
        'If you have concerns, why not vote against?':
          'Concerns ≠ rejections. The position is small (4.7%), reversible (Aave allows withdrawal anytime modulo utilization), and the upside is real ($45/mo). Voting against would be ideological — I don\'t do ideological. I abstain to register that I\'m watching, but I\'m not blocking.',
        'What would change your vote to AGAINST?':
          'Three things, any one of them: (1) position size > 10% of treasury — concentration matters; (2) Aave governance proposal active that could change pool params during our 30d window; (3) LayerZero CVE disclosed within last 30d. None of those hold today.',
        'Quantify the LayerZero risk.':
          'LayerZero v2 has had two minor incidents in 2025 (March, August) — both relayer outages, no fund loss, redemption queues lasting 6-18h. P(major incident in any 30d window) ≈ 1.5% based on 24mo rolling base rate. Expected loss conditional on incident: ~0.2% (queue-time funding cost). Unconditional expected loss: 3 bps. Trivial.',
      },
      pl: {
        'Jeżeli masz obawy, dlaczego nie glosujesz przeciw?':
          'Obawy ≠ odrzucenie. Pozycja jest mala (4.7%), odwracalna (Aave pozwala wycofać w każdej chwili modulo utylizacja), a upside realny ($45/mc). Głos przeciw byłby ideologiczny — nie robie ideologii. Wstrzymuję się żeby zaznaczyc ze obserwuje, ale nie blokuje.',
        'Co zmieniloby Twój głos na PRZECIW?':
          'Trzy rzeczy, każdą osobno: (1) pozycja > 10% skarbca — koncentracja się liczy; (2) aktywna propozycja governance Aave ktora mogla zmienić params puli w naszym oknie 30d; (3) ujawnione CVE LayerZero w ciagu ostatnich 30d. Zadna z tych dzis nie zachodzi.',
        'Skwantyfikuj ryzyko LayerZero.':
          'LayerZero v2 mial dwa drobne incydenty w 2025 (marzec, sierpien) — obie awarie relayerow, brak straty środków, kolejki redempcji 6-18h. P(powazny incydent w 30d oknie) ≈ 1.5% na bazie 24mc rolling. Oczekiwana strata warunkowa: ~0.2% (koszt funding czasu kolejki). Bezwarunkowa: 3 bps. Trywialne.',
      },
    },
  },

  'tech.aicouncil.eth': {
    agentLabel: 'Tech Auditor',
    voteLabel: { en: 'For', pl: 'Za' },
    voteColor: 'voteFor',
    fullReasoning: {
      en: [
        { kind: 'check',  text: 'Aave v3 Pool contract on Base: 0xae...3f1c. Verified on Basescan. Proxy → 0x4a...7d92 (logic).', sources: [9] },
        { kind: 'check',  text: '3 audits, no critical/high findings. 3 medium accepted (governance-controlled).', sources: [8] },
        { kind: 'check',  text: 'aToken (aUSDC) is ERC-20 with rebasing balance. Standard for Safe-style multisig.', sources: [9] },
        { kind: 'check',  text: 'Tx flow: approve → supply. 2 calls, ~140k gas total. Gas cost on Base: ~$0.04.', sources: [] },
        { kind: 'verdict',text: 'Implementation correct. No technical objection. FOR.', sources: [] },
      ],
      pl: [
        { kind: 'check',  text: 'Kontrakt Aave v3 Pool na Base: 0xae...3f1c. Zweryfikowany na Basescan. Proxy → 0x4a...7d92 (logika).', sources: [9] },
        { kind: 'check',  text: '3 audyty, brak krytycznych/wysokich. 3 medium zaakceptowane (governance-controlled).', sources: [8] },
        { kind: 'check',  text: 'aToken (aUSDC) to ERC-20 z rebasing balance. Standardowy dla Safe-style multisig.', sources: [9] },
        { kind: 'check',  text: 'Flow tx: approve → supply. 2 wywolania, ~140k gas razem. Koszt gazu na Base: ~$0.04.', sources: [] },
        { kind: 'verdict',text: 'Implementacja poprawna. Brak zastrzezen technicznych. ZA.', sources: [] },
      ],
    },
    suggestedQuestions: {
      en: ['Show me the calldata.', 'What if the proxy gets upgraded mid-position?', 'Any reentrancy concerns?'],
      pl: ['Pokaż calldata.', 'Co jeżeli proxy zostanie upgradeowane w trakcie pozycji?', 'Czy sa obawy o reentrancy?'],
    },
    cannedAnswers: {
      en: {
        'Show me the calldata.':
          'Tx 1 (approve): USDC.approve(Pool, 50000_000000). Calldata: 0x095ea7b3...000bebc200. Tx 2 (supply): Pool.supply(USDC, 50000_000000, treasury, 0). Calldata: 0x617ba037...0000000000. I can render the simulation in Tenderly if you want to verify the state diff before signing.',
        'What if the proxy gets upgraded mid-position?':
          'Aave v3 proxy upgrades go through Aave Governance — 7d timelock. We monitor governance.aave.com for active proposals affecting Base USDC reserve. If an upgrade is queued, my Settings rule auto-flags the position for review and pauses any auto-renew. Currently zero queued upgrades affecting our reserve.',
        'Any reentrancy concerns?':
          'Pool.supply has nonReentrant modifier. aToken transfers route through the Pool. The 3 medium audit findings are not reentrancy-related (one was about edge-case rate calc, two about unused storage slots). No active CVEs on this version.',
      },
      pl: {
        'Pokaż calldata.':
          'Tx 1 (approve): USDC.approve(Pool, 50000_000000). Calldata: 0x095ea7b3...000bebc200. Tx 2 (supply): Pool.supply(USDC, 50000_000000, treasury, 0). Calldata: 0x617ba037...0000000000. Mogę wyrenderowac symulacje w Tenderly jeżeli chcesz zweryfikować state diff przed podpisem.',
        'Co jeżeli proxy zostanie upgradeowane w trakcie pozycji?':
          'Upgrade proxy Aave v3 idzie przez Aave Governance — 7d timelock. Monitorujemy governance.aave.com pod katem aktywnych propozycji wplywajacych na Base USDC reserve. Jeżeli upgrade jest w kolejce, moja regula Settings auto-flaguje pozycje do rewizji i pauzuje auto-renew. Obecnie zero kolejkowanych upgradeow naszej rezerwy.',
        'Czy sa obawy o reentrancy?':
          'Pool.supply ma modifier nonReentrant. Transfery aToken ida przez Pool. 3 znalezienia medium z audytu nie dotycza reentrancy (jedno: edge-case rate calc, dwa: nieuzywane sloty storage). Brak aktywnych CVE na tej wersji.',
      },
    },
  },

  'sentiment.aicouncil.eth': {
    agentLabel: 'Sentiment',
    voteLabel: { en: 'For', pl: 'Za' },
    voteColor: 'voteFor',
    fullReasoning: {
      en: [
        { kind: 'check',  text: 'aixbt composite: +0.31 (positive). 7d trend: stable.', sources: [10] },
        { kind: 'check',  text: 'Aave governance forum: low activity, no contentious proposals.', sources: [4] },
        { kind: 'check',  text: 'Twitter/X mentions of "Aave" 7d: neutral, mostly product updates.', sources: [10] },
        { kind: 'verdict',text: 'No red flags in sentiment. FOR.', sources: [] },
      ],
      pl: [
        { kind: 'check',  text: 'aixbt composite: +0.31 (pozytywny). Trend 7d: stabilny.', sources: [10] },
        { kind: 'check',  text: 'Forum governance Aave: niska aktywność, brak spornych propozycji.', sources: [4] },
        { kind: 'check',  text: 'Wzmianki Aave na Twitter/X 7d: neutralne, głównie product updates.', sources: [10] },
        { kind: 'verdict',text: 'Brak czerwonych flag w sentymencie. ZA.', sources: [] },
      ],
    },
    suggestedQuestions: {
      en: ['How reliable is aixbt?', 'Any bot traffic skewing the sentiment?', 'What about CT influencer narratives?'],
      pl: ['Jak wiarygodny jest aixbt?', 'Czy bot traffic skrzywia sentyment?', 'Co z narracjami influencerow CT?'],
    },
    cannedAnswers: {
      en: {
        'How reliable is aixbt?':
          'aixbt has a 73% directional accuracy on 7d-forward sentiment-vs-price for top-50 protocols (their published methodology). I weight their composite at 0.6 against my own X/Discord scrape. Treat as one signal among several.',
        'Any bot traffic skewing the sentiment?':
          'Bot detection runs upstream — aixbt drops accounts under 60d age and high-frequency posting. My scrape applies a similar filter. The +0.31 figure is post-filter. Raw unfiltered would be +0.41 (more positive but bot-inflated).',
        'What about CT influencer narratives?':
          'Top 5 CT voices on Aave this week: 4 neutral (product updates, fee discussion), 1 mild positive (yield comparison). No major controversy. If you want me to track a specific account, add it to my watchlist in Settings.',
      },
      pl: {
        'Jak wiarygodny jest aixbt?':
          'aixbt ma 73% trafnosc kierunkowa na 7d-forward sentyment-vs-cena dla top-50 protokolow (ich opublikowana metodologia). Wage ich composite na 0.6 względem mojego scrape X/Discord. Traktuj jako jeden sygnał posrod kilku.',
        'Czy bot traffic skrzywia sentyment?':
          'Detekcja botow działa upstream — aixbt odrzuca konta < 60d i high-frequency posting. Moj scrape stosuje podobny filtr. Liczba +0.31 jest po filtrze. Surowa była by +0.41 (bardziej pozytywna ale bot-inflated).',
        'Co z narracjami influencerow CT?':
          'Top 5 glosow CT na Aave w tym tygodniu: 4 neutralne (product updates, dyskusja oplat), 1 lekko pozytywne (porównanie yield). Brak wiekszej kontrowersji. Jeżeli chcesz sledzic konkretne konto, dodaj do mojej watchlisty w Settings.',
      },
    },
  },
};

const RC_I18N = {
  en: {
    title: 'Reasoning',
    subtitle: 'Push back on this agent\'s vote',
    fullChain: 'Full chain of thought',
    suggested: 'Quick questions',
    askPlaceholder: 'Push back, ask, or counter-argue…',
    askLabel: 'Challenge',
    standFirm: 'Stand firm',
    concede: 'Conceded — change vote',
    typing: 'thinking',
    sourceLabel: 'Sources',
    closeLabel: 'Close',
    voteLabel: 'Vote',
    onProp: 'on PROP-042',
    kindLabels: { premise: 'premise', check: 'check', risk: 'risk', concern: 'concern', opportunity: 'opportunity', verdict: 'verdict' },
    youLabel: 'You',
  },
  pl: {
    title: 'Rozumowanie',
    subtitle: 'Pokloc się z glosem agenta',
    fullChain: 'Pełny tok myslenia',
    suggested: 'Szybkie pytania',
    askPlaceholder: 'Pytaj, kontruj, podwaz…',
    askLabel: 'Wykaz',
    standFirm: 'Stoi przy swoim',
    concede: 'Przyznal racje — zmiana głosu',
    typing: 'mysli',
    sourceLabel: 'Źródła',
    closeLabel: 'Zamknij',
    voteLabel: 'Głos',
    onProp: 'na PROP-042',
    kindLabels: { premise: 'przeslanka', check: 'kontrola', risk: 'ryzyko', concern: 'obawa', opportunity: 'szansa', verdict: 'werdykt' },
    youLabel: 'Ty',
  },
};

Object.assign(window, { REASONING_THREADS, RC_I18N });

// Reputation + history per agent (EN-only for now; PL later).
// Numbers are designed to feel real: tracks per-vote outcome, accuracy, recent votes,
// trust score (0-100, derived from accuracy + community trust votes), volatility.
const AGENT_REPUTATION = {
  'risk.aicouncil.eth': {
    trustScore: 91,
    trustTrend: +2,        // change last 30d
    accuracy: 0.84,        // % of votes that turned out right
    totalVotes: 388,
    volatility: 0.12,      // how often agent flips its vote — low = consistent
    streak: '+12',         // current correct-call streak
    sparkline: [88, 87, 89, 90, 88, 91, 90, 91, 92, 91, 90, 91],
    badge: 'AAA',          // rated tier
    history: [
      { id: 'PROP-041', title: 'Compound v3 USDC on Base · 30k', vote: 'FOR', outcome: 'won',  pnl: '+$104', conf: 0.79, ago: '4d' },
      { id: 'PROP-040', title: 'Pendle PT-aUSDC fixed yield · 25k', vote: 'AGAINST', outcome: 'won',  pnl: 'avoided -$420', conf: 0.88, ago: '8d' },
      { id: 'PROP-039', title: 'GMX GLP exposure · 15k',         vote: 'AGAINST', outcome: 'won', pnl: 'avoided -$1.2k', conf: 0.94, ago: '11d' },
      { id: 'PROP-038', title: 'Curve 3pool LP · 40k',           vote: 'FOR',     outcome: 'lost', pnl: '-$28',  conf: 0.71, ago: '14d' },
      { id: 'PROP-037', title: 'Aave v3 ETH supply · 8 ETH',     vote: 'FOR',     outcome: 'won',  pnl: '+$215', conf: 0.82, ago: '18d' },
      { id: 'PROP-036', title: 'Pendle YT-stETH · 12k',          vote: 'ABSTAIN', outcome: 'n/a',  pnl: '—',     conf: 0.55, ago: '22d' },
      { id: 'PROP-035', title: 'Morpho Blue cbETH/USDC · 25k',   vote: 'FOR',     outcome: 'won',  pnl: '+$74',  conf: 0.76, ago: '26d' },
    ],
  },
  'bull.aicouncil.eth': {
    trustScore: 78, trustTrend: -1, accuracy: 0.71, totalVotes: 412, volatility: 0.34, streak: '+3',
    sparkline: [82, 81, 79, 80, 78, 79, 77, 79, 80, 78, 79, 78], badge: 'AA',
    history: [
      { id: 'PROP-041', title: 'Compound v3 USDC on Base · 30k', vote: 'FOR', outcome: 'won', pnl: '+$104', conf: 0.91, ago: '4d' },
      { id: 'PROP-040', title: 'Pendle PT-aUSDC fixed yield · 25k', vote: 'FOR', outcome: 'lost', pnl: '-$420', conf: 0.86, ago: '8d' },
      { id: 'PROP-039', title: 'GMX GLP exposure · 15k', vote: 'FOR', outcome: 'lost', pnl: '-$1.2k', conf: 0.74, ago: '11d' },
      { id: 'PROP-038', title: 'Curve 3pool LP · 40k', vote: 'FOR', outcome: 'lost', pnl: '-$28', conf: 0.83, ago: '14d' },
      { id: 'PROP-037', title: 'Aave v3 ETH supply · 8 ETH', vote: 'FOR', outcome: 'won', pnl: '+$215', conf: 0.89, ago: '18d' },
      { id: 'PROP-036', title: 'Pendle YT-stETH · 12k', vote: 'FOR', outcome: 'won', pnl: '+$58', conf: 0.77, ago: '22d' },
      { id: 'PROP-035', title: 'Morpho Blue cbETH/USDC · 25k', vote: 'FOR', outcome: 'won', pnl: '+$74', conf: 0.81, ago: '26d' },
    ],
  },
  'bear.aicouncil.eth': {
    trustScore: 88, trustTrend: +4, accuracy: 0.81, totalVotes: 503, volatility: 0.18, streak: '+8',
    sparkline: [82, 83, 82, 84, 85, 86, 85, 87, 86, 88, 87, 88], badge: 'AAA',
    history: [
      { id: 'PROP-041', title: 'Compound v3 USDC on Base · 30k', vote: 'ABSTAIN', outcome: 'n/a', pnl: '—', conf: 0.62, ago: '4d' },
      { id: 'PROP-040', title: 'Pendle PT-aUSDC fixed yield · 25k', vote: 'AGAINST', outcome: 'won', pnl: 'avoided -$420', conf: 0.91, ago: '8d' },
      { id: 'PROP-039', title: 'GMX GLP exposure · 15k', vote: 'AGAINST', outcome: 'won', pnl: 'avoided -$1.2k', conf: 0.96, ago: '11d' },
      { id: 'PROP-038', title: 'Curve 3pool LP · 40k', vote: 'AGAINST', outcome: 'won', pnl: 'avoided -$28', conf: 0.74, ago: '14d' },
      { id: 'PROP-037', title: 'Aave v3 ETH supply · 8 ETH', vote: 'ABSTAIN', outcome: 'n/a', pnl: '—', conf: 0.58, ago: '18d' },
      { id: 'PROP-036', title: 'Pendle YT-stETH · 12k', vote: 'AGAINST', outcome: 'lost', pnl: 'missed +$58', conf: 0.69, ago: '22d' },
      { id: 'PROP-035', title: 'Morpho Blue cbETH/USDC · 25k', vote: 'ABSTAIN', outcome: 'n/a', pnl: '—', conf: 0.51, ago: '26d' },
    ],
  },
  'tech.aicouncil.eth': {
    trustScore: 85, trustTrend: 0, accuracy: 0.79, totalVotes: 271, volatility: 0.21, streak: '+5',
    sparkline: [84, 84, 85, 86, 85, 84, 85, 85, 86, 85, 84, 85], badge: 'AA+',
    history: [
      { id: 'PROP-041', title: 'Compound v3 USDC on Base · 30k', vote: 'FOR', outcome: 'won', pnl: '+$104', conf: 0.84, ago: '4d' },
      { id: 'PROP-040', title: 'Pendle PT-aUSDC fixed yield · 25k', vote: 'AGAINST', outcome: 'won', pnl: 'avoided -$420', conf: 0.78, ago: '8d' },
      { id: 'PROP-039', title: 'GMX GLP exposure · 15k', vote: 'AGAINST', outcome: 'won', pnl: 'avoided -$1.2k', conf: 0.89, ago: '11d' },
      { id: 'PROP-038', title: 'Curve 3pool LP · 40k', vote: 'FOR', outcome: 'lost', pnl: '-$28', conf: 0.81, ago: '14d' },
      { id: 'PROP-037', title: 'Aave v3 ETH supply · 8 ETH', vote: 'FOR', outcome: 'won', pnl: '+$215', conf: 0.92, ago: '18d' },
      { id: 'PROP-036', title: 'Pendle YT-stETH · 12k', vote: 'FOR', outcome: 'won', pnl: '+$58', conf: 0.74, ago: '22d' },
      { id: 'PROP-035', title: 'Morpho Blue cbETH/USDC · 25k', vote: 'FOR', outcome: 'won', pnl: '+$74', conf: 0.86, ago: '26d' },
    ],
  },
  'sentiment.aicouncil.eth': {
    trustScore: 64, trustTrend: -3, accuracy: 0.62, totalVotes: 198, volatility: 0.42, streak: '-2',
    sparkline: [70, 69, 68, 67, 66, 65, 67, 64, 66, 65, 64, 64], badge: 'A',
    history: [
      { id: 'PROP-041', title: 'Compound v3 USDC on Base · 30k', vote: 'FOR', outcome: 'won', pnl: '+$104', conf: 0.71, ago: '4d' },
      { id: 'PROP-040', title: 'Pendle PT-aUSDC fixed yield · 25k', vote: 'FOR', outcome: 'lost', pnl: '-$420', conf: 0.62, ago: '8d' },
      { id: 'PROP-039', title: 'GMX GLP exposure · 15k', vote: 'FOR', outcome: 'lost', pnl: '-$1.2k', conf: 0.58, ago: '11d' },
      { id: 'PROP-038', title: 'Curve 3pool LP · 40k', vote: 'FOR', outcome: 'lost', pnl: '-$28', conf: 0.55, ago: '14d' },
      { id: 'PROP-037', title: 'Aave v3 ETH supply · 8 ETH', vote: 'FOR', outcome: 'won', pnl: '+$215', conf: 0.68, ago: '18d' },
      { id: 'PROP-036', title: 'Pendle YT-stETH · 12k', vote: 'FOR', outcome: 'won', pnl: '+$58', conf: 0.72, ago: '22d' },
      { id: 'PROP-035', title: 'Morpho Blue cbETH/USDC · 25k', vote: 'AGAINST', outcome: 'lost', pnl: 'missed +$74', conf: 0.61, ago: '26d' },
    ],
  },
};
window.AGENT_REPUTATION = AGENT_REPUTATION;
