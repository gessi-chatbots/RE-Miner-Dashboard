import React, { useState, useEffect } from 'react';
import {Container, Table, Button, Modal, Tooltip, OverlayTrigger} from 'react-bootstrap';

import { AppDataDTO } from "../../DTOs/AppDataDTO";
import AppService from "../../services/AppService";
const defaultColumns = ['Review ID', 'Review', 'Score', 'Date', 'Actions'];

const ReviewsDirectory: React.FC = () => {
    const [data, setData] = useState<AppDataDTO[] | null>(null);
    const [isEditModalOpen, setEditModalIsOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedApp, setSelectedApp] = useState<AppDataDTO | null>(null);

    const openEditModal = (app: AppDataDTO) => {
        setSelectedApp(app);
        setEditModalIsOpen(true);
    };

    const openDeleteModal = (app: AppDataDTO) => {
        setSelectedApp(app);
        setDeleteModalIsOpen(true);
    };

    const closeModals = () => {
        setEditModalIsOpen(false);
        setDeleteModalIsOpen(false);
        setSelectedApp(null);
    };

    useEffect(() => {
        const fetchDataFromApi = async () => {
        };
        fetchDataFromApi();
    }, []);



    return (
        <Container className="mt-2">
            <div>
                <h1 className="text-secondary">Reviews</h1>
                <Table className="table table-bordered table-centered table-striped table-hover mt-4">
                    <thead>
                    <tr>
                        {defaultColumns.map(column => (
                            <th className="text-center" key={column}>{column}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {data && data.map(app => (
                        <tr key={app.app_name}>
                            <td className="text-center">{app.app_name || 'N/A'}</td>
                            <td className="text-center">{app.description || 'N/A'}</td>
                            <td className="text-center">{app.summary || 'N/A'}</td>
                            <td className="text-center">{app.summary || 'N/A'}</td>
                            <td className="text-end" style={{ width: "150px" }}> {/* Adjust width as needed */}
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
                                <input type="text" id="appName" className="form-control" defaultValue={selectedApp?.app_name} />
                            </div>
                        </div>
                    </div>

                    <div className="row" >
                        <div className="mb-3">
                            <label htmlFor="appDescription" className="form-label">Description</label>
                            <textarea id="appDescription" className="form-control" defaultValue={selectedApp?.description} />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="appSummary" className="form-label">Summary</label>
                            <input type="text" id="appSummary" className="form-control" defaultValue={selectedApp?.summary} />
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="appReleaseDate" className="form-label">Release Date</label>
                                <input className="form-control" id="example-date" type="date" defaultValue={selectedApp?.release_date} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="appVersion" className="form-label">Version</label>
                                <input type="text" id="appVersion" className="form-control" defaultValue={selectedApp?.version} />
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="primary" onClick={closeModals}>Save</Button>
                </Modal.Footer>
            </Modal>

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
                    <Button variant="danger" onClick={closeModals}>Delete</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default ReviewsDirectory;
