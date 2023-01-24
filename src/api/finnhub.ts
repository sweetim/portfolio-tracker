import axios from 'axios';

import {  convertToStockSymbolKey, StockProfile, StockQuote, StockSymbolKeyFor } from "@/model/stocks"

const FINNHUB_API_URL = "https://finnhub.io/api/v1"
const FINNHUB_WSS_URL = "wss://ws.finnhub.io"
const FINNHUB_API_TOKEN = import.meta.env.VITE_FINNHUB_API_TOKEN

const axiosInstance = axios.create({
    baseURL: FINNHUB_API_URL
})

axiosInstance.interceptors.request.use((config) => {
    config.params = {
        token: FINNHUB_API_TOKEN,
        ...config.params
    }

    return config
})

export function getFinnHubWSSUrl() {
    return `${FINNHUB_WSS_URL}?token=${FINNHUB_API_TOKEN}`
}

export async function getStockProfile(symbol: string): Promise<StockProfile> {
    const { data } = await axiosInstance.get(`/stock/profile2?symbol=${symbol}`)

    const {
        logo: logoUrl,
        name,
        finnhubIndustry: industry,
        country
    } = data

    return {
        symbol,
        logoUrl,
        name,
        industry,
        country
    }
}

export async function getStockQuote(symbol: string): Promise<StockQuote> {
    const { data } = await axiosInstance.get(`/quote?symbol=${symbol}`)

    const {
        c: currentPrice,
        d: change,
        dp: change_percentage,
        h: high,
        l: low,
        o: openPrice,
        pc: previousClose,
        t: timestamp
    } = data

    return {
        symbol,
        timestamp,
        currentPrice,
        change,
        change_percentage,
        high,
        low,
        openPrice,
        previousClose
    }
}

export type WSSendType = "subscribe"
export type WSReceiveType = "ping"
    | "trade"

export interface WSSendData {
    type: string
    symbol: string
}

export interface WSReceiveTrade {
    symbol: string
    price: number
    timestamp_ms: number
    volume: number
    condition: string[]
}

export interface WSReceiveRawTrade {
    s: string
    p: number
    v: number
    t: number
    c: string[]
}

export interface WSReceiveRawData {
    data?: WSReceiveRawTrade[]
    type: WSReceiveType
}

export function parseWSRawTrade(input?: MessageEvent<any> | null): StockSymbolKeyFor<WSReceiveTrade> | undefined {
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

    describe("parseWSRawTrade", () => {
        test("can handle null input", () => {
            const input = null
            const expected = undefined

            expect(parseWSRawTrade(input)).toBe(expected)
        })

        test("can handle null input data", () => {
            const input = {
                data: ""
            } as MessageEvent<any>

            const expected = undefined

            expect(parseWSRawTrade(input)).toBe(expected)
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

            expect(parseWSRawTrade(input)).toStrictEqual(expected)
        })
    })
}