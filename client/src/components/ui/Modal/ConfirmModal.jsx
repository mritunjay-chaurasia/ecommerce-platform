import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
    Box,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography,
} from '@mui/material';
import Button from '../Button/Button';

const ConfirmModal = ({
    open,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'primary',
    loading = false,
    onConfirm,
    onCancel,
}) => {
    if (!open) {
        return null;
    }

    const handleClose = (event, reason) => {
        if (loading && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
            return;
        }

        onCancel?.();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="xs"
            disableEscapeKeyDown={loading}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                },
            }}
        >
            <DialogTitle sx={{ pb: 1 }}>
                <Box display="flex" alignItems="flex-start" gap={2}>
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 40,
                            height: 40,
                            borderRadius: '9999px',
                            bgcolor: variant === 'danger' ? 'error.light' : 'primary.light',
                            color: variant === 'danger' ? 'error.main' : 'primary.main',
                            flexShrink: 0,
                        }}
                    >
                        <WarningAmberRoundedIcon fontSize="small" />
                    </Box>
                    <Box>
                        <Typography id="confirm-modal-title" variant="h6" component="h2" fontWeight={700}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {message}
                        </Typography>
                    </Box>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 1 }} />

            <DialogActions sx={{ px: 3, pb: 3, pt: 1, flexWrap: 'wrap', gap: 1 }}>
                <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full sm:w-auto"
                >
                    {cancelText}
                </Button>
                <Button
                    type="button"
                    variant={variant}
                    onClick={onConfirm}
                    loading={loading}
                    className="w-full sm:w-auto"
                >
                    {confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmModal;
