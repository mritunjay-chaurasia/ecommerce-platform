import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectAuthChecked, selectIsAuthenticated, selectRole } from '../store/slices/authSlice';
import { PageLoader } from '../components/ui';

const PrivateRoute = ({ children, roles = [] }) => {
    const location = useLocation();
    const authChecked = useAppSelector(selectAuthChecked);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);

    if (!authChecked) {
        return <PageLoader label="Loading..." />;
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: `${location.pathname}${location.search}` }}
            />
        );
    }

    if (roles.length > 0 && !roles.includes(role)) {
        return <Navigate to="/dashboard" replace state={{ forbidden: true }} />;
    }

    return children;
};

export default PrivateRoute;
