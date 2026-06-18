// Treasury Copilot — Contract ABIs
// Raw JSON format (NOT parseAbi strings) — matches deployed contracts exactly.

// ── PolicyEngine ──────────────────────────────────────────────
// Real Policy struct: { id, ptype, value, target, active, description }
export const policyEngineAbi = [
  {
    type: "function",
    name: "getPolicies",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "bytes32" },
          { name: "ptype", type: "uint8" },
          { name: "value", type: "uint256" },
          { name: "target", type: "address" },
          { name: "active", type: "bool" },
          { name: "description", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addPolicy",
    inputs: [
      { name: "ptype", type: "uint8" },
      { name: "value", type: "uint256" },
      { name: "target", type: "address" },
      { name: "description", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "removePolicy",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "validateAction",
    inputs: [
      { name: "actionType", type: "uint8" },
      { name: "value", type: "uint256" },
      { name: "target", type: "address" },
    ],
    outputs: [
      { name: "valid", type: "bool" },
      { name: "reason", type: "string" },
    ],
    stateMutability: "nonpayable",
  },
] as const;

// ── TreasuryVault ─────────────────────────────────────────────
// Real Allocation struct: { protocol, token, amount, deployedAt }
// NOTE: NO valueUSD, apy, risk, label fields — those were mock-only
export const treasuryVaultAbi = [
  {
    type: "function",
    name: "getTotalValueUSD",
    inputs: [{ name: "tokens", type: "address[]" }],
    outputs: [{ name: "totalUSD", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getRunwayMonths",
    inputs: [{ name: "tokens", type: "address[]" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getAllocations",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "protocol", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "deployedAt", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getBalance",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "monthlyPayrollUSD",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "paused",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "deposit",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "withdraw",
    inputs: [
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "to", type: "address" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "allocate",
    inputs: [
      { name: "protocol", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deallocate",
    inputs: [
      { name: "allocationId", type: "bytes32" },
      { name: "returnedAmount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "addToken",
    inputs: [
      { name: "token", type: "address" },
      { name: "priceFeed", type: "address" },
      { name: "decimals", type: "uint8" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateMonthlyPayroll",
    inputs: [{ name: "newAmount", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "emergencyPause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unpause",
    inputs: [],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// ── PayrollManager ────────────────────────────────────────────
// Real PayrollEntry: { id, recipient, token, amount, interval, nextExecution, active, label }
// NOTE: NO name, tokenSymbol, nextTimestamp, status fields
export const payrollManagerAbi = [
  {
    type: "function",
    name: "getAllPayrolls",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "bytes32" },
          { name: "recipient", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "interval", type: "uint256" },
          { name: "nextExecution", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "label", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPendingPayrolls",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "bytes32" },
          { name: "recipient", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "interval", type: "uint256" },
          { name: "nextExecution", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "label", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "schedulePayroll",
    inputs: [
      { name: "recipient", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "interval", type: "uint256" },
      { name: "startTime", type: "uint256" },
      { name: "label", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "executePayroll",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "cancelPayroll",
    inputs: [{ name: "id", type: "bytes32" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "vault",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
    stateMutability: "view",
  },
] as const;

// ── YieldRouter ───────────────────────────────────────────────
// Real Protocol struct: { addr, riskScore, apyBPS, active, name }
// Real Position struct: { protocol, token, amount, routedAt }
export const yieldRouterAbi = [
  {
    type: "function",
    name: "getProtocols",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "addr", type: "address" },
          { name: "riskScore", type: "uint8" },
          { name: "apyBPS", type: "uint256" },
          { name: "active", type: "bool" },
          { name: "name", type: "string" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPositions",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "protocol", type: "address" },
          { name: "token", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "routedAt", type: "uint256" },
        ],
      },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "addProtocol",
    inputs: [
      { name: "addr", type: "address" },
      { name: "riskScore", type: "uint8" },
      { name: "apyBPS", type: "uint256" },
      { name: "name", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "updateProtocol",
    inputs: [
      { name: "addr", type: "address" },
      { name: "newApyBPS", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "route",
    inputs: [
      { name: "protocol", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "unroute",
    inputs: [
      { name: "positionId", type: "bytes32" },
      { name: "returnedAmount", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
] as const;

// ── TypeScript types matching REAL contract struct fields ─────

// Policy: real fields (NOT text/violated — those were mock-only)
export type OnchainPolicy = {
  id: `0x${string}`;
  ptype: number; // 0=MAX_ALLOC_PCT 1=MIN_LIQUID 2=MAX_TRANSFER 3=BLACKLIST
  value: bigint;
  target: `0x${string}`;
  active: boolean;
  description: string; // use this as "text" in the UI
};

// Allocation: real fields (NOT valueUSD/apy/risk/label)
export type OnchainAllocation = {
  protocol: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  deployedAt: bigint;
};

// Payroll: real fields (NOT name/tokenSymbol/nextTimestamp/status)
export type OnchainPayroll = {
  id: `0x${string}`;
  recipient: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  interval: bigint;
  nextExecution: bigint; // unix timestamp
  active: boolean;
  label: string; // use this as "name" in the UI
};

// Protocol: real fields (NOT asset/assetSymbol/liquidity)
export type OnchainProtocol = {
  addr: `0x${string}`;
  riskScore: number; // 1–10
  apyBPS: bigint; // divide by 100 for % e.g. 420 → 4.20%
  active: boolean;
  name: string;
};

export type OnchainPosition = {
  protocol: `0x${string}`;
  token: `0x${string}`;
  amount: bigint;
  routedAt: bigint;
};
