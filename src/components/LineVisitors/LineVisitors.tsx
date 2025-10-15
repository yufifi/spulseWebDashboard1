import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import '../../styles/ChartContainer.css'

export default function LineVisitors({ data }: { data: any[] }) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 30, bottom: 40 }}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
