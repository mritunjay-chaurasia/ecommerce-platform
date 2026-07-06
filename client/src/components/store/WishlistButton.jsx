import { useState } from 'react';
import { FiHeart } from 'react-icons/fi';
import { useLocation, useNavigate } from 'react-router-dom';
import { toggleWishlistProduct } from '../../apis/wishlist.api';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectIsAuthenticated, selectRole } from '../../store/slices/authSlice';
import {
    selectIsInWishlist,
    setWishlistItems,
} from '../../store/slices/wishlistSlice';
import { showToastMessage, useToast } from '../ui';
import './WishlistButton.css';

const WishlistButton = ({ product, className = '' }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const isCustomer = isAuthenticated && role === 'customer';
    const isActive = useAppSelector(selectIsInWishlist(product.id));
    const [isUpdating, setIsUpdating] = useState(false);

    const handleToggle = async (event) => {
        event.preventDefault();
        event.stopPropagation();

        if (!isCustomer) {
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        if (isUpdating) {
            return;
        }

        setIsUpdating(true);

        try {
            const response = await toggleWishlistProduct(product.id);
            dispatch(setWishlistItems(response.data));
            showToastMessage(toast, response.message, 'success');
        } catch (error) {
            const message = error.response?.data?.message || 'Could not update wishlist';
            showToastMessage(toast, message, 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <button
            type="button"
            className={`wishlist-button${isActive ? ' active' : ''} ${className}`.trim()}
            onClick={handleToggle}
            disabled={isUpdating}
            aria-label={isActive ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isActive}
        >
            <FiHeart size={16} />
        </button>
    );
};

export default WishlistButton;
