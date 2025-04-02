import { useState, useContext, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import AuthContext from "../AuthContext";
import "../css/Sorteio.css";
import API_URL from "../config";

const Sorteio = ({ idCampeonato }) => {
  const [duplas, setDuplas] = useState([]);
  const [visibilidade, setVisibilidade] = useState([]);
  const { user } = useContext(AuthContext);
  const apenasAdminRealizarSorteio = process.env.REACT_APP_APENAS_ADMIN_REALIZAR_SORTEIO === 'true';

  const fetchDuplas = async () => {
    try {
      const response = await axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/sorteio/${idCampeonato}/duplas`);
      setDuplas(response.data);
      setVisibilidade(new Array(response.data.length).fill(!user)); // Revela todas as duplas para usuários não logados
    } catch (error) {
      console.error("Erro ao buscar duplas sorteadas:", error);
    }
  };

  const apagarTodasDuplas = async () => {
    if (window.confirm("Tem certeza que deseja apagar todas as duplas?")) {
      try {
        await axios.delete(`${API_URL}/sorteador-duplas-bt/api/v1/sorteio/${idCampeonato}/duplas`);
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
      const response = await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/sorteio/${idCampeonato}/duplas`);
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

  const formatarTimestamp = (timestamp) => {
    return moment(timestamp).format('DD/MM/YYYY HH:mm:ss');
  };

  return (
    <div className="container">
      <h2>Sorteio de Duplas</h2>
      {duplas.length > 0 && (
        <p className="sorteio-timestamp">
          Sorteio realizado em: {formatarTimestamp(duplas[0].timestamp)}
        </p>
      )}
      {(!apenasAdminRealizarSorteio || user) && (
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
      {!user && apenasAdminRealizarSorteio && (
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
                    {dupla.inscricao1.jogador.fotoUrl && <img src={`${API_URL}/sorteador-duplas-bt/api/v1/fotos/${dupla.inscricao1.jogador.fotoUrl}`} alt={`${dupla.inscricao1.jogador.nome} Foto`} className="player-photo" />}
                    <p className="player-name">{dupla.inscricao1.jogador.nome} <span className="player-classification">({dupla.inscricao1.jogador.classificacao.descricao})</span></p>
                  </div>
                  <div className="card-player">
                    {dupla.inscricao2.jogador.fotoUrl && <img src={`${API_URL}/sorteador-duplas-bt/api/v1/fotos/${dupla.inscricao2.jogador.fotoUrl}`} alt={`${dupla.inscricao2.jogador.nome} Foto`} className="player-photo" />}
                    <p className="player-name">{dupla.inscricao2.jogador.nome} <span className="player-classification">({dupla.inscricao2.jogador.classificacao.descricao})</span></p>
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
