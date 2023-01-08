import { Table, Avatar } from 'antd';

function StockTable({ input }) {
    const defaultNumberRenderer = (input: number) => input.toFixed(2)
    const defaultStyleForChange = (input_1: number, input_2: number = 0) => ({
        style: {
            color: input_1 < input_2 ? '#f23645' : 'lime',
            fontWeight: 'bold'
        }
    })

    const columns = [
        {
            title: '',
            dataIndex: 'symbol',
            key: 'symbol',
            render: (symbol) => {
                const LUT = {
                    SHOP: "shopify",
                    NVDA: "nvidia",
                    AMD: "advanced-micro-devices",
                    AMZN: "amazon",
                    TTD: "the-trade-desk",
                    TSLA: "tesla",
                    MDB: "mongodb",
                    GOOG: "alphabet",
                    ETSY: "etsy",
                    SQ: "square",
                    DDOG: "datadog",
                    PEP: "pepsico",
                    FVRR: "fiverr",
                    SNOW: "snowflake",
                    SOFI: "sofi",
                    UPST: "upstart",
                    KHC: "kraft-heinz",
                    K: "kellogg",
                    KO: "coca-cola",
                    AI: "c3-ai",
                    CPNG: "coupang",
                    PLTR: "palantir",
                    JD: "jd-com",
                    RIOT: "riot-blockchain"
                }

                return LUT[symbol]
                    ? <Avatar size={36} src={`https://s3-symbol-logo.tradingview.com/${LUT[symbol]}.svg`} />
                    : <Avatar size={36}>{symbol}</Avatar>
            }
        },
        {
            title: 'Units',
            dataIndex: 'numberOfShares',
            key: 'numberOfShares',
            onCell: ({ numberOfShares }) => numberOfShares
        },
        {
            title: 'Avg Open (USD)',
            dataIndex: 'averageAcquiredPrice_usd',
            key: 'averageAcquiredPrice_usd',
            render: defaultNumberRenderer
        },
        {
            title: 'Price (USD)',
            dataIndex: 'currentPrice_usd',
            key: 'currentPrice_usd',
            render: defaultNumberRenderer,
            onCell: (r) => defaultStyleForChange(r.currentPrice_usd, r.averageAcquiredPrice_usd)
        },
        {
            title: 'P/L (%)',
            dataIndex: 'profit_percentage',
            key: 'profit_percentage',
            render: defaultNumberRenderer,
            onCell: (r) => defaultStyleForChange(r.profit_percentage)
        },
        {
            title: 'Value (USD)',
            dataIndex: 'marketValue_usd',
            key: 'marketValue_usd',
            render: defaultNumberRenderer
        },
        {
            title: 'Value (JPY)',
            dataIndex: 'marketValue_jpy',
            key: 'marketValue_jpy'
        },
        {
            title: 'P/L (JPY)',
            dataIndex: 'profit_jpy',
            key: 'profit_jpy',
            onCell: (r) => defaultStyleForChange(r.profit_jpy)
        },
        {
            title: 'Ratio (%)',
            dataIndex: 'compositionRatio',
            key: 'compositionRatio',
            render: defaultNumberRenderer
        },
    ]

    return <Table
        sticky={true}
        dataSource={input}
        columns={columns}
        pagination={{
            pageSize: 100
        }}
    />
}

export default StockTable