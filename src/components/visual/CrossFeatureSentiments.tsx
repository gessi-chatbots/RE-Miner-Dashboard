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
import { ReviewDataDTO } from '../../DTOs/ReviewDataDTO';
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

const SENTIMENT_OPTIONS = ['happiness', 'sadness', 'anger', 'surprise', 'fear', 'disgust', 'Not relevant'];

const CrossFeatureSentiments = () => {
    const [data, setData] = useState<ReviewDataDTO[]>([]);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [labels, setLabels] = useState<string[]>(SENTIMENT_OPTIONS);
    const [sentimentColors, setSentimentColors] = useState<string[]>([]);
    const [featureColors, setFeatureColors] = useState<string[]>([]);
    const [features, setFeatures] = useState<string[]>([]);
    const [sentiments, setSentiments] = useState<string[]>([]);
    const [statisticsData, setStatisticsData] = useState<ApplicationDayStatisticsDTO[]>([]);
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [chartData, setChartData] = useState<any>({});

    useEffect(() => {
        const fetchAppDataFromService = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsNamesSimple();
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

    useEffect(() => {
        if (selectedApp) {
            setSelectedFeatures([]);
        }
    }, [selectedApp]);

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

    const generateColors = (sentiments: string[], featuresCount: number) => {
        const defaultSentimentColors: { [key: string]: string } = {
            happiness: 'rgba(255, 99, 132, 0.7)',
            sadness: 'rgba(54, 162, 235, 0.7)',
            anger: 'rgba(255, 206, 86, 0.7)',
            surprise: 'rgba(75, 192, 192, 0.7)',
            fear: 'rgba(153, 102, 255, 0.7)',
            disgust: 'rgba(255, 159, 64, 0.7)',
        };
    
        // Generate random colors for features
        const featureColors = Array.from({ length: featuresCount }, () => getRandomColor());
    
        // Use default colors for sentiments and random colors for features
        const colors: string[] = [];
        sentiments.forEach((sentiment) => {
            if (defaultSentimentColors[sentiment]) {
                colors.push(defaultSentimentColors[sentiment]);
            } else {
                colors.push(getRandomColor());
            }
        });
    
        // Append random colors for the remaining features
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

    const handleAddButtonClick = async () => {
        if (selectedApp && selectedFeature && startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);

            try {
                const applicationService = new AppService();
                const statisticsData = await applicationService.getStatisticsOverTime(selectedApp, parsedStartDate, parsedEndDate);
                if (statisticsData != null) {
                    const { statistics } = statisticsData;
                    setStatisticsData(statistics);
                    const filteredData = statistics.filter((data: any) => {
                        return data.featureOccurrences.find((occurrence: any) => occurrence.featureName === selectedFeature);
                    });
                    if (filteredData && filteredData.length > 0) {
                        formatChartData(filteredData);
                    } else {
                        console.error('Filtered data is null or empty.');
                    }
                    
                }
            } catch (error) {
                console.error('Error fetching statistics data:', error);
            }
        } else {
            console.error('Please select an app, feature, start date, and end date before adding to the chart.');
        }
    };

    const formatChartData = (data: ApplicationDayStatisticsDTO[]) => {
        const labels = data.map((entry) => {
            const date = new Date(entry.date);
            return `${date.getFullYear().toString().slice(-2)}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        });
    
        const sentimentOccurrences: { [key: string]: number[] } = {};
        const featureOccurrences: { [key: string]: number[] } = {};
    
        data.forEach((entry, dataIndex) => {
            entry.sentimentOccurrences.forEach((sentimentOccurrence) => {
                if (!sentimentOccurrences[sentimentOccurrence.sentimentName]) {
                    sentimentOccurrences[sentimentOccurrence.sentimentName] = Array(labels.length).fill(0);
                }
                sentimentOccurrences[sentimentOccurrence.sentimentName][dataIndex] = sentimentOccurrence.occurrences;
            });
    
            entry.featureOccurrences.forEach((featureOccurrence) => {
                if (!featureOccurrences[featureOccurrence.featureName]) {
                    featureOccurrences[featureOccurrence.featureName] = Array(labels.length).fill(0);
                }
                featureOccurrences[featureOccurrence.featureName][dataIndex] = featureOccurrence.occurrences;
            });
        });
    
        const sentimentData: any[] = [];
        const featureData: any[] = [];
    
        Object.keys(sentimentOccurrences).forEach((sentimentName, index) => {
            sentimentData.push({
                label: sentimentName,
                backgroundColor:generateSentimentColors([sentimentName])[0],
                data: sentimentOccurrences[sentimentName],
                type: 'bar'
            });
        });
    
        if (selectedFeature) {
            const featureColorIndex = features.indexOf(selectedFeature) % featureColors.length;
            featureData.push({
                label: selectedFeature,
                borderColor: 'rgb(75, 192, 192)',
                data: featureOccurrences[selectedFeature] || Array(labels.length).fill(0), 
                fill: false,
                type: 'line'
            });
        }
    
        // Update chart data state
        setChartData({
            labels,
            datasets: [...sentimentData, ...featureData]
        });
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
                                handleAppChange(selectedAppId);
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
                        onClick={handleAddButtonClick}
                    >
                        <i className="mdi mdi-plus"/>
                    </Button>
                </Col>
            </Row>
            <Row>
                {chartData.labels && chartData.datasets ? (
                    <Chart type='bar' data={chartData} options={options}/>
                ) : (
                    null
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
                        <Modal.Title>Features and sentiments Chart</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{data && selectedApp ? <Chart type='bar' data={chartData} options={options}/> : <p>Select an app and at least one feature</p>}</Modal.Body>
                </Modal>
            ) : null}
        </Container>
    );
};

export default CrossFeatureSentiments;
