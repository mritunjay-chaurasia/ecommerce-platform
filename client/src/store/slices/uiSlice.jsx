import { createSlice } from '@reduxjs/toolkit';
import { setCookie } from '../../utils/cookies';
import { applyThemeToDocument, initializeTheme } from '../../utils/theme';
import { THEME_COOKIE_KEY, THEME_MODES } from '../../constants/theme';

const initialTheme = initializeTheme();
applyThemeToDocument(initialTheme);

const uiSlice = createSlice({
    name: 'ui',
    initialState: {
        isSidebarOpen: true,
        theme: initialTheme,
    },
    reducers: {
        toggleSidebar: (state) => {
            state.isSidebarOpen = !state.isSidebarOpen;
        },
        setSidebarOpen: (state, action) => {
            state.isSidebarOpen = action.payload;
        },
        setTheme: (state, action) => {
            const theme = action.payload;
            state.theme = theme;
            setCookie(THEME_COOKIE_KEY, theme);
            applyThemeToDocument(theme);
        },
        toggleTheme: (state) => {
            const theme = state.theme === THEME_MODES.DARK ? THEME_MODES.LIGHT : THEME_MODES.DARK;
            state.theme = theme;
            setCookie(THEME_COOKIE_KEY, theme);
            applyThemeToDocument(theme);
        },
    },
});

export const {
    toggleSidebar,
    setSidebarOpen,
    setTheme,
    toggleTheme,
} = uiSlice.actions;

export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectTheme = (state) => state.ui.theme;
export const selectThemeMode = (state) => state.ui.theme;
export const selectResolvedTheme = (state) => state.ui.theme;

export default uiSlice.reducer;
