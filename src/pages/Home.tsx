import { Layout, Input, Button, Statistic } from 'antd';

import { CheckOutlined } from '@ant-design/icons';
import { useState } from 'react';

import { parseRakutenRawData } from '../parser/rakuten'

function Home() {
    const { Content } = Layout
    const { TextArea } = Input;

    const [rawData, setRawData] = useState('')
    const [ numberOfCompanies, setNumberOfCompanies ] = useState(0)

    const submitButtonHandler = () => {
        const data = parseRakutenRawData(rawData)

        setNumberOfCompanies(Object.keys(data).length)

        console.log(parseRakutenRawData(rawData))
    }

    const textAreaChangeHandler = (e) => {
        setRawData(e.target.value)
    }

    return (
        <Layout style={{ height: "100vh" }}>
            <Content>

                <TextArea
                    autoSize={{ minRows: 6, maxRows: 30 }}
                    bordered={false}
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