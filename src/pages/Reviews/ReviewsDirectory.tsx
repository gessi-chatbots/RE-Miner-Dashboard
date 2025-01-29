import React, { useState, useEffect } from "react";
import { Table,Tooltip, Button, Modal, Row, Col, Form, OverlayTrigger } from "react-bootstrap";
import ReviewService from "../../services/ReviewService";
import AppService from "../../services/AppService";
import { toast } from "react-toastify";
import {useLocation, useNavigate} from 'react-router-dom';
import ReviewProcessingWizard from "./ReviewProcessingWizard";
import { ReviewManagerDTO } from "../../DTOs/ReviewManagerDTO";

const defaultColumns = ["Package", "Review ID", "Review Text", "Features", "Polarity", "Emotions", "Type", "Topic", "Actions"];

const ReviewsDirectory: React.FC = () => {
    const [apps, setApps] = useState<string[]>([]);
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
    const [selectedReview, setSelectedReview] = useState<ReviewManagerDTO | null>(null);
    const [selectedReviews, setSelectedReviews] = useState<string[]>([]);
    const [isWizardModalOpen, setWizardModalOpen] = useState<boolean>(false);
    const [selectAll, setSelectAll] = useState(false);
    const navigate = useNavigate();

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
    const TypeBadge: React.FC<{ type: string }> = ({ type }) => {
        const formatText = (text: string) => {
            // Convert camelCase to space-separated words and capitalize first letter
            return text
                .replace(/([A-Z])/g, ' $1')
                .toLowerCase()
                .trim()
                .replace(/^./, str => str.toUpperCase());
        };

        const getTypeStyles = (type: string) => {
            switch (type.toLowerCase()) {
                case 'bug':
                    return {
                        icon: 'mdi mdi-bug-outline',
                        bg: '#FFE6E6',
                        color: '#D63031',
                        border: '#FFB8B8'
                    };
                case 'rating':
                    return {
                        icon: 'mdi mdi-star-outline',
                        bg: '#FFF4E6',
                        color: '#E67E22',
                        border: '#FFD8A8'
                    };
                case 'feature':
                    return {
                        icon: 'mdi mdi-puzzle-outline',
                        bg: '#E6F6FF',
                        color: '#0984E3',
                        border: '#B8E2FF'
                    };
                case 'userexperience':
                    return {
                        icon: 'mdi mdi-account-outline',
                        bg: '#E6FFE6',
                        color: '#00B894',
                        border: '#B8FFB8'
                    };
                default:
                    return {
                        icon: 'mdi mdi-help-circle-outline',
                        bg: '#F5F5F5',
                        color: '#666666',
                        border: '#DDDDDD'
                    };
            }
        };

        const styles = getTypeStyles(type);

        return (
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 12px',
                    borderRadius: '16px',
                    backgroundColor: styles.bg,
                    border: `1px solid ${styles.border}`,
                    color: styles.color,
                    fontSize: '13px',
                    fontWeight: 500,
                }}
            >
                <i className={`${styles.icon} me-1`} style={{ fontSize: '16px' }} />
                {formatText(type)}
            </div>
        );
    };

    const TopicBadge: React.FC<{ topic: string }> = ({ topic }) => {
        if (!topic) return null;

        const getTopicStyles = (topic: string) => {
            const normalizedTopic = topic.toLowerCase().trim();

            switch (normalizedTopic) {
                case 'general':
                    return {
                        icon: 'mdi mdi-checkbox-multiple-blank-circle-outline',
                        bg: '#F3F4F6',
                        color: '#4B5563',
                        border: '#D1D5DB'
                    };
                case 'usability':
                    return {
                        icon: 'mdi mdi-gesture-tap',
                        bg: '#EDE9FE',
                        color: '#7C3AED',
                        border: '#DDD6FE'
                    };
                case 'effectiveness':
                    return {
                        icon: 'mdi mdi-target',
                        bg: '#FCE7F3',
                        color: '#DB2777',
                        border: '#FBCFE8'
                    };
                case 'efficiency':
                    return {
                        icon: 'mdi mdi-lightning-bolt',
                        bg: '#FEF3C7',
                        color: '#D97706',
                        border: '#FDE68A'
                    };
                case 'enjoyability':
                    return {
                        icon: 'mdi mdi-heart-outline',
                        bg: '#FFE4E6',
                        color: '#E11D48',
                        border: '#FECDD3'
                    };
                case 'cost':
                    return {
                        icon: 'mdi mdi-currency-usd',
                        bg: '#ECFDF5',
                        color: '#059669',
                        border: '#A7F3D0'
                    };
                case 'reliability':
                    return {
                        icon: 'mdi mdi-shield-check-outline',
                        bg: '#E0F2FE',
                        color: '#0284C7',
                        border: '#BAE6FD'
                    };
                case 'security':
                    return {
                        icon: 'mdi mdi-lock-outline',
                        bg: '#FEF2F2',
                        color: '#DC2626',
                        border: '#FECACA'
                    };
                case 'compatibility':
                    return {
                        icon: 'mdi mdi-puzzle-outline',
                        bg: '#F5F3FF',
                        color: '#6D28D9',
                        border: '#DDD6FE'
                    };
                case 'learnability':
                    return {
                        icon: 'mdi mdi-school-outline',
                        bg: '#FFF7ED',
                        color: '#C2410C',
                        border: '#FFEDD5'
                    };
                case 'safety':
                    return {
                        icon: 'mdi mdi-shield-alert-outline',
                        bg: '#FEF9C3',
                        color: '#CA8A04',
                        border: '#FEF08A'
                    };
                case 'aesthetics':
                    return {
                        icon: 'mdi mdi-palette-outline',
                        bg: '#F3E8FF',
                        color: '#9333EA',
                        border: '#E9D5FF'
                    };
                default:
                    return {
                        icon: 'mdi mdi-help-circle-outline',
                        bg: '#F3F4F6',
                        color: '#6B7280',
                        border: '#D1D5DB'
                    };
            }
        };

        const styles = getTopicStyles(topic);

        return (
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    backgroundColor: styles.bg,
                    border: `1px solid ${styles.border}`,
                    color: styles.color,
                    fontSize: '12px',
                    fontWeight: 500,
                    letterSpacing: '0.2px',
                }}
            >
                <i className={`${styles.icon} me-1`} style={{ fontSize: '14px' }} />
                {topic ? topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase() : 'Unknown'}
            </div>
        );
    };

    const FeatureBadge: React.FC<{ feature: string }> = ({ feature }) => {
        const formatText = (text: string) => {
            // Convert camelCase to space-separated words
            return text
                .replace(/([A-Z])/g, ' $1')
                .toLowerCase()
                .trim();
        };

        return (
            <div
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
                    letterSpacing: '0.2px',
                    margin: '2px',
                }}
            >
                {formatText(feature)}
            </div>
        );
    };

    const ReviewIdBadge: React.FC<{ id: string }> = ({ id }) => {
        // Take only first 8 characters if ID is longer
        const shortId = id.length > 8 ? `${id.slice(0, 8)}...` : id;

        return (
            <div
                title={id} // This creates a native tooltip on hover
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid #CBD5E1',
                    color: '#475569',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'help',
                    fontFamily: 'monospace',
                    letterSpacing: '0.5px',
                }}
            >
                <i className="mdi mdi-pound me-1" style={{ fontSize: '12px' }} />
                {shortId}
            </div>
        );
    };
    const PolarityIcon: React.FC<{ polarity: string }> = ({ polarity }) => {
        if (polarity.toLowerCase() === 'positive') {
            return (
                <div className="d-inline-flex text-success">
                    <i className="mdi mdi-emoticon-happy-outline me-1" style={{ fontSize: '24px' }} />
                </div>
            );
        } else if (polarity.toLowerCase() === 'negative') {
            return (
                <div className="d-inline-flex text-danger">
                    <i className="mdi mdi-emoticon-sad-outline me-1" style={{ fontSize: '24px' }} />
                </div>
            );
        }
        return <span>{polarity || 'N/A'}</span>;
    };

    useEffect(() => {
        const fetchApps = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsNamesSimple();
                if (response) {
                    setApps(response.apps.map((app) => app.app_name));
                } else {
                    console.warn("No apps found");
                    setApps([]);
                }
            } catch (error) {
                console.error("Error fetching apps:", error);
            }
        };
        fetchApps();
    }, []);

    const fetchReviews = async () => {
        try {
            const reviewService = new ReviewService();
            const response = await reviewService.fetchFilteredReviews(
                appPackage,
                selectedFeatures,
                selectedTopic,
                selectedEmotion,
                selectedPolarity,
                selectedType,
                currentPage,
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
    const handleCheckboxChange = (reviewId: string) => {
        setSelectAll(false);
        setSelectedReviews((prev) =>
            prev.includes(reviewId)
                ? prev.filter((id) => id !== reviewId)
                : [...prev, reviewId]
        );
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
            <Row className="bg-light py-3">
                {/* App Selector */}
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
                        <option value="">All Apps</option>
                        {apps.map((app) => (
                            <option key={app} value={app}>
                                {app}
                            </option>
                        ))}
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

                {/* Filters */}
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

            <Row className="bg-light py-3">
                <Col md={2}>
                    <Button
                        variant="secondary"
                        onClick={fetchReviews}
                        style={{
                            padding: "5px 10px",
                            fontSize: "14px",
                        }}
                    >
                        <i className="mdi mdi-magnify" /> Search
                    </Button>
                </Col>
            </Row>

            {/* Reviews Table */}
            {pageData && pageData.length > 0 ? (
                <>
                    <Table className="table table-bordered table-centered table-striped table-hover mt-4 bg-light">
                        <thead>
                        <tr>
                            <th>
                                <input
                                    type="checkbox"
                                    checked={selectAll}
                                    onChange={handleSelectAllChange}
                                />
                            </th>
                            {defaultColumns.map((column) => (
                                <th
                                    className="text-center"
                                    key={column}
                                    style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        padding: '12px 8px',
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
                                                                                "auto" // Fallback for unexpected columns
                                    }}
                                >
                                    {column}
                                </th>
                            ))}

                        </tr>
                        </thead>
                        <tbody>
                        {pageData.map((review) => (
                            <tr key={review.review_id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedReviews.includes(review.review_id)}
                                        onChange={() => handleCheckboxChange(review.review_id)}
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
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px',
                                        justifyContent: 'center'
                                    }}>
                                        {Array.isArray(review.features) && review.features.map((feature, idx) => (
                                            <FeatureBadge key={idx} feature={feature?.trim() || 'N/A'}/>
                                        ))}
                                    </div>
                                </td>

                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px',
                                        justifyContent: 'center'
                                    }}>
                                        {Array.isArray(review.polarities) ?
                                            Array.from(new Set(review.polarities)).map((polarity, idx) => (
                                                <PolarityIcon key={idx} polarity={polarity || 'N/A'}/>
                                            ))
                                            : <PolarityIcon polarity='N/A'/>
                                        }
                                    </div>
                                </td>
                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px',
                                        justifyContent: 'center'
                                    }}>
                                        {Array.isArray(review.emotions) ?
                                            Array.from(new Set(review.emotions)).map((polarity, idx) => (
                                                <PolarityIcon key={idx} polarity={polarity || 'N/A'}/>
                                            ))
                                            : <PolarityIcon polarity='N/A'/>
                                        }
                                    </div>
                                </td>
                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px',
                                        justifyContent: 'center'
                                    }}>
                                        {Array.isArray(review.types) ?
                                            Array.from(new Set(review.types)).map((type, idx) => (
                                                <TypeBadge key={idx} type={type || 'N/A'}/>
                                            ))
                                            : <TypeBadge type='N/A'/>
                                        }
                                    </div>
                                </td>
                                <td className="text-center" style={{fontSize: '14px'}}>
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '4px',
                                        justifyContent: 'center'
                                    }}>
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
                                        <a href="javascript:void(0)" className="action-icon"
                                           onClick={() => analyzeReviewAction(review)}>
                                            <i className="mdi mdi-eye"></i>
                                        </a>
                                    </OverlayTrigger>

                                </td>

                            </tr>
                        ))}
                        </tbody>
                    </Table>
                    <div className="d-flex align-items-center">
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

                                    {Array.from({length: Math.min(10, totalPages - Math.max(1, currentPage - 5))}, (_, index) => {
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
                </>
            ) : (
                <div className="d-flex justify-content-center align-items-center" style={{minHeight: '50vh'}}>
                    <div className="text-center">
                        <i className="mdi mdi-emoticon-sad-outline text-secondary" style={{fontSize: '5rem'}}></i>
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
