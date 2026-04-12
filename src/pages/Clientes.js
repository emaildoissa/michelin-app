import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Snackbar, Alert, InputAdornment, TableSortLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
const clienteVazio = {
    nome: '',
    email: '',
    telefone: '',
    endereco: ''
};
const Clientes = () => {
    const [clientes, setClientes] = useState([]);
    const [clientesFiltrados, setClientesFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [formData, setFormData] = useState(clienteVazio);
    const [editingId, setEditingId] = useState(null);
    const [clienteParaDeletar, setClienteParaDeletar] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const [filtro, setFiltro] = useState('');
    const [ordenacao, setOrdenacao] = useState({
        campo: '',
        direcao: 'asc'
    });
    const fetchClientes = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/clientes');
            setClientes(response.data);
            setClientesFiltrados(response.data);
        }
        catch (error) {
            console.error('Erro ao buscar clientes:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao carregar clientes',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchClientes();
    }, []);
    const handleOpenForm = (cliente) => {
        if (cliente) {
            setFormData({
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone,
                endereco: cliente.endereco
            });
            setEditingId(cliente.id);
        }
        else {
            setFormData(clienteVazio);
            setEditingId(null);
        }
        setOpenForm(true);
    };
    const handleCloseForm = () => {
        setOpenForm(false);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSubmit = async () => {
        try {
            if (editingId) {
                await axios.put(`http://localhost:3001/clientes/${editingId}`, formData);
                setSnackbar({
                    open: true,
                    message: 'Cliente atualizado com sucesso',
                    severity: 'success'
                });
            }
            else {
                await axios.post('http://localhost:3001/clientes', formData);
                setSnackbar({
                    open: true,
                    message: 'Cliente adicionado com sucesso',
                    severity: 'success'
                });
            }
            handleCloseForm();
            fetchClientes();
        }
        catch (error) {
            console.error('Erro ao salvar cliente:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao salvar cliente',
                severity: 'error'
            });
        }
    };
    const handleOpenDelete = (id) => {
        setClienteParaDeletar(id);
        setOpenDelete(true);
    };
    const handleCloseDelete = () => {
        setOpenDelete(false);
    };
    const handleDelete = async () => {
        if (clienteParaDeletar) {
            try {
                await axios.delete(`http://localhost:3001/clientes/${clienteParaDeletar}`);
                setSnackbar({
                    open: true,
                    message: 'Cliente excluído com sucesso',
                    severity: 'success'
                });
                fetchClientes();
            }
            catch (error) {
                console.error('Erro ao excluir cliente:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao excluir cliente',
                    severity: 'error'
                });
            }
            handleCloseDelete();
        }
    };
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };
    const handleFiltroChange = (event) => {
        const valorFiltro = event.target.value.toLowerCase();
        setFiltro(valorFiltro);
        if (valorFiltro === '') {
            setClientesFiltrados(clientes);
        }
        else {
            const filtrados = clientes.filter(cliente => cliente.nome.toLowerCase().includes(valorFiltro) ||
                cliente.email.toLowerCase().includes(valorFiltro) ||
                cliente.telefone.toLowerCase().includes(valorFiltro) ||
                cliente.endereco.toLowerCase().includes(valorFiltro));
            setClientesFiltrados(filtrados);
        }
    };
    const handleOrdenacaoChange = (campo) => {
        const ehMesmoCampo = ordenacao.campo === campo;
        const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
        setOrdenacao({
            campo,
            direcao: novaDirecao
        });
        const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
            // Usando o campo diretamente como keyof Cliente, já que sabemos que é válido
            if (a[campo] < b[campo]) {
                return novaDirecao === 'asc' ? -1 : 1;
            }
            if (a[campo] > b[campo]) {
                return novaDirecao === 'asc' ? 1 : -1;
            }
            return 0;
        });
        setClientesFiltrados(clientesOrdenados);
    };
    // Aplicar ordenação quando os dados mudam
    useEffect(() => {
        if (ordenacao.campo !== '') {
            const clientesOrdenados = [...clientesFiltrados].sort((a, b) => {
                // Garantir que o campo não seja uma string vazia antes de usá-lo como índice
                const campoOrdenacao = ordenacao.campo;
                if (a[campoOrdenacao] < b[campoOrdenacao]) {
                    return ordenacao.direcao === 'asc' ? -1 : 1;
                }
                if (a[campoOrdenacao] > b[campoOrdenacao]) {
                    return ordenacao.direcao === 'asc' ? 1 : -1;
                }
                return 0;
            });
            setClientesFiltrados(clientesOrdenados);
        }
    }, [clientes]);
    return (_jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }, gutterBottom: true, children: "Clientes" }), _jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenForm(), fullWidth: window.innerWidth < 600, sx: { width: { xs: '100%', sm: 'auto' } }, children: "Novo Cliente" })] }), _jsx(Box, { sx: { mb: 3 }, children: _jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Buscar clientes por nome, email, telefone ou endere\u00E7o", value: filtro, onChange: handleFiltroChange, InputProps: {
                        startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                    } }) }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: _jsx(CircularProgress, {}) })) : (_jsx(TableContainer, { component: Paper, elevation: 3, sx: { overflowX: 'auto' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'nome', direction: ordenacao.campo === 'nome' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('nome'), children: "Nome" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'email', direction: ordenacao.campo === 'email' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('email'), children: "Email" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'telefone', direction: ordenacao.campo === 'telefone' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('telefone'), children: "Telefone" }) }), _jsx(TableCell, { children: "Endere\u00E7o" }), _jsx(TableCell, { align: "center", children: "A\u00E7\u00F5es" })] }) }), _jsx(TableBody, { children: clientesFiltrados.length > 0 ? (clientesFiltrados.map((cliente) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: cliente.id }), _jsx(TableCell, { children: cliente.nome }), _jsx(TableCell, { children: cliente.email }), _jsx(TableCell, { children: cliente.telefone }), _jsx(TableCell, { children: cliente.endereco }), _jsxs(TableCell, { align: "center", children: [_jsx(IconButton, { color: "primary", onClick: () => handleOpenForm(cliente), size: "small", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { color: "error", onClick: () => handleOpenDelete(cliente.id), size: "small", children: _jsx(DeleteIcon, {}) })] })] }, cliente.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", children: "Nenhum cliente cadastrado" }) })) })] }) })), _jsxs(Dialog, { open: openForm, onClose: handleCloseForm, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingId ? 'Editar Cliente' : 'Novo Cliente' }), _jsxs(DialogContent, { children: [_jsx(TextField, { autoFocus: true, margin: "dense", name: "nome", label: "Nome do Cliente", type: "text", fullWidth: true, variant: "outlined", value: formData.nome, onChange: handleInputChange, sx: { mb: 2, mt: 1 } }), _jsx(TextField, { margin: "dense", name: "email", label: "Email", type: "email", fullWidth: true, variant: "outlined", value: formData.email, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "telefone", label: "Telefone", type: "tel", fullWidth: true, variant: "outlined", value: formData.telefone, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "endereco", label: "Endere\u00E7o", type: "text", fullWidth: true, multiline: true, rows: 3, variant: "outlined", value: formData.endereco, onChange: handleInputChange })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseForm, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, color: "primary", variant: "contained", children: "Salvar" })] })] }), _jsxs(Dialog, { open: openDelete, onClose: handleCloseDelete, children: [_jsx(DialogTitle, { children: "Confirmar Exclus\u00E3o" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "Tem certeza que deseja excluir este cliente? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseDelete, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleDelete, color: "error", variant: "contained", children: "Excluir" })] })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleCloseSnackbar, severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
export default Clientes;
