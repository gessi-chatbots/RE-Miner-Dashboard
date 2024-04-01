import React, { useEffect, useState } from 'react';
import {Bar, Line} from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import ReviewService from '../../services/ReviewService';
import AppService from "../../services/AppService";
import {Button, Col, Container, Modal, Row} from "react-bootstrap";
import {ReviewDataDTO} from "../../DTOs/ReviewDataDTO";
import {AppDataDTO} from "../../DTOs/AppDataDTO";

// Register necessary components from chart.js
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);
const FeatureLineChart = () => {
    const [data, setData] = useState<ReviewDataDTO[] | null>(null);
    const [features, setFeatures] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [appData, setAppData] = useState<AppDataDTO[] | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

    useEffect(() => {
        const fetchAppDataFromService = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsNames();
                if (response !== null) {
                    const { apps: appData } = response;
                    setAppData(appData);
                } else {
                    console.error('Response from fetch all apps is null');
                }
            } catch (error) {
                console.error('Error fetching app data:', error);
            }
        };

        fetchAppDataFromService();
    }, []);

    useEffect(() => {
        if (selectedApp) {
            setSelectedFeatures([]);
            fetchReviewDataFromApp();
        }
    }, [selectedApp]);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const generateColors = (count: number) => {
        const colors = Array.from({ length: count }, () => getRandomColor());
        return colors;
    };

    const extractFeaturesFromReviews = (reviews: ReviewDataDTO[]) => {
        const allFeatures = reviews.reduce(
            (features, review) => features.concat(review.features || []),
            [] as string[]
        );
        return Array.from(new Set(allFeatures));
    };

    const fetchReviewDataFromApp = async () => {
        if (selectedApp) {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsDetailedFromApp(
                    selectedApp
                );
                if (response !== null) {
                    const reviews = response.reviews;
                    const features = extractFeaturesFromReviews(reviews);
                    setData(reviews);
                    setFeatures(features);
                    setColors(generateColors(features.length));
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const countFeatureOccurrencesByDate = (reviews: ReviewDataDTO[]) => {
        const featureCount: Record<string, Record<string, number>> = {};

        reviews.forEach((review) => {
            const dateParts = review.date.split('/');
            const reviewDate = new Date(
                `${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`
            ).toDateString();
            featureCount[reviewDate] = featureCount[reviewDate] || {};

            (review.features || []).forEach((feature: string) => {
                featureCount[reviewDate][feature] =
                    (featureCount[reviewDate][feature] || 0) + 1;
            });
        });

        return featureCount;
    };

    const updateLineChartData = () => {
        if (selectedApp && selectedFeatures.length > 0 && data) {
            const featureDateCounts = countFeatureOccurrencesByDate(data);
            let dates = Object.keys(featureDateCounts);
            dates = dates.sort(
                (a, b) => new Date(a).getTime() - new Date(b).getTime()
            );

            dates = dates.filter((date) => {
                const currentDate = new Date(date).getTime();
                const start = startDate ? new Date(startDate).getTime() : 0;
                const end = endDate ? new Date(endDate).getTime() : Infinity;
                return currentDate >= start && currentDate <= end;
            });

            const datasets = selectedFeatures.map((feature, index) => {
                const dataPoints = dates.map(
                    (date) => featureDateCounts[date][feature] || 0
                );

                return {
                    data: dataPoints,
                    borderWidth: 1,
                    label: feature,
                    borderColor: colors[index],
                    fill: false,
                };
            });

            const chartData = {
                labels: dates,
                datasets: datasets,
            };

            return chartData;
        }
        return null;
    };

    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Dates',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count',
                },
            },
        },
    };

    const renderChart = () => {
        const chartData = updateLineChartData();
        if (chartData) {
            return <Line data={chartData} options={options} />;
        } else {
            return <p>Select an app and at least one feature.</p>;
        }
    };


    const handleAddButtonClick = () => {
        if (selectedFeature) {
            if (!selectedFeatures.includes(selectedFeature)) {
                const updatedSelectedFeatures = [...selectedFeatures, selectedFeature];
                setSelectedFeatures(updatedSelectedFeatures);
                setSelectedFeature('');
            } else {
                console.error('Feature already added.');
            }
        } else {
            console.error('Please select a feature before adding to the chart.');
        }
    }

    return (
        <Container className="sentiment-histogram-container">
            <Row className="mt-4">
                <Col>
                    <label className="text-secondary mb-2">Features over time</label>
                </Col>
                <Col className="col-md-4 d-flex align-self-end justify-content-end">
                    <Button
                        className="btn-secondary btn-sm btn-square"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <i className="mdi mdi-arrow-expand"/>
                    </Button>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col md={6}>
                    <label className="form-label">Start Date: </label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Col>
                <Col md={6}>
                    <label className="form-label">End Date: </label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Col>
            </Row>
            <Row className="mb-4">
                <Col md={4}>
                    <label className="form-label">App: </label>
                    <select
                        className="form-select"
                        value={selectedApp || ''}
                        onChange={(e) => {
                            const selectedAppId = e.target.value || null;
                            setSelectedApp(selectedAppId);
                            if (selectedAppId) {
                                setSelectedFeatures([]);
                                fetchReviewDataFromApp();
                            }
                        }}
                    >
                        <option value="" disabled>
                            Select an App
                        </option>
                        {appData?.map((app) => (
                            <option key={app.package_name} value={app.package_name}>
                                {app.app_name}
                            </option>
                        ))}
                    </select>
                </Col>
                <Col md={4}>
                    <label className="form-label">Feature: </label>
                    <select
                        className="form-select"
                        value={selectedFeature || ''}
                        onChange={(e) => {
                            const feature = e.target.value || null;
                            setSelectedFeature(feature);
                        }}
                    >
                        <option value="" disabled>
                            Select a Feature
                        </option>
                        {features.map((feature) => (
                            <option key={feature} value={feature}>
                                {feature}
                            </option>
                        ))}
                    </select>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                    <Button
                        className="btn-secondary btn-sm btn-square"
                        onClick={handleAddButtonClick}
                    >
                        <i className="mdi mdi-plus"/>
                    </Button>
                </Col>
            </Row>
            <Row>
                {data ? (
                    renderChart()
                ) : (
                    <p className="text-secondary">Select an app and at least one feature</p>
                )}
            </Row>
            {isModalOpen && selectedApp && data ? (
                <Modal fullscreen="xxl-down" show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg" centered style={{ maxWidth: '95vw', maxHeight: '95vh' }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Features over time</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {data && selectedApp ? (
                            renderChart()
                        ) : (
                            <p className="text-secondary">Select an app and at least one feature</p>
                        )}
                    </Modal.Body>
                </Modal>
            ) : null}
        </Container>
    );
};

export default FeatureLineChart;
