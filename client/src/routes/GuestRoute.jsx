import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectAuthChecked, selectIsAuthenticated } from '../store/slices/authSlice';
import { PageLoader } from '../components/ui';

const GuestRoute = ({ children }) => {
    const location = useLocation();
    const authChecked = useAppSelector(selectAuthChecked);
    const isAuthenticated = useAppSelector(selectIsAuthenticated);

    if (!authChecked) {
        return <PageLoader label="Loading..." />;
    }

    if (isAuthenticated) {
        return <Navigate to={location.state?.from || '/dashboard'} replace />;
    }

    return children;
};

export default GuestRoute;
