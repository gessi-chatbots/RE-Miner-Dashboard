import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, OverlayTrigger, Tooltip, Row, Col} from 'react-bootstrap';

import { AppDataSimpleDTO } from "../../DTOs/AppDataSimpleDTO";
import AppService from "../../services/AppService";
import { toast } from 'react-toastify';
const defaultColumns = ['ID', 'App Name', '# Reviews', 'Actions'];

const AppsDirectory: React.FC = () => {
    const [data, setData] = useState<AppDataSimpleDTO[] | null>(null);
    const [isDeleteModalOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedApp, setSelectedApp] = useState<AppDataSimpleDTO | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [reviewId, setReviewId] = useState('');
    const [reviewContent, setReviewContent] = useState('');
    const [reviewDate, setReviewDate] = useState('');
    const [score, setScore] = useState('');

    const openDeleteModal = (app: AppDataSimpleDTO) => {
        setSelectedApp(app);
        setDeleteModalIsOpen(true);
    };

    const closeModals = () => {
        setDeleteModalIsOpen(false);
        setSelectedApp(null);
    };

    useEffect(() => {
        const fetchDataFromApi = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllApps(currentPage);
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
        const response = await appService.fetchAllApps(currentPage);
        if (response !== null) {
            const {apps: mappedData, total_pages: pages} = response;
            if (mappedData !== undefined) {
                setData(mappedData);
                setTotalPages(pages);
            }
        }
    }

    const deleteApp = async (app_id: string | undefined) => {
        if (!app_id) {
            console.error("App ID is undefined or null.");
            return false;
        }

        const appService = new AppService();
        try {
            await appService.deleteApp(app_id);
            const response = await appService.fetchAllApps();
            if (response !== null) {
                const {apps: mappedData, total_pages: pages} = response;
                if (mappedData !== undefined) {
                    setData(mappedData);
                    setTotalPages(pages);
                }
            }
            toast.success('App deleted successfully!');
            setDeleteModalIsOpen(false);
            return true;
        } catch (error) {
            toast.error('Error deleting app');
            console.error("Error deleting app:", error);
            setDeleteModalIsOpen(false);
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
                <h1 className="text-secondary">Applications</h1>
                    {data && data.length === 0 && (
                        <div className="d-flex justify-content-center align-items-center">
                            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                                <Row className="text-center">
                                <Col>
                                    <i className="mdi mdi-emoticon-sad text-secondary" style={{ fontSize: '5rem' }} />
                                    <h2>No applications uploaded yet.</h2>
                                    <p>Why don't you upload some apps?</p>
                                    <div style={{ width: 'fit-content', margin: '0 auto' }}> {/* Wrap the button inside a div */}
                                        <Button className="mt-4 btn-secondary" href="applications/upload">
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
                                        <th style={{ width: '25%' }} className="text-center">{defaultColumns[3]}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.map(app => (
                                        <tr key={app.id}>
                                            <td className="text-center">{app.id || 'N/A'}</td>
                                            <td className="text-center">{app.app_name || 'N/A'}</td>
                                            <td className="text-center">{app.review_size || 'N/A'}</td>
                                            <td className="text-end" style={{ width: "150px" }}>
                                                <OverlayTrigger overlay={<Tooltip id="delete-tooltip">Delete</Tooltip>}>
                                                    <a href="#" className="action-icon" onClick={() => openDeleteModal(app)}>
                                                        <i className="mdi mdi-delete"></i>
                                                    </a>
                                                </OverlayTrigger>
                                            </td>
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
            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedApp && <p>Do you really want to <b>delete</b> the app: {selectedApp.app_name}?</p>}
                    <p>This step is <b>irreversible</b></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="danger" onClick={() => deleteApp(selectedApp?.id)}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AppsDirectory;
