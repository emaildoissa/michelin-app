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
        main: '#002D72', // Michelin Blue
        dark: '#001A44',
        light: '#1A4A8F',
        contrastText: '#ffffff'
      },
      secondary: {
        main: '#FFD500', // Michelin Yellow
        dark: '#CCAA00',
        light: '#FFEE33',
        contrastText: '#000000'
      },
      success: {
        main: '#059669', // Emerald 600
        contrastText: '#ffffff'
      },
      error: {
        main: '#DC2626', // Red 600
        contrastText: '#ffffff'
      },
      background: {
        default: '#F8FAFC', // Slate 50
        paper: '#ffffff'
      },
      text: {
        primary: '#0F172A', // Slate 900
        secondary: '#475569' // Slate 600
      }
    },
    shape: {
      borderRadius: 14 // Softer, modern look
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 900 },
      h2: { fontWeight: 800 },
      h3: { fontWeight: 800 },
      h4: { fontWeight: 800 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 800 }
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            boxShadow: 'none',
            '&:hover': { boxShadow: 'none' }
          },
          containedPrimary: {
            '&:hover': { backgroundColor: '#001A44' }
          }
        }
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 800,
            borderRadius: 8,
            borderLeft: '3px solid transparent'
          }
        }
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            border: '1px solid #E2E8F0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
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
