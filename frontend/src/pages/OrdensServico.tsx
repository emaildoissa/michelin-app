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
      case 'Entregue': return { bg: '#E0F2F1', color: '#00695C', border: '#26A69A' };
      case 'Cancelado': return { bg: '#FEE2E2', color: '#991B1B', border: '#EF4444' };
      default: return { bg: '#F1F5F9', color: '#475569', border: '#94A3B8' };
    }
  };

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'Desconhecido';

  return (
    <Box sx={{ pb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={5}>
        <Box>
          <Typography variant="h4" sx={{ color: 'primary.main', mb: 0.5 }}>Ordens de Serviço</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary' }}>Gestão de fluxo operacional e faturamento.</Typography>
        </Box>
        <Button variant="contained" size="large" onClick={() => handleOpenWorkspace()} sx={{ height: 52, borderRadius: 3, px: 4 }}>NOVA OS</Button>
      </Stack>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: '#E2E8F0' }}>
        <Table>
          <TableHead sx={{ bgcolor: '#F8FAFC' }}>
            <TableRow>
              <TableCell sx={{ py: 2.5 }}><Typography variant="overline" sx={{ color: 'text.disabled' }}>VEÍCULO & CLIENTE</Typography></TableCell>
              <TableCell sx={{ py: 2.5 }}><Typography variant="overline" sx={{ color: 'text.disabled' }}>ENTRADA</Typography></TableCell>
              <TableCell sx={{ py: 2.5 }}><Typography variant="overline" sx={{ color: 'text.disabled' }}>STATUS</Typography></TableCell>
              <TableCell align="right" sx={{ py: 2.5 }}><Typography variant="overline" sx={{ color: 'text.disabled' }}>VALOR</Typography></TableCell>
              <TableCell align="center" sx={{ py: 2.5 }}><Typography variant="overline" sx={{ color: 'text.disabled' }}>AÇÕES</Typography></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}><CircularProgress /></TableCell></TableRow>
            ) : ordens.length === 0 ? (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 8 }}>Nenhuma OS encontrada.</TableCell></TableRow>
            ) : (
              ordens.map((o) => {
                const v = veiculos.find(v => v.id === o.veiculoId);
                const style = getStatusStyle(o.status);
                return (
                  <TableRow key={o.id} hover sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell sx={{ py: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: '#F1F5F9', color: 'primary.main', borderRadius: 2, width: 44, height: 44 }}><DirectionsCarIcon fontSize="small" /></Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: 'text.primary', mb: 0.25 }}>{v?.marca} {v?.modelo} • {v?.placa}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>{getClienteNome(v?.clienteId || '')}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>{dayjs(o.dataEntrada).format('DD MMM YYYY')}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.disabled' }}>{dayjs(o.dataEntrada).fromNow()}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={o.status} size="small" sx={{ height: 24, fontSize: '0.65rem', bgcolor: style.bg, color: style.color, borderLeft: `3px solid ${style.border}` }} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 900 }}>R$ {o.valorTotal.toFixed(2)}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedOrdem(o); }}><MoreVertIcon fontSize="small" /></IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* OVERDRIVE: Ticket Workspace */}
      <Dialog fullScreen open={workspaceOpen} onClose={() => setWorkspaceOpen(false)}>
        <Grid container sx={{ height: '100vh' }}>
          {/* Left: Search & Catalog */}
          <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: '#E2E8F0', display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconButton onClick={() => setWorkspaceOpen(false)} sx={{ bgcolor: '#F1F5F9' }}><CloseIcon fontSize="small" /></IconButton>
              <Paper elevation={0} sx={{ flex: 1, bgcolor: '#F1F5F9', borderRadius: 4, px: 2.5, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ color: 'text.disabled', mr: 1.5 }} />
                <InputBase fullWidth autoFocus placeholder="DIGITE PLACA, SERVIÇO OU PEÇA..." value={workspaceSearch} onChange={(e) => setWorkspaceSearch(e.target.value)} sx={{ py: 2, fontSize: '1.125rem', fontWeight: 800, color: 'text.primary' }} />
              </Paper>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: 5 }}>
              <Typography variant="overline" sx={{ color: 'text.disabled', mb: 4, display: 'block', letterSpacing: '0.15em' }}>CATÁLOGO MICHELIN</Typography>
              <Grid container spacing={3}>
                {catalogoMisto.slice(0, 16).map((item) => (
                  <Grid item xs={6} sm={4} lg={3} key={`${item.type}-${item.id}`}>
                    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: '#E2E8F0', transition: 'all 0.2s', '&:hover': { borderColor: 'primary.main', boxShadow: '0 12px 30px rgba(0,45,114,0.08)', transform: 'translateY(-4px)' } }}>
                      <CardActionArea sx={{ p: 3 }} onClick={() => setTicketItems(p => [...p, { ...item, uid: Math.random() }])}>
                        <Avatar sx={{ bgcolor: item.type === 'servico' ? '#D1FAE5' : '#E0F2FE', color: item.type === 'servico' ? '#065F46' : '#0369A1', mb: 2.5, borderRadius: 2.5, width: 48, height: 48 }}>
                          {item.type === 'servico' ? <BuildIcon fontSize="small" /> : <InventoryIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ lineHeight: 1.3, mb: 1.5, height: 2.6 + 'em', overflow: 'hidden' }}>{item.nome}</Typography>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900 }}>R$ {item.valor.toFixed(2)}</Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          {/* Right: The Ticket */}
          <Grid item xs={12} md={4} sx={{ bgcolor: '#F8FAFC', borderLeft: '1px solid', borderColor: '#E2E8F0', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 5, flex: 1, overflowY: 'auto' }}>
              <Typography variant="overline" sx={{ color: 'primary.main', mb: 3, display: 'block', letterSpacing: '0.1em' }}>TICKET DE ATENDIMENTO</Typography>
              {ticketVehicle ? (
                <Paper elevation={0} sx={{ p: 3, mt: 2, borderRadius: 4, bgcolor: 'primary.main', color: 'white', boxShadow: '0 12px 30px rgba(0,45,114,0.25)' }}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 2.5, width: 52, height: 52 }}><DirectionsCarIcon /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2 }}>{ticketVehicle.marca} {ticketVehicle.modelo}</Typography>
                      <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800 }}>PLACA: {ticketVehicle.placa}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setTicketVehicle(null)} sx={{ color: 'white' }}><CloseIcon fontSize="small" /></IconButton>
                  </Stack>
                </Paper>
              ) : (
                <Box sx={{ mt: 2, p: 5, border: '2px dashed', borderColor: '#CBD5E1', borderRadius: 4, textAlign: 'center', bgcolor: 'white' }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>Vincule um Veículo</Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled', mt: 1, display: 'block' }}>Digite a placa na busca para anexar.</Typography>
                </Box>
              )}
              <List sx={{ mt: 5 }}>
                {ticketItems.map((item) => (
                  <ListItem key={item.uid} disableGutters sx={{ mb: 2.5, px: 2.5, py: 2, bgcolor: 'white', borderRadius: 4, border: '1px solid', borderColor: '#E2E8F0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                    <Avatar sx={{ width: 40, height: 40, mr: 2.5, bgcolor: '#F1F5F9', color: 'text.secondary', borderRadius: 2 }}>
                      {item.type === 'servico' ? <BuildIcon sx={{ fontSize: 18 }} /> : <InventoryIcon sx={{ fontSize: 18 }} />}
                    </Avatar>
                    <ListItemText primary={item.nome} primaryTypographyProps={{ variant: 'subtitle2', sx: { color: 'text.primary', lineHeight: 1.2 } }} />
                    <Stack alignItems="flex-end" sx={{ ml: 2 }}>
                      <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 900 }}>R$ {item.valor.toFixed(2)}</Typography>
                      <IconButton size="small" color="error" onClick={() => setTicketItems(p => p.filter(i => i.uid !== item.uid))} sx={{ mt: 0.5 }}><DeleteOutlineIcon fontSize="small" /></IconButton>
                    </Stack>
                  </ListItem>
                ))}
              </List>
              <TextField fullWidth placeholder="Observações técnicas..." multiline rows={4} value={descricao} onChange={(e) => setDescricao(e.target.value)} sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 4, bgcolor: 'white', py: 2 } }} />
            </Box>
            <Paper elevation={0} sx={{ p: 5, borderRadius: '40px 40px 0 0', borderTop: '1px solid', borderColor: '#E2E8F0', bgcolor: 'white', boxShadow: '0 -10px 40px rgba(0,0,0,0.04)' }}>
              <Stack direction="row" justifyContent="space-between" mb={5} alignItems="center">
                <Typography variant="h6" sx={{ color: 'text.secondary' }}>Total</Typography>
                <Typography variant="h2" sx={{ color: 'primary.main', letterSpacing: '-0.04em' }}>R$ {liveTotal.toFixed(2)}</Typography>
              </Stack>
              {editingId ? (
                <Button fullWidth variant="contained" size="large" onClick={() => handleSaveOS(selectedOrdem?.status || 'Em andamento')} disabled={!ticketVehicle} sx={{ borderRadius: 3.5, height: 64, bgcolor: 'primary.main', '&:hover': { bgcolor: 'primary.dark' } }}>
                  SALVAR ALTERAÇÕES
                </Button>
              ) : (
                <Stack direction="row" spacing={3}>
                  <Button fullWidth variant="outlined" size="large" onClick={() => handleSaveOS('Aguardando aprovação')} sx={{ borderRadius: 3.5, height: 64, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>ORÇAMENTO</Button>
                  <Button fullWidth variant="contained" size="large" onClick={() => handleSaveOS('Em andamento')} disabled={!ticketVehicle} sx={{ borderRadius: 3.5, height: 64, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}>INICIAR</Button>
                </Stack>
              )}
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