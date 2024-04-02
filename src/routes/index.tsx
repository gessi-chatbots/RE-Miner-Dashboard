import React, { ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Root from "./RootRoute";
import Navbar from "../components/navbar/Navbar";
import Dashboard from "../pages/Dashboard";
import ReviewsDirectory from "../pages/Reviews/ReviewsDirectory";
import AppsDirectory from "../pages/Apps/AppsDirectory";
import UploadApps from "../pages/Apps/UploadApps";
import Footer from "../components/footer/Footer";
import SignUpForm from "../pages/Auth/SignUp/SignUpForm";
import LoginForm from "../pages/Auth/Login/LoginForm";
import { Container } from "react-bootstrap";
import ReviewAnalyzer from "../pages/Reviews/ReviewAnalyzer";
import PrivateRoutes from './PrivateRoutes';
import KGDirectory from '../pages/Apps/KGDirectory';

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



const AuthenticatedRoutes: React.FC = () => {
    return (
        <Routes>
            <Route element={<PrivateRoutes />}>
                <Route path="/" element={<DefaultLayout><Root /></DefaultLayout>} />
                <Route path="/dashboard" element={<DefaultLayout><Dashboard /></DefaultLayout>} />
                <Route path="/applications/directory" element={<DefaultLayout><KGDirectory /></DefaultLayout>} />
                <Route path="/applications" element={<DefaultLayout><AppsDirectory /></DefaultLayout>} />
                <Route path="/applications/upload" element={<DefaultLayout><UploadApps /></DefaultLayout>} />
                <Route path="/reviews" element={<DefaultLayout><ReviewsDirectory /></DefaultLayout>} />
                <Route path="applications/:appId/reviews/:reviewId/analyze" element={<DefaultLayout><ReviewAnalyzer /></DefaultLayout>} />
            </Route>
            <Route path="/sign-up" element={<SignUpForm />} />
            <Route path="/login" element={<LoginForm />} />

        </Routes>
    );
};


const ApplicationRoutes: React.FC = () => {
    return (
        <AuthenticatedRoutes />
    );
};

export default ApplicationRoutes;
