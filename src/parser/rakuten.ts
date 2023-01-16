import { UserStockHolding } from "@/model/stocks"

export function parseRakutenData(rawInput: string): UserStockHolding {
    const output = {} as UserStockHolding

    const input = rawInput.split('\n')

    const NUM_LINES_TO_GROUP_EACH_ENTRY = 3
    for (let i = 0; i < input.length; i += NUM_LINES_TO_GROUP_EACH_ENTRY) {
        const symbol = input[i].trim()
        const name = input[i + 1]
        const tokens = input[i + 2].split("\t")
            .map((token) => token.replaceAll(',', ''))

        const [
            accountType,
            numberOfShares,
            averageAcquiredPrice_usd,
            currentPrice_usd,
            marketValue_usd,
            marketValue_jpy,
            compositionRatio,
            profit_jpy
        ] = tokens

        output[symbol] ??= {
            accounts: {
            },
        }

        output[symbol].accounts[accountType.trim()] = {
            usd: {
                numberOfShares: Number(numberOfShares),
                averageAcquiredPrice: Number(averageAcquiredPrice_usd),
                currentPrice: Number(currentPrice_usd),
                change: 0,
                change_percentage: 0,
                openPrice: 0,
                timestamp: 0,
                marketValue: Number(marketValue_usd),
                compositionRatio: parseCompositionRatioToken(compositionRatio),
                profit_percentage: 0,
                get profit() {
                    return (this.currentPrice - this.averageAcquiredPrice) * this.numberOfShares
                },
            }
        }
    }

    return output
}


if (import.meta.vitest) {
    const { it, expect } = import.meta.vitest

    it("able to parse rakuten data", () => {
        const rawInput = `AMZN
アマゾン・ドット・コム
特定	6	91.06	86.08	516.48	68,237	1.78 %	-7,555.00
AMZN
アマゾン・ドット・コム
NISA	20	105.18	86.08	1,721.60	227,457	5.94 %	-70,563.00
TSLA
テスラ
NISA	15	38.46	109.59	1643.85	228,946	92.28 %	152,727.5`

        const output = parseRakutenData(rawInput)

        const expected: UserStockHolding = {
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

        expect(output).toStrictEqual(expected)
    })
}


function parseCompositionRatioToken(token: string): number {
    return Number(token.split('%')[0].trim())
}

if (import.meta.vitest) {
    const { test, expect } = import.meta.vitest

    test.each([
        ['1.78 %', 1.78],
        [' 5.94 %', 5.94],
        [' 12.96  %', 12.96],
    ])('able to parse composition ratio token ( %f ) -> %f', (input, expected) => {
        expect(parseCompositionRatioToken(input)).toBe(expected)
    })
}

// function computeTotalAccounts(input: UserStockHolding): UserStockHolding {
//     Object.entries(input).forEach(([ symbol, {accounts} ]) => {
//         Object.entries(accounts).forEach(([ accountType, currencies ]) => {
//             Object.entries(currencies).forEach(([ currency, userStockData]) => {
//                 input[symbol].accounts.total ??= {}
//                 input[symbol].accounts.total[currency] ??= {
//                     numberOfShares: 0,
//                     averageAcquiredPrice: 0
//                 }

//                 const totalNumberOfShares = input[symbol].accounts.total[currency].numberOfShares
//                 if (totalNumberOfShares > 0) {
//                     const totalAverageAcquiredPrice = input[symbol].accounts.total[currency].averageAcquiredPrice
//                     const userStockValue = userStockData.averageAcquiredPrice * userStockData.numberOfShares
//                     const totalStockValue = totalNumberOfShares * totalAverageAcquiredPrice

//                     input[symbol].accounts.total[currency].averageAcquiredPrice = (userStockValue + totalStockValue)
//                         / (userStockData.numberOfShares + totalNumberOfShares)
//                 } else {
//                     input[symbol].accounts.total[currency].averageAcquiredPrice = userStockData.averageAcquiredPrice
//                 }

//                 input[symbol].accounts.total[currency].numberOfShares += userStockData.numberOfShares
//             })
//         })
//     })

//     return input
// }

// if (import.meta.vitest) {
//     const { it, expect } = import.meta.vitest

//     it("able to compute total accounts", () => {
//         const input = {
//             "AMZN": {
//                 accounts: {
//                     "特定": {
//                         usd: {
//                             numberOfShares: 6,
//                             averageAcquiredPrice: 91.06
//                         }
//                     },
//                     "NISA": {
//                         usd: {
//                             numberOfShares: 20,
//                             averageAcquiredPrice: 105.18
//                         }
//                     }
//                 }
//             },
//             "TSLA": {
//                 accounts: {
//                     "NISA": {
//                         usd: {
//                             numberOfShares: 15,
//                             averageAcquiredPrice: 38.46
//                         }
//                     }
//                 }
//             }
//         }

//         const expected = {
//             "AMZN": {
//                 accounts: {
//                     "特定": {
//                         usd: {
//                             numberOfShares: 6,
//                             averageAcquiredPrice: 91.06
//                         }
//                     },
//                     "NISA": {
//                         usd: {
//                             numberOfShares: 20,
//                             averageAcquiredPrice: 105.18
//                         }
//                     },
//                     total: {
//                         usd: {
//                             numberOfShares: 26,
//                             averageAcquiredPrice: 101.92153846153847
//                         }
//                     }
//                 }
//             },
//             "TSLA": {
//                 accounts: {
//                     "NISA": {
//                         usd: {
//                             numberOfShares: 15,
//                             averageAcquiredPrice: 38.46
//                         }
//                     },
//                     total: {
//                         usd: {
//                             numberOfShares: 15,
//                             averageAcquiredPrice: 38.46
//                         }
//                     }
//                 }
//             }
//         }

//         expect(computeTotalAccounts(input)).toStrictEqual(expected)
//     })
// }