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
import { Button, Col, Container, Modal, Row, Form } from 'react-bootstrap';
import AppService from '../../services/AppService';
import { ApplicationDayStatisticsDTO } from '../../DTOs/ApplicationDayStatisticsDTO';
import { AppDataSimpleDTO } from '../../DTOs/AppDataSimpleDTO';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

// Descriptor-specific color mappings
const descriptorColors: { [key: string]: string } = {
    happiness: 'rgba(255, 99, 132, 0.7)',
    sadness: 'rgba(54, 162, 235, 0.7)',
    anger: 'rgba(255, 206, 86, 0.7)',
    surprise: 'rgba(75, 192, 192, 0.7)',
    fear: 'rgba(153, 102, 255, 0.7)',
    disgust: 'rgba(255, 159, 64, 0.7)',
    positive: '#4bf4a7',
    negative: '#ff4c4c',
    neutral: '#4781f6',
    general: '#4981f1',
    usability: '#6746f6',
    effectiveness: '#fd48af',
    efficiency: '#fad542',
    enjoyability: '#48fa9e',
    cost: '#ffaf49',
    reliability: '#43aff6',
    security: '#f6d344',
    compatibility: '#4280fa',
    learnability: '#9f49fd',
    safety: '#f847ab',
    aesthetics: '#3f8ef6',
    bug: '#ff4242',
    rating: '#ffad46',
    feature: '#46b9fa',
    userexperience: '#40fd40',
};


// Default emotion colors
const defaultEmotionColors: { [key: string]: string } = {
    happiness: 'rgba(255, 99, 132, 0.7)',
    sadness: 'rgba(54, 162, 235, 0.7)',
    anger: 'rgba(255, 206, 86, 0.7)',
    surprise: 'rgba(75, 192, 192, 0.7)',
    fear: 'rgba(153, 102, 255, 0.7)',
    disgust: 'rgba(255, 159, 64, 0.7)',
};

// Extended default color palette for fallback
const extendedPalette: string[] = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
];

// Generate colors based on the descriptor type and labels
const generateColors = (labels: string[], descriptor: string): string[] => {
    return labels.map((label, index) => {
        const lowerLabel = label.toLowerCase();
        switch (descriptor) {
            case 'emotionsAndFeatures':
                return defaultEmotionColors[lowerLabel] || extendedPalette[index % extendedPalette.length];
            case 'topics':
            case 'types':
            case 'polarities':
                return descriptorColors[lowerLabel] || extendedPalette[index % extendedPalette.length];
            default:
                return extendedPalette[index % extendedPalette.length];
        }
    });
};

const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
        x: {
            stacked: true,
            title: {
                display: true,
                text: 'Dates',
            },
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.1)',
            },
        },
        y: {
            stacked: true,
            beginAtZero: true,
            title: {
                display: true,
                text: 'Count',
            },
            grid: {
                display: false,
            },
        },
    },
    plugins: {
        legend: {
            position: 'top' as const,
        },
    },
};

