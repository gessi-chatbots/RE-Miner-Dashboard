import { Outlet, Navigate } from 'react-router-dom'

const PrivateRoutes = () => {
    const accessToken = localStorage.getItem('ACCESS_TOKEN');
    const refreshToken = localStorage.getItem('REFRESH_TOKEN');
    return accessToken && refreshToken ? <Outlet/> : <Navigate to="/login"/>
}

export default PrivateRoutes