import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Paper, Snackbar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Alert, FormControl, InputLabel, Select, MenuItem, InputAdornment, TableSortLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
const veiculoVazio = {
    clienteId: '',
    marca: '',
    modelo: '',
    ano: new Date().getFullYear(),
    placa: ''
};
const Veiculos = () => {
    const [veiculos, setVeiculos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [formData, setFormData] = useState(veiculoVazio);
    const [editingId, setEditingId] = useState(null);
    const [veiculoParaDeletar, setVeiculoParaDeletar] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const fetchData = async () => {
        try {
            setLoading(true);
            const [veiculosRes, clientesRes] = await Promise.all([
                axios.get('http://localhost:3001/veiculos'),
                axios.get('http://localhost:3001/clientes')
            ]);
            setVeiculos(veiculosRes.data);
            setClientes(clientesRes.data);
        }
        catch (error) {
            console.error('Erro ao buscar dados:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao carregar dados',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleOpenForm = (veiculo) => {
        if (veiculo) {
            setFormData({
                clienteId: veiculo.clienteId,
                marca: veiculo.marca,
                modelo: veiculo.modelo,
                ano: veiculo.ano,
                placa: veiculo.placa
            });
            setEditingId(veiculo.id);
        }
        else {
            setFormData(veiculoVazio);
            setEditingId(null);
        }
        setOpenForm(true);
    };
    const handleCloseForm = () => {
        setOpenForm(false);
        setFormData(veiculoVazio);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'ano' ? Number(value) : value
        }));
    };
    const handleSelectChange = (e) => {
        setFormData(prev => ({
            ...prev,
            clienteId: e.target.value
        }));
    };
    const handleSubmit = async () => {
        try {
            if (editingId) {
                await axios.put(`http://localhost:3001/veiculos/${editingId}`, formData);
                setSnackbar({
                    open: true,
                    message: 'Veículo atualizado com sucesso',
                    severity: 'success'
                });
            }
            else {
                await axios.post('http://localhost:3001/veiculos', formData);
                setSnackbar({
                    open: true,
                    message: 'Veículo adicionado com sucesso',
                    severity: 'success'
                });
            }
            handleCloseForm();
            fetchData();
        }
        catch (error) {
            console.error('Erro ao salvar veículo:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao salvar veículo',
                severity: 'error'
            });
        }
    };
    const handleOpenDelete = (id) => {
        setVeiculoParaDeletar(id);
        setOpenDelete(true);
    };
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setVeiculoParaDeletar(null);
    };
    const handleDelete = async () => {
        if (veiculoParaDeletar) {
            try {
                await axios.delete(`http://localhost:3001/veiculos/${veiculoParaDeletar}`);
                setSnackbar({
                    open: true,
                    message: 'Veículo excluído com sucesso',
                    severity: 'success'
                });
                fetchData();
            }
            catch (error) {
                console.error('Erro ao excluir veículo:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao excluir veículo',
                    severity: 'error'
                });
            }
            handleCloseDelete();
        }
    };
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };
    const getClienteNome = (clienteId) => {
        const cliente = clientes.find(c => c.id === clienteId);
        return cliente ? cliente.nome : 'Cliente não encontrado';
    };
    const [veiculosFiltrados, setVeiculosFiltrados] = useState([]);
    const [filtro, setFiltro] = useState('');
    const [ordenacao, setOrdenacao] = useState({ campo: '', direcao: 'asc' });
    useEffect(() => {
        fetchData();
    }, []);
    useEffect(() => {
        if (veiculos.length > 0) {
            setVeiculosFiltrados(veiculos);
        }
    }, [veiculos]);
    const handleFiltroChange = (event) => {
        const valorFiltro = event.target.value.toLowerCase();
        setFiltro(valorFiltro);
        if (valorFiltro === '') {
            setVeiculosFiltrados(veiculos);
        }
        else {
            const filtrados = veiculos.filter(veiculo => {
                const clienteNome = getClienteNome(veiculo.clienteId).toLowerCase();
                return (veiculo.marca.toLowerCase().includes(valorFiltro) ||
                    veiculo.modelo.toLowerCase().includes(valorFiltro) ||
                    veiculo.placa.toLowerCase().includes(valorFiltro) ||
                    clienteNome.includes(valorFiltro) ||
                    veiculo.ano.toString().includes(valorFiltro));
            });
            setVeiculosFiltrados(filtrados);
        }
    };
    const handleOrdenacaoChange = (campo) => {
        const ehMesmoCampo = ordenacao.campo === campo;
        const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
        setOrdenacao({
            campo,
            direcao: novaDirecao
        });
        const veiculosOrdenados = [...veiculosFiltrados].sort((a, b) => {
            if (campo === 'clienteId') {
                const nomeClienteA = getClienteNome(a.clienteId).toLowerCase();
                const nomeClienteB = getClienteNome(b.clienteId).toLowerCase();
                return novaDirecao === 'asc'
                    ? nomeClienteA.localeCompare(nomeClienteB)
                    : nomeClienteB.localeCompare(nomeClienteA);
            }
            const aValue = a[campo];
            const bValue = b[campo];
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return novaDirecao === 'asc'
                    ? aValue.localeCompare(bValue, 'pt-BR')
                    : bValue.localeCompare(aValue, 'pt-BR');
            }
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return novaDirecao === 'asc' ? aValue - bValue : bValue - aValue;
            }
            return 0;
        });
        setVeiculosFiltrados(veiculosOrdenados);
    };
    return (_jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }, gutterBottom: true, children: "Ve\u00EDculos" }), _jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenForm(), fullWidth: window.innerWidth < 600, sx: { width: { xs: '100%', sm: 'auto' } }, children: "Novo Ve\u00EDculo" })] }), _jsx(Box, { sx: { mb: 3 }, children: _jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Buscar ve\u00EDculos por marca, modelo, placa, ano ou cliente", value: filtro, onChange: handleFiltroChange, InputProps: {
                        startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                    } }) }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: _jsx(CircularProgress, {}) })) : (_jsx(TableContainer, { component: Paper, elevation: 3, sx: { overflowX: 'auto' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'clienteId', direction: ordenacao.campo === 'clienteId' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('clienteId'), children: "Cliente" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'marca', direction: ordenacao.campo === 'marca' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('marca'), children: "Marca" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'modelo', direction: ordenacao.campo === 'modelo' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('modelo'), children: "Modelo" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'ano', direction: ordenacao.campo === 'ano' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('ano'), children: "Ano" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'placa', direction: ordenacao.campo === 'placa' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('placa'), children: "Placa" }) }), _jsx(TableCell, { align: "center", children: "A\u00E7\u00F5es" })] }) }), _jsx(TableBody, { children: veiculosFiltrados.length > 0 ? (veiculosFiltrados.map((veiculo) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: veiculo.id }), _jsx(TableCell, { children: getClienteNome(veiculo.clienteId) }), _jsx(TableCell, { children: veiculo.marca }), _jsx(TableCell, { children: veiculo.modelo }), _jsx(TableCell, { children: veiculo.ano }), _jsx(TableCell, { children: veiculo.placa }), _jsxs(TableCell, { align: "center", children: [_jsx(IconButton, { color: "primary", onClick: () => handleOpenForm(veiculo), size: "small", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { color: "error", onClick: () => handleOpenDelete(veiculo.id), size: "small", children: _jsx(DeleteIcon, {}) })] })] }, veiculo.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, align: "center", children: "Nenhum ve\u00EDculo cadastrado" }) })) })] }) })), _jsxs(Dialog, { open: openForm, onClose: handleCloseForm, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingId ? 'Editar Veículo' : 'Novo Veículo' }), _jsxs(DialogContent, { children: [_jsxs(FormControl, { fullWidth: true, margin: "dense", sx: { mb: 2, mt: 1 }, children: [_jsx(InputLabel, { id: "cliente-label", children: "Cliente" }), _jsx(Select, { labelId: "cliente-label", value: formData.clienteId, onChange: handleSelectChange, label: "Cliente", children: clientes.map((cliente) => (_jsx(MenuItem, { value: cliente.id, children: cliente.nome }, cliente.id))) })] }), _jsx(TextField, { margin: "dense", name: "marca", label: "Marca", type: "text", fullWidth: true, variant: "outlined", value: formData.marca, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "modelo", label: "Modelo", type: "text", fullWidth: true, variant: "outlined", value: formData.modelo, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "ano", label: "Ano", type: "number", fullWidth: true, variant: "outlined", value: formData.ano, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "placa", label: "Placa", type: "text", fullWidth: true, variant: "outlined", value: formData.placa, onChange: handleInputChange })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseForm, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, color: "primary", variant: "contained", children: "Salvar" })] })] }), _jsxs(Dialog, { open: openDelete, onClose: handleCloseDelete, children: [_jsx(DialogTitle, { children: "Confirmar Exclus\u00E3o" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "Tem certeza que deseja excluir este ve\u00EDculo? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseDelete, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleDelete, color: "error", variant: "contained", children: "Excluir" })] })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleCloseSnackbar, severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
export default Veiculos;
