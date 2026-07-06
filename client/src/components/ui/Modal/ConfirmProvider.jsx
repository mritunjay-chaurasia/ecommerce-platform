import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmModal from './ConfirmModal';

const ConfirmContext = createContext(null);

const ConfirmProvider = ({ children }) => {
    const [state, setState] = useState({
        open: false,
        title: '',
        message: '',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        variant: 'primary',
        loading: false,
    });

    const [resolver, setResolver] = useState(null);

    const closeConfirm = useCallback(() => {
        setState((prev) => ({ ...prev, open: false, loading: false }));
    }, []);

    const confirm = useCallback((options) => new Promise((resolve) => {
        setResolver(() => resolve);
        setState({
            open: true,
            title: options.title || 'Confirm Action',
            message: options.message || 'Are you sure you want to continue?',
            confirmText: options.confirmText || 'Confirm',
            cancelText: options.cancelText || 'Cancel',
            variant: options.variant || 'primary',
            loading: false,
        });
    }), []);

    const handleConfirm = () => {
        if (resolver) resolver(true);
        closeConfirm();
        setResolver(null);
    };

    const handleCancel = () => {
        if (resolver) resolver(false);
        closeConfirm();
        setResolver(null);
    };

    const value = useMemo(() => ({ confirm }), [confirm]);

    return (
        <ConfirmContext.Provider value={value}>
            {children}
            <ConfirmModal
                open={state.open}
                title={state.title}
                message={state.message}
                confirmText={state.confirmText}
                cancelText={state.cancelText}
                variant={state.variant}
                loading={state.loading}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </ConfirmContext.Provider>
    );
};

const useConfirm = () => {
    const context = useContext(ConfirmContext);

    if (!context) {
        throw new Error('useConfirm must be used within ConfirmProvider');
    }

    return context;
};

export { ConfirmProvider, useConfirm };
