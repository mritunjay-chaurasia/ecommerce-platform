import CloseIcon from '@mui/icons-material/Close';
import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Typography,
} from '@mui/material';

const sizeMap = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
};

const Modal = ({
    open,
    title,
    description,
    children,
    footer,
    onClose,
    size = 'md',
    closeText = 'Close',
    showCloseButton = true,
    disableClose = false,
    className = '',
    contentClassName = '',
}) => {
    if (!open) {
        return null;
    }

    const handleClose = () => {
        if (disableClose) {
            return;
        }

        onClose?.();
    };

    const handleDialogClose = (event, reason) => {
        if (disableClose && (reason === 'backdropClick' || reason === 'escapeKeyDown')) {
            return;
        }

        handleClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleDialogClose}
            fullWidth
            maxWidth={sizeMap[size] || 'md'}
            disableEscapeKeyDown={disableClose}
            PaperProps={{
                className,
                sx: {
                    borderRadius: 3,
                },
            }}
        >
            {(title || description || showCloseButton) && (
                <DialogTitle sx={{ pb: description ? 1 : 2 }}>
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            {title && (
                                <Typography id="modal-title" variant="h6" component="h2" fontWeight={700}>
                                    {title}
                                </Typography>
                            )}
                            {description && (
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {description}
                                </Typography>
                            )}
                        </div>
                        {showCloseButton && (
                            <IconButton
                                aria-label={closeText}
                                onClick={handleClose}
                                disabled={disableClose}
                                size="small"
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </div>
                </DialogTitle>
            )}

            <DialogContent dividers className={contentClassName}>
                {children}
            </DialogContent>

            {footer && (
                <DialogActions sx={{ px: 3, pb: 3, pt: 2 }}>
                    {footer}
                </DialogActions>
            )}
        </Dialog>
    );
};

export default Modal;
