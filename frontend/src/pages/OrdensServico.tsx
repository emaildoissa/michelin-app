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
      const sItems = servicos.filter(s => ordem.servicosIds.includes(s.id)).map(s => ({ ...s, type: 'servico', uid: Math.random() }));
      const pItems = pecas.filter(p => ordem.pecasIds.includes(p.id)).map(p => ({ ...p, type: 'peca', valor: p.preco, uid: Math.random() }));
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
      case 'Aguardando aprovação': return { bg: '#fef3c7', color: '#92400e', border: '#f59e0b' };
      case 'Orçamento aprovado': return { bg: '#e0f2fe', color: '#0369a1', border: '#0ea5e9' };
      case 'Em andamento': return { bg: '#dcfce7', color: '#166534', border: '#22c55e' };
      case 'Concluído': return { bg: '#f3e8ff', color: '#6b21a8', border: '#a855f7' };
      case 'Entregue': return { bg: '#f0fdf4', color: '#15803d', border: '#10b981' };
      case 'Cancelado': return { bg: '#fee2e2', color: '#991b1b', border: '#ef4444' };
      default: return { bg: '#f4f4f5', color: '#52525b', border: '#d4d4d8' };
    }
  };

  const getClienteNome = (id: string) => clientes.find(c => c.id === id)?.nome || 'Desconhecido';

  return (
    <Box sx={{ pb: 6, py: 2 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={3} mb={6}>
        <Box>
          <Typography variant="h3" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>Ordens de Serviço</Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', mt: 0.5 }}>Gestão de fluxo operacional e faturamento.</Typography>
        </Box>
        <Button 
          variant="contained" 
          size="large" 
          disableElevation
          startIcon={<AddIcon />}
          onClick={() => handleOpenWorkspace()} 
          sx={{ height: 56, borderRadius: 3, px: 4, fontWeight: 800 }}
        >
          NOVA OS
        </Button>
      </Stack>

      <Paper sx={{ overflow: 'hidden', borderRadius: 4 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ py: 2.5 }}>VEÍCULO & CLIENTE</TableCell>
                <TableCell>ENTRADA</TableCell>
                <TableCell>STATUS</TableCell>
                <TableCell align="right">VALOR TOTAL</TableCell>
                <TableCell align="center">AÇÕES</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}><CircularProgress thickness={5} size={40} /></TableCell></TableRow>
              ) : ordens.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>Nenhuma OS encontrada.</Typography>
                </TableCell></TableRow>
              ) : (
                ordens.map((o) => {
                  const v = veiculos.find(v => v.id === o.veiculoId);
                  const style = getStatusStyle(o.status);
                  return (
                    <TableRow key={o.id} hover>
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
                          <Avatar sx={{ bgcolor: 'rgba(0,0,0,0.03)', color: 'primary.main', borderRadius: 2.5, width: 48, height: 48 }}><DirectionsCarIcon /></Avatar>
                          <Box>
                            <Typography variant="subtitle2" sx={{ color: 'text.primary', fontWeight: 800, mb: 0.25 }}>{v?.marca} {v?.modelo} • {v?.placa}</Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>{getClienteNome(v?.clienteId || '')}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 700 }}>{dayjs(o.dataEntrada).format('DD MMM YYYY')}</Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500 }}>{dayjs(o.dataEntrada).fromNow()}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={o.status} 
                          size="small" 
                          sx={{ 
                            height: 26, 
                            fontSize: '0.65rem', 
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            bgcolor: style.bg, 
                            color: style.color, 
                            border: '1px solid',
                            borderColor: 'transparent',
                            borderRadius: 1.5,
                            '& .MuiChip-label': { px: 1.5 }
                          }} 
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="subtitle1" sx={{ color: 'primary.main', fontWeight: 900, fontFamily: 'monospace' }}>R$ {o.valorTotal.toFixed(2)}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton size="small" onClick={(e) => { setAnchorEl(e.currentTarget); setSelectedOrdem(o); }} sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}><MoreVertIcon fontSize="small" /></IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Ticket Workspace */}
      <Dialog fullScreen open={workspaceOpen} onClose={() => setWorkspaceOpen(false)}>
        <Grid container sx={{ height: '100vh' }}>
          {/* Left: Search & Catalog */}
          <Grid item xs={12} md={8} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'white' }}>
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 3 }}>
              <IconButton onClick={() => setWorkspaceOpen(false)} sx={{ bgcolor: 'rgba(0,0,0,0.04)' }}><CloseIcon fontSize="small" /></IconButton>
              <Paper elevation={0} sx={{ flex: 1, bgcolor: 'rgba(0,0,0,0.03)', borderRadius: 4, px: 2.5, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ color: 'text.secondary', opacity: 0.4, mr: 1.5 }} />
                <InputBase fullWidth autoFocus placeholder="DIGITE PLACA, SERVIÇO OU PEÇA..." value={workspaceSearch} onChange={(e) => setWorkspaceSearch(e.target.value)} sx={{ py: 2, fontSize: '1rem', fontWeight: 800, color: 'text.primary', letterSpacing: '0.01em' }} />
              </Paper>
            </Box>
            <Box sx={{ flex: 1, overflowY: 'auto', p: { xs: 3, md: 6 } }}>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 800, mb: 4, display: 'block', letterSpacing: '0.1em', opacity: 0.6 }}>CATÁLOGO MICHELIN</Typography>
              <Grid container spacing={3}>
                {catalogoMisto.slice(0, 16).map((item) => (
                  <Grid item xs={6} sm={4} lg={3} key={`${item.type}-${item.id}`}>
                    <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s ease', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-4px)', boxShadow: '0 12px 24px -10px rgba(0,0,0,0.1)' } }}>
                      <CardActionArea sx={{ p: 2.5 }} onClick={() => setTicketItems(p => [...p, { ...item, uid: Math.random() }])}>
                        <Avatar sx={{ bgcolor: item.type === 'servico' ? 'emerald.50' : 'blue.50', color: item.type === 'servico' ? '#10b981' : '#3b82f6', mb: 2, borderRadius: 2.5, width: 44, height: 44 }}>
                          {item.type === 'servico' ? <BuildIcon fontSize="small" /> : <InventoryIcon fontSize="small" />}
                        </Avatar>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 1, minHeight: '2.6em' }}>{item.nome}</Typography>
                        <Typography variant="h6" sx={{ color: 'primary.main', fontWeight: 900, fontSize: '1.1rem' }}>R$ {item.valor.toFixed(2)}</Typography>
                      </CardActionArea>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Grid>
          {/* Right: The Ticket */}
          <Grid item xs={12} md={4} sx={{ bgcolor: '#fafafa', borderLeft: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: { xs: 3, md: 5 }, flex: 1, overflowY: 'auto' }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 900, mb: 3, display: 'block', letterSpacing: '0.1em' }}>TICKET ATUAL</Typography>
              {ticketVehicle ? (
                <Paper elevation={0} sx={{ p: 3, mt: 2, borderRadius: 4, bgcolor: 'primary.main', color: 'white', boxShadow: '0 12px 24px -8px rgba(0,0,0,0.3)' }}>
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2.5, width: 52, height: 52 }}><DirectionsCarIcon /></Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.02em' }}>{ticketVehicle.marca} {ticketVehicle.modelo}</Typography>
                      <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 800, letterSpacing: '0.05em' }}>PLACA: {ticketVehicle.placa}</Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setTicketVehicle(null)} sx={{ color: 'white' }}><CloseIcon fontSize="small" /></IconButton>
                  </Stack>
                </Paper>
              ) : (
                <Box sx={{ mt: 2, p: 5, border: '2px dashed', borderColor: 'divider', borderRadius: 4, textAlign: 'center', bgcolor: 'white' }}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 700 }}>Vincular Veículo</Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block', opacity: 0.7 }}>Digite a placa na busca para anexar.</Typography>
                </Box>
              )}
              <List sx={{ mt: 4 }}>
                {ticketItems.map((item) => (
                  <ListItem key={item.uid} disableGutters sx={{ mb: 2, px: 2, py: 1.5, bgcolor: 'white', borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                    <Avatar sx={{ width: 36, height: 36, mr: 2, bgcolor: 'rgba(0,0,0,0.03)', color: 'text.secondary', borderRadius: 1.5 }}>
                      {item.type === 'servico' ? <BuildIcon sx={{ fontSize: 16 }} /> : <InventoryIcon sx={{ fontSize: 16 }} />}
                    </Avatar>
                    <ListItemText primary={item.nome} primaryTypographyProps={{ variant: 'subtitle2', sx: { color: 'text.primary', fontWeight: 700, fontSize: '0.85rem' } }} />
                    <Stack alignItems="flex-end" sx={{ ml: 2 }}>
                      <Typography variant="body2" sx={{ color: 'primary.main', fontWeight: 900, fontFamily: 'monospace' }}>R$ {item.valor.toFixed(2)}</Typography>
                      <IconButton size="small" color="error" onClick={() => setTicketItems(p => p.filter(i => i.uid !== item.uid))} sx={{ mt: 0.25 }}><DeleteOutlineIcon fontSize="small" sx={{ fontSize: 16 }} /></IconButton>
                    </Stack>
                  </ListItem>
                ))}
              </List>
              <TextField fullWidth placeholder="Observações técnicas..." multiline rows={3} value={descricao} onChange={(e) => setDescricao(e.target.value)} sx={{ mt: 3, '& .MuiOutlinedInput-root': { borderRadius: 3, bgcolor: 'white' } }} />
            </Box>
            <Paper elevation={0} sx={{ p: { xs: 3, md: 5 }, borderRadius: '32px 32px 0 0', borderTop: '1px solid', borderColor: 'divider', bgcolor: 'white', boxShadow: '0 -8px 24px rgba(0,0,0,0.04)' }}>
              <Stack direction="row" justifyContent="space-between" mb={4} alignItems="center">
                <Typography variant="subtitle1" sx={{ color: 'text.secondary', fontWeight: 700 }}>Total</Typography>
                <Typography variant="h2" sx={{ color: 'primary.main', fontWeight: 900, letterSpacing: '-0.04em' }}>R$ {liveTotal.toFixed(2)}</Typography>
              </Stack>
              {editingId ? (
                <Button fullWidth variant="contained" size="large" disableElevation onClick={() => handleSaveOS(selectedOrdem?.status || 'Em andamento')} disabled={!ticketVehicle} sx={{ borderRadius: 3, height: 60, fontWeight: 900 }}>
                  SALVAR ALTERAÇÕES
                </Button>
              ) : (
                <Stack direction="row" spacing={2}>
                  <Button fullWidth variant="outlined" size="large" onClick={() => handleSaveOS('Aguardando aprovação')} sx={{ borderRadius: 3, height: 60, fontWeight: 800, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>ORÇAMENTO</Button>
                  <Button fullWidth variant="contained" size="large" disableElevation onClick={() => handleSaveOS('Em andamento')} disabled={!ticketVehicle} sx={{ borderRadius: 3, height: 60, fontWeight: 900, bgcolor: 'success.main', '&:hover': { bgcolor: 'success.dark' } }}>INICIAR OS</Button>
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