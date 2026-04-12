import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton, CircularProgress, Snackbar, Alert, FormControl, InputLabel, Select, MenuItem, Grid, Chip, InputAdornment, TableSortLabel } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PrintIcon from '@mui/icons-material/Print';
import SearchIcon from '@mui/icons-material/Search';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import 'dayjs/locale/pt-br';
import dayjs from 'dayjs';
const statusOptions = [
    'Aguardando aprovação',
    'Orçamento aprovado',
    'Em andamento',
    'Concluído',
    'Entregue',
    'Cancelado'
];
const ordemVazia = {
    veiculoId: '',
    dataEntrada: dayjs(),
    dataSaida: null,
    status: 'Aguardando aprovação',
    descricao: '',
    servicosIds: [],
    pecasIds: [],
    valorTotal: 0
};
const OrdensServico = () => {
    const [ordens, setOrdens] = useState([]);
    const [ordensFiltered, setOrdensFiltered] = useState([]);
    const [veiculos, setVeiculos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [servicos, setServicos] = useState([]);
    const [pecas, setPecas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openForm, setOpenForm] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [formData, setFormData] = useState(ordemVazia);
    const [editingId, setEditingId] = useState(null);
    const [ordemParaDeletar, setOrdemParaDeletar] = useState(null);
    const [filtro, setFiltro] = useState('');
    const [filtroStatus, setFiltroStatus] = useState('');
    const [ordenacao, setOrdenacao] = useState({ campo: '', direcao: 'asc' });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });
    const fetchData = async () => {
        try {
            setLoading(true);
            const [ordensRes, veiculosRes, clientesRes, servicosRes, pecasRes] = await Promise.all([
                axios.get('http://localhost:3001/ordens_servico'),
                axios.get('http://localhost:3001/veiculos'),
                axios.get('http://localhost:3001/clientes'),
                axios.get('http://localhost:3001/servicos'),
                axios.get('http://localhost:3001/pecas')
            ]);
            const ordensData = ordensRes.data;
            setOrdens(ordensData);
            setOrdensFiltered(ordensData);
            setVeiculos(veiculosRes.data);
            setClientes(clientesRes.data);
            setServicos(servicosRes.data);
            setPecas(pecasRes.data);
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
    useEffect(() => {
        fetchData();
    }, []);
    const handleOpenForm = (ordem) => {
        if (ordem) {
            setFormData({
                veiculoId: ordem.veiculoId,
                dataEntrada: dayjs(ordem.dataEntrada),
                dataSaida: ordem.dataSaida ? dayjs(ordem.dataSaida) : null,
                status: ordem.status,
                descricao: ordem.descricao,
                servicosIds: ordem.servicosIds,
                pecasIds: ordem.pecasIds,
                valorTotal: ordem.valorTotal
            });
            setEditingId(ordem.id);
        }
        else {
            setFormData(ordemVazia);
            setEditingId(null);
        }
        setOpenForm(true);
    };
    const handleCloseForm = () => {
        setOpenForm(false);
        setFormData(ordemVazia);
    };
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleSelectChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };
    const handleDateChange = (date, field) => {
        setFormData(prev => ({
            ...prev,
            [field]: date
        }));
    };
    const handleMultiSelectChange = (e, field) => {
        const { value } = e.target;
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    // Calcular valor total baseado nos serviços e peças selecionados
    useEffect(() => {
        let total = 0;
        // Somar valor dos serviços
        formData.servicosIds.forEach(servicoId => {
            const servico = servicos.find(s => s.id === servicoId);
            if (servico) {
                total += servico.valor;
            }
        });
        // Somar valor das peças
        formData.pecasIds.forEach(pecaId => {
            const peca = pecas.find(p => p.id === pecaId);
            if (peca) {
                total += peca.preco;
            }
        });
        setFormData(prev => ({
            ...prev,
            valorTotal: total
        }));
    }, [formData.servicosIds, formData.pecasIds, servicos, pecas]);
    const verificarEstoque = (pecasIds) => {
        for (const pecaId of pecasIds) {
            const peca = pecas.find(p => p.id === pecaId);
            if (peca && peca.quantidade <= 0) {
                setSnackbar({
                    open: true,
                    message: `Peça ${peca.nome} não possui estoque disponível`,
                    severity: 'error'
                });
                return false;
            }
        }
        return true;
    };
    const atualizarEstoque = async (pecasIds) => {
        for (const pecaId of pecasIds) {
            const peca = pecas.find(p => p.id === pecaId);
            if (peca) {
                await axios.put(`http://localhost:3001/pecas/${pecaId}`, {
                    ...peca,
                    quantidade: peca.quantidade - 1
                });
            }
        }
    };
    const handleSubmit = async () => {
        try {
            // Verificar estoque disponível
            if (!verificarEstoque(formData.pecasIds)) {
                return;
            }
            const ordemData = {
                ...formData,
                dataEntrada: formData.dataEntrada.toISOString(),
                dataSaida: formData.dataSaida ? formData.dataSaida.toISOString() : null
            };
            if (editingId) {
                // Buscar ordem antiga para comparar peças
                const ordemAntiga = ordens.find(o => o.id === editingId);
                const novasPecas = formData.pecasIds.filter(p => !ordemAntiga?.pecasIds.includes(p));
                await axios.put(`http://localhost:3001/ordens_servico/${editingId}`, ordemData);
                await atualizarEstoque(novasPecas);
                setSnackbar({
                    open: true,
                    message: 'Ordem de serviço atualizada com sucesso',
                    severity: 'success'
                });
            }
            else {
                await axios.post('http://localhost:3001/ordens_servico', ordemData);
                await atualizarEstoque(formData.pecasIds);
                setSnackbar({
                    open: true,
                    message: 'Ordem de serviço adicionada com sucesso',
                    severity: 'success'
                });
            }
            handleCloseForm();
            fetchData();
        }
        catch (error) {
            console.error('Erro ao salvar ordem de serviço:', error);
            setSnackbar({
                open: true,
                message: 'Erro ao salvar ordem de serviço',
                severity: 'error'
            });
        }
    };
    const handleOpenDelete = (id) => {
        setOrdemParaDeletar(id);
        setOpenDelete(true);
    };
    const handleCloseDelete = () => {
        setOpenDelete(false);
        setOrdemParaDeletar(null);
    };
    const handleDelete = async () => {
        if (ordemParaDeletar) {
            try {
                await axios.delete(`http://localhost:3001/ordens_servico/${ordemParaDeletar}`);
                setSnackbar({
                    open: true,
                    message: 'Ordem de serviço excluída com sucesso',
                    severity: 'success'
                });
                fetchData();
            }
            catch (error) {
                console.error('Erro ao excluir ordem de serviço:', error);
                setSnackbar({
                    open: true,
                    message: 'Erro ao excluir ordem de serviço',
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
    const getVeiculoInfo = (veiculoId) => {
        const veiculo = veiculos.find(v => v.id === veiculoId);
        if (!veiculo)
            return 'Veículo não encontrado';
        return `${veiculo.marca} ${veiculo.modelo} (${veiculo.placa})`;
    };
    const getClienteInfo = (veiculoId) => {
        const veiculo = veiculos.find(v => v.id === veiculoId);
        if (!veiculo)
            return 'Cliente não encontrado';
        const cliente = clientes.find(c => c.id === veiculo.clienteId);
        return cliente ? cliente.nome : 'Cliente não encontrado';
    };
    const getStatusChipColor = (status) => {
        switch (status) {
            case 'Aguardando aprovação':
                return 'warning';
            case 'Orçamento aprovado':
                return 'info';
            case 'Em andamento':
                return 'primary';
            case 'Concluído':
                return 'success';
            case 'Entregue':
                return 'success';
            case 'Cancelado':
                return 'error';
            default:
                return 'default';
        }
    };
    const handlePrintOrdem = (ordem) => {
        // Buscar informações relacionadas
        const veiculo = veiculos.find(v => v.id === ordem.veiculoId);
        const cliente = veiculo ? clientes.find(c => c.id === veiculo.clienteId) : null;
        // Buscar serviços e peças
        const servicosSelecionados = servicos.filter(s => ordem.servicosIds.includes(s.id));
        const pecasSelecionadas = pecas.filter(p => ordem.pecasIds.includes(p.id));
        // Criar conteúdo para impressão
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            setSnackbar({
                open: true,
                message: 'Não foi possível abrir a janela de impressão. Verifique se o bloqueador de pop-ups está desativado.',
                severity: 'error'
            });
            return;
        }
        // Estilo para a página de impressão
        const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Ordem de Serviço #${ordem.id}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #0d47a1;
            padding-bottom: 10px;
          }
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #0d47a1;
          }
          .section {
            margin-bottom: 20px;
          }
          .section-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 10px;
            background-color: #f5f5f5;
            padding: 5px;
          }
          .info-row {
            display: flex;
            margin-bottom: 5px;
          }
          .info-label {
            font-weight: bold;
            width: 150px;
          }
          .info-value {
            flex: 1;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
          }
          .total {
            text-align: right;
            font-weight: bold;
            font-size: 18px;
            margin-top: 20px;
            border-top: 2px solid #0d47a1;
            padding-top: 10px;
          }
          .footer {
            margin-top: 50px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
          .signature {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
          }
          .signature-line {
            width: 200px;
            border-top: 1px solid #333;
            margin-top: 10px;
            text-align: center;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">ORDEM DE SERVIÇO #${ordem.id}</div>
          <div>Oficina Mecânica</div>
        </div>
        
        <div class="section">
          <div class="section-title">Informações do Cliente</div>
          <div class="info-row">
            <div class="info-label">Nome:</div>
            <div class="info-value">${cliente ? cliente.nome : 'Cliente não encontrado'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Telefone:</div>
            <div class="info-value">${cliente ? cliente.telefone : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Email:</div>
            <div class="info-value">${cliente ? cliente.email : '-'}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Informações do Veículo</div>
          <div class="info-row">
            <div class="info-label">Marca/Modelo:</div>
            <div class="info-value">${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Placa:</div>
            <div class="info-value">${veiculo ? veiculo.placa : '-'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Ano:</div>
            <div class="info-value">${veiculo ? veiculo.ano : '-'}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Detalhes da Ordem</div>
          <div class="info-row">
            <div class="info-label">Data de Entrada:</div>
            <div class="info-value">${new Date(ordem.dataEntrada).toLocaleDateString('pt-BR')}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Data de Saída:</div>
            <div class="info-value">${ordem.dataSaida ? new Date(ordem.dataSaida).toLocaleDateString('pt-BR') : 'Pendente'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Status:</div>
            <div class="info-value">${ordem.status}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Descrição:</div>
            <div class="info-value">${ordem.descricao || 'Nenhuma descrição fornecida'}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Serviços Realizados</div>
          <table>
            <thead>
              <tr>
                <th>Serviço</th>
                <th>Descrição</th>
                <th>Tempo Estimado</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${servicosSelecionados.length > 0 ?
            servicosSelecionados.map(servico => `
                  <tr>
                    <td>${servico.nome}</td>
                    <td>${servico.descricao}</td>
                    <td>${servico.tempoEstimado}</td>
                    <td>${formatarValor(servico.valor)}</td>
                  </tr>
                `).join('') :
            '<tr><td colspan="4" style="text-align: center">Nenhum serviço registrado</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <div class="section">
          <div class="section-title">Peças Utilizadas</div>
          <table>
            <thead>
              <tr>
                <th>Peça</th>
                <th>Código</th>
                <th>Marca</th>
                <th>Valor</th>
              </tr>
            </thead>
            <tbody>
              ${pecasSelecionadas.length > 0 ?
            pecasSelecionadas.map(peca => `
                  <tr>
                    <td>${peca.nome}</td>
                    <td>${peca.codigo}</td>
                    <td>${peca.marca}</td>
                    <td>${formatarValor(peca.preco)}</td>
                  </tr>
                `).join('') :
            '<tr><td colspan="4" style="text-align: center">Nenhuma peça utilizada</td></tr>'}
            </tbody>
          </table>
        </div>
        
        <div class="total">
          Valor Total: ${formatarValor(ordem.valorTotal)}
        </div>
        
        <div class="signature">
          <div>
            <div class="signature-line">Assinatura do Cliente</div>
          </div>
          <div>
            <div class="signature-line">Assinatura do Responsável</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Oficina Mecânica - Documento gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
        
        <div class="no-print" style="text-align: center; margin-top: 20px;">
          <button onclick="window.print();" style="padding: 10px 20px; background-color: #0d47a1; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Imprimir
          </button>
        </div>
      </body>
      </html>
    `;
        printWindow.document.open();
        printWindow.document.write(printContent);
        printWindow.document.close();
        // Dar tempo para carregar o conteúdo antes de imprimir
        printWindow.onload = function () {
            printWindow.focus();
            // Opcional: imprimir automaticamente
            // printWindow.print();
        };
    };
    const handleFiltroChange = (event) => {
        const valorFiltro = event.target.value.toLowerCase();
        setFiltro(valorFiltro);
        aplicarFiltros(valorFiltro, filtroStatus);
    };
    const handleFiltroStatusChange = (event) => {
        const status = event.target.value;
        setFiltroStatus(status);
        aplicarFiltros(filtro, status);
    };
    const aplicarFiltros = (textoFiltro, statusFiltro) => {
        let resultado = [...ordens];
        // Aplicar filtro de texto
        if (textoFiltro) {
            resultado = resultado.filter(ordem => {
                const clienteNome = getClienteInfo(ordem.veiculoId).toLowerCase();
                const veiculoInfo = getVeiculoInfo(ordem.veiculoId).toLowerCase();
                const dataFormatada = new Date(ordem.dataEntrada).toLocaleDateString('pt-BR').toLowerCase();
                const valorFormatado = ordem.valorTotal.toString().toLowerCase();
                return clienteNome.includes(textoFiltro) ||
                    veiculoInfo.includes(textoFiltro) ||
                    dataFormatada.includes(textoFiltro) ||
                    valorFormatado.includes(textoFiltro) ||
                    ordem.status.toLowerCase().includes(textoFiltro);
            });
        }
        // Aplicar filtro de status
        if (statusFiltro) {
            resultado = resultado.filter(ordem => ordem.status === statusFiltro);
        }
        // Aplicar ordenação se existir
        if (ordenacao.campo !== '') {
            resultado = ordenarOrdens(resultado);
        }
        setOrdensFiltered(resultado);
    };
    const handleOrdenacaoChange = (campo) => {
        const ehMesmoCampo = ordenacao.campo === campo;
        const novaDirecao = ehMesmoCampo && ordenacao.direcao === 'asc' ? 'desc' : 'asc';
        const novaOrdenacao = {
            campo,
            direcao: novaDirecao
        };
        setOrdenacao(novaOrdenacao);
        setOrdensFiltered(ordenarOrdens(ordensFiltered, campo, novaDirecao));
    };
    const ordenarOrdens = (ordens, campo = ordenacao.campo, direcao = ordenacao.direcao) => {
        if (campo === '' || typeof campo !== 'string')
            return ordens;
        return [...ordens].sort((a, b) => {
            if (campo === 'valorTotal') {
                return direcao === 'asc' ? a.valorTotal - b.valorTotal : b.valorTotal - a.valorTotal;
            }
            if (campo === 'dataEntrada' || campo === 'dataSaida') {
                const dataA = new Date(a[campo] || '').getTime();
                const dataB = new Date(b[campo] || '').getTime();
                return direcao === 'asc' ? dataA - dataB : dataB - dataA;
            }
            if (campo === 'veiculoId') {
                const veiculoA = getVeiculoInfo(a.veiculoId).toLowerCase();
                const veiculoB = getVeiculoInfo(b.veiculoId).toLowerCase();
                return direcao === 'asc'
                    ? veiculoA.localeCompare(veiculoB, 'pt-BR')
                    : veiculoB.localeCompare(veiculoA, 'pt-BR');
            }
            const valorA = String(a[campo]).toLowerCase();
            const valorB = String(b[campo]).toLowerCase();
            return direcao === 'asc'
                ? valorA.localeCompare(valorB, 'pt-BR')
                : valorB.localeCompare(valorA, 'pt-BR');
        });
    };
    return (_jsxs(Box, { sx: { flexGrow: 1 }, children: [_jsxs(Box, { sx: { display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2, mb: 3 }, children: [_jsx(Typography, { variant: "h4", gutterBottom: true, children: "Ordens de Servi\u00E7o" }), _jsx(Button, { variant: "contained", color: "primary", startIcon: _jsx(AddIcon, {}), onClick: () => handleOpenForm(), children: "Nova Ordem de Servi\u00E7o" })] }), _jsx(Box, { sx: { mb: 3 }, children: _jsxs(Grid, { container: true, spacing: 2, children: [_jsx(Grid, { item: true, xs: 12, md: 8, children: _jsx(TextField, { fullWidth: true, variant: "outlined", placeholder: "Buscar ordens por cliente, ve\u00EDculo, data, valor ou status", value: filtro, onChange: handleFiltroChange, InputProps: {
                                    startAdornment: (_jsx(InputAdornment, { position: "start", children: _jsx(SearchIcon, {}) })),
                                } }) }), _jsx(Grid, { item: true, xs: 12, md: 4, children: _jsxs(FormControl, { fullWidth: true, variant: "outlined", children: [_jsx(InputLabel, { id: "filtro-status-label", children: "Filtrar por Status" }), _jsxs(Select, { labelId: "filtro-status-label", value: filtroStatus, onChange: handleFiltroStatusChange, label: "Filtrar por Status", children: [_jsx(MenuItem, { value: "", children: "Todos os Status" }), statusOptions.map((status) => (_jsx(MenuItem, { value: status, children: status }, status)))] })] }) })] }) }), loading ? (_jsx(Box, { sx: { display: 'flex', justifyContent: 'center', mt: 4 }, children: _jsx(CircularProgress, {}) })) : (_jsx(TableContainer, { component: Paper, elevation: 3, children: _jsxs(Table, { children: [_jsx(TableHead, { children: _jsxs(TableRow, { children: [_jsx(TableCell, { children: "ID" }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'veiculoId', direction: ordenacao.campo === 'veiculoId' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('veiculoId'), children: "Cliente" }) }), _jsx(TableCell, { children: "Ve\u00EDculo" }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'dataEntrada', direction: ordenacao.campo === 'dataEntrada' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('dataEntrada'), children: "Data de Entrada" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'status', direction: ordenacao.campo === 'status' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('status'), children: "Status" }) }), _jsx(TableCell, { children: _jsx(TableSortLabel, { active: ordenacao.campo === 'valorTotal', direction: ordenacao.campo === 'valorTotal' ? ordenacao.direcao : 'asc', onClick: () => handleOrdenacaoChange('valorTotal'), children: "Valor Total" }) }), _jsx(TableCell, { align: "center", children: "A\u00E7\u00F5es" })] }) }), _jsx(TableBody, { children: ordensFiltered.length > 0 ? (ordensFiltered.map((ordem) => (_jsxs(TableRow, { children: [_jsx(TableCell, { children: ordem.id }), _jsx(TableCell, { children: getClienteInfo(ordem.veiculoId) }), _jsx(TableCell, { children: getVeiculoInfo(ordem.veiculoId) }), _jsx(TableCell, { children: new Date(ordem.dataEntrada).toLocaleDateString('pt-BR') }), _jsx(TableCell, { children: _jsx(Chip, { label: ordem.status, color: getStatusChipColor(ordem.status), size: "small" }) }), _jsx(TableCell, { children: formatarValor(ordem.valorTotal) }), _jsxs(TableCell, { align: "center", children: [_jsx(IconButton, { color: "primary", onClick: () => handleOpenForm(ordem), size: "small", children: _jsx(EditIcon, {}) }), _jsx(IconButton, { color: "primary", onClick: () => handlePrintOrdem(ordem), size: "small", children: _jsx(PrintIcon, {}) }), _jsx(IconButton, { color: "error", onClick: () => handleOpenDelete(ordem.id), size: "small", children: _jsx(DeleteIcon, {}) })] })] }, ordem.id)))) : (_jsx(TableRow, { children: _jsx(TableCell, { colSpan: 7, align: "center", children: "Nenhuma ordem de servi\u00E7o cadastrada" }) })) })] }) })), _jsxs(Dialog, { open: openForm, onClose: handleCloseForm, maxWidth: "md", fullWidth: true, children: [_jsx(DialogTitle, { children: editingId ? 'Editar Ordem de Serviço' : 'Nova Ordem de Serviço' }), _jsx(DialogContent, { children: _jsxs(Grid, { container: true, spacing: 2, sx: { mt: 1 }, children: [_jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(FormControl, { fullWidth: true, margin: "dense", children: [_jsx(InputLabel, { id: "veiculo-label", children: "Ve\u00EDculo" }), _jsx(Select, { labelId: "veiculo-label", name: "veiculoId", value: formData.veiculoId, onChange: handleSelectChange, label: "Ve\u00EDculo", children: veiculos.map((veiculo) => (_jsxs(MenuItem, { value: veiculo.id, children: [veiculo.marca, " ", veiculo.modelo, " - ", veiculo.placa, " (", getClienteInfo(veiculo.id), ")"] }, veiculo.id))) })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(FormControl, { fullWidth: true, margin: "dense", children: [_jsx(InputLabel, { id: "status-label", children: "Status" }), _jsx(Select, { labelId: "status-label", name: "status", value: formData.status, onChange: handleSelectChange, label: "Status", children: statusOptions.map((status) => (_jsx(MenuItem, { value: status, children: status }, status))) })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(LocalizationProvider, { dateAdapter: AdapterDayjs, adapterLocale: "pt-br", children: _jsx(DatePicker, { label: "Data de Entrada", value: formData.dataEntrada, onChange: (date) => handleDateChange(date, 'dataEntrada'), slotProps: { textField: { fullWidth: true, margin: 'dense' } } }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, md: 4, children: _jsx(LocalizationProvider, { dateAdapter: AdapterDayjs, adapterLocale: "pt-br", children: _jsx(DatePicker, { label: "Data de Sa\u00EDda", value: formData.dataSaida, onChange: (date) => handleDateChange(date, 'dataSaida'), slotProps: { textField: { fullWidth: true, margin: 'dense' } } }) }) }), _jsx(Grid, { item: true, xs: 12, sm: 12, md: 4, children: _jsx(TextField, { margin: "dense", name: "descricao", label: "Descri\u00E7\u00E3o do Problema/Servi\u00E7o", type: "text", fullWidth: true, multiline: true, rows: 3, variant: "outlined", value: formData.descricao, onChange: handleInputChange }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(FormControl, { fullWidth: true, margin: "dense", children: [_jsx(InputLabel, { id: "servicos-label", children: "Servi\u00E7os" }), _jsx(Select, { labelId: "servicos-label", multiple: true, value: formData.servicosIds, onChange: (e) => handleMultiSelectChange(e, 'servicosIds'), label: "Servi\u00E7os", renderValue: (selected) => (_jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: selected.map((value) => {
                                                        const servico = servicos.find(s => s.id === value);
                                                        return (_jsx(Chip, { label: servico ? servico.nome : value, size: "small" }, value));
                                                    }) })), children: servicos.map((servico) => (_jsxs(MenuItem, { value: servico.id, children: [servico.nome, " - ", formatarValor(servico.valor)] }, servico.id))) })] }) }), _jsx(Grid, { item: true, xs: 12, sm: 6, children: _jsxs(FormControl, { fullWidth: true, margin: "dense", children: [_jsx(InputLabel, { id: "pecas-label", children: "Pe\u00E7as" }), _jsx(Select, { labelId: "pecas-label", multiple: true, value: formData.pecasIds, onChange: (e) => handleMultiSelectChange(e, 'pecasIds'), label: "Pe\u00E7as", renderValue: (selected) => (_jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 0.5 }, children: selected.map((value) => {
                                                        const peca = pecas.find(p => p.id === value);
                                                        return (_jsx(Chip, { label: peca ? peca.nome : value, size: "small" }, value));
                                                    }) })), children: pecas.map((peca) => (_jsxs(MenuItem, { value: peca.id, children: [peca.nome, " - ", formatarValor(peca.preco)] }, peca.id))) })] }) }), _jsx(Grid, { item: true, xs: 12, children: _jsxs(Typography, { variant: "h6", sx: { mt: 2, mb: 1 }, children: ["Valor Total: ", formatarValor(formData.valorTotal)] }) })] }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseForm, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleSubmit, color: "primary", variant: "contained", children: "Salvar" })] })] }), _jsxs(Dialog, { open: openDelete, onClose: handleCloseDelete, children: [_jsx(DialogTitle, { children: "Confirmar Exclus\u00E3o" }), _jsx(DialogContent, { children: _jsx(Typography, { children: "Tem certeza que deseja excluir esta ordem de servi\u00E7o? Esta a\u00E7\u00E3o n\u00E3o pode ser desfeita." }) }), _jsxs(DialogActions, { children: [_jsx(Button, { onClick: handleCloseDelete, color: "inherit", children: "Cancelar" }), _jsx(Button, { onClick: handleDelete, color: "error", variant: "contained", children: "Excluir" })] })] }), _jsx(Snackbar, { open: snackbar.open, autoHideDuration: 6000, onClose: handleCloseSnackbar, anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { onClose: handleCloseSnackbar, severity: snackbar.severity, sx: { width: '100%' }, children: snackbar.message }) })] }));
};
export default OrdensServico;
