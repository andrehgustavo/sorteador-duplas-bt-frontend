import { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Snackbar,
  Alert,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
} from "@mui/material";
import API_URL from "../config";
import "../css/PartidasGrupoPage.css"; // Importe o arquivo CSS

const PartidasGrupoPage = ({ idCampeonato }) => {
  const [grupos, setGrupos] = useState([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState("");
  const [partidas, setPartidas] = useState([]);
  const [mensagem, setMensagem] = useState({ text: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const [modalEdicaoAberto, setModalEdicaoAberto] = useState(false);
  const [partidaEditando, setPartidaEditando] = useState(null);

  useEffect(() => {
    carregarGrupos();
  }, []);

  useEffect(() => {
    if (grupoSelecionado === "") {
      console.log("Carregando todas as partidas inicialmente...");
      carregarPartidas("");
    }
  }, [grupoSelecionado]);

  const carregarGrupos = async () => {
    try {
      const response = await axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/grupos/campeonato/${idCampeonato}`);
      setGrupos(response.data);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      setMensagem({ text: "Erro ao carregar grupos.", type: "error" });
    }
  };

  const carregarPartidas = async (grupoId) => {
    setLoading(true);
    try {
      const url = grupoId
        ? `${API_URL}/sorteador-duplas-bt/api/v1/partidas/grupo/${grupoId}`
        : `${API_URL}/sorteador-duplas-bt/api/v1/partidas/reizinho/campeonato/${idCampeonato}`; // URL para todos os grupos
      console.log("Carregando partidas com URL:", url); // Log para verificar a URL
      const response = await axios.get(url);
      console.log("Partidas carregadas:", response.data); // Log para verificar as partidas carregadas
      setPartidas(response.data);
    } catch (error) {
      console.error("Erro ao carregar partidas:", error);
      setMensagem({ text: "Erro ao carregar partidas.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const criarTodasPartidas = async () => {
    try {
      await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/partidas/reizinho/campeonato/${idCampeonato}/gerar`);
      setMensagem({ text: "Partidas criadas com sucesso!", type: "success" });
      carregarPartidas(grupoSelecionado);
    } catch (error) {
      console.error("Erro ao criar partidas:", error);
      setMensagem({ text: "Erro ao criar partidas.", type: "error" });
    }
  };

  const apagarTodasPartidas = async () => {
    try {
      await axios.delete(`${API_URL}/sorteador-duplas-bt/api/v1/partidas/reizinho/campeonato/${idCampeonato}`);
      setMensagem({ text: "Todas as partidas foram apagadas com sucesso!", type: "success" });
      carregarPartidas(grupoSelecionado);
    } catch (error) {
      console.error("Erro ao apagar todas as partidas:", error);
      setMensagem({ text: "Erro ao apagar todas as partidas.", type: "error" });
    }
  };

  const salvarResultado = async (partidaId, sets, status) => {
    try {
      // Envia os sets e o status no corpo da requisição
      await axios.patch(`${API_URL}/sorteador-duplas-bt/api/v1/partidas/${partidaId}`, {
        sets,
        status: "FINALIZADA",
      });
      setMensagem({ text: "Resultado salvo com sucesso!", type: "success" });
      carregarPartidas(grupoSelecionado); // Atualiza a lista de partidas
    } catch (error) {
      console.error("Erro ao salvar resultado:", error);
      const mensagemErro = error.response?.data || "Erro ao salvar resultado.";
      setMensagem({ text: mensagemErro, type: "error" });
    }
  };


  const abrirModalEdicao = (partida) => {
    setPartidaEditando(partida);
    setModalEdicaoAberto(true);
  };

  const fecharModalEdicao = () => {
    setPartidaEditando(null);
    setModalEdicaoAberto(false);
  };

  const salvarEdicao = async () => {
    try {
      // Envia os sets e o status da partida em edição
      await axios.patch(`${API_URL}/sorteador-duplas-bt/api/v1/partidas/${partidaEditando.id}`, {
        sets: partidaEditando.sets,
        status: partidaEditando.status,
      });
      setMensagem({ text: "Resultado atualizado com sucesso!", type: "success" });
      carregarPartidas(grupoSelecionado);
      fecharModalEdicao();
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
      const mensagemErro = error.response?.data || "Erro ao salvar edição.";
      setMensagem({ text: mensagemErro, type: "error" });
    }
  };

  const handleGameChange = (partidaId, setId, field, value) => {
    setPartidas((prevPartidas) =>
      prevPartidas.map((partida) =>
        partida.id === partidaId
          ? {
              ...partida,
              sets: partida.sets.map((set) =>
                set.id === setId ? { ...set, [field]: value } : set
              ),
            }
          : partida
      )
    );
  };

  const handleGameChangeEdicao = (setId, field, value) => {
    setPartidaEditando((prev) => ({
      ...prev,
      sets: prev.sets.map((set) =>
        set.id === setId ? { ...set, [field]: value } : set
      ),
    }));
  };

  const getVencedorClass = (gamesDupla1, gamesDupla2, dupla) => {
    if (gamesDupla1 > gamesDupla2 && dupla === "dupla1") return "vencedor";
    if (gamesDupla2 > gamesDupla1 && dupla === "dupla2") return "vencedor";
    return "";
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Partidas do Grupo
      </Typography>

      {/* Botões para criar e apagar todas as partidas */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Button variant="contained" color="primary" onClick={criarTodasPartidas}>
          Criar Todas as Partidas
        </Button>
        <Button variant="contained" color="error" onClick={apagarTodasPartidas}>
          Apagar Todas as Partidas
        </Button>
      </Box>

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Selecione um Grupo</InputLabel>
        <Select
          value={grupoSelecionado}
          onChange={(e) => {
            setGrupoSelecionado(e.target.value);
            carregarPartidas(e.target.value);
          }}
        >
          <MenuItem value="">Todos os Grupos</MenuItem> {/* Opção para todos os grupos */}
          {grupos.map((grupo) => (
            <MenuItem key={grupo.id} value={grupo.id}>
              {grupo.nome}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {grupoSelecionado && grupoSelecionado !== "" && (
        <Typography variant="h6" align="center" gutterBottom>
          Grupo: {grupos.find((g) => g.id === grupoSelecionado)?.nome}
        </Typography>
      )}

      {loading ? (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Carregando partidas...
        </Typography>
      ) : grupoSelecionado === "" ? (
        // Exibir todas as partidas agrupadas por grupo
        grupos.map((grupo) => {
          const partidasDoGrupo = partidas.filter((partida) => partida.grupoId === grupo.id);
          console.log(`Grupo: ${grupo.nome}, Partidas:`, partidasDoGrupo); // Log para verificar as partidas de cada grupo
          if (partidasDoGrupo.length === 0) return null; // Não renderizar grupos sem partidas
          return (
            <Paper key={grupo.id} sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Grupo: {grupo.nome}
              </Typography>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Dupla 1</strong></TableCell>
                    <TableCell align="center"><strong>Games</strong></TableCell>
                    <TableCell align="center"><strong>vs</strong></TableCell>
                    <TableCell align="center"><strong>Games</strong></TableCell>
                    <TableCell><strong>Dupla 2</strong></TableCell>
                    <TableCell align="center"><strong>Ações</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {partidasDoGrupo.map((partida) => (
                    <TableRow key={partida.id}>
                      <TableCell className={getVencedorClass(partida.sets[0]?.gamesDupla1, partida.sets[0]?.gamesDupla2, "dupla1")}>
                        {partida.jogador1Dupla1} / {partida.jogador2Dupla1}
                      </TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={partida.sets[0]?.gamesDupla1 || 0}
                          onChange={(e) =>
                            handleGameChange(partida.id, partida.sets[0]?.id, "gamesDupla1", e.target.value)
                          }
                          size="small"
                          inputProps={{ min: 0 }}
                          disabled={partida.status !== "AGENDADA"}
                        />
                      </TableCell>
                      <TableCell align="center">vs</TableCell>
                      <TableCell align="center">
                        <TextField
                          type="number"
                          value={partida.sets[0]?.gamesDupla2 || 0}
                          onChange={(e) =>
                            handleGameChange(partida.id, partida.sets[0]?.id, "gamesDupla2", e.target.value)
                          }
                          size="small"
                          inputProps={{ min: 0 }}
                          disabled={partida.status !== "AGENDADA"}
                        />
                      </TableCell>
                      <TableCell className={getVencedorClass(partida.sets[0]?.gamesDupla1, partida.sets[0]?.gamesDupla2, "dupla2")}>
                        {partida.jogador1Dupla2} / {partida.jogador2Dupla2}
                      </TableCell>
                      <TableCell align="center">
                        {partida.status === "AGENDADA" ? (
                          <Button
                            variant="contained"
                            color="success"
                            size="small"
                            onClick={() => salvarResultado(partida.id, partida.sets, partida.status)}
                          >
                            Salvar
                          </Button>
                        ) : partida.status === "FINALIZADA" ? (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => abrirModalEdicao(partida)}
                          >
                            Editar
                          </Button>
                        ) : null}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          );
        })
      ) : (
        // Exibir apenas as partidas do grupo selecionado
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Grupo: {grupos.find((g) => g.id === grupoSelecionado)?.nome}
          </Typography>
          {console.log(`Grupo Selecionado: ${grupoSelecionado}, Partidas:`, partidas)} {/* Log para verificar o grupo selecionado e suas partidas */}
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Dupla 1</strong></TableCell>
                <TableCell align="center"><strong>Games</strong></TableCell>
                <TableCell align="center"><strong>vs</strong></TableCell>
                <TableCell align="center"><strong>Games</strong></TableCell>
                <TableCell><strong>Dupla 2</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {partidas.map((partida) => (
                <TableRow key={partida.id}>
                  <TableCell className={getVencedorClass(partida.sets[0]?.gamesDupla1, partida.sets[0]?.gamesDupla2, "dupla1")}>
                    {partida.jogador1Dupla1} / {partida.jogador2Dupla1}
                  </TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      value={partida.sets[0]?.gamesDupla1 || 0}
                      onChange={(e) =>
                        handleGameChange(partida.id, partida.sets[0]?.id, "gamesDupla1", e.target.value)
                      }
                      size="small"
                      inputProps={{ min: 0 }}
                      disabled={partida.status !== "AGENDADA"}
                    />
                  </TableCell>
                  <TableCell align="center">vs</TableCell>
                  <TableCell align="center">
                    <TextField
                      type="number"
                      value={partida.sets[0]?.gamesDupla2 || 0}
                      onChange={(e) =>
                        handleGameChange(partida.id, partida.sets[0]?.id, "gamesDupla2", e.target.value)
                      }
                      size="small"
                      inputProps={{ min: 0 }}
                      disabled={partida.status !== "AGENDADA"}
                    />
                  </TableCell>
                  <TableCell className={getVencedorClass(partida.sets[0]?.gamesDupla1, partida.sets[0]?.gamesDupla2, "dupla2")}>
                    {partida.jogador1Dupla2} / {partida.jogador2Dupla2}
                  </TableCell>
                  <TableCell align="center">
                    {partida.status === "AGENDADA" ? (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => salvarResultado(partida.id, partida.sets, partida.status)}
                      >
                        Salvar
                      </Button>
                    ) : partida.status === "FINALIZADA" ? (
                      <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={() => abrirModalEdicao(partida)}
                      >
                        Editar
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Modal de Edição */}
      <Dialog open={modalEdicaoAberto} onClose={fecharModalEdicao}>
        <DialogTitle>Editar Resultado</DialogTitle>
        <DialogContent>
          {partidaEditando && (
            <>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Dupla 1</strong></TableCell>
                    <TableCell align="center"><strong>Games</strong></TableCell>
                    <TableCell align="center"><strong>vs</strong></TableCell>
                    <TableCell align="center"><strong>Games</strong></TableCell>
                    <TableCell><strong>Dupla 2</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {partidaEditando.jogador1Dupla1} / {partidaEditando.jogador2Dupla1}
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={partidaEditando.sets[0]?.gamesDupla1 || 0}
                        onChange={(e) =>
                          handleGameChangeEdicao(partidaEditando.sets[0]?.id, "gamesDupla1", e.target.value)
                        }
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell align="center">vs</TableCell>
                    <TableCell align="center">
                      <TextField
                        type="number"
                        value={partidaEditando.sets[0]?.gamesDupla2 || 0}
                        onChange={(e) =>
                          handleGameChangeEdicao(partidaEditando.sets[0]?.id, "gamesDupla2", e.target.value)
                        }
                        size="small"
                        inputProps={{ min: 0 }}
                      />
                    </TableCell>
                    <TableCell>
                      {partidaEditando.jogador1Dupla2} / {partidaEditando.jogador2Dupla2}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Status da Partida</InputLabel>
                <Select
                  value={partidaEditando.status}
                  onChange={(e) =>
                    setPartidaEditando((prev) => ({ ...prev, status: e.target.value }))
                  }
                >
                  <MenuItem value="AGENDADA">Agendada</MenuItem>
                  <MenuItem value="FINALIZADA">Finalizada</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fecharModalEdicao} color="primary">
            Cancelar
          </Button>
          <Button onClick={salvarEdicao} color="primary">
            Salvar
          </Button>
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

export default PartidasGrupoPage;