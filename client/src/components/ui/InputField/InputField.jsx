import TextField from '@mui/material/TextField';

const InputField = ({
    label,
    name,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    disabled = false,
    className = '',
    ...rest
}) => {
    return (
        <TextField
            id={name}
            name={name}
            type={type}
            label={label}
            value={value ?? ''}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            error={Boolean(error)}
            helperText={error || ' '}
            fullWidth
            size="small"
            className={className}
            variant="outlined"
            {...rest}
        />
    );
};

export default InputField;
