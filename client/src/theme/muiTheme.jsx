import { createTheme } from '@mui/material/styles';
import { THEME_MODES } from '../constants/theme';

const sharedTheme = {
    shape: {
        borderRadius: 8,
    },
    typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    fontWeight: 600,
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                size: 'small',
                fullWidth: true,
            },
        },
    },
};

const createMuiTheme = (mode = THEME_MODES.LIGHT) => createTheme({
    ...sharedTheme,
    palette: {
        mode,
        primary: {
            main: '#2874f0',
            dark: '#1c5dc9',
            light: '#5b9aff',
        },
        error: {
            main: '#ef4444',
        },
        background: {
            default: mode === THEME_MODES.DARK ? '#0f172a' : '#f1f3f6',
            paper: mode === THEME_MODES.DARK ? '#1e293b' : '#ffffff',
        },
    },
});

export default createMuiTheme;
