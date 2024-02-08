import React from "react";
import {Button, Col, Form, Modal, ModalBody, ModalHeader, OverlayTrigger, Row, Table, Tooltip} from "react-bootstrap";
import { ReviewDataDTO } from "../../DTOs/ReviewDataDTO";
import FormWizard from "react-form-wizard-component";
import "react-form-wizard-component/dist/style.css";
import ReviewService from "../../services/ReviewService";

interface ReviewProcessingWizardProps {
    reviewsData: ReviewDataDTO[];
    selectedReviews: string[];
    onHide: () => void;
    onDiscardReview: (reviewId: string) => void;
    onUpdateDirectory: () => void;
}

interface SelectedTasks {
    [key: string]: boolean;
    sentimentAnalysis: boolean;
    featureExtraction: boolean;
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

    const [selectedSentimentModel, setSelectedSentimentModel] = React.useState<string>("");
    const [selectedFeatureModel, setSelectedFeatureModel] = React.useState<string>("");
    const [loading, setLoading] = React.useState<boolean>(false);

    const handleComplete = async () => {
        try {
            setLoading(true);
            const reviewService = new ReviewService();
            for (const reviewId of selectedReviews) {
                const review = reviewsData.find((review) => review.id === reviewId);
                if (review) {
                    await reviewService.analyzeReviews(
                        [review],
                        selectedTasks.featureExtraction,
                        selectedTasks.sentimentAnalysis,
                        selectedFeatureModel,
                        selectedSentimentModel
                    );
                }
            }
        } catch (error) {
            console.error("Error processing reviews:", error);
        } finally {
            setLoading(false);
            onHide();
        }
    };

    const tabChanged = ({ prevIndex, nextIndex }: { prevIndex: number; nextIndex: number }) => {
        // console.log("prevIndex", prevIndex);
        // console.log("nextIndex", nextIndex);
    };

    const goBackToReviews = () => {
        onHide();
    };

    const discardReview = (reviewId: string) => {
        onDiscardReview(reviewId);
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

    return (
        <>
            <Modal size="xl" show onHide={onHide}>
                <ModalHeader>
                    <h2 className="text-secondary">Process Reviews Wizard</h2>
                    <Button className="btn-secondary" onClick={goBackToReviews}>
                        <i className="mdi mdi-close" />
                    </Button>
                </ModalHeader>
                <ModalBody>


                    <FormWizard onComplete={handleComplete} onTabChange={tabChanged}>
                        <FormWizard.TabContent title="Check Reviews" icon="ti-ruler-pencil">
                            <h3 className="text-secondary">Selected reviews</h3>
                            <Table className="table table-bordered table-centered table-striped table-hover mt-4">
                                <thead>
                                <tr>
                                    <th className="text-center">App Name</th>
                                    <th className="text-center">Review ID</th>
                                    <th className="text-center">Review</th>
                                    <th className="text-center">Score</th>
                                    <th className="text-center">Date</th>
                                    <th className="text-center">Actions</th>
                                </tr>
                                </thead>
                                <tbody>
                                {reviewsData
                                    .filter((review) => selectedReviews.includes(review.id))
                                    .map((review: ReviewDataDTO) => (
                                        <tr key={review.id}>
                                            <td className="text-center">{review.app_name || "N/A"}</td>
                                            <td className="text-center">{review.id || "N/A"}</td>
                                            <td className="text-center">{review.review || "N/A"}</td>
                                            <td className="text-center">{review.score || "N/A"}</td>
                                            <td className="text-center">{review.date || "N/A"}</td>
                                            <td className="text-end" style={{ width: "150px" }}>
                                                <OverlayTrigger overlay={<Tooltip>Discard</Tooltip>}>
                                                    <a
                                                        href="#"
                                                        className="action-icon"
                                                        onClick={() => discardReview(review.id)}
                                                    >
                                                        <i className="mdi mdi-close-thick"></i>
                                                    </a>
                                                </OverlayTrigger>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
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
