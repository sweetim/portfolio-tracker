export interface UserOwnedStockData {
    numberOfShares: number
    averageAcquiredPrice: number
}

export interface StockData {
    currentPrice: number
    marketValue: number
    compositionRatio: number
    profit_percentage: number
    profit: number
}

export type StockCurrency = 'usd'
    | 'jpy'

export type UserStockData = Partial<UserOwnedStockData> & Partial<StockData>

export interface UserStockRecord {
    [symbol: string]: {
        profile?: StockProfile,
        accounts: {
            [accountType: string]: {
                [currency in StockCurrency]?: UserStockData
            },
            total?: {
                [currency in StockCurrency]?: UserStockData
            }
        }
    }
}

export interface StockQuote {
    timestamp: number
    currentPrice: number
    change: number
    change_percent: number
    high: number
    low: number
    openPrice: number
    previousClose: number
}


export interface StockProfile {
    symbol: string
    logoUrl: string
    industry: string
    country: string
    name: string
}