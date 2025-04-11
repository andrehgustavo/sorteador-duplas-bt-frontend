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
import TabelaPage from "./pages/TabelaPage";
import PartidasGrupoPage from "./pages/PartidasGrupoPage";
import ConfiguracaoPage from "./pages/ConfiguracaoPage";
import PaginaEntrada from "./pages/PaginaEntrada";
import SettingsIcon from "@mui/icons-material/Settings"; // Importar o ícone de engrenagem

const PrivateRoute = ({ children, role }) => {
  const { user } = useContext(AuthContext);

  // Exibe um indicador de carregamento enquanto o estado do usuário está sendo inicializado
  if (user === null) {
    return <div>Carregando...</div>;
  }

  // Redireciona para a página de login se o usuário não estiver autenticado
  if (!user) {
    return <Navigate to="/sorteador-duplas-bt-frontend/login" />;
  }

  // Verifica se o papel do usuário corresponde ao papel necessário
  if (role && user.role !== role) {
    return (
      <div>
        <h1>Acesso Negado</h1>
        <p>Você não tem permissão para acessar esta página.</p>
        <Link to="/sorteador-duplas-bt-frontend/">Voltar para a página inicial</Link>
      </div>
    );
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
    navigate("/sorteador-duplas-bt-frontend/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <>
      <header className="header">
        <Link to="/sorteador-duplas-bt-frontend" className="nav-link">
          <img src={logo} alt={nomeCampeonatoAtivo} className="logo" />
        </Link>
        <div className="hamburger" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <nav className={`nav ${menuOpen ? "active" : ""}`}>
          <Link to="/sorteador-duplas-bt-frontend/duplas" className="nav-link">Sorteio de Duplas</Link>
          <Link to="/sorteador-duplas-bt-frontend/brinde" className="nav-link">Sorteio de Brindes</Link>
          <Link to="/sorteador-duplas-bt-frontend/listagem" className="nav-link">Jogadores</Link>
          <Link to="/sorteador-duplas-bt-frontend/listagem-inscricao" className="nav-link">Inscrições</Link>
          <Link to="/sorteador-duplas-bt-frontend/grupos" className="nav-link">Tabela</Link>
          <Link to="/sorteador-duplas-bt-frontend/partidas-grupos" className="nav-link">Partidas</Link>
        </nav>
        <div className="auth-section">
          {user ? (
            <>
              <span>{user.username}</span>
              {user.role === "ADMIN" && (
                <Link to="/sorteador-duplas-bt-frontend/configuracoes" className="nav-link">
                  <SettingsIcon style={{ marginLeft: "10px", cursor: "pointer" }} />
                </Link>
              )}
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
          <Route path="/" element={<Navigate to="/sorteador-duplas-bt-frontend" />} />
          <Route path="/sorteador-duplas-bt-frontend" element={<PaginaEntrada />} />
          <Route path="/sorteador-duplas-bt-frontend/duplas" element={<Sorteio idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/brinde" element={<Brinde idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/listagem" element={<ListagemJogadores idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/listagem-inscricao" element={<ListagemInscricao idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/grupos" element={<TabelaPage idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/partidas-grupos" element={<PartidasGrupoPage idCampeonato={idCampeonatoAtivo} />} />
          <Route path="/sorteador-duplas-bt-frontend/login" element={<Login />} />
          <Route
            path="/sorteador-duplas-bt-frontend/configuracoes"
            element={
              <PrivateRoute role="ADMIN">
                <ConfiguracaoPage idCampeonato={idCampeonatoAtivo} />
              </PrivateRoute>
            }
          />
        </Routes>
      </main>
    </>
  );
};

export default App;