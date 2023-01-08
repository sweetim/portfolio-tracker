import { ConfigProvider, Table, Layout, theme, Avatar, Radio, Select } from 'antd';

import {
    PieChartOutlined,
    TableOutlined,
    HeatMapOutlined
} from '@ant-design/icons';

import { useState } from "react"
import { useLocation } from 'react-router-dom'

import { StockTable, StockPieChart, StockTreeMap } from '../components';

function App() {
    const location = useLocation()
    const { state: data } = location

    const dataSource = Object.entries(data)
        .map(([k, v]) => {
            const { account, ...others } = v as any

            return {
                key: k,
                ...others,
                ...account.total
            }
        })
        .sort((a, b) => b.compositionRatio - a.compositionRatio)

    const { Content, Header } = Layout

    const [chartType, setChartType] = useState("treeMap")

    const onChartTypeChangeHandler = (e) => {
        setChartType(e.target.value)
    }

    const renderChart = () => {
        const CHART_TYPES = {
            "table": <StockTable input={dataSource} />,
            "pieChart": <StockPieChart input={dataSource} />,
            "treeMap": <StockTreeMap input={dataSource} />
        }

        return CHART_TYPES[chartType]
    }

    return (

        <Layout style={{ height: "100vh" }}>
            <Header>
                <Radio.Group value={chartType} onChange={onChartTypeChangeHandler}>
                    <Radio.Button value="treeMap"><HeatMapOutlined /></Radio.Button>
                    <Radio.Button value="table"><TableOutlined /></Radio.Button>
                    <Radio.Button value="pieChart"><PieChartOutlined /></Radio.Button>
                </Radio.Group>
            </Header>

            <Content>
                {renderChart()}
            </Content>
        </Layout>
    );
}

export default App;
