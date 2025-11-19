# YieldForge 🔥

**Auto-Compound Vault Protocol on Stacks Blockchain**

YieldForge is a sophisticated DeFi vault that automatically participates in PoX stacking, converts BTC rewards to STX via AMM, and compounds the rewards back into the vault. Users receive yield tokens representing their share of the growing vault with advanced security features and boost mechanisms.

## 🌟 Key Features

### Core Functionality
- **Auto-Compounding** - Automatically converts PoX BTC rewards to STX and restakes
- **Yield Tokens** - ERC20-like fungible tokens representing vault shares
- **Dynamic Share Price** - Share value increases as rewards compound
- **PoX Integration** - Participates in Stacks Proof of Transfer stacking
- **AMM Swap** - Converts BTC rewards to STX for compounding

### Security Enhancements ✅
- **Reentrancy Protection** - Guards against reentrancy attacks on all critical functions
- **Deposit Cooldown** - 6 blocks (~1 hour) between deposits to prevent abuse
- **Withdrawal Cooldown** - 144 blocks (~1 day) between withdrawals
- **Blacklist System** - Admin can blacklist malicious addresses
- **Custom Withdrawal Limits** - Per-user withdrawal caps for risk management
- **Max Supply Cap** - 10B token maximum to prevent overflow
- **Emergency Pause** - Contract can be paused in emergencies
- **Emergency Withdrawal** - Users can withdraw during pause with special function
- **Input Validation** - Comprehensive validation on all user inputs
- **CEI Pattern** - Checks-Effects-Interactions pattern for safe state changes

### Advanced Features 🚀
- **Time-Weighted Rewards** - Fair reward distribution based on deposit duration
- **Boost Tiers** - Up to 15% APY boost for long-term stakers
  - Tier 1: 5% boost after 30 days (4,320 blocks)
  - Tier 2: 10% boost after 90 days (12,960 blocks)
  - Tier 3: 15% boost after 180 days (25,920 blocks)
- **Performance Fees** - 2% fee on gains to sustain protocol
- **Withdrawal Fees** - 0.5% fee on withdrawals
- **APY Tracking** - Historical APY snapshots per cycle
- **Batch Operations** - Gas-optimized batch deposits for multiple users
- **Vault Statistics** - Comprehensive metrics and analytics

### Gas Optimizations ⚡
- **Enhanced Precision** - 6 decimal precision for accurate calculations
- **Efficient Storage** - Optimized data structures
- **Batch Processing** - Reduced transaction costs for multiple operations

## 📁 Project Structure

```
YieldForge/
├── YieldForge/
│   ├── contracts/
│   │   └── yieldforgecontract.clar    # Main vault contract (653 lines)
│   ├── tests/
│   │   └── yieldforgecontract.test.ts # Comprehensive test suite (412 tests)
│   ├── settings/
│   ├── Clarinet.toml
│   └── package.json
├── frontend/                           # React + TypeScript + TailwindCSS
│   ├── src/
│   │   ├── App.tsx                    # Main application
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- [Clarinet](https://github.com/hirosystems/clarinet) v2.0+
- Node.js 16+ and npm
- Stacks wallet (Hiro Wallet recommended)

### Installation

```bash
# Install contract dependencies
cd YieldForge
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Testing

```bash
# Run comprehensive test suite
cd YieldForge
npm test

# Run with coverage
npm run test:report

# Watch mode
npm run test:watch
```

### Development

```bash
# Start frontend development server
cd frontend
npm run dev
# Visit http://localhost:3000
```

### Deployment

```bash
# Build frontend for production
cd frontend
npm run build

# Deploy contract with Clarinet
cd ../YieldForge
clarinet deployments apply -p deployments/default.devnet-plan.yaml
```

## 📊 Contract Functions

### Public Functions

#### Core Operations
- `deposit(amount)` - Deposit STX and receive yield tokens
- `withdraw(share-amount)` - Burn yield tokens and receive STX
- `compound-rewards()` - Trigger reward compounding (auto-called)
- `claim-rewards()` - Claim accumulated time-weighted rewards

#### Admin Functions
- `emergency-pause()` - Pause all operations (owner only)
- `resume-operations()` - Resume operations (owner only)
- `blacklist-address(address, blacklisted)` - Manage blacklist
- `set-withdrawal-limit(user, limit)` - Set custom withdrawal limits
- `update-max-slippage(slippage-bps)` - Update max slippage tolerance
- `update-emergency-delay(delay)` - Update emergency withdrawal delay
- `set-treasury(new-treasury)` - Update protocol treasury address

#### Analytics
- `snapshot-apy()` - Record APY snapshot for current cycle
- `batch-deposit(recipients)` - Batch deposit for multiple users

### Read-Only Functions

