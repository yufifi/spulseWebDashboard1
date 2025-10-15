// src/components/BarTopPavilions.tsx
import React from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'
import '../styles/ChartContainer.css'

export default function BarTopPavilions({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 16, right: 24, left: 24, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="value" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
