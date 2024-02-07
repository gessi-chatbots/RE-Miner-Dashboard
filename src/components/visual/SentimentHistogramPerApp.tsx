import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import ReviewService from '../../services/ReviewService';
import { ReviewDataDTO } from '../../DTOs/ReviewDataDTO';
import {Button, Col, Container, Modal, Row} from 'react-bootstrap';
import { AppDataDTO } from '../../DTOs/AppDataDTO';
import AppService from '../../services/AppService';
import {SentimentDataDTO} from "../../DTOs/SentimentDataDTO";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const SENTIMENT_OPTIONS = ['happiness', 'sadness', 'ager', 'surprise', 'fear', 'disgust', 'Not relevant'];

const generateColors = (sentiments: string[]) => {
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


const SentimentHistogramPerApp = () => {
    const [data, setData] = useState<ReviewDataDTO[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [labels, setLabels] = useState(SENTIMENT_OPTIONS);
    const [colors, setColors] = useState(generateColors(SENTIMENT_OPTIONS));

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
            fetchReviewDataFromApp();
        }
    }, [selectedApp]);



    const fetchReviewDataFromApp = async () => {
        if (selectedApp) {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsDetailedFromApp(selectedApp);
                if (response !== null) {
                    const reviews = response.reviews;
                    const sentiments = extractSentimentsFromReviews(reviews);
                    setData(prevData => [...reviews]);
                    setLabels(prevLabels => [...sentiments]);
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }
    };

    const filterData = (reviews: ReviewDataDTO[]) => {
        return reviews.filter((review) => {
            const dateParts = review.date.split('/');
            const reviewDate = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`);

            const startDateCondition = !startDate || reviewDate >= new Date(startDate);
            const endDateCondition = !endDate || reviewDate <= new Date(endDate);

            return (
                startDateCondition &&
                endDateCondition &&
                selectedApp
            );
        });
    };

    const extractSentimentsFromReviews = (reviews: ReviewDataDTO[]) => {
        const allSentiments = reviews.reduce(
            (sentiments, review) => sentiments.concat((review.sentiments || []).map(sentimentObj => sentimentObj.sentiment)),
            [] as string[]
        );
        return Array.from(new Set(allSentiments));
    };




    const countSentimentsByDate = (reviews: ReviewDataDTO[]) => {
        const dateSentimentCounts: Record<string, Record<string, number>> = {};

        reviews.forEach((review) => {
            const dateParts = review.date.split('/');
            const reviewDate = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`).toDateString();
            dateSentimentCounts[reviewDate] = dateSentimentCounts[reviewDate] || {};

            (review.sentiments || []).forEach((sentiment: SentimentDataDTO) => {
                dateSentimentCounts[reviewDate][sentiment.sentiment] =
                    (dateSentimentCounts[reviewDate][sentiment.sentiment] || 0) + 1;
            });
        });

        return dateSentimentCounts;
    };
    const chartData = () => {
        const filteredReviews = filterData(data || []);
        const dateSentimentCounts = countSentimentsByDate(filteredReviews);
        let dates = Object.keys(dateSentimentCounts);
        dates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const datasets = labels.map((sentiment) => {
            const dataPoints = dates.map((date) =>
                dateSentimentCounts[date][sentiment] || 0
            );

            return {
                data: dataPoints,
                borderWidth: 1,
                label: sentiment,
                backgroundColor: colors[labels.indexOf(sentiment)],
            };
        });

        return {
            labels: dates,
            datasets: datasets,
        };
    };
    const options = {
        responsive: true,
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Dates',
                },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count',
                },
            },
        },
    };

    return (
        <Container className="sentiment-histogram-container">
            <Row className="mt-4">
                <Col>
                    <label className="text-secondary mb-2">Sentiment Histogram</label>
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
            <Row className="mb-2">
                <Col md={6}>
                    <label className="form-label">App: </label>
                    <select
                        value={selectedApp || ''}
                        className="form-select"
                        onChange={(e) => {
                            const selectedAppId = e.target.value || null;
                            setSelectedApp(selectedAppId);
                            if (selectedAppId) {
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
            </Row>
            {selectedApp ? (
                <Row>
                    <Bar className="sentiment-histogram-chart" data={chartData()} options={options} />
                </Row>
            ) : (
                <Row>
                    <p className="text-secondary">Select an application</p>
                </Row>
            )}


            {isModalOpen && selectedApp && data ? (
                <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg" centered style={{ maxWidth: '95vw', maxHeight: '95vh' }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Sentiment Histogram</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Bar className="sentiment-histogram-chart" data={chartData()} options={options} />
                    </Modal.Body>
                </Modal>
            ) : null}
        </Container>
    );
};

export default SentimentHistogramPerApp;
