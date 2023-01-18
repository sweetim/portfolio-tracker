import { Pie, PieConfig } from "@ant-design/plots";
import { FC } from "react";
import { VisualizationItemsProps } from ".";

const StockPieChart: FC<VisualizationItemsProps> = ({ input }) => {
    const config: PieConfig = {
        appendPadding: 10,
        data: input.sort((a, b) => b.compositionRatio - a.compositionRatio),
        animation: false,
        angleField: "compositionRatio",
        colorField: "symbol",
        radius: 0.75,
        legend: {
            layout: "horizontal",
            position: "bottom",
            flipPage: false,
        },
        label: {
            type: "inner",
            offset: "-30%",
            content: ({ symbol, compositionRatio }) => (compositionRatio) > 1 ? `${symbol} ${compositionRatio.toFixed(2)}%` : "",
            style: {
                fontSize: 14,
                textAlign: "center",
            },
        },
        theme: "dark",
        interactions: [
            {
                type: "element-active",
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