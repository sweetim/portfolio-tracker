import { Pie } from '@ant-design/plots';

function StockPieChart({ input }) {
    const config = {
        appendPadding: 10,
        data: input.map(({ symbol, compositionRatio }) => ({
            type: symbol,
            value: compositionRatio
        })),
        angleField: 'value',
        colorField: 'type',
        radius: 0.75,
        // label: {
        //   type: 'spider',
        //   labelHeight: 28,
        //   content: '{name} {percentage}',
        // },
        label: {
            type: 'inner',
            offset: '-30%',
            content: ({ type, value }) => {
                return (value) > 1 ? `${type} ${value.toFixed(2)}%` : ""
            },
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
        <Pie
            style={{ minHeight: "100%" }}
            {...config} />
    )
}

export default StockPieChart