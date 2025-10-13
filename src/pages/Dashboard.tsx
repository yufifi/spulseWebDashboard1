import React, { useEffect, useState } from "react";
import {
  fetchVisitorsStats,
  fetchVisitorsLast7Days,
  fetchCheckpointsByPavilion,
  fetchUserPavilion,
  checkIfUserIsAdmin,
  fetchRecentCheckpoints,
} from "../services/api";

import Card from "../components/Card";
import ChartContainer from "../components/ChartContainer";

import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [stats, setStats] = useState<any>({
    totalVisitors: 0,
    todayVisitors: 0,
    currentPavilion: null,
    recentCheckpoints: 0,
    admin: false,
  });
  const [visitorsSeries, setVisitorsSeries] = useState<any[]>([]);
  const [pavilionPie, setPavilionPie] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Filtros (apenas para o gráfico de visitantes)
  const [selectedDateRange, setSelectedDateRange] = useState("7");

  useEffect(() => {
    loadInitial();
  }, []);

  useEffect(() => {
    loadVisitorsData();
  }, [selectedDateRange]);

  async function loadInitial() {
    setLoading(true);
    const email = localStorage.getItem("currentUser");
    setUserEmail(email);

    const [visitorStats, visitors7, pavilionStats, userPav, isAdmin, recentCp] = await Promise.all([
      fetchVisitorsStats(),
      fetchVisitorsLast7Days(selectedDateRange),
      fetchCheckpointsByPavilion(),
      fetchUserPavilion(email),
      checkIfUserIsAdmin(email),
      fetchRecentCheckpoints(),
    ]);

    setStats({
      totalVisitors: visitorStats.total,
      todayVisitors: visitorStats.today,
      currentPavilion: userPav,
      recentCheckpoints: recentCp,
      admin: isAdmin,
    });

    const series = visitors7.dates?.map((d: string, i: number) => ({ date: d, value: visitors7.counts[i] })) || [];
    setVisitorsSeries(series);

    setPavilionPie(pavilionStats.map((p: any, idx: number) => ({
      ...p,
      color: `hsl(${(idx * 73) % 360} 65% 55%)`
    })));

    setLastUpdated(new Date());
    setLoading(false);
  }

  async function loadVisitorsData() {
    const visitorsData = await fetchVisitorsLast7Days(selectedDateRange);
    const series = visitorsData.dates?.map((d: string, i: number) => ({ date: d, value: visitorsData.counts[i] })) || [];
    setVisitorsSeries(series);
  }

  const getChartTitle = () => {
    switch (selectedDateRange) {
      case "7": return "Visitantes - Últimos 7 dias";
      case "30": return "Visitantes - Últimos 30 dias";
      case "90": return "Visitantes - Últimos 90 dias";
      default: return "Visitantes";
    }
  };

  if (loading) return <div className="container">Carregando...</div>;

  return (
    <div className="container">
      <header className="header">
        <div>
          <div style={{ fontSize: "20px", fontWeight: "bold" }}>Dashboard do Controlador</div>
          <div style={{ color: "#666" }}>{userEmail ?? "—"}</div>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          {stats.currentPavilion && (
            <div className="card">Pavilhão atual: {stats.currentPavilion}</div>
          )}
          <button className="button" onClick={loadInitial}>Refresh</button>
        </div>
      </header>

      <main className="grid grid-3" style={{ marginBottom: "24px" }}>
        <Card title="Total Visitantes" value={stats.totalVisitors} />
        <Card title="Visitantes Hoje" value={stats.todayVisitors} />
        <Card title="Checkpoints Hoje" value={stats.recentCheckpoints} />
        <Card title="Status" subtitle={stats.admin ? "Administrador" : "Controlador"} value={stats.admin ? "Administrador" : "Controlador"} />
      </main>

      {/* Filtros (apenas para visitantes) */}
      <section className="filters" style={{ marginBottom: "16px", display: "flex", gap: "12px", alignItems: "center" }}>
        <div>
          <label style={{ display: "block", fontWeight: "bold", marginBottom: "4px" }}>Período</label>
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            style={{ padding: "6px 8px", borderRadius: "8px", border: "1px solid #ccc" }}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
        </div>
      </section>

      <section className="grid grid-2" style={{ marginBottom: "24px" }}>
        <ChartContainer title={getChartTitle()}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorsSeries}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Checkpoints por Pavilhão">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={pavilionPie} nameKey="name" outerRadius={80} label>
                {pavilionPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{
                  paddingTop: 20,
                  position: "relative",
                  bottom: 0,
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  maxWidth: "90%",
                }}
              />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      <section>
        <h3 style={{ marginBottom: "12px" }}>Status do Sistema</h3>
        <div className="grid grid-3">
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Conexão com Banco</div>
              <div style={{ color: "green" }}>Online</div>
            </div>
            <small>Supabase</small>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Dispositivo NFC</div>
              <div style={{ color: "green" }}>Disponível (mock)</div>
            </div>
            <small>Web-only mock</small>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>Última atualização</div>
              <div>{lastUpdated?.toLocaleTimeString()}</div>
            </div>
            <small>Atualize para obter dados recentes</small>
          </div>
        </div>
      </section>
    </div>
  );
}
