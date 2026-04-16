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
    <Card sx={{ height: '100%', border: '1px solid', borderColor: 'divider', boxShadow: 1 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>{title}</Typography>
            <Typography variant="h4" sx={{ my: 1, fontWeight: 800 }}>{value}</Typography>
            <Typography variant="caption" sx={{ color: color === 'error' ? 'error.main' : 'text.secondary', fontWeight: 600 }}>{subtitle}</Typography>
          </Box>
          <Box sx={{ bgcolor: `${color}.main`, color: `${color}.contrastText`, p: 1.5, borderRadius: '12px', display: 'flex', height: 'fit-content' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}><CircularProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 900 }}>Dashboard Administrativo</Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}><StatCard title="OS em Aberto" value={stats.osAbertas} icon={<BuildIcon />} color="primary" subtitle="Pendentes" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Receita Concluída" value={`R$ ${stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} icon={<MoneyIcon />} color="success" subtitle="Total faturado" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Clientes" value={stats.clientesNovos} icon={<PeopleIcon />} color="info" subtitle="Cadastros" /></Grid>
        <Grid item xs={12} sm={6} md={3}><StatCard title="Atenção Estoque" value={stats.estoqueBaixo} icon={<InventoryIcon />} color={stats.estoqueBaixo > 0 ? "error" : "success"} subtitle="Críticos" /></Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ mt: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CarIcon color="primary" />
              <Typography variant="h6">Controle de Ordens de Serviço</Typography>
            </Box>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Problema</TableCell>
                  <TableCell align="right">Valor</TableCell>
                  <TableCell align="center">Ação Rápida</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentesOS.map((os) => (
                  <TableRow key={os.id}>
                    <TableCell>
                      <Chip label={os.status} size="small" color={os.status === 'Finalizada' ? 'success' : 'warning'} />
                    </TableCell>
                    <TableCell>{os.descricao || 'Sem descrição'}</TableCell>
                    <TableCell align="right">R$ {Number(os.valorTotal || 0).toFixed(2)}</TableCell>
                    <TableCell align="center">
                      {os.status !== 'Finalizada' && (
                        <Button
                          variant="contained"
                          size="small"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleOpenFinalizar(os)}
                        >
                          Finalizar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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