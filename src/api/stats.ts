// src/api/stats.ts
import { supabase } from './supabaseClient'

type DayCount = { date: string; value: number }

/**
 * Retorna checkpoints (agregados por dia) nos últimos `days` dias.
 * Usa visitor_checkpoints.created_at (timestamp) como referência.
 */
export async function fetchVisitorsLastNDays(days = 7): Promise<{ dates: string[]; counts: number[] }> {
  try {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
    const { data, error } = await supabase
      .from('visitor_checkpoints')
      .select('created_at')
      .gte('created_at', since)

    if (error) throw error
    const rows = data ?? []

    // build map date->count (date in YYYY-MM-DD)
    const countsMap: Record<string, number> = {}
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      countsMap[d.toISOString().split('T')[0]] = 0
    }

    rows.forEach((r: any) => {
      const dt = new Date(r.created_at).toISOString().split('T')[0]
      if (countsMap[dt] === undefined) countsMap[dt] = 0
      countsMap[dt]++
    })

    const dates = Object.keys(countsMap).sort()
    const counts = dates.map((d) => countsMap[d])
    return { dates, counts }
  } catch (err) {
    console.error('fetchVisitorsLastNDays error', err)
    // fallback empty last N days
    const dates: string[] = []
    const counts: number[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(d.toISOString().split('T')[0])
      counts.push(0)
    }
    return { dates, counts }
  }
}

/**
 * Checkpoints por pavilhão (últimos `days` dias).
 * Retorna array { id, name, value }
 */
export async function fetchCheckpointsByPavilionDays(days = 7) {
  try {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
    const { data, error } = await supabase
      .from('visitor_checkpoints')
      .select('pavilion_id, pavilion, pavilion_id, pavilions(name)')
      .gte('created_at', since)

    if (error) throw error

    // Normalize: some rows may have pavilion (text) or pavilion_id with joined pavilions.name
    const counts: Record<string, { id?: number; name: string; value: number }> = {}
    (data ?? []).forEach((r: any) => {
      const id = r.pavilion_id ?? null
      const name = (r.pavilions && r.pavilions.name) || r.pavilion || (id ? `Pav. ${id}` : 'Desconhecido')
      const key = name
      counts[key] = counts[key] || { id, name, value: 0 }
      counts[key].value++
    })

    return Object.values(counts).sort((a, b) => b.value - a.value)
  } catch (err) {
    console.error('fetchCheckpointsByPavilionDays error', err)
    return []
  }
}

/**
 * Distribuição por gênero dos visitantes considerados no período (últimos days).
 * Usa visitor_checkpoints -> visitors (embedded) if available.
 */
export async function fetchVisitorsByGender(days = 7) {
  try {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
    // request visitor_checkpoints and embed visitors(gender) via FK visitor_id -> visitors.id
    const { data, error } = await supabase
      .from('visitor_checkpoints')
      .select('visitor_id, created_at, visitors(gender)')
      .gte('created_at', since)

    if (error) throw error

    const map: Record<string, number> = {}
    (data ?? []).forEach((r: any) => {
      const gender = (r.visitors && r.visitors.gender) || 'unknown'
      map[gender] = (map[gender] || 0) + 1
    })

    return Object.keys(map).map((k) => ({ name: k || 'unknown', value: map[k] }))
  } catch (err) {
    console.error('fetchVisitorsByGender error', err)
    return []
  }
}

/**
 * Top N pavilhões por número de checkpoints no período (últimos days).
 */
export async function fetchTopPavilions(days = 7, limit = 5) {
  const data = await fetchCheckpointsByPavilionDays(days)
  return data.slice(0, limit).map((r: any) => ({ name: r.name, value: r.value }))
}

/**
 * Tempo médio de permanência por visitante no período (em minutos).
 * Calcula (max(timestamp) - min(timestamp)) por visitor_id dentro do período e faz média.
 */
export async function fetchAvgStayMinutes(days = 30) {
  try {
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString()
    const { data, error } = await supabase
      .from('visitor_checkpoints')
      .select('visitor_id, timestamp')
      .gte('created_at', since)

    if (error) throw error
    const rows = data ?? []

    // group timestamps by visitor_id
    const byVisitor: Record<string, number[]> = {}
    rows.forEach((r: any) => {
      const vid = String(r.visitor_id ?? 'unknown')
      byVisitor[vid] = byVisitor[vid] || []
      const ts = r.timestamp ? new Date(r.timestamp).getTime() : new Date(r.created_at).getTime()
      byVisitor[vid].push(ts)
    })

    const durationsMinutes: number[] = []
    Object.values(byVisitor).forEach((arr) => {
      if (arr.length < 2) return
      const minT = Math.min(...arr)
      const maxT = Math.max(...arr)
      const diffMin = (maxT - minT) / (1000 * 60)
      if (diffMin >= 0) durationsMinutes.push(diffMin)
    })

    if (durationsMinutes.length === 0) return { avgMinutes: 0, samples: 0 }

    const sum = durationsMinutes.reduce((s, v) => s + v, 0)
    const avg = sum / durationsMinutes.length
    return { avgMinutes: Math.round(avg * 10) / 10, samples: durationsMinutes.length }
  } catch (err) {
    console.error('fetchAvgStayMinutes error', err)
    return { avgMinutes: 0, samples: 0 }
  }
}
