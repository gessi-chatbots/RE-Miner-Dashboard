import React, { useState, useEffect } from "react";
import { Table,Tooltip, Button, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import AppService from "../../services/AppService";

import ReviewService from "../../services/ReviewService";
import { toast } from "react-toastify";
import {useLocation, useNavigate} from 'react-router-dom';
import ReviewProcessingWizard from "./ReviewProcessingWizard";
import { ReviewManagerDTO } from "../../DTOs/ReviewManagerDTO";
import {
    TypeBadge,
    TopicBadge,
    EmotionBadge,
    FeatureBadge,
    ReviewIdBadge,
    PolarityIcon,
} from './ReviewBadges';

const defaultColumns = ["Package", "Review ID", "Review Text", "Features", "Polarity", "Emotions", "Type", "Topic", "Actions"];

const ReviewsDirectory: React.FC = () => {
    const [apps, setApps] = useState<string[]>([]);
    const [searchTriggered, setSearchTriggered] = useState(false);
    const [pageData, setPageData] = useState<ReviewManagerDTO[] | null>(null);
    const [wizardData, setWizardData] = useState<ReviewManagerDTO[] | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [appPackage, setAppPackage] = useState<string>("");
    const [pageSize, setPageSize] = useState(5);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [selectedPolarity, setSelectedPolarity] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const [selectedEmotion, setSelectedEmotion] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [newFeature, setNewFeature] = useState<string>("");
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [isWizardModalOpen, setWizardModalOpen] = useState<boolean>(false);
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { appPackage: stateAppPackage, selectedFeatures: stateSelectedFeatures } = location.state || {};

    const polarityOptions = ["Positive", "Negative"];
    const topicOptions = [
        "General",
        "Usability",
        "Effectiveness",
        "Efficiency",
        "Enjoyability",
        "Cost",
        "Reliability",
        "Security",
        "Compatibility",
        "Learnability",
        "Safety",
        "Aesthetics",
    ];
    const emotionOptions = ["Joy", "Anger", "Disgust", "Neutral"];
    const typeOptions = ["Bug", "Rating", "Feature", "UserExperience"];

    useEffect(() => {
        // Set initial state from location
        if (stateAppPackage) setAppPackage(stateAppPackage);
        if (stateSelectedFeatures && stateSelectedFeatures.length > 0) setSelectedFeatures(stateSelectedFeatures);
    }, [stateAppPackage, stateSelectedFeatures]);

    useEffect(() => {
        const fetchApps = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsPackages();
                if (response) {
                    setApps(response.apps.map((app) => app.app_package));
                } else {
                    console.warn("No apps found");
                    setApps([]);
                }
            } catch (error) {
                console.error("Error fetching apps:", error);
            }
        };
        fetchApps();
        if (searchTriggered) {
            fetchReviews(currentPage);
        }
    }, [currentPage, searchTriggered]);


    const handleSearch = () => {
        setCurrentPage(0);
        setSearchTriggered(true);
        fetchReviews(currentPage);
    };


    const handleCheckboxChange = async (review: ReviewManagerDTO) => {
        setSelectAll(false);

        setSelectedReviews((prevSelectedReviews) => {
            const updatedSelectedReviews = [...prevSelectedReviews];
            const index = updatedSelectedReviews.indexOf(review.review_id);

            if (index !== -1) {
                updatedSelectedReviews.splice(index, 1);
            } else {
                updatedSelectedReviews.push(review.review_id);
            }

            return updatedSelectedReviews;
        });

        setWizardData((prevWizardData) => {
            if (!prevWizardData || prevWizardData.length === 0) {
                return [review];
            } else if (!prevWizardData.some((r) => r.review_id === review.review_id)) {
                return [...prevWizardData, review];
            } else {
                return prevWizardData.filter((r) => r.review_id !== review.review_id);
            }
        });
    }

    const fetchReviews = async (page = currentPage) => {
        try {
            const reviewService = new ReviewService();
            const response = await reviewService.fetchFilteredReviews(
                appPackage,
                selectedFeatures,
                selectedTopic,
                selectedEmotion,
                selectedPolarity,
                selectedType,
                page, // Pass the specified page number
                pageSize
            );

            if (response) {
                const { reviews: mappedData, total_pages: pages } = response;
                setPageData(mappedData);
                setTotalPages(pages);
            } else {
                setPageData([]);
                toast.warn("No reviews found for the selected filters.");
            }
        } catch (error) {
            setPageData([]);
            toast.warn("No reviews found for the selected filters.");
        }
    };

    const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newSize = Number(event.target.value);
        setPageSize(newSize);
        setCurrentPage(1); // Reset to page 1 when changing page size
        fetchReviews(); // Re-fetch reviews with the new page size
    };
    const handlePolarityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPolarity(event.target.value);
    };

    const handleTopicChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedTopic(event.target.value);
    };

    const handleEmotionChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedEmotion(event.target.value);
    };

    const handleTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedType(event.target.value);
    };

    const handleFilterChange = () => {
        setCurrentPage(0);
        setTimeout(fetchReviews, 100);
    };

    const handleSelectAllChange = () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        if (newSelectAll && pageData) {
            setSelectedReviews(pageData.map((review) => review.review_id));
            setWizardData(pageData);
        } else {
            setSelectedReviews([]);
            setWizardData([]);
        }
    };

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;
        if (selectedFeatures.includes(newFeature.trim())) return;
        setSelectedFeatures((prev) => [...prev, newFeature.trim()]);
        setNewFeature("");
    };

    const handleDeleteFeature = (feature: string) => {
        setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
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

    const analyzeReviewAction = (review: ReviewManagerDTO) => {
        navigate(`/applications/${review.app_id}/reviews/${review.review_id}/analyze`);
    };

    const truncateReview = (review: string) => {
        return review.length > 100 ? `${review.substring(0, 100)}...` : review;
    };

    const handleWizardClose = () => {
        setWizardModalOpen(false);
        fetchReviews();
    };

    return (
        <div>
            <h1 className="text-secondary">Reviews Directory</h1>

            {/* Filters and Search */}
            <Row className="bg-white p-4 rounded shadow-sm mb-4">
                <Row>
                    <Col md={3}>
                        <h6 className="text-secondary mb-2">Select App</h6>
                        <Form.Select
                            value={appPackage}
                            onChange={(e) => setAppPackage(e.target.value)}
                            aria-label="Select App"
                            style={{
                                height: "40px",
                                fontSize: "14px",
                                padding: "5px 10px",
                            }}
                        >
                            <option value="">All Packages</option>
                            {apps.map((app) => (
                                <option key={app} value={app}>
                                    {app}
                                </option>
                            ))}
                        </Form.Select>
                    </Col>

                    <Col md={5}>
                        <h6 className="text-secondary mb-2">Features</h6>
                        <div
                            style={{
                                height: "70px",
                                overflowY: "auto",
                                background: "white",
                                borderRadius: "8px",
                                padding: "10px",
                                border: "1px solid #ccc",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                flexWrap: "wrap",
                            }}
                        >
                            {selectedFeatures.map((feature, index) => (
                                <div
                                    key={index}
                                    style={{
                                        display: "inline-flex",
                                        alignItems: "center",
                                        padding: "4px 10px",
                                        borderRadius: "12px",
                                        backgroundColor: "#F0F9FF",
                                        border: "1px solid #BAE6FD",
                                        color: "#0369A1",
                                        fontSize: "12px",
                                        fontWeight: 500,
                                        margin: "2px",
                                    }}
                                >
                                    {feature}
                                    <i
                                        className="mdi mdi-close-circle-outline ms-1"
                                        style={{ cursor: "pointer", fontSize: "14px" }}
                                        onClick={() => handleDeleteFeature(feature)}
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="d-flex mt-2">
                            <Form.Control
                                placeholder="Add feature"
                                value={newFeature}
                                onChange={(e) => setNewFeature(e.target.value)}
                                style={{
                                    fontSize: "14px",
                                    padding: "5px 10px",
                                    flex: "3",
                                }}
                            />
                            <div
                                style={{
                                    width: "1px",
                                    height: "30px",
                                    background: "#ccc",
                                    margin: "0 10px",
                                }}
                            ></div>
                            <Button
                                variant="secondary"
                                onClick={handleAddFeature}
                                style={{
                                    padding: "5px 15px",
                                    fontSize: "14px",
                                    flex: "1",
                                }}
                            >
                                <i className="mdi mdi-plus" /> Add
                            </Button>
                        </div>
                    </Col>

                    <Col md={4}>
                        <h6 className="text-secondary mb-2">Filters</h6>
                        <Row>
                            <Col md={6}>
                                <Form.Select
                                    value={selectedPolarity}
                                    onChange={(e) => setSelectedPolarity(e.target.value)}
                                    className="mb-2"
                                >
                                    <option value="">All Polarities</option>
                                    {polarityOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Select
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                    className="mb-2"
                                >
                                    <option value="">All Topics</option>
                                    {topicOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                            <Col md={6}>
                                <Form.Select
                                    value={selectedEmotion}
                                    onChange={(e) => setSelectedEmotion(e.target.value)}
                                    className="mb-2"
                                >
                                    <option value="">All Emotions</option>
                                    {emotionOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Form.Select>
                                <Form.Select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="mb-2"
                                >
                                    <option value="">All Types</option>
                                    {typeOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </Form.Select>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Row className="mt-3 mb-2">
                    <Col></Col>
                    <Col xs="auto" className="d-flex justify-content-end">
                        <Button variant="primary" onClick={handleSearch}>
                            <i className="mdi mdi-magnify" /> Search
                        </Button>
                    </Col>
                </Row>
            </Row>


            {/* Reviews Table */}
            {pageData && pageData.length > 0 ? (
                <div className="mb-4">
                    <Table className="table table-bordered table-hover table-striped align-middle mb-0">
                        <thead className="bg-light">
                        <tr>
                            <th className="text-center py-3">
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={() => handleSelectAllChange()}
                                    className="form-check-input"
                                />
                            </th>
                            {defaultColumns.map((column) => (
                                <th
                                    className="text-center py-3"
                                    key={column}
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        width:
                                            column === "Package" ? "15%" :
                                                column === "Review ID" ? "8%" :
                                                    column === "Review Text" ? "40%" :
                                                        column === "Features" ? "15%" :
                                                            column === "Polarity" ? "8%" :
                                                                column === "Emotions" ? "10%" :
                                                                    column === "Type" ? "12%" :
                                                                        column === "Topic" ? "12%" :
                                                                            column === "Actions" ? "10%" :
                                                                                "auto"
                                    }}
                                >
                                    {column}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {pageData.map((review) => (
                            <tr key={review.review_id} className="border-bottom">
                                <td className="text-center py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedReviews.includes(review.review_id)}
                                        onChange={() => handleCheckboxChange(review)}
                                        className="form-check-input"
                                    />
                                </td>
                                <td>{review.app_id}</td>
                                <td className="text-center">
                                    <ReviewIdBadge id={review.review_id || "N/A"}/>
                                </td>
                                <td style={{
                                    textAlign: 'justify',
                                    fontSize: '14px',
                                    padding: '12px 16px',
                                    lineHeight: '1.5'
                                }}>
                                    {truncateReview(review.review) || "N/A"}
                                </td>
                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {Array.isArray(review.features) && review.features.length > 0 ? (
                                            review.features
                                                .filter((feature) => feature && feature.trim().toLowerCase() !== 'n/a')
                                                .map((feature, idx) => (
                                                    <FeatureBadge key={idx} feature={feature.trim()}/>
                                                ))
                                                .concat(
                                                    // If all features are filtered out, display "N/A"
                                                    review.features.every((feature) => !feature || feature.trim().toLowerCase() === 'n/a')
                                                        ? [<FeatureBadge key="na" feature="N/A"/>]
                                                        : []
                                                )
                                        ) : (
                                            <FeatureBadge feature="N/A"/>
                                        )}
                                    </div>
                                </td>

                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {Array.isArray(review.polarities) ?
                                            Array.from(new Set(review.polarities)).map((polarity, idx) => (
                                                <PolarityIcon key={idx} polarity={polarity || 'N/A'}/>
                                            ))
                                            : <PolarityIcon polarity='N/A'/>
                                        }
                                    </div>
                                </td>
                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {Array.isArray(review.emotions) ?
                                            Array.from(new Set(review.emotions)).map((emotion, idx) => (
                                                <EmotionBadge key={idx} sentiment={emotion || 'N/A'}/>
                                            ))
                                            : <EmotionBadge sentiment='N/A'/>
                                        }
                                    </div>
                                </td>
                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {Array.isArray(review.types) ?
                                            Array.from(new Set(review.types)).map((type, idx) => (
                                                <TypeBadge key={idx} type={type || 'N/A'}/>
                                            ))
                                            : <TypeBadge type='N/A'/>
                                        }
                                    </div>
                                </td>
                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div className="d-flex flex-wrap gap-2 justify-content-center">
                                        {Array.isArray(review.topics) ?
                                            Array.from(new Set(review.topics)).map((topic, idx) => (
                                                <TopicBadge key={idx} topic={topic || ''}/>
                                            ))
                                            : <TopicBadge topic=''/>
                                        }
                                    </div>
                                </td>
                                <td className="text-end" style={{width: "150px"}}>
                                    <OverlayTrigger overlay={<Tooltip id="analyze-tooltip">View Review</Tooltip>}>
                                        <a href="#" className="action-icon me-2"
                                           onClick={() => analyzeReviewAction(review)}>
                                            <i className="mdi mdi-eye text-primary"></i>
                                        </a>
                                    </OverlayTrigger>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    {/* Pagination and Rows per page */}
                    <div className="d-flex align-items-center mt-3">
                        <label className="me-2 text-secondary">Rows per page:</label>
                        <Form.Select
                            value={pageSize}
                            onChange={handlePageSizeChange}
                            style={{width: "100px"}}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </Form.Select>
                    </div>
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center mt-3">
                            <nav>
                                <ul className="pagination pagination-rounded mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <Button className="btn-primary page-link" onClick={prevPage}
                                                aria-label="Previous">
                                            <span aria-hidden="true">&laquo;</span>
                                        </Button>
                                    </li>

                                    {currentPage > 6 && (
                                        <>
                                            <li className="page-item">
                                                <Button className="btn-primary page-link"
                                                        onClick={() => setCurrentPage(1)}>
                                                    1
                                                </Button>
                                            </li>
                                            <li className="page-item disabled">
                                                <Button className="btn-primary page-link" disabled>
                                                    ...
                                                </Button>
                                            </li>
                                        </>
                                    )}

                                    {Array.from({ length: Math.min(10, totalPages - Math.max(1, currentPage - 5)) }, (_, index) => {
                                        const pageNumber = index + Math.max(1, currentPage - 5);
                                        if (pageNumber > totalPages) return null;
                                        return (
                                            <li key={pageNumber}
                                                className={`page-item ${currentPage === pageNumber ? 'active' : ''}`}>
                                                <Button className="btn-primary page-link"
                                                        onClick={() => setCurrentPage(pageNumber)}>
                                                    {pageNumber}
                                                </Button>
                                            </li>
                                        );
                                    })}

                                    {totalPages - currentPage > 5 && (
                                        <>
                                            <li className="page-item disabled">
                                                <Button className="btn-primary page-link" disabled>
                                                    ...
                                                </Button>
                                            </li>
                                            <li className="page-item">
                                                <Button className="btn-primary page-link"
                                                        onClick={() => setCurrentPage(totalPages)}>
                                                    {totalPages}
                                                </Button>
                                            </li>
                                        </>
                                    )}

                                    <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                        <Button className="btn-primary page-link" onClick={nextPage} aria-label="Next">
                                            <span aria-hidden="true">&raquo;</span>
                                        </Button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                    {wizardData && wizardData.length > 0 && (
                        <Row className="mt-2">
                            <Col className="md-5" />
                            <Col className="md-5" />
                            <Col className="md-2 d-flex justify-content-end">
                                <Button className="w-auto" variant="primary" onClick={() => setWizardModalOpen(true)}>
                                    <i className="mdi mdi-lightning-bolt-outline"></i> Process Reviews
                                </Button>
                            </Col>
                        </Row>
                    )}
                </div>
            ) : (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                    <div className="text-center">
                        <i className="mdi mdi-emoticon-sad-outline text-secondary" style={{ fontSize: '5rem' }}></i>
                        <h2>No reviews found</h2>
                        <p>Please adjust your filters and try again.</p>
                    </div>
                </div>
            )}

            {isWizardModalOpen && (
                <ReviewProcessingWizard
                    reviewsData={wizardData || []}
                    selectedReviews={selectedReviews}
                    onHide={handleWizardClose}
                    onDiscardReview={(review) => {
                        const updatedSelectedReviews = selectedReviews.filter((id) => id !== review.review_id);
                        setSelectedReviews(updatedSelectedReviews);
                    }}
                    onUpdateDirectory={fetchReviews}
                />
            )}
        </div>
    );

};

export default ReviewsDirectory;
