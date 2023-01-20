import axios from 'axios';

import {  StockProfile, StockQuote } from "@/model/stocks"

const FINNHUB_API_URL = "https://finnhub.io/api/v1"
const FINNHUB_WSS_URL = "wss://ws.finnhub.io"
const FINNHUB_API_TOKEN = "cets3eqad3i5jsala8g0cets3eqad3i5jsala8gg"

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
