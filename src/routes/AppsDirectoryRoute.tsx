import {Navigate} from 'react-router-dom';

const Root = () => {
    const getRootUrl = () => {
        return 'apps/view';
    };

    const url = getRootUrl();

    return <Navigate to={`/${url}`} />;
};

export default Root;
