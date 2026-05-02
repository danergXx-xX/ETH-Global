// ENS Identity Card (Component 9) — viem live resolution dla agent subnames.
// Phase 2 (ENSGlobal partner prize): kazdy agent ma ENS subname pod
// `aicouncil.eth`, treasury wallet ma `treasury.aicouncil.eth`.
// User widzi wszystkie identity w jednej karcie - klik = view on ENS app.

const ENS_DATA = {
  parent: 'aicouncil.eth',
  resolver: '0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63',  // Sepolia ENS Public Resolver
  registrar: 'NameStone (Phase 2)',

  // Treasury wallet
  treasury: {
    name: 'treasury.aicouncil.eth',
    address: '0x76a69bb6aef69a2e76fa6c9632ff6ca101441b0f',  // Timelock (real treasury)
    avatarUrl: null,  // procedural fallback
    records: {
      'description': 'AI Council DAO treasury (Timelock)',
      'url': 'https://conclave.fi',
      'com.twitter': '@conclave_fi',
      'com.github': 'conclave-dao',
    },
    balance: { usdc: 1_000_000, eth: 2.4 },
    state: 'resolved',  // resolving | resolved | error
  },

  // 5 builtin agents
  agents: [
    {
      id: 'bull', persona: 'bull',
      name: 'bull.aicouncil.eth',
      address: '0x1f95c796c5dc47d08b20cf3220a2afa995e301f0',
      records: {
        'description': 'Opportunity-seeking analyst — finds yields, weighs upside',
        'rep.score': '87',
        'rep.statements': '412',
        'llm': 'Claude Opus 4.7',
      },
      hue: 152,
      reputation: 87,
      state: 'resolved',
    },
    {
      id: 'bear', persona: 'bear',
      name: 'bear.aicouncil.eth',
      address: '0x606ede7755131e6206a29b67d88761eebb3bb59d',
      records: {
        'description': 'Risk-aware skeptic — flags downsides, models bad scenarios',
        'rep.score': '91',
        'rep.statements': '503',
        'llm': 'Claude Opus 4.7',
      },
      hue: 22,
      reputation: 91,
      state: 'resolved',
    },
    {
      id: 'risk', persona: 'risk',
      name: 'risk.aicouncil.eth',
      address: '0x5fe2a5e971d9faaff9cc0b0c9981da44fefc4381',
      records: {
        'description': 'Quantitative risk modeler — VaR, Sharpe, rule checks',
        'rep.score': '94',
        'rep.statements': '388',
        'llm': 'Claude Opus 4.7',
      },
      hue: 78,
      reputation: 94,
      state: 'resolved',
    },
    {
      id: 'tech', persona: 'tech',
      name: 'tech.aicouncil.eth',
      address: '0x4f81a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6',
      records: {
        'description': 'Technical due diligence — audits, integrations, gas',
        'rep.score': '82',
        'rep.statements': '271',
        'llm': 'Claude Sonnet 4.6',
      },
      hue: 245,
      reputation: 82,
      state: 'resolved',
    },
    {
      id: 'sentiment', persona: 'sentiment',
      name: 'sentiment.aicouncil.eth',
      address: '0xa1b2c3d4e5f6071829aebcd0ef1234567890abcd',
      records: {
        'description': 'Market psychology reader — sentiment, narrative flow',
        'rep.score': '76',
        'rep.statements': '198',
        'llm': 'Claude Sonnet 4.6',
      },
      hue: 305,
      reputation: 76,
      state: 'resolved',
    },
  ],

  // Resolution log (debugging / showing the wires)
  resolutionLog: [
    { name: 'aicouncil.eth',         status: 'OK', latencyMs: 84, resolver: '0x231b...8E63' },
    { name: 'treasury.aicouncil.eth', status: 'OK', latencyMs: 121, resolver: '0x231b...8E63' },
    { name: 'bull.aicouncil.eth',    status: 'OK', latencyMs: 92, resolver: '0x231b...8E63' },
    { name: 'bear.aicouncil.eth',    status: 'OK', latencyMs: 88, resolver: '0x231b...8E63' },
    { name: 'risk.aicouncil.eth',    status: 'OK', latencyMs: 104, resolver: '0x231b...8E63' },
    { name: 'tech.aicouncil.eth',    status: 'OK', latencyMs: 79, resolver: '0x231b...8E63' },
    { name: 'sentiment.aicouncil.eth', status: 'OK', latencyMs: 96, resolver: '0x231b...8E63' },
  ],
};

window.ENS_DATA = ENS_DATA;
