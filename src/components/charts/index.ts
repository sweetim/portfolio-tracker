const CHART_TYPES = [
    "StockTable",
    "StockPieChart",
    "StockTreeMap"
] as const

export type ChartType = typeof CHART_TYPES[number]
