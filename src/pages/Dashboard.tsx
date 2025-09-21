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
import QuickActionButton from "../components/QuickActionButton";

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

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    const email = localStorage.getItem("currentUser");
    setUserEmail(email);

    const [visitorStats, visitors7, pavilionStats, userPav, isAdmin, recentCp] = await Promise.all([
      fetchVisitorsStats(),
      fetchVisitorsLast7Days(),
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
          <button className="button" onClick={load}>Refresh</button>
        </div>
      </header>

      <main className="grid grid-3" style={{ marginBottom: "24px" }}>
        <Card title="Total Visitantes" value={stats.totalVisitors} />
        <Card title="Visitantes Hoje" value={stats.todayVisitors} />
        <Card title="Checkpoints Hoje" value={stats.recentCheckpoints} />
        <Card title="Status" subtitle={stats.admin ? "Administrador" : "Controlador"} value={stats.admin ? "Administrador" : "Controlador"} />
      </main>

      <section className="grid grid-2" style={{ marginBottom: "24px" }}>
        <ChartContainer title="Visitantes últimos 7 dias">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorsSeries}>
              <XAxis dataKey="date" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title="Checkpoints por Pavilhão (7 dias)">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie dataKey="value" data={pavilionPie} nameKey="name" outerRadius={80} label>
                {pavilionPie.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </section>

      <section style={{ marginBottom: "24px" }}>
        <h3 style={{ marginBottom: "12px" }}>Ações Rápidas</h3>
        <div className="grid grid-2">
          <QuickActionButton label="Gerenciar Visitantes" subtitle="Ver e editar todos os visitantes" onClick={() => alert("Navegar: Gerenciar Visitantes")} />
          <QuickActionButton label="Registrar Checkpoints" subtitle="Marcar passagem de visitantes" onClick={() => alert("Navegar: Registrar Checkpoints")} />
          {stats.currentPavilion?.toString() === "1" && (
            <QuickActionButton label="Novo Visitante" subtitle="Cadastrar novo visitante" onClick={() => alert("Navegar: Registrar Visitante")} />
          )}
          {stats.admin && (
            <QuickActionButton label="Gerenciar Usuários" subtitle="Cadastrar novos controladores" onClick={() => alert("Navegar: Cadastro")} />
          )}
          <QuickActionButton label="Gerenciar NFC" subtitle="Ler e gravar pulseiras NFC" onClick={() => alert("Navegar: NFC")} />
        </div>
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
