import { useEffect, useState, useContext } from "react";
import axios from "axios";
import { 
  Container, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Typography, Snackbar, Alert, 
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, InputLabel, FormControl, Input, Avatar,
  Checkbox, Tooltip  
} from "@mui/material";
import AuthContext from "../AuthContext"; // Importe o contexto de autenticação
import API_URL from "../config";
import "../css/ListagemJogadores.css"; // Importe o arquivo CSS

const ListagemJogadores = () => {
  const [jogadores, setJogadores] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [mensagem, setMensagem] = useState({ text: "", type: "success" });
  const [jogadorEditando, setJogadorEditando] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [foto, setFoto] = useState(null);
  const { isAuthenticated } = useContext(AuthContext); // Obtém o estado de autenticação
  const [selecionarTodos, setSelecionarTodos] = useState(false);

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

  const abrirModalEdicao = (jogador) => {
    setJogadorEditando({ ...jogador });
  };

  const fecharModalEdicao = () => {
    setJogadorEditando(null);
    setFoto(null);
  };

  const handleFileChange = (event) => {
    setFoto(event.target.files[0]);
  };

  const atualizarParticipacaoBrinde = async (jogador) => {
    const jogadorAtualizado = { ...jogador, participaBrinde: !jogador.participaBrinde };
  
    try {
      await axios.patch(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores/atualizarParticipacaoBrinde`, [jogadorAtualizado], {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      setJogadores(jogadores.map(j => 
        j.id === jogador.id ? jogadorAtualizado : j
      ));
    } catch (error) {
      console.error("Erro ao atualizar participação no brinde:", error);
    }
  };

  const alternarSelecaoTodos = async () => {
    const novoEstado = !selecionarTodos;
    setSelecionarTodos(novoEstado);
  
    const jogadoresAtualizados = jogadores.map(jogador => ({
      ...jogador,
      participaBrinde: novoEstado
    }));
  
    try {
      await axios.patch(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores/atualizarParticipacaoBrinde`, jogadoresAtualizados, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      setJogadores(jogadoresAtualizados);
    } catch (error) {
      console.error("Erro ao atualizar participação no brinde para todos os jogadores:", error);
    }
  };
  
  

  const salvarEdicao = async () => {
    try {
      const formData = new FormData();
      formData.append("nome", jogadorEditando.nome);
      formData.append("classificacaoId", jogadorEditando.classificacao.id);
      if (foto) {
        formData.append("foto", foto);
      }
      
      if (jogadorEditando.id) {
        await axios.put(`${API_URL}/sorteador-duplas-bt/api/v1/jogadores/${jogadorEditando.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("${API_URL}/sorteador-duplas-bt/api/v1/jogadores", formData, {
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

  const jogadoresFiltrados = jogadores.filter(jogador =>
    jogador.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    jogador.classificacao.descricao.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Lista de Jogadores
      </Typography>

      <TextField
        label="Buscar jogador ou classificação..."
        variant="outlined"
        fullWidth
        sx={{ mb: 2 }}
        onChange={(e) => setFiltro(e.target.value)}
      />

      {isAuthenticated && (
        <Button 
          variant="contained" 
          color="success" 
          sx={{ mb: 2 }}
          onClick={() => setJogadorEditando({ nome: "", classificacao: { id: "" } })}
        >
          Adicionar Jogador
        </Button>
      )}

    <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 600 }}>
      <TableHead>
        <TableRow>
          <TableCell><strong>Foto</strong></TableCell>
          <TableCell><strong>Nome</strong></TableCell>
          <TableCell><strong>Classificação</strong></TableCell>
          {isAuthenticated && (
            <>
              <TableCell align="center">
                <Tooltip title="Marcar/Desmarcar todos">
                  <Checkbox
                    checked={selecionarTodos}
                    onChange={alternarSelecaoTodos}
                  />
                </Tooltip>
                <Typography variant="body2" component="span">
                  <strong>Participa Brinde?</strong>
                </Typography>
              </TableCell>
              <TableCell align="center"><strong>Ações</strong></TableCell>
            </>
          )}
        </TableRow>
      </TableHead>
        <TableBody>
          {jogadoresFiltrados.length > 0 ? (
            jogadoresFiltrados.map(jogador => (
              <TableRow key={jogador.id}>
                <TableCell>
                  {jogador.foto && <Avatar src={`data:image/jpeg;base64,${jogador.foto}`} />}
                </TableCell>
                <TableCell>{jogador.nome}</TableCell>
                <TableCell>{jogador.classificacao.descricao}</TableCell>
                {isAuthenticated && (
                  <>
                    <TableCell align="center">
                      <Checkbox
                        checked={jogador.participaBrinde}
                        onChange={() => atualizarParticipacaoBrinde(jogador)}
                      />
                    </TableCell>
                    <TableCell align="center" className="action-buttons">
                      <Button variant="contained" color="primary" size="small" onClick={() => abrirModalEdicao(jogador)}>
                        Editar
                      </Button>
                      <Button variant="contained" color="error" size="small" onClick={() => excluirJogador(jogador.id)}>
                        Excluir
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={isAuthenticated ? 6 : 3} align="center">
                Nenhum jogador encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

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

          <FormControl fullWidth margin="dense">
            <InputLabel>Classificação</InputLabel>
            <Select
              value={jogadorEditando?.classificacao.id || ""}
              onChange={(e) => setJogadorEditando({ 
                ...jogadorEditando, 
                classificacao: classificacoes.find(c => c.id === e.target.value) 
              })}
            >
              {classificacoes.map(c => (
                <MenuItem key={c.id} value={c.id}>{c.descricao}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Input type="file" onChange={handleFileChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalEdicao} color="error">Cancelar</Button>
          <Button onClick={salvarEdicao} color="primary">Salvar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={!!mensagem.text} 
        autoHideDuration={6000} 
        onClose={() => setMensagem({ text: "", type: "success" })}
      >
        <Alert onClose={() => setMensagem({ text: "", type: "success" })} severity={mensagem.type}>
          {mensagem.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ListagemJogadores;