import { getFinnHubWSSUrl, parseWSRawTrade, WSSendData } from '@/api/finnhub';
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
        () => parseWSRawTrade(lastMessage),
        [lastMessage?.timeStamp])

    return { trades, readyState }
}



export default useRealTimeStockQuotes