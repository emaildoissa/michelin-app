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
        <Typography variant="h4" sx={{ fontWeight: 900, color: 'primary.main', mb: 3 }}>
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
            boxShadow: '0 12px 40px rgba(0,45,114,0.12)',
            transition: 'transform 0.2s',
            '&:hover': { transform: 'translateY(-2px)' }
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}><SearchIcon /></Avatar>
          <InputBase
            sx={{ flex: 1, fontSize: '1.2rem', fontWeight: 700 }}
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
            sx={{ borderRadius: 4, px: 4, fontWeight: 800 }}
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
                p: 4, 
                bgcolor: 'primary.main', 
                color: 'primary.contrastText', 
                borderRadius: 4,
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="overline" sx={{ fontWeight: 800, opacity: 0.8, letterSpacing: 2 }}>STATUS OPERACIONAL</Typography>
                  <Typography variant="h1" sx={{ fontWeight: 900, mb: 1 }}>{ordensAtivas}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 500, opacity: 0.9 }}>Veículos sendo atendidos agora</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', minWidth: 100, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{totalClientes}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>CLIENTES</Typography>
                  </Box>
                  <Box sx={{ p: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.1)', minWidth: 100, textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 900 }}>{totalVeiculos}</Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, opacity: 0.7 }}>VEÍCULOS</Typography>
                  </Box>
                </Stack>
              </Stack>
              <BuildCircleIcon sx={{ position: 'absolute', right: -40, bottom: -40, fontSize: 240, opacity: 0.05, transform: 'rotate(-20deg)' }} />
            </Paper>

            <Box>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AssignmentIcon color="primary" /> ATIVIDADES EM ANDAMENTO
              </Typography>
              <Grid container spacing={2}>
                {ordensRecentes.map((ordem) => {
                  const veiculo = veiculos.find(v => v.id === ordem.veiculoId);
                  return (
                    <Grid item xs={12} sm={6} key={ordem.id}>
                      <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'primary.main' } }}>
                        <CardContent sx={{ p: 3 }}>
                          <Stack direction="row" justifyContent="space-between" mb={2}>
                            <Chip label={ordem.status} size="small" sx={{ fontWeight: 800, borderRadius: 1.5, bgcolor: 'primary.50', color: 'primary.main' }} />
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.disabled' }}>OS #{ordem.id.slice(-6).toUpperCase()}</Typography>
                          </Stack>
                          <Typography variant="h6" sx={{ fontWeight: 800 }}>{veiculo?.marca} {veiculo?.modelo}</Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>{veiculo?.placa}</Typography>
                          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700 }}>{new Date(ordem.dataEntrada).toLocaleDateString('pt-BR')}</Typography>
                            <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main' }}>R$ {ordem.valorTotal.toFixed(2)}</Typography>
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
            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'secondary.main', color: 'secondary.contrastText' }}>
              <Typography variant="overline" sx={{ fontWeight: 900, opacity: 0.8 }}>RECEITA TOTAL</Typography>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 1 }}>R$ {faturamentoTotal.toFixed(2)}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>Volume total processado em serviços finalizados e orçamentos.</Typography>
              <Button variant="contained" sx={{ mt: 3, bgcolor: 'white', color: 'black', fontWeight: 800, '&:hover': { bgcolor: 'grey.100' } }} fullWidth>
                RELATÓRIO COMPLETO
              </Button>
            </Paper>

            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 900, mb: 3 }}>CLIENTES RECENTES</Typography>
              <List disablePadding>
                {clientes.slice(0, 3).map((cliente) => (
                  <ListItem key={cliente.id} disableGutters sx={{ py: 1.5 }}>
                    <Avatar sx={{ mr: 2, bgcolor: 'grey.100', color: 'text.secondary' }}><PeopleIcon /></Avatar>
                    <ListItemText primary={cliente.nome} primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 800 }} secondary="Cliente desde o registro" />
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