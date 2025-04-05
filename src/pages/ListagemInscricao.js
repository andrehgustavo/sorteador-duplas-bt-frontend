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

const ListagemInscricao = ({idCampeonato}) => {
  const [inscricoes, setInscricoes] = useState([]);
  const [classificacoes, setClassificacoes] = useState([]);
  const [mensagem, setMensagem] = useState({ text: "", type: "success" });
  const [inscricaoEditando, setInscricaoEditando] = useState(null);
  const [filtro, setFiltro] = useState("");
  const [foto, setFoto] = useState(null);
  const { isAuthenticated } = useContext(AuthContext); // Obtém o estado de autenticação
  const [selecionarTodos, setSelecionarTodos] = useState(false);

  useEffect(() => {
    carregarInscricoes();
    carregarClassificacoes();
  }, []);

  const carregarInscricoes = () => {
    axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/inscricoes/campeonato/${idCampeonato}`)
      .then(response => setInscricoes(response.data))
      .catch(error => console.error("Erro ao carregar inscrições:", error));
  };

  const carregarClassificacoes = () => {
    axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/classificacoes/campeonato/${idCampeonato}`)
      .then(response => setClassificacoes(response.data))
      .catch(error => console.error("Erro ao carregar classificações:", error));
  };

  const excluirInscricao = async (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta inscrição?")) {
      try {
        await axios.delete(`${API_URL}/sorteador-duplas-bt/api/v1/inscricoes/${id}`);
        setMensagem({ text: "Inscrição excluída com sucesso!", type: "success" });
        carregarInscricoes();
      } catch (error) {
        console.error("Erro ao excluir inscrição:", error);
        setMensagem({ text: "Erro ao excluir inscrição.", type: "error" });
      }
    }
  };

  const abrirModalEdicao = (inscricao) => {
    setInscricaoEditando({ ...inscricao });
  };

  const fecharModalEdicao = () => {
    setInscricaoEditando(null);
    setFoto(null);
  };

  const handleFileChange = (event) => {
    setFoto(event.target.files[0]);
  };

  const atualizarParticipacaoBrinde = async (inscricao) => {
    const inscricaoAtualizada = { ...inscricao, participaBrinde: !inscricao.participaBrinde };
  
    try {
      await axios.patch(`${API_URL}/sorteador-duplas-bt/api/v1/inscricoes/atualizarParticipacaoBrinde`, [inscricaoAtualizada], {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      setInscricoes(inscricoes.map(i => 
        i.id === inscricao.id ? inscricaoAtualizada : i
      ));
    } catch (error) {
      console.error("Erro ao atualizar participação no brinde:", error);
    }
  };

  const alternarSelecaoTodos = async () => {
    const novoEstado = !selecionarTodos;
    setSelecionarTodos(novoEstado);
  
    const inscricoesAtualizadas = inscricoes.map(inscricao => ({
      ...inscricao,
      participaBrinde: novoEstado
    }));
  
    try {
      await axios.patch(`${API_URL}/sorteador-duplas-bt/api/v1/inscricoes/atualizarParticipacaoBrinde`, inscricoesAtualizadas, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      setInscricoes(inscricoesAtualizadas);
    } catch (error) {
      console.error("Erro ao atualizar participação no brinde para todos os inscricoes:", error);
    }
  };
  
  

  const salvarEdicao = async () => {
    try {
      const formData = new FormData();
      formData.append("nome", inscricaoEditando.nome);
      formData.append("classificacaoId", inscricaoEditando.classificacao.id);
      if (foto) {
        formData.append("foto", foto);
      }
      
      if (inscricaoEditando.id) {
        await axios.put(`${API_URL}/sorteador-duplas-bt/api/v1/inscricoes/${inscricaoEditando.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/inscricoes`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      
      setMensagem({ text: "Inscrição salvo com sucesso!", type: "success" });
      carregarInscricoes();
      fecharModalEdicao();
    } catch (error) {
      console.error("Erro ao salvar inscrição:", error);
      setMensagem({ text: "Erro ao salvar inscrição.", type: "error" });
    }
  };

  const inscricoesFiltradas = inscricoes.filter(inscricao =>
    inscricao.jogador.nome.toLowerCase().includes(filtro.toLowerCase()) ||
    inscricao.classificacao.descricao.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Lista de Inscrições
      </Typography>

      <TextField
        label="Buscar inscrição ou classificação..."
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
          onClick={() => setInscricaoEditando({ nome: "", classificacao: { id: "" } })}
        >
          Adicionar Inscrição
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
          {inscricoesFiltradas.length > 0 ? (
            inscricoesFiltradas.map(inscricao => (
              <TableRow key={inscricao.id}>
                <TableCell>
                  {inscricao.jogador.fotoUrl && <Avatar src={`${API_URL}/sorteador-duplas-bt/api/v1/fotos/${inscricao.jogador.fotoUrl}`} />}
                </TableCell>
                <TableCell>{inscricao.jogador.nome}</TableCell>
                <TableCell>{inscricao.classificacao.descricao}</TableCell>
                {isAuthenticated && (
                  <>
                    <TableCell align="center">
                      <Checkbox
                        checked={inscricao.participaBrinde}
                        onChange={() => atualizarParticipacaoBrinde(inscricao)}
                      />
                    </TableCell>
                    <TableCell align="center" className="action-buttons">
                      <Button variant="contained" color="primary" size="small" onClick={() => abrirModalEdicao(inscricao)}>
                        Editar
                      </Button>
                      <Button variant="contained" color="error" size="small" onClick={() => excluirInscricao(inscricao.id)}>
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
                Nenhuma inscrição encontrada.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>

      <Dialog open={!!inscricaoEditando} onClose={fecharModalEdicao}>
        <DialogTitle>{inscricaoEditando?.id ? "Editar Inscrição" : "Adicionar Inscrição"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Nome"
            fullWidth
            margin="dense"
            value={inscricaoEditando?.jogador.nome || ""}
            onChange={(e) => setInscricaoEditando({ ...inscricaoEditando, nome: e.target.value })}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel>Classificação</InputLabel>
            <Select
              value={inscricaoEditando?.classificacao.id || ""}
              onChange={(e) => setInscricaoEditando({ 
                ...inscricaoEditando, 
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

export default ListagemInscricao;