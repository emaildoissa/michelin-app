import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Paper, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, IconButton, Tooltip, Button, Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import {
  Search as SearchIcon, Warning as WarningIcon, Edit as EditIcon,
  Delete as DeleteIcon, Add as AddIcon
} from '@mui/icons-material';
import api from '../services/api';

const Pecas: React.FC = () => {
  const [pecas, setPecas] = useState([]);
  const [busca, setBusca] = useState('');
  const [open, setOpen] = useState(false);
  const [selectedPeca, setSelectedPeca] = useState<any>(null);

  // Carregar dados
  const fetchData = async (term = '') => {
    try {
      const { data } = await api.get(`/pecas?busca=${term}`);
      setPecas(data);
    } catch (err) { console.error("Erro:", err); }
  };

  useEffect(() => {
    const handler = setTimeout(() => fetchData(busca), 300);
    return () => clearTimeout(handler);
  }, [busca]);

  // Ações
  const handleOpen = (peca: any = null) => {
    setSelectedPeca(peca || { nome: '', codigo: '', marca: '', preco: 0, quantidade: 0 });
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (selectedPeca.id) {
        await api.put(`/pecas/${selectedPeca.id}`, selectedPeca);
      } else {
        await api.post('/pecas', selectedPeca);
      }
      setOpen(false);
      fetchData(busca);
    } catch (err) { alert("Erro ao salvar"); }
  };

  const handleDeletar = async (id: string) => {
    if (window.confirm("Excluir esta peça?")) {
      await api.delete(`/pecas/${id}`);
      fetchData(busca);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 900 }}>Estoque</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
          Nova Peça
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
        />
      </Paper>

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Item</TableCell>
              <TableCell align="center">Qtd</TableCell>
              <TableCell align="right">Preço</TableCell>
              <TableCell align="center">Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pecas.map((p: any) => (
              <TableRow key={p.id} hover>
                {/* Exibe apenas os 5 primeiros caracteres do UUID */}
                <TableCell sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                  {p.id.substring(0, 5)}
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{p.codigo}</TableCell>
                <TableCell>{p.nome} <br /> <small>{p.marca}</small></TableCell>
                <TableCell align="center">{p.quantidade}</TableCell>
                <TableCell align="right">R$ {Number(p.preco).toFixed(2)}</TableCell>
                <TableCell align="center">
                  <IconButton size="small" onClick={() => handleOpen(p)} color="primary"><EditIcon fontSize="inherit" /></IconButton>
                  <IconButton size="small" onClick={() => handleDeletar(p.id)} color="error"><DeleteIcon fontSize="inherit" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{selectedPeca?.id ? 'Editar Peça' : 'Nova Peça'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <TextField label="Nome" fullWidth value={selectedPeca?.nome} onChange={(e) => setSelectedPeca({ ...selectedPeca, nome: e.target.value })} />
          <TextField label="Código" fullWidth value={selectedPeca?.codigo} onChange={(e) => setSelectedPeca({ ...selectedPeca, codigo: e.target.value })} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField label="Preço" type="number" fullWidth value={selectedPeca?.preco} onChange={(e) => setSelectedPeca({ ...selectedPeca, preco: e.target.value })} />
            <TextField label="Estoque" type="number" fullWidth value={selectedPeca?.quantidade} onChange={(e) => setSelectedPeca({ ...selectedPeca, quantidade: e.target.value })} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleSave}>Salvar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pecas;