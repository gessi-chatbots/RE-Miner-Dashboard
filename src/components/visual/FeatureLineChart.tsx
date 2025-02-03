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
                    setFeatures(response.features);
                } else {
                    console.error('Response from fetch app features is null');
                }
            } catch (error) {
                console.error('Error fetching features:', error);
            }
        }
    };

    const formatFeatureName = (feature: string | null) => {
        return feature?.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    };

    const handleAddButtonClick = async () => {
        if (!selectedApp) {
            console.error('Please select an app before adding to the chart.');
            return;
        }

        if (selectedFeatures.length === 0) {
            console.error('Please select at least one feature before adding to the chart.');
            return;
        }

        try {
            const applicationService = new AppService();
            const statisticsData = await applicationService.getStatisticsOverTime(
                selectedApp,
                "emotionsAndFeatures"
            );

            if (statisticsData != null) {
                const statistics = statisticsData;

                // Extract and sort all unique dates from the response data
                const dates = Array.from(new Set(statistics.map(({ date }: any) => new Date(date).toLocaleDateString()))).sort();

                // Extract data for the selected features
                const formattedData = statistics.reduce((accumulator: any[], { date, featureOccurrences }: any) => {
                    const formattedDate = new Date(date).toLocaleDateString();
                    selectedFeatures.forEach((selectedFeature: string) => {
                        const featureEntry = featureOccurrences.find((occurrence: any) => occurrence.feature === selectedFeature);
                        if (featureEntry) {
                            accumulator.push({
                                date: formattedDate,
                                feature: selectedFeature,
                                occurrences: featureEntry.occurrences,
                            });
                        }
                    });
                    return accumulator;
                }, []);

                // Populate occurrences for each feature on each date
                const datasets: any[] = [];
                selectedFeatures.forEach((selectedFeature: string, index: number) => {
                    const occurrences: number[] = dates.map((date) => {
                        const entry = formattedData.find((entry: any) => entry.date === date && entry.feature === selectedFeature);
                        return entry ? entry.occurrences : 0;
                    });

                    datasets.push({
                        label: formatFeatureName(selectedFeature),
                        data: occurrences,
                        fill: false,
                        borderColor: index < colors.length ? colors[index] : getRandomColor(),
                        tension: 0.1,
                    });
                });

                // Set chart data
                setChartData({
                    labels: dates,
                    datasets: datasets,
                });
            } else {
                console.error('No statistics data returned from the service.');
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
        return Array.from({ length: count }, () => getRandomColor());
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
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
        plugins: {
            legend: {
                position: 'top' as const,  // Use 'as const' to assert the type
            },
        },
    };

    return (
        <Container className="sentiment-histogram-container py-3">
            {/* Header with title and expand button */}
            <Row className="mb-4 align-items-center">
                <Col>
                    <h3 className="text-secondary text-center mb-0">Features over time</h3>
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
                                {formatFeatureName(feature)}
                            </option>
                        ))}
                    </select>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                    <Button variant="secondary" size="sm" onClick={handleAddButtonClick}>
                        <i className="mdi mdi-plus" /> Add
                    </Button>
                </Col>
            </Row>

            {/* Chart */}
            <Row>
                <Col>
                        {chartData.labels && chartData.datasets && (
                            <div style={{height: '50vh', width: '100%'}}>
                                <Line data={chartData} options={options}/>
                            </div>
                        )}

                </Col>
            </Row>

            {/* Modal for expanded view */}
            {isModalOpen && (
                <Modal
                    fullscreen
                    show={isModalOpen}
                    onHide={() => setIsModalOpen(false)}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Features over time</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Row>
                            <Col>
                                <div style={{height: '80vh', width: '100%'}}>

                                    {chartData.labels && chartData.datasets && (
                                        <Line data={chartData} options={options}/>
                                    )}
                                </div>
                            </Col>
                        </Row>
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
};

export default FeatureLineChart;
