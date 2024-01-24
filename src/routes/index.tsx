import React from 'react';
import { useRoutes } from 'react-router-dom';
import Root from "./RootRoute";
import NavBar from "../components/NavBar";


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