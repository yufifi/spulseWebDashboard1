import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Dashboard from "./pages/Dashboard";
import "./styles/global.css";
import Login from "./pages/Login";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário está logado no localStorage
    const checkAuth = () => {
      const userData = localStorage.getItem('userSpulse');
      if (userData) {
        setUser(JSON.parse(userData));
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('userSpulse', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('userSpulse');
  };

  // Componente para rotas protegidas
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" />;
  };

  // Componente para rotas públicas (quando já está logado)
  const PublicRoute = ({ children }) => {
    return !user ? children : <Navigate to="/dashboard" />;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Carregando...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Rota pública - Login */}
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login onLogin={handleLogin} />
            </PublicRoute>
          } 
        />
        
        {/* Rota protegida - Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } 
        />
        
        {/* Rota raiz - redireciona para login ou dashboard */}
        <Route 
          path="/" 
          element={
            user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
          } 
        />
        
        {/* Rota fallback para páginas não encontradas */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;