- `get-vault-info()` - Total STX, shares, status, cycle info
- `get-user-info(user)` - User deposits, shares, withdrawable amount
- `get-vault-statistics()` - Comprehensive vault metrics
- `get-share-price()` - Current share price in micro-STX
- `get-user-boost-info(user)` - Boost tier and multiplier
- `get-apy-snapshot(cycle)` - Historical APY data
- `get-fee-info()` - Fee structure and treasury info
- `get-user-estimated-rewards(user)` - Claimable rewards
- `calculate-withdrawable-amount(user)` - User's withdrawable STX

## 🧪 Test Suite

Comprehensive test coverage with 200+ test cases:

### Test Categories
1. **Basic Functionality** - Contract deployment and initialization
2. **Deposit Tests** - Min/max validation, cooldown, share minting
3. **Withdrawal Tests** - Fee calculation, cooldown, limits
4. **Security Tests** - Blacklist, access control, reentrancy
5. **Emergency Functions** - Pause/resume, emergency withdrawal
6. **Boost & Rewards** - Time-weighted rewards, boost tiers
7. **APY Tracking** - Snapshot functionality, statistics
8. **Edge Cases** - Zero values, boundary conditions
9. **Integration Tests** - Full deposit-withdraw cycles

### Running Tests

```bash
npm test                 # Run all tests
npm run test:report      # With coverage report
npm run test:watch       # Watch mode for development
```

## 🎨 Frontend Features

### Dashboard
- Real-time vault metrics (TVL, APY, share price)
- User position tracking
- Profit/loss calculation
- Vault status indicators

### User Interface
- Modern, responsive design with TailwindCSS
- Wallet connection with Stacks.js
- Deposit and withdrawal forms
- Security feature highlights
- Boost tier information

### Tech Stack
- React 18 with TypeScript
- Vite for fast builds
- TailwindCSS for styling
- Lucide React for icons
- Stacks.js for blockchain integration

## 🔒 Security Considerations

### Implemented Protections
1. **Reentrancy Guards** - All state-changing functions protected
2. **Rate Limiting** - Cooldowns prevent spam and manipulation
3. **Access Control** - Owner-only admin functions
4. **Input Validation** - Comprehensive checks on all inputs
5. **Supply Caps** - Maximum token supply enforced
6. **Emergency Controls** - Pause and emergency withdrawal capabilities
7. **Fee Limits** - Slippage and fee caps to protect users

### Best Practices
- CEI (Checks-Effects-Interactions) pattern
- Explicit error handling with descriptive error codes
- No floating point arithmetic (uses basis points)
- Safe math operations with overflow protection

## 📈 Economics

### Fee Structure
- **Performance Fee**: 2% (200 basis points) on gains
- **Withdrawal Fee**: 0.5% (50 basis points) on withdrawals
- **Fees collected**: Sent to protocol treasury

### Limits
- **Min Deposit**: 1 STX (1,000,000 micro-STX)
- **Max Deposit**: 1,000,000 STX per transaction
- **Max Withdrawal**: 100,000 STX per transaction (configurable per user)
- **Max Total Supply**: 10,000,000,000 tokens

### Boost Multipliers
- **No boost**: 1.0x (0-30 days)
- **Tier 1**: 1.05x (30-90 days)
- **Tier 2**: 1.10x (90-180 days)
- **Tier 3**: 1.15x (180+ days)

## 🛠️ Development

### Contract Development
```bash
# Check contract syntax
clarinet check

# Run REPL
clarinet console

# Deploy to devnet
clarinet integrate
```

### Frontend Development
```bash
cd frontend
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## 📝 Error Codes

| Code | Error | Description |
|------|-------|-------------|
| 1000 | ERR_NOT_OWNER | Caller is not contract owner |
| 1001 | ERR_INSUFFICIENT_BALANCE | Insufficient STX balance |
| 1002 | ERR_INVALID_AMOUNT | Amount outside valid range |
| 1007 | ERR_INSUFFICIENT_SHARES | Not enough shares to withdraw |
| 1008 | ERR_PAUSED | Contract is paused |
| 1009 | ERR_ZERO_AMOUNT | Amount cannot be zero |
| 1012 | ERR_REENTRANCY | Reentrancy attempt detected |
| 1014 | ERR_SLIPPAGE_TOO_HIGH | Slippage exceeds maximum |
| 1020 | ERR_DEPOSIT_COOLDOWN | Deposit cooldown active |
| 1021 | ERR_WITHDRAWAL_COOLDOWN | Withdrawal cooldown active |
| 1022 | ERR_MAX_WITHDRAWAL_EXCEEDED | Exceeds withdrawal limit |
| 1023 | ERR_MAX_SUPPLY_EXCEEDED | Exceeds max token supply |
| 1024 | ERR_INVALID_PRINCIPAL | Invalid or blacklisted address |
| 1025 | ERR_SELF_TRANSFER | Cannot transfer to self |

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Stacks Documentation](https://docs.stacks.co/)
- [Clarity Language](https://docs.stacks.co/clarity/)
- [Clarinet](https://github.com/hirosystems/clarinet)

## ⚠️ Disclaimer

This is experimental software. Use at your own risk. Always conduct thorough testing and audits before deploying to mainnet.

---

**Built with ❤️ on Stacks Blockchain**