const DescriptorHistogram = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [selectedDescriptor, setSelectedDescriptor] = useState<'' | 'emotionsAndFeatures' | 'polarities' | 'types' | 'topics'>('');
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [showChart, setShowChart] = useState(false);

    // Fetch available apps on component mount
    useEffect(() => {
        const fetchAppDataFromService = async () => {
            const appService = new AppService();
            try {
                const response = await appService.fetchAllAppsPackages();
                if (response !== null) {
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

    const handleDescriptorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDescriptor(e.target.value as '' | 'emotionsAndFeatures' | 'polarities' | 'types' | 'topics');
    };

    const handleAddButtonClick = async () => {
        if (selectedApp && selectedDescriptor) {
            const parsedStartDate = startDate ? new Date(startDate) : null;
            const parsedEndDate = endDate ? new Date(endDate) : null;

            try {
                const applicationService = new AppService();
                const statisticsData = await applicationService.getStatisticsOverTime(
                    selectedApp,
                    selectedDescriptor,
                    parsedStartDate,
                    parsedEndDate
                );

                if (statisticsData && Array.isArray(statisticsData)) {
                    const statistics = statisticsData;

                    const getOccurrencesByDescriptor = (dayStatistics: ApplicationDayStatisticsDTO) => {
                        switch (selectedDescriptor) {
                            case 'emotionsAndFeatures':
                                return dayStatistics.emotionOccurrences.map((e) => ({
                                    name: e.emotion,
                                    occurrences: e.occurrences,
                                }));
                            case 'topics':
                                return dayStatistics.topicOccurrences.map((t) => ({
                                    name: t.topic,
                                    occurrences: t.occurrences,
                                }));
                            case 'types':
                                return dayStatistics.typeOccurrences.map((t) => ({
                                    name: t.type,
                                    occurrences: t.occurrences,
                                }));
                            case 'polarities':
                                return dayStatistics.polarityOccurrences.map((p) => ({
                                    name: p.polarity,
                                    occurrences: p.occurrences,
                                }));
                            default:
                                return [];
                        }
                    };

                    const occurrencesByDate: { [date: string]: { [name: string]: number } } = {};
                    statistics.forEach((dayStatistics: ApplicationDayStatisticsDTO) => {
                        const currentDate = new Date(dayStatistics.date).toISOString().split('T')[0];
                        if (!occurrencesByDate[currentDate]) occurrencesByDate[currentDate] = {};

                        getOccurrencesByDescriptor(dayStatistics).forEach(({ name, occurrences }) => {
                            occurrencesByDate[currentDate][name] =
                                (occurrencesByDate[currentDate][name] || 0) + occurrences;
                        });
                    });

                    const uniqueNames = Array.from(
                        new Set(
                            statistics.flatMap((dayStatistics) =>
                                getOccurrencesByDescriptor(dayStatistics).map(({ name }) => name)
                            )
                        )
                    );

                    const chartData = {
                        labels: Object.keys(occurrencesByDate).sort(),
                        datasets: uniqueNames.map((name) => ({
                            label: name,
                            data: Object.keys(occurrencesByDate)
                                .sort()
                                .map((date) => occurrencesByDate[date][name] || 0),
                            backgroundColor: generateColors([name], selectedDescriptor)[0],
                        })),
                    };

                    setChartData(chartData);
                    setShowChart(true);
                } else {
                    console.warn('Statistics data is not in the expected format:', statisticsData);
                    setShowChart(false);
                }
            } catch (error) {
                console.error('Error fetching statistics data:', error);
            }
        } else {
            console.error('Please select an app and descriptor before adding to the chart.');
        }
    };

    return (
        <Container className="sentiment-histogram-container py-3">
            <Row className="mb-4 align-items-center">
                <Col>
                    <h3 className="text-secondary text-center mb-0">Descriptor Histogram</h3>
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(true)}>
                        <i className="mdi mdi-arrow-expand" />
                    </Button>
                </Col>
            </Row>

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

            <Row className="mb-2">
                <Col md={6}>
                    <Form.Group controlId="packageSelect">
                        <Form.Label className="fw-bold text-secondary">Package:</Form.Label>
                        <Form.Select value={selectedApp || ''} onChange={(e) => setSelectedApp(e.target.value)}>
                            <option value="" disabled>Select a Package</option>
                            {appData?.map((app) => (
                                <option key={app.app_package} value={app.app_package}>
                                    {app.app_package}
                                </option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </Col>
                <Col md={6}>
                    <Form.Group controlId="descriptorSelect">
                        <Form.Label className="fw-bold text-secondary">Descriptor:</Form.Label>
                        <Form.Select value={selectedDescriptor} onChange={handleDescriptorChange}>
                            <option value="" disabled>Select a Descriptor</option>
                            <option value="emotionsAndFeatures">Emotions</option>
                            <option value="polarities">Polarities</option>
                            <option value="types">Types</option>
                            <option value="topics">Topics</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mt-3 mb-2">
                <Col></Col>
                <Col xs="auto" className="d-flex justify-content-end m-lg-1">
                    <Button variant="secondary" size="sm" onClick={handleAddButtonClick}>
                        <i className="mdi mdi-eye" /> View
                    </Button>
                </Col>
            </Row>

            <Row>
                <Col>
                    {showChart && selectedApp && (
                        <div style={{ height: '50vh', width: '100%' }}>
                            <Bar data={chartData} options={options} />
                        </div>
                    )}
                </Col>
            </Row>

            {isModalOpen && (
                <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg" centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Descriptor Histogram</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{ height: '80vh', width: '100%' }}>
                            {showChart && selectedApp && <Bar data={chartData} options={options} />}
                        </div>
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
};

export default DescriptorHistogram;
