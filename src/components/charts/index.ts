import { StockCurrency } from "@/model/stocks"
import { VisualizationItem } from "./util"

const CHART_TYPES = [
    "StockTable",
    "StockPieChart",
    "StockTreeMap"
] as const

export type ChartType = typeof CHART_TYPES[number]

export type VisualizationItemsProps = {
    input: VisualizationItem[],
    currency: StockCurrency
}