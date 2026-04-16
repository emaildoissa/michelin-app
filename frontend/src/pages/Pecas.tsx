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
    <Box sx={{ flexGrow: 1, py: 2 }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'stretch', sm: 'center' }, 
        gap: 3, 
        mb: 5 
      }}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
            Estoque
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Controle de peças, preços e níveis de reposição.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
          sx={{ 
            px: 4, 
            py: 1.5, 
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '0.9rem'
          }}
        >
          Nova Peça
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome, código ou marca..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'text.secondary', opacity: 0.5 }} />
              </InputAdornment>
            ),
            sx: { 
              borderRadius: 3, 
              bgcolor: 'background.paper',
              '& fieldset': { borderColor: 'divider' },
              '&:hover fieldset': { borderColor: 'primary.main' }
            }
          }}
        />
      </Box>

      <Paper sx={{ overflow: 'hidden', borderRadius: 4 }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }}>
            <TableHead>
              <TableRow>
                <TableCell width="80">Ref</TableCell>
                <TableCell>Código</TableCell>
                <TableCell>Item / Marca</TableCell>
                <TableCell align="center">Qtd</TableCell>
                <TableCell align="right">Preço Unitário</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pecas.map((p: any) => (
                <TableRow key={p.id} hover>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600, fontFamily: 'monospace', fontSize: '0.75rem' }}>
                    #{p.numero_sequencial || String(p.id).substring(0, 5).toUpperCase()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 800, letterSpacing: '0.02em' }}>{p.codigo}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.nome}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{p.marca}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={p.quantidade} 
                      size="small" 
                      sx={{ 
                        fontWeight: 900, 
                        bgcolor: p.quantidade < 5 ? 'error.light' : 'success.light',
                        color: p.quantidade < 5 ? 'error.main' : 'success.main',
                        borderRadius: 1.5,
                        minWidth: 40
                      }} 
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}>
                      R$ {Number(p.preco).toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                      <IconButton
                        onClick={() => handleOpen(p)}
                        size="small"
                        sx={{ color: 'primary.main', bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        onClick={() => handleDeletar(p.id)}
                        size="small"
                        sx={{ color: 'error.main', bgcolor: 'rgba(239,68,68,0.05)', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal de Cadastro/Edição */}
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)} 
        fullWidth 
        maxWidth="sm"
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          {selectedPeca?.id ? 'Editar Peça' : 'Nova Peça'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
          <TextField 
            label="Nome da Peça" 
            fullWidth 
            value={selectedPeca?.nome} 
            onChange={(e) => setSelectedPeca({ ...selectedPeca, nome: e.target.value })} 
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Código" 
              fullWidth 
              value={selectedPeca?.codigo} 
              onChange={(e) => setSelectedPeca({ ...selectedPeca, codigo: e.target.value })} 
            />
            <TextField 
              label="Marca" 
              fullWidth 
              value={selectedPeca?.marca} 
              onChange={(e) => setSelectedPeca({ ...selectedPeca, marca: e.target.value })} 
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField 
              label="Preço Unitário" 
              type="number" 
              fullWidth 
              value={selectedPeca?.preco} 
              onChange={(e) => setSelectedPeca({ ...selectedPeca, preco: e.target.value })} 
              InputProps={{ startAdornment: <InputAdornment position="start">R$</InputAdornment> }}
            />
            <TextField 
              label="Quantidade em Estoque" 
              type="number" 
              fullWidth 
              value={selectedPeca?.quantidade} 
              onChange={(e) => setSelectedPeca({ ...selectedPeca, quantidade: e.target.value })} 
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={() => setOpen(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button variant="contained" disableElevation onClick={handleSave} sx={{ px: 4, fontWeight: 800 }}>
            {selectedPeca?.id ? 'Salvar Alterações' : 'Adicionar Peça'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Pecas;