import { useState } from 'react';

import { Layout, Input, Button, Statistic, Typography, Avatar, Row, Col } from 'antd';
import { CheckOutlined, RiseOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

import { parseRakutenRawData } from '../parser/rakuten'

function Home() {
    const { Content } = Layout
    const { TextArea } = Input;
    const { Title, Paragraph } = Typography;

    const [rawData, setRawData] = useState('')
    const [numberOfCompanies, setNumberOfCompanies] = useState(0)
    const [isDataOk, setIsDataOk] = useState(false)

    const navigate = useNavigate()

    const submitButtonHandler = () => {
        const data = parseRakutenRawData(rawData)
        setNumberOfCompanies(Object.keys(data).length)

        navigate('/app', {
            state: data
        })
    }

    const textAreaChangeHandler = (e) => {
        setRawData(e.target.value)

        try {
            const data = parseRakutenRawData(e.target.value)
            setNumberOfCompanies(Object.keys(data).length)
            setIsDataOk(true)
        } catch (e) {
            setIsDataOk(false)
        }
    }

    const renderWhenDataIsOk = (input) => {
        if (!input) return

        return (
            <Row gutter={8} align="middle">
                <Col>
                    <Statistic title="Number of Companies" value={numberOfCompanies} />
                </Col>
                <Col flex="auto"></Col>
                <Col>
                    <Button
                        type="primary"
                        shape="circle"
                        icon={<CheckOutlined />}
                        size={"large"}
                        onClick={submitButtonHandler}>
                        {/* Go */}
                    </Button>
                </Col>
            </Row>
        )
    }

    return (
        <Layout style={{ height: "100vh" }}>
            <Content style={{ padding: '0 20px', textAlign: 'center' }}>
                <Row justify="center" align="middle" style={{ height: "100vh" }}>
                    <Col>
                        <Avatar size={128} icon={<RiseOutlined />} style={{ color: 'lime', backgroundColor: 'black' }} />
                        <Title>Portfolio Tracker</Title>
                        <Paragraph>
                            this application will track and visualize your portfolio from Rakuten Securities JP
                        </Paragraph>
                        <TextArea
                            style={{ marginTop: '20px', marginBottom: '20px' }}
                            autoSize={{ minRows: 6, maxRows: 20 }}
                            bordered={true}
                            value={rawData}
                            placeholder="paste the table of content here"
                            onChange={textAreaChangeHandler} />

                        {renderWhenDataIsOk(isDataOk)}

                    </Col>
                </Row>
            </Content>
        </Layout>
    )
}

export default Home