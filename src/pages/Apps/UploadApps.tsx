import React, { useState } from "react";
import {Button, Col, Container, Modal, Row} from "react-bootstrap";
import FileUploader from "../../components/files/FileUploader";
import AppService from "../../services/AppService";

const UploadApps = () => {
    const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState<boolean>(false);
    const [appName, setAppName] = useState<string>('');
    const [appDescription, setAppDescription] = useState<string>('');
    const [appSummary, setAppSummary] = useState<string>('');
    const [releaseDate, setReleaseDate] = useState<string>('');
    const [appVersion, setAppVersion] = useState<string>('');

    const handleFileUpload = (files: any) => {
        console.log("Uploaded files:", files);
    };

    const openCreateAppModal = () => {
        setIsCreateAppModalOpen(true);
    };

    const closeModals = () => {
        setIsCreateAppModalOpen(false);
    };

    const createApp = async () => {
        const appData = {
            app_name: appName,
            description: appDescription,
            summary: appSummary,
            release_date: releaseDate,
            version: appVersion
        };
        const appService = new AppService();
        try {
            await appService.createApp(appData);
            closeModals();
        } catch (error) {
            console.error("Error creating app:", error);
        }
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
                    <Button className="btn-secondary" onClick={openCreateAppModal}>Upload App Manually</Button>
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
                    <Row>
                        <Col className="col-md-12">
                            <label htmlFor="appName" className="form-label">App Name</label>
                            <input type="text" id="appName" value={appName} onChange={(e) => setAppName(e.target.value)} className="form-control" placeholder="App Name" />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-md-12">
                            <label htmlFor="appDescription" className="form-label">Description</label>
                            <textarea id="appDescription" value={appDescription} onChange={(e) => setAppDescription(e.target.value)} className="form-control" placeholder="Description" />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-md-12">
                            <label htmlFor="appSummary" className="form-label">Summary</label>
                            <input type="text" id="appSummary" value={appSummary} onChange={(e) => setAppSummary(e.target.value)} className="form-control" placeholder="Summary" />
                        </Col>
                    </Row>
                    <Row>
                        <Col className="col-md-8">
                            <label htmlFor="appReleaseDate" className="form-label">Release Date</label>
                            <input type="date" id="appReleaseDate" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} className="form-control" />
                        </Col>
                        <Col className="col-md-4">
                            <label htmlFor="appVersion" className="form-label">Version</label>
                            <input type="text" id="appVersion" value={appVersion} onChange={(e) => setAppVersion(e.target.value)} className="form-control" placeholder="Version" />
                        </Col>
                    </Row>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="primary" onClick={createApp}>Create</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UploadApps;
