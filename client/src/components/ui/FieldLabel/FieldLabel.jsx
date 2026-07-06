import cn from '../../../utils/cn';

const FieldLabel = ({ htmlFor, label, required = false, className = '' }) => {
    if (!label) return null;

    return (
        <label
            htmlFor={htmlFor}
            className={cn('mb-1.5 block text-sm font-medium text-slate-700', className)}
        >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
    );
};

export default FieldLabel;
