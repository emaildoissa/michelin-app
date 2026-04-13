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
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center', p: 2 }}>
      <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: 60, height: 60, bgcolor: 'primary.main', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          L
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: -0.5 }}>
          OFICINA MECÂNICA
        </Typography>
      </Box>
      <List>
        {navItems.map((item) => (
          <ListItem 
            component={Link} 
            to={item.path} 
            key={item.text}
            selected={location.pathname === item.path}
            sx={{ 
              borderRadius: 2,
              mb: 0.5,
              '&.Mui-selected': {
                backgroundColor: 'rgba(0, 0, 0, 0.08)',
                color: 'primary.main',
                '& .MuiListItemIcon-root': { color: 'primary.main' }
              }
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} primaryTypographyProps={{ fontWeight: 600 }} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box>
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', color: 'text.primary' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
            )}
            
            <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box id="logo-placeholder" sx={{ 
                width: 40, 
                height: 40, 
                bgcolor: 'primary.main', 
                borderRadius: '10px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: 'white',
                fontWeight: 900
              }}>
                L
              </Box>
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: -0.5 }}
              >
                OFICINA MECÂNICA
              </Typography>
            </Box>

            {!isMobile && (
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                {navItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Button 
                      key={item.text} 
                      component={Link} 
                      to={item.path} 
                      sx={{ 
                        color: isActive ? 'primary.main' : 'text.secondary',
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        fontWeight: isActive ? 700 : 500,
                        backgroundColor: isActive ? 'rgba(0, 0, 0, 0.04)' : 'transparent',
                        '&:hover': { 
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          color: 'primary.main'
                        } 
                      }}
                      startIcon={item.icon}
                    >
                      {item.text}
                    </Button>
                  );
                })}
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': { width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </Box>
  );
};

export default Navbar;