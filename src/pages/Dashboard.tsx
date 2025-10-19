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

export default function Dashboard({ user, onLogout }) {
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

  const handleLogout = () => {
    onLogout(); // Chama a função de logout do App
  };

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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <header className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="text-xl font-bold text-gray-900">Dashboard do Controlador</div>
            <div className="text-gray-600 mt-1">{userEmail ?? "—"}</div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {stats.currentPavilion && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 text-blue-800">
                Pavilhão atual: {stats.currentPavilion}
              </div>
            )}
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
              onClick={loadInitial}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* User Info Card */}
        <div className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Conteúdo do Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-blue-100">Usuário logado:</p>
              <p className="font-semibold">{user?.email}</p>
            </div>
            <div>
              <p className="text-blue-100">ID:</p>
              <p className="font-semibold">{user?.id}</p>
            </div>
            <div>
              <p className="text-blue-100">Admin:</p>
              <p className="font-semibold">{user?.admin ? 'Sim' : 'Não'}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Grid */}
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card title="Total Visitantes" value={stats.totalVisitors} />
        <Card title="Visitantes Hoje" value={stats.todayVisitors} />
        <Card title="Checkpoints Hoje" value={stats.recentCheckpoints} />
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
          <div className="text-2xl font-bold text-gray-900">
            {stats.admin ? "Administrador" : "Controlador"}
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {stats.admin ? "Privilégios completos" : "Acesso controlador"}
          </p>
        </div>
      </main>

      {/* Filters */}
      <section className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Período</label>
            <select
              value={selectedDateRange}
              onChange={(e) => setSelectedDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </section>

      {/* Charts Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{getChartTitle()}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={visitorsSeries}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3B82F6" 
                  strokeWidth={2} 
                  dot={{ r: 3 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Checkpoints por Pavilhão</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  dataKey="value" 
                  data={pavilionPie} 
                  nameKey="name" 
                  outerRadius={80} 
                  label
                >
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
          </div>
        </div>
      </section>

      {/* System Status */}
      <section className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Status do Sistema</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-gray-700">Conexão com Banco</div>
              <div className="text-green-600 font-semibold">Online</div>
            </div>
            <small className="text-gray-500">Supabase</small>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-gray-700">Dispositivo NFC</div>
              <div className="text-green-600 font-semibold">Disponível (mock)</div>
            </div>
            <small className="text-gray-500">Web-only mock</small>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-1">
              <div className="text-sm font-medium text-gray-700">Última atualização</div>
              <div className="text-gray-900">{lastUpdated?.toLocaleTimeString()}</div>
            </div>
            <small className="text-gray-500">Atualize para obter dados recentes</small>
          </div>

          <div className="border border-gray-200 rounded-lg p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Bem-vindo, {user?.email}</span>
            </div>
            <button 
              onClick={handleLogout} 
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
            >
              Sair
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
