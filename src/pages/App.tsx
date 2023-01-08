import { Layout, Radio } from 'antd';
import {
    PieChartOutlined,
    TableOutlined,
    HeatMapOutlined
} from '@ant-design/icons';

import { useState } from "react"
import { useLocation, useNavigate } from 'react-router-dom'

import { StockTable, StockPieChart, StockTreeMap } from '../components';
import { useEffect } from 'react';

function App() {
    const location = useLocation()
    const navigate = useNavigate()

    const { state: data } = location

    useEffect(() => {
        if (!data) navigate('/')
    }, [data])

    if (!data) {
        return
    }

    const flattenToTotalData = Object.entries(data)
        .map(([k, v]) => {
            const { account, ...others } = v as any

            return {
                key: k,
                ...others,
                ...account.total
            }
        })

    const { Content, Header } = Layout

    const [chartType, setChartType] = useState("StockTreeMap")

    const onChartTypeChangeHandler = (e) => {
        setChartType(e.target.value)
    }

    const renderChart = () => {
        const CHART_TYPES = {
            "StockTable": <StockTable input={data} />,
            "StockPieChart": <StockPieChart input={flattenToTotalData} />,
            "StockTreeMap": <StockTreeMap input={flattenToTotalData} />
        }

        return CHART_TYPES[chartType]
    }

    return (
        <Layout style={{ height: "100vh" }}>
            <Header>
                <Radio.Group value={chartType} onChange={onChartTypeChangeHandler}>
                    <Radio.Button value="StockTreeMap"><HeatMapOutlined /></Radio.Button>
                    <Radio.Button value="StockTable"><TableOutlined /></Radio.Button>
                    <Radio.Button value="StockPieChart"><PieChartOutlined /></Radio.Button>
                </Radio.Group>
            </Header>

            <Content>
                {renderChart()}
            </Content>
        </Layout>
    );
}

export default App;
