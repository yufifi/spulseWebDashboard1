import React from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Brush } from 'recharts'

type Props = {
  data: { day: string, value: number }[]
  onPointClick?: (point: any) => void
}

export default function LineVisitors({ data, onPointClick }: Props) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
        <XAxis dataKey="day" tickFormatter={(d)=> new Date(d).toLocaleDateString()} />
        <YAxis allowDecimals={false} />
        <Tooltip formatter={(v:number) => v.toString()} labelFormatter={(l)=> new Date(l).toLocaleDateString()} />
        <Line type="monotone" dataKey="value" stroke="#1976d2" strokeWidth={2} dot={{ r:4 }} onClick={(e)=> onPointClick && onPointClick(e)} />
        <Brush dataKey="day" height={30} stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  )
}
