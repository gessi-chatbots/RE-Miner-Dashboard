import React from 'react';
import { useRoutes } from 'react-router-dom';
import Root from "./RootRoute";
import Navbar from "../components/navbar/Navbar";


const Routes = () => {
    return useRoutes([
        { path: '/', element: <Root /> },
        {
            // public routes
            path: 'dashboard',
            element: <Navbar />,
            children: [
            ],
        },
    ]);
};
export {Routes}