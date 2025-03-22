import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#4A704A', light: '#A3C1A3' }, // soft-green, pastel-green
    secondary: { main: '#E07B91', light: '#F4B8C1' }, // powder-pink, pastel-pink
    background: { default: '#F9F5F0', paper: '#FDF6E3' }, // lightBg, lightCard
    text: { primary: '#5C4033', secondary: '#6B7280' }, // soft-brown, darkBorder
    error: { main: '#B71C1C' }, // Nouvelle couleur d’erreur
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
    h4: { fontFamily: 'Lora, serif' },
  },
});

export default theme;