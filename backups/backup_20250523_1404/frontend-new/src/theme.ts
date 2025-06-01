import { createTheme } from '@mui/material/styles';

// Kerrville Folk Festival branded theme colors based on the logo
export const theme = createTheme({
  palette: {
    primary: {
      main: '#f54b64', // Coral pink from the logo
      light: '#ff7b8d',
      dark: '#c4173e',
      contrastText: '#fff',
    },
    secondary: {
      main: '#8bc3b5', // Mint green from the logo border
      light: '#bdf6e8',
      dark: '#5a9285',
      contrastText: '#333',
    },
    background: {
      default: '#fcf9f3', // Light cream background
      paper: '#ffffff',
    },
    text: {
      primary: '#2d2d2d',
      secondary: '#37466f', // Navy blue from the logo
    },
    error: {
      main: '#b71c1c',
    },
    warning: {
      main: '#ffa726', // Orange from the guitar in logo
    },
    info: {
      main: '#37466f', // Navy blue from the logo
    },
    success: {
      main: '#43a047', // Green
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
      color: '#f54b64', // Coral pink for headings
    },
    h5: {
      fontWeight: 500,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 20, // More rounded buttons to match the festive logo style
          textTransform: 'none',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: '#ff6b7e',
          },
        },
        containedSecondary: {
          '&:hover': {
            backgroundColor: '#9fd4c6',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#37466f', // Navy blue from the logo
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16, // More rounded cards
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          overflow: 'hidden',
          border: '1px solid #f0f0f0',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16, // More rounded papers
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#fcf9f3', // Light cream background for drawer
        },
      },
    },
  },
}); 
