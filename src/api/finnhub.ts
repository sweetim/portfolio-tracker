import axios from 'axios';

import {  StockProfile, StockQuote } from "@/model/stocks"

const FINNHUB_API_URL = "https://finnhub.io/api/v1"
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
        dp: change_percent,
        h: high,
        l: low,
        o: openPrice,
        pc: previousClose,
        t: timestamp
    } = data

    return {
        timestamp,
        currentPrice,
        change,
        change_percent,
        high,
        low,
        openPrice,
        previousClose
    }
}