import React, { ReactElement, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import {Simulate} from "react-dom/test-utils";
import invalid = Simulate.invalid;

type File = {
    name: string;
    type: string;
    size: number;
    preview?: string | null;
    formattedSize?: string | null;
};

type FileUploaderProps = {
    onFileUpload?: (files: File[]) => void;
    showPreview?: boolean;
};

const FileUploader = (props: FileUploaderProps): ReactElement<any> => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [toastVisible, setToastVisible] = useState<boolean>(false);

    const handleAcceptedFiles = (files: File[]): void => {
        let allFiles: File[] = files;
        const invalidFiles = files.filter(file => file.type !== 'application/json');
        console.log(invalidFiles)
        if (invalidFiles.length > 0) {
            toast.error("Invalid format file! Only .json");
            return;
        }

        if (props.showPreview) {
            files.forEach((file: File) => {
                if (file.type.split('/')[0] === 'image') {
                    file.preview = URL.createObjectURL(file as unknown as Blob);
                }
                file.formattedSize = formatBytes(file.size);
            });

            allFiles = [...selectedFiles, ...files];
            setSelectedFiles(allFiles);
        }

        if (props.onFileUpload) {
            props.onFileUpload(allFiles);
        }
    };

    const formatBytes = (bytes: number, decimals = 2): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    const removeFile = (index: number): void => {
        const newFiles = [...selectedFiles];
        newFiles.splice(index, 1);
        setSelectedFiles(newFiles);
    };

    return (
        <>
            <ToastContainer
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="colored"
            />
            <Dropzone {...props} onDrop={(acceptedFiles) => handleAcceptedFiles(acceptedFiles)}>
                {({ getRootProps, getInputProps }) => (
                    <div className="dropzone" {...getRootProps()}>
                        <input {...getInputProps()} />
                        <div className="dropzone-content align-items-center">
                            <i className="mdi mdi-cloud-upload-outline"></i>
                        </div>
                        <div className="dropzone-content align-items-center">
                            <h5>Drop files here or click to upload.</h5>
                        </div>
                    </div>
                )}
            </Dropzone>

            {props.showPreview && selectedFiles.length > 0 && (
                <div className="dropzone-previews mt-3" id="uploadPreviewTemplate">
                    {selectedFiles.map((file, index) => (
                        <Card className="mt-1 mb-0 shadow-none border" key={index + '-file'}>
                            <div className="p-2">
                                <Row className="align-items-center">
                                    {file.preview && (
                                        <Col className="d-flex justify-content-center mb-2 col">
                                            <img
                                                data-dz-thumbnail=""
                                                className="avatar-md rounded bg-light"
                                                alt={file.name}
                                                src={file.preview}
                                            />
                                        </Col>
                                    )}
                                    {!file.preview && (
                                        <Col className="d-flex justify-content-center mb-2 col">
                                            <div className="avatar-md">
                                                <span className="badge bg-primary">
                                                    {file.type.split('/')[1]}
                                                </span>
                                            </div>
                                        </Col>
                                    )}
                                    <Col className="mb-2 col">
                                        <Link to="#" className="text-muted fw-bold">
                                            {file.name}
                                        </Link>
                                    </Col>
                                    <Col className="mb-2 col">
                                        <p className="mb-0">
                                            Size: <strong>{file.formattedSize}</strong>
                                        </p>
                                    </Col>
                                    <Col className="mb-2 col">
                                        <p className="mb-0">
                                             0 <b>Apps</b>
                                        </p>
                                    </Col>
                                    <Col className="mb-2 col">
                                        <p className="mb-0">
                                            0 <b>Reviews</b>
                                        </p>
                                    </Col>
                                    <Col className="mb-2 col d-flex justify-content-end"> {/* Adjusted column */}
                                        <Link to="#" className="btn btn-link btn-lg text-muted shadow-none">
                                            <i className="mdi mdi-delete" onClick={() => removeFile(index)}></i>
                                        </Link>
                                    </Col>
                                </Row>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </>
    );
};

FileUploader.defaultProps = {
    showPreview: true,
};

export default FileUploader;
