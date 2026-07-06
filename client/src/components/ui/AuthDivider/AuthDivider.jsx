import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

const AuthDivider = ({ text = 'or continue with email' }) => {
    return (
        <Divider className="!my-5">
            <Typography variant="caption" color="text.secondary" className="!px-2">
                {text}
            </Typography>
        </Divider>
    );
};

export default AuthDivider;
