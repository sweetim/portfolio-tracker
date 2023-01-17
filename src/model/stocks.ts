export interface UserStockData {
    numberOfShares: number,
    averageAcquiredPrice: number,
    currentPrice: number,
    change: number,
    change_percentage: number,
    openPrice: number,
    timestamp: number,
    marketValue: number,
    compositionRatio: number,
    profit_percentage: number,
    profit: number,
}

export type StockCurrency = 'usd'
    | 'jpy'

export interface UserStockHolding {
    [symbol: string]: {
        profile?: StockProfile,
        accounts: {
            [accountType: string]: {
                [currency in StockCurrency]?: UserStockData
            },
        },
        summary?: {
            [currency in StockCurrency]?: UserStockData
        }
    }
}

export interface StockQuote {
    symbol: string
    timestamp: number
    currentPrice: number
    change: number
    change_percentage: number
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

export function convertToSymbolObjects<T extends { symbol: string }>(input: T[]): { [symbol: string]: T } {
    return input.reduce((acc, item) => {
        const { symbol } = item
        return acc[symbol] = item, acc
    }, {})
}

if (import.meta.vitest) {
    const { test, expect } = import.meta.vitest

    test.each([
        {
            input: [
                {
                    symbol: 'SQ',
                    logoUrl: 'string',
                    industry: 'string',
                    country: 'string',
                    name: 'string',
                },
                {
                    symbol: 'TSLA',
                    logoUrl: 'string',
                    industry: 'string',
                    country: 'string',
                    name: 'string',
                }
            ],
            expected: {
                SQ: {
                    symbol: 'SQ',
                    logoUrl: 'string',
                    industry: 'string',
                    country: 'string',
                    name: 'string',
                },
                TSLA: {
                    symbol: 'TSLA',
                    logoUrl: 'string',
                    industry: 'string',
                    country: 'string',
                    name: 'string',
                }
            }
        },
        {
            input: [
                {
                    symbol: "SQ",
                    timestamp: 0,
                    currentPrice: 0,
                    change: 0,
                    change_percentage: 0,
                    high: 0,
                    low: 0,
                    openPrice: 0,
                    previousClose: 0,
                },
                {
                    symbol: "TSLA",
                    timestamp: 0,
                    currentPrice: 0,
                    change: 0,
                    change_percentage: 0,
                    high: 0,
                    low: 0,
                    openPrice: 0,
                    previousClose: 0,
                }
            ],
            expected: {
                SQ: {
                    symbol: "SQ",
                    timestamp: 0,
                    currentPrice: 0,
                    change: 0,
                    change_percentage: 0,
                    high: 0,
                    low: 0,
                    openPrice: 0,
                    previousClose: 0,
                },
                TSLA: {
                    symbol: "TSLA",
                    timestamp: 0,
                    currentPrice: 0,
                    change: 0,
                    change_percentage: 0,
                    high: 0,
                    low: 0,
                    openPrice: 0,
                    previousClose: 0,
                }
            }
        }
    ])('convertToSymbolObjects $input', ({ input, expected }) => {
        expect(convertToSymbolObjects<StockProfile | StockQuote>(input))
            .toStrictEqual(expected)
    })
}

export function iterateUserStockHolding(
    input: UserStockHolding,
    fn: (args: {
        symbol: string,
        accountType: string,
        currency: StockCurrency,
        userStockData: UserStockData
    }) => void) {
    Object.entries(input).forEach(([symbol, { accounts }]) => {
        Object.entries(accounts).forEach(([accountType, currencies]) => {
            Object.entries(currencies).forEach(([currency, userStockData]) => {
                fn({
                    symbol,
                    accountType,
                    currency: currency as StockCurrency,
                    userStockData
                })
            })
        })
    })
}

export interface StockProfileSymbols {
    [symbol: string]: StockProfile
}

export interface StockQuotesSymbols {
    [symbol: string]: StockQuote
}

export function updateUserStockHoldingFrom(
    input: UserStockHolding,
    profiles: StockProfileSymbols,
    quotes: StockQuotesSymbols)
{
    Object.keys(input).forEach((symbol) => {
        input[symbol].profile = profiles[symbol]
        input[symbol].summary = {
            usd: {
                numberOfShares: 0,
                averageAcquiredPrice: 0,
                currentPrice: 0,
                change: 0,
                change_percentage: 0,
                openPrice: 0,
                timestamp: 0,
                marketValue: 0,
                compositionRatio: 0,
                profit_percentage: 0,
                profit: 0,
            }
        }
    })

    iterateUserStockHolding(input, ({
        currency,
        accountType,
        symbol,
        userStockData
    }) => {
        input[symbol].accounts[accountType] = {
            [currency]: {
                ...userStockData,
                currentPrice: quotes[symbol].currentPrice,
                change: quotes[symbol].change,
                change_percentage: quotes[symbol].change_percentage,
                openPrice: quotes[symbol].openPrice,
                timestamp: quotes[symbol].timestamp,
                marketValue: quotes[symbol].currentPrice * userStockData.numberOfShares,
                compositionRatio: 0,
                profit_percentage: (quotes[symbol].currentPrice - userStockData.averageAcquiredPrice) / userStockData.averageAcquiredPrice * 100,
                profit: (quotes[symbol].currentPrice - userStockData.averageAcquiredPrice) * userStockData.numberOfShares,
            }
        }

        const totalNumberOfShares = input[symbol].summary[currency].numberOfShares
        if (totalNumberOfShares > 0) {
            const totalAverageAcquiredPrice = input[symbol].summary[currency].averageAcquiredPrice
            const userStockValue = userStockData.averageAcquiredPrice * userStockData.numberOfShares
            const totalStockValue = totalNumberOfShares * totalAverageAcquiredPrice

            input[symbol].summary[currency].averageAcquiredPrice = (userStockValue + totalStockValue)
                / (userStockData.numberOfShares + totalNumberOfShares)
        } else {
            input[symbol].summary[currency].averageAcquiredPrice = userStockData.averageAcquiredPrice
        }

        input[symbol].summary[currency].numberOfShares += userStockData.numberOfShares
        input[symbol].summary[currency].currentPrice = quotes[symbol].currentPrice
        input[symbol].summary[currency].change = quotes[symbol].change
        input[symbol].summary[currency].change_percentage = quotes[symbol].change_percentage
        input[symbol].summary[currency].openPrice = quotes[symbol].openPrice
        input[symbol].summary[currency].timestamp = quotes[symbol].timestamp
        input[symbol].summary[currency].marketValue = quotes[symbol].currentPrice * input[symbol].summary[currency].numberOfShares
        input[symbol].summary[currency].compositionRatio = 0
        input[symbol].summary[currency].profit_percentage = (quotes[symbol].currentPrice - input[symbol].summary[currency].averageAcquiredPrice) / input[symbol].summary[currency].averageAcquiredPrice * 100
        input[symbol].summary[currency].profit = (quotes[symbol].currentPrice - input[symbol].summary[currency].averageAcquiredPrice) * input[symbol].summary[currency].numberOfShares
    })
}

if (import.meta.vitest) {
    const { describe, test, expect, beforeEach } = import.meta.vitest

    describe("userUpdateStockHoldingFrom", () => {
        const profiles: StockProfileSymbols = {
            AMZN: {
                country: "country",
                industry: "industry",
                logoUrl: "logoUrl",
                name: "AMZN",
                symbol: "AMZN"
            },
            TSLA: {
                country: "country",
                industry: "industry",
                logoUrl: "logoUrl",
                name: "TSLA",
                symbol: "TSLA"
            }
        }

        const quotes: StockQuotesSymbols = {
            AMZN: {
                symbol: "AMZN",
                timestamp: 100,
                currentPrice: 100,
                change: 100,
                change_percentage: 0.1,
                high: 100,
                low: 100,
                openPrice: 100,
                previousClose: 100,
            },
            TSLA: {
                symbol: "TSLA",
                timestamp: 200,
                currentPrice: 200,
                change: 200,
                change_percentage: 200,
                high: 200,
                low: 200,
                openPrice: 200,
                previousClose: 200,
            }
        }

        const expected = {
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
            },
            "TSLA": {
                profile: {
                    country: "country",
                    industry: "industry",
                    logoUrl: "logoUrl",
                    name: "TSLA",
                    symbol: "TSLA"
                },
                accounts: {
                    "NISA": {
                        usd: {
                            numberOfShares: 15,
                            averageAcquiredPrice: 38.46,
                            currentPrice: 200,
                            change: 200,
                            change_percentage: 200,
                            openPrice: 200,
                            timestamp: 200,
                            marketValue: 3000,
                            compositionRatio: 0,
                            profit_percentage: 420.0208008320333,
                            profit: 2423.1
                        }
                    },
                },
                summary: {
                    usd: {
                        numberOfShares: 15,
                        averageAcquiredPrice: 38.46,
                        currentPrice: 200,
                        change: 200,
                        change_percentage: 200,
                        openPrice: 200,
                        timestamp: 200,
                        marketValue: 3000,
                        compositionRatio: 0,
                        profit_percentage: 420.0208008320333,
                        profit: 2423.1,
                    }
                }
            }
        }

        const rawInput = {
            "AMZN": {
                accounts: {
                    "特定": {
                        usd: {
                            numberOfShares: 6,
                            averageAcquiredPrice: 91.06,
                            currentPrice: 86.08,
                            change: 0,
                            change_percentage: 0,
                            openPrice: 0,
                            timestamp: 0,
                            marketValue: 516.48,
                            compositionRatio: 1.78,
                            profit_percentage: 0,
                            profit: -29.880000000000024,
                        }
                    },
                    "NISA": {
                        usd: {
                            numberOfShares: 20,
                            averageAcquiredPrice: 105.18,
                            currentPrice: 86.08,
                            change: 0,
                            change_percentage: 0,
                            openPrice: 0,
                            timestamp: 0,
                            marketValue: 1721.6,
                            compositionRatio: 5.94,
                            profit_percentage: 0,
                            profit: -382.00000000000017,
                        }
                    },
                }
            },
            "TSLA": {
                accounts: {
                    "NISA": {
                        usd: {
                            numberOfShares: 15,
                            averageAcquiredPrice: 38.46,
                            currentPrice: 109.59,
                            change: 0,
                            change_percentage: 0,
                            openPrice: 0,
                            timestamp: 0,
                            marketValue: 1643.85,
                            compositionRatio: 92.28,
                            profit_percentage: 0,
                            profit: 1066.9499999999998,
                        }
                    },
                }
            }
        }

        test("is able to update data from profiles and quotes", () => {
            const input = structuredClone(rawInput)

            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)
            expect(input).not.toStrictEqual(rawInput)
        })

        test("summary field should not be changed from multiple call", () => {
            const input = structuredClone(rawInput)
            
            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)

            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)

            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)
        })
    })
}

