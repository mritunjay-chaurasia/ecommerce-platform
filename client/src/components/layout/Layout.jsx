import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import StoreNavbar from './StoreNavbar';
import StoreFooter from './StoreFooter';
import CartSync from '../store/CartSync';
import WishlistSync from '../store/WishlistSync';
import ThemeToggle from '../theme/ThemeToggle';
import { StoreSettingsProvider } from '../../context/StoreSettingsProvider';
import { useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectRole } from '../../store/slices/authSlice';

const AUTH_PATHS = ['/login', '/signup', '/forgot-password', '/reset-password', '/verify-email', '/auth/callback'];

const Layout = ({ children }) => {
    const { pathname } = useLocation();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const isAdmin = isAuthenticated && role === 'admin';

    const isAuthPage = AUTH_PATHS.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
    );

    if (isAuthPage) {
        return (
            <main className="relative min-h-screen bg-slate-100 dark:bg-slate-950">
                <div className="absolute right-4 top-4 z-10">
                    <ThemeToggle />
                </div>
                {children}
            </main>
        );
    }

    return (
        <StoreSettingsProvider>
            {isAdmin ? (
                <div className="flex min-h-screen bg-slate-100 dark:bg-slate-950">
                    <Sidebar />
                    <div className="flex min-w-0 flex-1 flex-col">
                        <Header />
                        <main className="flex-1 overflow-y-auto bg-slate-100 p-4 dark:bg-slate-950 sm:p-6">
                            {children}
                        </main>
                    </div>
                </div>
            ) : (
                <div className="flex min-h-screen flex-col dark:bg-slate-950">
                    <StoreNavbar />
                    <CartSync />
                    <WishlistSync />
                    <main className="flex-1">
                        {children}
                    </main>
                    <StoreFooter />
                </div>
            )}
        </StoreSettingsProvider>
    );
};

export default Layout;
