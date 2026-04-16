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
import './App.css'

const theme = createTheme(
  {
    palette: {
      primary: {
        main: '#09090b', // Zinc 950 - deeper than pure black
        dark: '#000000',
        light: '#27272a',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#f4f4f5', // Zinc 100
        dark: '#e4e4e7',
        light: '#ffffff',
        contrastText: '#09090b'
      },
      success: {
        main: '#10b981', // Emerald 500
        contrastText: '#ffffff'
      },
      error: {
        main: '#ef4444', // Red 500
        contrastText: '#ffffff'
      },
      background: {
        default: '#fafafa', // Very light gray
        paper: '#ffffff'
      },
      text: {
        primary: '#09090b', 
        secondary: '#52525b' // Zinc 600
      },
      divider: '#e4e4e7'
    },
    shape: {
      borderRadius: 12
    },
    typography: {
      fontFamily: '"Figtree", "system-ui", "-apple-system", sans-serif',
      h1: { fontSize: '3rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.03em' },
      h2: { fontSize: '2.25rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.02em' },
      h3: { fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.3, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.5rem', fontWeight: 700, lineHeight: 1.4, letterSpacing: '-0.01em' },
      h5: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.5 },
      h6: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.5 },
      body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
      subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.4 },
      caption: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },
      overline: { fontSize: '0.625rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' },
      button: { fontSize: '0.875rem', fontWeight: 700, textTransform: 'none', letterSpacing: '0.01em' }
    },
    spacing: 8, // Base spacing unit
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' },
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
          },
          containedPrimary: {
            '&:hover': { backgroundColor: '#18181b' }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: '1px solid #e4e4e7',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
          }
        }
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '16px',
            borderColor: '#f4f4f5'
          },
          head: {
            fontWeight: 700,
            color: '#71717a',
            textTransform: 'uppercase',
            fontSize: '0.75rem',
            letterSpacing: '0.05em'
          }
        }
      }
    }
  },
  ptBR
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Navbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/servicos" element={<Servicos />} />
            <Route path="/pecas" element={<Pecas />} />
            <Route path="/ordens" element={<OrdensServico />} />
          </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  )
}

export default App
