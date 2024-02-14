import { BrowserRouter } from 'react-router-dom';
import { Routes } from './index'
import {ToastContainer} from "react-toastify";
import React from "react";
const AppRoutes = () => {
    return (
        <BrowserRouter>
            <ToastContainer
                hideProgressBar={true}
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