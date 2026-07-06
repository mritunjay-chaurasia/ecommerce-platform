import { NavLink, useNavigate } from 'react-router-dom';
import { FiChevronLeft, FiMenu } from 'react-icons/fi';
import getMenuByRole from '../../config/getMenuByRole';
import iconMap from '../../config/iconMap';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout as logoutApi } from '../../apis/user.api';
import { selectRole, selectUser, logout } from '../../store/slices/authSlice';
import { selectIsSidebarOpen, toggleSidebar } from '../../store/slices/uiSlice';
import './Sidebar.css';

const roleLabels = {
    guest: 'Guest',
    customer: 'Customer',
    admin: 'Admin',
};

const Sidebar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const role = useAppSelector(selectRole);
    const user = useAppSelector(selectUser);
    const isOpen = useAppSelector(selectIsSidebarOpen);

    const menuItems = getMenuByRole(role);
    const navItems = menuItems.filter((item) => !item.action);
    const actionItems = menuItems.filter((item) => item.action);

    const handleAction = async (item) => {
        if (item.action === 'logout') {
            try {
                await logoutApi();
            } catch {
                // Clear client state even if server logout fails
            }
            dispatch(logout());
            navigate('/login');
        }
    };

    const renderMenuItem = (item) => {
        const Icon = iconMap[item.icon];

        if (item.action === 'logout') {
            return (
                <li key={item.id}>
                    <button
                        type="button"
                        className="sidebar-item sidebar-item-logout"
                        title={item.label}
                        onClick={() => handleAction(item)}
                    >
                        {Icon && <Icon size={20} />}
                        {isOpen && <span>{item.label}</span>}
                    </button>
                </li>
            );
        }

        return (
            <li key={item.id}>
                <NavLink
                    to={item.path}
                    end={item.path === '/'}
                    className={({ isActive }) =>
                        `sidebar-item${isActive ? ' active' : ''}`
                    }
                    title={item.label}
                >
                    {Icon && <Icon size={20} />}
                    {isOpen && <span>{item.label}</span>}
                </NavLink>
            </li>
        );
    };

    const renderSection = (items) => {
        const sections = [];
        let currentSection = { label: null, items: [] };

        items.forEach((item) => {
            if (item.section) {
                if (currentSection.items.length > 0 || currentSection.label) {
                    sections.push(currentSection);
                }
                currentSection = { label: item.section, items: [] };
                return;
            }
            currentSection.items.push(item);
        });

        if (currentSection.items.length > 0 || currentSection.label) {
            sections.push(currentSection);
        }

        return sections.map((section) => (
            <div key={section.label || 'default'} className="sidebar-section">
                {section.label && isOpen && (
                    <p className="sidebar-section-label">{section.label}</p>
                )}
                <ul className="sidebar-menu">
                    {section.items.map(renderMenuItem)}
                </ul>
            </div>
        ));
    };

    return (
        <aside className={`sidebar${isOpen ? ' open' : ' collapsed'}`}>
            <div className="sidebar-brand">
                <div className="sidebar-brand-main">
                    <span className="brand-icon">E</span>
                    {isOpen && <span className="brand-text">Ecommerce</span>}
                </div>
                <button
                    type="button"
                    className="sidebar-toggle"
                    onClick={() => dispatch(toggleSidebar())}
                    aria-label="Toggle sidebar"
                    title={isOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                >
                    {isOpen ? <FiChevronLeft size={18} /> : <FiMenu size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {renderSection(navItems)}
            </nav>

            {actionItems.length > 0 && (
                <div className="sidebar-footer">
                    {isOpen && user && (
                        <div className="sidebar-user">
                            <p className="sidebar-user-name">
                                {user.fullName || user.firstName || 'User'}
                            </p>
                            <span className="sidebar-role-badge">{roleLabels[role] || role}</span>
                        </div>
                    )}
                    <ul className="sidebar-menu sidebar-menu-footer">
                        {actionItems.map(renderMenuItem)}
                    </ul>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
