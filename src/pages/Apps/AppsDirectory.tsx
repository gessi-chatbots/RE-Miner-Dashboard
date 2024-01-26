import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal } from 'react-bootstrap';

import { AppDataDTO } from "../../DTOs/AppDataDTO";
import AppService from "../../services/AppService";
const defaultColumns = ['App ID', 'App Name', 'Description', 'Summary', 'Release Date', 'Version', 'Actions'];

const AppsDirectory: React.FC = () => {
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
            const appService = new AppService();
            try {
                const mappedData = await appService.fetchAllApps();
                if (mappedData !== undefined) {
                    setData(mappedData);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataFromApi();
    }, []);

    return (
        <Container className="mt-2">
            <div>
                <h1 className="text-secondary">Applications</h1>
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
                        <tr key={app.id}>
                            <td className="text-center">{app.id}</td>
                            <td className="text-center">{app.name || 'N/A'}</td>
                            <td className="text-center">{app.description || 'N/A'}</td>
                            <td className="text-center">{app.summary || 'N/A'}</td>
                            <td className="text-center">{app.release_date || 'N/A'}</td>
                            <td className="text-center">{app.version || 'N/A'}</td>
                            <td className="text-end">
                                <a href="#" className="action-icon" onClick={() => openEditModal(app)}>
                                    <i className="mdi mdi-pencil"></i>
                                </a>
                                <a href="#" className="action-icon" onClick={() => openDeleteModal(app)}>
                                    <i className="mdi mdi-delete"></i>
                                </a>
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
                    {/* Form for editing the app */}
                    <div className="row">
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label htmlFor="appName" className="form-label">App ID</label>
                                <input type="text" id="appName" className="form-control" defaultValue={selectedApp?.id} />
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="mb-3">
                                <label htmlFor="appName" className="form-label">App Name</label>
                                <input type="text" id="appName" className="form-control" defaultValue={selectedApp?.name} />
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

            {/* Delete Modal */}
            <Modal show={isDeleteModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {/* Your delete modal content here */}
                    {selectedApp && <p>Do you really want to <b>delete</b> the app: {selectedApp.name}?</p>}
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

export default AppsDirectory;
