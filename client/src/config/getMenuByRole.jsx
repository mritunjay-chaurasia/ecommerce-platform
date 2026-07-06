import guestMenu from './menus/guest.json';
import customerMenu from './menus/customer.json';
import adminMenu from './menus/admin.json';

const menusByRole = {
    guest: guestMenu,
    customer: customerMenu,
    admin: adminMenu,
};

const getMenuByRole = (role) => menusByRole[role] || guestMenu;

export default getMenuByRole;
