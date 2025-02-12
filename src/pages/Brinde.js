import { useState, useContext, useEffect } from "react";
import axios from "axios";
import AuthContext from "../AuthContext";
import "../css/Brinde.css"; // Importando o novo arquivo CSS

const Brinde = () => {
  const [brinde, setBrinde] = useState(null);
  const [visibilidade, setVisibilidade] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchBrinde = async () => {
    try {
        const response = await axios.get("http://localhost:8084/sorteador-duplas-bt/api/v1/sorteio/ganhador-brinde");
      setBrinde(response.data);
      setVisibilidade(!user);
    } catch (error) {
      console.error("Erro ao buscar brinde sorteado:", error);
    }
  };

  useEffect(() => {
    fetchBrinde();
  }, []);

  const sortearBrinde = async () => {
    try {
      const response = await axios.get("http://localhost:8084/sorteador-duplas-bt/api/v1/sorteio/sortear-brinde");
      setBrinde(response.data);
      setBrinde(response.data);
      setVisibilidade(false);
      iniciarContagemRegressiva();
    } catch (error) {
      console.error("Erro ao sortear brinde:", error);
    }
  };

  const verificarNovoBrinde = async () => {
    await fetchBrinde();
  };

  const iniciarContagemRegressiva = () => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev === 1) {
          clearInterval(interval);
          setVisibilidade(true);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="brinde-container ">
      <h2>Sorteio de Brinde</h2>
      {user && (
        <>
          <button onClick={sortearBrinde} className="brinde-btn-sortear">
            Sortear Brinde
          </button>
        </>
      )}
      {!user && (
        <button onClick={verificarNovoBrinde} className="brinde-btn-verificar">
          Verificar Novo Brinde
        </button>
      )}
      <div className="brinde-cards-container">
        {brinde ? (
          <div className={`brinde-card ${visibilidade ? "revealed" : ""}`}>
            <h3 className="brinde-card-title">Ganhador</h3>
            {countdown !== null && <div className="brinde-countdown">{countdown}</div>}
            {visibilidade && (
              <div className="brinde-card-brinde">
                {brinde.foto && <img src={`data:image/jpeg;base64,${brinde.foto}`} alt={`${brinde.nome} Foto`} className="brinde-photo" />}
                <p className="brinde-name">{brinde.nome}</p>
              </div>
            )}
          </div>
        ) : (
          <p>Aguardando sorteio...</p>
        )}
      </div>
    </div>
  );
};

export default Brinde;
