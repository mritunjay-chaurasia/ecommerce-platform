import { useMemo } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAppSelector } from '../../store/hooks';
import { selectTheme } from '../../store/slices/uiSlice';
import createMuiTheme from '../../theme/muiTheme';

const AppThemeProvider = ({ children }) => {
    const theme = useAppSelector(selectTheme);
    const muiTheme = useMemo(() => createMuiTheme(theme), [theme]);

    return (
        <ThemeProvider theme={muiTheme}>
            <CssBaseline />
            {children}
        </ThemeProvider>
    );
};

export default AppThemeProvider;
