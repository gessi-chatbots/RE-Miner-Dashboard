import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, OverlayTrigger, Tooltip, Row, Col} from 'react-bootstrap';

import { AppDataDTO } from "../../DTOs/AppDataDTO";
import AppService from "../../services/AppService";
import { toast } from 'react-toastify';
const defaultColumns = ['App Name', 'Description', 'Summary', 'Release Date', 'Version', 'Actions'];

const AppsDirectory: React.FC = () => {
    const [data, setData] = useState<AppDataDTO[] | null>(null);
    const [isEditModalOpen, setEditModalIsOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedApp, setSelectedApp] = useState<AppDataDTO | null>(null);
    const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState<boolean>(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [app_name, setAppName] = useState<string>('');
    const [description, setAppDescription] = useState<string>('');
    const [summary, setAppSummary] = useState<string>('');
    const [release_date, setAppReleaseDate] = useState<string>('');
    const [version, setAppVersion] = useState<string>('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const openAddReviewModal = (app: AppDataDTO) => {
        setSelectedApp(app);
        setIsAddReviewModalOpen(true);
    };

    const openEditModal = (app: AppDataDTO) => {
        setSelectedApp(app);
        setAppName(app.app_name || '');
        setAppDescription(app.description || '');
        setAppSummary(app.summary || '');
        setAppReleaseDate(app.release_date || '');
        setAppVersion(app.version || '');
        setEditModalIsOpen(true);
    };

    const openDeleteModal = (app: AppDataDTO) => {
        setSelectedApp(app);
        setDeleteModalIsOpen(true);
    };

    const closeModals = () => {
        setIsAddReviewModalOpen(false);
        setEditModalIsOpen(false);
        setDeleteModalIsOpen(false);
        setSelectedApp(null);
    };

    const truncateDescription = (description: string) => {
        return description.length > 200 ? `${description.substring(0, 200)}...` : description;
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

    const updateApp = async (
        app: AppDataDTO | null,
        app_name: string,
        description: string,
        summary: string,
        release_date: string,
        version: string
    ) => {
        if (!app) {
            console.error("app is undefined or null.");
            return false;
        }
        const id = app?.id
        const reviews = app?.reviews

        setIsUpdating(true);

        const appService = new AppService();
        try {
            await appService.updateApp({
                id,
                app_name,
                description,
                summary,
                release_date,
                version,
                reviews
            });
            setEditModalIsOpen(false);
            await updateAppDirectory(appService);
            toast.success('App updated successfully!');
            return true;
        } catch (error) {
            toast.error('Error updating app');
            console.error("Error updating app:", error);
            return false;
        } finally {
            setIsUpdating(false);
        }
    };

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
                                        <h2>No apps uploaded yet.</h2>
                                        <p>Why don't you upload some apps?</p>
                                        <Button className="btn-secondary" href="apps/upload"><i className="mdi mdi-upload"/> Upload Apps</Button>
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
                                        <th className="text-center">{defaultColumns[2]}</th>
                                        <th className="text-center">{defaultColumns[3]}</th>
                                        <th className="text-center">{defaultColumns[4]}</th>
                                        <th className="text-center" style={{ width: "150px" }}>{defaultColumns[5]}</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {data.map(app => (
                                        <tr key={app.id}>
                                            <td className="text-center">{app.app_name || 'N/A'}</td>
                                            <td className="text-center">{truncateDescription(app.description) || 'N/A'}
                                                <br/>
                                                {app.description && app.description.length > 200 &&
                                                    <Button variant="link" onClick={() => openEditModal(app)}>Read More</Button>}
                                            </td>
                                            <td className="text-center">{app.summary || 'N/A'}</td>
                                            <td className="text-center">{app.release_date || 'N/A'}</td>
                                            <td className="text-center">{app.version || 'N/A'}</td>
                                            <td className="text-end" style={{ width: "150px" }}>
                                                <OverlayTrigger overlay={<Tooltip id="edit-tooltip">Add Review</Tooltip>}>
                                                    <a href="#" className="action-icon" onClick={() => openAddReviewModal(app)}>
                                                        <i className="mdi mdi-file-plus"></i>
                                                    </a>
                                                </OverlayTrigger>
                                                <OverlayTrigger overlay={<Tooltip id="edit-tooltip">Edit</Tooltip>}>
                                                    <a href="#" className="action-icon" onClick={() => openEditModal(app)}>
                                                        <i className="mdi mdi-pencil"></i>
                                                    </a>
                                                </OverlayTrigger>
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
                                            {/* Page numbers */}
                                            {Array.from({ length: totalPages }, (_, index) => (
                                                <li key={index} className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}>
                                                    <Button className="btn-primary page-link" onClick={() => setCurrentPage(index + 1)}>
                                                        {index + 1}
                                                    </Button>
                                                </li>
                                            ))}
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
            {/* Edit Modal */}
            <Modal show={isEditModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Edit App</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="mb-3">
                                <label htmlFor="appName" className="form-label">App Name</label>
                                <input type="text" id="appName" className="form-control" value={app_name} onChange={(e) => setAppName(e.target.value)} />
                            </div>
                        </div>
                    </div>
                    <div className="row" >
                        <div className="mb-3">
                            <label htmlFor="appDescription" className="form-label">Description</label>
                            <textarea id="appDescription" className="form-control" value={description} onChange={(e) => setAppDescription(e.target.value)} rows={5} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="appSummary" className="form-label">Summary</label>
                            <input type="text" id="appSummary" className="form-control" value={summary} onChange={(e) => setAppSummary(e.target.value)} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="appReleaseDate" className="form-label">Release Date</label>
                                <input className="form-control" id="example-date" type="date" value={release_date} onChange={(e) => setAppReleaseDate(e.target.value)} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="appVersion" className="form-label">Version</label>
                                <input type="text" id="appVersion" className="form-control" value={version} onChange={(e) => setAppVersion(e.target.value)} />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button
                        variant="primary"
                        onClick={() =>
                            updateApp(
                                selectedApp,
                                app_name,
                                description,
                                summary,
                                release_date,
                                version
                            )
                        }
                        disabled={isUpdating}
                    >
                        Update
                    </Button>
                </Modal.Footer>
            </Modal>

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

            {/* Add Review Modal */}
            <Modal show={isAddReviewModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Add Review</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-8">
                            <div className="mb-3">
                                <label htmlFor="appName" className="form-label">App Name</label>
                                <input type="text" id="appName" className="form-control" defaultValue={selectedApp?.app_name} readOnly />
                            </div>
                        </div>
                    </div>

                    <div className="row" >
                        <div className="mb-3">
                            <label htmlFor="reviewId" className="form-label"><b className="text-danger">*</b> Review ID</label>
                            <input type="text" id="reviewId" className="form-control"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="review" className="form-label">Review Content</label>
                            <textarea id="review" className="form-control"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="userName" className="form-label">Review Username</label>
                                <input className="form-control" id="userName" type="text" />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="score" className="form-label">Score</label>
                                <input type="number" id="score" className="form-control"/>
                            </div>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="reviewDate" className="form-label">Date</label>
                                <input className="form-control" id="reviewDate" type="date"/>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="primary" onClick={closeModals}>Save</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AppsDirectory;
