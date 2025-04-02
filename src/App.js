import { useState, useContext, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import AuthContext, { AuthProvider } from "./AuthContext";
import Sorteio from "./pages/Sorteio";
import ListagemJogadores from "./pages/ListagemJogadores";
import ListagemInscricao from "./pages/ListagemInscricao";
import Login from "./pages/Login";
import logo from "./assets/logo2.png";
import "./App.css";
import Brinde from "./pages/Brinde";
import API_URL from "./config";

const PrivateRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </Router>
  );
}

const MainApp = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [idCampeonatoAtivo, setIdCampeonatoAtivo] = useState(null); // Guarda o ID do campeonato ativo
  const [nomeCampeonatoAtivo, setNomeCampeonatoAtivo] = useState(null); // Guarda o NOME do campeonato ativo

  // Função para buscar o ID do campeonato ativo ao carregar
  useEffect(() => {
    const fetchCampeonatoAtivo = async () => {
      try {
        const response = await fetch(`${API_URL}/sorteador-duplas-bt/api/v1/campeonatos/ativo`);
        if (response.ok) {
          const campeonatoAtivo = await response.json();
          setIdCampeonatoAtivo(campeonatoAtivo.id);
          setNomeCampeonatoAtivo(campeonatoAtivo.nome);
        } else {
          console.error('Erro ao buscar campeonato ativo:', response.statusText);
        }
      } catch (error) {
        console.error('Erro ao conectar à API:', error);
      }
    };

    fetchCampeonatoAtivo();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="header">
        <Link to="/sorteador-duplas-bt-frontend" className="nav-link">
          <img src={logo} alt="II Maduro Open de BT" className="logo" />
        </Link>
        <div className="hamburger" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <nav className={`nav ${menuOpen ? "active" : ""}`}>
          <Link to="/sorteador-duplas-bt-frontend/duplas" className="nav-link">Sorteio de Duplas</Link>
          <Link to="/sorteador-duplas-bt-frontend/brinde" className="nav-link">Sorteio de Brindes</Link>
          <Link to="/sorteador-duplas-bt-frontend/listagem" className="nav-link">Lista de Jogadores</Link>
          <Link to="/sorteador-duplas-bt-frontend/listagem-inscricao" className="nav-link">Lista de Inscrições</Link>
        </nav>
        <div className="auth-section">
          {user ? (
            <>
              <span>{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <Link to="/sorteador-duplas-bt-frontend/login" className="nav-link">Login</Link>
          )}
        </div>
      </header>
      <main className="main">
        <img src={logo} alt="Marca d' água" className="watermark" />
        <h1>{nomeCampeonatoAtivo || "Carregando..."}</h1>
        <Routes>
          <Route path="/sorteador-duplas-bt-frontend/duplas" element={<Sorteio idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/brinde" element={<Brinde idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/listagem" element={<ListagemJogadores idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/listagem-inscricao" element={<ListagemInscricao idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/login" element={<Login />} />
        </Routes>
      </main>
    </>
  );
};

export default App;