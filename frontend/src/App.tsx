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
        main: '#000000', // Noir Premium
        dark: '#1a1a1a',
        light: '#333333',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#ffffff', // White/Silver accent
        dark: '#e2e8f0',
        light: '#ffffff',
        contrastText: '#000000'
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
        default: '#f8fafc', // Slate 50
        paper: '#ffffff'
      },
      text: {
        primary: '#0f172a', // Slate 900
        secondary: '#475569' // Slate 600
      }
    },
    shape: {
      borderRadius: 12 // Modern, unified look
    },
    typography: {
      fontFamily: '"Inter", "system-ui", "-apple-system", sans-serif',
      h1: { fontSize: '2.5rem', fontWeight: 900, lineHeight: 1.1, letterSpacing: '-0.02em' },
      h2: { fontSize: '2rem', fontWeight: 800, lineHeight: 1.2, letterSpacing: '-0.01em' },
      h3: { fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.3 },
      h4: { fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4 },
      h5: { fontSize: '1.125rem', fontWeight: 700, lineHeight: 1.5 },
      h6: { fontSize: '1rem', fontWeight: 700, lineHeight: 1.5 },
      body1: { fontSize: '1rem', fontWeight: 400, lineHeight: 1.6 },
      body2: { fontSize: '0.875rem', fontWeight: 500, lineHeight: 1.5 },
      subtitle1: { fontSize: '1rem', fontWeight: 600, lineHeight: 1.5 },
      subtitle2: { fontSize: '0.875rem', fontWeight: 700, lineHeight: 1.4 },
      caption: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' },
      overline: { fontSize: '0.625rem', fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase' },
      button: { fontSize: '0.875rem', fontWeight: 800, textTransform: 'none', letterSpacing: '0.02em' }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '8px 20px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' }
          },
          containedPrimary: {
            '&:hover': { backgroundColor: '#1a1a1a' }
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
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
      <Router>
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
