import { ENV_CONFIG } from "./env-config"

export interface BlockchainNetwork {
  name: string
  chainId: number
  rpcUrl: string
  blockExplorer: string
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}

export const SUPPORTED_NETWORKS: Record<string, BlockchainNetwork> = {
  "ethereum-mainnet": {
    name: "Ethereum Mainnet",
    chainId: 1,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.ethereum.mainnet,
    blockExplorer: "https://etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  "ethereum-sepolia": {
    name: "Ethereum Sepolia",
    chainId: 11155111,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.ethereum.sepolia,
    blockExplorer: "https://sepolia.etherscan.io",
    nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
  },
  "polygon-mainnet": {
    name: "Polygon Mainnet",
    chainId: 137,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.polygon.mainnet,
    blockExplorer: "https://polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
  "polygon-amoy": {
    name: "Polygon Amoy",
    chainId: 80002,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.polygon.amoy,
    blockExplorer: "https://amoy.polygonscan.com",
    nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  },
  "arbitrum-mainnet": {
    name: "Arbitrum One",
    chainId: 42161,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.arbitrum.mainnet,
    blockExplorer: "https://arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  "arbitrum-sepolia": {
    name: "Arbitrum Sepolia",
    chainId: 421614,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.arbitrum.sepolia,
    blockExplorer: "https://sepolia.arbiscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  "base-mainnet": {
    name: "Base",
    chainId: 8453,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.base.mainnet,
    blockExplorer: "https://basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  "base-sepolia": {
    name: "Base Sepolia",
    chainId: 84532,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.base.sepolia,
    blockExplorer: "https://sepolia.basescan.org",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  "optimism-mainnet": {
    name: "Optimism",
    chainId: 10,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.optimism.mainnet,
    blockExplorer: "https://optimistic.etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
  "optimism-sepolia": {
    name: "Optimism Sepolia",
    chainId: 11155420,
    rpcUrl: ENV_CONFIG.BLOCKCHAIN_NETWORKS.optimism.sepolia,
    blockExplorer: "https://sepolia-optimism.etherscan.io",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  },
}

export class BlockchainService {
  private network: BlockchainNetwork

  constructor(networkKey: string) {
    this.network = SUPPORTED_NETWORKS[networkKey]
    if (!this.network) {
      throw new Error(`Unsupported network: ${networkKey}`)
    }
  }

  async getBalance(address: string): Promise<{ balance: string; symbol: string }> {
    try {
      const response = await fetch(this.network.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getBalance",
          params: [address, "latest"],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      // Convert from wei to ether
      const balanceWei = BigInt(data.result)
      const balanceEther = Number(balanceWei) / Math.pow(10, this.network.nativeCurrency.decimals)

      return {
        balance: balanceEther.toFixed(6),
        symbol: this.network.nativeCurrency.symbol,
      }
    } catch (error) {
      console.error("Error fetching balance:", error)
      throw error
    }
  }

  async getTransaction(txHash: string): Promise<any> {
    try {
      const response = await fetch(this.network.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_getTransactionByHash",
          params: [txHash],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      return data.result
    } catch (error) {
      console.error("Error fetching transaction:", error)
      throw error
    }
  }

  async getGasPrice(): Promise<{ gasPrice: string; gwei: string }> {
    try {
      const response = await fetch(this.network.rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_gasPrice",
          params: [],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      const gasPriceWei = BigInt(data.result)
      const gasPriceGwei = Number(gasPriceWei) / Math.pow(10, 9)

      return {
        gasPrice: data.result,
        gwei: gasPriceGwei.toFixed(2),
      }
    } catch (error) {
      console.error("Error fetching gas price:", error)
      throw error
    }
  }

  getBlockExplorerUrl(type: "address" | "tx", value: string): string {
    return `${this.network.blockExplorer}/${type}/${value}`
  }

  getNetworkInfo(): BlockchainNetwork {
    return this.network
  }
}
