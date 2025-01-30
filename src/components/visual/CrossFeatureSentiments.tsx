import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, LinearScale, CategoryScale, BarElement, PointElement, LineElement, Legend, Tooltip, LineController, BarController } from 'chart.js';
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

const SENTIMENT_OPTIONS = ['happiness', 'sadness', 'anger', 'surprise', 'fear', 'disgust'];

const CrossFeatureSentiments = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [features, setFeatures] = useState<string[]>([]);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [chartData, setChartData] = useState<any>({});
    const [featureColors, setFeatureColors] = useState<string[]>([]);
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
            console.error('Please select an app, start date, and end date before adding to the chart.');
            return;
        }
    
        if (selectedFeatures.length === 0) {
            console.error('Please select at least one feature before adding to the chart.');
            return;
        }
    
        const parsedStartDate = new Date(startDate);
        const parsedEndDate = new Date(endDate);
    
        try {
            const applicationService = new AppService();
            const statisticsData = await applicationService.getStatisticsOverTime(selectedApp, parsedStartDate, parsedEndDate);
            if (statisticsData != null) {
                const { statistics } = statisticsData;
    
                const labels: string[] = [];
                const featureDatasets: any[] = [];
                const sentimentDatasets: any[] = [];
    
                statistics.forEach(stat => {
                    const formattedDate = new Date(stat.date).toLocaleDateString();
                    if (!labels.includes(formattedDate)) {
                        labels.push(formattedDate);
                    }
                });
    
                selectedFeatures.forEach((selectedFeature, index) => {
                    const data: number[] = [];
    
                    labels.forEach(label => {
                        const stat = statistics.find(stat => new Date(stat.date).toLocaleDateString() === label);
                        if (stat) {
                            const feature = stat.featureOccurrences.find(f => f.featureName === selectedFeature);
                            data.push(feature ? feature.occurrences : 0);
                        } else {
                            data.push(0);
                        }
                    });
    
                    featureDatasets.push({
                        label: formatFeatureName(selectedFeature),
                        data: data,
                        borderColor: getRandomColor(),
                        tension: 0.1,
                        fill: true,
                        type: 'line',
                    });
                });
    
              SENTIMENT_OPTIONS.forEach((sentiment, index) => {
                    const data: number[] = [];
    
                 labels.forEach(label => {
                        const stat = statistics.find(stat => new Date(stat.date).toLocaleDateString() === label);
                        if (stat) {
                            const sentimentOccurrence = stat.sentimentOccurrences.find(s => s.sentimentName === sentiment);
                            data.push(sentimentOccurrence ? sentimentOccurrence.occurrences : 0);
                        } else {
                            data.push(0);
                        }
                    });
    
                    sentimentDatasets.push({
                        label: capitalizeFirstLetter(sentiment),
                        data: data,
                        backgroundColor: generateSentimentColors([sentiment]),
                    });
                });
    
                setChartData({
                    labels: labels,
                    datasets: [...featureDatasets, ...sentimentDatasets]
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

    const formatFeatureName = (feature: string) => {
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
    
        return sentiments.map(sentiment => defaultColors[sentiment] || getRandomColor());
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
        <Container className="sentiment-histogram-container">
            <Row className="mt-4">
                <Col>
                    <label className="text-secondary mb-2">Features and emotions chart</label>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                    <Button className="btn-secondary btn-sm btn-square" onClick={() => setIsModalOpen(true)}>
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
                            <option key={app.app_package} value={app.app_package}>
                                {app.app_name}
                            </option>
                        ))}
                    </select>
                </Col>
                <Col md={6}>
                    <label className="form-label">Feature(s): </label>
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
                                {formatFeatureName(feature)}
                            </option>
                        ))}
                    </select>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                    <Button className="btn-secondary btn-sm btn-square" onClick={handleAddButtonClick}>
                        <i className="mdi mdi-plus" />
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    {chartData.labels && chartData.datasets ? (
                        <Chart type="bar" data={chartData} options={options} />
                    ) : (
                        <p></p>
                    )}
                </Col>
            </Row>
            {isModalOpen && selectedApp ? (
                <Modal
                    fullscreen="xxl-down"
                    show={isModalOpen}
                    onHide={() => setIsModalOpen(false)}
                    size="lg"
                    centered
                    style={{ maxWidth: '95vw', maxHeight: '95vh' }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Features and sentiments chart</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {chartData.labels && chartData.datasets ? (
                            <Chart type="bar" data={chartData} options={options} />
                        ) : (
                            <p>No data to display</p>
                        )}
                    </Modal.Body>
                </Modal>
            ) : null}
        </Container>
    );
};

export default CrossFeatureSentiments;
