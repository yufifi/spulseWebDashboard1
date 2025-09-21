import React, { useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1']

export default function PiePavilions({ data, onSliceClick }: { data: any[], onSliceClick?: (d:any)=>void }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          innerRadius={50}
          onClick={(entry, index) => { setActiveIndex(index); onSliceClick && onSliceClick(entry) }}
          onMouseEnter={(_, index)=>setActiveIndex(index)}
          onMouseLeave={()=>setActiveIndex(null)}
        >
          {data.map((entry, i) => (
            <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} opacity={activeIndex === null || activeIndex === i ? 1 : 0.5} />
          ))}
        </Pie>
        <Tooltip />
        <Legend
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ maxHeight: 200, overflowY: 'auto', padding: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
