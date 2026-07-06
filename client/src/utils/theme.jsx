import { getCookie, setCookie } from './cookies';
import { THEME_COOKIE_KEY, THEME_MODES } from '../constants/theme';

export const getSystemTheme = () => {
    if (typeof window === 'undefined') {
        return THEME_MODES.LIGHT;
    }

    return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? THEME_MODES.DARK
        : THEME_MODES.LIGHT;
};

export const isValidTheme = (value) =>
    value === THEME_MODES.LIGHT || value === THEME_MODES.DARK;

export const initializeTheme = () => {
    const stored = getCookie(THEME_COOKIE_KEY);

    if (isValidTheme(stored)) {
        return stored;
    }

    const systemTheme = getSystemTheme();
    setCookie(THEME_COOKIE_KEY, systemTheme);
    return systemTheme;
};

export const applyThemeToDocument = (theme) => {
    if (typeof document === 'undefined') {
        return;
    }

    const root = document.documentElement;

    if (theme === THEME_MODES.DARK) {
        root.classList.add('dark');
    } else {
        root.classList.remove('dark');
    }

    root.style.colorScheme = theme;
    root.dataset.theme = theme;
};
