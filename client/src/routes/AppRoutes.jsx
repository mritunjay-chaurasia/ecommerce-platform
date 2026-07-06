import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import routes from '../config/routes.json';
import routeComponents from './routeMap';
import PrivateRoute from './PrivateRoute';
import GuestRoute from './GuestRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {routes.map((route) => {
                const Component = routeComponents[route.component];

                if (!Component) {
                    return null;
                }

                const element = (
                    <>
                        <PageTitle title={route.title} />
                        <Component />
                    </>
                );

                let wrappedElement = element;

                if (route.guestOnly) {
                    wrappedElement = <GuestRoute>{element}</GuestRoute>;
                } else if (route.protected) {
                    wrappedElement = (
                        <PrivateRoute roles={route.roles || []}>
                            {element}
                        </PrivateRoute>
                    );
                }

                return (
                    <Route
                        key={route.path}
                        path={route.path}
                        element={wrappedElement}
                    />
                );
            })}
        </Routes>
    );
};

const PageTitle = ({ title }) => {
    useEffect(() => {
        document.title = title ? `${title} | Ecommerce` : 'Ecommerce';
    }, [title]);

    return null;
};

export default AppRoutes;
