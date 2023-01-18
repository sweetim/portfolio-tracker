import { FC } from 'react'
import { Table, Avatar, Col, Row, Tooltip } from 'antd'
import { ColumnsType } from 'antd/es/table/interface'

import './StockTable.css'

import { VisualizationItemsProps } from '.';
import { VisualizationItem } from './util';

const StockTable: FC<VisualizationItemsProps> = ({ input, currency }) => {
    const defaultNumberRenderer = (input: number) => input.toFixed(2)
    const defaultStyleForChange = (input_1: number, input_2: number = 0) => ({
        style: {
            color: input_1 < input_2 ? '#f23645' : 'lime',
            fontWeight: 'bold'
        }
    })

    const columns: ColumnsType<VisualizationItem> = [
        {
            title: '',
            dataIndex: 'symbol',
            key: 'symbol',
            width: 180,
            fixed: 'left',
            render: (symbol, { logoUrl, name }) => {
                const avatar = <Avatar size={36} src={logoUrl} />

                return (
                    <Row gutter={8} align="middle">
                        <Col>
                            {avatar}
                        </Col>
                        <Col>
                            <Tooltip title={name}>
                                <span>{symbol}</span>
                            </Tooltip>
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
        },
        {
            title: `Avg Open (${currency.toUpperCase()})`,
            dataIndex: 'averageAcquiredPrice',
            key: 'averageAcquiredPrice',
            render: defaultNumberRenderer
        },
        {
            title: `Price (${currency.toUpperCase()})`,
            dataIndex: 'currentPrice',
            key: 'currentPrice',
            render: defaultNumberRenderer,
            onCell: (r) => defaultStyleForChange(r.currentPrice, r.averageAcquiredPrice)
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
            title: `Value (${currency.toUpperCase()})`,
            dataIndex: 'marketValue',
            key: 'marketValue',
            render: defaultNumberRenderer,
            sorter: (a, b) => a.marketValue - b.marketValue,
        },
        {
            title: `P/L (${currency.toUpperCase()})`,
            dataIndex: 'profit',
            key: 'profit',
            render: defaultNumberRenderer,
            onCell: (r) => defaultStyleForChange(r.profit),
            sorter: (a, b) => a.profit - b.profit,
        },
        {
            title: 'Ratio (%)',
            dataIndex: 'compositionRatio',
            key: 'compositionRatio',
            render: defaultNumberRenderer,
            sorter: (a, b) => a.compositionRatio - b.compositionRatio,
            defaultSortOrder: 'descend'
        },
    ]

    return <Table
        scroll={{ x: 1000 }}
        sticky={true}
        dataSource={input}
        columns={columns}
        pagination={false}
    />
}

export default StockTable