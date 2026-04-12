import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Snackbar, Alert, InputAdornment, TableSortLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
const pecaVazia = {
    nome: '',
    codigo: '',
    marca: '',
    preco: 0,
    quantidade: 0
};
const Pecas = () => {
    const [pecas, setPecas] = useState([]);
    const [pecasFiltradas, setPecasFiltradas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [formData, setFormData] = useState(pecaVazia);
    const [editingId, setEditingId] = useState(null);
    const [pecaParaDeletar, setPecaParaDeletar] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [ordenacao, setOrdenacao] = useState({ campo: '', direcao: 'asc' });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const fetchPecas = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:3001/pecas');
            setPecas(response.data);
            setPecasFiltradas(response.data);
        }
        catch (error) {
            console.error('Erro ao buscar peças:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao carregar peças',
                severity: 'error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPecas();
    }, []);
    const handleOpenForm = (peca) => {
        if (peca) {
            setFormData({
                nome: peca.nome,
                codigo: peca.codigo,
                marca: peca.marca,
                preco: peca.preco,
                quantidade: peca.quantidade
            });
            setEditingId(peca.id);
        }
        else {
            setFormData(pecaVazia);
            setEditingId(null);
        }
        setOpenForm(true);
    };
    const handleCloseForm = () => {
        setOpenForm(false);
        setFormData(pecaVazia);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'preco' || name === 'quantidade' ? Number(value) : value
        }));
    };
    const handleSubmit = async () => {
        try {
            if (editingId) {
                await axios.put(`http://localhost:3001/pecas/${editingId}`, formData);
                setSnackbar({
                    open: true,
                    message: 'Peça atualizada com sucesso',
                    severity: 'success'
                });
            }
            else {
                await axios.post('http://localhost:3001/pecas', formData);
                setSnackbar({
                    open: true,
                    message: 'Peça adicionada com sucesso',
                    severity: 'success'
                });
            }
            handleCloseForm();
            fetchPecas();
        }
        catch (error) {
            console.error('Erro ao salvar peça:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao salvar peça',
                severity: 'error'
            });
        }
    };
    const handleOpenDelete = (id) => {
        setPecaParaDeletar(id);
        setOpenDelete(true);
    };
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setPecaParaDeletar(null);
    };
    const handleDelete = async () => {
        if (pecaParaDeletar) {
            try {
                await axios.delete(`http://localhost:3001/pecas/${pecaParaDeletar}`);
                setSnackbar({
                    open: true,
                    message: 'Peça excluída com sucesso',
                    severity: 'success'
                });
                fetchPecas();
            }
            catch (error) {
                console.error('Erro ao excluir peça:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao excluir peça',
                    severity: 'error'
                });
            }
            handleCloseDelete();
        }
    };
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };
    const formatarPreco = (preco) => {
        return preco.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    };
    const handleFiltroChange = (event) => {
        const valorFiltro = event.target.value.toLowerCase();
        setFiltro(valorFiltro);
        if (valorFiltro === '') {
            setPecasFiltradas(pecas);
        }
        else {
            const filtradas = pecas.filter(peca => peca.nome.toLowerCase().includes(valorFiltro) ||
                peca.codigo.toLowerCase().includes(valorFiltro) ||
                peca.marca.toLowerCase().includes(valorFiltro) ||
                peca.preco.toString().includes(valorFiltro) ||
                peca.quantidade.toString().includes(valorFiltro));
            setPecasFiltradas(filtradas);
        }
    };
    const handleOrdenacaoChange = (campo) => {
        const ehMesmoCampo = ordenacao.campo === campo;
        const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
        setOrdenacao({
            campo,
            direcao: novaDirecao
        });
        const pecasOrdenadas = [...pecasFiltradas].sort((a, b) => {
            if (campo === 'preco' || campo === 'quantidade') {
                return novaDirecao === 'asc' ? a[campo] - b[campo] : b[campo] - a[campo];
            }
            const aValue = String(a[campo]).toLowerCase();
            const bValue = String(b[campo]).toLowerCase();
            return novaDirecao === 'asc'
                ? aValue.localeCompare(bValue, 'pt-BR')
                : bValue.localeCompare(aValue, 'pt-BR');
        });
        setPecasFiltradas(pecasOrdenadas);
    };
    return (_jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h4", sx: { fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }, gutterBottom: true, children: "Pe\u00E7as" }), _jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenForm(), fullWidth: window.innerWidth < 600, sx: { width: { xs: '100%', sm: 'auto' } }, children: "Nova Pe\u00E7a" })] }), _jsx(Box, { sx: { mb: 3 }, children: _jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Buscar pe\u00E7as por nome, c\u00F3digo, marca, pre\u00E7o ou quantidade", value: filtro, onChange: handleFiltroChange, InputProps: {
                        startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                    } }) }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: _jsx(CircularProgress, {}) })) : (_jsx(TableContainer, { component: Paper, elevation: 3, sx: { overflowX: 'auto' }, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'nome', direction: ordenacao.campo === 'nome' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('nome'), children: "Nome" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'codigo', direction: ordenacao.campo === 'codigo' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('codigo'), children: "C\u00F3digo" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'marca', direction: ordenacao.campo === 'marca' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('marca'), children: "Marca" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'preco', direction: ordenacao.campo === 'preco' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('preco'), children: "Pre\u00E7o" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'quantidade', direction: ordenacao.campo === 'quantidade' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('quantidade'), children: "Quantidade" }) }), _jsx(TableCell, { align: "center", children: "A\u00E7\u00F5es" })] }) }), _jsx(TableBody, { children: pecasFiltradas.length > 0 ? (pecasFiltradas.map((peca) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: peca.id }), _jsx(TableCell, { children: peca.nome }), _jsx(TableCell, { children: peca.codigo }), _jsx(TableCell, { children: peca.marca }), _jsx(TableCell, { children: formatarPreco(peca.preco) }), _jsx(TableCell, { children: peca.quantidade }), _jsxs(TableCell, { align: "center", children: [_jsx(IconButton, { color: "primary", onClick: () => handleOpenForm(peca), size: "small", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { color: "error", onClick: () => handleOpenDelete(peca.id), size: "small", children: _jsx(DeleteIcon, {}) })] })] }, peca.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, align: "center", children: "Nenhuma pe\u00E7a cadastrada" }) })) })] }) })), _jsxs(Dialog, { open: openForm, onClose: handleCloseForm, maxWidth: "sm", fullWidth: true, children: [_jsx(DialogTitle, { children: editingId ? 'Editar Peça' : 'Nova Peça' }), _jsxs(DialogContent, { children: [_jsx(TextField, { autoFocus: true, margin: "dense", name: "nome", label: "Nome da Pe\u00E7a", type: "text", fullWidth: true, variant: "outlined", value: formData.nome, onChange: handleInputChange, sx: { mb: 2, mt: 1 } }), _jsx(TextField, { margin: "dense", name: "codigo", label: "C\u00F3digo", type: "text", fullWidth: true, variant: "outlined", value: formData.codigo, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "marca", label: "Marca", type: "text", fullWidth: true, variant: "outlined", value: formData.marca, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "preco", label: "Pre\u00E7o", type: "number", fullWidth: true, variant: "outlined", value: formData.preco, onChange: handleInputChange, sx: { mb: 2 } }), _jsx(TextField, { margin: "dense", name: "quantidade", label: "Quantidade", type: "number", fullWidth: true, variant: "outlined", value: formData.quantidade, onChange: handleInputChange })] }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseForm, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, color: "primary", variant: "contained", children: "Salvar" })] })] }), _jsxs(Dialog, { open: openDelete, onClose: handleCloseDelete, children: [_jsx(DialogTitle, { children: "Confirmar Exclus\u00E3o" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "Tem certeza que deseja excluir esta pe\u00E7a? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseDelete, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleDelete, color: "error", variant: "contained", children: "Excluir" })] })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleCloseSnackbar, severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
export default Pecas;
