import React, {useEffect, useRef, useState} from "react";
import { Button, Col, Container, Modal, Row } from "react-bootstrap";
import FileUploader from "../../components/files/FileUploader";
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
    const [appDataList, setAppDataList] = useState<AppDataDTO[]>([]);
    const fileUploaderRef = useRef<any>(null);
    const [isCreateButtonClicked, setIsCreateButtonClicked] = useState(false);
    const [isCreatingApp, setIsCreatingApp] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

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
        setIsCreatingApp(true);
        setIsUploading(true);
        const appService = new AppService();
        try {
            await appService.createApp([appData]);
            toast.success('App created successfully!');
            return true;
        } catch (error) {
            console.error("Error creating app:", error);
            return false;
        } finally {
            setIsCreatingApp(false);
        }
    };

    useEffect(() => {
    }, [appDataList]);


    const handleAppNameChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
        setAppName(e.target.value);
    };
    const handleCreateButtonClick = async () => {
        setIsCreateButtonClicked(true);
        if (!appName.trim()) {
            setIsAppNameValid(false);
            return;
        }

        setIsAppNameValid(true);
        const created = await createApp();
        if (created) {
            closeModals();
        }
    };

    const handleFileUpload = (files: File[], appDataList: AppDataDTO[]) => {
        setAppDataList(appDataList);
    };

    const handleDownload = () => {
        const templateData = [
            {
                "app_name": "app name",
                "description": "description",
                "summary": "summary",
                "developer": "developer",
                "release_date": "Jun 20, 2016",
                "version": "3.715",
                "reviews": [
                    {
                        "reviewId": "reviewID",
                        "review": "review",
                        "userName": "userName",
                        "score": 4,
                        "at": "Sep 15, 2022"
                    }
                ]
            }
        ];

        const data = JSON.stringify(templateData);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    const handleUploadButtonClick = async () => {
        if (appDataList.length === 0) {
            console.log('No files uploaded.');
            return;
        }

        try {
            setIsUploading(true);
            const appService = new AppService();
            await appService.createApp(appDataList);
            toast.success('Apps uploaded successfully!');
            setAppDataList([]);
            handleFileUpload([], [])
            fileUploaderRef?.current?.clearSelectedFiles();
        } catch (error) {
            console.error('Error uploading apps:', error);
            toast.error('Failed to upload apps. Please try again later.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Container className="mt-2">
            <div>
                <Row className="align-content-center">
                    <Col className="col-md-8">
                        <h1 className="text-secondary">Upload Applications</h1>
                    </Col>
                    <Col className="col-md-4 d-flex justify-content-end align-items-center">
                        <Button className="btn-secondary" onClick={handleDownload}><i className="mdi mdi-download"/> Template File</Button>
                    </Col>
                </Row>

                <div className="mt-5">
                    <FileUploader onFileUpload={handleFileUpload} ref={fileUploaderRef} />
                </div>
            </div>
            <Row className="justify-content-end mt-3">
                <div className="col-auto">
                    <Button className="btn-secondary" onClick={openCreateAppModal}><i className="mdi mdi-hand-back-right"/> Upload App Manually</Button>
                </div>
                <div className="col-auto">
                    <Button
                        className="button-primary"
                        onClick={handleUploadButtonClick}
                        disabled={isCreatingApp || isUploading}
                    >
                        <i className="mdi mdi-upload"/> Upload
                    </Button>
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
                            <input
                                type="text"
                                id="appName"
                                value={appName}
                                onChange={handleAppNameChange}
                                className={`form-control ${(!isAppNameValid && isCreateButtonClicked && !appName.trim()) && 'is-invalid'}`}
                                placeholder="App Name"
                            />
                            {!isAppNameValid && isCreateButtonClicked && !appName.trim() && <div className="invalid-feedback">App Name is required.</div>}
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
                    <Button
                        variant="primary"
                        onClick={handleCreateButtonClick}
                        disabled={isCreatingApp}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default UploadApps;
