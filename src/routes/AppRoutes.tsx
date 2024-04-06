import { BrowserRouter } from 'react-router-dom';
import ApplicationRoutes from './index';
import {ToastContainer} from "react-toastify";
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
            <ApplicationRoutes />
        </BrowserRouter>
    );
};

export default AppRoutes;