import React from "react";
import {
    Button,
    Col,
    Form,
    Modal,
    ModalBody,
    ModalHeader,
    OverlayTrigger,
    Pagination,
    Row,
    Table,
    Tooltip
} from "react-bootstrap";
import { ReviewDataDTO } from "../../DTOs/ReviewDataDTO";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import ReviewService from "../../services/ReviewService";
import { toast } from "react-toastify";
import { ReviewDataSimpleDTO } from "../../DTOs/ReviewDataSimpleDTO";

interface ReviewProcessingWizardProps {
    reviewsData: ReviewDataSimpleDTO[];
    selectedReviews: string[];
    onHide: () => void;
    onDiscardReview: (review: ReviewDataSimpleDTO) => void;
    onUpdateDirectory: () => void;
}

interface SelectedTasks {
    [key: string]: boolean;
    sentimentAnalysis: boolean;
    featureExtraction: boolean;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}


const ReviewProcessingWizard: React.FC<ReviewProcessingWizardProps> = ({
                                                                           reviewsData,
                                                                           selectedReviews,
                                                                           onHide,
                                                                           onDiscardReview,
                                                                       }) => {
    const [selectedTasks, setSelectedTasks] = React.useState<SelectedTasks>({
        sentimentAnalysis: false,
        featureExtraction: false,
    });
    const [wizardData, setWizardData] = React.useState<ReviewDataSimpleDTO[]>(reviewsData);

    const [selectedSentimentModel, setSelectedSentimentModel] = React.useState<string>("");
    const [selectedFeatureModel, setSelectedFeatureModel] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);
    const itemsPerPage = 8;
    const totalPages = Math.ceil(wizardData.length / itemsPerPage);

    const [currentPage, setCurrentPage] = React.useState<number>(1);

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, wizardData.length);
    const handleComplete = async () => {
        try {
            setLoading(true);
            const reviewService = new ReviewService();

            const infoToast = toast.info('Analyzing reviews', {
                autoClose: false,
                closeOnClick: false,
                closeButton: false,
            });

            for (const review of reviewsData) {
                await reviewService.analyzeReviews(
                    [review],
                    selectedTasks.featureExtraction,
                    selectedTasks.sentimentAnalysis,
                    selectedFeatureModel,
                    selectedSentimentModel
                );
            }
            toast.dismiss(infoToast);
            toast.success('Reviews analyzed!');
        } catch (error) {
            console.error('Error analyzing reviews:', error);
            toast.error('Error analyzing reviews');
        } finally {
            setLoading(false);
        }
    };


    const goBackToReviews = () => {
        onHide();
    };

    const discardReview = (review: ReviewDataSimpleDTO) => {
        onDiscardReview(review);
        const updatedWizardData = wizardData.filter((r) => r.reviewId !== review.reviewId);
        setWizardData(updatedWizardData);
    };
    const handleTaskSelectionChange = (task: string) => {
        setSelectedTasks((prevSelectedTasks) => ({
            ...prevSelectedTasks,
            [task]: !prevSelectedTasks[task],
        }));
    };

    const handleSentimentModelChange = (model: string) => {
        setSelectedSentimentModel(model);
    };

    const handleFeatureModelChange = (model: string) => {
        setSelectedFeatureModel(model);
    };


    const nextPage = async () => {
        if (currentPage < totalPages) {
            const nextPageNumber = currentPage + 1;
            setCurrentPage(nextPageNumber);
        }
    };

    const prevPage = async () => {
        if (currentPage > 1) {
            const prevPageNumber = currentPage - 1;
            setCurrentPage(prevPageNumber);
        }
    };

    return (
        <>
            <Modal size="xl" show onHide={onHide}>
                <ModalHeader>
                <Col className="md-10">
                    <h2 className="text-secondary">Process Reviews Wizard</h2>
                </Col>

                <Col className="md-1 d-flex justify-content-end">
                    <i className="px-4 mdi mdi-close" style={{ cursor: 'pointer' }} onClick={goBackToReviews} />
                </Col>
                </ModalHeader>
                <ModalBody>
                    <FormWizard onComplete={handleComplete}>

                            <FormWizard.TabContent title="Check Reviews" icon="ti-ruler-pencil">
                                <h3 className="text-secondary">Selected reviews</h3>
                                <Table className="table table-bordered table-centered table-striped table-hover mt-4">
                                    <thead>
                                    <tr>
                                        <th className="text-center">App Name</th>
                                        <th className="text-center">Review ID</th>
                                        <th className="text-center">Review</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                    </thead>

                                        <tbody>
                                        {wizardData
                                            .slice(startIndex, endIndex)
                                            .map((review: ReviewDataSimpleDTO) => (
                                                <tr key={review.reviewId}>
                                                    <td className="text-center">{review.app_name || "N/A"}</td>
                                                    <td className="text-center">{review.reviewId || "N/A"}</td>
                                                    <td className="text-center">{review.review || "N/A"}</td>

                                                    <td className="text-end" style={{ width: "150px" }}>
                                                        <OverlayTrigger overlay={<Tooltip>Discard</Tooltip>}>
                                                            <a
                                                                href="#"
                                                                className="action-icon"
                                                                onClick={() => discardReview(review)}
                                                            >
                                                                <i className="mdi mdi-close-thick"></i>
                                                            </a>
                                                        </OverlayTrigger>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                </Table>
                                {totalPages > 1 ? (
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

                                                {Array.from({ length: Math.min(10, totalPages - Math.max(1, currentPage - 5)) }, (_, index) => (
                                                    <li key={index} className={`page-item ${currentPage === index + Math.max(1, currentPage - 5) ? 'active' : ''}`}>
                                                        <Button className="btn-primary page-link" onClick={() => setCurrentPage(index + Math.max(1, currentPage - 5))}>
                                                            {index + Math.max(1, currentPage - 5)}
                                                        </Button>
                                                    </li>
                                                ))}

                                                {totalPages - currentPage > 5 && (
                                                    <li className="page-item disabled">
                                                        <Button className="btn-primary page-link" disabled>
                                                            ...
                                                        </Button>
                                                    </li>
                                                )}

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
                                ) : null}
                            </FormWizard.TabContent>

                        <FormWizard.TabContent title="Task selection" icon="ti-panel">
                            <Row className="task-selection-container">
                                <Col xs={12} sm={6} md={6}>
                                    <Form.Check
                                        type="checkbox"
                                        id="sentimentAnalysisCheckbox"
                                        label="Sentiment Analysis"
                                        checked={selectedTasks.sentimentAnalysis}
                                        onChange={() => handleTaskSelectionChange("sentimentAnalysis")}
                                        className="mb-3"
                                    />
                                    {selectedTasks.sentimentAnalysis && (
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="sentimentModelSelect">Select Sentiment Model:</Form.Label>
                                            <Form.Select
                                                id="sentimentModelSelect"
                                                value={selectedSentimentModel}
                                                onChange={(e) => handleSentimentModelChange(e.target.value)}
                                            >
                                                <option value="">Choose a Sentiment Analysis Model</option>
                                                <option value="BERT">BERT</option>
                                                <option value="BETO">BETO</option>
                                                <option value="GPT-3.5">GPT 3.5</option>
                                            </Form.Select>
                                        </Form.Group>
                                    )}
                                </Col>
                                <Col xs={12} sm={6} md={6}>
                                    <Form.Check
                                        type="checkbox"
                                        id="featureExtractionCheckbox"
                                        label="Feature Extraction"
                                        checked={selectedTasks.featureExtraction}
                                        onChange={() => handleTaskSelectionChange("featureExtraction")}
                                        className="mb-3"
                                    />
                                    {selectedTasks.featureExtraction && (
                                        <Form.Group className="mb-3">
                                            <Form.Label htmlFor="featureModelSelect">Select Feature Model:</Form.Label>
                                            <Form.Select
                                                id="featureModelSelect"
                                                value={selectedFeatureModel}
                                                onChange={(e) => handleFeatureModelChange(e.target.value)}
                                            >
                                                <option value="">Choose a Feature extraction Model</option>
                                                <option value="transfeatex">TransFeatEx</option>
                                                <option value="t-frex-bert-base-uncased">T-Frex BERT Base Uncased</option>
                                                <option value="t-frex-bert-large-uncased">T-Frex BERT Large Uncased</option>
                                                <option value="t-frex-roberta-base">T-Frex Roberta Base</option>
                                                <option value="t-frex-roberta-large">T-Frex Roberta Large</option>
                                                <option value="t-frex-xlnet-base-cased">T-Frex XLNet Base Cased</option>
                                                <option value="t-frex-xlnet-large-cased">T-Frex XLNet Large Cased</option>
                                            </Form.Select>
                                        </Form.Group>
                                    )}
                                </Col>
                            </Row>
                        </FormWizard.TabContent>
                        <FormWizard.TabContent title="Send" icon="ti-stats-up">
                            <h2 className="text-secondary">Send</h2>
                            {loading ? (
                                <p>Analyzing. Please wait until this modal closes automatically.</p>
                            ) : (
                                <p>The reviews will be sent to the <b>RE-Miner Hub</b>, do you want to proceed?</p>
                            )}
                        </FormWizard.TabContent>
                    </FormWizard>
                    {/* add style */}
                    <style>{`
                        @import url("https://cdn.jsdelivr.net/gh/lykmapipo/themify-icons@0.1.2/css/themify-icons.css");
                        .task-selection-container {
                            margin-top: 20px;
                        }
                    
                        /* Style the checkboxes */
                        .checkbox-label {
                            display: flex;
                            align-items: center;
                            margin-bottom: 10px;
                        }
                    
                        /* Style the form labels */
                        .form-label {
                            margin-bottom: 8px;
                            font-weight: bold;
                        }
                    
                        /* Style the form selects */
                        .form-select {
                            width: 100%;
                            padding: 8px;
                            border: 1px solid #ced4da;
                            border-radius: 4px;
                            box-sizing: border-box;
                        }
                    `}</style>
                </ModalBody>
            </Modal>
        </>
    );
};

export default ReviewProcessingWizard;
