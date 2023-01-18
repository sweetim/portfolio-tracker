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

export type StockSymbolKeyFor<T> = {
    [symbol: string]: T
}

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

export function convertToStockSymbolKey<T extends { symbol: string } | undefined>(input: T[]): { [symbol: string]: T } {
    return input.reduce((acc, item) => {
        if (!item) return acc

        const { symbol } = item
        return acc[symbol] = item, acc
    }, {} as { [symbol: string]: T })
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
    ])("convertToStockSymbolKey $input", ({ input, expected }) => {
        expect(convertToStockSymbolKey<StockProfile | StockQuote>(input))
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

function calculateStockValue(
    currentPrice: number,
    averageAcquiredPrice: number,
    numberOfShares: number): { profit: number, profit_percentage: number, marketValue: number }
{
    const profit = (currentPrice - averageAcquiredPrice) * numberOfShares
    const profit_percentage = (currentPrice - averageAcquiredPrice) / averageAcquiredPrice * 100
    const marketValue = currentPrice * numberOfShares

    return {
        profit,
        profit_percentage,
        marketValue
    }
}

if (import.meta.vitest) {
    const { describe, test, expect } = import.meta.vitest

    describe("calculateStockValue", () => {
        test("able to calculate correctly", () => {
            const expected: ReturnType<typeof calculateStockValue> = {
                profit: 450,
                marketValue: 500,
                profit_percentage: 900
            }

            expect(calculateStockValue(100, 10, 5)).toStrictEqual(expected)
        })
    })
}

function getAverageAcquiredPrice(
    numberOfShares_current: number | undefined,
    averageAcquiredPrice_current: number | undefined,
    numberOfShares_new: number,
    averageAcquiredPrice_new: number): number
{
    if (!averageAcquiredPrice_current || !numberOfShares_current) {
        return averageAcquiredPrice_new
    }

    if (numberOfShares_current === 0) {
        return averageAcquiredPrice_new
    }

    const userStockValue = averageAcquiredPrice_new * numberOfShares_new
    const totalStockValue = numberOfShares_current * averageAcquiredPrice_current

    return (userStockValue + totalStockValue)
        / (numberOfShares_new + numberOfShares_current)
}

if (import.meta.vitest) {
    const { describe, test, expect } = import.meta.vitest

    describe("getAverageAcquiredPrice", () => {
        test.each([
            [ undefined, undefined ],
            [ 100, undefined ],
            [ undefined, 100 ]
        ])("it can handle undefined input (%d) (%d)", (numberOfShares_current, averageAcquiredPrice_current) => {
            expect(
                getAverageAcquiredPrice(
                    numberOfShares_current,
                    averageAcquiredPrice_current,
                    100,
                    200)).toBe(200)
        })

        test("can compute correctly", () => {
            expect(
                getAverageAcquiredPrice(
                    500,
                     500,
                    100,
                    200)).toBe(450)
        })
    })
}

export function updateUserStockHoldingFrom(
    input: UserStockHolding,
    profiles: StockSymbolKeyFor<StockProfile | undefined>,
    quotes: StockSymbolKeyFor<StockQuote | undefined>)
{
    Object.keys(input).forEach((symbol) => {
        if (profiles[symbol]) {
            input[symbol].profile = profiles[symbol]
        }

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
        if (!quotes[symbol] || !profiles[symbol]) {
            return
        }

        input[symbol].accounts[accountType] = {
            [currency]: {
                ...userStockData,
                currentPrice: quotes[symbol]!.currentPrice,
                change: quotes[symbol]!.change,
                change_percentage: quotes[symbol]!.change_percentage,
                openPrice: quotes[symbol]!.openPrice,
                timestamp: quotes[symbol]!.timestamp,
                compositionRatio: 0,
                ...calculateStockValue(
                    quotes[symbol]!.currentPrice,
                    userStockData.averageAcquiredPrice,
                    userStockData.numberOfShares
                )
            }
        }

        input[symbol].summary![currency]!.averageAcquiredPrice = getAverageAcquiredPrice(
            input[symbol]?.summary?.[currency]?.numberOfShares,
            input[symbol]?.summary?.[currency]?.averageAcquiredPrice,
            userStockData.numberOfShares,
            userStockData.averageAcquiredPrice
        )

        input[symbol].summary![currency]!.numberOfShares += userStockData.numberOfShares
        input[symbol].summary![currency]!.currentPrice = quotes[symbol]!.currentPrice
        input[symbol].summary![currency]!.change = quotes[symbol]!.change
        input[symbol].summary![currency]!.change_percentage = quotes[symbol]!.change_percentage
        input[symbol].summary![currency]!.openPrice = quotes[symbol]!.openPrice
        input[symbol].summary![currency]!.timestamp = quotes[symbol]!.timestamp
        input[symbol].summary![currency]!.compositionRatio = 0

        const {
            marketValue,
            profit,
            profit_percentage
        } = calculateStockValue(
            quotes[symbol]!.currentPrice,
            input[symbol].summary![currency]!.averageAcquiredPrice,
            input[symbol].summary![currency]!.numberOfShares)

        input[symbol].summary![currency]!.marketValue = marketValue
        input[symbol].summary![currency]!.profit_percentage = profit_percentage
        input[symbol].summary![currency]!.profit = profit
    })
}

if (import.meta.vitest) {
    const { describe, test, expect, beforeEach } = import.meta.vitest

    describe("userUpdateStockHoldingFrom", () => {
        const profiles: StockSymbolKeyFor<StockProfile> = {
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

        const quotes: StockSymbolKeyFor<StockQuote> = {
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

        let input = {}
        beforeEach(() => {
            input = {
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
        })

        test("is able to update data from profiles and quotes", () => {
            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)
        })

        test("summary field should not be changed from multiple call", () => {
            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)

            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)

            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)
        })

        test("able to handle empty currency field", () => {
            const input = {
                "AMZN": {
                    accounts: {
                        "特定": {
                        },
                    }
                },
            }

            const expected = {
                AMZN: {
                    accounts: {
                        "特定": {}
                    },
                    profile: {
                        country: "country",
                        industry: "industry",
                        logoUrl: "logoUrl",
                        name: "AMZN",
                        symbol: "AMZN"
                    },
                    summary: {
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
                            profit: 0
                        }
                    }
                }
            }

            updateUserStockHoldingFrom(input, profiles, quotes)
            expect(input).toStrictEqual(expected)
        })

        test("able to handle undefined quotes", () => {
            const expected = {
                AMZN: {
                    accounts: {
                        特定: {
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
                                profit: -29.880000000000024
                            }
                        },
                        NISA: {
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
                                profit: -382.00000000000017
                            }
                        }
                    },
                    profile: {
                        country: "country",
                        industry: "industry",
                        logoUrl: "logoUrl",
                        name: "AMZN",
                        symbol: "AMZN"
                    },
                    summary: {
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
                            profit: 0
                        }
                    }
                },
                TSLA: {
                    accounts: {
                        NISA: {
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
                                profit: 1066.9499999999998
                            }
                        }
                    },
                    profile: {
                        country: "country",
                        industry: "industry",
                        logoUrl: "logoUrl",
                        name: "TSLA",
                        symbol: "TSLA"
                    },
                    summary: {
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
                            profit: 0
                        }
                    }
                }
            }

            updateUserStockHoldingFrom(input, profiles, {})
            expect(input).toStrictEqual(expected)
        })

        test("able to handle undefined profiles", () => {
            const expected = {
                AMZN: {
                    accounts: {
                        特定: {
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
                                profit: -29.880000000000024
                            }
                        },
                        NISA: {
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
                                profit: -382.00000000000017
                            }
                        }
                    },
                    summary: {
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
                            profit: 0
                        }
                    }
                },
                TSLA: {
                    accounts: {
                        NISA: {
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
                                profit: 1066.9499999999998
                            }
                        }
                    },
                    summary: {
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
                            profit: 0
                        }
                    }
                }
            }

            updateUserStockHoldingFrom(input, {}, quotes)
            expect(input).toStrictEqual(expected)
        })

        test("able to handle undefined profiles and quotes", () => {
            const expected = {
                AMZN: {
                    accounts: {
                        特定: {
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
                                profit: -29.880000000000024
                            }
                        },
                        NISA: {
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
                                profit: -382.00000000000017
                            }
                        }
                    },
                    summary: {
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
                            profit: 0
                        }
                    }
                },
                TSLA: {
                    accounts: {
                        NISA: {
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
                                profit: 1066.9499999999998
                            }
                        }
                    },
                    summary: {
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
                            profit: 0
                        }
                    }
                }
            }

            updateUserStockHoldingFrom(input, {}, {})
            expect(input).toStrictEqual(expected)
        })
    })
}

