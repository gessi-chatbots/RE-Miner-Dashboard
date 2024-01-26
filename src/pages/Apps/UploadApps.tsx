import React, {useEffect, useRef, useState} from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import FileUploader, {FileUploaderProps} from "../../components/files/FileUploader";
import AppService from "../../services/AppService";
import { toast } from 'react-toastify';
import {AppDataDTO} from "../../DTOs/AppDataDTO";
export interface File {
    name: string;
    type: string;
    size: number;
    preview?: string | null;
    formattedSize?: string | null;
}

const UploadApps = () => {
    const [isCreateAppModalOpen, setIsCreateAppModalOpen] = useState(false);
    const [appName, setAppName] = useState('');
    const [appDescription, setAppDescription] = useState('');
    const [appSummary, setAppSummary] = useState('');
    const [releaseDate, setReleaseDate] = useState('');
    const [appVersion, setAppVersion] = useState('');
    const [isAppNameValid, setIsAppNameValid] = useState(false);
    const [appDataList, setAppDataList] = useState<AppDataDTO[]>([]); // State to store AppDataList
    const fileUploaderRef = useRef<any>(null);

    const openCreateAppModal = () => {
        setIsCreateAppModalOpen(true);
    };

    const closeModals = () => {
        setIsCreateAppModalOpen(false);
    };

    const createApp = async () => {
        if (!appName) {
            return false;
        }

        const appData = {
            app_name: appName,
            description: appDescription,
            summary: appSummary,
            release_date: releaseDate,
            version: appVersion
        };
        const appService = new AppService();
        try {
            await appService.createApp([appData]);
            toast.success('App created successfully!');
            return true; // Indicate success
        } catch (error) {
            console.error("Error creating app:", error);
            return false; // Indicate failure
        }
    };

    useEffect(() => {
        console.log("appDataList updated:", appDataList);
    }, [appDataList]);


    const handleCreateButtonClick = async () => {
        if (!appName) {
            setIsAppNameValid(false);
            alert("Please enter the App Name.");
            return;
        }

        setIsAppNameValid(true);
        const created = await createApp();
        if (created) {
            closeModals();
        }
    };

    const handleAppNameChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setAppName(e.target.value);
        setIsAppNameValid(!!e.target.value);
    };

    const handleFileUpload = (files: File[], appDataList: AppDataDTO[]) => {
        setAppDataList(appDataList);
    };

    const handleUploadButtonClick = async () => {
        if (appDataList.length === 0) {
            console.log('No files uploaded.');
            return;
        }

        try {
            const appService = new AppService();
            await appService.createApp(appDataList);
            toast.success('Apps uploaded successfully!');
            setAppDataList([]);
            handleFileUpload([], [])
            fileUploaderRef?.current?.clearSelectedFiles();
        } catch (error) {
            console.error('Error uploading apps:', error);
            toast.error('Failed to upload apps. Please try again later.');
        }
    };

    return (
        <Container className="mt-2">
            <div>
                <h1 className="text-secondary">Upload Applications</h1>
                <div className="mt-5">
                    <FileUploader onFileUpload={handleFileUpload} ref={fileUploaderRef} />
                </div>
            </div>
            <Row className="justify-content-end mt-3">
                <div className="col-auto">
                    <Button className="btn-secondary" onClick={openCreateAppModal}>Upload App Manually</Button>
                </div>
                <div className="col-auto">
                    <Button className="button-primary" onClick={handleUploadButtonClick}>Upload</Button>
                </div>
            </Row>

            <Modal show={isCreateAppModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Create New App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Row>
                        <Col className="col-md-12">
                            <label htmlFor="appName" className="form-label"><b className="text-danger">*</b>App Name</label>
                            <input type="text" id="appName" value={appName} onChange={handleAppNameChange} className={`form-control ${!isAppNameValid && 'is-invalid'}`} placeholder="App Name" />
                            {!isAppNameValid && <div className="invalid-feedback">App Name is required.</div>}
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
                    <Button variant="primary" onClick={handleCreateButtonClick}>Create</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UploadApps;
