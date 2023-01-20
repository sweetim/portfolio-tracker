import { FC } from "react";

import { Space, Spin } from "antd";
import { LoadingOutlined } from '@ant-design/icons';

const Loading: FC = () => {
    const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

    return (
        <Spin  indicator={antIcon} tip="loading..." />
    )
}

export default Loading