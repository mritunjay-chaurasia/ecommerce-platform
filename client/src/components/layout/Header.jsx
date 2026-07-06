import { Link } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectRole, selectUser, selectIsAuthenticated } from '../../store/slices/authSlice';
import ThemeToggle from '../theme/ThemeToggle';
import './Header.css';

const Header = () => {
    const role = useAppSelector(selectRole);
    const user = useAppSelector(selectUser);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    return (
        <header className="header">
            <div className="header-spacer" />

            <div className="header-info">
                <ThemeToggle className="theme-toggle-compact" />

                {isAuthenticated ? (
                    <>
                        {user && (
                            <span className="header-user">
                                {user.fullName || user.firstName}
                            </span>
                        )}
                        <span className="header-role">{role}</span>
                    </>
                ) : (
                    <div className="header-auth">
                        <Link to="/login" className="header-auth-btn header-auth-btn-outline">
                            Login
                        </Link>
                        <Link to="/signup" className="header-auth-btn header-auth-btn-primary">
                            Sign Up
                        </Link>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
