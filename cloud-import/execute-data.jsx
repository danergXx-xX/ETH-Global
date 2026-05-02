// On-chain Vote+Execute Flow — 5 sub-states data.
// Wzorzec UX dla Aiko Phase 1B (wagmi v2 + viem). Pokazuje pelny flow
// od collecting signatures do executed + 0G archived.

const EXECUTE_FLOW = {
  proposal: {
    id: 'PROP-042',
    title: 'Allocate 100,000 USDC to Aave v3 USDC supply',
    network: 'Base Sepolia',
    governor: '0x1f95c796c5dc47d08b20cf3220a2afa995e301f0',
    timelock: '0x76a69bb6aef69a2e76fa6c9632ff6ca101441b0f',
  },

  // 5 stages — flow indicator
  stages: [
    { id: 'sigs',     label: 'Multisig sigs',  desc: '5 of 7 required'   },
    { id: 'queue',    label: 'Queue Timelock', desc: '48h delay'         },
    { id: 'wait',     label: 'Timelock ETA',   desc: 'Wait period'       },
    { id: 'execute',  label: 'Execute',        desc: 'Single tx on Base' },
    { id: 'archive',  label: '0G Archive',     desc: 'CID registered'    },
  ],

  // Multisig signers (5-of-7)
  signers: [
    { ens: 'maxima.aicouncil.eth', addr: '0xab12...3f4d', signed: true,  ago: '4 min ago' },
    { ens: 'pico.aicouncil.eth',   addr: '0xcd34...8e92', signed: true,  ago: '3 min ago' },
    { ens: 'atlas.aicouncil.eth',  addr: '0xef56...2a71', signed: true,  ago: '1 min ago' },
    { ens: 'zen.aicouncil.eth',    addr: '0x1234...5b9c', signed: false, ago: 'pending'   },
    { ens: 'rio.aicouncil.eth',    addr: '0x789a...4f12', signed: false, ago: 'pending'   },
    { ens: 'hugo.aicouncil.eth',   addr: '0x456b...8c23', signed: false, ago: 'pending'   },
    { ens: 'dan.aicouncil.eth',    addr: '0xdef0...91ab', signed: false, ago: 'pending'   },
  ],
  threshold: 5,

  // Tx preview (Safe-style decoded)
  txPreview: {
    target: '0x606ede7755131e6206a29b67d88761eebb3bb59d',  // MockUSDC
    targetLabel: 'MockUSDC (treasury asset)',
    function: 'approve(address,uint256)',
    calldata: '0x095ea7b30000000000...0000000005f5e100',
    decodedArgs: [
      { name: 'spender',  type: 'address', value: '0xPoolAddressesProvider', label: 'Aave Pool Provider' },
      { name: 'amount',   type: 'uint256', value: '100000000000', label: '100,000.000000 USDC' },
    ],
    gas: '184,221',
    gasPrice: '0.001 gwei',
    estCostUsd: 0.04,
  },

  // Balance diff (pre / post)
  balanceDiff: {
    pre: [
      { asset: 'USDC',  amount: 1_000_000, location: 'Treasury Safe' },
      { asset: 'aUSDC', amount: 0,         location: 'Aave v3 Base'  },
    ],
    post: [
      { asset: 'USDC',  amount: 900_000,   location: 'Treasury Safe' },
      { asset: 'aUSDC', amount: 100_000,   location: 'Aave v3 Base'  },
    ],
  },

  // Expected yield (po execute)
  expectedYield: { apy: 4.2, monthly: 350.0, annual: 4200.0 },

  // Timelock countdown
  timelock: {
    queuedAt:  '2026-05-02T16:18:02Z',
    eta:       '2026-05-04T16:18:02Z',
    delay:     48 * 3600,  // 48h w sekundach
    elapsed:   42 * 3600,  // 42h elapsed (testow ETA)
  },

  // Execution result (state='executed')
  execution: {
    txHash: '0x8a3f2b1c4e7d0f6a9b2c8e1d3f4a5b7c8d2e9f1a',
    txUrl: 'https://sepolia.basescan.org/tx/0x8a3f...e21c',
    block: 12_487_321,
    gasUsed: '184,221',
    gasCostEth: 0.0000023,
    timestamp: '2026-05-04T16:22:14Z',
  },

  // 0G Archive (state='archived')
  archive: {
    cid: 'bafybeib3xczc7vd6m4xhqhszw6slmoik8jklyzxqv3df56wjd3z',
    cidUrl: 'https://0g.ai/storage/cid/bafybeib3xczc7vd6m4xhqhszw6slmoik',
    sizeKb: 4.2,
    componentsArchived: ['proposal', 'agent_votes', 'verdict', 'sigs', 'tx_receipt'],
  },
};

window.EXECUTE_FLOW = EXECUTE_FLOW;
