import React, {useState} from "react";
import {Button, Container, Modal, Row} from "react-bootstrap";
import FileUploader from "../../components/files/FileUploader";

const UploadApps = () => {
    const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState<boolean>(false);
    const handleFileUpload = (files: any) => {
        console.log("Uploaded files:", files);
    };

    const openCreateAppModal = () => {
        setIsCreateAppModalOpen(true);
    };

    const createAppModal = () => {
        setIsCreateAppModalOpen(true);
    };
    const closeModals = () => {
        setIsCreateAppModalOpen(false);
    };
    return (
        <Container className="mt-2">
            <div>
                <h1 className="text-secondary">Upload Applications</h1>
                <div className="mt-5">
                    <FileUploader onFileUpload={handleFileUpload} />
                </div>
            </div>
            <Row className="justify-content-end mt-3">
                <div className="col-auto">
                    <Button className="btn-secondary" onClick={() => openCreateAppModal()}>Upload App Manually</Button>
                </div>
                <div className="col-auto">
                    <Button className="button-primary">Upload</Button>
                </div>
            </Row>

            <Modal show={isCreateAppModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div className="row">
                        <div className="col-md-4">
                            <div className="mb-3">
                                <label htmlFor="appName" className="form-label">App ID</label>
                                <input type="text" id="appName" className="form-control"/>
                            </div>
                        </div>
                        <div className="col-md-8">
                            <div className="mb-3">
                                <label htmlFor="appName" className="form-label">App Name</label>
                                <input type="text" id="appName" className="form-control"/>
                            </div>
                        </div>
                    </div>

                    <div className="row" >
                        <div className="mb-3">
                            <label htmlFor="appDescription" className="form-label">Description</label>
                            <textarea id="appDescription" className="form-control"/>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="appSummary" className="form-label">Summary</label>
                            <input type="text" id="appSummary" className="form-control"/>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="appReleaseDate" className="form-label">Release Date</label>
                                <input className="form-control" id="example-date" type="date"/>
                            </div>
                        </div>
                        <div className="col-md-6">
                            <div className="mb-3">
                                <label htmlFor="appVersion" className="form-label">Version</label>
                                <input type="text" id="appVersion" className="form-control"/>
                            </div>
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="primary" onClick={closeModals}>Create</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UploadApps;
