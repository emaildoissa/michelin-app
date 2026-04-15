import React, { useEffect, useState } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress
} from '@mui/material';
import {
  Build as BuildIcon,
  AttachMoney as MoneyIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  DirectionsCar as CarIcon
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
  const [stats, setStats] = useState<DashboardStats>({
    osAbertas: 0,
    faturamentoMensal: 0,
    clientesNovos: 0,
    estoqueBaixo: 0,
    recentesOS: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [osRes, clientesRes, pecasRes] = await Promise.all([
          api.get('/ordens_servico'),
          api.get('/clientes'),
          api.get('/pecas')
        ]);

        console.log("Dados OS recebidos:", osRes.data); // Verifique o console do navegador (F12)

        // Lógica de soma robusta (trata nulls e diferentes nomenclaturas)
        const osAbertasCount = osRes.data.filter((os: any) =>
          os.status !== 'Concluída' && os.status !== 'Finalizada'
        ).length;

        const faturamento = osRes.data
          .filter((os: any) => os.status === 'Concluída' || os.status === 'Finalizada')
          .reduce((acc: number, curr: any) => {
            // Tenta pegar valor_total ou valorTotal
            const valor = curr.valor_total || curr.valorTotal || 0;
            return acc + Number(valor);
          }, 0);

        setStats({
          osAbertas: osAbertasCount,
          faturamentoMensal: faturamento,
          clientesNovos: clientesRes.data.length,
          estoqueBaixo: pecasRes.data.filter((p: any) => (p.quantidade || 0) < 5).length,
          recentesOS: osRes.data.slice(0, 5) // Mostra as 5 primeiras da lista
        });
      } catch (error) {
        console.error("Erro no Dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle }: any) => (
    <Card sx={{
      height: '100%',
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      boxShadow: 1
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 'bold' }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ my: 1, fontWeight: 800 }}>
              {value}
            </Typography>
            <Typography variant="caption" sx={{ color: color === 'error' ? 'error.main' : 'text.secondary', fontWeight: 600 }}>
              {subtitle}
            </Typography>
          </Box>
          {/* O círculo colorido do ícone */}
          <Box sx={{
            bgcolor: `${color}.main`,
            color: `${color}.contrastText`,
            p: 1.5,
            borderRadius: '12px',
            display: 'flex',
            height: 'fit-content'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <CircularProgress color="primary" />
    </Box>
  );

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 4, fontWeight: 900 }}>
        Dashboard Administrativo
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="OS em Aberto"
            value={stats.osAbertas}
            icon={<BuildIcon />}
            color="primary" // Usa a cor preta do seu tema
            subtitle="Pendentes de execução"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Receita Concluída"
            value={`R$ ${stats.faturamentoMensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
            icon={<MoneyIcon />}
            color="success" // Usa o verde esmeralda do seu tema
            subtitle="Total faturado"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Clientes"
            value={stats.clientesNovos}
            icon={<PeopleIcon />}
            color="info" // Cor padrão MUI para info
            subtitle="Cadastros totais"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Atenção Estoque"
            value={stats.estoqueBaixo}
            icon={<InventoryIcon />}
            color={stats.estoqueBaixo > 0 ? "error" : "success"}
            subtitle="Itens críticos"
          />
        </Grid>

        <Grid item xs={12}>
          <TableContainer component={Paper} sx={{ mt: 3, border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <CarIcon color="primary" />
              <Typography variant="h6">Ordens de Serviço Recentes</Typography>
            </Box>
            <Table>
              <TableHead sx={{ bgcolor: 'action.hover' }}>
                <TableRow>
                  <TableCell>Status</TableCell>
                  <TableCell>Descrição do Problema</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stats.recentesOS.map((os, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Chip
                        label={os.status}
                        size="small"
                        color={os.status === 'Concluída' || os.status === 'Finalizada' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{os.descricao_problema || os.descricao || 'Sem descrição'}</TableCell>
                    <TableCell align="right">
                      R$ {Number(os.valor_total || os.valorTotal || 0).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;