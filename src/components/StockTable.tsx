import { Table, Avatar, Col, Row } from 'antd'
import { ColumnsType } from 'antd/es/table/interface'
import { RakutenRawData } from '../parser/rakuten'

import './StockTable.css'

function StockTable({ input }: RakutenRawData) {
    const dataSource = Object.entries(input)
        .map(([k, v]) => {
            const { account, ...others } = v
            const { total, ...otherAccount } = account

            let children = undefined
            if (Object.entries(otherAccount).length > 1) {
                children = Object.entries(otherAccount)
                    .map(([type, v]: [string, any]) => ({
                        key: `${k}/${type}`,
                        type,
                        ...v
                    }))
            }

            return {
                key: k,
                ...others,
                ...total,
                type: '',
                children
            }
        })

    const defaultNumberRenderer = (input: number) => input.toFixed(2)
    const defaultStyleForChange = (input_1: number, input_2: number = 0) => ({
        style: {
            color: input_1 < input_2 ? '#f23645' : 'lime',
            fontWeight: 'bold'
        }
    })

    const columns: ColumnsType<any> = [
        {
            title: '',
            dataIndex: 'symbol',
            key: 'symbol',
            width: 180,
            fixed: 'left',
            render: (symbol) => {
                if (!symbol) return ''

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

                const avatar = LUT[symbol]
                    ? <Avatar size={36} src={`https://s3-symbol-logo.tradingview.com/${LUT[symbol]}.svg`} />
                    : <Avatar size={36}>{symbol}</Avatar>

                return (
                    <Row gutter={8} align="middle">
                        <Col>
                            {avatar}
                        </Col>
                        <Col>
                            {symbol}
                        </Col>
                    </Row>
                )
            }
        },
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type'
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
            onCell: (r) => defaultStyleForChange(r.profit_percentage),
            sorter: (a, b) => a.profit_percentage - b.profit_percentage,
        },
        {
            title: 'Value (USD)',
            dataIndex: 'marketValue_usd',
            key: 'marketValue_usd',
            render: defaultNumberRenderer,
            sorter: (a, b) => a.marketValue_usd - b.marketValue_usd,
        },
        // {
        //     title: 'Value (JPY)',
        //     dataIndex: 'marketValue_jpy',
        //     key: 'marketValue_jpy',
        //     sorter: (a, b) => a.marketValue_jpy - b.marketValue_jpy,
        // },
        {
            title: 'P/L (USD)',
            dataIndex: 'profit_usd',
            key: 'profit_usd',
            render: defaultNumberRenderer,
            onCell: (r) => defaultStyleForChange(r.profit_usd),
            sorter: (a, b) => a.profit_usd - b.profit_usd,
        },
        {
            title: 'Ratio (%)',
            dataIndex: 'compositionRatio',
            key: 'compositionRatio',
            render: defaultNumberRenderer,
            sorter: (a, b) => a.compositionRatio - b.compositionRatio,
            // sortOrder: 'descend'
        },
    ]

    return <Table
        scroll={{ x: 1000 }}
        sticky={true}
        dataSource={dataSource}
        columns={columns}
        pagination={false}
    />
}

export default StockTable