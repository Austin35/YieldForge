# YieldForge Frontend

Modern, responsive React frontend for the YieldForge auto-compound vault protocol.

## Features

- 🎨 **Modern UI** - Built with React, TypeScript, and TailwindCSS
- 🔐 **Wallet Integration** - Seamless Stacks wallet connection
- 📊 **Real-time Stats** - Live vault metrics and user positions
- 💎 **Beautiful Design** - Gradient backgrounds, smooth animations, and intuitive UX
- 📱 **Responsive** - Works perfectly on desktop, tablet, and mobile

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **Stacks.js** - Blockchain integration
- **Lucide React** - Beautiful icon library

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- A Stacks wallet (Hiro Wallet recommended)

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── App.tsx          # Main application component
│   ├── main.tsx         # Application entry point
│   └── index.css        # Global styles and Tailwind config
├── public/              # Static assets
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Vite configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## Features Overview

### Dashboard
- Total Value Locked (TVL)
- Current APY with auto-compounding
- Share price tracking
- Total rewards earned

### Deposit
- Easy STX deposits
- Automatic share minting
- Min/max validation
- Cooldown protection

### Withdraw
- Redeem shares for STX
- Fee calculation display
- Cooldown enforcement
- Real-time value preview

### User Position
- Deposited amount
- Shares owned
- Current value
- Profit/Loss tracking

### Vault Status
- Active/Paused indicator
- Current cycle information
- Last compound block
- Total fees collected

## Security Features Displayed

- ✅ Reentrancy protection
- ✅ Deposit cooldown (~1 hour)
- ✅ Withdrawal cooldown (~1 day)
- ✅ Performance fee (2% on gains)
- ✅ Withdrawal fee (0.5%)
- ✅ Boost tiers for long-term stakers

## Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        // Your custom colors
      }
    }
  }
}
```

### Contract Configuration

Update contract details in `src/App.tsx`:

```typescript
const contractAddress = 'YOUR_CONTRACT_ADDRESS'
const contractName = 'yieldforgecontract'
const network = new StacksTestnet() // or StacksMainnet()
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License
