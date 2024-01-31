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
import {Button, Col, Container, Row} from 'react-bootstrap';
import { AppDataDTO } from '../../DTOs/AppDataDTO';
import AppService from '../../services/AppService';


ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const SentimentHistogram = () => {
    const [data, setData] = useState<ReviewDataDTO[] | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const SENTIMENT_OPTIONS = ['Happiness', 'Sadness', 'Anger', 'Surprise', 'Fear', 'Disgust'];

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

    const fetchDataFromApi = async (appId: string) => {
        const reviewService = new ReviewService();
        try {
            const response = await reviewService.fetchAllReviewsDetailedFromApp(appId);
            if (response !== null) {
                const { reviews: mappedData } = response;
                setData(mappedData);
            } else {
                console.error('Response from fetch all reviews is null');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const fetchReviewDataFromApp = async () => {
        if (selectedApp) {
            fetchDataFromApi(selectedApp);
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
                selectedApp &&
                (!selectedSentiments.length ||
                    (review.sentiments || []).some((sentiment: string) =>
                        selectedSentiments.includes(sentiment)
                    ))
            );
        });
    };

    const chartData = (reviews: ReviewDataDTO[] | null) => {
        const filteredReviews = filterData(reviews || []);
        const dateSentimentCounts = countSentimentsByDate(filteredReviews);
        let dates = Object.keys(dateSentimentCounts);
        dates = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

        const colors: { [key: string]: string } = {
            Happiness: 'rgba(255, 99, 132, 0.7)',
            Sadness: 'rgba(54, 162, 235, 0.7)',
            Anger: 'rgba(255, 206, 86, 0.7)',
            Surprise: 'rgba(75, 192, 192, 0.7)',
            Fear: 'rgba(153, 102, 255, 0.7)',
            Disgust: 'rgba(255, 159, 64, 0.7)',
        };

        const datasets = selectedSentiments.map((selectedSentiment) => {
            const dataPoints = dates.map((date) =>
                dateSentimentCounts[date][selectedSentiment] || 0
            );

            return {
                label: selectedSentiment,
                data: dataPoints,
                backgroundColor: colors[selectedSentiment],
                borderWidth: 1,
                key: selectedSentiment,
            };
        });

        return {
            labels: dates,
            datasets: datasets,
        };
    };

    const countSentimentsByDate = (reviews: ReviewDataDTO[]) => {
        const dateSentimentCounts: Record<string, Record<string, number>> = {};

        reviews.forEach((review) => {
            const dateParts = review.date.split('/');
            const reviewDate = new Date(`${dateParts[1]}/${dateParts[0]}/${dateParts[2]}`).toDateString();
            dateSentimentCounts[reviewDate] = dateSentimentCounts[reviewDate] || {};

            (review.sentiments || []).forEach((sentiment: string) => {
                dateSentimentCounts[reviewDate][sentiment] =
                    (dateSentimentCounts[reviewDate][sentiment] || 0) + 1;
            });
        });

        return dateSentimentCounts;
    };

    const options = {
        plugins: {
            title: {
                display: true,
                text: 'Emotions per date',
            },
        },
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
        <Container className="sentiment-histogram-container py-3">
            <Row>
                <label className="text-secondary mb-2">Sentiment Histogram</label>
            </Row>
            <Row>
                <Col className="col-md-4">
                    <label>Start Date: </label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Col>
                <Col className="col-md-4">
                    <label>End Date: </label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
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
            <Row>
                <Col className="col-md-4 mb-4">
                    <label>App: </label>
                    <select
                        value={selectedApp || ''}
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
            <Row className="mb-2">
                {appData && data && SENTIMENT_OPTIONS.map((sentiment, index) => (
                    <Col key={sentiment}>
                        <Row>
                            <input
                                type="checkbox"
                                id={sentiment}
                                value={sentiment}
                                checked={selectedSentiments.includes(sentiment)}
                                onChange={(e) => {
                                    const isChecked = e.target.checked;
                                    setSelectedSentiments((prev) =>
                                        isChecked
                                            ? [...prev, sentiment]
                                            : prev.filter((s) => s !== sentiment)
                                    );
                                }}
                            />
                        </Row>
                        <Row>
                            <label htmlFor={sentiment} className="ml-1">
                                {sentiment}
                            </label>
                        </Row>
                    </Col>
                ))}
            </Row>
            <Row>
                <Bar className="sentiment-histogram-chart" data={chartData(data)} options={options} />
            </Row>

            {isModalOpen && selectedApp && selectedSentiments.length > 0 && data ? (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <Row className="justify-content-end align-self-end">
                            <Col>
                                <Button
                                    className="btn-danger close-button mb-2"
                                    onClick={() => setIsModalOpen(false)}
                                >
                                    <i className="mdi mdi-close"/>
                                </Button>
                            </Col>
                        </Row>
                        <Bar className="sentiment-histogram-chart" data={chartData(data)} options={options} />
                    </div>
                </div>
            ) : null}
        </Container>
    );
};

export default SentimentHistogram;
