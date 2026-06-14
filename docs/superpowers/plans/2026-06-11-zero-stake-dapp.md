# Zero Stake DApp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js DeFi staking DApp for the Sepolia MetaNodeStake contract with wallet connection, pool reads, ETH stake, request withdraw, withdraw unlocked ETH, claim rewards, transaction states, and tests.

**Architecture:** The app is a single-page App Router DApp. WalletBridgeKit provides the connection shell, while focused ethers helpers, hooks, validators, and presentational components keep chain reads/writes testable and ready for future ERC20 pools.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS v3, ethers v6, @janily/walletbridgekit, @phosphor-icons/react, Vitest, React Testing Library.

---

### Task 1: Project Foundation

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `vitest.setup.ts`, `.env.example`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`

- [x] **Step 1: Install dependencies**

Run: `npm install next react react-dom ethers @janily/walletbridgekit @phosphor-icons/react`
Run: `npm install -D typescript @types/node @types/react @types/react-dom tailwindcss postcss autoprefixer vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom`
Expected: dependencies are present in `node_modules`.

- [x] **Step 2: Configure Next, Tailwind, Vitest**

Expected: `npm run typecheck`, `npm run test`, and `npm run dev` are available.

### Task 2: Contract And Chain Layer

**Files:**
- Create: `src/contracts/stakeAbi.ts`
- Create: `src/contracts/addresses.ts`
- Create: `src/lib/chain.ts`
- Create: `src/lib/ethers.ts`
- Create: `src/types/stake.ts`

- [x] **Step 1: Add Sepolia config and contract address**

Expected: `STAKE_ADDRESS` defaults to `0x56682aa855226f3228b374a69aF5017D174372Fe` and can be overridden by `NEXT_PUBLIC_STAKE_ADDRESS`.

- [x] **Step 2: Add minimal ABI fragments for required reads/writes**

Expected: ABI includes `ETH_PID`, `pool`, `stakingBalance`, `pendingMetaNode`, `withdrawAmount`, pause flags, reward metadata, `depositETH`, `unstake`, `withdraw`, and `claim`.

### Task 3: Formatting, Validation, And Errors

**Files:**
- Create: `src/lib/format.ts`
- Create: `src/lib/validate.ts`
- Create: `src/lib/errors.ts`
- Test: `src/tests/format.test.ts`, `src/tests/validate.test.ts`

- [x] **Step 1: Implement bigint-safe amount formatting and address/hash truncation**

Expected: `formatTokenAmount`, `shortAddress`, and `shortHash` never use unsafe floating point math for chain values.

- [x] **Step 2: Implement amount validation for stake and withdraw**

Expected: empty, zero, negative, invalid, insufficient balance, below min deposit, and over-staked withdraw all return readable Chinese messages.

### Task 4: Wallet, Data, And Action Hooks

**Files:**
- Create: `src/hooks/useInjectedWallet.ts`
- Create: `src/hooks/useStakeData.ts`
- Create: `src/hooks/useStakeActions.ts`
- Test: `src/tests/useStakeActions.test.ts`

- [x] **Step 1: Implement injected wallet detection and Sepolia checks**

Expected: account, chain id, balance, connect, refresh, and wallet event listeners work via `window.ethereum`.

- [x] **Step 2: Implement chain data loading**

Expected: after wallet connection the app reads pool/user state, pause flags, rewards, withdraw request amount, and unlocked withdraw amount.

- [x] **Step 3: Implement write actions with unified transaction lifecycle**

Expected: status flows through validation, wallet confirmation, submitted, confirming, success/failed; success refreshes chain data.

### Task 5: UI Implementation

**Files:**
- Create: `src/components/WalletRoot.tsx`
- Create: `src/components/DappShell.tsx`
- Create: `src/components/MetricStrip.tsx`
- Create: `src/components/PoolPanel.tsx`
- Create: `src/components/ActionPanel.tsx`
- Create: `src/components/TransactionStatus.tsx`
- Test: `src/tests/components.test.tsx`

- [x] **Step 1: Build responsive asymmetric dashboard**

Expected: mobile collapses to one column; desktop uses a left command rail and right operational panels, neutral palette, single moss accent, no emoji, no purple/blue neon.

- [x] **Step 2: Build full UI states**

Expected: disconnected, wrong network, loading skeleton, empty values, inline validation errors, transaction errors, success hash links, button loading/disabled states, manual refresh, and Max stake reserve gas behavior.

### Task 6: Verification

**Files:**
- Modify: implementation and tests as needed

- [ ] **Step 1: Run typecheck**

Run: `npm run typecheck`
Expected: TypeScript passes.

- [ ] **Step 2: Run tests**

Run: `npm test`
Expected: all unit and component tests pass.

- [ ] **Step 3: Run local app**

Run: `npm run dev`
Expected: app opens at `http://localhost:3000`, renders the DApp, and is ready for Sepolia wallet testing.
