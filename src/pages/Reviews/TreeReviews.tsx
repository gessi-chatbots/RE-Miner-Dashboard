import React, { useState, useEffect } from 'react';
import { Table, Button, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import ReviewService from "../../services/ReviewService";
import { toast } from "react-toastify";
import { SelectedFeatureReviewDTO } from "../../DTOs/SelectedFeatureReviewDTO";

const defaultColumns = ['Review ID', 'Review Text', 'Feature Name', 'Language Model'];

const TreeReviews: React.FC = () => {
    const location = useLocation();
    const { state } = location;

    const [reviews, setReviews] = useState<SelectedFeatureReviewDTO[]>([]);
    const [appName, setAppName] = useState<string>('');
    const [clusterName, setClusterName] = useState<string>('');
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]); // Array of feature names
    const navigate = useNavigate();

    useEffect(() => {
        if (state) {
            const { appName, clusterName, selectedFeatures } = state;
            setAppName(appName || '');
            setClusterName(clusterName || '');
            setSelectedFeatures(selectedFeatures || []);
        } else {
            toast.error("No data received. Redirecting to home...");
            navigate('/');
        }
    }, [state, navigate]);

    useEffect(() => {
        const fetchReviews = async () => {
            if (!appName || !clusterName || selectedFeatures.length === 0) return;

            const reviewService = new ReviewService();
            try {
                const fetchedReviews = await reviewService.fetchSelectedFeatureReviews(appName, clusterName, selectedFeatures);
                setReviews(fetchedReviews);
            } catch (error) {
                console.error("Error fetching reviews:", error);
                toast.error("Failed to fetch reviews. Please try again.");
            }
        };

        fetchReviews();
    }, [appName, clusterName, selectedFeatures]);

    return (
        <div>
            <h1 className="text-secondary">Tree Reviews</h1>
            <h3>App: {appName}</h3>
            <h5>Selected Features:</h5>
            <ul>
                {selectedFeatures.map((feature, index) => (
                    <li key={index}>{feature}</li>
                ))}
            </ul>
            {reviews.length === 0 && (
                <div className="d-flex justify-content-center align-items-center">
                    <Row className="text-center">
                        <Col>
                            <i className="mdi mdi-emoticon-sad text-secondary" style={{ fontSize: '5rem' }} />
                            <h2>No reviews found for the selected features.</h2>
                        </Col>
                    </Row>
                </div>
            )}
            {reviews.length > 0 && (
                <Table className="table table-bordered table-centered table-striped table-hover mt-4">
                    <thead>
                    <tr>
                        {defaultColumns.map((column) => (
                            <th className="text-center" key={column}>{column}</th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {reviews.map((review) => (
                        <tr key={review.review_id}>
                            <td className="text-center">{review.review_id || 'N/A'}</td>
                            <td className="text-center">{review.review_text || 'N/A'}</td>
                            <td className="text-center">{review.feature_name || 'N/A'}</td>
                            <td className="text-center">{review.language_model || 'N/A'}</td>
                        </tr>
                    ))}
                    </tbody>
                </Table>
            )}
        </div>
    );
};

export default TreeReviews;
