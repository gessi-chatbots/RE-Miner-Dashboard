import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import AppService from '../../services/AppService';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { AppDataSimpleDTO } from '../../DTOs/AppDataSimpleDTO';
import { ApplicationDayStatisticsDTO } from '../../DTOs/ApplicationDayStatisticsDTO';

const FeatureLineChart = () => {
    const [features, setFeatures] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [statisticsData, setStatisticsData] = useState<ApplicationDayStatisticsDTO[]>([]);
    const [chartData, setChartData] = useState<any>({});

    useEffect(() => {
        const fetchAppDataFromService = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsNamesSimple();
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
        }
    }, [selectedApp]);

    const handleAppChange = async (selectedAppId: string | null) => {
        setSelectedApp(selectedAppId);
        if (selectedAppId) {
            await fetchFeaturesFromApp(selectedAppId);
        }
    };

    const fetchFeaturesFromApp = async (selectedAppId: string) => {
        if (selectedAppId) {
            const applicationService = new AppService();
            try {
                const response = await applicationService.fetchAppFeatures(selectedAppId);
                if (response !== null) {
                    const features = response.features;
                    setFeatures(features);
                    setColors(generateColors(features.length));
                } else {
                    console.error('Response from fetch app features is null');
                }
            } catch (error) {
                console.error('Error fetching features:', error);
            }
        }
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
                    formatChartData(filteredData);
                }
            } catch (error) {
                console.error('Error fetching statistics data:', error);
            }
        } else {
            console.error('Please select an app, feature, start date, and end date before adding to the chart.');
        }
    };

    const formatChartData = (data: any) => {
        const labels = data.map((entry: any) => {
            const date = new Date(entry.date);
            return `${date.getFullYear().toString().slice(-2)}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
        });
        const occurrences = data.map((entry: any) => {
            const feature = entry.featureOccurrences.find((occurrence: any) => occurrence.featureName === selectedFeature);
            return feature ? feature.occurrences : 0;
        });
    
        setChartData({
            labels: labels,
            datasets: [{
                label: selectedFeature,
                data: occurrences,
                fill: false,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        });
    };

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
                    <label className="text-secondary mb-2">Features over time</label>
                </Col>
                <Col md={2} className="d-flex align-items-end">
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
                <Col>
                    {chartData.labels && chartData.datasets && (
                        <Line data={chartData} options={options} />
                    )}
                </Col>
            </Row>
            {isModalOpen && (
                <Modal
                    fullscreen="xxl-down"
                    show={isModalOpen}
                    onHide={() => setIsModalOpen(false)}
                    size="lg"
                    centered
                    style={{ maxWidth: '95vw', maxHeight: '95vh' }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Features over time</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Col>
                            {chartData.labels && chartData.datasets && (
                                <Line data={chartData} options={options} />
                            )}
                        </Col>
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
};

export default FeatureLineChart;
