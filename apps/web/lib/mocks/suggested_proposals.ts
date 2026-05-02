/**
 * 4 Golden Demo Proposals - Suggested Proposals dropdown.
 *
 * Mirror of apps/api/data/seed_proposals.py (Lumen owner). Frontend
 * uses this for the Suggested Proposals dropdown in the submission
 * form: judge picks one and the textarea pre-fills with full context.
 */

export interface SuggestedProposalActionData {
  type: "transfer" | "swap" | "deposit";
  token?: string;
  recipient?: string;
  amount_wei?: string;
  token_in?: string;
  token_out?: string;
  amount_in_wei?: string;
  min_amount_out_wei?: string;
  dex?: string;
  protocol?: string;
}

export interface SuggestedProposal {
  id: string;
  title: { en: string; pl: string };
  description: { en: string; pl: string };
  full_context: { en: string; pl: string };
  suggested_amount: string;
  target: string;
  tags: string[];
  suggested_action_data: SuggestedProposalActionData;
}

export const SUGGESTED_PROPOSALS: SuggestedProposal[] = [
  {
    id: "PROP-DEMO-01",
    title: {
      en: "Hedge oil exposure - 30-day Strait of Hormuz blockade scenario",
      pl: "Hedge ekspozycji na ropę - scenariusz 30-dniowej blokady Cieśniny Ormuz",
    },
    description: {
      en: "Allocate $200K mUSDC to hedge treasury oil exposure via long WTI futures on GMX v2 (Arbitrum), given a 30-day Strait of Hormuz blockade scenario.",
      pl: "Przeznaczyć 200 tys. mUSDC na hedging ekspozycji skarbca na ropę poprzez long WTI futures na GMX v2 (Arbitrum), w scenariuszu 30-dniowej blokady Cieśniny Ormuz.",
    },
    full_context: {
      en: `Geopolitical tension in the Persian Gulf has escalated over 72 hours. Reuters reports naval engagement near the Strait of Hormuz; Brent spot is up 14 percent week-over-week, WTI futures front-month at $98.40. Approximately 21 percent of global oil trade transits the strait daily.

Treasury currently holds 92 percent stablecoin (mUSDC), 8 percent ETH. Council mandate v0.4 permits macro hedging up to 5 percent of treasury for non-crypto correlated risk. Proposed hedge: $200K notional long WTI futures on GMX v2, 2x leverage, 30-day expiry, stop-loss at $84.

Rationale: even a partial blockade historically pushes WTI 25-40 percent. Hedge provides asymmetric upside if scenario materializes; max loss bounded by stop. GMX v2 is post-audit (Sherlock Mar 2026, no critical findings).

Counter-considerations: tanker re-routing (Cape of Good Hope) may add only 2-week delay; SPR releases by US/IEA could cap upside; demand destruction in EU/Asia may dampen spot move. Sentiment on Crypto Twitter shows panic narrative but mainstream macro desks (Goldman, JPM) call for $90-105 range, not $130+ tail.`,
      pl: `Napięcia geopolityczne w Zatoce Perskiej eskalowały w ciągu 72 godzin. Reuters donosi o starciach morskich w pobliżu Cieśniny Ormuz; spot Brent wzrósł 14 procent week-over-week, WTI futures front-month na 98,40 USD. Cieśniną przechodzi dziennie ok. 21 procent globalnego handlu ropą.

Skarbiec ma obecnie 92 procent stablecoinów (mUSDC), 8 procent ETH. Mandat Council v0.4 dopuszcza hedging makro do 5 procent skarbca dla ryzyk nieskorelowanych z crypto. Proponowany hedge: 200 tys. USD notional long WTI futures na GMX v2, dźwignia 2x, 30-dniowy termin, stop-loss 84 USD.

Uzasadnienie: nawet częściowa blokada historycznie windowała WTI o 25-40 procent. Hedge daje asymetryczny upside, jeśli scenariusz się zmaterializuje; maksymalna strata ograniczona stopem. GMX v2 po audycie (Sherlock marzec 2026, brak krytycznych findingów).

Przeciwwskazania: re-routing tankowców (Cape of Good Hope) dodaje tylko ok. 2 tyg. opóźnienia; uwolnienia SPR przez US/IEA mogą ograniczyć upside; destrukcja popytu w UE/Azji może stłumić ruch spot. Sentyment na Crypto Twitter pokazuje panic narrative, ale mainstream desks makro (Goldman, JPM) prognozują zakres 90-105 USD, nie ogon 130+.`,
    },
    suggested_amount: "200,000 mUSDC",
    target: "GMX v2 (Arbitrum)",
    tags: ["geopolitics", "macro-hedge", "futures"],
    suggested_action_data: {
      type: "transfer",
      token: "0x0000000000000000000000000000000000000A11",
      recipient: "0x0000000000000000000000000000000000000001",
      amount_wei: "200000000000",
    },
  },
  {
    id: "PROP-DEMO-02",
    title: {
      en: "Rebalance 80/20 to 60/40 BTC/USDC - capture post-halving rally",
      pl: "Rebalans 80/20 na 60/40 BTC/USDC - złapać post-halving rally",
    },
    description: {
      en: "Rebalance treasury from 80/20 to 60/40 BTC/USDC over a 5-day TWAP, with Bitcoin halving 14 days out. Execute via Cowswap to minimize slippage and MEV exposure on $1.2M notional.",
      pl: "Rebalans skarbca z 80/20 na 60/40 BTC/USDC w ciągu 5 dni przez TWAP, halving Bitcoina za 14 dni. Realizacja przez Cowswap dla minimalizacji slippage i ekspozycji na MEV na 1,2 mln USD notional.",
    },
    full_context: {
      en: `Bitcoin halving is scheduled in approximately 14 days (block ~890,000). Block subsidy drops from 3.125 BTC to 1.5625 BTC. Historical pattern across four prior halvings (2012, 2016, 2020, 2024): mean cumulative return of +387 percent in 12 months post-halving, but 2024 was the weakest at +112 percent with significant chop.

Current treasury: 80 percent BTC ($960K notional at $48K spot), 20 percent USDC ($240K). Proposed: rebalance to 60/40 - sell ~$240K BTC, increase USDC buffer to $480K. Rationale: lock in some pre-halving accumulation gains, build dry powder for potential post-halving dip-buy or operational runway.

Execution venue analysis: Cowswap (CoW Protocol) offers MEV protection via batch auctions, ~3-7bps better fills vs Uniswap v3 on size $200K+. 1inch is comparable but more sandwich-vulnerable on volatile assets. TWAP over 5 days smooths execution risk; expected slippage 8-15bps total.

Bear considerations: 2024 halving disappointed - miner capitulation drove 30 percent drawdown 6 weeks post-halving before rally resumed. Selling here may forfeit upside if 2026 mirrors 2020 (cumulative +750 percent in 18mo).

Sentiment split: retail (Crypto Twitter) bullish euphoric, citing past 4 cycles. Grounded analysts (Glassnode, Coinmetrics) note declining halving supply impact - subsidy already <1 percent of daily volume. Convex risk.`,
      pl: `Halving Bitcoina za ok. 14 dni (blok ~890 000). Subsidy spada z 3,125 BTC na 1,5625 BTC. Wzorzec historyczny z czterech poprzednich halvingów (2012, 2016, 2020, 2024): średni skumulowany zwrot +387 procent w 12 miesięcy po halvingu, ale 2024 był najsłabszy +112 procent z dużym chop.

Skarbiec obecnie: 80 procent BTC (960 tys. USD notional przy spot 48 tys.), 20 procent USDC (240 tys.). Propozycja: rebalans na 60/40 - sprzedać ~240 tys. USD w BTC, zwiększyć bufor USDC do 480 tys. Uzasadnienie: zamknąć część pre-halving akumulacji, zbudować suchy proch na potencjalny post-halving dip lub operacyjny runway.

Analiza venue egzekucji: Cowswap (CoW Protocol) oferuje ochronę MEV przez batch auctions, lepsze fills o 3-7bps vs Uniswap v3 na rozmiarze 200 tys.+. 1inch porównywalny, ale bardziej podatny na sandwich na zmiennych aktywach. TWAP przez 5 dni wygładza ryzyko egzekucji; oczekiwany slippage 8-15bps łącznie.

Argumenty bear: halving 2024 rozczarował - kapitulacja minerów dała 30-procentowy drawdown 6 tyg. po halvingu, zanim wrócił rally. Sprzedaż tutaj może oddać upside, jeśli 2026 będzie mirror 2020 (skumulowane +750 procent w 18 mies.).

Sentyment podzielony: retail (Crypto Twitter) euforycznie bullish, powołując się na 4 poprzednie cykle. Trzeźwi analitycy (Glassnode, Coinmetrics) wskazują spadający wpływ halving supply - subsidy już <1 procent dziennego volume. Ryzyko convex.`,
    },
    suggested_amount: "240,000 USDC (sell-side)",
    target: "Cowswap (CoW Protocol)",
    tags: ["btc", "halving", "rebalance", "twap"],
    suggested_action_data: {
      type: "swap",
      token_in: "0x0000000000000000000000000000000000000B22",
      token_out: "0x0000000000000000000000000000000000000A11",
      amount_in_wei: "500000000",
      min_amount_out_wei: "239000000000",
      dex: "uniswap_v3",
    },
  },
  {
    id: "PROP-DEMO-03",
    title: {
      en: "Emergency: USDC depeg to 0.97 - unwind 30 percent Aave aUSDC position",
      pl: "Awaryjne: USDC depeg do 0,97 - rozwiń 30 procent pozycji Aave aUSDC",
    },
    description: {
      en: "USDC depegging to $0.97 over the last 90 minutes. Emergency unwind 30 percent of Aave v3 aUSDC position ($150K of $500K) to mUSDC reserve. Time-sensitive: decision window <2 hours before secondary venue liquidity dries.",
      pl: "USDC depegguje do 0,97 USD w ciągu ostatnich 90 minut. Awaryjne wycofanie 30 procent pozycji Aave v3 aUSDC (150 tys. z 500 tys.) do rezerwy mUSDC. Pilność: okno decyzji <2h zanim wyschnie płynność na secondary venue.",
    },
    full_context: {
      en: `USDC has depegged to $0.971 on Curve 3pool over the past 90 minutes. Trigger event unconfirmed - Twitter speculation cites SVB-2 banking exposure to Circle reserves. Circle has not yet issued a statement. Coinbase USDC redemption queue showing 8-hour delay vs normal <30min.

Treasury Aave v3 position: $500K aUSDC (accruing 4.2 percent APY). Mark-to-market loss currently $14.5K. Proposed action: withdraw $150K (30 percent), swap to mUSDC at any rate above $0.965 floor.

Bull case (do not panic): March 2026 SVB stress was fully resolved within 72 hours with Fed support; Circle's reserves are 80 percent T-bills <90 days. Selling at depegged price locks in loss; if peg restores within 24-48h, full exit was unwarranted. Crypto Twitter panic intensity score 8.2/10 (per aixbt) is at historical false-positive level.

Bear case (act now): contagion vectors are real - DAI is partially USDC-backed (38 percent), Frax has exposure, and Aave v3 governance has discussed pausing USDC collateral if depeg sustains >2 hours. Liquidity dries fast - currently $180M depth on Curve 3pool, was $850M 24h ago. If pause hits, withdrawal queue becomes uncertain.

Risk metrics: gas cost $42 at current basefee, immaterial vs $14.5K floating loss. Slippage on $150K swap: 22-35bps. Expected net cost of acting: 24bps vs expected value of holding: depends on peg-restoration probability.`,
      pl: `USDC zdepeggował do 0,971 USD na Curve 3pool w ciągu ostatnich 90 minut. Wydarzenie wyzwalające niepotwierdzone - spekulacje na Twitter wskazują na ekspozycję SVB-2 na rezerwy Circle. Circle nie wydał jeszcze oświadczenia. Kolejka wykupu USDC na Coinbase pokazuje 8-godzinne opóźnienie vs normalne <30 min.

Pozycja skarbca w Aave v3: 500 tys. USD aUSDC (APY 4,2 procent). Strata mark-to-market obecnie 14,5 tys. USD. Proponowane działanie: wypłata 150 tys. USD (30 procent), swap na mUSDC po dowolnym kursie powyżej floora 0,965.

Bull case (bez paniki): stres SVB z marca 2026 został rozwiązany w 72h ze wsparciem Fed; rezerwy Circle to 80 procent T-bille <90 dni. Sprzedaż po cenie z depeggu lockuje stratę; jeśli peg wróci w 24-48h, pełne wyjście było zbędne. Wskaźnik intensywności paniki na Crypto Twitter 8,2/10 (wg aixbt) jest na historycznym poziomie false-positive.

Bear case (działaj teraz): wektory contagion są realne - DAI jest częściowo USDC-backed (38 procent), Frax ma ekspozycję, a governance Aave v3 dyskutowało o wstrzymaniu USDC jako collateral, jeśli depeg utrzyma się >2h. Płynność wysycha szybko - obecnie 180 mln USD głębokości na Curve 3pool, 24h temu było 850 mln USD. Jeśli przyjdzie pauza, kolejka wypłat staje się niepewna.

Metryki ryzyka: koszt gazu 42 USD przy obecnym basefee, nieistotny vs 14,5 tys. USD floating loss. Slippage na swapie 150 tys.: 22-35bps. Oczekiwany koszt netto działania: 24bps vs oczekiwana wartość trzymania: zależy od prawdopodobieństwa przywrócenia peg.`,
    },
    suggested_amount: "150,000 aUSDC",
    target: "Aave v3 (withdraw) -> mUSDC",
    tags: ["depeg", "emergency", "stablecoin", "time-sensitive"],
    suggested_action_data: {
      type: "transfer",
      token: "0x0000000000000000000000000000000000000A11",
      recipient: "0x0000000000000000000000000000000000000002",
      amount_wei: "150000000000",
    },
  },
  {
    id: "PROP-DEMO-04",
    title: {
      en: "Compound governance attack flagged - $10K bug bounty + 48h freeze",
      pl: "Atak governance Compound zgłoszony - bug bounty 10 tys. USD + zamrożenie 48h",
    },
    description: {
      en: "Allocate $10K mUSDC bug bounty to Compound security responder team and freeze treasury withdrawals for 48 hours after governance attack proposal flagged on Compound (proposal #428, malicious oracle config change).",
      pl: "Przeznaczyć 10 tys. mUSDC na bug bounty dla zespołu Compound Security Response oraz zamrozić wypłaty ze skarbca na 48h po zgłoszeniu propozycji ataku governance na Compound (propozycja #428, złośliwa zmiana konfiguracji oracle).",
    },
    full_context: {
      en: `Compound DAO proposal #428 was submitted 6 hours ago and entered active voting. Surface: routine "oracle parameter optimization". On-chain analysis by OpenZeppelin Defender flagged the encoded calldata as redirecting price feeds for cETH and cWBTC to a contract deployed by attacker (verified by block.dev tracing). If passed, attacker drains via inflated borrows - estimated $40M+ exposure.

Voting closes in 41 hours. Compound community defenders are coordinating no-vote campaign but face quorum apathy risk. Proposed actions:
1. Deploy $10K mUSDC bug bounty to Compound responder team (payout to compound-security.eth) for active disclosure work.
2. Freeze our treasury withdrawals for 48h while we have $80K cWBTC exposure via Compound v3, in case attack succeeds and contagion hits cross-protocol wrappers.

This is a meta proposal: DAO defending another DAO. Brand value of coordinated defense is non-trivial - sets precedent and reputation among DAO peers. Aave Governance, ENS DAO, and Optimism Collective have done similar in past incidents (2024 Hundred Finance attack response).

Risks of acting: $10K is marginal (2 percent of treasury), not catastrophic. Freeze hurts our users mid-debate. Legal exposure from freezing user-attributable funds for 48h is unclear in some jurisdictions (treasury pooled, not user-segregated, but optics matter).

Risks of inaction: attack succeeds, contagion hits, $80K cWBTC exposure becomes loss. Reputation damage if community sees us silent during cross-DAO crisis. Compound governance vector analysis: proposal threshold 25K COMP, attacker accumulated through TornadoCash-funneled 4 wallets - sophisticated actor.`,
      pl: `Propozycja #428 Compound DAO została złożona 6h temu i weszła w aktywne głosowanie. Powierzchownie: rutynowa "optymalizacja parametrów oracle". Analiza on-chain przez OpenZeppelin Defender oflagowała calldata jako przekierowujące price feedy cETH i cWBTC na kontrakt wdrożony przez napastnika (zweryfikowane tracingiem block.dev). Jeśli przejdzie, napastnik drenuje przez rozdęte borrows - szacowana ekspozycja 40+ mln USD.

Głosowanie zamyka się za 41h. Compound community defenders koordynują kampanię no-vote, ale ryzykują quorum apathy. Proponowane działania:
1. Przekazać 10 tys. mUSDC bug bounty zespołowi responder Compound (wypłata na compound-security.eth) za aktywną pracę nad disclosure.
2. Zamrozić nasze wypłaty skarbca na 48h - mamy 80 tys. USD ekspozycji w cWBTC przez Compound v3, na wypadek gdyby atak się powiódł i contagion uderzył w cross-protocol wrappery.

To meta proposal: DAO broni innego DAO. Wartość marki skoordynowanej obrony jest niebagatelna - ustanawia precedens i reputację wśród peer DAO. Aave Governance, ENS DAO i Optimism Collective robiły podobnie w przeszłych incydentach (atak Hundred Finance 2024).

Ryzyka działania: 10 tys. USD to margines (2 procent skarbca), nie katastrofa. Zamrożenie szkodzi naszym użytkownikom w trakcie debaty. Ekspozycja prawna na zamrożenie środków user-attributable przez 48h jest niejasna w niektórych jurysdykcjach (skarbiec pooled, nie user-segregated, ale optyka się liczy).

Ryzyka bezczynności: atak się powodzi, contagion uderza, ekspozycja 80 tys. USD cWBTC staje się stratą. Reputacyjny damage, jeśli społeczność zobaczy nas milczących w trakcie cross-DAO kryzysu. Analiza wektora governance Compound: próg propozycji 25 tys. COMP, napastnik akumulował przez 4 portfele zasilane TornadoCash - wyrafinowany aktor.`,
    },
    suggested_amount: "10,000 mUSDC + 48h withdrawal freeze",
    target: "compound-security.eth + treasury freeze",
    tags: ["governance-attack", "meta-dao", "defensive"],
    suggested_action_data: {
      type: "transfer",
      token: "0x0000000000000000000000000000000000000A11",
      recipient: "0x0000000000000000000000000000000000000003",
      amount_wei: "10000000000",
    },
  },
];
