import { useEffect, useState, useContext } from "react";
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
  Snackbar,
  Alert,
  CircularProgress,
  Button,
  TextField,
  Box,
  Grid,
} from "@mui/material";
import AuthContext from "../AuthContext";
import API_URL from "../config";

const TabelaPage = ({ idCampeonato }) => {
  const [grupos, setGrupos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({});
  const [quantidadeGrupos, setQuantidadeGrupos] = useState("");
  const [mensagem, setMensagem] = useState({ text: "", type: "success" });
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    carregarGrupos();
  }, []);

  const carregarGrupos = async () => {
    setLoading(true);
    try {
      // Buscar grupos do campeonato
      const responseGrupos = await axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/grupos/campeonato/${idCampeonato}`);
      setGrupos(responseGrupos.data);

      // Buscar todas as estatísticas do campeonato
      const responseEstatisticas = await axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/ranking/reizinho/campeonato/${idCampeonato}`);
      const estatisticasPorGrupo = {};

      // Organizar estatísticas por grupo usando o campo idGrupo
      responseEstatisticas.data.forEach((estatistica) => {
        if (!estatisticasPorGrupo[estatistica.idGrupo]) {
          estatisticasPorGrupo[estatistica.idGrupo] = [];
        }
        estatisticasPorGrupo[estatistica.idGrupo].push(estatistica);
      });

      setEstatisticas(estatisticasPorGrupo);
    } catch (error) {
      console.error("Erro ao carregar grupos ou estatísticas:", error);
      setMensagem({ text: "Erro ao carregar grupos ou estatísticas.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const distribuirGrupos = async () => {
    if (!quantidadeGrupos || isNaN(quantidadeGrupos) || quantidadeGrupos <= 0) {
      setMensagem({ text: "Informe uma quantidade válida de grupos.", type: "warning" });
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API_URL}/sorteador-duplas-bt/api/v1/grupos/distribuir`, null, {
        params: {
          campeonatoId: idCampeonato,
          quantidadeGrupos: quantidadeGrupos,
        },
      });

      setMensagem({ text: "Grupos distribuídos com sucesso!", type: "success" });
      carregarGrupos(); // Atualiza a listagem após distribuição
    } catch (error) {
      console.error("Erro ao distribuir grupos:", error);
      setMensagem({ text: "Erro ao distribuir grupos.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const apagarGrupos = async () => {
    if (!window.confirm("Tem certeza que deseja apagar todos os grupos?")) {
      return;
    }

    setLoading(true);
    try {
      await axios.delete(`${API_URL}/sorteador-duplas-bt/api/v1/grupos/campeonato/${idCampeonato}`);
      setMensagem({ text: "Todos os grupos foram apagados com sucesso!", type: "success" });
      setGrupos([]); // Limpa os grupos após apagar
      setEstatisticas({}); // Limpa as estatísticas
    } catch (error) {
      console.error("Erro ao apagar grupos:", error);
      const mensagemErro = error.response?.data || "Erro ao apagar os grupos.";
      setMensagem({ text: mensagemErro, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Grupos Distribuídos
      </Typography>

      {isAuthenticated && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            label="Quantidade de Grupos"
            type="number"
            value={quantidadeGrupos}
            onChange={(e) => setQuantidadeGrupos(e.target.value)}
            size="small"
            sx={{ flex: "1 1 auto", minWidth: "200px" }}
          />
          <Button variant="contained" onClick={distribuirGrupos}>
            Distribuir Grupos
          </Button>
          <Button variant="outlined" color="error" onClick={apagarGrupos}>
            Apagar Grupos
          </Button>
        </Box>
      )}

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
      ) : grupos.length > 0 ? (
        <Grid container spacing={2}>
          {grupos.map((grupo, index) => (
            <Grid item xs={12} sm={6} md={4} key={grupo.id}>
              <Paper
                sx={{
                  p: 2,
                  minHeight: "300px",
                  overflow: "hidden", // Garante que o conteúdo não ultrapasse o card
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Grupo {grupo.nome || `#${index + 1}`}
                </Typography>

                {/* Contêiner com rolagem lateral */}
                <Box sx={{ overflowX: "auto" }}>
                  <Table size="small" sx={{ minWidth: "600px" }}>
                    <TableHead>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>Jogador</strong></TableCell>
                        <TableCell><strong>Class.</strong></TableCell>
                        <TableCell align="center" title="Jogos"><strong>J</strong></TableCell>
                        <TableCell align="center" title="Vitórias"><strong>V</strong></TableCell>
                        <TableCell align="center" title="Pontos"><strong>P</strong></TableCell>
                        <TableCell align="center" title="Sets Vencidos"><strong>SV</strong></TableCell>
                        <TableCell align="center" title="Sets Perdidos"><strong>SP</strong></TableCell>
                        <TableCell align="center" title="Games a Favor"><strong>GF</strong></TableCell>
                        <TableCell align="center" title="Games Contra"><strong>GC</strong></TableCell>
                        <TableCell align="center" title="Saldo de Games"><strong>SG</strong></TableCell>
                        <TableCell align="center" title="Game Average"><strong>GA</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(estatisticas[grupo.id] || [])
                        .sort((a, b) => b.pontos - a.pontos)
                        .map((estatistica, idx) => (
                          <TableRow key={estatistica.id}>
                            <TableCell>{`${idx + 1}º`}</TableCell>
                            <TableCell sx={{ wordWrap: "break-word", whiteSpace: "normal" }}>
                              {estatistica.jogador}
                            </TableCell>
                            <TableCell>{estatistica.classificacaoDescricao}</TableCell>
                            <TableCell align="center">{estatistica.jogos}</TableCell>
                            <TableCell align="center">{estatistica.vitorias}</TableCell>
                            <TableCell align="center">{estatistica.pontos}</TableCell>
                            <TableCell align="center">{estatistica.setsVencidos}</TableCell>
                            <TableCell align="center">{estatistica.setsPerdidos}</TableCell>
                            <TableCell align="center">{estatistica.gamesAFavor}</TableCell>
                            <TableCell align="center">{estatistica.gamesContra}</TableCell>
                            <TableCell align="center">{estatistica.saldoGames}</TableCell>
                            <TableCell align="center">
                              {estatistica.gameAverage ? estatistica.gameAverage.toFixed(2) : "-"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </Box>

                {/* Legenda */}
                <Typography variant="caption" sx={{ display: "block", mt: 2 }}>
                  <strong>Legenda:</strong> J = Jogos, V = Vitórias, P = Pontos, SV = Sets Vencidos, SP = Sets Perdidos, GF = Games a Favor, GC = Games Contra, SG = Saldo de Games, GA = Game Average
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body1" align="center" sx={{ mt: 4 }}>
          Nenhum grupo foi distribuído ainda.
        </Typography>
      )}

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

export default TabelaPage;
