import { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Box,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Snackbar,
  Alert,
  InputAdornment,
  TableSortLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Cliente {
  id: number;
  numero_sequencial?: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

interface ClienteFormData {
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

const clienteVazio: ClienteFormData = {
  nome: '',
  email: '',
  telefone: '',
  endereco: ''
};

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clientesFiltrados, setClientesFiltrados] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formData, setFormData] = useState<ClienteFormData>(clienteVazio);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [clienteParaDeletar, setClienteParaDeletar] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof Cliente | '';
    direcao: 'asc' | 'desc';
  }>({
    campo: '',
    direcao: 'asc'
  });

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes');
      setClientes(response.data);
      setClientesFiltrados(response.data);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar clientes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleOpenForm = (cliente?: Cliente) => {
    if (cliente) {
      setFormData({
        nome: cliente.nome,
        email: cliente.email,
        telefone: cliente.telefone,
        endereco: cliente.endereco
      });
      setEditingId(cliente.id);
    } else {
      setFormData(clienteVazio);
      setEditingId(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/clientes/${editingId}`, formData);
        setSnackbar({
          open: true,
          message: 'Cliente atualizado com sucesso',
          severity: 'success'
        });
      } else {
        await api.post('/clientes', formData);
        setSnackbar({
          open: true,
          message: 'Cliente adicionado com sucesso',
          severity: 'success'
        });
      }
      handleCloseForm();
      fetchClientes();
    } catch (error) {
      console.error('Erro ao salvar cliente:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar cliente',
        severity: 'error'
      });
    }
  };

  const handleOpenDelete = (id: number) => {
    setClienteParaDeletar(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
  };

  const handleDelete = async () => {
    if (clienteParaDeletar) {
      try {
        await api.delete(`/clientes/${clienteParaDeletar}`);
        setSnackbar({
          open: true,
          message: 'Cliente excluído com sucesso',
          severity: 'success'
        });
        fetchClientes();
      } catch (error) {
        console.error('Erro ao excluir cliente:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir cliente',
          severity: 'error'
        });
      }
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleFiltroChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFiltro = event.target.value.toLowerCase();
    setFiltro(valorFiltro);
    
    if (valorFiltro === '') {
      setClientesFiltrados(clientes);
    } else {
      const filtrados = clientes.filter(cliente => 
        cliente.nome.toLowerCase().includes(valorFiltro) ||
        cliente.email.toLowerCase().includes(valorFiltro) ||
        cliente.telefone.toLowerCase().includes(valorFiltro) ||
        cliente.endereco.toLowerCase().includes(valorFiltro)
      );
      setClientesFiltrados(filtrados);
    }
  };

  const handleOrdenacaoChange = (campo: keyof Cliente) => {
    const ehMesmoCampo = ordenacao.campo === campo;
    const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
    
    setOrdenacao({
      campo,
      direcao: novaDirecao
    });

    const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
      const aValue = String(a[campo] ?? '').toLowerCase();
      const bValue = String(b[campo] ?? '').toLowerCase();
      
      return novaDirecao === 'asc'
        ? aValue.localeCompare(bValue, 'pt-BR')
        : bValue.localeCompare(aValue, 'pt-BR');
    });

    setClientesFiltrados(clientesOrdenados);
  };

  // Aplicar ordenação quando os dados mudam
  useEffect(() => {
    if (ordenacao.campo !== '') {
      const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
        const campoOrdenacao = ordenacao.campo as keyof Cliente;
        
        const aValue = String(a[campoOrdenacao] ?? '').toLowerCase();
        const bValue = String(b[campoOrdenacao] ?? '').toLowerCase();
        
        return ordenacao.direcao === 'asc'
          ? aValue.localeCompare(bValue, 'pt-BR')
          : bValue.localeCompare(aValue, 'pt-BR');
      });
      setClientesFiltrados(clientesOrdenados);
    }
  }, [clientes]);

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
            Clientes
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Gerencie sua base de contatos e histórico.
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
          Novo Cliente
        </Button>
      </Box>
      
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar por nome, email ou telefone..."
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
                      active={ordenacao.campo === 'nome'}
                      direction={ordenacao.campo === 'nome' ? ordenacao.direcao : 'asc'}
                      onClick={() => handleOrdenacaoChange('nome')}
                      sx={{ fontWeight: 800 }}
                    >
                      Nome
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Telefone</TableCell>
                  <TableCell>Endereço</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente) => (
                    <TableRow key={cliente.id} hover>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>#{cliente.numero_sequencial || String(cliente.id).slice(0, 5).toUpperCase()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{cliente.nome}</TableCell>
                      <TableCell>{cliente.email}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{cliente.telefone}</TableCell>
                      <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'text.secondary' }}>
                        {cliente.endereco}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            onClick={() => handleOpenForm(cliente)}
                            size="small"
                            sx={{ color: 'primary.main', bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDelete(cliente.id)}
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
                        Nenhum cliente encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Formulário de Cliente */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          {editingId ? 'Editar Cliente' : 'Novo Cliente'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              autoFocus
              name="nome"
              label="Nome do Cliente"
              fullWidth
              value={formData.nome}
              onChange={handleInputChange}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleInputChange}
            />
            <TextField
              name="telefone"
              label="Telefone"
              fullWidth
              value={formData.telefone}
              onChange={handleInputChange}
            />
            <TextField
              name="endereco"
              label="Endereço"
              multiline
              rows={3}
              fullWidth
              value={formData.endereco}
              onChange={handleInputChange}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseForm} color="inherit" sx={{ fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disableElevation sx={{ px: 4, fontWeight: 800 }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Cliente'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.
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

export default Clientes;