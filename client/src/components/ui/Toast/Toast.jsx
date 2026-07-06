import { FiAlertCircle, FiAlertTriangle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';
import cn from '../../../utils/cn';

export const toastTypeStyles = {
    success: {
        container: 'border-green-200 bg-green-50 text-green-800',
        icon: 'text-green-500',
        Icon: FiCheckCircle,
    },
    error: {
        container: 'border-red-200 bg-red-50 text-red-800',
        icon: 'text-red-500',
        Icon: FiAlertCircle,
    },
    warning: {
        container: 'border-amber-200 bg-amber-50 text-amber-800',
        icon: 'text-amber-500',
        Icon: FiAlertTriangle,
    },
    info: {
        container: 'border-blue-200 bg-blue-50 text-blue-800',
        icon: 'text-blue-500',
        Icon: FiInfo,
    },
};

const Toast = ({
    message,
    type = 'info',
    onClose,
    className = '',
}) => {
    const config = toastTypeStyles[type] || toastTypeStyles.info;
    const Icon = config.Icon;

    return (
        <div
            className={cn(
                'pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border p-4 shadow-lg',
                'animate-[slideIn_0.25s_ease-out]',
                config.container,
                className,
            )}
            role="alert"
        >
            <Icon className={cn('mt-0.5 shrink-0', config.icon)} size={20} />
            <p className="flex-1 text-sm font-medium leading-5">{message}</p>
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 rounded-md p-1 opacity-70 transition hover:bg-black/5 hover:opacity-100"
                    aria-label="Close toast"
                >
                    <FiX size={16} />
                </button>
            )}
        </div>
    );
};

export default Toast;
