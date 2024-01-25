import React, {ReactNode} from 'react';
import { useRoutes } from 'react-router-dom';
import Root from "./RootRoute";
import Navbar from "../components/navbar/Navbar";
import AppsDirectory from "../pages/AppsDirectory";
import AppsDirectoryRoute from "./AppsDirectoryRoute";
import Dashboard from "../pages/Dashboard";
import ReviewsDirectory from "../pages/ReviewsDirectory";

interface LayoutProps {
    children: ReactNode;
}

const DefaultLayout: React.FC<LayoutProps> = ({ children }) => (
    <>
        <Navbar />
        {children}
    </>
);

const Routes = () => {
    return useRoutes([
        {
            path: '/',
            element: <DefaultLayout><Root /></DefaultLayout>
        },
        {
            path: '/dashboard',
            element: <DefaultLayout><Dashboard/></DefaultLayout>
        },
        {
            path: '/apps',
            element: <DefaultLayout><AppsDirectory /></DefaultLayout>
        },
        {
            path: '/reviews',
            element: <DefaultLayout><ReviewsDirectory /></DefaultLayout>
        }
    ]);
};

export { Routes };
