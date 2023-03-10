import { Button, Col, Layout, Radio, RadioChangeEvent, Row } from 'antd';
import {
    PieChartOutlined,
    TableOutlined,
    HeatMapOutlined,
    SettingOutlined
} from '@ant-design/icons';

import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'

import { StockTable, StockPieChart, StockTreeMap, Loading } from '../components';

import { usePopulateUserStockHolding, useRealTimeStockQuotes } from '@/hooks';
import { StockCurrency, updateUserStockHoldingWithLatestTrade, UserStockHolding } from '@/model/stocks';
import { convertUserStockHoldingToVisualizationItem, VisualizationItem } from '@/components/charts/util';
import { ChartType, VisualizationItemsProps } from '@/components/charts';
import { ReadyState } from 'react-use-websocket';

function App() {
    const { Content, Header } = Layout

    const location = useLocation()
    const navigate = useNavigate()

    const input = location.state as UserStockHolding

    useEffect(() => {
        if (!input) navigate('/')
    }, [input])

    const [chartType, setChartType] = useState<ChartType>("StockTable")
    const [currency, setCurrency] = useState<StockCurrency>("usd")
    const [visualizationItems, setVisualizationItems] = useState<VisualizationItem[]>([])

    const { isLoading, isError, data } = usePopulateUserStockHolding(input)
    const { trades, readyState } = useRealTimeStockQuotes(Object.keys(input))

    useEffect(() => {
        if (isLoading || readyState !== ReadyState.OPEN) return

        updateUserStockHoldingWithLatestTrade(input, trades)
        setVisualizationItems(convertUserStockHoldingToVisualizationItem(data))
    }, [isLoading, data, readyState, trades])

    const renderChart = useMemo(() => {
        if (isLoading) {
            return <Loading />
        }

        const visualizationConfig: VisualizationItemsProps = {
            input: visualizationItems,
            currency
        }

        const CHART_TYPES: { [t in ChartType]: JSX.Element } = {
            "StockTable": <StockTable {...visualizationConfig} />,
            "StockPieChart": <StockPieChart {...visualizationConfig} />,
            "StockTreeMap": <StockTreeMap {...visualizationConfig} />
        }

        return CHART_TYPES[chartType]
    }, [chartType, isLoading, isError, visualizationItems])

    const settingButtonClickHandler = () => {
        navigate('/')
    }

    const onChartTypeChangeHandler = (e: RadioChangeEvent) => {
        setChartType(e.target.value)
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
