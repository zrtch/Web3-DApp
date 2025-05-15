import { useState, useEffect } from 'react'
import Web3 from 'web3'
import '../styles/BlockchainInfo.css'

interface BlockchainInfoProps {
  connectedAccount: string | null
}

const BlockchainInfo = ({ connectedAccount }: BlockchainInfoProps) => {
  const [balance, setBalance] = useState<string>('')
  const [network, setNetwork] = useState<string>('')
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [gasPrice, setGasPrice] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBlockchainInfo = async () => {
      if (!connectedAccount) {
        setLoading(false)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const web3 = new Web3(window.ethereum)

        // 获取账户余额
        const balanceWei = await web3.eth.getBalance(connectedAccount)
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether')
        setBalance(parseFloat(balanceEth).toFixed(4))

        // 获取当前网络
        const chainId = await web3.eth.getChainId()
        let networkName
        switch (chainId) {
          case 1:
            networkName = '以太坊主网'
            break
          case 5:
            networkName = 'Goerli测试网'
            break
          case 11155111:
            networkName = 'Sepolia测试网'
            break
          case 137:
            networkName = 'Polygon'
            break
          default:
            networkName = `链ID: ${chainId}`
        }
        setNetwork(networkName)

        // 获取最新区块号
        const latestBlock = await web3.eth.getBlockNumber()
        setBlockNumber(latestBlock)

        // 获取当前Gas价格
        const gasPriceWei = await web3.eth.getGasPrice()
        const gasPriceGwei = web3.utils.fromWei(gasPriceWei, 'gwei')
        setGasPrice(parseFloat(gasPriceGwei).toFixed(2))
      } catch (err: any) {
        console.error('获取区块链信息失败:', err)
        setError(err.message || '获取区块链信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchBlockchainInfo()

    // 设置定时器，每30秒更新一次信息
    const intervalId = setInterval(fetchBlockchainInfo, 30000)

    // 清理函数
    return () => clearInterval(intervalId)
  }, [connectedAccount])

  if (!connectedAccount) {
    return null
  }

  return (
    <div className="blockchain-info">
      <h3>区块链信息</h3>

      {loading ? (
        <div className="loading">加载中...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">账户余额</span>
            <span className="info-value">{balance} ETH</span>
          </div>

          <div className="info-item">
            <span className="info-label">当前网络</span>
            <span className="info-value">{network}</span>
          </div>

          <div className="info-item">
            <span className="info-label">最新区块</span>
            <span className="info-value">{blockNumber}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Gas价格</span>
            <span className="info-value">{gasPrice} Gwei</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BlockchainInfo
