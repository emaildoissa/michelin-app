import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import api from '../services/api';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Snackbar, Alert, InputAdornment, TableSortLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
const servicoVazio = {
    nome: '',
    descricao: '',
    valor: 0,
    tempoEstimado: ''
};
const Servicos = () => {
    const [servicos, setServicos] = useState([]);
    const [servicosFiltrados, setServicosFiltrados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [formData, setFormData] = useState(servicoVazio);
    const [editingId, setEditingId] = useState(null);
    const [servicoParaDeletar, setServicoParaDeletar] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [ordenacao, setOrdenacao] = useState({
        campo: '',
        direcao: 'asc'
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const fetchServicos = async () => {
        try {
            setLoading(true);
            const response = await api.get('/servicos');
            setServicos(response.data);
            setServicosFiltrados(response.data);
        }
        catch (error) {
            console.error('Erro ao buscar serviços:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao carregar serviços',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchServicos();
    }, []);
    const handleOpenForm = (servico) => {
        if (servico) {
            setFormData({
                nome: servico.nome,
                descricao: servico.descricao,
                valor: servico.valor,
                tempoEstimado: servico.tempoEstimado
            });
            setEditingId(servico.id);
        }
        else {
            setFormData(servicoVazio);
            setEditingId(null);
        }
        setOpenForm(true);
    };
    const handleCloseForm = () => {
        setOpenForm(false);
        setFormData(servicoVazio);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'valor' ? Number(value) : value
        }));
    };
    const handleSubmit = async () => {
        try {
            if (editingId) {
                await api.put(`/servicos/${editingId}`, formData);
                setSnackbar({
                    open: true,
                    message: 'Serviço atualizado com sucesso',
                    severity: 'success'
                });
            }
            else {
                await api.post('/servicos', formData);
                setSnackbar({
                    open: true,
                    message: 'Serviço adicionado com sucesso',
                    severity: 'success'
                });
            }
            handleCloseForm();
            fetchServicos();
        }
        catch (error) {
            console.error('Erro ao salvar serviço:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao salvar serviço',
                severity: 'error'
            });
        }
    };
    const handleOpenDelete = (id) => {
        setServicoParaDeletar(id);
        setOpenDelete(true);
    };
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setServicoParaDeletar(null);
    };
    const handleDelete = async () => {
        if (servicoParaDeletar) {
            try {
                await api.delete(`/servicos/${servicoParaDeletar}`);
                setSnackbar({
                    open: true,
                    message: 'Serviço excluído com sucesso',
                    severity: 'success'
                });
                fetchServicos();
            }
            catch (error) {
                console.error('Erro ao excluir serviço:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao excluir serviço',
                    severity: 'error'
                });
            }
            handleCloseDelete();
        }
    };
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };
    const formatarValor = (valor) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };
    const handleFiltroChange = (event) => {
        const valorFiltro = event.target.value.toLowerCase();
        setFiltro(valorFiltro);
        if (valorFiltro === '') {
            setServicosFiltrados(servicos);
        }
        else {
            const filtrados = servicos.filter(servico => servico.nome.toLowerCase().includes(valorFiltro) ||
                servico.descricao.toLowerCase().includes(valorFiltro) ||
                servico.valor.toString().includes(valorFiltro) ||
                servico.tempoEstimado.toLowerCase().includes(valorFiltro));
            setServicosFiltrados(filtrados);
        }
    };
    const handleOrdenacaoChange = (campo) => {
        const ehMesmoCampo = ordenacao.campo === campo;
        const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
        setOrdenacao({
            campo,
            direcao: novaDirecao
        });
        const servicosOrdenados = [...servicosFiltrados].sort((a, b) => {
            if (campo === 'valor') {
                return novaDirecao === 'asc' ? a.valor - b.valor : b.valor - a.valor;
            }
            const aValue = String(a[campo]).toLowerCase();
            const bValue = String(b[campo]).toLowerCase();
            return novaDirecao === 'asc'
                ? aValue.localeCompare(bValue, 'pt-BR')
                : bValue.localeCompare(aValue, 'pt-BR');
        });
        setServicosFiltrados(servicosOrdenados);
    };
    // Aplicar ordenação quando os dados mudam
    useEffect(() => {
        if (ordenacao.campo !== '') {
            const servicosOrdenados = [...servicosFiltrados].sort((a, b) => {
                const campoOrdenacao = ordenacao.campo;
                if (campoOrdenacao === 'valor') {
                    return ordenacao.direcao === 'asc' ? a.valor - b.valor : b.valor - a.valor;
                }
                const aValue = String(a[campoOrdenacao]).toLowerCase();
                const bValue = String(b[campoOrdenacao]).toLowerCase();
                return ordenacao.direcao === 'asc'
                    ? aValue.localeCompare(bValue, 'pt-BR')
                    : bValue.localeCompare(aValue, 'pt-BR');
            });
            setServicosFiltrados(servicosOrdenados);
        }
    }, [servicos]);
    return (_jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }, gutterBottom: true, children: "Servi\u00E7os" }), _jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenForm(), fullWidth: window.innerWidth < 600, sx: { width: { xs: '100%', sm: 'auto' } }, children: "Novo Servi\u00E7o" })] }), _jsx(Box, { sx: { mb: 3 }, children: _jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Buscar servi\u00E7os por nome, descri\u00E7\u00E3o, valor ou tempo estimado", value: filtro, onChange: handleFiltroChange, InputProps: {
                        startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                    } }) }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: _jsx(CircularProgress, {}) })) : (_jsx(TableContainer, { component: Paper, elevation: 3, sx: { overflowX: 'auto' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'nome', direction: ordenacao.campo === 'nome' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('nome'), children: "Nome" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'descricao', direction: ordenacao.campo === 'descricao' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('descricao'), children: "Descri\u00E7\u00E3o" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'valor', direction: ordenacao.campo === 'valor' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('valor'), children: "Valor" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'tempoEstimado', direction: ordenacao.campo === 'tempoEstimado' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('tempoEstimado'), children: "Tempo Estimado" }) }), _jsx(TableCell, { align: "center", children: "A\u00E7\u00F5es" })] }) }), _jsx(TableBody, { children: servicosFiltrados.length > 0 ? (servicosFiltrados.map((servico) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: servico.id }), _jsx(TableCell, { children: servico.nome }), _jsx(TableCell, { children: servico.descricao }), _jsx(TableCell, { children: formatarValor(servico.valor) }), _jsx(TableCell, { children: servico.tempoEstimado }), _jsxs(TableCell, { align: "center", children: [_jsx(IconButton, { color: "primary", onClick: () => handleOpenForm(servico), size: "small", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { color: "error", onClick: () => handleOpenDelete(servico.id), size: "small", children: _jsx(DeleteIcon, {}) })] })] }, servico.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 6, align: "center", children: "Nenhum servi\u00E7o cadastrado" }) })) })] }) })), _jsxs(Dialog, { open: openForm, onClose: handleCloseForm, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingId ? 'Editar Serviço' : 'Novo Serviço' }), _jsxs(DialogContent, { children: [_jsx(TextField, { autoFocus: true, margin: "dense", name: "nome", label: "Nome do Servi\u00E7o", type: "text", fullWidth: true, variant: "outlined", value: formData.nome, onChange: handleInputChange, sx: { mb: 2, mt: 1 } }), _jsx(TextField, { margin: "dense", name: "descricao", label: "Descri\u00E7\u00E3o", type: "text", fullWidth: true, multiline: true, rows: 3, variant: "outlined", value: formData.descricao, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "valor", label: "Valor", type: "number", fullWidth: true, variant: "outlined", value: formData.valor, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "tempoEstimado", label: "Tempo Estimado", type: "text", fullWidth: true, variant: "outlined", value: formData.tempoEstimado, onChange: handleInputChange, placeholder: "Ex: 2 horas" })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseForm, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, color: "primary", variant: "contained", children: "Salvar" })] })] }), _jsxs(Dialog, { open: openDelete, onClose: handleCloseDelete, children: [_jsx(DialogTitle, { children: "Confirmar Exclus\u00E3o" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "Tem certeza que deseja excluir este servi\u00E7o? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseDelete, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleDelete, color: "error", variant: "contained", children: "Excluir" })] })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleCloseSnackbar, severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
export default Servicos;
