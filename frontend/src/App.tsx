import { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Shield, 
  Zap,
  BarChart3,
  Clock,
  Award,
  DollarSign
} from 'lucide-react'
import { Connect } from '@stacks/connect'
import { StacksTestnet } from '@stacks/network'
import { 
  uintCV, 
  principalCV,
  callReadOnlyFunction,
  cvToValue
} from '@stacks/transactions'

const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'
const contractName = 'yieldforgecontract'
const network = new StacksTestnet()

interface VaultInfo {
  totalStx: bigint
  totalBtcRewards: bigint
  totalShares: bigint
  isPaused: boolean
  lastCompound: bigint
  currentCycle: bigint
}

interface UserInfo {
  stxDeposited: bigint
  sharesOwned: bigint
  lastDepositBlock: bigint
  withdrawableStx: bigint
}

interface VaultStats {
  totalStx: bigint
  totalShares: bigint
  sharePrice: bigint
  totalFees: bigint
  currentApy: bigint
  totalYield: bigint
  isPaused: boolean
}

function App() {
  const [userAddress, setUserAddress] = useState<string>('')
  const [vaultInfo, setVaultInfo] = useState<VaultInfo | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [vaultStats, setVaultStats] = useState<VaultStats | null>(null)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawShares, setWithdrawShares] = useState('')
  const [loading, setLoading] = useState(false)

  const connectWallet = async () => {
    const authOptions = {
      appDetails: {
        name: 'YieldForge',
        icon: window.location.origin + '/logo.png',
      },
      redirectTo: '/',
      onFinish: () => {
        window.location.reload()
      },
      userSession: undefined,
    }

    // @ts-ignore
    await Connect.authenticate(authOptions)
  }

  const fetchVaultInfo = async () => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault-info',
        functionArgs: [],
        network,
        senderAddress: contractAddress,
      })

      const value = cvToValue(result)
      setVaultInfo({
        totalStx: BigInt(value.value['total-stx'].value),
        totalBtcRewards: BigInt(value.value['total-btc-rewards'].value),
        totalShares: BigInt(value.value['total-shares'].value),
        isPaused: value.value['is-paused'].value,
        lastCompound: BigInt(value.value['last-compound'].value),
        currentCycle: BigInt(value.value['current-cycle'].value),
      })
    } catch (error) {
      console.error('Error fetching vault info:', error)
    }
  }

  const fetchUserInfo = async () => {
    if (!userAddress) return

    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-user-info',
        functionArgs: [principalCV(userAddress)],
        network,
        senderAddress: userAddress,
      })

      const value = cvToValue(result)
      setUserInfo({
        stxDeposited: BigInt(value.value['stx-deposited'].value),
        sharesOwned: BigInt(value.value['shares-owned'].value),
        lastDepositBlock: BigInt(value.value['last-deposit-block'].value),
        withdrawableStx: BigInt(value.value['withdrawable-stx'].value),
      })
    } catch (error) {
      console.error('Error fetching user info:', error)
    }
  }

  const fetchVaultStats = async () => {
    try {
      const result = await callReadOnlyFunction({
        contractAddress,
        contractName,
        functionName: 'get-vault-statistics',
        functionArgs: [],
        network,
        senderAddress: contractAddress,
      })

      const value = cvToValue(result)
      setVaultStats({
        totalStx: BigInt(value.value['total-stx'].value),
        totalShares: BigInt(value.value['total-shares'].value),
        sharePrice: BigInt(value.value['share-price'].value),
        totalFees: BigInt(value.value['total-fees'].value),
        currentApy: BigInt(value.value['current-apy'].value),
        totalYield: BigInt(value.value['total-yield'].value),
        isPaused: value.value['is-paused'].value,
      })
    } catch (error) {
      console.error('Error fetching vault stats:', error)
    }
  }

  useEffect(() => {
    fetchVaultInfo()
    fetchVaultStats()
    const interval = setInterval(() => {
      fetchVaultInfo()
      fetchVaultStats()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (userAddress) {
      fetchUserInfo()
    }
  }, [userAddress])

  const formatSTX = (microStx: bigint) => {
    return (Number(microStx) / 1000000).toFixed(2)
  }

  const formatAPY = (apy: bigint) => {
    return (Number(apy) / 100).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-primary-600 p-2 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">YieldForge</h1>
                <p className="text-sm text-slate-400">Auto-Compound Vault</p>
              </div>
            </div>

            {!userAddress ? (
              <button onClick={connectWallet} className="btn-primary flex items-center space-x-2">
                <Wallet className="w-5 h-5" />
                <span>Connect Wallet</span>
              </button>
            ) : (
              <div className="flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-white font-mono text-sm">
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Value Locked</span>
              <DollarSign className="w-5 h-5 text-primary-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {vaultInfo ? formatSTX(vaultInfo.totalStx) : '0.00'} STX
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {vaultStats ? formatSTX(vaultStats.totalShares) : '0'} shares
            </p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Current APY</span>
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-3xl font-bold text-green-400">
              {vaultStats ? formatAPY(vaultStats.currentApy) : '0.00'}%
            </p>
            <p className="text-xs text-slate-500 mt-1">Auto-compounding</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Share Price</span>
              <TrendingUp className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {vaultStats ? (Number(vaultStats.sharePrice) / 1000000).toFixed(4) : '1.0000'}
            </p>
            <p className="text-xs text-slate-500 mt-1">STX per share</p>
          </div>

          <div className="stat-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 text-sm font-medium">Total Rewards</span>
              <Award className="w-5 h-5 text-yellow-400" />
            </div>
            <p className="text-3xl font-bold text-white">
              {vaultInfo ? formatSTX(vaultInfo.totalBtcRewards) : '0.00'} BTC
            </p>
            <p className="text-xs text-slate-500 mt-1">Converted to STX</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Deposit/Withdraw Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Deposit Card */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-600/20 p-2 rounded-lg">
                  <ArrowDownCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Deposit STX</h2>
                  <p className="text-sm text-slate-400">Earn auto-compounding yields</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Amount (STX)
                  </label>
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.00"
                    className="input-field"
                    min="1"
                    step="0.01"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Minimum: 1 STX | Maximum: 1,000,000 STX
                  </p>
                </div>

                <button
                  disabled={!userAddress || loading || !depositAmount}
                  className="btn-primary w-full flex items-center justify-center space-x-2"
                >
                  <Zap className="w-5 h-5" />
                  <span>Deposit & Stake</span>
                </button>

                <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                  <div className="flex items-start space-x-2">
                    <Shield className="w-5 h-5 text-primary-400 mt-0.5" />
                    <div className="text-xs text-slate-400">
                      <p className="font-semibold text-slate-300 mb-1">Security Features:</p>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Reentrancy protection enabled</li>
                        <li>Deposit cooldown: ~1 hour between deposits</li>
                        <li>Performance fee: 2% on gains</li>
                        <li>Withdrawal fee: 0.5%</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Withdraw Card */}
            <div className="card">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-red-600/20 p-2 rounded-lg">
                  <ArrowUpCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Withdraw</h2>
                  <p className="text-sm text-slate-400">Redeem your shares for STX</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Shares to Withdraw
                  </label>
                  <input
                    type="number"
                    value={withdrawShares}
                    onChange={(e) => setWithdrawShares(e.target.value)}
                    placeholder="0.00"
                    className="input-field"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Available: {userInfo ? formatSTX(userInfo.sharesOwned) : '0.00'} shares
                  </p>
                </div>

                {userInfo && userInfo.withdrawableStx > 0n && (
                  <div className="bg-primary-900/20 rounded-lg p-3 border border-primary-700">
                    <p className="text-sm text-primary-300">
                      You will receive approximately{' '}
                      <span className="font-bold">{formatSTX(userInfo.withdrawableStx)} STX</span>
                    </p>
                  </div>
                )}

                <button
                  disabled={!userAddress || loading || !withdrawShares}
                  className="btn-secondary w-full flex items-center justify-center space-x-2"
                >
                  <ArrowUpCircle className="w-5 h-5" />
                  <span>Withdraw</span>
                </button>

                <div className="bg-yellow-900/20 rounded-lg p-4 border border-yellow-700">
                  <div className="flex items-start space-x-2">
                    <Clock className="w-5 h-5 text-yellow-400 mt-0.5" />
                    <div className="text-xs text-yellow-200">
                      <p className="font-semibold mb-1">Withdrawal Cooldown:</p>
                      <p>~1 day between withdrawals to prevent abuse</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* User Stats Sidebar */}
          <div className="space-y-6">
            {/* User Position Card */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4">Your Position</h3>
              
              {userAddress ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="text-slate-400 text-sm">Deposited</span>
                    <span className="text-white font-semibold">
                      {userInfo ? formatSTX(userInfo.stxDeposited) : '0.00'} STX
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="text-slate-400 text-sm">Shares Owned</span>
                    <span className="text-white font-semibold">
                      {userInfo ? formatSTX(userInfo.sharesOwned) : '0.00'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-3 border-b border-slate-700">
                    <span className="text-slate-400 text-sm">Current Value</span>
                    <span className="text-green-400 font-semibold">
                      {userInfo ? formatSTX(userInfo.withdrawableStx) : '0.00'} STX
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400 text-sm">Profit/Loss</span>
                    <span className="text-green-400 font-semibold">
                      +{userInfo && userInfo.withdrawableStx > userInfo.stxDeposited
                        ? formatSTX(userInfo.withdrawableStx - userInfo.stxDeposited)
                        : '0.00'} STX
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 text-sm">Connect wallet to view your position</p>
                </div>
              )}
            </div>

            {/* Vault Status Card */}
            <div className="card">
              <h3 className="text-lg font-bold text-white mb-4">Vault Status</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Status</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${vaultInfo?.isPaused ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                    <span className={`text-sm font-semibold ${vaultInfo?.isPaused ? 'text-red-400' : 'text-green-400'}`}>
                      {vaultInfo?.isPaused ? 'Paused' : 'Active'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Current Cycle</span>
                  <span className="text-white font-semibold">
                    #{vaultInfo?.currentCycle.toString() || '0'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Last Compound</span>
                  <span className="text-white font-semibold">
                    Block {vaultInfo?.lastCompound.toString() || '0'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Total Fees</span>
                  <span className="text-white font-semibold">
                    {vaultStats ? formatSTX(vaultStats.totalFees) : '0.00'} STX
                  </span>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="card bg-gradient-to-br from-primary-900/20 to-primary-800/10 border-primary-700">
              <h3 className="text-lg font-bold text-white mb-4">Features</h3>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-primary-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Auto-Compounding</p>
                    <p className="text-slate-400 text-xs">Rewards automatically reinvested</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-primary-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Secure & Audited</p>
                    <p className="text-slate-400 text-xs">Multi-layer security protection</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Award className="w-5 h-5 text-primary-400 mt-0.5" />
                  <div>
                    <p className="text-white font-medium text-sm">Boost Tiers</p>
                    <p className="text-slate-400 text-xs">Up to 15% APY boost for long-term stakers</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-slate-400 text-sm">
            <p>YieldForge - Auto-Compound Vault on Stacks Blockchain</p>
            <p className="mt-1">Built with security and performance in mind</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
