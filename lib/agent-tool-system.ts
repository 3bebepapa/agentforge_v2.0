import { ENV_CONFIG } from "./env-config"
import { BlockchainService, SUPPORTED_NETWORKS } from "./blockchain-service"

export interface AgentTool {
  name: string
  description: string
  parameters: {
    type: string
    properties: Record<string, any>
    required: string[]
  }
  execute: (params: any) => Promise<any>
}

export class AgentToolSystem {
  private tools: Map<string, AgentTool> = new Map()

  constructor() {
    this.initializeTools()
  }

  private initializeTools() {
    // Google 검색 도구
    this.tools.set("google_search", {
      name: "google_search",
      description: "Google Custom Search API를 사용하여 웹 검색을 수행합니다.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "검색할 키워드",
          },
          num: {
            type: "number",
            description: "검색 결과 개수 (기본값: 10)",
            default: 10,
          },
        },
        required: ["query"],
      },
      execute: this.googleSearch.bind(this),
    })

    // Naver 검색 도구
    this.tools.set("naver_search", {
      name: "naver_search",
      description: "Naver Search API를 사용하여 한국어 검색을 수행합니다.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "검색할 키워드",
          },
          display: {
            type: "number",
            description: "검색 결과 개수 (기본값: 10)",
            default: 10,
          },
          sort: {
            type: "string",
            description: "정렬 방식 (sim: 정확도순, date: 날짜순)",
            default: "sim",
          },
        },
        required: ["query"],
      },
      execute: this.naverSearch.bind(this),
    })

    // 블록체인 잔액 조회 도구
    this.tools.set("blockchain_balance", {
      name: "blockchain_balance",
      description: "블록체인 네트워크에서 지갑 주소의 잔액을 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          network: {
            type: "string",
            description: "블록체인 네트워크",
            enum: Object.keys(SUPPORTED_NETWORKS),
          },
          address: {
            type: "string",
            description: "지갑 주소",
          },
        },
        required: ["network", "address"],
      },
      execute: this.getBlockchainBalance.bind(this),
    })

    // 블록체인 트랜잭션 조회 도구
    this.tools.set("blockchain_transaction", {
      name: "blockchain_transaction",
      description: "블록체인 네트워크에서 트랜잭션 정보를 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          network: {
            type: "string",
            description: "블록체인 네트워크",
            enum: Object.keys(SUPPORTED_NETWORKS),
          },
          txHash: {
            type: "string",
            description: "트랜잭션 해시",
          },
        },
        required: ["network", "txHash"],
      },
      execute: this.getBlockchainTransaction.bind(this),
    })

    // 블록체인 가스 가격 조회 도구
    this.tools.set("blockchain_gas_price", {
      name: "blockchain_gas_price",
      description: "블록체인 네트워크의 현재 가스 가격을 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          network: {
            type: "string",
            description: "블록체인 네트워크",
            enum: Object.keys(SUPPORTED_NETWORKS),
          },
        },
        required: ["network"],
      },
      execute: this.getBlockchainGasPrice.bind(this),
    })

    // 계산기 도구
    this.tools.set("calculator", {
      name: "calculator",
      description: "수학 계산을 수행합니다.",
      parameters: {
        type: "object",
        properties: {
          expression: {
            type: "string",
            description: "계산할 수식 (예: 2 + 3 * 4)",
          },
        },
        required: ["expression"],
      },
      execute: this.calculate.bind(this),
    })

    // 현재 시간 도구
    this.tools.set("current_time", {
      name: "current_time",
      description: "현재 시간을 조회합니다.",
      parameters: {
        type: "object",
        properties: {
          timezone: {
            type: "string",
            description: "시간대 (기본값: Asia/Seoul)",
            default: "Asia/Seoul",
          },
        },
        required: [],
      },
      execute: this.getCurrentTime.bind(this),
    })
  }

  private async googleSearch(params: { query: string; num?: number }) {
    try {
      const url = new URL("https://www.googleapis.com/customsearch/v1")
      url.searchParams.set("key", ENV_CONFIG.GOOGLE_CUSTOM_SEARCH_API_KEY)
      url.searchParams.set("cx", ENV_CONFIG.GOOGLE_SEARCH_ENGINE_ID)
      url.searchParams.set("q", params.query)
      url.searchParams.set("num", (params.num || 10).toString())

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.error) {
        throw new Error(data.error.message)
      }

      return {
        success: true,
        results:
          data.items?.map((item: any) => ({
            title: item.title,
            link: item.link,
            snippet: item.snippet,
          })) || [],
        totalResults: data.searchInformation?.totalResults || 0,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Google 검색 중 오류가 발생했습니다.",
      }
    }
  }

  private async naverSearch(params: { query: string; display?: number; sort?: string }) {
    try {
      const url = new URL("https://openapi.naver.com/v1/search/webkr")
      url.searchParams.set("query", params.query)
      url.searchParams.set("display", (params.display || 10).toString())
      url.searchParams.set("sort", params.sort || "sim")

      const response = await fetch(url.toString(), {
        headers: {
          "X-Naver-Client-Id": ENV_CONFIG.NAVER_CLIENT_ID,
          "X-Naver-Client-Secret": ENV_CONFIG.NAVER_CLIENT_SECRET,
        },
      })

      const data = await response.json()

      if (data.errorMessage) {
        throw new Error(data.errorMessage)
      }

      return {
        success: true,
        results:
          data.items?.map((item: any) => ({
            title: item.title.replace(/<[^>]*>/g, ""), // HTML 태그 제거
            link: item.link,
            description: item.description.replace(/<[^>]*>/g, ""),
          })) || [],
        total: data.total || 0,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Naver 검색 중 오류가 발생했습니다.",
      }
    }
  }

  private async getBlockchainBalance(params: { network: string; address: string }) {
    try {
      const service = new BlockchainService(params.network)
      const balance = await service.getBalance(params.address)
      const networkInfo = service.getNetworkInfo()

      return {
        success: true,
        balance: balance.balance,
        symbol: balance.symbol,
        network: networkInfo.name,
        address: params.address,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "잔액 조회 중 오류가 발생했습니다.",
      }
    }
  }

  private async getBlockchainTransaction(params: { network: string; txHash: string }) {
    try {
      const service = new BlockchainService(params.network)
      const transaction = await service.getTransaction(params.txHash)
      const networkInfo = service.getNetworkInfo()

      return {
        success: true,
        transaction,
        network: networkInfo.name,
        txHash: params.txHash,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "트랜잭션 조회 중 오류가 발생했습니다.",
      }
    }
  }

  private async getBlockchainGasPrice(params: { network: string }) {
    try {
      const service = new BlockchainService(params.network)
      const gasPrice = await service.getGasPrice()
      const networkInfo = service.getNetworkInfo()

      return {
        success: true,
        gasPrice: gasPrice.gwei,
        network: networkInfo.name,
        raw: gasPrice.gasPrice,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "가스 가격 조회 중 오류가 발생했습니다.",
      }
    }
  }

  private async calculate(params: { expression: string }) {
    try {
      // 안전한 수식 계산을 위한 간단한 파서
      const sanitized = params.expression.replace(/[^0-9+\-*/().\s]/g, "")
      const result = Function(`"use strict"; return (${sanitized})`)()

      return {
        success: true,
        expression: params.expression,
        result: result,
      }
    } catch (error) {
      return {
        success: false,
        error: "잘못된 수식입니다. 숫자와 기본 연산자만 사용해주세요.",
      }
    }
  }

  private async getCurrentTime(params: { timezone?: string }) {
    try {
      const now = new Date()
      const timezone = params.timezone || "Asia/Seoul"

      const timeString = now.toLocaleString("ko-KR", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })

      return {
        success: true,
        currentTime: timeString,
        timezone: timezone,
        timestamp: now.getTime(),
      }
    } catch (error) {
      return {
        success: false,
        error: "시간 조회 중 오류가 발생했습니다.",
      }
    }
  }

  public getAvailableTools(): AgentTool[] {
    return Array.from(this.tools.values())
  }

  public getTool(name: string): AgentTool | undefined {
    return this.tools.get(name)
  }

  public async executeTool(name: string, params: any): Promise<any> {
    const tool = this.tools.get(name)
    if (!tool) {
      throw new Error(`Tool '${name}' not found`)
    }

    return await tool.execute(params)
  }
}
