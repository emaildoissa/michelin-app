import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AppBar, Box, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemIcon, ListItemText, useMediaQuery, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BuildIcon from '@mui/icons-material/Build';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useState } from 'react';
const navItems = [
    { text: 'Dashboard', path: '/', icon: _jsx(DashboardIcon, {}) },
    { text: 'Clientes', path: '/clientes', icon: _jsx(PeopleIcon, {}) },
    { text: 'Veículos', path: '/veiculos', icon: _jsx(DirectionsCarIcon, {}) },
    { text: 'Serviços', path: '/servicos', icon: _jsx(BuildIcon, {}) },
    { text: 'Peças', path: '/pecas', icon: _jsx(BuildIcon, {}) },
    { text: 'OS', path: '/ordens', icon: _jsx(AssignmentIcon, {}) },
];
const Navbar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };
    const drawer = (_jsxs(Box, { onClick: handleDrawerToggle, sx: { textAlign: 'center' }, children: [
        _jsx(Box, { sx: { py: 2, display: 'flex', justifyContent: 'center', alignItems: 'center' }, children: 
            _jsx(Typography, { variant: "h6", sx: { fontWeight: 700, letterSpacing: 1 }, children: "OFICINA MECÂNICA" })
        }), 
        _jsx(List, { children: navItems.map((item) => (_jsxs(ListItem, { component: Link, to: item.path, sx: {
                        color: 'inherit',
                        textDecoration: 'none',
                        '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.08)' },
                        cursor: 'pointer'
                    }, children: [_jsx(ListItemIcon, { children: item.icon }), _jsx(ListItemText, { primary: item.text })] }, item.text))) })] }));
    return (_jsxs(Box, { sx: { display: 'flex' }, children: [_jsx(AppBar, { position: "sticky", elevation: 0, sx: { borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }, children: _jsxs(Toolbar, { children: [
        isMobile && (_jsx(IconButton, { color: "inherit", "aria-label": "open drawer", edge: "start", onClick: handleDrawerToggle, sx: { mr: 2 }, children: _jsx(MenuIcon, {}) })), 
        _jsxs(Box, { sx: { flexGrow: 1, display: 'flex', alignItems: 'center' }, children: [
            _jsx(Box, { id: "logo-placeholder", sx: { 
                width: 40, 
                height: 40, 
                bgcolor: 'rgba(255,255,255,0.1)', 
                borderRadius: '8px',
                mr: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(255,255,255,0.3)'
            }, children: _jsx(Typography, { variant: "caption", sx: { fontSize: '8px', opacity: 0.7 }, children: "LOGO" }) }),
            _jsx(Typography, { variant: "h6", component: "div", sx: { fontWeight: 700, letterSpacing: 0.5 }, children: "OFICINA MECÂNICA" })
        ]}), 
        !isMobile && (_jsx(Box, { sx: { display: 'flex' }, children: navItems.map((item) => (_jsx(Button, { component: Link, to: item.path, sx: {
                                    color: 'rgba(255, 255, 255, 0.85)',
                                    mx: 0.5,
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    textTransform: 'none',
                                    padding: '6px 16px',
                                    borderRadius: '6px',
                                    '&:hover': {
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        color: '#ffffff',
                                    }
                                }, startIcon: item.icon, children: item.text }, item.text))) }))] }) }), _jsx(Box, { component: "nav", children: _jsx(Drawer, { variant: "temporary", open: mobileOpen, onClose: handleDrawerToggle, ModalProps: {
                        keepMounted: true, // Better open performance on mobile.
                    }, sx: {
                        display: { xs: 'block', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }, children: drawer }) })] }));
};
export default Navbar;
