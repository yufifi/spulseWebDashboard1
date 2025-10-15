import React from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'
import '../styles/ChartContainer.css'

const COLORS = ['#60a5fa', '#f472b6', '#86efac', '#f59e0b', '#c7d2fe']

export default function PieGender({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} innerRadius={40} label>
            {data.map((entry, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend verticalAlign="bottom" align="center" wrapperStyle={{ width: '100%' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
