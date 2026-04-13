import { Box, Grid, Paper, Typography, Card, CardContent, List, ListItem, ListItemText, Divider, Chip, Button, Fab, Stack, Avatar, InputBase, IconButton } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import AddIcon from '@mui/icons-material/Add';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PeopleIcon from '@mui/icons-material/People';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

interface Cliente {
  id: string;
  nome: string;
}

interface Veiculo {
  id: string;
  marca: string;
  modelo: string;
  placa: string;
}

interface OrdemServico {
  id: string;
  veiculoId: string;
  dataEntrada: string;
  status: string;
  valorTotal: number;
}

const Dashboard = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, veiculosRes, ordensRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/veiculos'),
          api.get('/ordens_servico')
        ]);
        setClientes(clientesRes.data);
        setVeiculos(veiculosRes.data);
        setOrdensServico(ordensRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalClientes = clientes.length;
  const totalVeiculos = veiculos.length;
  const ordensAtivas = ordensServico.filter(ordem => 
    ['Aguardando aprovação', 'Orçamento aprovado', 'Em andamento'].includes(ordem.status)
  ).length;
  const faturamentoTotal = ordensServico.reduce((acc, ordem) => acc + ordem.valorTotal, 0);

  const ordensRecentes = [...ordensServico]
    .sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime())
    .slice(0, 4);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Typography variant="h6" color="text.secondary">Sincronizando oficina...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 8 }}>
      {/* OVERDRIVE: Command Center Header */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
          Gestão de Atendimento
        </Typography>
        <Typography variant="h2" sx={{ color: 'primary.main', mb: 3 }}>
          CENTRAL DE COMANDO
        </Typography>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 1.5, 
            borderRadius: 5, 
            display: 'flex', 
            alignItems: 'center', 
            border: '2px solid', 
            borderColor: 'primary.main',
            bgcolor: 'white',
            boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><SearchIcon /></Avatar>
          <InputBase
            sx={{ flex: 1, fontSize: '1.125rem', fontWeight: 700 }}
            placeholder="Digite uma PLACA para iniciar um atendimento rápido..."
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                navigate('/ordens', { state: { openInstant: true, initialPlate: (e.target as HTMLInputElement).value } });
              }
            }}
          />
          <Button 
            variant="contained" 
            size="large" 
            onClick={() => navigate('/ordens', { state: { openInstant: true } })}
            sx={{ borderRadius: 4, px: 4, py: 1.5 }}
          >
            NOVA OS
          </Button>
        </Paper>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} lg={8}>
          <Stack spacing={4}>
            {/* StatHero Component */}
            <Paper 
              elevation={0}
              sx={{ 
                p: 5, 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText', 
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 900, letterSpacing: '0.15em' }}>STATUS OPERACIONAL</Typography>
                  <Typography variant="h1" sx={{ mt: 1, mb: 0.5 }}>{ordensAtivas}</Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, fontWeight: 500 }}>Veículos sendo atendidos agora</Typography>
                </Box>
                <Stack direction="row" spacing={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 900 }}>{totalClientes}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800 }}>CLIENTES</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h3" sx={{ fontWeight: 900 }}>{totalVeiculos}</Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, fontWeight: 800 }}>VEÍCULOS</Typography>
                  </Box>
                </Stack>
              </Stack>
              <BuildCircleIcon sx={{ position: 'absolute', right: -40, bottom: -40, fontSize: 280, opacity: 0.05, transform: 'rotate(-20deg)' }} />
            </Paper>

            <Box>
              <Typography variant="h5" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AssignmentIcon color="primary" fontSize="small" /> ATIVIDADES EM ANDAMENTO
              </Typography>
              <Grid container spacing={3}>
                {ordensRecentes.map((ordem) => {
                  const veiculo = veiculos.find(v => v.id === ordem.veiculoId);
                  return (
                    <Grid item xs={12} sm={6} key={ordem.id}>
                      <Card elevation={0} sx={{ borderRadius: 4, border: '1px solid', borderColor: '#E2E8F0', transition: 'border-color 0.2s', '&:hover': { borderColor: 'primary.main' } }}>
                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" justifyContent="space-between" mb={3}>
                            <Chip label={ordem.status} size="small" sx={{ height: 24, fontSize: '0.65rem', px: 0.5 }} />
                            <Typography variant="overline" sx={{ color: 'text.disabled' }}>OS #{ordem.id.slice(-6)}</Typography>
                          </Stack>
                          <Typography variant="h6" sx={{ mb: 0.5 }}>{veiculo?.marca} {veiculo?.modelo}</Typography>
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>{veiculo?.placa}</Typography>
                          <Divider sx={{ my: 2.5, borderStyle: 'dashed' }} />
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <Box>
                              <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mb: 0.5 }}>DATA ENTRADA</Typography>
                              <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>{new Date(ordem.dataEntrada).toLocaleDateString('pt-BR')}</Typography>
                            </Box>
                            <Typography variant="h5" sx={{ color: 'primary.main', fontWeight: 900 }}>R$ {ordem.valorTotal.toFixed(2)}</Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Stack>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Stack spacing={4}>
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <Typography variant="overline" sx={{ opacity: 0.8, fontWeight: 900 }}>RECEITA TOTAL</Typography>
              <Typography variant="h2" sx={{ mt: 1, mb: 1.5, letterSpacing: '-0.03em', color: 'inherit' }}>R$ {faturamentoTotal.toFixed(2)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, lineHeight: 1.5 }}>Volume total processado em serviços finalizados e orçamentos.</Typography>
              <Button variant="contained" sx={{ mt: 4, bgcolor: 'white', color: 'black', fontWeight: 800, '&:hover': { bgcolor: '#F1F5F9' } }} fullWidth>
                RELATÓRIO COMPLETO
              </Button>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 3, letterSpacing: '0.05em' }}>CLIENTES RECENTES</Typography>
              <List disablePadding>
                {clientes.slice(0, 3).map((cliente) => (
                  <ListItem key={cliente.id} disableGutters sx={{ py: 2 }}>
                    <Avatar sx={{ mr: 2, bgcolor: '#F1F5F9', color: 'text.secondary', width: 40, height: 40 }}><PeopleIcon fontSize="small" /></Avatar>
                    <ListItemText 
                      primary={cliente.nome} 
                      primaryTypographyProps={{ variant: 'subtitle2', sx: { color: 'text.primary' } }} 
                      secondary="Cliente registrado recentemente"
                      secondaryTypographyProps={{ variant: 'caption', sx: { color: 'text.disabled' } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;