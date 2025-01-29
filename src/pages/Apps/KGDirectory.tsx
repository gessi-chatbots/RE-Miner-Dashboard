import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, OverlayTrigger, Tooltip, Row, Col} from 'react-bootstrap';

import AppService from "../../services/AppService";
import { toast } from 'react-toastify';
import { AppDirectoryDataSimpleDTO } from '../../DTOs/AppDirectoryDataSimpleDTO';
const defaultColumns = ['Package', 'Application Name', '# Reviews'];

const KGDirectory: React.FC = () => {
    const [data, setData] = useState<AppDirectoryDataSimpleDTO[] | null>(null);
    const [isDeleteModalOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedApp, setSelectedApp] = useState<AppDirectoryDataSimpleDTO | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);



    useEffect(() => {
        const fetchDataFromApi = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllDirectoryApps(0);
                if (response !== null) {
                    const { apps: mappedData, total_pages: pages } = response;
                    setData(mappedData);
                    setTotalPages(pages);
                } else {
                    console.error('Response from fetchAllApps is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataFromApi();
    }, [currentPage]);

    const nextPage = async () => {
        if (currentPage < totalPages) {
            const appService = new AppService();
            const nextPageNumber = currentPage + 1;
            await updateAppDirectory(appService)
            setCurrentPage(nextPageNumber);
        }
    };

    const prevPage = async () => {
        if (currentPage > 1) {
            const appService = new AppService();
            const prevPageNumber = currentPage - 1;
            await updateAppDirectory(appService)
            setCurrentPage(prevPageNumber);
        }
    };


    async function updateAppDirectory(appService: AppService) {
        const response = await appService.fetchAllDirectoryApps(currentPage);
        if (response !== null) {
            const {apps: mappedData, total_pages: pages} = response;
            if (mappedData !== undefined) {
                setData(mappedData);
                setTotalPages(pages);
            }
        }
    }

    const addApp = async (app: AppDirectoryDataSimpleDTO | undefined) => {
        if (!app) {
            console.error("App is undefined or null.");
            return false;
        }

        try {
            const infoToast = toast.info('Importing application from directory', {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            });

            const appService = new AppService();
            await appService.addAppFromDirectory(app.name);

            toast.dismiss(infoToast);
            toast.success('Application imported successfully!');
            return true;
        } catch (error) {
            console.error('Error importing app:', error);
            toast.error('Error importing application');
            return false;
        }
    };


    const convertDateFormat = (inputDate: string) => {
        const [day, month, year] = inputDate.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };
    return (
        <div>
            <div>
                <h1 className="text-secondary">Applications Directory</h1>
                    {data && data.length === 0 && (
                        <div className="d-flex justify-content-center align-items-center">
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                            <Row className="text-center">
                                <Col>
                                    <i className="mdi mdi-emoticon-sad text-secondary" style={{ fontSize: '5rem' }} />
                                    <h2>No applications found in the directory.</h2>
                                    <div style={{ width: 'fit-content', margin: '0 auto' }}> {/* Wrap the button inside a div */}
                                        <Button className="mt-4 btn-secondary" href="/applications/upload">
                                            <i className="mdi mdi-upload"/> Upload Apps
                                        </Button>
                                    </div>
                                </Col>
                            </Row>

                            </div>
                        </div>

                    )}
                    {data && data.length > 0 && (
                        <>
                            <div className="d-flex justify-content-center align-items-center">
                                <Table className="table table-bordered table-centered table-striped table-hover mt-4">
                                    <thead>
                                    <tr>
                                        <th style={{ width: '20%' }} className="text-center">{defaultColumns[0]}</th>
                                        <th style={{ width: '25%' }} className="text-center">{defaultColumns[1]}</th>
                                        <th style={{ width: '25%' }} className="text-center">{defaultColumns[2]}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.map(app => (
                                        <tr key={app.applicationPackage}>
                                            <td className="text-center">{app.applicationPackage || 'N/A'}</td>
                                            <td className="text-center">{app.name || 'N/A'}</td>
                                            <td className="text-center">{app.reviewCount || 'N/A'}</td>

                                        </tr>
                                    ))}
                                    </tbody>
                                </Table>
                            </div>

                            {totalPages > 1 && (
                                <div className="d-flex justify-content-center align-items-center">
                                    <nav>
                                        <ul className="pagination pagination-rounded mb-0">
                                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                                <Button className="btn-primary page-link" onClick={prevPage} aria-label="Previous">
                                                    <span aria-hidden="true">&laquo;</span>
                                                </Button>
                                            </li>

                                            {currentPage > 6 && (
                                                <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                                                    <Button className="btn-primary page-link" onClick={() => setCurrentPage(1)}>
                                                        1
                                                    </Button>
                                                </li>
                                            )}

                                            {currentPage > 6 && (
                                                <li className="page-item disabled">
                                                    <Button className="btn-primary page-link" disabled>
                                                        ...
                                                    </Button>
                                                </li>
                                            )}

                                            {Array.from({ length: Math.min(5, totalPages - Math.max(1, currentPage - 2)) }, (_, index) => (
                                                <li key={index} className={`page-item ${currentPage === index + Math.max(1, currentPage - 2) ? 'active' : ''}`}>
                                                    <Button className="btn-primary page-link" onClick={() => setCurrentPage(index + Math.max(1, currentPage - 2))}>
                                                        {index + Math.max(1, currentPage - 2)}
                                                    </Button>
                                                </li>
                                            ))}


                                            {totalPages - currentPage > 2 && (
                                                <li className="page-item disabled">
                                                    <Button className="btn-primary page-link" disabled>
                                                        ...
                                                    </Button>
                                                </li>
                                            )}
                                            {/* Render the last page */}
                                            <li className={`page-item ${currentPage === totalPages ? 'active' : ''}`}>
                                                <Button className="btn-primary page-link" onClick={() => setCurrentPage(totalPages)}>
                                                    {totalPages}
                                                </Button>
                                            </li>
                                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                                <Button className="btn-primary page-link" onClick={nextPage} aria-label="Next">
                                                    <span aria-hidden="true">&raquo;</span>
                                                </Button>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            )}
                        </>
                    )}
                </div>
        </div>
    );
};

export default KGDirectory;
