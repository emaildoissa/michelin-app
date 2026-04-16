import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  TableSortLabel,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Veiculo {
  id: number;
  numero_sequencial?: number;
  clienteId: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
}

interface Cliente {
  id: string;
  nome: string;
}

interface VeiculoFormData {
  clienteId: string;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
}

const veiculoVazio: VeiculoFormData = {
  clienteId: '',
  marca: '',
  modelo: '',
  ano: new Date().getFullYear(),
  placa: ''
};

const Veiculos = () => {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formData, setFormData] = useState<VeiculoFormData>(veiculoVazio);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [veiculoParaDeletar, setVeiculoParaDeletar] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [veiculosRes, clientesRes] = await Promise.all([
        api.get('/veiculos'),
        api.get('/clientes')
      ]);
      setVeiculos(veiculosRes.data);
      setClientes(clientesRes.data);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar dados',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (veiculo?: Veiculo) => {
    if (veiculo) {
      setFormData({
        clienteId: veiculo.clienteId,
        marca: veiculo.marca,
        modelo: veiculo.modelo,
        ano: veiculo.ano,
        placa: veiculo.placa
      });
      setEditingId(veiculo.id);
    } else {
      setFormData(veiculoVazio);
      setEditingId(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData(veiculoVazio);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'ano' ? Number(value) : value
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      clienteId: e.target.value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/veiculos/${editingId}`, formData);
        setSnackbar({
          open: true,
          message: 'Veículo atualizado com sucesso',
          severity: 'success'
        });
      } else {
        await api.post('/veiculos', formData);
        setSnackbar({
          open: true,
          message: 'Veículo adicionado com sucesso',
          severity: 'success'
        });
      }
      handleCloseForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar veículo',
        severity: 'error'
      });
    }
  };

  const handleOpenDelete = (id: number) => {
    setVeiculoParaDeletar(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setVeiculoParaDeletar(null);
  };

  const handleDelete = async () => {
    if (veiculoParaDeletar) {
      try {
        await api.delete(`/veiculos/${veiculoParaDeletar}`);
        setSnackbar({
          open: true,
          message: 'Veículo excluído com sucesso',
          severity: 'success'
        });
        fetchData();
      } catch (error) {
        console.error('Erro ao excluir veículo:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir veículo',
          severity: 'error'
        });
      }
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const getClienteNome = (clienteId: string) => {
    const cliente = clientes.find(c => c.id === clienteId);
    return cliente ? cliente.nome : 'Cliente não encontrado';
  };

  const [veiculosFiltrados, setVeiculosFiltrados] = useState<Veiculo[]>([]);
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof Veiculo | '';
    direcao: 'asc' | 'desc';
  }>({ campo: '', direcao: 'asc' });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (veiculos.length > 0) {
      setVeiculosFiltrados(veiculos);
    }
  }, [veiculos]);

  const handleFiltroChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFiltro = event.target.value.toLowerCase();
    setFiltro(valorFiltro);

    if (valorFiltro === '') {
      setVeiculosFiltrados(veiculos);
    } else {
      const filtrados = veiculos.filter(veiculo => {
        const clienteNome = getClienteNome(veiculo.clienteId).toLowerCase();
        return (
          veiculo.marca.toLowerCase().includes(valorFiltro) ||
          veiculo.modelo.toLowerCase().includes(valorFiltro) ||
          veiculo.placa.toLowerCase().includes(valorFiltro) ||
          clienteNome.includes(valorFiltro) ||
          veiculo.ano.toString().includes(valorFiltro)
        );
      });
      setVeiculosFiltrados(filtrados);
    }
  };

  const handleOrdenacaoChange = (campo: keyof Veiculo) => {
    const ehMesmoCampo = ordenacao.campo === campo;
    const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';

    setOrdenacao({
      campo,
      direcao: novaDirecao
    });

    const veiculosOrdenados = [...veiculosFiltrados].sort((a, b) => {
      if (campo === 'clienteId') {
        const nomeClienteA = getClienteNome(a.clienteId).toLowerCase();
        const nomeClienteB = getClienteNome(b.clienteId).toLowerCase();
        return novaDirecao === 'asc'
          ? nomeClienteA.localeCompare(nomeClienteB)
          : nomeClienteB.localeCompare(nomeClienteA);
      }

      const aValue = a[campo];
      const bValue = b[campo];

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return novaDirecao === 'asc'
          ? aValue.localeCompare(bValue, 'pt-BR')
          : bValue.localeCompare(aValue, 'pt-BR');
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return novaDirecao === 'asc' ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    setVeiculosFiltrados(veiculosOrdenados);
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
            Veículos
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Controle de frota e especificações técnicas.
          </Typography>
        </Box>
        <Button
          variant="contained"
          disableElevation
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontWeight: 800,
            fontSize: '0.9rem'
          }}
        >
          Novo Veículo
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por marca, modelo, placa ou cliente..."
          value={filtro}
          onChange={handleFiltroChange}
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

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress thickness={5} size={40} />
        </Box>
      ) : (
        <Paper sx={{ overflow: 'hidden', borderRadius: 4 }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell width="80">ID</TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={ordenacao.campo === 'clienteId'}
                      direction={ordenacao.campo === 'clienteId' ? ordenacao.direcao : 'asc'}
                      onClick={() => handleOrdenacaoChange('clienteId')}
                      sx={{ fontWeight: 800 }}
                    >
                      Cliente
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Marca / Modelo</TableCell>
                  <TableCell>Ano</TableCell>
                  <TableCell>Placa</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {veiculosFiltrados.length > 0 ? (
                  veiculosFiltrados.map((veiculo) => (
                    <TableRow key={veiculo.id} hover>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>#{veiculo.numero_sequencial || String(veiculo.id).slice(0, 5).toUpperCase()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{getClienteNome(veiculo.clienteId)}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>{veiculo.marca}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>{veiculo.modelo}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{veiculo.ano}</TableCell>
                      <TableCell>
                        <Chip
                          label={veiculo.placa}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            bgcolor: 'rgba(0,0,0,0.04)',
                            borderRadius: 1.5,
                            border: '1px solid',
                            borderColor: 'divider'
                          }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            onClick={() => handleOpenForm(veiculo)}
                            size="small"
                            sx={{ color: 'primary.main', bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDelete(veiculo.id)}
                            size="small"
                            sx={{ color: 'error.main', bgcolor: 'rgba(239,68,68,0.05)', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Nenhum veículo encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Formulário de Veículo */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          {editingId ? 'Editar Veículo' : 'Novo Veículo'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="cliente-label">Cliente</InputLabel>
              <Select
                labelId="cliente-label"
                value={formData.clienteId}
                onChange={handleSelectChange}
                label="Cliente"
              >
                {clientes.map((cliente) => (
                  <MenuItem key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              name="marca"
              label="Marca"
              fullWidth
              value={formData.marca}
              onChange={handleInputChange}
            />
            <TextField
              name="modelo"
              label="Modelo"
              fullWidth
              value={formData.modelo}
              onChange={handleInputChange}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="ano"
                label="Ano"
                type="number"
                fullWidth
                value={formData.ano}
                onChange={handleInputChange}
              />
              <TextField
                name="placa"
                label="Placa"
                fullWidth
                value={formData.placa}
                onChange={handleInputChange}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseForm} color="inherit" sx={{ fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disableElevation sx={{ px: 4, fontWeight: 800 }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Veículo'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDelete} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para mensagens */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Veiculos;