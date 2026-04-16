import { AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme, Container } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build'; // Services
import InventoryIcon from '@mui/icons-material/Inventory'; // Parts
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useState } from 'react';

const navItems = [
  { text: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { text: 'Clientes', path: '/clientes', icon: <PeopleIcon /> },
  { text: 'Veículos', path: '/veiculos', icon: <DirectionsCarIcon /> },
  { text: 'Serviços', path: '/servicos', icon: <BuildIcon /> },
  { text: 'Peças', path: '/pecas', icon: <InventoryIcon /> },
  { text: 'OS', path: '/ordens', icon: <AssignmentIcon /> },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 3, bgcolor: '#000000', color: 'white', height: '100%' }}>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, pt: 2 }}>
        <img src="/logo.png" alt="Michelin" style={{ height: '48px', objectFit: 'contain' }} />
      </Box>
      <List sx={{ px: 1 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <ListItem 
              component={Link} 
              to={item.path} 
              key={item.text}
              sx={{ 
                borderRadius: 3,
                mb: 1,
                py: 1.5,
                bgcolor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
                color: isActive ? 'white' : 'rgba(255, 255, 255, 0.6)',
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: 'white'
                },
                transition: 'all 0.2s ease'
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ fontWeight: isActive ? 800 : 600, fontSize: '0.95rem' }} 
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar 
        position="sticky" 
        elevation={0} 
        sx={{ 
          borderBottom: '1px solid', 
          borderColor: 'rgba(255,255,255,0.1)', 
          bgcolor: '#000000', 
          color: 'white',
          py: 0.5
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
              <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="Michelin" style={{ height: '36px', objectFit: 'contain' }} />
              </Box>
            </Box>

            {!isMobile ? (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button 
                      key={item.text} 
                      component={Link} 
                      to={item.path} 
                      sx={{ 
                        color: isActive ? 'white' : 'rgba(255, 255, 255, 0.65)',
                        px: 2.5,
                        py: 1,
                        borderRadius: 2.5,
                        fontWeight: isActive ? 800 : 600,
                        fontSize: '0.85rem',
                        position: 'relative',
                        '&::after': isActive ? {
                          content: '""',
                          position: 'absolute',
                          bottom: 4,
                          left: '20%',
                          right: '20%',
                          height: '2px',
                          bgcolor: 'white',
                          borderRadius: '2px'
                        } : {},
                        '&:hover': { 
                          bgcolor: 'rgba(255, 255, 255, 0.08)',
                          color: 'white'
                        } 
                      }}
                    >
                      {item.text}
                    </Button>
                  );
                })}
              </Box>
            ) : (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="right"
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width: 300, borderRadius: '24px 0 0 24px' },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navbar;