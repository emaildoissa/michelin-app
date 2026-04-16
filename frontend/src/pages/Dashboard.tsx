import React, { useEffect, useState } from 'react';
import {
  Grid, Paper, Typography, Box, Card, CardContent, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Chip, CircularProgress,
  Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl,
  InputLabel, Select, MenuItem, IconButton
} from '@mui/material';
import {
  Build as BuildIcon, AttachMoney as MoneyIcon, People as PeopleIcon,
  Inventory as InventoryIcon, DirectionsCar as CarIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import api from '../services/api';

interface DashboardStats {
  osAbertas: number;
  faturamentoMensal: number;
  clientesNovos: number;
  estoqueBaixo: number;
  recentesOS: any[];
}

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [selectedOS, setSelectedOS] = useState<any>(null);
  const [formaPagamento, setFormaPagamento] = useState('Pix');
  const [stats, setStats] = useState<DashboardStats>({
    osAbertas: 0, faturamentoMensal: 0, clientesNovos: 0, estoqueBaixo: 0, recentesOS: []
  });

  // 1. Lógica de busca e ordenação
  const fetchData = async () => {
    try {
      const [osRes, clientesRes, pecasRes] = await Promise.all([
        api.get('/ordens_servico'),
        api.get('/clientes'),
        api.get('/pecas')
      ]);

      // ORDENAÇÃO: Finalizadas por último
      const ordensOrdenadas = osRes.data.sort((a: any, b: any) => {
        if (a.status === 'Finalizada' && b.status !== 'Finalizada') return 1;
        if (a.status !== 'Finalizada' && b.status === 'Finalizada') return -1;
        return 0;
      });

      const faturamento = ordensOrdenadas
        .filter((os: any) => os.status === 'Finalizada' || os.status === 'Concluída')
        .reduce((acc: number, curr: any) => acc + Number(curr.valorTotal || 0), 0);

      setStats({
        osAbertas: ordensOrdenadas.filter((os: any) => os.status !== 'Finalizada').length,
        faturamentoMensal: faturamento,
        clientesNovos: clientesRes.data.length,
        estoqueBaixo: pecasRes.data.filter((p: any) => (p.quantidade || 0) < 5).length,
        recentesOS: ordensOrdenadas.slice(0, 10)
      });
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Função para abrir o modal
  const handleOpenFinalizar = (os: any) => {
    setSelectedOS(os);
    setOpenModal(true);
  };

  // Função que realmente chama a API para finalizar
  const handleConfirmarFinalizacao = async () => {
    try {
      await api.put(`/ordens_servico/${selectedOS?.id}`, {
        status: 'Finalizada',
        forma_pagamento: formaPagamento, // Enviando a opção profissional
        data_fim: new Date()
      });
      setOpenModal(false);
      fetchData(); // Recarrega os dados para atualizar o dashboard
    } catch (error) {
      alert("Erro ao finalizar O.S.");
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{ 
      height: '100%', 
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
      '&:hover': { transform: 'translateY(-4px)', boxShadow: 4 }
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ 
              bgcolor: `${color}.main`, 
              color: `${color}.contrastText`, 
              p: 1.25, 
              borderRadius: '10px', 
              display: 'flex',
              boxShadow: `0 4px 12px ${color === 'primary' ? 'rgba(0,0,0,0.1)' : 'rgba(16,185,129,0.2)'}`
            }}>
              {React.cloneElement(icon as React.ReactElement, { fontSize: 'small' })}
            </Box>
            <Typography variant="caption" sx={{ color: color === 'error' ? 'error.main' : 'text.secondary', fontWeight: 800 }}>
              {subtitle}
            </Typography>
          </Box>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 700, opacity: 0.8 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ mt: 0.5, fontWeight: 900, letterSpacing: '-0.02em' }}>
              {value}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}><CircularProgress thickness={5} size={50} /></Box>;

  return (
    <Box sx={{ py: 2 }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 900, letterSpacing: '-0.03em' }}>
          Visão Geral
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mt: 1 }}>
          Acompanhe o desempenho da sua oficina em tempo real.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="OS em Aberto" value={stats.osAbertas} icon={<BuildIcon />} color="primary" subtitle="Pendentes" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Receita Concluída" value={`R$ ${stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<MoneyIcon />} color="success" subtitle="+12% este mês" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Total Clientes" value={stats.clientesNovos} icon={<PeopleIcon />} color="primary" subtitle="Base ativa" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Estoque Crítico" value={stats.estoqueBaixo} icon={<InventoryIcon />} color={stats.estoqueBaixo > 0 ? "error" : "success"} subtitle="Reposição" /></Grid>

        <Grid item xs={12}>
          <Box sx={{ mt: 4 }}>
            <Paper sx={{ overflow: 'hidden', borderRadius: 4 }}>
              <Box sx={{ px: 4, py: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CarIcon sx={{ color: 'primary.main', opacity: 0.8 }} />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>Atividade Recente</Typography>
                </Box>
                <Button size="small" sx={{ fontWeight: 700 }}>Ver Todas</Button>
              </Box>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Status</TableCell>
                      <TableCell>Descrição do Serviço</TableCell>
                      <TableCell align="right">Valor Total</TableCell>
                      <TableCell align="center">Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.recentesOS.map((os) => (
                      <TableRow key={os.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Chip 
                            label={os.status} 
                            size="small" 
                            sx={{ 
                              fontWeight: 900, 
                              fontSize: '0.65rem',
                              textTransform: 'uppercase',
                              letterSpacing: '0.05em',
                              bgcolor: os.status === 'Finalizada' ? 'rgba(46, 125, 50, 0.12)' : 'rgba(237, 108, 2, 0.12)',
                              color: os.status === 'Finalizada' ? '#1b5e20' : '#e65100',
                              border: '1px solid',
                              borderColor: os.status === 'Finalizada' ? 'rgba(46, 125, 50, 0.2)' : 'rgba(237, 108, 2, 0.2)',
                              '& .MuiChip-label': { px: 1.5 }
                            }} 
                          />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>
                          {os.descricao || 'Sem descrição detalhada'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, fontFamily: 'monospace', fontSize: '1rem' }}>
                          R$ {Number(os.valorTotal || 0).toFixed(2)}
                        </TableCell>
                        <TableCell align="center">
                          {os.status !== 'Finalizada' ? (
                            <Button
                              variant="contained"
                              size="small"
                              disableElevation
                              sx={{ 
                                borderRadius: 2, 
                                py: 0.5, 
                                px: 2, 
                                fontSize: '0.75rem',
                                bgcolor: 'primary.main',
                                '&:hover': { bgcolor: 'primary.dark' }
                              }}
                              startIcon={<CheckIcon sx={{ fontSize: '1rem !important' }} />}
                              onClick={() => handleOpenFinalizar(os)}
                            >
                              Finalizar
                            </Button>
                          ) : (
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>Concluído</Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* MODAL DE FINALIZAÇÃO (Opção B) */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)}>
        <DialogTitle sx={{ fontWeight: 'bold' }}>Finalizar Ordem de Serviço</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Confirmar recebimento da OS: <strong>#{selectedOS?.numero_sequencial || '---'}</strong>
          </Typography>
          <Typography variant="h6" color="success.main" sx={{ mb: 3 }}>
            Valor Total: R$ {Number(selectedOS?.valorTotal || 0).toFixed(2)}
          </Typography>

          <FormControl fullWidth>
            <InputLabel>Forma de Pagamento</InputLabel>
            <Select
              value={formaPagamento}
              label="Forma de Pagamento"
              onChange={(e) => setFormaPagamento(e.target.value)}
            >
              <MenuItem value="Pix">Pix</MenuItem>
              <MenuItem value="Cartão de Crédito">Cartão de Crédito</MenuItem>
              <MenuItem value="Cartão de Débito">Cartão de Débito</MenuItem>
              <MenuItem value="Dinheiro">Dinheiro</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenModal(false)} color="inherit">Cancelar</Button>
          <Button onClick={handleConfirmarFinalizacao} variant="contained" color="success">
            Confirmar Recebimento
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;