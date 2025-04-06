import { createTheme } from '@mui/material/styles';

// Kerrville Folk Festival brand colors
// Based on provided data: 
// - Text Color: rgb(77, 77, 77) - dark gray
// - Link Color: rgb(230, 97, 103) - reddish accent
// - Font families: SofiaSans, Oswald, Times New Roman
// - Background: white

export const theme = createTheme({
  palette: {
    primary: {
      main: 'rgb(230, 97, 103)', // Kerrville's reddish accent color for links
      contrastText: '#fff',
    },
    secondary: {
      main: '#5D7A63', // A folk festival green - complementary to the red
      contrastText: '#fff',
    },
    error: {
      main: '#f44336',
    },
    background: {
      default: '#fff',
      paper: '#fff',
    },
    text: {
      primary: 'rgb(77, 77, 77)', // Kerrville's text color
      secondary: 'rgba(77, 77, 77, 0.7)',
    },
  },
  typography: {
    fontFamily: [
      'SofiaSans',
      'Oswald',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontFamily: 'Oswald, Arial, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Oswald, Arial, sans-serif',
      fontWeight: 600,
    },
    h3: {
      fontFamily: 'Oswald, Arial, sans-serif',
      fontWeight: 600,
    },
    h4: {
      fontFamily: 'Oswald, Arial, sans-serif',
      fontWeight: 500,
    },
    h5: {
      fontFamily: 'Oswald, Arial, sans-serif',
      fontWeight: 500,
    },
    h6: {
      fontFamily: 'Oswald, Arial, sans-serif',
      fontWeight: 500,
    },
    body1: {
      fontFamily: 'SofiaSans, Arial, sans-serif',
    },
    body2: {
      fontFamily: 'SofiaSans, Arial, sans-serif',
    },
    button: {
      fontFamily: 'Oswald, Arial, sans-serif',
      textTransform: 'uppercase',
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#fff',
          color: 'rgb(77, 77, 77)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '10px 20px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#fff',
          color: 'rgb(77, 77, 77)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: 'SofiaSans, Arial, sans-serif',
        },
      },
    },
  },
}); 