export function updateUserStockHoldingCompositionRatio(input: UserStockHolding) {
    const totalMarketValue = Object.values(input)
        .reduce((acc, { summary }) => {
            if (!summary) {
                return acc
            }

            Object.keys(summary).forEach((currency) => {
                acc[currency] ??= 0
                acc[currency] += summary?.[currency as StockCurrency]?.marketValue || 0
            })

            return acc
        }, {} as { [currency: string]: number })

    if (Object.keys(totalMarketValue).length === 0) {
        return
    }

    iterateUserStockHolding(input, ({
        currency,
        accountType,
        symbol
    }) => {
        if (input[symbol].accounts[accountType][currency]) {
            const marketValue_accountType = input[symbol].accounts[accountType][currency]?.marketValue || 0

            input[symbol].accounts[accountType][currency]!.compositionRatio =
                marketValue_accountType / totalMarketValue[currency] * 100
        }

        if (input[symbol].summary) {
            if (input[symbol].summary?.[currency]) {
                const marketValue_summary = input[symbol].summary?.[currency]?.marketValue || 0

                input[symbol].summary![currency]!.compositionRatio =
                    marketValue_summary / totalMarketValue[currency] * 100
            }
        }
    })
}

if (import.meta.vitest) {
    const { describe, test, expect } = import.meta.vitest

    describe("updateUserStockHoldingCompositionRatio", () => {
        test.each([
            {
                input: {
                    "AMZN": {
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
                        },
                    }
                },
                expected: {
                    "AMZN": {
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
                        },
                    }
                }
            },
            {
                input: {
                    "AMZN": {
                        accounts: {
                            "特定": {
                            },
                        },
                    }
                },
                expected: {
                    "AMZN": {
                        accounts: {
                            "特定": {
                            },
                        },
                    }
                }
            },
        ])("should able to handle undefined object ($input)", ({ input, expected }) => {
            updateUserStockHoldingCompositionRatio(input)

            expect(input).toStrictEqual(expected)
        })

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
    })
}