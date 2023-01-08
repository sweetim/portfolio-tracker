import { Treemap } from '@ant-design/plots';

function StockTreeMap({ input }) {
    const data = {
        name: 'root',
        children: input.map(({ symbol, compositionRatio, profit_percentage }) => ({
            name: symbol,
            value: compositionRatio,
            profit_percentage
        }))
    };

    const config = {
        data,
        legend: false,
        color: [ '#f23645', '#363a45', '#089950' ],
        colorField: 'profit_percentage',
        label: {
            content: ({ name, profit_percentage }) => {
                return `${name} ${profit_percentage.toFixed(2)}`
            },
        },
    };

    // @ts-ignore
    return <Treemap
        style={{ minHeight: "100%" }}
        {...config} />
}

export default StockTreeMap