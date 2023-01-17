import { Pie } from '@ant-design/plots';

function StockPieChart({ input }) {
    const data = input.map(({ symbol, compositionRatio }) => ({
        type: symbol,
        value: compositionRatio
    })).sort((a, b) => b.value - a.value)

    const config = {
        appendPadding: 10,
        data,
        animation: false,
        angleField: 'value',
        colorField: 'type',
        radius: 0.75,
        // label: {
        //   type: 'spider',
        //   labelHeight: 28,
        //   content: '{name} {percentage}',
        // },
        legend: {
            layout: 'horizontal',
            position: 'bottom',
            flipPage: false,
        },
        label: {
            type: 'inner',
            offset: '-30%',
            content: ({ type, value }) => (value) > 1 ? `${type} ${value.toFixed(2)}%` : '',
            style: {
                fontSize: 14,
                textAlign: 'center',
            },
        },
        theme: "dark",
        interactions: [
            {
                type: 'element-active',
            },
        ],
    }

    return (
        // @ts-ignore
        <Pie
            style={{ minHeight: "100%" }}
            {...config} />
    )
}

export default StockPieChart