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
import { Button, Col, Container, Modal, Row } from 'react-bootstrap';
import AppService from '../../services/AppService';
import { ApplicationDayStatisticsDTO } from '../../DTOs/ApplicationDayStatisticsDTO';
import { AppDataSimpleDTO } from '../../DTOs/AppDataSimpleDTO';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const SENTIMENT_OPTIONS = [
    'happiness',
    'sadness',
    'anger',
    'surprise',
    'fear',
    'disgust',
    'Not relevant',
];

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

const options = {
    responsive: true,
    scales: {
        x: {
            stacked: true,
            title: {
                display: true,
                text: 'Dates',
            },
            grid: {
                display: true,
                color: 'rgba(0, 0, 0, 1)',
                lineWidth: 1,
                drawBorder: false,
                drawOnChartArea: false,
                drawTicks: true,
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
};

const DescriptorHistogram = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [showChart, setShowChart] = useState(false); // Controls chart visibility

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

    const handleAddButtonClick = async () => {
        if (selectedApp && startDate && endDate) {
            const parsedStartDate = new Date(startDate);
            const parsedEndDate = new Date(endDate);

            try {
                const applicationService = new AppService();
                const statisticsData = await applicationService.getStatisticsOverTime(
                    selectedApp,
                    parsedStartDate,
                    parsedEndDate
                );
                if (statisticsData !== null) {
                    const { statistics } = statisticsData;

                    const sentimentOccurrencesByDate: {
                        [date: string]: { [sentiment: string]: number };
                    } = {};
                    statistics.forEach((dayStatistics: ApplicationDayStatisticsDTO) => {
                        const currentDate = new Date(dayStatistics.date)
                            .toISOString()
                            .split('T')[0];
                        if (!sentimentOccurrencesByDate[currentDate]) {
                            sentimentOccurrencesByDate[currentDate] = {};
                        }
                        dayStatistics.sentimentOccurrences.forEach((sentiment) => {
                            sentimentOccurrencesByDate[currentDate][
                                sentiment.sentimentName
                                ] =
                                (sentimentOccurrencesByDate[currentDate][
                                    sentiment.sentimentName
                                    ] || 0) + sentiment.occurrences;
                        });
                    });

                    const uniqueSentiments = Array.from(
                        new Set(
                            statistics.flatMap((dayStatistics: ApplicationDayStatisticsDTO) =>
                                dayStatistics.sentimentOccurrences.map(
                                    (sentiment) => sentiment.sentimentName
                                )
                            )
                        )
                    );
                    uniqueSentiments.sort();

                    const chartData = {
                        labels: Object.keys(sentimentOccurrencesByDate).sort(),
                        datasets: uniqueSentiments.map((sentiment) => ({
                            label: sentiment,
                            data: Object.keys(sentimentOccurrencesByDate)
                                .sort()
                                .map(
                                    (date) => sentimentOccurrencesByDate[date][sentiment] || 0
                                ),
                            backgroundColor: generateColors([sentiment])[0],
                        })),
                    };

                    setChartData(chartData);
                    setShowChart(true); // Display chart after processing data
                }
            } catch (error) {
                console.error('Error fetching statistics data:', error);
            }
        } else {
            console.error(
                'Please select an app, start date, and end date before adding to the chart.'
            );
        }
    };

    return (
        <Container className="sentiment-histogram-container py-3">
            {/* Header with title and Expand button */}
            <Row className="mb-4 align-items-center">
                <Col>
                    <h3 className="text-secondary text-center mb-0">
                        Descriptor Histogram
                    </h3>
                </Col>
                <Col xs="auto" className="d-flex justify-content-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <i className="mdi mdi-arrow-expand" />
                    </Button>
                </Col>
            </Row>

            {/* Date selection */}
            <Row className="mb-2">
                <Col md={6}>
                    <label className="fw-bold text-secondary form-label">Start Date: </label>
                    <input
                        type="date"
                        className="form-control"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </Col>
                <Col md={6}>
                    <label className="fw-bold text-secondary form-label">End Date: </label>
                    <input
                        type="date"
                        className="form-control"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </Col>
            </Row>

            {/* Package selection and Add button */}
            <Row className="mb-2 align-items-end">
                <Col md={6}>
                    <label className="fw-bold text-secondary form-label">Package: </label>
                    <select
                        value={selectedApp || ''}
                        className="form-select"
                        onChange={(e) => setSelectedApp(e.target.value)}
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
                <Col xs="auto">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleAddButtonClick}
                    >
                        <i className="mdi mdi-plus" /> Add
                    </Button>
                </Col>
            </Row>

            {/* Chart */}
            <Row>
                <Col>
                    {showChart && selectedApp && startDate && endDate && (
                        <Bar data={chartData} options={options} />
                    )}
                </Col>
            </Row>

            {/* Modal for expanded view */}
            {isModalOpen && (
                <Modal
                    show={isModalOpen}
                    onHide={() => setIsModalOpen(false)}
                    size="lg"
                    centered
                    style={{ maxWidth: '95vw', maxHeight: '95vh' }}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Descriptor Histogram</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        {showChart && selectedApp && startDate && endDate && (
                            <Bar data={chartData} options={options} />
                        )}
                    </Modal.Body>
                </Modal>
            )}
        </Container>
    );
};

export default DescriptorHistogram;
