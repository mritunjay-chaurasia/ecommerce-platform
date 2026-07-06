import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiPackage, FiLogOut, FiHeart } from 'react-icons/fi';
import { getStoreProducts } from '../../apis/store.api';
import { useStoreSettings } from '../../context/StoreSettingsProvider';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout as logoutApi } from '../../apis/user.api';
import { selectIsAuthenticated, selectRole, selectUser, logout } from '../../store/slices/authSlice';
import { selectCartItemCount } from '../../store/slices/cartSlice';
import { selectWishlistCount } from '../../store/slices/wishlistSlice';
import ThemeToggle from '../theme/ThemeToggle';
import './StoreNavbar.css';

const StoreNavbar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { settings } = useStoreSettings();
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    const role = useAppSelector(selectRole);
    const user = useAppSelector(selectUser);
    const cartItemCount = useAppSelector(selectCartItemCount);
    const wishlistCount = useAppSelector(selectWishlistCount);
    const isCustomer = isAuthenticated && role === 'customer';
    const [categories, setCategories] = useState([]);
    const [searchInput, setSearchInput] = useState('');

    const storeName = settings?.storeName || 'Store';
    const brandInitial = storeName.charAt(0).toUpperCase() || 'S';

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        setSearchInput(params.get('search') || '');
    }, [location.search]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await getStoreProducts();
                setCategories(response.filters?.categories || []);
            } catch {
                setCategories([]);
            }
        };

        fetchCategories();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch {
            // Clear client state even if server logout fails
        }
        dispatch(logout());
        navigate('/');
    };

    const handleSearchSubmit = useCallback((event) => {
        event.preventDefault();
        const trimmedSearch = searchInput.trim();
        const params = new URLSearchParams(location.search);

        if (trimmedSearch) {
            params.set('search', trimmedSearch);
        } else {
            params.delete('search');
        }

        navigate({
            pathname: '/',
            search: params.toString() ? `?${params.toString()}` : '',
        });
    }, [location.search, navigate, searchInput]);

    return (
        <header className="store-nav">
            <div className="store-nav-main">
                <Link to="/" className="store-nav-brand">
                    <span className="store-nav-brand-icon">{brandInitial}</span>
                    <span className="store-nav-brand-text">{storeName}</span>
                </Link>

                <form className="store-nav-search" onSubmit={handleSearchSubmit}>
                    <input
                        type="search"
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        placeholder="Search for products, brands and more"
                        aria-label="Search products"
                    />
                    <button type="submit" className="store-nav-search-btn" aria-label="Search">
                        <FiSearch size={18} />
                    </button>
                </form>

                <div className="store-nav-actions">
                    <ThemeToggle className="theme-toggle-compact" />

                    {isCustomer ? (
                        <>
                            <Link to="/dashboard" className="store-nav-action">
                                <FiUser size={18} />
                                <span>{user?.firstName || 'Account'}</span>
                            </Link>
                            <Link to="/orders" className="store-nav-action">
                                <FiPackage size={18} />
                                <span>Orders</span>
                            </Link>
                            <Link to="/wishlist" className="store-nav-action">
                                <FiHeart size={18} />
                                <span>{wishlistCount > 0 ? `Wishlist (${wishlistCount})` : 'Wishlist'}</span>
                            </Link>
                            <Link to="/cart" className="store-nav-action store-nav-cart">
                                <FiShoppingCart size={18} />
                                <span>{cartItemCount > 0 ? `Cart (${cartItemCount})` : 'Cart'}</span>
                            </Link>
                            <button
                                type="button"
                                className="store-nav-action store-nav-logout"
                                onClick={handleLogout}
                            >
                                <FiLogOut size={18} />
                                <span>Logout</span>
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" state={{ from: '/wishlist' }} className="store-nav-action">
                                <FiHeart size={18} />
                                <span>Wishlist</span>
                            </Link>
                            <Link to="/cart" className="store-nav-action store-nav-cart">
                                <FiShoppingCart size={18} />
                                <span>{cartItemCount > 0 ? `Cart (${cartItemCount})` : 'Cart'}</span>
                            </Link>
                            <Link to="/login" className="store-nav-action">
                                <FiUser size={18} />
                                <span>Login</span>
                            </Link>
                            <Link to="/signup" className="store-nav-btn">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>

            {categories.length > 0 ? (
                <nav className="store-nav-categories" aria-label="Categories">
                    <Link to="/">All Products</Link>
                    {categories.map((category) => (
                        <Link key={category.id} to={`/?category=${category.id}`}>
                            {category.name}
                        </Link>
                    ))}
                </nav>
            ) : null}
        </header>
    );
};

export default StoreNavbar;
