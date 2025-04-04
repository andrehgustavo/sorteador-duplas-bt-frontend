import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Snackbar, Alert,
  Avatar, Checkbox, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem
} from "@mui/material";
import AuthContext from "../AuthContext";
import API_URL from "../config";
import "../css/ListagemJogadores.css";

const ListagemJogadores = ({ idCampeonato }) => {
  const [jogadores, setJogadores] = useState([]);
  const [mensagem, setMensagem] = useState({ text: "", type: "success" });
  const [filtro, setFiltro] = useState("");
  const [jogadorEditando, setJogadorEditando] = useState(null);
  const [jogadorInscricao, setJogadorInscricao] = useState(null);
  const [modalBateladaAberto, setModalBateladaAberto] = useState(false);
  const [classificacoes, setClassificacoes] = useState([]);
  const { isAuthenticated } = useContext(AuthContext);
  const [selecionarTodos, setSelecionarTodos] = useState(false);
  const [foto, setFoto] = useState(null);
  

  useEffect(() => {
    carregarJogadores();
    carregarClassificacoes();
  }, []);

  const carregarJogadores = () => {
    axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores`)
      .then(response => setJogadores(response.data))
      .catch(error => console.error("Erro ao carregar jogadores:", error));
  };

  const carregarClassificacoes = () => {
    axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/classificacoes`)
      .then(response => setClassificacoes(response.data))
      .catch(error => console.error("Erro ao carregar classificações:", error));
  };

  const alternarSelecaoTodos = () => {
    const novoEstado = !selecionarTodos;
    setSelecionarTodos(novoEstado);
    setJogadores(jogadores.map(jogador => ({ ...jogador, selecionado: novoEstado })));
  };

  const alternarSelecaoJogador = (id) => {
    setJogadores(jogadores.map(jogador =>
      jogador.id === id ? { ...jogador, selecionado: !jogador.selecionado } : jogador
    ));
  };

  const abrirModalEdicao = (jogador) => {
    setJogadorEditando({ ...jogador });
  };

  const abrirModalInscricaoIndividual = (jogador) => {
    setJogadorInscricao({ ...jogador });
  };
  
  const fecharModalInscricaoIndividual = () => {
    setJogadorInscricao(null);
  };
  

  const fecharModalEdicao = () => {
    setJogadorEditando(null);
    setFoto(null);
  };

  const abrirModalBatelada = () => {
    setModalBateladaAberto(true);
  };

  const fecharModalBatelada = () => {
    setModalBateladaAberto(false);
  };

  const handleFileChange = (event) => {
    setFoto(event.target.files[0]);
  };

  const salvarEdicao = async () => {
    try {
      const formData = new FormData();
      formData.append("nome", jogadorEditando.nome);
      if (foto) {
        formData.append("foto", foto);
      }
      
      if (jogadorEditando.id) {
        await axios.put(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores/${jogadorEditando.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      
      setMensagem({ text: "Jogador salvo com sucesso!", type: "success" });
      carregarJogadores();
      fecharModalEdicao();
    } catch (error) {
      console.error("Erro ao salvar jogador:", error);
      setMensagem({ text: "Erro ao salvar jogador.", type: "error" });
    }
  };

  const inscreverBatelada = async () => {
    const jogadoresSelecionados = jogadores
      .filter(jogador => jogador.selecionado)
      .map(jogador => ({
        jogadorId: jogador.id,
        classificacaoId: jogador.classificacao
      }));
      console.log("Payload enviado:", JSON.stringify(jogadoresSelecionados, null, 2));
    try {
      const response = await axios.patch(
        `${API_URL}/sorteador-duplas-bt/api/v1/inscricoes/campeonato/${idCampeonato}`,
        jogadoresSelecionados,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
  
      const { inscricoesSucesso, erros } = response.data;
  
      const mensagensSucesso = inscricoesSucesso.map(i => `✅ ${i.nomeJogador} inscrito com sucesso!`);
      const mensagensErro = erros.map(erro => `❌ ${erro.nomeJogador}: ${erro.mensagem}`);
  
      const todasMensagens = [...mensagensSucesso, ...mensagensErro].join("\n");
  
      setMensagem({
        text: todasMensagens,
        type: erros.length > 0 ? "warning" : "success"
      });
    } catch (error) {
      setMensagem({
        text: error.response?.data?.message || "Erro ao realizar inscrições.",
        type: "error"
      });
    }
  
    fecharModalBatelada();
  };

  const inscreverIndividual = async () => {
    try {
      const formData = new FormData();
      formData.append("jogadorId", jogadorInscricao.id);
      formData.append("classificacaoId", jogadorInscricao.classificacao);
      
      await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/inscricoes/campeonato/${idCampeonato}`, formData,  {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMensagem({ text: "Jogador inscrito com sucesso!", type: "success" });
    } catch (error) {
      setMensagem({ text: error.response.data.message, type: "error" });
    }
    fecharModalInscricaoIndividual();
  };

  const jogadoresFiltrados = jogadores.filter(jogador =>
    jogador.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  const excluirJogador = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir este jogador?")) {
      try {
        await axios.delete(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores/${id}`);
        setMensagem({ text: "Jogador excluído com sucesso!", type: "success" });
        carregarJogadores();
      } catch (error) {
        console.error("Erro ao excluir jogador:", error);
        setMensagem({ text: "Erro ao excluir jogador.", type: "error" });
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Lista de Jogadores
      </Typography>

      <TextField
        label="Buscar jogador..."
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {isAuthenticated && (
        <>
          <Button
            variant="contained"
            color="primary"
            sx={{ mb: 2, mr: 2 }}
            onClick={() => abrirModalBatelada()}
          >
            Inscrever em Batelada
          </Button>
          <Button
            variant="contained"
            color="success"
            sx={{ mb: 2 }}
            onClick={() => setJogadorEditando({ nome: "" })}
          >
            Adicionar Jogador
          </Button>
        </>
      )}

      <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 600 }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">
                <Tooltip title="Marcar/Desmarcar todos">
                  <Checkbox
                    checked={selecionarTodos}
                    onChange={alternarSelecaoTodos}
                  />
                </Tooltip>
              </TableCell>
              <TableCell><strong>Foto</strong></TableCell>
              <TableCell><strong>Nome</strong></TableCell>
              {isAuthenticated && (
                <>
                  <TableCell align="center"><strong>Ações</strong></TableCell>
                </>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {jogadoresFiltrados.length > 0 ? (
              jogadoresFiltrados.map(jogador => (
                <TableRow key={jogador.id}>
                  <TableCell align="center">
                    <Checkbox
                      checked={jogador.selecionado || false}
                      onChange={() => alternarSelecaoJogador(jogador.id)}
                    />
                  </TableCell>
                  <TableCell>
                    {jogador.fotoUrl && <Avatar src={`${API_URL}/sorteador-duplas-bt/api/v1/fotos/${jogador.fotoUrl}`} />}
                  </TableCell>
                  <TableCell>{jogador.nome}</TableCell>
                  {isAuthenticated && (
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => abrirModalEdicao(jogador)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => excluirJogador(jogador.id)}
                      >
                        Excluir
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => abrirModalInscricaoIndividual(jogador)}
                      >
                        Inscrever
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={isAuthenticated ? 4 : 3} align="center">
                  Nenhum jogador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* MODAL DE EDIÇÃO DE JOGADOR */}
      <Dialog open={!!jogadorEditando} onClose={fecharModalEdicao}>
        <DialogTitle>{jogadorEditando?.id ? "Editar Jogador" : "Adicionar Jogador"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="dense"
            value={jogadorEditando?.nome || ""}
            onChange={(e) => setJogadorEditando({ ...jogadorEditando, nome: e.target.value })}
          />
          <Typography variant="body2" sx={{ mt: 2, mb: 1 }}>Foto:</Typography>
          <input
            type="file"
            onChange={handleFileChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalEdicao} color="error">Cancelar</Button>
          <Button onClick={salvarEdicao} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>
     
      {/* MODAL DE INSCRIÇÃO DE JOGADOR INDIVIDUAL */}
      <Dialog open={!!jogadorInscricao} onClose={fecharModalInscricaoIndividual}>
        <DialogTitle>Inscrição Individual</DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Jogador: {jogadorInscricao?.nome || ""}
          </Typography>
          <Select
            fullWidth
            value={jogadorInscricao?.classificacao || ""}
            onChange={(e) => setJogadorInscricao({ ...jogadorInscricao, classificacao: e.target.value })}
          >
            {classificacoes.map((classificacao) => (
              <MenuItem key={classificacao.id} value={classificacao.id}>
                {classificacao.descricao}
              </MenuItem>
            ))}
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalInscricaoIndividual} color="error">Cancelar</Button>
          <Button onClick={inscreverIndividual} color="primary">Confirmar Inscrição</Button>
        </DialogActions>
      </Dialog>


      {/* Implementação do modal de inscrição em batelada */}
      <Dialog open={modalBateladaAberto} onClose={fecharModalBatelada}>
        <DialogTitle>Inscrever Jogadores em Batelada</DialogTitle>
        <DialogContent>
          {jogadores.filter(jogador => jogador.selecionado).map(jogador => (
            <div key={jogador.id} style={{ marginBottom: "16px" }}>
              <Typography variant="body1" gutterBottom>{jogador.nome}</Typography>
              <Select
                fullWidth
                value={jogador.classificacao || ""}
                onChange={(e) =>
                  setJogadores(jogadores.map(j =>
                    j.id === jogador.id ? { ...j, classificacao: e.target.value } : j
                  ))
                }
              >
                {classificacoes.map((classificacao) => (
                  <MenuItem key={classificacao.id} value={classificacao.id}>
                    {classificacao.descricao}
                  </MenuItem>
                ))}
              </Select>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalBatelada} color="error">Cancelar</Button>
          <Button onClick={inscreverBatelada} color="primary">Inscrever</Button>
        </DialogActions>
      </Dialog>
      <Snackbar 
        open={!!mensagem.text} 
        autoHideDuration={6000} 
        onClose={() => setMensagem({ text: "", type: "success" })}
      >
        <Alert 
          onClose={() => setMensagem({ text: "", type: "success" })} 
          severity={mensagem.type}
          sx={{ whiteSpace: 'pre-line' }} // habilita quebra de linha
        >
          {mensagem.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListagemJogadores;