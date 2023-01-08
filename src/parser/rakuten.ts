export interface RakutenRawData {
    [symbol: string]: RakutenSymbolData
}

export interface RakutenSymbolData {
    symbol: string
    account: {
        [type: string]: RakutenAccountData
        total: RakutenAccountData
    }
}

export interface RakutenAccountData {
    numberOfShares: number
    averageAcquiredPrice_usd: number
    currentPrice_usd: number
    marketValue_usd: number
    marketValue_jpy: number
    compositionRatio: number
    profit_percentage: number
    profit_jpy: number
    profit_usd: number
}

export function parseRakutenRawData(rawInput: string): RakutenRawData {
    const output = []

    const input = rawInput.split('\n')

    const NUM_LINES_TO_GROUP_EACH_ENTRY = 3
    for (let i = 0; i < input.length; i += NUM_LINES_TO_GROUP_EACH_ENTRY) {
        const symbol = input[i].trim()
        const name = input[i + 1]
        const tokens = input[i + 2].split("\t")
            .map((token) => token.replaceAll(',', ''))
            .map(t => Number(t) || t)

        output.push([symbol, name, ...tokens])
    }

    return Object.fromEntries(Object.entries(output.map((entry) => {
        const [
            symbol,
            name,
            account,
            numberOfShares,
            averageAcquiredPrice_usd,
            currentPrice_usd,
            marketValue_usd,
            marketValue_jpy,
            compositionRatio,
            profit_jpy
        ] = entry

        return {
            symbol,
            account,
            numberOfShares,
            averageAcquiredPrice_usd,
            currentPrice_usd,
            marketValue_usd,
            marketValue_jpy,
            compositionRatio: Number(compositionRatio.split("%")[0]),
            profit_percentage: (currentPrice_usd - averageAcquiredPrice_usd) / averageAcquiredPrice_usd * 100,
            profit_jpy,
            profit_usd: (currentPrice_usd * numberOfShares) - (averageAcquiredPrice_usd * numberOfShares)
        }
    })
        .reduce((acc, entry) => {
            const { symbol, account, ...others } = entry

            acc[symbol] ??= {
                symbol,
                account: {
                    total: {
                        numberOfShares: 0,
                        averageAcquiredPrice_usd: 0,
                        currentPrice_usd: 0,
                        marketValue_usd: 0,
                        marketValue_jpy: 0,
                        compositionRatio: 0,
                        profit_percentage: 0,
                        profit_jpy: 0,
                        profit_usd: 0
                    }
                }
            }

            acc[symbol].account[account] = others

            return acc
        }, {} as RakutenRawData))
        .map(([k, v]: [ string, RakutenSymbolData ]) => {
            const { account, ...others } = v

            account.total = Object.values(account)
                .reduce((acc: RakutenAccountData, x: RakutenAccountData) => {
                    acc.currentPrice_usd = x.currentPrice_usd

                    if (acc.numberOfShares > 0) {
                        acc.averageAcquiredPrice_usd = ((x.averageAcquiredPrice_usd * x.numberOfShares) + (acc.numberOfShares * acc.averageAcquiredPrice_usd))
                            / (x.numberOfShares + acc.numberOfShares)
                    } else {
                        acc.averageAcquiredPrice_usd = x.averageAcquiredPrice_usd
                    }

                    acc.profit_percentage = (acc.currentPrice_usd - acc.averageAcquiredPrice_usd) / acc.averageAcquiredPrice_usd * 100
                    acc.numberOfShares += x.numberOfShares
                    acc.marketValue_usd += x.marketValue_usd
                    acc.marketValue_jpy += x.marketValue_jpy
                    acc.compositionRatio += x.compositionRatio
                    acc.profit_jpy += x.profit_jpy
                    acc.profit_usd += x.profit_usd

                    return acc
                }, {
                    numberOfShares: 0,
                    averageAcquiredPrice_usd: 0,
                    currentPrice_usd: 0,
                    marketValue_usd: 0,
                    marketValue_jpy: 0,
                    compositionRatio: 0,
                    profit_percentage: 0,
                    profit_jpy: 0,
                    profit_usd: 0
                })

            return [k, {
                ...others,
                account
            }]
        }))
}