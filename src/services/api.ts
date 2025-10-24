import { supabase } from "./supabase"

// Utilitário: data de X dias atrás
function getPastDate(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split("T")[0]
}

/**
 * Retorna estatísticas gerais de visitantes
 * - total de visitantes cadastrados
 * - visitantes registrados hoje
 */
export async function fetchVisitorsStats() {
  const today = new Date().toISOString().split("T")[0]

  const [{ count: total }, { count: todayVisitors }] = await Promise.all([
    supabase.from("visitors").select("*", { count: "exact", head: true }),
    supabase.from("visitor_checkpoints").select("*", { count: "exact", head: true }).eq("timestamp", today)
  ])

  return {
    total: total ?? 0,
    today: todayVisitors ?? 0
  }
}

/**
 * Retorna o número de visitantes por dia no intervalo definido (7, 30, 90)
 */
export async function fetchVisitorsLast7Days(days: string | number) {
  const startDate = getPastDate(Number(days))

  const { data, error } = await supabase
    .from("visitor_checkpoints")
    .select("timestamp")
    .gte("timestamp", startDate)

  if (error) {
    console.error("fetchVisitorsLast7Days error:", error)
    return { dates: [], counts: [] }
  }

  const countsByDay: Record<string, number> = {}

  data.forEach((row) => {
    const day = new Date(row.timestamp).toISOString().split("T")[0]
    countsByDay[day] = (countsByDay[day] || 0) + 1
  })

  const dates = Object.keys(countsByDay).sort()
  const counts = dates.map((d) => countsByDay[d])

  return { dates, counts }
}

/**
 * Retorna checkpoints agrupados por pavilhão
 */
export async function fetchCheckpointsByPavilion() {
  const { data, error } = await supabase
    .from("visitor_checkpoints")
    .select("pavilions(name)")

  if (error) {
    console.error("fetchCheckpointsByPavilion error:", error)
    return []
  }

  const map: Record<string, number> = {}
  for (const row of data) {
    const name = row.pavilions?.name || "Desconhecido"
    map[name] = (map[name] || 0) + 1
  }

  return Object.entries(map).map(([name, value]) => ({ name, value }))
}

/**
 * Retorna o pavilhão atual do usuário logado (com base no e-mail)
 */
export async function fetchUserPavilion(email: string | null) {
  if (!email) return null

  const { data, error } = await supabase
    .from("agent_checkpoints")
    .select("pavilions(name)")
    .eq("user_email", email)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error("fetchUserPavilion error:", error)
    return null
  }

  return data?.pavilions?.name ?? null
}

/**
 * Verifica se o usuário logado é admin
 */
export async function checkIfUserIsAdmin(email: string | null) {
  if (!email) return false
  const { data, error } = await supabase
    .from("usersSpulse")
    .select("admin")
    .eq("email", email)
    .maybeSingle()

  if (error) {
    console.error("checkIfUserIsAdmin error:", error)
    return false
  }

  return data?.admin === true
}

/**
 * Retorna o número de checkpoints realizados nas últimas 24h
 */
export async function fetchRecentCheckpoints() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const start = yesterday.toISOString()

  const { count, error } = await supabase
    .from("visitor_checkpoints")
    .select("*", { count: "exact", head: true })
    .gte("timestamp", start)

  if (error) {
    console.error("fetchRecentCheckpoints error:", error)
    return 0
  }

  return count ?? 0
}
