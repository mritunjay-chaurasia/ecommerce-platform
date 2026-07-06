import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const SelectField = ({
    label,
    name,
    value,
    onChange,
    options = [],
    error,
    required = false,
    disabled = false,
    placeholder = 'Select an option',
    className = '',
}) => {
    return (
        <TextField
            id={name}
            name={name}
            label={label}
            value={value ?? ''}
            onChange={onChange}
            disabled={disabled}
            required={required}
            error={Boolean(error)}
            helperText={error || ' '}
            fullWidth
            size="small"
            className={className}
            select
        >
            <MenuItem value="">{placeholder}</MenuItem>
            {options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </TextField>
    );
};

export default SelectField;
