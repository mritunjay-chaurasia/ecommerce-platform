import './App.css';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import store from './store/store';
import { clearAuth } from './store/slices/authSlice';
import { setUnauthorizedHandler } from './apis/index';
import AppThemeProvider from './components/theme/AppThemeProvider';
import AuthBootstrap from './components/auth/AuthBootstrap';
import Layout from './components/layout/Layout';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './components/ui/Toast/ToastProvider';
import { ConfirmProvider } from './components/ui/Modal/ConfirmProvider';

setUnauthorizedHandler(() => store.dispatch(clearAuth()));

function App() {
    return (
        <Provider store={store}>
            <AppThemeProvider>
                <ToastProvider>
                    <ConfirmProvider>
                        <BrowserRouter>
                            <AuthBootstrap>
                                <Layout>
                                    <AppRoutes />
                                </Layout>
                            </AuthBootstrap>
                        </BrowserRouter>
                    </ConfirmProvider>
                </ToastProvider>
            </AppThemeProvider>
        </Provider>
    );
}

export default App;
