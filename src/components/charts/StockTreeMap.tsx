import { FC } from 'react';
import { Treemap } from '@ant-design/plots';

import { VisualizationItemsProps } from '.';

const StockTreeMap: FC<VisualizationItemsProps> = ({ input }) => {
    const children = input.map((item) => {
        const { symbol, compositionRatio, name: fullName, ...others } = item
        return {
            name: symbol,
            value: compositionRatio,
            fullName,
            ...others
        }
    })

    const data = {
        name: 'root',
        children
    }

    const config = {
        data,
        animation: false,
        legend: false,
        color: ['#f23645', '#363a45', 'lime'],
        colorField: 'profit_percentage',
        label: {
            content: ({ name, profit_percentage }) => {
                return `${name} ${profit_percentage.toFixed(2)}`
            },
        },
    }

    // @ts-ignore
    return <Treemap
        style={{ minHeight: '100%' }}
        {...config} />
}

export default StockTreeMap