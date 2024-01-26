import React, { ReactElement, useImperativeHandle, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Row, Col, Card } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import { ToastContainer, toast } from 'react-toastify';
import { AppDataDTO } from "../../DTOs/AppDataDTO";
import { ReviewDataDTO } from "../../DTOs/ReviewDataDTO";

export interface File {
    name: string;
    type: string;
    size: number;
    preview?: string | null;
    formattedSize?: string | null;
}

export interface FileUploaderProps {
    onFileUpload?: (files: File[], appDataList: AppDataDTO[]) => void;
    showPreview?: boolean;
}

const FileUploader = React.forwardRef((props: FileUploaderProps, ref: React.Ref<any>): ReactElement<any> => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [appDataList, setAppDataList] = useState<AppDataDTO[]>([]);
    const [appNamesCount, setAppNamesCount] = useState<number>(0);
    const [reviewsCount, setReviewsCount] = useState<number>(0);
    const dropzoneRef = useRef(null);

    const handleAcceptedFiles = (files: File[]): void => {
        const invalidFiles = files.filter(file => file.type !== 'application/json');

        if (invalidFiles.length > 0) {
            toast.error("Invalid format file! Only .json");
            return;
        }

        if (files.length > 1) {
            toast.error("Only one file is allowed at a time");
            return;
        }

        const file = files[0];

        if (props.showPreview) {
            if (file.type.split('/')[0] === 'image') {
                file.preview = URL.createObjectURL(file as unknown as Blob);
            }
            file.formattedSize = formatBytes(file.size);
            setSelectedFiles([file]); // Replace existing files with the new one
        }

        if (props.onFileUpload) {
            setAppDataList([]);
            setAppNamesCount(0);
            setReviewsCount(0);
            processJsonFile(file);
        }
    };

    const clearSelectedFiles = (): void => {
        setSelectedFiles([]);
    };

    useImperativeHandle(ref, () => ({
        clearSelectedFiles: clearSelectedFiles
    }));

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

    const processJsonFile = (file: File): void => {
        const reader = new FileReader();
        let appCount = 0;
        let reviewCount = 0;
        reader.onload = (event) => {
            if (event.target && event.target.result) {
                const jsonContent = event.target.result as string;
                const jsonData = JSON.parse(jsonContent);
                let appList: AppDataDTO[] = []; // Initialize appList as an empty array
                if (Array.isArray(jsonData)) {
                    jsonData.forEach((item: any) => {
                        appCount++;
                        reviewCount += item.reviews.length;
                        const appData: AppDataDTO = {
                            app_name: item.app_name,
                            description: item.description,
                            summary: item.summary,
                            release_date: item.release_date,
                            version: parseFloat(item.version),
                            reviews: item.reviews.map((review: any) => ({
                                reviewId: review.reviewId,
                                review: review.review,
                                userName: review.userName,
                                score: review.score,
                                at: review.at
                            })) as ReviewDataDTO[]
                        };
                        appList.push(appData); // Push appData to appList
                    });
                }
                setAppDataList(appList); // Set appDataList state with appList
                setAppNamesCount(prevCount => prevCount + appCount);
                setReviewsCount(prevCount => prevCount + reviewCount);

                // Call the parent component's callback function with the files and app data list
                if (props.onFileUpload) {
                    props.onFileUpload([file], appList);
                }
            }
        };
        reader.readAsText(file as unknown as Blob);
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
                                            {appNamesCount} <b>Apps</b>
                                        </p>
                                    </Col>
                                    <Col className="mb-2 col">
                                        <p className="mb-0">
                                            {reviewsCount} <b>Reviews</b>
                                        </p>
                                    </Col>
                                    <Col className="mb-2 col d-flex justify-content-end">
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
});

FileUploader.defaultProps = {
    showPreview: true,
};

export default FileUploader;
