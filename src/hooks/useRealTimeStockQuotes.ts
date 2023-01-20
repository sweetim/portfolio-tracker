import { getFinnHubWSSUrl, WSReceiveRawData, WSReceiveRawTrade, WSReceiveTrade, WSSendData } from '@/api/finnhub';
import { convertToStockSymbolKey, StockSymbolKeyFor } from '@/model/stocks';
import { useEffect, useMemo } from 'react';
import useWebSocket, { ReadyState } from 'react-use-websocket';

export function useRealTimeStockQuotes(symbols: string[]) {
    const { sendMessage, lastMessage, readyState } = useWebSocket(
        getFinnHubWSSUrl(),
        {
            shouldReconnect: (closeEvent) => {
                return false
            }
        })

    useEffect(() => {
        if (readyState === ReadyState.OPEN) {
            symbols.forEach(symbol => {
                const content: WSSendData = {
                    type: "subscribe",
                    symbol
                }

                sendMessage(JSON.stringify(content))
            })
        }
    }, [readyState])

    const trades = useMemo(
        () => parseRawTrade(lastMessage),
        [lastMessage?.timeStamp])

    return { trades, readyState }
}

function parseRawTrade(input?: MessageEvent<any> | null): StockSymbolKeyFor<WSReceiveTrade> | undefined {
    if (!input) return

    try {
        const { data, type } = JSON.parse(input.data) as WSReceiveRawData

        if (type === "trade") {
            if (data) {
                return convertToStockSymbolKey(data.map((item: WSReceiveRawTrade) => {
                    return {
                        symbol: item.s,
                        timestamp_ms: item.t,
                        price: item.p,
                        condition: item.c,
                        volume: item.v
                    }
                }))
            }
        }
    } catch (e) {
        console.error(`fail to parse raw trade data ${e}`)
    }

    return undefined
}

if (import.meta.vitest) {
    const { describe, test, expect } = import.meta.vitest

    describe("parseRawTrade", () => {
        test("can handle null input", () => {
            const input = null
            const expected = undefined

            expect(parseRawTrade(input)).toBe(expected)
        })

        test("can handle null input data", () => {
            const input = {
                data: ""
            } as MessageEvent<any>

            const expected = undefined

            expect(parseRawTrade(input)).toBe(expected)
        })

        test("can parse correctly", () => {
            const input = {
                data: `{"data":[{"c":[],"p":130.3498,"s":"TSLA","t":1674226439365,"v":1667},{"c":[],"p":130.3498,"s":"TSLA","t":1674226439366,"v":1333},{"c":["1","12"],"p":98.4556,"s":"GOOG","t":1674226439375,"v":51}],"type":"trade"}`
            } as MessageEvent<any>

            const expected = {
                TSLA: {
                    symbol: 'TSLA',
                    timestamp_ms: 1674226439366,
                    price: 130.3498,
                    condition: [],
                    volume: 1333
                },
                GOOG: {
                    symbol: 'GOOG',
                    timestamp_ms: 1674226439375,
                    price: 98.4556,
                    condition: ['1', '12'],
                    volume: 51
                }
            }

            expect(parseRawTrade(input)).toStrictEqual(expected)
        })
    })
}

export default useRealTimeStockQuotes