export function updateUserStockHoldingCompositionRatio(input: UserStockHolding) {
    const totalMarketValue = Object.values(input)
        .reduce((acc, { summary }) => {
            Object.keys(summary).forEach(currency => {
                acc[currency] ??= 0
                acc[currency] += summary[currency].marketValue
            })

            return acc
        }, {})

    iterateUserStockHolding(input, ({
        currency,
        accountType,
        symbol
    }) => {
        input[symbol].accounts[accountType][currency].compositionRatio =
            input[symbol].accounts[accountType][currency].marketValue / totalMarketValue[currency] * 100

        input[symbol].summary[currency].compositionRatio =
            input[symbol].summary[currency].marketValue / totalMarketValue[currency] * 100
    })
}

if (import.meta.vitest) {
    const { test, expect } = import.meta.vitest

    test("should update the composition ratio", () => {
        const input = {
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
            },
            "TSLA": {
                profile: {
                    country: "country",
                    industry: "industry",
                    logoUrl: "logoUrl",
                    name: "TSLA",
                    symbol: "TSLA"
                },
                accounts: {
                    "NISA": {
                        usd: {
                            numberOfShares: 15,
                            averageAcquiredPrice: 38.46,
                            currentPrice: 200,
                            change: 200,
                            change_percentage: 200,
                            openPrice: 200,
                            timestamp: 200,
                            marketValue: 3000,
                            compositionRatio: 0,
                            profit_percentage: 420.0208008320333,
                            profit: 2423.1
                        }
                    },
                },
                summary: {
                    usd: {
                        numberOfShares: 15,
                        averageAcquiredPrice: 38.46,
                        currentPrice: 200,
                        change: 200,
                        change_percentage: 200,
                        openPrice: 200,
                        timestamp: 200,
                        marketValue: 3000,
                        compositionRatio: 0,
                        profit_percentage: 420.0208008320333,
                        profit: 2423.1,
                    }
                }
            }
        }

        const expected = {
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
                            compositionRatio: 10.714285714285714,
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
                            compositionRatio: 35.714285714285715,
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
                        compositionRatio: 46.42857142857143,
                        profit_percentage: -1.8853114763996568,
                        profit: -49.96000000000035
                    }
                }
            },
            "TSLA": {
                profile: {
                    country: "country",
                    industry: "industry",
                    logoUrl: "logoUrl",
                    name: "TSLA",
                    symbol: "TSLA"
                },
                accounts: {
                    "NISA": {
                        usd: {
                            numberOfShares: 15,
                            averageAcquiredPrice: 38.46,
                            currentPrice: 200,
                            change: 200,
                            change_percentage: 200,
                            openPrice: 200,
                            timestamp: 200,
                            marketValue: 3000,
                            compositionRatio: 53.57142857142857,
                            profit_percentage: 420.0208008320333,
                            profit: 2423.1
                        }
                    },
                },
                summary: {
                    usd: {
                        numberOfShares: 15,
                        averageAcquiredPrice: 38.46,
                        currentPrice: 200,
                        change: 200,
                        change_percentage: 200,
                        openPrice: 200,
                        timestamp: 200,
                        marketValue: 3000,
                        compositionRatio: 53.57142857142857,
                        profit_percentage: 420.0208008320333,
                        profit: 2423.1,
                    }
                }
            }
        }

        updateUserStockHoldingCompositionRatio(input)

        expect(input).toStrictEqual(expected)
    })
}