import { Navigate, useLocation } from 'react-router-dom';
import {APICore} from "../api/apiCore";
import {useUserHook} from "../api/hooks";

type PrivateRouteProperties = {
    component: React.ComponentType;
    roles?: string;
};

const PrivateRoute = ({ component: RouteComponent, roles }: PrivateRouteProperties) => {
    let location = useLocation();
    const [loggedInUser] = useUserHook();

    const api = new APICore();

    if (!api.isUserAuthenticated()) {
        return <Navigate to={'/account/login'} state={{ from: location }} replace />;
    }

    if (roles && roles.indexOf(loggedInUser.role) === -1) {
        //Unauthorised user
        return <Navigate to={{ pathname: '/' }} />;
    }

    return <RouteComponent />;
};

export default PrivateRoute;
