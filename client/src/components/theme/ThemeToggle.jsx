import { FiMoon, FiSun } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectTheme, toggleTheme } from '../../store/slices/uiSlice';
import { THEME_MODES } from '../../constants/theme';
import './ThemeToggle.css';

const ThemeToggle = ({ className = '' }) => {
    const dispatch = useAppDispatch();
    const theme = useAppSelector(selectTheme);
    const isDark = theme === THEME_MODES.DARK;
    const Icon = isDark ? FiSun : FiMoon;
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

    return (
        <button
            type="button"
            className={`theme-toggle ${className}`.trim()}
            onClick={() => dispatch(toggleTheme())}
            title={label}
            aria-label={label}
        >
            <Icon size={18} />
            <span className="theme-toggle-label">{isDark ? 'Light' : 'Dark'}</span>
        </button>
    );
};

export default ThemeToggle;
