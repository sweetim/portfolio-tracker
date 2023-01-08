import { useState } from 'react';

import { Layout, Input, Button, Statistic } from 'antd';
import { CheckOutlined } from '@ant-design/icons';

import { useNavigate } from 'react-router-dom';

import { parseRakutenRawData } from '../parser/rakuten'

function Home() {
    const DEFAULT_TEXT = ``

    const { Content } = Layout
    const { TextArea } = Input;

    const [ rawData, setRawData ] = useState(DEFAULT_TEXT)
    const [ numberOfCompanies, setNumberOfCompanies ] = useState(0)

    const navigate = useNavigate()

    const submitButtonHandler = () => {
        const data = parseRakutenRawData(rawData)
        setNumberOfCompanies(Object.keys(data).length)

        navigate('/app', {
            state: data
        })

        console.log(parseRakutenRawData(rawData))
    }

    const textAreaChangeHandler = (e) => {
        console.log('here')
        setRawData(e.target.value)

        const data = parseRakutenRawData(e.target.value)
        setNumberOfCompanies(Object.keys(data).length)
    }



    return (
        <Layout style={{ height: "100vh" }}>
            <Content>

                <TextArea
                    autoSize={{ minRows: 6, maxRows: 30 }}
                    bordered={false}
                    value={DEFAULT_TEXT}
                    placeholder="paste the table here"
                    onChange={textAreaChangeHandler} />

                <Statistic title="Number of Companies" value={numberOfCompanies} />

                <Button
                    type="primary"
                    shape="circle"
                    icon={<CheckOutlined />}
                    size={"large"}
                    onClick={submitButtonHandler}>
                    {/* Go */}
                </Button>

            </Content>
        </Layout>
    )
}

export default Home