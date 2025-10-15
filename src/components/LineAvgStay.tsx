// src/components/LineAvgStay.tsx
import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import '../styles/ChartContainer.css'

export default function LineAvgStay({ data }: { data: { period: string; value: number }[] }) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 16, right: 24, left: 24, bottom: 24 }}>
          <XAxis dataKey="period" />
          <YAxis label={{ value: 'min', angle: -90, position: 'insideLeft' }} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#f97316" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
