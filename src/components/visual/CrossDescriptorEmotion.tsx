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
import AppService from '../../services/AppService';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { AppDataSimpleDTO } from '../../DTOs/AppDataSimpleDTO';
import { ApplicationDayStatisticsDTO } from '../../DTOs/ApplicationDayStatisticsDTO';

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

const SENTIMENT_OPTIONS = ['happiness', 'sadness', 'anger', 'surprise', 'fear', 'disgust'];

const CrossDescriptorEmotion = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [chartData, setChartData] = useState<any>({});
    const [colors, setColors] = useState<string[]>([]);

    useEffect(() => {
        const fetchAppDataFromService = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsPackages();
                if (response !== null && response.apps) {
                    setAppData(response.apps);
                } else {
                    console.error('Response from fetch all apps is null');
                }
            } catch (error) {
                console.error('Error fetching app data:', error);
            }
        };

        fetchAppDataFromService();
    }, []);

    const handleAppChange = async (selectedAppId: string | null) => {
        setSelectedApp(selectedAppId);
        if (selectedAppId) {
            await fetchFeaturesFromApp(selectedAppId);
        }
    };

    const fetchFeaturesFromApp = async (selectedAppId: string) => {
        const applicationService = new AppService();
        try {
            const response = await applicationService.fetchAppFeatures(selectedAppId);
            if (response !== null && response.features) {
                setFeatures(response.features);
                setColors(generateColors(SENTIMENT_OPTIONS, response.features.length));
            } else {
                console.error('Response from fetch app features is null');
            }
        } catch (error) {
            console.error('Error fetching features:', error);
        }
    };

    const handleAddButtonClick = async () => {
        if (!selectedApp || !startDate || !endDate) {
            return;
        }

        if (selectedFeatures.length === 0) {
            return;
        }

        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);

        try {
            const applicationService = new AppService();
            const statisticsData = await applicationService.getStatisticsOverTime(
                selectedApp,
                "features",
                parsedStartDate,
                parsedEndDate
            );
            if (statisticsData != null) {
                const statistics = statisticsData;

                const labels: string[] = [];
                const featureDatasets: any[] = [];
                const sentimentDatasets: any[] = [];

                statistics.forEach((stat) => {
                    const formattedDate = new Date(stat.date).toLocaleDateString();
                    if (!labels.includes(formattedDate)) {
                        labels.push(formattedDate);
                    }
                });

                selectedFeatures.forEach((selectedFeature, index) => {
                    const data: number[] = [];
                    labels.forEach((label) => {
                        const stat = statistics.find(
                            (stat) => new Date(stat.date).toLocaleDateString() === label
                        );
                        if (stat) {
                            const feature = stat.featureOccurrences.find((f) => f.feature === selectedFeature);
                            data.push(feature ? feature.occurrences : 0);
                        } else {
                            data.push(0);
                        }
                    });
                    featureDatasets.push({
                        label: formatfeature(selectedFeature),
                        data: data,
                        borderColor: getRandomColor(),
                        tension: 0.1,
                        fill: true,
                        type: 'line',
                    });
                });

                SENTIMENT_OPTIONS.forEach((sentiment) => {
                    const data: number[] = [];
                    labels.forEach((label) => {
                        const stat = statistics.find(
                            (stat) => new Date(stat.date).toLocaleDateString() === label
                        );
                        if (stat) {
                            const sentimentOccurrence = stat.emotionOccurrences.find(
                                (s) => s.emotion === sentiment
                            );
                            data.push(sentimentOccurrence ? sentimentOccurrence.occurrences : 0);
                        } else {
                            data.push(0);
                        }
                    });
                    sentimentDatasets.push({
                        label: capitalizeFirstLetter(sentiment),
                        data: data,
                        backgroundColor: generateSentimentColors([sentiment])[0],
                    });
                });

                setChartData({
                    labels: labels,
                    datasets: [...featureDatasets, ...sentimentDatasets],
                });
            }
        } catch (error) {
            console.error('Error fetching statistics data:', error);
        }
    };

    const generateColors = (sentiments: string[], featuresCount: number) => {
        const defaultSentimentColors: { [key: string]: string } = {
            happiness: 'rgba(255, 99, 132, 0.7)',
            sadness: 'rgba(54, 162, 235, 0.7)',
            anger: 'rgba(255, 206, 86, 0.7)',
            surprise: 'rgba(75, 192, 192, 0.7)',
            fear: 'rgba(153, 102, 255, 0.7)',
            disgust: 'rgba(255, 159, 64, 0.7)',
        };

        const featureColors = Array.from({ length: featuresCount }, () => getRandomColor());
        const colors: string[] = [];
        sentiments.forEach((sentiment) => {
            if (defaultSentimentColors[sentiment]) {
                colors.push(defaultSentimentColors[sentiment]);
            } else {
                colors.push(getRandomColor());
            }
        });
        for (let i = sentiments.length; i < featuresCount; i++) {
            colors.push(featureColors[i - sentiments.length]);
        }
        return colors;
    };

    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const capitalizeFirstLetter = (word: string) => {
        return word.charAt(0).toUpperCase() + word.slice(1);
    };

    const formatfeature = (feature: string) => {
        return feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const generateSentimentColors = (sentiments: string[]) => {
        const defaultColors: { [key: string]: string } = {
            happiness: 'rgba(255, 99, 132, 0.7)',
            sadness: 'rgba(54, 162, 235, 0.7)',
            anger: 'rgba(255, 206, 86, 0.7)',
            surprise: 'rgba(75, 192, 192, 0.7)',
            fear: 'rgba(153, 102, 255, 0.7)',
            disgust: 'rgba(255, 159, 64, 0.7)',
        };

        return sentiments.map((sentiment) => defaultColors[sentiment] || getRandomColor());
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

    return (
        <Container className="sentiment-histogram-container py-3">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h3 className="text-secondary text-center mb-0">Feature - Emotion</h3>
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                        <i className="mdi mdi-arrow-expand" />
                    </Button>
                </Col>
            </Row>

            {/* Date selection */}
            <Row className="mb-2">
                <Col md={6}>
                    <label className="fw-bold text-secondary form-label">Start Date:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Col>
                <Col md={6}>
                    <label className="fw-bold text-secondary form-label">End Date:</label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Col>
            </Row>

            {/* App and Feature(s) selection */}
            <Row className="mb-4 align-items-end">
                <Col md={4}>
                    <label className="fw-bold text-secondary form-label">Package:</label>
                    <select
                        className="form-select"
                        value={selectedApp || ''}
                        onChange={(e) => {
                            const selectedAppId = e.target.value || null;
                            handleAppChange(selectedAppId);
                        }}
                    >
                        <option value="" disabled>
                            Select a Package
                        </option>
                        {appData?.map((app) => (
                            <option key={app.app_package} value={app.app_package}>
                                {app.app_package}
                            </option>
                        ))}
                    </select>
                </Col>
                <Col md={6}>
                    <label className="fw-bold text-secondary form-label">Feature(s):</label>
                    <select
                        className="form-select"
                        multiple
                        value={selectedFeatures}
                        onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                            setSelectedFeatures(selected);
                        }}
                        style={{
                            height: selectedApp ? '200px' : '35px',
                            minHeight: '35px',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                        }}
                        disabled={!selectedApp}
                    >
                        {features.sort().map((feature) => (
                            <option key={feature} value={feature}>
                                {formatfeature(feature)}
                            </option>
                        ))}
                    </select>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                    <Button variant="secondary" size="sm" onClick={handleAddButtonClick}>
                        <i className="mdi mdi-plus" />
                    </Button>
                </Col>
            </Row>

            {/* Chart */}
            <Row>
                <Col>
                    {chartData.labels && chartData.datasets ? (
                        <Chart type="bar" data={chartData} options={options} />
                    ) : (
                        <p></p>
                    )}
                </Col>
            </Row>

            {/* Modal for expanded view */}
            {isModalOpen && selectedApp && (
                <Modal
                    fullscreen="xxl-down"
                    show={isModalOpen}
                    onHide={() => setIsModalOpen(false)}
                    size="lg"
                    centered
                    style={{ maxWidth: '95vw', maxHeight: '95vh' }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Features and Emotions Chart</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                {chartData.labels && chartData.datasets ? (
                                    <Chart type="bar" data={chartData} options={options} />
                                ) : (
                                    <p>No data to display</p>
                                )}
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
};

export default CrossDescriptorEmotion;
