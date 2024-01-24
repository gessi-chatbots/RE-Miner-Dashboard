import React, { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import Root from "./RootRoute";
import NavBar from "../components/NavBar";

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
};

interface AppRoutesProps {
    signOut: () => void; // Define the type for signOut
}


const loading = () => <div className=""></div>;

const LoadComponent = ({ component: Component }: LoadComponentProps) => (
    <Suspense fallback={loading()}>
        <Component />
    </Suspense>
);
const Routes = () => {


    return useRoutes([
        { path: '/', element: <Root /> },
        {
            // public routes
            path: 'dashboard',
            element: <NavBar />,
            children: [
            ],
        },
    ]);
};
export {Routes}