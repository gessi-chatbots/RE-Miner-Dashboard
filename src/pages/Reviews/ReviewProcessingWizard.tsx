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
import { ReviewManagerDTO } from "../../DTOs/ReviewManagerDTO";

interface ReviewProcessingWizardProps {
    reviewsData: ReviewManagerDTO[];
    selectedReviews: string[];
    onHide: () => void;
    onDiscardReview: (review: ReviewManagerDTO) => void;
    onUpdateDirectory: () => void;
}

interface SelectedTasks {
    [key: string]: boolean | number;
    sentimentAnalysis: boolean;
    featureExtraction: boolean;
    featureSelection: boolean;
    hierarchicalClustering: boolean;
    distanceThreshold: number;
    polarityAnalysis: boolean;
    typeAnalysis: boolean;
    topicAnalysis: boolean;
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
        featureSelection: false,
        hierarchicalClustering: false,
        distanceThreshold: 0.5,
        polarityAnalysis: false,
        typeAnalysis: false,
        topicAnalysis: false,
    });

    const [wizardData, setWizardData] = React.useState<ReviewManagerDTO[]>(reviewsData);

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

            await reviewService.analyzeReviews(
                reviewsData,
                selectedTasks.featureExtraction,
                selectedTasks.sentimentAnalysis,
                selectedTasks.polarityAnalysis,
                selectedTasks.typeAnalysis,
                selectedTasks.topicAnalysis,
                selectedFeatureModel,
                selectedSentimentModel,
                selectedPolarityModel,
                selectedTypeModel,
                selectedTopicModel
            );

            toast.dismiss(infoToast);
            toast.success('Reviews analyzed!');
            onHide();
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

    const discardReview = (review: ReviewManagerDTO) => {
        onDiscardReview(review);
        const updatedWizardData = wizardData.filter((r) => r.review_id !== review.review_id);
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

    const [selectedPolarityModel, setSelectedPolarityModel] = React.useState<string>("");
    const [selectedTypeModel, setSelectedTypeModel] = React.useState<string>("");
    const [selectedTopicModel, setSelectedTopicModel] = React.useState<string>("");

    const handlePolarityModelChange = (model: string) => {
        setSelectedPolarityModel(model);
    };

    const handleTypeModelChange = (model: string) => {
        setSelectedTypeModel(model);
    };

    const handleTopicModelChange = (model: string) => {
        setSelectedTopicModel(model);
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
                                            .map((review: ReviewManagerDTO) => (
                                                <tr key={review.review_id}>
                                                    <td className="text-center">{review.app_name || "N/A"}</td>
                                                    <td className="text-center">{review.review_id || "N/A"}</td>
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
                            <div>
                                <Row className="task-selection-container mb-4">
                                    <Col xs={12} sm={6}>
                                        <Form.Check
                                            type="checkbox"
                                            id="sentimentAnalysisCheckbox"
                                            label="Sentiment Analysis"
                                            checked={selectedTasks.sentimentAnalysis}
                                            onChange={() => handleTaskSelectionChange("sentimentAnalysis")}
                                            className="mb-3"
                                        />
                                        {selectedTasks.sentimentAnalysis && (
                                            <Form.Group>
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

                                        <Form.Check
                                            type="checkbox"
                                            id="polarityAnalysisCheckbox"
                                            label="Polarity Analysis"
                                            checked={selectedTasks.polarityAnalysis}
                                            onChange={() => handleTaskSelectionChange("polarityAnalysis")}
                                            className="mb-3"
                                        />
                                        {selectedTasks.polarityAnalysis && (
                                            <Form.Group className="mb-4">
                                                <Form.Label htmlFor="polarityModelSelect">Select Polarity Model:</Form.Label>
                                                <Form.Select
                                                    id="polarityModelSelect"
                                                    value={selectedPolarityModel}
                                                    onChange={(e) => handlePolarityModelChange(e.target.value)}
                                                >
                                                    <option value="">Choose a Polarity Analysis Model</option>
                                                    <option value="SVM">SVM</option>
                                                    <option value="MLP">MLP</option>
                                                </Form.Select>
                                            </Form.Group>
                                        )}

                                        <Form.Check
                                            type="checkbox"
                                            id="typeAnalysisCheckbox"
                                            label="Type Analysis"
                                            checked={selectedTasks.typeAnalysis}
                                            onChange={() => handleTaskSelectionChange("typeAnalysis")}
                                            className="mb-3"
                                        />
                                        {selectedTasks.typeAnalysis && (
                                            <Form.Group className="mb-4">
                                                <Form.Label htmlFor="typeModelSelect">Select Type Model:</Form.Label>
                                                <Form.Select
                                                    id="typeModelSelect"
                                                    value={selectedTypeModel}
                                                    onChange={(e) => handleTypeModelChange(e.target.value)}
                                                >
                                                    <option value="">Choose a Type Analysis Model</option>
                                                    <option value="BERT">BERT</option>
                                                    <option value="ROBERTA">ROBERTA</option>
                                                    <option value="DISTILBERT">DISTILBERT</option>
                                                </Form.Select>
                                            </Form.Group>
                                        )}
                                    </Col>

                                    <Col xs={12} sm={6}>
                                        <Form.Check
                                            type="checkbox"
                                            id="featureExtractionCheckbox"
                                            label="Feature Extraction"
                                            checked={selectedTasks.featureExtraction}
                                            onChange={() => handleTaskSelectionChange("featureExtraction")}
                                            className="mb-3"
                                        />
                                        {selectedTasks.featureExtraction && (
                                            <>
                                                <Form.Group>
                                                    <Form.Label htmlFor="featureModelSelect">Select Feature Model:</Form.Label>
                                                    <Form.Select
                                                        id="featureModelSelect"
                                                        value={selectedFeatureModel}
                                                        onChange={(e) => handleFeatureModelChange(e.target.value)}
                                                    >
                                                        <option value="">Choose a Feature Extraction Model</option>
                                                        <option value="transfeatex">TransFeatEx</option>
                                                        <option value="t-frex-bert-base-uncased">T-Frex BERT Base Uncased</option>
                                                        <option value="t-frex-bert-large-uncased">T-Frex BERT Large Uncased</option>
                                                        <option value="t-frex-roberta-base">T-Frex Roberta Base</option>
                                                        <option value="t-frex-roberta-large">T-Frex Roberta Large</option>
                                                        <option value="t-frex-xlnet-base-cased">T-Frex XLNet Base Cased</option>
                                                        <option value="t-frex-xlnet-large-cased">T-Frex XLNet Large Cased</option>
                                                    </Form.Select>
                                                </Form.Group>

                                                <Form.Check
                                                    type="checkbox"
                                                    id="hierarchicalClusteringCheckbox"
                                                    label="Hierarchical Clustering"
                                                    checked={selectedTasks.hierarchicalClustering}
                                                    onChange={() => handleTaskSelectionChange("hierarchicalClustering")}
                                                    className="mt-3"
                                                />
                                            </>
                                        )}

                                        <Form.Check
                                            type="checkbox"
                                            id="topicAnalysisCheckbox"
                                            label="Topic Analysis"
                                            checked={selectedTasks.topicAnalysis}
                                            onChange={() => handleTaskSelectionChange("topicAnalysis")}
                                            className="mb-3"
                                        />
                                        {selectedTasks.topicAnalysis && (
                                            <Form.Group className="mb-4">
                                                <Form.Label htmlFor="topicModelSelect">Select Topic Model:</Form.Label>
                                                <Form.Select
                                                    id="topicModelSelect"
                                                    value={selectedTopicModel}
                                                    onChange={(e) => handleTopicModelChange(e.target.value)}
                                                >
                                                    <option value="">Choose a Topic Analysis Model</option>
                                                    <option value="SVM">SVM</option>
                                                    <option value="MLP">MLP</option>
                                                </Form.Select>
                                            </Form.Group>
                                        )}
                                    </Col>
                                </Row>

                                {selectedTasks.featureExtraction && selectedTasks.hierarchicalClustering && (
                                    <Row className="mt-3">
                                        <Col xs={12} sm={6} className="offset-sm-6">
                                            <Form.Group>
                                                <Form.Label htmlFor="distanceThresholdSlider">
                                                    Distance Threshold: {selectedTasks.distanceThreshold.toFixed(1)}
                                                </Form.Label>
                                                <Form.Range
                                                    id="distanceThresholdSlider"
                                                    min={0}
                                                    max={1}
                                                    step={0.1}
                                                    value={selectedTasks.distanceThreshold}
                                                    onChange={(e) =>
                                                        setSelectedTasks((prev) => ({
                                                            ...prev,
                                                            distanceThreshold: parseFloat(e.target.value),
                                                        }))
                                                    }
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                )}
                            </div>
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
