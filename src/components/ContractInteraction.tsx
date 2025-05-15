import { useState } from 'react'
import Web3 from 'web3'
import '../styles/ContractInteraction.css'

interface ContractInteractionProps {
  connectedAccount: string | null
}

const ContractInteraction = ({
  connectedAccount,
}: ContractInteractionProps) => {
  const [contractAddress, setContractAddress] = useState('')
  const [abi, setAbi] = useState('')
  const [method, setMethod] = useState('')
  const [params, setParams] = useState('')
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 调用智能合约
  const callContract = async () => {
    if (!connectedAccount) {
      setError('请先连接钱包')
      return
    }

    if (!contractAddress || !abi || !method) {
      setError('请填写合约地址、ABI和方法名')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // 初始化Web3
      const web3 = new Web3(window.ethereum)

      // 解析ABI
      let parsedAbi
      try {
        parsedAbi = JSON.parse(abi)
      } catch (e) {
        throw new Error('ABI格式无效')
      }

      // 创建合约实例
      const contract = new web3.eth.Contract(parsedAbi, contractAddress)

      // 解析参数
      const methodParams = params
        ? params.split(',').map((param) => param.trim())
        : []

      // 调用合约方法
      const contractMethod = contract.methods[method]
      if (!contractMethod) {
        throw new Error(`合约中不存在方法: ${method}`)
      }

      const response = await contractMethod(...methodParams).call({
        from: connectedAccount,
      })
      setResult(response)
    } catch (err: any) {
      console.error('调用合约失败:', err)
      setError(err.message || '调用合约失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="contract-interaction">
      <h2>智能合约交互</h2>

      <div className="form-group">
        <label>合约地址</label>
        <input
          type="text"
          value={contractAddress}
          onChange={(e) => setContractAddress(e.target.value)}
          placeholder="输入合约地址"
          disabled={!connectedAccount}
        />
      </div>

      <div className="form-group">
        <label>合约ABI</label>
        <textarea
          value={abi}
          onChange={(e) => setAbi(e.target.value)}
          placeholder="输入合约ABI (JSON格式)"
          disabled={!connectedAccount}
        />
      </div>

      <div className="form-group">
        <label>方法名</label>
        <input
          type="text"
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          placeholder="输入要调用的方法名"
          disabled={!connectedAccount}
        />
      </div>

      <div className="form-group">
        <label>参数 (用逗号分隔)</label>
        <input
          type="text"
          value={params}
          onChange={(e) => setParams(e.target.value)}
          placeholder="输入参数，用逗号分隔"
          disabled={!connectedAccount}
        />
      </div>

      <button
        className="call-button"
        onClick={callContract}
        disabled={!connectedAccount || loading}
      >
        {loading ? '调用中...' : '调用合约'}
      </button>

      {error && <div className="error-message">{error}</div>}

      {result !== null && (
        <div className="result-container">
          <h3>调用结果:</h3>
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {!connectedAccount && (
        <div className="connect-notice">请先连接钱包以使用此功能</div>
      )}
    </div>
  )
}

export default ContractInteraction
