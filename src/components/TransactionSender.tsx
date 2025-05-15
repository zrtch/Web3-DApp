import { useState } from 'react'
import Web3 from 'web3'
import '../styles/TransactionSender.css'

interface TransactionSenderProps {
  connectedAccount: string | null
}

const TransactionSender = ({ connectedAccount }: TransactionSenderProps) => {
  const [recipient, setRecipient] = useState('')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // 发送交易
  const sendTransaction = async () => {
    if (!connectedAccount) {
      setError('请先连接钱包')
      return
    }

    if (!recipient || !amount) {
      setError('请填写接收地址和金额')
      return
    }

    // 验证地址格式
    const web3 = new Web3(window.ethereum)
    if (!web3.utils.isAddress(recipient)) {
      setError('无效的以太坊地址')
      return
    }

    setLoading(true)
    setError(null)
    setTxHash(null)

    try {
      // 将ETH转换为Wei
      const amountInWei = web3.utils.toWei(amount, 'ether')

      // 发送交易
      const tx = await web3.eth.sendTransaction({
        from: connectedAccount,
        to: recipient,
        value: amountInWei,
      })

      setTxHash(tx.transactionHash)
    } catch (err: any) {
      console.error('交易发送失败:', err)
      setError(err.message || '交易发送失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取当前网络
  const [network, setNetwork] = useState<string>('')

  const getNetwork = async () => {
    if (!connectedAccount) return

    try {
      const web3 = new Web3(window.ethereum)
      const chainId = await web3.eth.getChainId()

      // 根据链ID识别网络
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
    } catch (err) {
      console.error('获取网络失败:', err)
    }
  }

  // 当账户连接时获取网络
  if (connectedAccount && !network) {
    getNetwork()
  }

  return (
    <div className="transaction-sender">
      <h2>发送交易</h2>

      {network && (
        <div className="network-info">
          当前网络: <span>{network}</span>
        </div>
      )}

      <div className="form-group">
        <label>接收地址</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="输入以太坊地址"
          disabled={!connectedAccount || loading}
        />
      </div>

      <div className="form-group">
        <label>金额 (ETH)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="输入ETH金额"
          step="0.001"
          min="0"
          disabled={!connectedAccount || loading}
        />
      </div>

      <button
        className="send-button"
        onClick={sendTransaction}
        disabled={!connectedAccount || loading}
      >
        {loading ? '发送中...' : '发送交易'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {txHash && (
        <div className="success-message">
          <p>交易已发送!</p>
          <p className="tx-hash">
            交易哈希:{' '}
            <a
              href={`https://etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {txHash}
            </a>
          </p>
        </div>
      )}

      {!connectedAccount && (
        <div className="connect-notice">请先连接钱包以使用此功能</div>
      )}
    </div>
  )
}

export default TransactionSender
