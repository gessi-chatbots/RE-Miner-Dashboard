import React, {ReactNode} from 'react';
import { useRoutes } from 'react-router-dom';
import Root from "./RootRoute";
import Navbar from "../components/navbar/Navbar";

interface LayoutProps {
    children: ReactNode;
}

const DefaultLayout: React.FC<LayoutProps> = ({ children }) => (
    <>
        <Navbar />
        {children}
    </>
);


const Routes = () => {
    return useRoutes([
        {
            path: '/',
            element: <DefaultLayout><Root /></DefaultLayout>,
        },
        {
            // public routes
            path: 'dashboard',
            element: <DefaultLayout>
                <div> </div>

            </DefaultLayout>,
            children: [
                {
                    path: 'apps',
                    element: <div>
                    </div>,
                    children: [
                        {
                            path: 'view',
                            element: <div>
                            </div>,
                        },
                        {
                            path: 'upload',
                            element: <div>
                            </div>,
                        },
                    ],
                },
                {
                    path: 'reviews',
                    element: <div>
                    </div>,
                    children: [
                        {
                            path: 'view',
                            element: <div>
                            </div>,
                        },
                        {
                            path: 'upload',
                            element: <DefaultLayout children={<h1></h1>}></DefaultLayout>
                        },
                        {
                            path: 'process',
                            element: <div>
                            </div>,
                        },
                    ],
                },
            ],
        },
    ]);
};

export { Routes };