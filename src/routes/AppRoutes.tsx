import { BrowserRouter } from 'react-router-dom';
import { Routes } from './index'
import {ToastContainer} from "react-toastify";
import React from "react";
const AppRoutes = () => {
    return (
        <BrowserRouter>
            <ToastContainer
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <Routes />
        </BrowserRouter>
    );
};

export default AppRoutes;