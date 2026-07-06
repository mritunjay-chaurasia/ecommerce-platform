import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectRole } from '../../store/slices/authSlice';
import AdminDashboardView from './AdminDashboardView';
import CustomerDashboardView from './CustomerDashboardView';

const Dashboard = () => {
    const role = useAppSelector(selectRole);

    if (role === 'admin') {
        return <AdminDashboardView />;
    }

    if (role === 'customer') {
        return <CustomerDashboardView />;
    }

    return <Navigate to="/login" replace />;
};

export default Dashboard;
