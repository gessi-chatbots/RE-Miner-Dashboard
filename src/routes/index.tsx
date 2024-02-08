import React, {ReactNode} from 'react';
import { useRoutes } from 'react-router-dom';
import Root from "./RootRoute";
import Navbar from "../components/navbar/Navbar";
import Dashboard from "../pages/Dashboard";
import ReviewsDirectory from "../pages/Reviews/ReviewsDirectory";
import AppsDirectory from "../pages/Apps/AppsDirectory";
import UploadApps from "../pages/Apps/UploadApps";
import Footer from "../components/footer/Footer";
import {Container} from "react-bootstrap";
import ReviewAnalyzer from "../pages/Reviews/ReviewAnalyzer";


interface LayoutProps {
    children: ReactNode;
}

const DefaultLayout: React.FC<LayoutProps> = ({ children }) => (
    <>
        <Navbar />
        <Container className="py-4">
            {children}
        </Container>
        <div className="mt-5">
            <Footer />
        </div>

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
            path: '/apps/upload',
            element: <DefaultLayout><UploadApps /></DefaultLayout>
        },
        {
            path: '/reviews',
            element: <DefaultLayout><ReviewsDirectory /></DefaultLayout>
        },
        {
            path: '/reviews/:reviewId/analyze',
            element: <DefaultLayout><ReviewAnalyzer /></DefaultLayout>
        }
    ]);
};

export { Routes };
