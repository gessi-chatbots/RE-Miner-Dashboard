import React, { useState, useEffect } from "react";
import { Table, Button, Row, Col, Form, Badge } from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import ReviewService from "../../services/ReviewService";
import { toast } from "react-toastify";
import { SelectedFeatureReviewDTO } from "../../DTOs/SelectedFeatureReviewDTO";

const defaultColumns = ["Review ID", "Review Text", "Feature Name", "Language Model"];

const TreeReviews: React.FC = () => {
    const location = useLocation();
    const { state } = location;

    const [reviews, setReviews] = useState<SelectedFeatureReviewDTO[]>([]);
    const [appName, setAppName] = useState<string>("");
    const [clusterName, setClusterName] = useState<string>("");
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [newFeature, setNewFeature] = useState<string>("");

    const navigate = useNavigate();

    useEffect(() => {
        if (state) {
            const { appName, clusterName, selectedFeatures } = state;
            setAppName(appName || "");
            setClusterName(clusterName || "");
            setSelectedFeatures(selectedFeatures || []);
        } else {
            toast.error("No data received. Redirecting to home...");
            navigate("/");
        }
    }, [state, navigate]);

    useEffect(() => {
        fetchReviews(); // Trigger the first search automatically
    }, [appName, clusterName, selectedFeatures]);

    const fetchReviews = async () => {
        if (!appName || !clusterName || selectedFeatures.length === 0) {
            toast.error("Please select valid features.");
            return;
        }

        const reviewService = new ReviewService();
        try {
            const fetchedReviews = await reviewService.fetchSelectedFeatureReviews(
                appName,
                clusterName,
                selectedFeatures
            );
            setReviews(fetchedReviews);
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to fetch reviews. Please try again.");
        }
    };

    const handleAddFeature = () => {
        if (!newFeature.trim()) return;

        if (selectedFeatures.includes(newFeature.trim())) {
            toast.warning("Feature already added.");
            return;
        }

        setSelectedFeatures((prev) => [...prev, newFeature.trim()]);
        setNewFeature("");
    };

    const handleDeleteFeature = (feature: string) => {
        setSelectedFeatures((prev) => prev.filter((f) => f !== feature));
    };

    return (
        <div>
            {/* Grey Row */}
            <Row className="bg-light py-3 align-items-center">
                {/* App Name Section */}
                <Col md={3}>
                    <h6 className="text-secondary mb-2">App Name</h6>
                    <Form.Control
                        type="text"
                        value={appName}
                        readOnly
                        className="bg-light text-secondary"
                        style={{
                            height: "40px",
                            fontSize: "14px",
                            padding: "5px 10px",
                        }}
                    />
                </Col>

                {/* Features Section */}
                <Col md={7}>
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
                            <Badge
                                key={index}
                                bg="secondary"
                                className="p-2"
                                style={{ fontSize: "12px" }}
                            >
                                {feature}{" "}
                                <i
                                    className="mdi mdi-close-circle-outline text-light"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => handleDeleteFeature(feature)}
                                />
                            </Badge>
                        ))}
                    </div>
                    <div className="d-flex align-items-center mt-2">
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

                {/* Search Button Section */}
                <Col md={2} className="text-center">
                    <Button
                        variant="secondary"
                        onClick={fetchReviews}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "5px",
                            padding: "5px 10px",
                            fontSize: "14px",
                            width: "100%",
                        }}
                    >
                        <i className="mdi mdi-magnify" /> Search
                    </Button>
                </Col>
            </Row>

            {/* Reviews Table */}
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
                    <Table
                        className="table table-bordered table-centered table-striped table-hover mt-4 bg-light"
                    >
                        <thead>
                        <tr>
                            {defaultColumns.map((column) => (
                                <th className="text-center" key={column}>
                                    {column}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {reviews.map((review) => (
                            <tr key={review.review_id}>
                                <td className="text-center">{review.review_id || "N/A"}</td>
                                <td className="text-center">{review.review_text || "N/A"}</td>
                                <td className="text-center">{review.feature_name || "N/A"}</td>
                                <td className="text-center">{review.language_model || "N/A"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </Table>
                )}
            </Row>
        </div>
    );
};

export default TreeReviews;
