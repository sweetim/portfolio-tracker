import { Table, Avatar } from 'antd';

function StockTable({ input }) {
    const defaultNumberRenderer = (input: number) => input.toFixed(2)
    const defaultStyleForChange = (input: number) => ({
        style: {
            color: input < 0 ? '#f23645' : 'lime',
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
                    OTLY: "oatly",
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

                return <Avatar size={36} src={`https://s3-symbol-logo.tradingview.com/${LUT[symbol]}.svg`} />
            }
        },
        {
            title: 'Units',
            dataIndex: 'numberOfShares',
            key: 'numberOfShares',
            onCell: ({ numberOfShares }) => numberOfShares
        },
        {
            title: 'Avg Open',
            dataIndex: 'averageAcquiredPrice_usd',
            key: 'averageAcquiredPrice_usd',
            render: defaultNumberRenderer
        },
        {
            title: 'Price (USD)',
            dataIndex: 'currentPrice_usd',
            key: 'currentPrice_usd',
            render: defaultNumberRenderer
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
            title: 'Ratio (%)',
            dataIndex: 'compositionRatio',
            key: 'compositionRatio',
            render: defaultNumberRenderer
        },
        {
            title: 'P/L (%)',
            dataIndex: 'profit_percentage',
            key: 'profit_percentage',
            render: defaultNumberRenderer,
            onCell: (r) => defaultStyleForChange(r.profit_percentage)
        },
        {
            title: 'P/L (JPY)',
            dataIndex: 'profit_jpy',
            key: 'profit_jpy',
            onCell: (r) => defaultStyleForChange(r.profit_jpy)
        }
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