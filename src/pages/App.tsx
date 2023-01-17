import { Button, Col, Layout, Radio, Row } from 'antd';
import {
    PieChartOutlined,
    TableOutlined,
    HeatMapOutlined,
    SettingOutlined
} from '@ant-design/icons';

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'

import { StockTable, StockPieChart, StockTreeMap, Loading } from '../components';

import { usePopulateUserStockHolding } from '@/hooks';
import { StockCurrency, UserStockHolding } from '@/model/stocks';
import { convertUserStockHoldingToVisualizationItem, VisualizationItem } from '@/components/charts/util';
import { ChartType } from '@/components/charts';


function App() {
    const { Content, Header } = Layout

    const location = useLocation()
    const navigate = useNavigate()

    const input = location.state as UserStockHolding

    useEffect(() => {
        if (!input) navigate('/')
    }, [input])

    if (!input) {
        return
    }

    const [ chartType, setChartType ] = useState<ChartType>("StockTable")
    const [ currency, SetCurrency ] = useState<StockCurrency>("usd")

    const { isLoading, isError, data } = usePopulateUserStockHolding(input)

    const onChartTypeChangeHandler = (e) => {
        setChartType(e.target.value)
    }

    const [ visualizationItems, setVisualizationItems ] = useState<VisualizationItem[]>([])

    useMemo(() => {
        if (!isLoading) {
            setVisualizationItems(convertUserStockHoldingToVisualizationItem(data))
        }

    }, [isLoading, data])

    const renderChart = useMemo(() => {
        if (isLoading) {
            return <Loading />
        }

        const CHART_TYPES = {
            "StockTable": <StockTable input={visualizationItems} currency={currency} />,
            // "StockPieChart": <StockPieChart input={flattenToTotalData} />,
            // "StockTreeMap": <StockTreeMap input={flattenToTotalData} />
        }

        console.log(visualizationItems)
        return CHART_TYPES[chartType]
    }, [isLoading, isError, visualizationItems])

    const settingButtonClickHandler = () => {
        navigate('/')
    }

    return (
        <Layout style={{ height: "100vh" }}>
            <Header>
                <Row>
                    <Col>
                        <Radio.Group value={chartType} onChange={onChartTypeChangeHandler}>
                            <Radio.Button value="StockTreeMap"><HeatMapOutlined /></Radio.Button>
                            <Radio.Button value="StockTable"><TableOutlined /></Radio.Button>
                            <Radio.Button value="StockPieChart"><PieChartOutlined /></Radio.Button>
                        </Radio.Group>
                    </Col>
                    <Col flex="auto"></Col>
                    <Col>
                        <Button
                            onClick={settingButtonClickHandler}
                            shape="circle"
                            icon={<SettingOutlined />} />
                    </Col>
                </Row>
            </Header>
            <Content>
                {renderChart}
            </Content>
        </Layout>
    );
}

export default App;
