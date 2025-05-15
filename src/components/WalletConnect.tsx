import { useState, useEffect } from 'react'
import '../styles/WalletConnect.css'

interface WalletConnectProps {
  onConnect: (accounts: string[]) => void
}

const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const [isConnected, setIsConnected] = useState(false)
  const [accounts, setAccounts] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // 检查是否已安装MetaMask
  const checkIfWalletIsInstalled = () => {
    return (
      typeof window !== 'undefined' && typeof window.ethereum !== 'undefined'
    )
  }

  // 检查钱包连接状态
  useEffect(() => {
    const checkConnection = async () => {
      if (checkIfWalletIsInstalled()) {
        try {
          // 获取已连接的账户
          const accounts = await window.ethereum.request({
            method: 'eth_accounts',
          })
          if (accounts.length > 0) {
            setAccounts(accounts)
            setIsConnected(true)
            onConnect(accounts)
          }
        } catch (err) {
          console.error('获取账户失败:', err)
          setError('获取账户失败')
        }
      }
    }

    checkConnection()

    // 监听账户变化
    if (checkIfWalletIsInstalled()) {
      window.ethereum.on('accountsChanged', (newAccounts: string[]) => {
        if (newAccounts.length > 0) {
          setAccounts(newAccounts)
          setIsConnected(true)
          onConnect(newAccounts)
        } else {
          setAccounts([])
          setIsConnected(false)
        }
      })
    }
  }, [onConnect])

  // 连接钱包
  const connectWallet = async () => {
    if (!checkIfWalletIsInstalled()) {
      setError('请安装MetaMask钱包')
      return
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      setAccounts(accounts)
      setIsConnected(true)
      setError(null)
      onConnect(accounts)
    } catch (err) {
      console.error('连接钱包失败:', err)
      setError('连接钱包失败')
    }
  }

  // 断开钱包连接
  const disconnectWallet = () => {
    setAccounts([])
    setIsConnected(false)
    onConnect([])
  }

  return (
    <div className="wallet-connect-container">
      {error && <div className="error-message">{error}</div>}

      {!isConnected ? (
        <button className="connect-button" onClick={connectWallet}>
          连接钱包
        </button>
      ) : (
        <div className="wallet-info">
          <h2>Web3 DApp</h2>
          <p className="account-address">
            {accounts[0]?.substring(0, 6)}...
            {accounts[0]?.substring(accounts[0].length - 4)}
          </p>
          <button className="disconnect-button" onClick={disconnectWallet}>
            断开连接
          </button>
        </div>
      )}
    </div>
  )
}

export default WalletConnect

// 为TypeScript添加全局Window类型扩展
declare global {
  interface Window {
    ethereum: any
  }
}
