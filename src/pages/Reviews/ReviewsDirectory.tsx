import React, { useState, useEffect } from 'react';
import {Table, Button, Modal, Tooltip, OverlayTrigger, Row, Col, Form} from 'react-bootstrap';
import ReviewService from "../../services/ReviewService";
import { toast } from "react-toastify";
import {useLocation, useNavigate} from 'react-router-dom';
import ReviewProcessingWizard from "./ReviewProcessingWizard";
import { ReviewManagerDTO } from '../../DTOs/ReviewManagerDTO';
import TreeService from "../../services/TreeService";
import {SelectedFeatureReviewDTO} from "../../DTOs/SelectedFeatureReviewDTO";

const defaultColumns = ['Select', 'App ID', 'App Name', "Review ID", "Review Text", "Features", "Emotions", "Polarity", "Type", "Topic", 'Actions'];

const PAGE_SIZE = 8
const ReviewsDirectory: React.FC = () => {
    const [apps, setApps] = useState<string[]>([]);
    const [reviews, setReviews] = useState<SelectedFeatureReviewDTO[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [pageData, setPageData] = useState<ReviewManagerDTO[] | null>(null);
    const [wizardData, setWizardData] = useState<ReviewManagerDTO[] | null>(null);
    const [isEditModalOpen, setEditModalIsOpen] = useState<boolean>(false);
    const [isDeleteModalOpen, setDeleteModalIsOpen] = useState<boolean>(false);
    const [selectedReview, setSelectedReview] = useState<ReviewManagerDTO | null>(null);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [isUpdating, setIsUpdating] = useState(false);
    const [review, setReview] = useState<string>('');
    const [date, setDate] = useState<string>('');
    const [score, setScore] = useState<number>(0);
    const [expanded, setExpanded] = useState(false);
    const [isUpdateButtonClicked, setIsUpdateButtonClicked] = useState(false);
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState<string>("");
    const [selectedPolarity, setSelectedPolarity] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>("");
    const [selectedEmotion, setSelectedEmotion] = useState<string>("");
    const [isWizardModalOpen, setWizardModalOpen] = useState<boolean>(false);
    const location = useLocation();
    const { state } = location;
    const navigate = useNavigate();
    const [sortedPageData, setSortedPageData] = useState<ReviewManagerDTO[] | null>(null);
    const [appName, setAppName] = useState<string>("");

    const polarityOptions = ["Positive", "Negative"];
    const typeOptions = ["Bug", "Rating", "Feature", "UserExperience"];
    const topicOptions = [
        "General", "Usability", "Effectiveness", "Efficiency",
        "Enjoyability", "Cost", "Reliability", "Security",
        "Compatibility", "Learnability", "Safety", "Aesthetics"
    ];
    const emotionOptions = ["Joy", "Anger", "Disgust", "Neutral"]

    useEffect(() => {
        if (state) {
            const { reviewsData, selectedReviews } = state;
            setPageData(reviewsData);
            setSelectedReviews(selectedReviews);
        }
    }, [state]);

    useEffect(() => {
        const fetchApps = async () => {
            const treeService = new TreeService();
            try {
                const appData = await treeService.fetchAllApps();
                setApps(appData.map((app) => app.app_name));
            } catch (error) {
                console.error("Error fetching apps:", error);
            }
        };
        fetchApps();
    }, []);

    useEffect(() => {
        if (state) {
            const { appName, selectedFeatures } = state;
            setAppName(appName || "");
            setSelectedFeatures(selectedFeatures || []);

            if (appName && selectedFeatures.length > 0) {
                fetchReviews(appName, selectedFeatures);
            }
        }
    }, [state]);

    const sortByAppId = () => {
        if (pageData) {
            const sortedReviews = [...pageData].sort((a, b) => {
                return a.app_id.localeCompare(b.app_id);
            });
            setSortedPageData(sortedReviews);
        }
    };

    const handleSelectAllChange = async () => {
        const newSelectAll = !selectAll;
        setSelectAll(newSelectAll);
        if (newSelectAll) {
            const reviewService = new ReviewService();
            try {
                const allReviews = await reviewService.fetchAllReviewsPaginated()
                if (allReviews !== null) {
                    const allReviewIds = pageData?.map(review => review.reviewId) || [];
                    setSelectedReviews(newSelectAll ? allReviewIds : []);
                    setWizardData(newSelectAll ? allReviews.reviews : []);
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching all reviews:', error);
            }
        } else {
            setWizardData([]);
            setSelectedReviews([]);
        }
    };

    const handleCheckboxChange = async (review: ReviewManagerDTO) => {
        setSelectAll(false);

        setSelectedReviews((prevSelectedReviews) => {
            const updatedSelectedReviews = [...prevSelectedReviews];
            const index = updatedSelectedReviews.indexOf(review.reviewId);

            if (index !== -1) {
                updatedSelectedReviews.splice(index, 1);
            } else {
                updatedSelectedReviews.push(review.reviewId);
            }

            return updatedSelectedReviews;
        });

        setWizardData((prevWizardData) => {
            if (!prevWizardData || prevWizardData.length === 0) {
                return [review];
            } else if (!prevWizardData.some((r) => r.reviewId === review.reviewId)) {
                return [...prevWizardData, review];
            } else {
                return prevWizardData.filter((r) => r.reviewId !== review.reviewId);
            }
        });
    };

    const openDeleteModal = (review: ReviewManagerDTO) => {
        setSelectedReview(review);
        setDeleteModalIsOpen(true);
    };

    const handleDeleteFeature = (feature: string) => {
        setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
    };

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;
        if (selectedFeatures.includes(newFeature.trim())) return;
        setSelectedFeatures((prev) => [...prev, newFeature.trim()]);
        setNewFeature("");
    };

    const closeModals = () => {
        setEditModalIsOpen(false);
        setDeleteModalIsOpen(false);
        setSelectedReview(null);
    };

    useEffect(() => {
        sortByAppId();
    }, [pageData]);

    useEffect(() => {
        const fetchDataFromApi = async () => {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsPaginated(currentPage, PAGE_SIZE);
                if (response !== null) {
                    const { reviews: mappedData, total_pages: pages } = response;
                    setPageData(mappedData);
                    setTotalPages(pages);
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataFromApi();
    }, [currentPage]);

    const deleteReview = async (app_id: string | undefined, review_id: string | undefined) => {
        if (!app_id) {
            console.error("App ID is undefined or null.");
            return false;
        }

        if (!review_id) {
            console.error("Review ID is undefined or null.");
            return false;
        }

        const reviewService = new ReviewService();
        try {
            await reviewService.deleteReview(app_id, review_id);
            const response = await reviewService.fetchAllReviewsPaginated(currentPage, PAGE_SIZE);
            if (response !== null) {
                const { reviews: mappedData, total_pages: pages } = response;
                if (mappedData !== undefined) {
                    setPageData(mappedData);
                    setTotalPages(pages);
                }
            }
            toast.success('Review deleted successfully!');
            setDeleteModalIsOpen(false);
            return true;
        } catch (error) {
            toast.error('Error deleting app');
            console.error("Error deleting app:", error);
            setDeleteModalIsOpen(false);
            return false;
        }
    };

    const handleManualSearch = () => {
        fetchReviews(appName, selectedFeatures);
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
        navigate(`/applications/${review.app_id}/reviews/${review.reviewId}/analyze`);
    };

    const fetchReviews = async (appName: string, features: string[]) => {
        if (!appName) {
            console.warn("Missing required inputs for search.");
            setReviews([]);
            return;
        }
    };


    const truncateReview = (review: string) => {
        return review.length > 50 ? `${review.substring(0, 50)}...` : review;
    };

    const fetchDataFromApi = async () => {
        const reviewService = new ReviewService();
        try {
            const response = await reviewService.fetchAllReviewsPaginated(currentPage, PAGE_SIZE);
            if (response !== null) {
                const { reviews: mappedData, total_pages: pages } = response;
                setPageData(mappedData);
                setTotalPages(pages);
            } else {
                console.error('Response from fetch all reviews is null');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleWizardClose = () => {
        setWizardModalOpen(false);
        fetchDataFromApi();
    };

    return (
        <div>
            <div>
                <h1 className="text-secondary">Reviews Directory</h1>
                {pageData && pageData.length === 0 && (
                    <div className="d-flex justify-content-center align-items-center">
                        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                            <Row className="text-center">
                                <Col>
                                        <i className="mdi mdi-emoticon-sad text-secondary" style={{ fontSize: '5rem' }} />
                                        <h2>No reviews uploaded yet.</h2>
                                        <p>Why don't you write down some reviews?</p>
                                        <div style={{ width: 'fit-content', margin: '0 auto' }}>
                                            <Button className="mt-4 btn-secondary" href="applications">
                                                <i className="mdi mdi-upload"/> View applications
                                            </Button>
                                        </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                )}
                {pageData && pageData.length > 0 && (
                    <>
                        <Row className="bg-light py-3">
                            {/* App Selector */}
                            <Col md={3}>
                                <h6 className="text-secondary mb-2">Select App</h6>
                                <Form.Select
                                    value={appName}
                                    onChange={(e) => setAppName(e.target.value)}
                                    aria-label="Select App"
                                    style={{
                                        height: "40px",
                                        fontSize: "14px",
                                        padding: "5px 10px",
                                    }}
                                >
                                    <option value="">Select App</option>
                                    {apps.map((app) => {
                                        const extractedAppName = app
                                            .split("-")[1] // Get the part after the hyphen
                                            .toLowerCase(); // Convert to lowercase
                                        return (
                                            <option key={app} value={app}>
                                                {extractedAppName}
                                            </option>
                                        );
                                    })}
                                </Form.Select>
                            </Col>

                            {/* Features Section */}
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
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                padding: '4px 10px',
                                                borderRadius: '12px',
                                                backgroundColor: '#F0F9FF',
                                                border: '1px solid #BAE6FD',
                                                color: '#0369A1',
                                                fontSize: '12px',
                                                fontWeight: 500,
                                                margin: '2px',
                                            }}
                                        >
                                            {feature.replace(/([A-Z])/g, ' $1').toLowerCase()}
                                            <i
                                                className="mdi mdi-close-circle-outline ms-1"
                                                style={{ cursor: "pointer", fontSize: '14px' }}
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
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "5px",
                                            padding: "5px 15px", // Compact button
                                            fontSize: "14px",
                                            flex: "1", // Makes the button smaller
                                        }}
                                    >
                                        <i className="mdi mdi-plus" /> Add
                                    </Button>
                                </div>
                            </Col>

                            {/* Filters Section */}
                            <Col md={4}>
                                <h6 className="text-secondary mb-2">Filters</h6>
                                <Row>
                                    <div className="d-flex gap-2">
                                        <Form.Select
                                            value={selectedPolarity}
                                            onChange={(e) => setSelectedPolarity(e.target.value)}
                                            style={{
                                                fontSize: "14px",
                                                padding: "5px 10px",
                                                height: "40px",
                                            }}
                                        >
                                            <option value="">All Polarities</option>
                                            {polarityOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </Form.Select>

                                        <Form.Select
                                            value={selectedType}
                                            onChange={(e) => setSelectedType(e.target.value)}
                                            style={{
                                                fontSize: "14px",
                                                padding: "5px 10px",
                                                height: "40px",
                                            }}
                                        >
                                            <option value="">All Types</option>
                                            {typeOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Row>
                                <Row className="mt-4">
                                    <div className="d-flex gap-2">

                                        <Form.Select
                                            value={selectedTopic}
                                            onChange={(e) => setSelectedTopic(e.target.value)}
                                            style={{
                                                fontSize: "14px",
                                                padding: "5px 10px",
                                                height: "40px",
                                            }}
                                        >
                                            <option value="">All Topics</option>
                                            {topicOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </Form.Select>

                                        <Form.Select
                                            value={selectedEmotion}
                                            onChange={(e) => setSelectedEmotion(e.target.value)}
                                            style={{
                                                fontSize: "14px",
                                                padding: "5px 10px",
                                                height: "40px",
                                            }}
                                        >
                                            <option value="">All Emotions</option>
                                            {emotionOptions.map(option => (
                                                <option key={option} value={option}>{option}</option>
                                            ))}
                                        </Form.Select>
                                    </div>
                                </Row>

                            </Col>

                            {/* Search Button Section - moved to new row */}
                            <Col md={12} className="mt-3">
                                <Button
                                    variant="secondary"
                                    onClick={handleManualSearch}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "5px",
                                        padding: "5px 20px",
                                        fontSize: "14px",
                                        margin: "0 auto",
                                    }}
                                >
                                    <i className="mdi mdi-magnify"/> Search
                                </Button>
                            </Col>
                        </Row>

                        <Table className="table table-bordered table-centered table-striped table-hover mt-4 bg-light">
                            <thead>
                            <tr>
                                <th className="text-center">
                                    <input
                                        type="checkbox"
                                        checked={selectAll}
                                        onChange={() => handleSelectAllChange()}
                                    />
                                </th>
                                <th className="text-center">App ID</th>
                                <th className="text-center">App Name</th>
                                <th className="text-center">Review ID</th>
                                <th className="text-center">Review Text</th>
                                <th className="text-center">Features</th>
                                <th className="text-center">Polarity</th>
                                <th className="text-center">Type</th>
                                <th className="text-center">Topic</th>
                                <th className="text-center">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sortedPageData &&
                                sortedPageData.map((review) => (
                                    <tr key={review.app_id}>
                                        <td className="text-center">
                                            <input
                                                type="checkbox"
                                                checked={selectedReviews.includes(review.reviewId)}
                                                onChange={() => handleCheckboxChange(review)}
                                            />
                                        </td>
                                        <td className="text-center">{review.app_id || "N/A"}</td>
                                        <td className="text-center">{review.app_name || "N/A"}</td>
                                        <td className="text-center">
                                            <div
                                                title={review.reviewId || "N/A"}
                                                style={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    padding: "4px 8px",
                                                    borderRadius: "8px",
                                                    backgroundColor: "#F1F5F9",
                                                    border: "1px solid #CBD5E1",
                                                    color: "#475569",
                                                    fontSize: "12px",
                                                    fontWeight: 500,
                                                    cursor: "help",
                                                    fontFamily: "monospace",
                                                    letterSpacing: "0.5px",
                                                }}
                                            >
                                                <i
                                                    className="mdi mdi-pound me-1"
                                                    style={{fontSize: "12px"}}
                                                />
                                                {review.reviewId || "N/A"}
                                            </div>
                                        </td>
                                        <td
                                            style={{
                                                textAlign: "justify",
                                                fontSize: "14px",
                                                padding: "12px 16px",
                                                lineHeight: "1.5",
                                            }}
                                        >
                                            {review.review || "N/A"}
                                        </td>
                                        <td className="text-center" style={{fontSize: "14px"}}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "4px",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {Array.isArray(review.features) && review.features.length > 0 ? (
                                                    review.features.map((feature, idx) => (
                                                        <div
                                                            key={idx}
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
                                                            {feature?.trim() || "N/A"}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <span>N/A</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center" style={{fontSize: "14px"}}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "4px",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {Array.isArray(review.polarities)
                                                    ? Array.from(new Set(review.polarities)).map(
                                                        (polarity, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`d-inline-flex ${
                                                                    polarity.toLowerCase() ===
                                                                    "positive"
                                                                        ? "text-success"
                                                                        : "text-danger"
                                                                }`}
                                                            >
                                                                <i
                                                                    className={`mdi ${
                                                                        polarity.toLowerCase() ===
                                                                        "positive"
                                                                            ? "mdi-emoticon-happy-outline"
                                                                            : "mdi-emoticon-sad-outline"
                                                                    } me-1`}
                                                                    style={{
                                                                        fontSize: "24px",
                                                                    }}
                                                                />
                                                            </div>
                                                        )
                                                    )
                                                    : "N/A"}
                                            </div>
                                        </td>
                                        <td className="text-center" style={{fontSize: "14px"}}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "4px",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {Array.isArray(review.types)
                                                    ? Array.from(new Set(review.types)).map(
                                                        (type, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    padding: "4px 12px",
                                                                    borderRadius: "16px",
                                                                    backgroundColor: "#E6F6FF",
                                                                    border: "1px solid #B8E2FF",
                                                                    color: "#0984E3",
                                                                    fontSize: "13px",
                                                                    fontWeight: 500,
                                                                }}
                                                            >
                                                                <i
                                                                    className="mdi mdi-puzzle-outline me-1"
                                                                    style={{
                                                                        fontSize: "16px",
                                                                    }}
                                                                />
                                                                {type || "N/A"}
                                                            </div>
                                                        )
                                                    )
                                                    : "N/A"}
                                            </div>
                                        </td>
                                        <td className="text-center" style={{fontSize: "14px"}}>
                                            <div
                                                style={{
                                                    display: "flex",
                                                    flexWrap: "wrap",
                                                    gap: "4px",
                                                    justifyContent: "center",
                                                }}
                                            >
                                                {Array.isArray(review.topics)
                                                    ? Array.from(new Set(review.topics)).map(
                                                        (topic, idx) => (
                                                            <div
                                                                key={idx}
                                                                style={{
                                                                    display: "inline-flex",
                                                                    alignItems: "center",
                                                                    padding: "4px 10px",
                                                                    borderRadius: "12px",
                                                                    backgroundColor: "#F5F3FF",
                                                                    border: "1px solid #DDD6FE",
                                                                    color: "#6D28D9",
                                                                    fontSize: "12px",
                                                                    fontWeight: 500,
                                                                    letterSpacing: "0.2px",
                                                                }}
                                                            >
                                                                <i
                                                                    className="mdi mdi-puzzle-outline me-1"
                                                                    style={{
                                                                        fontSize: "14px",
                                                                    }}
                                                                />
                                                                {topic || "N/A"}
                                                            </div>
                                                        )
                                                    )
                                                    : "N/A"}
                                            </div>
                                        </td>
                                        <td className="text-end" style={{width: "150px"}}>
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip id="analyze-tooltip">View Review</Tooltip>
                                                }
                                            >
                                                <a
                                                    href="javascript:void(0)"
                                                    className="action-icon"
                                                    onClick={() => analyzeReviewAction(review)}
                                                >
                                                    <i className="mdi mdi-eye"></i>
                                                </a>
                                            </OverlayTrigger>

                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip id="delete-tooltip">Delete</Tooltip>
                                                }
                                            >
                                                <a
                                                    href="#"
                                                    className="action-icon"
                                                    onClick={() => openDeleteModal(review)}
                                                >
                                                    <i className="mdi mdi-delete"></i>
                                                </a>
                                            </OverlayTrigger>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                        {totalPages > 1 && (
                            <div className="d-flex justify-content-center align-items-center">
                                <nav>
                                    <ul className="pagination pagination-rounded mb-0">
                                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                            <Button className="btn-primary page-link" onClick={prevPage}
                                                    aria-label="Previous">
                                                <span aria-hidden="true">&laquo;</span>
                                            </Button>
                                        </li>

                                        {currentPage > 6 && (
                                            <li className={`page-item ${currentPage === 1 ? 'active' : ''}`}>
                                                <Button className="btn-primary page-link"
                                                        onClick={() => setCurrentPage(1)}>
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

                                        {Array.from({length: Math.min(10, totalPages - Math.max(1, currentPage - 5))}, (_, index) => (
                                            <li key={index}
                                                className={`page-item ${currentPage === index + Math.max(1, currentPage - 5) ? 'active' : ''}`}>
                                                <Button className="btn-primary page-link"
                                                        onClick={() => setCurrentPage(index + Math.max(1, currentPage - 5))}>
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
                                            <Button className="btn-primary page-link"
                                                    onClick={() => setCurrentPage(totalPages)}>
                                                {totalPages}
                                            </Button>
                                        </li>
                                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                                            <Button className="btn-primary page-link" onClick={nextPage}
                                                    aria-label="Next">
                                                <span aria-hidden="true">&raquo;</span>
                                            </Button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                        {wizardData && wizardData.length > 0 && (
                            <>
                                <Row className="mt-2">
                                    <Col className="md-5">
                                    </Col>
                                    <Col className="md-5">
                                    </Col>
                                    <Col className="md-2 d-flex justify-content-end">
                                        <Button className="w-auto" variant="primary"
                                                onClick={() => setWizardModalOpen(true)}>
                                            <i className="mdi mdi-lightning-bolt-outline"></i> Process Reviews
                                        </Button>
                                    </Col>
                                </Row>
                            </>

                        )}
                    </>
                )}
            </div>


            <Modal show={isDeleteModalOpen} backdrop="static" keyboard={false} onHide={closeModals}>
                <Modal.Header closeButton>
                    <Modal.Title>Delete App</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview &&
                        <p>Do you really want to <b>delete</b> the review: {selectedReview?.reviewId}?</p>}
                    <p>This step is <b>irreversible</b></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={closeModals}>Close</Button>
                    <Button variant="danger"
                            onClick={() => deleteReview(selectedReview?.app_id, selectedReview?.reviewId)}>Delete</Button>
                </Modal.Footer>
            </Modal>

            {isWizardModalOpen && (
                <ReviewProcessingWizard
                    reviewsData={wizardData || []}
                    selectedReviews={selectedReviews}
                    onHide={handleWizardClose}
                    onDiscardReview={(review) => {
                        const updatedSelectedReviews = selectedReviews.filter((id) => id !== review.reviewId);
                        setSelectedReviews(updatedSelectedReviews);
                    }}
                    onUpdateDirectory={fetchDataFromApi}
                />
            )}
        </div>
    );
};

export default ReviewsDirectory;

