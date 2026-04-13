import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from '@mui/material';
import { ptBR } from '@mui/material/locale';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Veiculos from './pages/Veiculos';
import Servicos from './pages/Servicos';
import Pecas from './pages/Pecas';
import OrdensServico from './pages/OrdensServico';
import './App.css';
const theme = createTheme({
    palette: {
        primary: {
            main: '#0d47a1',
            dark: '#002171',
            light: '#5472d3',
            contrastText: '#ffffff'
        },
        secondary: {
            main: '#d32f2f',
            dark: '#9a0007',
            light: '#ff6659',
            contrastText: '#ffffff'
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff'
        },
        text: {
            primary: '#212121',
            secondary: '#757575'
        }
    },
}, ptBR);
function App() {
    return (_jsxs(ThemeProvider, { theme: theme, children: [_jsx(CssBaseline, {}), _jsxs(Router, { children: [_jsx(Navbar, {}), _jsx(Container, { maxWidth: "lg", sx: { mt: 4, mb: 4 }, children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "/clientes", element: _jsx(Clientes, {}) }), _jsx(Route, { path: "/veiculos", element: _jsx(Veiculos, {}) }), _jsx(Route, { path: "/servicos", element: _jsx(Servicos, {}) }), _jsx(Route, { path: "/pecas", element: _jsx(Pecas, {}) }), _jsx(Route, { path: "/ordens", element: _jsx(OrdensServico, {}) })] }) })] })] }));
}
export default App;
