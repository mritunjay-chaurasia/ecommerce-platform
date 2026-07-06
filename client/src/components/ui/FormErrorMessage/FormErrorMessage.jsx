import cn from '../../../utils/cn';

const FormErrorMessage = ({ message, id, className = '' }) => {
    if (!message) return null;

    return (
        <p
            id={id}
            role="alert"
            className={cn('mt-1.5 text-xs font-medium text-red-500 sm:text-sm', className)}
        >
            {message}
        </p>
    );
};

export default FormErrorMessage;
