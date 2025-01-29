import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import AppService from '../../services/AppService';
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import { AppDataSimpleDTO } from '../../DTOs/AppDataSimpleDTO';
import { ApplicationDayStatisticsDTO } from '../../DTOs/ApplicationDayStatisticsDTO';

const FeatureLineChart = () => {
    const [features, setFeatures] = useState<string[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
    const [statisticsData, setStatisticsData] = useState<ApplicationDayStatisticsDTO[]>([]);
    const [chartData, setChartData] = useState<any>({});
    const [colors, setColors] = useState<string[]>([]);

    useEffect(() => {
        const fetchAppDataFromService = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsPackages();
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
    useEffect(() => {
        if (features.length > 0) {
            setColors(generateColors(features.length));
        }
    }, [features]);
    const fetchFeaturesFromApp = async (selectedAppId: string) => {
        if (selectedAppId) {
            const applicationService = new AppService();
            try {
                const response = await applicationService.fetchAppFeatures(selectedAppId);
                if (response !== null) {
                    const features = response.features;
                    setFeatures(features);
                } else {
                    console.error('Response from fetch app features is null');
                }
            } catch (error) {
                console.error('Error fetching features:', error);
            }
        }
    };

    const formatFeatureName = (feature: string | null) => {
        return feature?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
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
    
                // Extract dates and occurrences for the selected features
                const formattedData = statistics.reduce((accumulator: any, { date, featureOccurrences }: any) => {
                    selectedFeatures.forEach((selectedFeature: string) => {
                        const featureEntry = featureOccurrences.find((occurrence: any) => occurrence.featureName === selectedFeature);
                        if (featureEntry) {
                            const formattedDate = new Date(date).toLocaleDateString();
                            accumulator.push({ date: formattedDate, feature: selectedFeature, occurrences: featureEntry.occurrences });
                        }
                    });
                    return accumulator;
                }, []);
    
                // Generate all dates in the range
                const labels: string[] = [];
                for (let date = new Date(parsedStartDate); date <= parsedEndDate; date.setDate(date.getDate() + 1)) {
                    labels.push(date.toLocaleDateString());
                }
    
                // Populate occurrences for each feature on each date
                const datasets: any[] = [];
                selectedFeatures.forEach((selectedFeature: string, index: number) => {
                    const occurrences: number[] = labels.map(date => {
                        const entry = formattedData.find((entry: any) => entry.date === date && entry.feature === selectedFeature);
                        return entry ? entry.occurrences : 0;
                    });
                    datasets.push({
                        label: formatFeatureName(selectedFeature),
                        data: occurrences,
                        fill: false,
                        borderColor: index < colors.length ? colors[index] : getRandomColor(),
                        tension: 0.1
                    });
                });
    
                // Set chart data
                setChartData({
                    labels: labels,
                    datasets: datasets
                });
            }
        } catch (error) {
            console.error('Error fetching statistics data:', error);
        }
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
