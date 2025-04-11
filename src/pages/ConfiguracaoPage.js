import React, { useState, useEffect, useContext } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Box,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import AuthContext from "../AuthContext";
import API_URL from "../config";

const ConfiguracaoPage = () => {
  const { user } = useContext(AuthContext);
  const [campeonatos, setCampeonatos] = useState([]);
  const [campeonatoSelecionado, setCampeonatoSelecionado] = useState(null);
  const [novoCampeonato, setNovoCampeonato] = useState(false);
  const [modalClassificacoesAberto, setModalClassificacoesAberto] = useState(false);
  const [classificacoes, setClassificacoes] = useState([]);
  const [classificacaoEditando, setClassificacaoEditando] = useState(null);
  const [mensagem, setMensagem] = useState({ text: "", type: "success" });

  const STATUS_CAMPEONATO = ["ABERTO", "EM_ANDAMENTO", "ENCERRADO"];
  const FORMATO_CAMPEONATO = ["TRADICIONAL", "REIZINHO"];

  useEffect(() => {
    carregarCampeonatos();
  }, []);

  const carregarCampeonatos = async () => {
    try {
      const response = await fetch(`${API_URL}/sorteador-duplas-bt/api/v1/campeonatos`);
      const data = await response.json();
      setCampeonatos(data);
      const ativo = data.find((c) => c.ativo); // Seleciona o campeonato ativo
      setCampeonatoSelecionado(ativo || data[0]); // Seleciona o ativo ou o primeiro
      if (ativo || data[0]) {
        carregarClassificacoes((ativo || data[0]).id);
      }
    } catch (error) {
      console.error("Erro ao carregar campeonatos:", error);
      setMensagem({ text: "Erro ao carregar campeonatos.", type: "error" });
    }
  };

  const carregarClassificacoes = async (idCampeonato) => {
    try {
      const response = await fetch(`${API_URL}/sorteador-duplas-bt/api/v1/classificacoes/campeonato/${idCampeonato}`);
      const data = await response.json();
      setClassificacoes(data);
    } catch (error) {
      console.error("Erro ao carregar classificações:", error);
      setMensagem({ text: "Erro ao carregar classificações.", type: "error" });
    }
  };

  const salvarCampeonato = async () => {
    try {
      const method = novoCampeonato ? "POST" : "PUT";
      const url = novoCampeonato
        ? `${API_URL}/sorteador-duplas-bt/api/v1/campeonatos`
        : `${API_URL}/sorteador-duplas-bt/api/v1/campeonatos/${campeonatoSelecionado.id}`;
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campeonatoSelecionado),
      });
      setMensagem({ text: "Campeonato salvo com sucesso!", type: "success" });
      carregarCampeonatos();
    } catch (error) {
      console.error("Erro ao salvar campeonato:", error);
      setMensagem({ text: "Erro ao salvar campeonato.", type: "error" });
    }
  };

  const criarNovoCampeonato = () => {
    setCampeonatoSelecionado({
      nome: "",
      data: "",
      local: "",
      status: "ABERTO",
      ativo: false,
      formato: "TRADICIONAL",
      quantidadeMaximaSets: 1,
      quantidadeMaximaGames: 6,
    });
    setNovoCampeonato(true);
  };

  const ativarCampeonato = async () => {
    if (!window.confirm("Tem certeza que deseja ativar este campeonato? Isso desativará o campeonato atualmente ativo.")) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/sorteador-duplas-bt/api/v1/campeonatos/${campeonatoSelecionado.id}/ativar`, {
        method: "PUT",
      });

      if (response.ok) {
          window.location.reload(); // Força o reload da página após sucesso
          setMensagem({ text: "Campeonato ativado com sucesso!", type: "success" });
      } else {
        const errorData = await response.json();
        console.error("Erro ao ativar campeonato:", errorData);
        setMensagem({ text: errorData.message || "Erro ao ativar campeonato.", type: "error" });
      }
    } catch (error) {
      console.error("Erro ao ativar campeonato:", error);
      setMensagem({ text: "Erro ao ativar campeonato.", type: "error" });
    }
  };

  const salvarClassificacao = async () => {
    try {
      if (classificacaoEditando.id) {
        await fetch(`${API_URL}/sorteador-duplas-bt/api/v1/classificacoes/${classificacaoEditando.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(classificacaoEditando),
        });
      } else {
        await fetch(`${API_URL}/sorteador-duplas-bt/api/v1/classificacoes`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...classificacaoEditando, campeonatoId: campeonatoSelecionado.id }),
        });
      }
      setMensagem({ text: "Classificação salva com sucesso!", type: "success" });
      carregarClassificacoes(campeonatoSelecionado.id);
      setClassificacaoEditando(null);
    } catch (error) {
      console.error("Erro ao salvar classificação:", error);
      setMensagem({ text: "Erro ao salvar classificação.", type: "error" });
    }
  };

  const excluirClassificacao = async (id) => {
    if (!window.confirm("Tem certeza que deseja excluir esta classificação?")) return;
    try {
      await fetch(`${API_URL}/sorteador-duplas-bt/api/v1/classificacoes/${id}`, { method: "DELETE" });
      setMensagem({ text: "Classificação excluída com sucesso!", type: "success" });
      carregarClassificacoes(campeonatoSelecionado.id);
    } catch (error) {
      console.error("Erro ao excluir classificação:", error);
      setMensagem({ text: "Erro ao excluir classificação.", type: "error" });
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Configurações do Campeonato
      </Typography>

      {/* Seleção de Campeonato e Botões */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
        <FormControl fullWidth sx={{ mr: 2 }}>
          <InputLabel>Selecione o Campeonato</InputLabel>
          <Select
            value={campeonatoSelecionado?.id || ""}
            onChange={(e) => {
              const campeonato = campeonatos.find((c) => c.id === e.target.value);
              setCampeonatoSelecionado(campeonato);
              carregarClassificacoes(campeonato.id);
            }}
          >
            {campeonatos.map((campeonato) => (
              <MenuItem key={campeonato.id} value={campeonato.id}>
                {campeonato.nome} {campeonato.ativo ? "(Ativo)" : ""}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button variant="contained" color="primary" onClick={criarNovoCampeonato} sx={{ mr: 2 }}>
          Criar Novo Campeonato
        </Button>
        <Button variant="contained" color="secondary" onClick={ativarCampeonato}>
          Ativar Campeonato
        </Button>
      </Box>

      {/* Formulário de Campeonato */}
      {campeonatoSelecionado && (
        <Box sx={{ mb: 4 }}>
          <TextField
            label="Nome do Campeonato"
            fullWidth
            value={campeonatoSelecionado.nome || ""}
            onChange={(e) => setCampeonatoSelecionado({ ...campeonatoSelecionado, nome: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Data do Campeonato"
            type="date"
            fullWidth
            value={campeonatoSelecionado.data || ""}
            onChange={(e) => setCampeonatoSelecionado({ ...campeonatoSelecionado, data: e.target.value })}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Local"
            fullWidth
            value={campeonatoSelecionado.local || ""}
            onChange={(e) => setCampeonatoSelecionado({ ...campeonatoSelecionado, local: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={campeonatoSelecionado.status || ""}
              onChange={(e) => setCampeonatoSelecionado({ ...campeonatoSelecionado, status: e.target.value })}
            >
              {STATUS_CAMPEONATO.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Formato</InputLabel>
            <Select
              value={campeonatoSelecionado.formato || ""}
              onChange={(e) => setCampeonatoSelecionado({ ...campeonatoSelecionado, formato: e.target.value })}
            >
              {FORMATO_CAMPEONATO.map((formato) => (
                <MenuItem key={formato} value={formato}>
                  {formato}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Quantidade Máxima de Sets"
            type="number"
            fullWidth
            value={campeonatoSelecionado.quantidadeMaximaSets || ""}
            onChange={(e) => setCampeonatoSelecionado({ ...campeonatoSelecionado, quantidadeMaximaSets: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Quantidade Máxima de Games"
            type="number"
            fullWidth
            value={campeonatoSelecionado.quantidadeMaximaGames || ""}
            onChange={(e) => setCampeonatoSelecionado({ ...campeonatoSelecionado, quantidadeMaximaGames: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" color="primary" onClick={salvarCampeonato}>
            Salvar Campeonato
          </Button>
        </Box>
      )}

      {/* Modal de Classificações */}
      <Button variant="contained" color="warning" onClick={() => setModalClassificacoesAberto(true)} sx={{ mb: 4 }}>
        Gerenciar Classificações
      </Button>
      <Dialog open={modalClassificacoesAberto} onClose={() => setModalClassificacoesAberto(false)} fullWidth maxWidth="sm">
        <DialogTitle>Classificações</DialogTitle>
        <DialogContent>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Ordem</strong></TableCell>
                <TableCell><strong>Descrição</strong></TableCell>
                <TableCell align="center"><strong>Ações</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {classificacoes.map((classificacao, index) => (
                <TableRow key={classificacao.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{classificacao.descricao}</TableCell>
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      color="primary"
                      size="small"
                      onClick={() => setClassificacaoEditando(classificacao)}
                      sx={{ mr: 1 }}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      size="small"
                      onClick={() => excluirClassificacao(classificacao.id)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button
            variant="contained"
            color="primary"
            onClick={() => setClassificacaoEditando({ descricao: "", ordem: classificacoes.length + 1 })}
            sx={{ mt: 2 }}
          >
            Adicionar Classificação
          </Button>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalClassificacoesAberto(false)} color="error">
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de Edição de Classificação */}
      <Dialog open={!!classificacaoEditando} onClose={() => setClassificacaoEditando(null)} fullWidth maxWidth="sm">
        <DialogTitle>{classificacaoEditando?.id ? "Editar Classificação" : "Adicionar Classificação"}</DialogTitle>
        <DialogContent>
          <TextField
            label="Descrição"
            fullWidth
            value={classificacaoEditando?.descricao || ""}
            onChange={(e) => setClassificacaoEditando({ ...classificacaoEditando, descricao: e.target.value })}
            sx={{ mt: 2 }}
          />
          <TextField
            label="Ordem"
            type="number"
            fullWidth
            value={classificacaoEditando?.ordem || ""}
            onChange={(e) => setClassificacaoEditando({ ...classificacaoEditando, ordem: e.target.value })}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setClassificacaoEditando(null)} color="error">
            Cancelar
          </Button>
          <Button onClick={salvarClassificacao} color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

export default ConfiguracaoPage;