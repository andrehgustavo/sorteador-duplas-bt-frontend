import { useState, useContext, useEffect } from "react";
import axios from "axios";
import AuthContext from "../AuthContext";
import "../css/Sorteio.css";
import API_URL from "../config";

const Sorteio = () => {
  const [duplas, setDuplas] = useState([]);
  const [visibilidade, setVisibilidade] = useState([]);
  const { user } = useContext(AuthContext);

  const fetchDuplas = async () => {
    try {
      const response = await axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/sorteio/duplas`);
      setDuplas(response.data);
      setVisibilidade(new Array(response.data.length).fill(!user)); // Revela todas as duplas para usuários não logados
    } catch (error) {
      console.error("Erro ao buscar duplas sorteadas:", error);
    }
  };

  const apagarTodasDuplas = async () => {
    if (window.confirm("Tem certeza que deseja apagar todas as duplas?")) {
      try {
        await axios.delete(`${API_URL}/sorteador-duplas-bt/api/v1/sorteio/duplas`);
        setDuplas([]);
        setVisibilidade([]);
        console.log("Todas as duplas foram apagadas com sucesso.");
      } catch (error) {
        console.error("Erro ao apagar todas as duplas:", error);
      }
    }
  };

  useEffect(() => {
    fetchDuplas(); // Busca inicial
  }, []);

  const realizarSorteio = async () => {
    try {
      const response = await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/sorteio/duplas`);
      setDuplas(response.data);
      setVisibilidade(new Array(response.data.length).fill(false));
    } catch (error) {
      console.error("Erro ao sortear duplas:", error);
    }
  };

  const verificarNovoSorteio = async () => {
    await fetchDuplas();
  };

  const revelarDupla = (index) => {
    const novaVisibilidade = [...visibilidade];
    novaVisibilidade[index] = true;
    setVisibilidade(novaVisibilidade);
  };

  const revelarTodas = () => {
    setVisibilidade(new Array(duplas.length).fill(true));
  };

  return (
    <div className="container">
      <h2>Sorteio de Duplas</h2>
      {user && (
        <>
          <button onClick={realizarSorteio} className="btn-sortear">
            Sortear Todos
          </button>
          <button onClick={revelarTodas} className="btn-revelar-todas">
            Revelar Todas as Duplas
          </button>
          <button onClick={apagarTodasDuplas} className="btn-apagar-todas">
            Apagar Todas as Duplas
          </button>
        </>
      )}
      {!user && (
        <button onClick={verificarNovoSorteio} className="btn-verificar">
          Verificar Novos Sorteios
        </button>
      )}
      <div className="cards-container">
        {duplas.length > 0 ? (
          duplas.map((dupla, index) => (
            <div className={`card ${visibilidade[index] ? 'revealed' : ''}`} key={index} onClick={() => revelarDupla(index)}>
              <h3 className="card-title">Dupla {index + 1}</h3>
              {!visibilidade[index] && <button className="btn-revelar">Revelar Dupla {index + 1}</button>}
              {visibilidade[index] && (
                <div className="card-dupla">
                  <div className="card-player">
                    {dupla.jogador1.foto && <img src={`data:image/jpeg;base64,${dupla.jogador1.foto}`} alt={`${dupla.jogador1.nome} Foto`} className="player-photo" />}
                    <p className="player-name">{dupla.jogador1.nome} <span className="player-classification">({dupla.jogador1.classificacao.descricao})</span></p>
                  </div>
                  <div className="card-player">
                    {dupla.jogador2.foto && <img src={`data:image/jpeg;base64,${dupla.jogador2.foto}`} alt={`${dupla.jogador2.nome} Foto`} className="player-photo" />}
                    <p className="player-name">{dupla.jogador2.nome} <span className="player-classification">({dupla.jogador2.classificacao.descricao})</span></p>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Aguardando sorteio...</p>
        )}
      </div>
    </div>
  );
  
};

export default Sorteio;
