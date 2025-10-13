import React, { useState } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1']

export default function PiePavilions({ data, onSliceClick }: { data: any[], onSliceClick?: (d:any)=>void }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div style={{ width: '100%', height: 300, position: 'relative', overflow: 'hidden' }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={90}
            innerRadius={50}
            onClick={(entry, index) => { setActiveIndex(index); onSliceClick && onSliceClick(entry) }}
            onMouseEnter={(_, index)=>setActiveIndex(index)}
            onMouseLeave={()=>setActiveIndex(null)}
          >
            {data.map((entry, i) => (
              <Cell
                key={`cell-${i}`}
                fill={COLORS[i % COLORS.length]}
                opacity={activeIndex === null || activeIndex === i ? 1 : 0.5}
              />
            ))}
          </Pie>

          <Tooltip />

          {/* 🔧 Corrige o vazamento da legenda */}
          <Legend
            verticalAlign="bottom"
            align="center"
            layout="horizontal"
            wrapperStyle={{
              position: 'absolute',
              bottom: 0,
              width: '100%',
              paddingTop: 10,
              fontSize: '13px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
