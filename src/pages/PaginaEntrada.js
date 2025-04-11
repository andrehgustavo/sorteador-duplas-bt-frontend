import React from "react";
import { Link } from "react-router-dom";
import { Container, Typography, Button, Box } from "@mui/material";

const PaginaEntrada = () => {
  return (
    <Container maxWidth="sm" sx={{ textAlign: "center", mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Bem-vindo ao Sistema de Sorteio
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Escolha uma das opções abaixo para começar.
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Button
          variant="contained"
          color="primary"
          component={Link}
          to="/sorteador-duplas-bt-frontend/duplas"
        >
          Sorteio de Duplas
        </Button>
        <Button
          variant="contained"
          color="secondary"
          component={Link}
          to="/sorteador-duplas-bt-frontend/brinde"
        >
          Sorteio de Brindes
        </Button>
        <Button
          variant="outlined"
          color="primary"
          component={Link}
          to="/sorteador-duplas-bt-frontend/listagem"
        >
          Listagem de Jogadores
        </Button>
      </Box>
    </Container>
  );
};

export default PaginaEntrada;