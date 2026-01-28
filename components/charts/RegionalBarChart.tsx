'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'
import { chartColors, getGoalColor, formatCurrency } from '@/lib/chartColors'

interface RegionData {
  region: string
  director: string
  monthlySales: number
  monthlyGoal: number
  percentToGoal: number
}

interface RegionalBarChartProps {
  data: RegionData[]
}

export default function RegionalBarChart({ data }: RegionalBarChartProps) {
  // Transform data for the chart
  const chartData = data.map(d => ({
    name: d.region,
    director: d.director,
    sales: d.monthlySales,
    goal: d.monthlyGoal,
    percentToGoal: d.percentToGoal,
  }))

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: typeof chartData[0] }> }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload
      return (
        <div className="bg-card-bg border border-card-border rounded-lg shadow-lg p-3">
          <p className="font-semibold text-foreground">{item.name}</p>
          <p className="text-sm text-foreground opacity-70">{item.director}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p className="text-sonance-blue">
              Sales: {formatCurrency(item.sales)}
            </p>
            <p className="text-foreground opacity-60">
              Goal: {formatCurrency(item.goal)}
            </p>
            <p className={`font-semibold ${
              item.percentToGoal >= 100 ? 'text-sonance-green' :
              item.percentToGoal >= 90 ? 'text-sonance-blue' :
              'text-red-500'
            }`}>
              {item.percentToGoal}% to goal
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} horizontal={true} vertical={false} />
          <XAxis
            type="number"
            tickFormatter={(value) => formatCurrency(value)}
            stroke={chartColors.text}
            fontSize={12}
          />
          <YAxis
            type="category"
            dataKey="name"
            stroke={chartColors.text}
            fontSize={12}
            width={100}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine x={0} stroke={chartColors.grid} />
          <Bar dataKey="sales" radius={[0, 4, 4, 0]} maxBarSize={30}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getGoalColor(entry.percentToGoal)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
