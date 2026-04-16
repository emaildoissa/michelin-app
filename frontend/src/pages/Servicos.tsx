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
  TableSortLabel,
  Chip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface Servico {
  id: number;
  numero_sequencial?: number;
  nome: string;
  descricao: string;
  valor: number;
  tempoEstimado: string;
}

interface ServicoFormData {
  nome: string;
  descricao: string;
  valor: number;
  tempoEstimado: string;
}

const servicoVazio: ServicoFormData = {
  nome: '',
  descricao: '',
  valor: 0,
  tempoEstimado: ''
};

const Servicos = () => {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [servicosFiltrados, setServicosFiltrados] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [formData, setFormData] = useState<ServicoFormData>(servicoVazio);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [servicoParaDeletar, setServicoParaDeletar] = useState<number | null>(null);
  const [filtro, setFiltro] = useState('');
  const [ordenacao, setOrdenacao] = useState<{
    campo: keyof Servico | '';
    direcao: 'asc' | 'desc';
  }>({
    campo: '',
    direcao: 'asc'
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });

  const fetchServicos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servicos');
      setServicos(response.data);
      setServicosFiltrados(response.data);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar serviços',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServicos();
  }, []);

  const handleOpenForm = (servico?: Servico) => {
    if (servico) {
      setFormData({
        nome: servico.nome,
        descricao: servico.descricao,
        valor: servico.valor,
        tempoEstimado: servico.tempoEstimado
      });
      setEditingId(servico.id);
    } else {
      setFormData(servicoVazio);
      setEditingId(null);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setFormData(servicoVazio);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'valor' ? Number(value) : value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await api.put(`/servicos/${editingId}`, formData);
        setSnackbar({
          open: true,
          message: 'Serviço atualizado com sucesso',
          severity: 'success'
        });
      } else {
        await api.post('/servicos', formData);
        setSnackbar({
          open: true,
          message: 'Serviço adicionado com sucesso',
          severity: 'success'
        });
      }
      handleCloseForm();
      fetchServicos();
    } catch (error) {
      console.error('Erro ao salvar serviço:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar serviço',
        severity: 'error'
      });
    }
  };

  const handleOpenDelete = (id: number) => {
    setServicoParaDeletar(id);
    setOpenDelete(true);
  };

  const handleCloseDelete = () => {
    setOpenDelete(false);
    setServicoParaDeletar(null);
  };

  const handleDelete = async () => {
    if (servicoParaDeletar) {
      try {
        await api.delete(`/servicos/${servicoParaDeletar}`);
        setSnackbar({
          open: true,
          message: 'Serviço excluído com sucesso',
          severity: 'success'
        });
        fetchServicos();
      } catch (error) {
        console.error('Erro ao excluir serviço:', error);
        setSnackbar({
          open: true,
          message: 'Erro ao excluir serviço',
          severity: 'error'
        });
      }
      handleCloseDelete();
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const formatarValor = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const handleFiltroChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const valorFiltro = event.target.value.toLowerCase();
    setFiltro(valorFiltro);

    if (valorFiltro === '') {
      setServicosFiltrados(servicos);
    } else {
      const filtrados = servicos.filter(servico =>
        servico.nome.toLowerCase().includes(valorFiltro) ||
        servico.descricao.toLowerCase().includes(valorFiltro) ||
        servico.valor.toString().includes(valorFiltro) ||
        servico.tempoEstimado.toLowerCase().includes(valorFiltro)
      );
      setServicosFiltrados(filtrados);
    }
  };

  const handleOrdenacaoChange = (campo: keyof Servico) => {
    const ehMesmoCampo = ordenacao.campo === campo;
    const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';

    setOrdenacao({
      campo,
      direcao: novaDirecao
    });

    const servicosOrdenados = [...servicosFiltrados].sort((a, b) => {
      if (campo === 'valor') {
        return novaDirecao === 'asc' ? a.valor - b.valor : b.valor - a.valor;
      }

      const aValue = String(a[campo]).toLowerCase();
      const bValue = String(b[campo]).toLowerCase();

      return novaDirecao === 'asc'
        ? aValue.localeCompare(bValue, 'pt-BR')
        : bValue.localeCompare(aValue, 'pt-BR');
    });

    setServicosFiltrados(servicosOrdenados);
  };

  // Aplicar ordenação quando os dados mudam
  useEffect(() => {
    if (ordenacao.campo !== '') {
      const servicosOrdenados = [...servicosFiltrados].sort((a, b) => {
        const campoOrdenacao = ordenacao.campo as keyof Servico;

        if (campoOrdenacao === 'valor') {
          return ordenacao.direcao === 'asc' ? a.valor - b.valor : b.valor - a.valor;
        }

        const aValue = String(a[campoOrdenacao]).toLowerCase();
        const bValue = String(b[campoOrdenacao]).toLowerCase();

        return ordenacao.direcao === 'asc'
          ? aValue.localeCompare(bValue, 'pt-BR')
          : bValue.localeCompare(aValue, 'pt-BR');
      });
      setServicosFiltrados(servicosOrdenados);
    }
  }, [servicos]);

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
            Serviços
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Catálogo de mão de obra e tempos estimados.
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
          Novo Serviço
        </Button>
      </Box>

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Buscar serviços por nome ou descrição..."
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
                      Nome do Serviço
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Descrição</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell>Tempo Estimado</TableCell>
                  <TableCell align="center">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {servicosFiltrados.length > 0 ? (
                  servicosFiltrados.map((servico) => (
                    <TableRow key={servico.id} hover>
                      <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>#{servico.numero_sequencial || String(servico.id).slice(0, 5).toUpperCase()}</TableCell>
                      <TableCell sx={{ fontWeight: 700, color: 'text.primary' }}>{servico.nome}</TableCell>
                      <TableCell sx={{ maxWidth: 300, color: 'text.secondary' }}>{servico.descricao}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace' }}>
                          {formatarValor(servico.valor)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={servico.tempoEstimado}
                          size="small"
                          variant="outlined"
                          sx={{ fontWeight: 700, borderRadius: 1.5, borderColor: 'divider' }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <IconButton
                            onClick={() => handleOpenForm(servico)}
                            size="small"
                            sx={{ color: 'primary.main', bgcolor: 'rgba(0,0,0,0.03)', '&:hover': { bgcolor: 'rgba(0,0,0,0.08)' } }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            onClick={() => handleOpenDelete(servico.id)}
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
                        Nenhum serviço encontrado.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {/* Formulário de Serviço */}
      <Dialog
        open={openForm}
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 4, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-0.02em' }}>
          {editingId ? 'Editar Serviço' : 'Novo Serviço'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              autoFocus
              name="nome"
              label="Nome do Serviço"
              fullWidth
              value={formData.nome}
              onChange={handleInputChange}
            />
            <TextField
              name="descricao"
              label="Descrição"
              multiline
              rows={3}
              fullWidth
              value={formData.descricao}
              onChange={handleInputChange}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                name="valor"
                label="Valor"
                type="number"
                fullWidth
                value={formData.valor}
                onChange={handleInputChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">R$</InputAdornment>,
                }}
              />
              <TextField
                name="tempoEstimado"
                label="Tempo Estimado"
                fullWidth
                value={formData.tempoEstimado}
                onChange={handleInputChange}
                placeholder="Ex: 2 horas"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button onClick={handleCloseForm} color="inherit" sx={{ fontWeight: 700 }}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} variant="contained" disableElevation sx={{ px: 4, fontWeight: 800 }}>
            {editingId ? 'Salvar Alterações' : 'Adicionar Serviço'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <Dialog open={openDelete} onClose={handleCloseDelete}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.
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

export default Servicos;