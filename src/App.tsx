import { useState } from 'react'
import './App.css'
import WalletConnect from './components/WalletConnect'
import ContractInteraction from './components/ContractInteraction'
import TransactionSender from './components/TransactionSender'
import BlockchainInfo from './components/BlockchainInfo'

function App() {
  const [connectedAccounts, setConnectedAccounts] = useState<string[]>([])

  const handleWalletConnect = (accounts: string[]) => {
    setConnectedAccounts(accounts)
  }

  return (
    <div className="app-container">
      <header>
        <h1>Web3 DApp</h1>
        <WalletConnect onConnect={handleWalletConnect} />
      </header>

      <main>
        {connectedAccounts.length > 0 ? (
          <div className="dashboard-grid">
            <div className="dashboard-item blockchain-info-container">
              <BlockchainInfo connectedAccount={connectedAccounts[0]} />
            </div>
            <div className="dashboard-item transaction-sender-container">
              <TransactionSender connectedAccount={connectedAccounts[0]} />
            </div>
            <div className="dashboard-item contract-interaction-container">
              <ContractInteraction connectedAccount={connectedAccounts[0]} />
            </div>
          </div>
        ) : (
          <div className="connect-prompt">
            <h2>欢迎使用Web3 DApp</h2>
            <p>请连接您的钱包以使用智能合约交互功能</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default App
