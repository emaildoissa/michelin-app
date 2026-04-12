import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Grid, Paper, Typography, Card, CardContent, CardHeader, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import axios from 'axios';
const Dashboard = () => {
    const [clientes, setClientes] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [ordensServico, setOrdensServico] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [clientesRes, veiculosRes, ordensRes] = await Promise.all([
                    axios.get('http://localhost:3001/clientes'),
                    axios.get('http://localhost:3001/veiculos'),
                    axios.get('http://localhost:3001/ordens_servico')
                ]);
                setClientes(clientesRes.data);
                setVeiculos(veiculosRes.data);
                setOrdensServico(ordensRes.data);
                setLoading(false);
            }
            catch (error) {
                console.error('Erro ao carregar dados:', error);
                setLoading(false);
            }
        };
        fetchData();
    }, []);
    // Calcular estatísticas
    const totalClientes = clientes.length;
    const totalVeiculos = veiculos.length;
    const ordensEmAndamento = ordensServico.filter(ordem => ordem.status === 'Em andamento').length;
    const faturamentoTotal = ordensServico.reduce((acc, ordem) => acc + ordem.valorTotal, 0);
    // Ordenar ordens de serviço por data (mais recentes primeiro)
    const ordensRecentes = [...ordensServico]
        .sort((a, b) => new Date(b.dataEntrada).getTime() - new Date(a.dataEntrada).getTime())
        .slice(0, 5);
    if (loading) {
        return _jsx(Typography, { children: "Carregando..." });
    }
    return (_jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, sx: { mb: 4 }, children: "Dashboard" }), _jsxs(Grid, { container: true, spacing: 3, children: [_jsx(Grid, { item: true, xs: 10, sm: 6, md: 3, children: _jsxs(Paper, { elevation: 3, sx: { p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px' }, children: [_jsx(Typography, { variant: "h6", color: "primary", children: "Clientes" }), _jsx(Typography, { variant: "h3", children: totalClientes }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total cadastrado" })] }) }), _jsx(Grid, { item: true, xs: 10, sm: 6, md: 3, children: _jsxs(Paper, { elevation: 3, sx: { p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px' }, children: [_jsx(Typography, { variant: "h6", color: "primary", children: "Ve\u00EDculos" }), _jsx(Typography, { variant: "h3", children: totalVeiculos }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total cadastrado" })] }) }), _jsx(Grid, { item: true, xs: 10, sm: 6, md: 3, children: _jsxs(Paper, { elevation: 3, sx: { p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px' }, children: [_jsx(Typography, { variant: "h6", color: "primary", children: "Ordens em Andamento" }), _jsx(Typography, { variant: "h3", children: ordensEmAndamento }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Servi\u00E7os em execu\u00E7\u00E3o" })] }) }), _jsx(Grid, { item: true, xs: 10, sm: 6, md: 3, children: _jsxs(Paper, { elevation: 3, sx: { p: 2, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', minHeight: '160px' }, children: [_jsx(Typography, { variant: "h6", color: "primary", children: "Faturamento" }), _jsxs(Typography, { variant: "h3", children: ["R$ ", faturamentoTotal.toFixed(2)] }), _jsx(Typography, { variant: "body2", color: "text.secondary", children: "Total acumulado" })] }) }), _jsx(Grid, { item: true, xs: 10, md: 6, children: _jsxs(Card, { elevation: 3, children: [_jsx(CardHeader, { title: "Ordens de Servi\u00E7o Recentes" }), _jsx(CardContent, { children: ordensRecentes.length > 0 ? (_jsx(List, { children: ordensRecentes.map((ordem) => {
                                            const veiculo = veiculos.find(v => v.id === ordem.veiculoId);
                                            return (_jsxs("div", { children: [_jsx(ListItem, { children: _jsx(ListItemText, { primary: `OS #${ordem.id} - ${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}`, secondary: _jsxs(_Fragment, { children: [_jsxs(Typography, { component: "span", variant: "body2", color: "text.primary", children: ["Status: ", ordem.status] }), _jsx("br", {}), _jsxs(Typography, { component: "span", variant: "body2", children: ["Data: ", new Date(ordem.dataEntrada).toLocaleDateString('pt-BR')] }), _jsx("br", {}), _jsxs(Typography, { component: "span", variant: "body2", children: ["Valor: R$ ", ordem.valorTotal.toFixed(2)] })] }) }) }), _jsx(Divider, {})] }, ordem.id));
                                        }) })) : (_jsx(Typography, { children: "Nenhuma ordem de servi\u00E7o encontrada" })) })] }) }), _jsx(Grid, { item: true, xs: 10, md: 6, children: _jsxs(Card, { elevation: 3, children: [_jsx(CardHeader, { title: "Clientes Recentes" }), _jsx(CardContent, { children: clientes.length > 0 ? (_jsx(List, { children: clientes.slice(0, 5).map((cliente) => (_jsxs("div", { children: [_jsx(ListItem, { children: _jsx(ListItemText, { primary: cliente.nome, secondary: `Cliente #${cliente.id}` }) }), _jsx(Divider, {})] }, cliente.id))) })) : (_jsx(Typography, { children: "Nenhum cliente encontrado" })) })] }) })] })] }));
};
export default Dashboard;
