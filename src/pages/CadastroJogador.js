import { useState, useEffect } from "react";
import axios from "axios";
import "../css/CadastroJogador.css";
import API_URL from "../config";

const CadastroJogador = () => {
  const [nome, setNome] = useState("");
  const [classificacaoId, setClassificacaoId] = useState("");
  const [foto, setFoto] = useState(null);
  const [classificacoes, setClassificacoes] = useState([]);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/classificacoes`)
      .then(response => setClassificacoes(response.data))
      .catch(error => console.error("Erro ao buscar classificações:", error));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("nome", nome);
    formData.append("classificacaoId", classificacaoId);
    if (foto) {
      formData.append("foto", foto);
    }

    try {
      await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMensagem("Jogador cadastrado com sucesso!");
      setNome("");
      setClassificacaoId("");
      setFoto(null);
    } catch (error) {
      console.error("Erro ao cadastrar jogador:", error);
      setMensagem("Erro ao cadastrar jogador.");
    }
  };

  return (
    <div className="container">
      <h2>Cadastro de Jogador</h2>
      <form onSubmit={handleSubmit} className="form-cadastro">
        <input
          type="text"
          placeholder="Nome do jogador"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
          className="input-text"
        />
        <select
          value={classificacaoId}
          onChange={(e) => setClassificacaoId(e.target.value)}
          required
          className="input-select"
        >
          <option value="">Selecione a Classificação</option>
          {classificacoes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.descricao}
            </option>
          ))}
        </select>
        <input
          type="file"
          onChange={(e) => setFoto(e.target.files[0])}
          className="input-file"
        />
        <button type="submit" className="btn-cadastrar">Cadastrar</button>
      </form>
      {mensagem && <p className="mensagem">{mensagem}</p>}
    </div>
  );
};

export default CadastroJogador;
