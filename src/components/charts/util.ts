import { StockCurrency, UserStockHolding } from "@/model/stocks"

export interface VisualizationItem {
    key: string
    timestamp: number
    symbol: string
    accountType: string
    numberOfShares: number
    averageAcquiredPrice: number
    currentPrice: number
    profit_percentage: number
    marketValue: number
    profit: number
    compositionRatio: number
    name?: string
    logoUrl?: string
    industry?: string
    children?: VisualizationItem[]
}

export function convertUserStockHoldingToVisualizationItem(
    input: UserStockHolding,
    currency: StockCurrency = "usd"): VisualizationItem[]
{
    return Object.entries(input)
        .map(([ symbol, item ]) => {
            const children = Object.entries(item.accounts)
                .map(([ accountType, currencies ]) => ({
                    key: `${symbol}/${accountType}/${currencies[currency].timestamp}`,
                    timestamp: currencies[currency].timestamp,
                    symbol,
                    accountType,
                    numberOfShares: currencies[currency].numberOfShares,
                    averageAcquiredPrice: currencies[currency].averageAcquiredPrice,
                    currentPrice: currencies[currency].currentPrice,
                    profit_percentage: currencies[currency].profit_percentage,
                    marketValue: currencies[currency].marketValue,
                    profit: currencies[currency].profit,
                    compositionRatio: currencies[currency].compositionRatio,
                }))

            const nunberOfAccountTypes = Object.keys(item.accounts).length

            return {
                key: `${symbol}/summary/${item.summary[currency].timestamp}`,
                timestamp: item.summary[currency].timestamp,
                symbol,
                accountType: "",
                numberOfShares: item.summary[currency].numberOfShares,
                averageAcquiredPrice: item.summary[currency].averageAcquiredPrice,
                currentPrice: item.summary[currency].currentPrice,
                profit_percentage: item.summary[currency].profit_percentage,
                marketValue: item.summary[currency].marketValue,
                profit: item.summary[currency].profit,
                compositionRatio: item.summary[currency].compositionRatio,
                name: item.profile.name,
                logoUrl: item.profile.logoUrl,
                industry: item.profile.industry,
                ...((nunberOfAccountTypes > 1) && { children })
            }
        })
}

if (import.meta.vitest) {
    const { describe, test , expect } = import.meta.vitest

    describe("convertUserStockHoldingToVisualizationItem", () => {
        test("it should convert to visualization items", () => {
            const input =  {
                "AMZN": {
                    profile: {
                        country: "country",
                        industry: "industry",
                        logoUrl: "logoUrl",
                        name: "AMZN",
                        symbol: "AMZN"
                    },
                    accounts: {
                        "特定": {
                            usd: {
                                numberOfShares: 6,
                                averageAcquiredPrice: 91.06,
                                currentPrice: 100,
                                change: 100,
                                change_percentage: 0.1,
                                openPrice: 100,
                                timestamp: 100,
                                marketValue: 600,
                                compositionRatio: 0,
                                profit_percentage: 9.81770261366132,
                                profit: 53.639999999999986
                            }
                        },
                        "NISA": {
                            usd: {
                                numberOfShares: 20,
                                averageAcquiredPrice: 105.18,
                                currentPrice: 100,
                                change: 100,
                                change_percentage: 0.1,
                                openPrice: 100,
                                timestamp: 100,
                                marketValue: 2000,
                                compositionRatio: 0,
                                profit_percentage: -4.924890663624269,
                                profit: -103.60000000000014
                            }
                        },
                    },
                    summary: {
                        usd: {
                            numberOfShares: 26,
                            averageAcquiredPrice: 101.92153846153847,
                            currentPrice: 100,
                            change: 100,
                            change_percentage: 0.1,
                            openPrice: 100,
                            timestamp: 100,
                            marketValue: 2600,
                            compositionRatio: 0,
                            profit_percentage: -1.8853114763996568,
                            profit: -49.96000000000035
                        }
                    }
                }
            }

            const expected = [{
                key: "AMZN/summary/100",
                timestamp: 100,
                symbol: "AMZN",
                accountType: "",
                numberOfShares: 26,
                averageAcquiredPrice: 101.92153846153847,
                currentPrice: 100,
                profit_percentage: -1.8853114763996568,
                marketValue: 2600,
                profit: -49.96000000000035,
                compositionRatio: 0,
                name: "AMZN",
                logoUrl: "logoUrl",
                industry: "industry",
                children: [
                    {
                        key: 'AMZN/特定/100',
                        timestamp: 100,
                        symbol: 'AMZN',
                        accountType: '特定',
                        numberOfShares: 6,
                        averageAcquiredPrice: 91.06,
                        currentPrice: 100,
                        profit_percentage: 9.81770261366132,
                        marketValue: 600,
                        profit: 53.639999999999986,
                        compositionRatio: 0
                      },
                      {
                        key: 'AMZN/NISA/100',
                        timestamp: 100,
                        symbol: 'AMZN',
                        accountType: 'NISA',
                        numberOfShares: 20,
                        averageAcquiredPrice: 105.18,
                        currentPrice: 100,
                        profit_percentage: -4.924890663624269,
                        marketValue: 2000,
                        profit: -103.60000000000014,
                        compositionRatio: 0
                      }
                ]
            }]

            expect(convertUserStockHoldingToVisualizationItem(input)).toStrictEqual(expected)
        })
    })
}