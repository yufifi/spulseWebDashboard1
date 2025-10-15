import React, { useEffect, useState } from 'react'
import Card from '../components/Card'
import ChartContainer from '../components/ChartContainer'
import LineVisitors from '../components/LineVisitors/LineVisitors'
import PiePavilions from '../components/PiePavilions/PiePavilions'
import PieGender from '../components/PieGender'
import BarTopPavilions from '../components/BarTopPavilions'
import LineAvgStay from '../components/LineAvgStay'

import {
  fetchVisitorsLastNDays,
  fetchCheckpointsByPavilionDays,
  fetchVisitorsByGender,
  fetchTopPavilions,
  fetchAvgStayMinutes,
  // also keep the old small helpers if you use them
} from '../api/stats'

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  // main stats (kept for top cards)
  const [totalVisitors, setTotalVisitors] = useState(0)
  const [todayVisitors, setTodayVisitors] = useState(0)
  const [recentCheckpoints, setRecentCheckpoints] = useState(0)

  // charts data
  const [visitorsSeries, setVisitorsSeries] = useState<{ date: string; value: number }[]>([])
  const [pavilionPie, setPavilionPie] = useState<any[]>([])
  const [genderPie, setGenderPie] = useState<any[]>([])
  const [topPavilions, setTopPavilions] = useState<any[]>([])
  const [avgStay, setAvgStay] = useState<{ avgMinutes: number; samples: number }>({ avgMinutes: 0, samples: 0 })

  // filters
  const [visitorsDaysRange, setVisitorsDaysRange] = useState<number>(7)
  const [topPavilionDays, setTopPavilionDays] = useState<number>(7)
  const [avgStayDays, setAvgStayDays] = useState<number>(30)

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    // when visitorsDaysRange changes, reload only visitors series and gender pie (if you want)
    loadVisitorsSeries()
  }, [visitorsDaysRange])

  async function loadAll() {
    setLoading(true)
    await Promise.all([
      loadVisitorsSeries(),
      loadPavilionPie(),
      loadGenderPie(),
      loadTopPavilions(),
      loadAvgStay(),
      // optionally load top-level stats
    ])
    setLoading(false)
  }

  async function loadVisitorsSeries() {
    const { dates, counts } = await fetchVisitorsLastNDays(visitorsDaysRange)
    const series = dates.map((d, i) => ({ date: d, value: counts[i] ?? 0 }))
    setVisitorsSeries(series)
  }

  async function loadPavilionPie() {
    const data = await fetchCheckpointsByPavilionDays(7)
    // transform to {name, value}
    setPavilionPie(data.map((r: any) => ({ name: r.name, value: r.value, color: r.color || undefined })))
  }

  async function loadGenderPie() {
    const data = await fetchVisitorsByGender(visitorsDaysRange)
    setGenderPie(data)
  }

  async function loadTopPavilions() {
    const data = await fetchTopPavilions(topPavilionDays, 5)
    setTopPavilions(data)
  }

  async function loadAvgStay() {
    const res = await fetchAvgStayMinutes(avgStayDays)
    setAvgStay(res)
  }

  if (loading) return <div className="container">Carregando...</div>

  return (
    <div className="container">
      <header className="header" style={{ marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>Dashboard do Controlador</div>
        </div>

        {/* Filters section (affects only visitors chart) */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <label>Período visitantes:</label>
          <select value={visitorsDaysRange} onChange={(e) => setVisitorsDaysRange(Number(e.target.value))} className="input">
            <option value={7}>Últimos 7 dias</option>
            <option value={30}>Últimos 30 dias</option>
            <option value={90}>Últimos 90 dias</option>
          </select>

          <label>Top pavilhões (dias):</label>
          <select value={topPavilionDays} onChange={(e) => { setTopPavilionDays(Number(e.target.value)); loadTopPavilions() }}>
            <option value={7}>7</option>
            <option value={30}>30</option>
            <option value={90}>90</option>
          </select>

          <label>Avg stay (dias):</label>
          <select value={avgStayDays} onChange={(e) => { setAvgStayDays(Number(e.target.value)); loadAvgStay() }}>
            <option value={30}>30</option>
            <option value={90}>90</option>
            <option value={180}>180</option>
          </select>

          <button className="button" onClick={loadAll}>Atualizar tudo</button>
        </div>
      </header>

      {/* top cards */}
      <main className="grid grid-3" style={{ marginBottom: 20 }}>
        <Card title="Total Visitantes" value={totalVisitors} />
        <Card title="Visitantes Hoje" value={todayVisitors} />
        <Card title="Checkpoints Hoje" value={recentCheckpoints} />
      </main>

      {/* charts grid: visitors + pavilion pie */}
      <section className="grid grid-2" style={{ marginBottom: 20 }}>
        <ChartContainer title={`Visitantes - últimos ${visitorsDaysRange} dias`}>
          <LineVisitors data={visitorsSeries.map(s => ({ day: s.date, value: s.value }))} />
        </ChartContainer>

        <ChartContainer title={`Checkpoints por Pavilhão (7 dias)`}>
          <PiePavilions data={pavilionPie} />
        </ChartContainer>
      </section>

      {/* additional charts: gender, top pavilions, avg stay */}
      <section className="grid grid-3" style={{ marginBottom: 20 }}>
        <ChartContainer title="Distribuição por Gênero (period)">
          <PieGender data={genderPie} />
        </ChartContainer>

        <ChartContainer title="Top 5 Pavilhões">
          <BarTopPavilions data={topPavilions} />
        </ChartContainer>

        <ChartContainer title={`Tempo médio de permanência (média ${avgStay.samples} amostras)`}>
          {/* convert avg into single-point line for display */}
          <LineAvgStay data={[{ period: `${avgStayDays}d`, value: avgStay.avgMinutes }]} />
          <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
            Média: {avgStay.avgMinutes} minutos ({avgStay.samples} amostras)
          </div>
        </ChartContainer>
      </section>
    </div>
  )
}
