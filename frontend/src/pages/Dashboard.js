import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Grid, Paper, Typography, Card, CardContent, CardHeader, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useEffect, useState } from 'react';
import api from '../services/api';
const Dashboard = () => {
    const [clientes, setClientes] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [ordensServico, setOrdensServico] = useState([]);
    const [loading, setLoading] = useState(true);
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
    return (_jsxs(Box, { sx: { flexGrow: 1, backgroundColor: '#f0f2f5', minHeight: 'calc(100vh - 64px)', p: 3, borderRadius: '16px' }, children: [
        _jsx(Typography, { variant: "h4", gutterBottom: true, sx: { mb: 4, fontWeight: 800, color: '#1a1a1a', textAlign: 'left', letterSpacing: '-0.5px' }, children: "Dashboard" }), 
        _jsxs(Grid, { container: true, spacing: 3, children: [
            _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: 
                _jsxs(Paper, { elevation: 0, sx: { 
                    p: 3, 
                    textAlign: 'left', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    minHeight: '140px', 
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    borderLeft: '5px solid #000000',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
                }, children: [
                    _jsx(Typography, { variant: "body2", sx: { color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }, children: "Clientes" }), 
                    _jsx(Typography, { variant: "h3", sx: { fontWeight: 800, color: '#000000' }, children: totalClientes }), 
                    _jsx(Typography, { variant: "caption", sx: { color: 'text.secondary', mt: 1 }, children: "Total cadastrado" })
                ] })
            }), 
            _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: 
                _jsxs(Paper, { elevation: 0, sx: { 
                    p: 3, 
                    textAlign: 'left', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    minHeight: '140px', 
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    borderLeft: '5px solid #333333',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
                }, children: [
                    _jsx(Typography, { variant: "body2", sx: { color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }, children: "Veículos" }), 
                    _jsx(Typography, { variant: "h3", sx: { fontWeight: 800, color: '#000000' }, children: totalVeiculos }), 
                    _jsx(Typography, { variant: "caption", sx: { color: 'text.secondary', mt: 1 }, children: "Total cadastrado" })
                ] })
            }), 
            _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: 
                _jsxs(Paper, { elevation: 0, sx: { 
                    p: 3, 
                    textAlign: 'left', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    minHeight: '140px', 
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0',
                    borderLeft: '5px solid #666666',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }
                }, children: [
                    _jsx(Typography, { variant: "body2", sx: { color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }, children: "Em Andamento" }), 
                    _jsx(Typography, { variant: "h3", sx: { fontWeight: 800, color: '#000000' }, children: ordensEmAndamento }), 
                    _jsx(Typography, { variant: "caption", sx: { color: 'text.secondary', mt: 1 }, children: "Serviços ativos" })
                ] })
            }), 
            _jsx(Grid, { item: true, xs: 12, sm: 6, md: 3, children: 
                _jsxs(Paper, { elevation: 0, sx: { 
                    p: 3, 
                    textAlign: 'left', 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    minHeight: '140px', 
                    borderRadius: '12px',
                    border: '1px solid #000000',
                    bgcolor: '#000000',
                    color: '#ffffff',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 15px 40px rgba(0,0,0,0.2)' }
                }, children: [
                    _jsx(Typography, { variant: "body2", sx: { color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', mb: 1 }, children: "Faturamento" }), 
                    _jsxs(Typography, { variant: "h4", sx: { fontWeight: 900 }, children: ["R$ ", faturamentoTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })] }), 
                    _jsx(Typography, { variant: "caption", sx: { color: 'rgba(255,255,255,0.5)', mt: 1 }, children: "Total acumulado" })
                ] })
            }), 
            _jsx(Grid, { item: true, xs: 12, md: 7, children: 
                _jsxs(Card, { elevation: 0, sx: { borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }, children: [
                    _jsx(CardHeader, { title: "Ordens de Serviço Recentes", titleTypographyProps: { fontWeight: 800 } }), 
                    _jsx(CardContent, { sx: { p: 0 }, children: ordensRecentes.length > 0 ? (_jsx(List, { sx: { p: 0 }, children: ordensRecentes.map((ordem) => {
                                            const veiculo = veiculos.find(v => v.id === ordem.veiculoId);
                                            return (_jsxs("div", { children: [
                                                _jsx(ListItem, { sx: { py: 2, px: 3 }, children: 
                                                    _jsx(ListItemText, { 
                                                        primary: `OS #${ordem.id.slice(0,8)}...`, 
                                                        primaryTypographyProps: { fontWeight: 700 },
                                                        secondary: _jsxs(Box, { sx: { mt: 1 }, children: [
                                                            _jsx(Typography, { component: "span", variant: "body2", sx: { fontWeight: 600, color: 'text.primary' }, children: veiculo ? `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})` : 'Veículo não encontrado' }), 
                                                            _jsx("br", {}), 
                                                            _jsxs(Box, { sx: { mt: 1, display: 'flex', gap: 1, alignItems: 'center' }, children: [
                                                                _jsx(Box, { sx: { px: 1, py: 0.25, bgcolor: '#f0f0f0', borderRadius: '4px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }, children: ordem.status }),
                                                                _jsx(Typography, { component: "span", variant: "caption", sx: { color: 'text.secondary' }, children: new Date(ordem.dataEntrada).toLocaleDateString('pt-BR') }),
                                                                _jsxs(Typography, { component: "span", variant: "subtitle2", sx: { ml: 'auto', fontWeight: 800, color: '#000000' }, children: ["R$ ", ordem.valorTotal.toFixed(2)] })
                                                            ] })
                                                        ] }) 
                                                    }) 
                                                }), 
                                                _jsx(Divider, {})
                                            ] }, ordem.id));
                                        }) })) : (_jsx(Box, { sx: { p: 3 }, children: _jsx(Typography, { children: "Nenhuma ordem de serviço encontrada" }) })) })] })
            }), 
            _jsx(Grid, { item: true, xs: 12, md: 5, children: 
                _jsxs(Card, { elevation: 0, sx: { borderRadius: '16px', border: '1px solid #e0e0e0', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }, children: [
                    _jsx(CardHeader, { title: "Clientes Recentes", titleTypographyProps: { fontWeight: 800 } }), 
                    _jsx(CardContent, { sx: { p: 0 }, children: clientes.length > 0 ? (_jsx(List, { sx: { p: 0 }, children: clientes.slice(0, 5).map((cliente) => (_jsxs("div", { children: [
                                                _jsx(ListItem, { sx: { py: 2, px: 3 }, children: 
                                                    _jsx(ListItemText, { 
                                                        primary: cliente.nome, 
                                                        primaryTypographyProps: { fontWeight: 700 },
                                                        secondary: `${cliente.email || 'Sem email'} • ID: ${cliente.id.toString().slice(0,8)}...` 
                                                    }) 
                                                }), 
                                                _jsx(Divider, {})
                                            ] }, cliente.id))) })) : (_jsx(Box, { sx: { p: 3 }, children: _jsx(Typography, { children: "Nenhum cliente encontrado" }) })) })] })
            })
        ] })
    ] }));
};
export default Dashboard;
