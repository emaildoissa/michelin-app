import { useState, useEffect, useMemo } from 'react';
import api from '../services/api';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
  Dialog, TextField, IconButton, CircularProgress, Snackbar, Alert,
  MenuItem, Grid, Chip, Menu, Stack, Divider,
  Avatar, Card, CardActionArea, InputBase, List, ListItem, ListItemText
} from '@mui/material';
import { useLocation } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CloseIcon from '@mui/icons-material/Close';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import 'dayjs/locale/pt-br';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface OrdemServico { id: string; veiculoId: string; dataEntrada: string; status: string; valorTotal: number; servicosIds: string[]; pecasIds: string[]; descricao: string; }
interface Veiculo { id: string; clienteId: string; marca: string; modelo: string; placa: string; }
interface Cliente { id: string; nome: string; }
interface Servico { id: string; nome: string; valor: number; tempoEstimado: string; }
interface Peca { id: string; nome: string; preco: number; marca: string; quantidade: number; }

const OrdensServico = () => {
  const location = useLocation();
  const [ordens, setOrdens] = useState<OrdemServico[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [pecas, setPecas] = useState<Peca[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [workspaceOpen, setWorkspaceOpen] = useState(false);
  const [ticketVehicle, setTicketVehicle] = useState<Veiculo | null>(null);
  const [ticketItems, setTicketItems] = useState<any[]>([]);
  const [workspaceSearch, setWorkspaceSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [descricao, setDescricao] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrdem, setSelectedOrdem] = useState<OrdemServico | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [oRes, vRes, cRes, sRes, pRes] = await Promise.all([
        api.get('/ordens_servico'), api.get('/veiculos'), api.get('/clientes'), api.get('/servicos'), api.get('/pecas')
      ]);
      setOrdens(oRes.data); setVeiculos(vRes.data); setClientes(cRes.data); setServicos(sRes.data); setPecas(pRes.data);
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro de conexão', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchData();
    if (location.state?.openInstant) {
      handleOpenWorkspace();
      if (location.state?.initialPlate) setWorkspaceSearch(location.state.initialPlate);
    }
  }, [location]);

  useEffect(() => {
    if (workspaceOpen && workspaceSearch.length >= 6) {
      const found = veiculos.find(v => v.placa.toLowerCase() === workspaceSearch.toLowerCase());
      if (found) { setTicketVehicle(found); setWorkspaceSearch(''); }
    }
  }, [workspaceSearch, workspaceOpen, veiculos]);

  const liveTotal = useMemo(() => ticketItems.reduce((acc, item) => acc + item.valor, 0), [ticketItems]);

  const handleOpenWorkspace = (ordem?: OrdemServico) => {
    if (ordem) {
      const v = veiculos.find(v => v.id === ordem.veiculoId);
      setTicketVehicle(v || null);
      setEditingId(ordem.id);
      setDescricao(ordem.descricao || '');
      const sItems = servicos.filter(s => ordem.servicosIds.includes(s.id)).map(s => ({ ...s, type: 'servico' }));
      const pItems = pecas.filter(p => ordem.pecasIds.includes(p.id)).map(p => ({ ...p, type: 'peca', valor: p.preco }));
      setTicketItems([...sItems, ...pItems]);
    } else {
      setTicketVehicle(null);
      setEditingId(null);
      setTicketItems([]);
      setDescricao('');
    }
    setWorkspaceOpen(true);
    setAnchorEl(null);
  };

  const handleSaveOS = async (status: string) => {
    try {
      const payload = {
        veiculoId: ticketVehicle?.id,
        servicosIds: ticketItems.filter(i => i.type === 'servico').map(i => i.id),
        pecasIds: ticketItems.filter(i => i.type === 'peca').map(i => i.id),
        status,
        descricao,
        dataEntrada: dayjs().toISOString(),
        valorTotal: liveTotal
      };
      if (editingId) await api.put(`/ordens_servico/${editingId}`, payload);
      else await api.post('/ordens_servico', payload);
      
      setSnackbar({ open: true, message: 'OS Processada com Sucesso', severity: 'success' });
      setWorkspaceOpen(false);
      fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: 'Erro ao salvar', severity: 'error' });
    }
  };

  const catalogoMisto = useMemo(() => [
    ...servicos.map(s => ({ ...s, type: 'servico' })),
    ...pecas.map(p => ({ ...p, type: 'peca', valor: p.preco }))
  ].filter(i => i.nome.toLowerCase().includes(workspaceSearch.toLowerCase())), [workspaceSearch, servicos, pecas]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'Aguardando aprovação': return { bg: '#FEF3C7', color: '#92400E', border: '#F59E0B' };
      case 'Orçamento aprovado': return { bg: '#E0F2FE', color: '#0369A1', border: '#0EA5E9' };
      case 'Em andamento': return { bg: '#D1FAE5', color: '#065F46', border: '#10B981' };
      case 'Concluído': return { bg: '#F3E8FF', color: '#6B21A8', border: '#A855F7' };
      case 'Cancelado': return { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' };
      default: return { bg: '#F1F5F9', color: '#475569', border: '#94A3B8' };
    }
  };

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'Desconhecido';

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', letterSpacing: '-1px' }}>Ordens de Serviço</Typography>
          <Typography variant="body1" color="text.secondary">Gestão de fluxo operacional e faturamento.</Typography>
        </Box>
        <Button variant="contained" size="large" onClick={() => handleOpenWorkspace()} sx={{ borderRadius: 3, fontWeight: 800, px: 4 }}>NOVA OS</Button>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: '#E2E8F0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', letterSpacing: '0.5px' }}>VEÍCULO & CLIENTE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', letterSpacing: '0.5px' }}>ENTRADA</TableCell>
              <TableCell sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', letterSpacing: '0.5px' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', letterSpacing: '0.5px' }}>VALOR</TableCell>
              <TableCell align="center" sx={{ fontWeight: 800, color: '#64748B', fontSize: '0.75rem', letterSpacing: '0.5px' }}>AÇÕES</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ordens.map((o) => {
              const v = veiculos.find(v => v.id === o.veiculoId);
              const style = getStatusStyle(o.status);
              return (
                <TableRow key={o.id} hover sx={{ '&:hover': { bgcolor: '#F1F5F9' } }}>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{v?.marca} {v?.modelo} • {v?.placa}</Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>{getClienteNome(v?.clienteId || '')}</Typography>
                  </TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 700 }}>{dayjs(o.dataEntrada).format('DD/MM/YY')}</Typography></TableCell>
                  <TableCell>
                    <Chip label={o.status} size="small" sx={{ fontWeight: 800, borderRadius: 2, bgcolor: style.bg, color: style.color, borderLeft: `3px solid ${style.border}`, fontSize: '0.7rem' }} />
                  </TableCell>
                  <TableCell align="right"><Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#0F172A' }}>R$ {o.valorTotal.toFixed(2)}</Typography></TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedOrdem(o); }}><MoreVertIcon fontSize="small" /></IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog fullScreen open={workspaceOpen} onClose={() => setWorkspaceOpen(false)}>
        <Grid container sx={{ height: '100vh' }}>
          <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton onClick={() => setWorkspaceOpen(false)} sx={{ bgcolor: '#F1F5F9' }}><CloseIcon /></IconButton>
              <Paper elevation={0} sx={{ flex: 1, bgcolor: '#F1F5F9', borderRadius: 4, px: 2, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ color: '#64748B', mr: 1 }} />
                <InputBase fullWidth autoFocus placeholder="DIGITE PLACA, SERVIÇO OU PEÇA..." value={workspaceSearch} onChange={(e) => setWorkspaceSearch(e.target.value)} sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 800 }} />
              </Paper>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 4 }}>
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#94A3B8', mb: 3, display: 'block' }}>CATÁLOGO MICHELIN</Typography>
              <Grid container spacing={2}>
                {catalogoMisto.slice(0, 16).map((item) => (
                  <Grid item xs={6} sm={4} lg={3} key={`${item.type}-${item.id}`}>
                    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: '#E2E8F0', transition: 'all 0.2s', '&:hover': { borderColor: '#002D72', boxShadow: '0 8px 30px rgba(0,45,114,0.06)', transform: 'translateY(-2px)' } }}>
                      <CardActionArea sx={{ p: 2.5 }} onClick={() => setTicketItems(p => [...p, { ...item, uid: Math.random() }])}>
                        <Avatar sx={{ bgcolor: item.type === 'servico' ? '#D1FAE5' : '#E0F2FE', color: item.type === 'servico' ? '#065F46' : '#0369A1', mb: 2, borderRadius: 2.5 }}>
                          {item.type === 'servico' ? <BuildIcon fontSize="small" /> : <InventoryIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>{item.nome}</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: '#002D72' }}>R$ {item.valor.toFixed(2)}</Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ bgcolor: '#F8FAFC', borderLeft: '1px solid', borderColor: '#E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 4, flex: 1, overflowY: 'auto' }}>
              <Typography variant="overline" sx={{ fontWeight: 900, color: '#002D72' }}>TICKET DE ATENDIMENTO</Typography>
              {ticketVehicle ? (
                <Paper elevation={0} sx={{ p: 2.5, mt: 2, borderRadius: 4, bgcolor: '#002D72', color: 'white' }}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2 }}><DirectionsCarIcon /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>{ticketVehicle.marca} {ticketVehicle.modelo}</Typography>
                      <Typography variant="caption" sx={{ fontWeight: 800, opacity: 0.9 }}>PLACA: {ticketVehicle.placa}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setTicketVehicle(null)} sx={{ color: 'white' }}><CloseIcon fontSize="small" /></IconButton>
                  </Stack>
                </Paper>
              ) : (
                <Box sx={{ mt: 2, p: 4, border: '2px dashed', borderColor: '#CBD5E1', borderRadius: 4, textAlign: 'center', bgcolor: 'white' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 800 }}>Vincule um Veículo</Typography>
                </Box>
              )}
              <List sx={{ mt: 4 }}>
                {ticketItems.map((item) => (
                  <ListItem key={item.uid} disableGutters sx={{ mb: 2, px: 2, bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: '#E2E8F0' }}>
                    <Avatar sx={{ width: 36, height: 36, mr: 2, bgcolor: '#F1F5F9', color: '#64748B', borderRadius: 1.5 }}>
                      {item.type === 'servico' ? <BuildIcon sx={{ fontSize: 16 }} /> : <InventoryIcon sx={{ fontSize: 16 }} />}
                    </Avatar>
                    <ListItemText primary={item.nome} primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 800 }} />
                    <Stack alignItems="flex-end">
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#002D72' }}>R$ {item.valor.toFixed(2)}</Typography>
                      <IconButton size="small" color="error" onClick={() => setTicketItems(p => p.filter(i => i.uid !== item.uid))}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Stack>
                  </ListItem>
                ))}
              </List>
              <TextField fullWidth placeholder="Observações técnicas..." multiline rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'white' } }} />
            </Box>
            <Paper elevation={0} sx={{ p: 4, borderRadius: '40px 40px 0 0', borderTop: '1px solid', borderColor: '#E2E8F0', bgcolor: 'white' }}>
              <Stack direction="row" justifyContent="space-between" mb={4} alignItems="center">
                <Typography variant="h6" sx={{ fontWeight: 800, color: '#64748B' }}>Total</Typography>
                <Typography variant="h3" sx={{ fontWeight: 900, color: '#002D72', letterSpacing: '-2px' }}>R$ {liveTotal.toFixed(2)}</Typography>
              </Stack>
              <Stack direction="row" spacing={2}>
                <Button fullWidth variant="outlined" size="large" onClick={() => handleSaveOS('Aguardando aprovação')} sx={{ borderRadius: 3, fontWeight: 900, height: 60, borderWidth: 2 }}>ORÇAMENTO</Button>
                <Button fullWidth variant="contained" size="large" onClick={() => handleSaveOS('Em andamento')} disabled={!ticketVehicle} sx={{ borderRadius: 3, fontWeight: 900, height: 60, bgcolor: '#059669', '&:hover': { bgcolor: '#047857' } }}>INICIAR</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Dialog>

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} PaperProps={{ sx: { borderRadius: 3, minWidth: 160 } }}>
        <MenuItem onClick={() => selectedOrdem && handleOpenWorkspace(selectedOrdem)} sx={{ fontWeight: 700, py: 1.5 }}><EditIcon sx={{ mr: 2 }} fontSize="small" /> Editar</MenuItem>
        <MenuItem sx={{ fontWeight: 700, py: 1.5 }}><PrintIcon sx={{ mr: 2 }} fontSize="small" /> Imprimir</MenuItem>
        <Divider />
        <MenuItem sx={{ fontWeight: 700, py: 1.5, color: 'error.main' }}><DeleteIcon sx={{ mr: 2 }} fontSize="small" /> Excluir</MenuItem>
      </Menu>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ borderRadius: 3, fontWeight: 800 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdensServico;