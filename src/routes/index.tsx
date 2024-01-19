import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';
import useRedux from "../redux/hooks/useReduxHook";
import Root from "./RootRoute";


// Authorization routes
const Login = React.lazy(() => import('../pages/authorization/Login'));

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
};

const loading = () => <div className=""></div>;

const LoadComponent = ({ component: Component }: LoadComponentProps) => (
    <Suspense fallback={loading()}>
        <Component />
    </Suspense>
);
const Routes = () => {
    const { appSelector } = useRedux();
    return useRoutes([
        { path: '/', element: <Root /> },
        {
            path: '/',
            children: [
                {
                    path: 'authorization',
                    children: [
                        { path: 'login', element: <LoadComponent component={Login} /> }
                    ]

                }]
        }
    ]);
};
export {Routes}