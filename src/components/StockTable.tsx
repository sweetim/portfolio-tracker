import { Table, Avatar } from 'antd';

function StockTable({ input }) {
    const columns = Object.keys(input[0]).map((k, i) => ({
        title: k,
        dataIndex: k,
        key: k,
        render: (text, r) => {
            if (Number(text) && i !== 2) {
                return {
                    props: {
                        style: i > 8
                            ? {
                                color: text < 0 ? "#f23645" : "lime",
                                fontWeight: "bold"
                            }
                            : {}
                    },
                    children: text.toFixed(2)
                }
            }

            if (i === 0) {
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

                return {
                    children: <Avatar size={36} src={`https://s3-symbol-logo.tradingview.com/${LUT[r.symbol]}.svg`} />
                }
            }

            return text
        }
    }))

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