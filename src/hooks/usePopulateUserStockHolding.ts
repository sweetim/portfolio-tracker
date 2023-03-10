import { useQueries } from "@tanstack/react-query";

import { convertToStockSymbolKey, StockProfile, StockQuote, updateUserStockHoldingCompositionRatio, updateUserStockHoldingFrom, UserStockHolding } from "@/model/stocks";
import { getStockProfile, getStockQuote } from "@/api/finnhub";

function usePopulateUserStockHolding(input: UserStockHolding) {
    const profilesQuery = useQueries({
        queries: Object.keys(input).map(symbol => {
            return {
                queryKey: ["profile", symbol],
                queryFn: () => getStockProfile(symbol),
                staleTime: Infinity
            }
        })
    })

    const quotesQuery = useQueries({
        queries: Object.keys(input).map(symbol => {
            return {
                queryKey: ["quote", symbol],
                queryFn: () => getStockQuote(symbol),
                retryDelay: 1000,
                staleTime: 60 * 1000
            }
        })
    })

    const isLoading = profilesQuery.some(r => r.isLoading)
        || quotesQuery.some(r => r.isLoading)


    const isError = profilesQuery.some(r => r.isError)
        || quotesQuery.some(r => r.isError)

    if (!isLoading) {
        const profiles = convertToStockSymbolKey<StockProfile | undefined>(
            profilesQuery.map(({ data }) => data))

        const quotes = convertToStockSymbolKey<StockQuote | undefined>(
            quotesQuery.map(({ data }) => data))

        updateUserStockHoldingFrom(input, profiles, quotes)
        updateUserStockHoldingCompositionRatio(input)
    }

    return {
        isLoading,
        isError,
        data: input
    }
}

export default usePopulateUserStockHolding