import { useState, useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import AuthContext, { AuthProvider } from "./AuthContext";
import Sorteio from "./pages/Sorteio";
import ListagemJogadores from "./pages/ListagemJogadores";
import Login from "./pages/Login";
import logo from "./assets/logo2.png";
import "./App.css";
import Brinde from "./pages/Brinde";

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
        <img src={logo} alt="II Maduro Open de BT" className="logo" />
        <div className="hamburger" onClick={toggleMenu}>
          <div className="line"></div>
          <div className="line"></div>
          <div className="line"></div>
        </div>
        <nav className={`nav ${menuOpen ? "active" : ""}`}>
          <Link to="/" className="nav-link">Sorteio de Duplas</Link>
          <Link to="/brinde" className="nav-link">Sorteio de Brindes</Link>
          <Link to="/listagem" className="nav-link">Lista de Jogadores</Link>
        </nav>
        <div className="auth-section">
          {user ? (
            <>
              <span>{user.username}</span>
              <button className="logout-btn" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Login</Link>
          )}
        </div>
      </header>
      <main className="main">
        <img src={logo} alt="Marca d'Água" className="watermark" />
        <Routes>
          <Route path="/" element={<Sorteio />} />
          <Route path="/brinde" element={<Brinde />} />
          <Route path="/listagem" element={<ListagemJogadores />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </main>
    </>
  );
};

export default App;
