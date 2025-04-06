import { useEffect, useState, useContext } from "react";
import axios from "axios";
import {
  Container, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody,
  Snackbar, Alert, CircularProgress, Button, TextField, Box
} from "@mui/material";
import AuthContext from "../AuthContext";
import API_URL from "../config";

const GruposDistribuidosPage = ({ idCampeonato }) => {
  const [grupos, setGrupos] = useState([]);
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
      const response = await axios.get(`${API_URL}/sorteador-duplas-bt/api/v1/grupos/campeonato/${idCampeonato}`);
      setGrupos(response.data);
    } catch (error) {
      console.error("Erro ao carregar grupos:", error);
      setMensagem({ text: "Erro ao carregar grupos.", type: "error" });
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
          quantidadeGrupos: quantidadeGrupos
        }
      });

      setMensagem({ text: "Grupos distribuídos com sucesso!", type: "success" });
      carregarGrupos(); // atualiza a listagem após distribuição
    } catch (error) {
      console.error("Erro ao distribuir grupos:", error);
      setMensagem({ text: "Erro ao distribuir grupos.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Grupos Distribuídos
      </Typography>

      {isAuthenticated && (
        <Box sx={{ display: "flex", gap: 2, mb: 3, alignItems: "center" }}>
          <TextField
            label="Quantidade de Grupos"
            type="number"
            value={quantidadeGrupos}
            onChange={(e) => setQuantidadeGrupos(e.target.value)}
            size="small"
          />
          <Button variant="contained" onClick={distribuirGrupos}>
            Distribuir Grupos
          </Button>
        </Box>
      )}

      {loading ? (
        <CircularProgress sx={{ display: "block", mx: "auto", mt: 4 }} />
      ) : (
        grupos.length > 0 ? (
          grupos.map((grupo, index) => (
            <Paper key={grupo.id} sx={{ mb: 4, p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Grupo {grupo.nome || `#${index + 1}`}
              </Typography>
              <Table size="small" sx={{ tableLayout: "fixed", width: "100%" }}>
                <TableHead>
                  <TableRow>
                    <TableCell align="left"><strong>Jogador</strong></TableCell>
                    <TableCell align="left"><strong>Classificação</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {grupo.inscricoes.map(inscricao => (
                    <TableRow key={inscricao.id}>
                      <TableCell align="left">{inscricao.nomeJogador}</TableCell>
                      <TableCell align="left">{inscricao.classificacaoDescricao}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          ))
        ) : (
          <Typography variant="body1" align="center" sx={{ mt: 4 }}>
            Nenhum grupo foi distribuído ainda.
          </Typography>
        )
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

export default GruposDistribuidosPage;
