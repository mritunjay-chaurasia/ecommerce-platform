import { useEffect, useRef, useState } from 'react';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import { getImageUrl } from '../../../utils/imageUrl';
import {
    createPendingImageItem,
    getImageItemPreview,
    revokeImageItemPreview,
    validateImageFiles,
} from '../../../utils/imageUploadHelpers';
import Button from '../Button/Button';

const ACCEPTED_TYPES = 'image/jpeg,image/png,image/webp,image/gif';

const ImageUpload = ({
    label = 'Image',
    value,
    onChange,
    error,
    multiple = false,
    maxFiles = 5,
    disabled = false,
    className = '',
}) => {
    const inputRef = useRef(null);
    const [selectionError, setSelectionError] = useState('');

    const items = multiple
        ? (Array.isArray(value) ? value : [])
        : (value ? [value] : []);

    const itemsRef = useRef(items);
    itemsRef.current = items;

    useEffect(() => () => {
        itemsRef.current.forEach(revokeImageItemPreview);
    }, []);

    const helperText = error || selectionError || 'Image will be uploaded when you save the form.';

    const handleSelectFiles = (event) => {
        const files = Array.from(event.target.files || []);
        event.target.value = '';

        const { error: nextError, acceptedFiles } = validateImageFiles(files, maxFiles, items.length);

        if (nextError) {
            setSelectionError(nextError);
            return;
        }

        if (!acceptedFiles.length) {
            return;
        }

        setSelectionError('');

        const pendingItems = acceptedFiles.map(createPendingImageItem);

        if (multiple) {
            onChange([...items, ...pendingItems]);
            return;
        }

        items.forEach(revokeImageItemPreview);
        onChange(pendingItems[0]);
    };

    const handleRemove = (index) => {
        const itemToRemove = items[index];
        revokeImageItemPreview(itemToRemove);

        if (multiple) {
            onChange(items.filter((_item, itemIndex) => itemIndex !== index));
            return;
        }

        onChange(null);
    };

    const canSelectMore = multiple ? items.length < maxFiles : items.length === 0;

    return (
        <div className={className}>
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-medium text-slate-700">{label}</p>
                {canSelectMore ? (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => inputRef.current?.click()}
                        disabled={disabled}
                        leftIcon={<CloudUploadIcon />}
                    >
                        {multiple ? 'Select Images' : 'Select Image'}
                    </Button>
                ) : null}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_TYPES}
                multiple={multiple}
                hidden
                onChange={handleSelectFiles}
                disabled={disabled}
            />

            {items.length > 0 ? (
                <div className={`grid gap-3 ${multiple ? 'sm:grid-cols-2' : ''}`}>
                    {items.map((item, index) => {
                        const previewSource = item.kind === 'existing'
                            ? getImageUrl(getImageItemPreview(item))
                            : getImageItemPreview(item);
                        const labelText = item.kind === 'existing'
                            ? item.url
                            : item.file.name;

                        return (
                            <div
                                key={`${item.kind}-${labelText}-${index}`}
                                className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                            >
                                <img
                                    src={previewSource}
                                    alt={`${label} preview ${index + 1}`}
                                    className="w-full aspect-[3/2] object-cover"
                                />
                                <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
                                    <span className="truncate text-xs text-slate-500">{labelText}</span>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleRemove(index)}
                                        disabled={disabled}
                                        aria-label="Remove image"
                                    >
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                    No image selected. Choose a file from your device.
                </div>
            )}

            <FormHelperText error={Boolean(error || selectionError)} sx={{ mx: 0 }}>
                {helperText}
            </FormHelperText>
        </div>
    );
};

export default ImageUpload;
