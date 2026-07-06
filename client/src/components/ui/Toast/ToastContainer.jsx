import Toast from './Toast';

const ToastContainer = ({ toasts, onRemove }) => {
    if (!toasts.length) return null;

    return (
        <div className="pointer-events-none fixed inset-x-4 top-4 z-[9999] flex flex-col items-center gap-3 sm:inset-x-auto sm:right-4 sm:items-end">
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    onClose={() => onRemove(toast.id)}
                />
            ))}
        </div>
    );
};

export default ToastContainer;
