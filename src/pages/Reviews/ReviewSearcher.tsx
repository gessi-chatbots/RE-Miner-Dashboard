import React, { useEffect, useState } from "react";
import { Table, Button, Row, Col, Form, Badge } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import ReviewService from "../../services/ReviewService";
import TreeService from "../../services/TreeService";
import { SelectedFeatureReviewDTO } from "../../DTOs/SelectedFeatureReviewDTO";

const defaultColumns = ["Review ID", "Review Text", "Features", "Polarity", "Type", "Topic"];

const ReviewSearcher: React.FC = () => {
    const location = useLocation();
    const { state } = location;

    const [apps, setApps] = useState<string[]>([]);
    const [reviews, setReviews] = useState<SelectedFeatureReviewDTO[]>([]);
    const [appName, setAppName] = useState<string>("");
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState<string>("");
    const [selectedPolarity, setSelectedPolarity] = useState<string>("");
    const [selectedType, setSelectedType] = useState<string>("");
    const [selectedTopic, setSelectedTopic] = useState<string>("");

    // Add these arrays for the select options
    const polarityOptions = ["Positive", "Negative"];
    const typeOptions = ["Bug", "Rating", "Feature", "UserExperience"];
    const topicOptions = [
        "General", "Usability", "Effectiveness", "Efficiency",
        "Enjoyability", "Cost", "Reliability", "Security",
        "Compatibility", "Learnability", "Safety", "Aesthetics"
    ];

    // Fetch all apps for the dropdown
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

    // Populate state when navigating from TreeAnalyzer
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

    const fetchReviews = async (appName: string, features: string[]) => {
        if (!appName || features.length === 0) {
            console.warn("Missing required inputs for search.");
            setReviews([]);
            return;
        }

        // Parse the app name (extract the part after the hyphen and convert to lowercase)
        const parsedAppName = appName.split("-")[1]?.toLowerCase();
        console.log("Searching with parsedAppName:", parsedAppName);

        const reviewService = new ReviewService();
        try {
            const fetchedReviews = await reviewService.fetchSelectedFeatureReviews(
                parsedAppName,
                features
            );
            console.log("Fetched reviews:", fetchedReviews);
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            setReviews([]); // Show "No reviews found" in case of errors
        }
    };

    const handleManualSearch = () => {
        fetchReviews(appName, selectedFeatures);
    };

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;
        if (selectedFeatures.includes(newFeature.trim())) return;
        setSelectedFeatures((prev) => [...prev, newFeature.trim()]);
        setNewFeature("");
    };

    // Handle removing a feature
    const handleDeleteFeature = (feature: string) => {
        setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
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
        const getTopicStyles = (topic: string) => {
            switch (topic.toLowerCase()) {
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
                {topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase()}
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

    // Update the filter function to handle camelCase properly
    const filterReviews = (reviews: SelectedFeatureReviewDTO[]) => {
        return reviews.filter(review => {
            const matchesPolarity = !selectedPolarity || review.polarity.toLowerCase() === selectedPolarity.toLowerCase();
            
            // Handle camelCase for type comparison
            const matchesType = !selectedType || 
                review.type.toLowerCase() === selectedType.toLowerCase().replace(/\s+/g, '');
            
            const matchesTopic = !selectedTopic || review.topic.toLowerCase() === selectedTopic.toLowerCase();
            return matchesPolarity && matchesType && matchesTopic;
        });
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

    return (
        <div>
            <h1 className="text-secondary">Review Searcher</h1>
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
                                flex: "3", // Makes the input field larger
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
                    </div>
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
                        <i className="mdi mdi-magnify" /> Search
                    </Button>
                </Col>
            </Row>

            {/* Modify the reviews display to use filtered reviews */}
            <Row className="mt-4">
                {reviews.length === 0 ? (
                    <Col className="text-center text-secondary">
                        <i
                            className="mdi mdi-emoticon-sad-outline"
                            style={{ fontSize: "5rem" }}
                        />
                        <h4>No reviews found for the selected features.</h4>
                    </Col>
                ) : (
                    <Table className="table table-bordered table-centered table-striped table-hover mt-4 bg-light">
                        <thead>
                            <tr>
                                {defaultColumns.map((column) => (
                                    <th 
                                        className="text-center" 
                                        key={column}
                                        style={{
                                            fontSize: '14px',
                                            fontWeight: 600,
                                            padding: '12px 8px',
                                            width: column === "Review ID" ? "8%" :
                                                  column === "Review Text" ? "50%" :
                                                  column === "Features" ? "25%" :
                                                  column === "Polarity" ? "8%" :
                                                  column === "Type" ? "12%" :
                                                  "12%" // Topic
                                        }}
                                    >
                                        {column}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filterReviews(reviews).map((review) => (
                                <tr key={review.review_id}>
                                    <td className="text-center">
                                        <ReviewIdBadge id={review.review_id || "N/A"} />
                                    </td>
                                    <td 
                                        style={{
                                            textAlign: 'justify',
                                            fontSize: '14px',
                                            padding: '12px 16px',
                                            lineHeight: '1.5'
                                        }}
                                    >
                                        {review.review_text || "N/A"}
                                    </td>
                                    <td className="text-center" style={{ fontSize: '14px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
                                            {(review.feature_name || "")
                                                .split(",")
                                                .map((feature, idx) => (
                                                    <FeatureBadge key={idx} feature={feature.trim()} />
                                                ))}
                                        </div>
                                    </td>
                                    <td className="text-center" style={{ fontSize: '14px' }}>
                                        <PolarityIcon polarity={review.polarity} />
                                    </td>
                                    <td className="text-center" style={{ fontSize: '14px' }}>
                                        <TypeBadge type={review.type} />
                                    </td>
                                    <td className="text-center" style={{ fontSize: '14px' }}>
                                        <TopicBadge topic={review.topic} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                )}
            </Row>
        </div>
    );
};

export default ReviewSearcher;
