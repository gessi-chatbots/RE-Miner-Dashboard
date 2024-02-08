import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LineController,
    BarController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import ReviewService from '../../services/ReviewService';
import AppService from '../../services/AppService';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { ReviewDataDTO } from '../../DTOs/ReviewDataDTO';
import { AppDataDTO } from '../../DTOs/AppDataDTO';
import {SentimentDataDTO} from "../../DTOs/SentimentDataDTO";

ChartJS.register(
    LinearScale,
    CategoryScale,
    BarElement,
    PointElement,
    LineElement,
    Legend,
    Tooltip,
    LineController,
    BarController
);

const SENTIMENT_OPTIONS = ['happiness', 'sadness', 'anger', 'surprise', 'fear', 'disgust', 'Not relevant'];

const generateSentimentColors = (sentiments: string[]) => {
    const defaultColors: { [key: string]: string } = {
        happiness: 'rgba(255, 99, 132, 0.7)',
        sadness: 'rgba(54, 162, 235, 0.7)',
        anger: 'rgba(255, 206, 86, 0.7)',
        surprise: 'rgba(75, 192, 192, 0.7)',
        fear: 'rgba(153, 102, 255, 0.7)',
        disgust: 'rgba(255, 159, 64, 0.7)',
    };
    return sentiments.map((sentiment) => defaultColors[sentiment]);
};


const CrossFeatureSentiments = () => {
    const [data, setData] = useState<ReviewDataDTO[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [labels, setLabels] = useState(SENTIMENT_OPTIONS);
    const [sentimentColors, setSentimentColors] = useState(generateSentimentColors(SENTIMENT_OPTIONS));
    const [featureColors, setFeatureColors] = useState(generateSentimentColors(SENTIMENT_OPTIONS));
    const [features, setFeatures] = useState<string[]>([]);
    const [sentiments, setSentiments] = useState<string[]>([]);
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

    useEffect(() => {
        updateChartData();
    }, [selectedFeatures, selectedFeature, data, startDate, endDate]);

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const generateRandomColors = (count: number) => {
        const colors = Array.from({ length: count }, () => getRandomColor());
        return colors;
    };

    const fetchReviewDataFromApp = async () => {
        if (selectedApp) {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsDetailedFromApp(selectedApp);
                if (response !== null) {
                    const reviews = response.reviews;
                    const features = extractFeaturesFromReviews(reviews);
                    const sentiments = extractSentimentsFromReviews(reviews);
                    const filteredSentiments = sentiments.filter(sentiment =>
                        sentiment.toLowerCase() !== 'not relevant');
                    setData(reviews);
                    setFeatures(features);
                    setSentiments(filteredSentiments)
                    setFeatureColors(generateRandomColors(features.length));
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const extractSentimentsFromReviews = (reviews: ReviewDataDTO[]) => {
        const allSentiments = reviews.reduce(
            (sentiments, review) => sentiments.concat((review.sentiments || []).map(sentimentObj => sentimentObj.sentiment)),
            [] as string[]
        );
        return Array.from(new Set(allSentiments));
    };

    const extractFeaturesFromReviews = (reviews: ReviewDataDTO[]) => {
        const allFeatures = reviews.reduce(
            (features, review) => features.concat(review.features || []),
            [] as string[]
        );
        return Array.from(new Set(allFeatures));
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

    const countSentimentsByDate = (reviews: ReviewDataDTO[], selectedFeatures: string[]) => {
        const dateSentimentCounts: Record<string, Record<string, number>> = {};

        reviews.forEach((review) => {
            const dateParts = review.date.split('/');
            const reviewDate = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`).toDateString();
            dateSentimentCounts[reviewDate] = dateSentimentCounts[reviewDate] || {};

            if (selectedFeatures.length === 0 || selectedFeatures.some(feature => (review.features || []).includes(feature))) {
                (review.sentiments || []).forEach((sentiment: SentimentDataDTO) => {
                    dateSentimentCounts[reviewDate][sentiment.sentiment] =
                        (dateSentimentCounts[reviewDate][sentiment.sentiment] || 0) + 1;
                });
            }
        });

        return dateSentimentCounts;
    };

    const updateChartData = () => {
        if (selectedApp && data && selectedFeatures.length > 0) {
            const featureDateCounts = countFeatureOccurrencesByDate(data);
            const sentimentDateCounts = countSentimentsByDate(data, selectedFeatures);
            let dates = Object.keys(featureDateCounts);
            dates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
            dates = dates.filter((date) => {
                const currentDate = new Date(date).getTime();
                const start = startDate ? new Date(startDate).getTime() : 0;
                const end = endDate ? new Date(endDate).getTime() : Infinity;
                return currentDate >= start && currentDate <= end;
            });

            const featureDatasets = selectedFeatures.map((feature, index) => {
                const dataPoints = dates.map((date) => featureDateCounts[date][feature] || 0);
                return {
                    data: dataPoints,
                    type: 'line' as const,
                    borderWidth: 1,
                    label: feature,
                    borderColor: featureColors[index],
                    fill: false,
                };
            });

            const sentimentDatasets = labels.map((sentiment, index) => {
                const dataPoints = dates.map((date) => sentimentDateCounts[date][sentiment] || 0);
                return {
                    data: dataPoints,
                    type: 'bar' as const,
                    borderWidth: 1,
                    label: sentiment,
                    backgroundColor: sentimentColors[index],
                };
            });

            const chartData = {
                labels: dates,
                datasets: [...featureDatasets, ...sentimentDatasets],
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
        const chartData = updateChartData();
        if (chartData) {
            return <Chart type='bar' data={chartData} options={options}/>;
        } else {
            return <p>Select an app and at least one feature.</p>;
        }
    };

    const addFeature = () => {
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
    };

    return (
        <Container className="sentiment-histogram-container">
            <Row className="mt-4">
                <Col>
                    <label className="text-secondary mb-2">Features and sentiments chart</label>
                </Col>
                <Col className="col-md-4 d-flex align-self-end justify-content-end">
                    <Button
                        className="btn-secondary btn-sm btn-square"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <i className="mdi mdi-arrow-expand" />
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
                            <option key={app.id} value={app.id}>
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
                        onClick={addFeature}
                    >
                        <i className="mdi mdi-plus" />
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
                <Modal
                    fullscreen="xxl-down"
                    show={isModalOpen}
                    onHide={() => setIsModalOpen(false)}
                    size="lg"
                    centered
                    style={{ maxWidth: '95vw', maxHeight: '95vh' }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Combined Chart</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{data && selectedApp ? renderChart() : <p>Select an app and at least one feature</p>}</Modal.Body>
                </Modal>
            ) : null}
        </Container>
    );
};

export default CrossFeatureSentiments;
