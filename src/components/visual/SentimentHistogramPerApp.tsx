import { useEffect, useState } from 'react';
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

const SentimentHistogramPerApp = () => {
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedApp, setSelectedApp] = useState<string | null>(null);
    const [appData, setAppData] = useState<AppDataSimpleDTO[] | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chartData, setChartData] = useState<any>({ labels: [], datasets: [] });
    const [showChart, setShowChart] = useState(false); // New state to control chart visibility

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
                const statisticsData = await applicationService.getStatisticsOverTime(selectedApp, parsedStartDate, parsedEndDate);
                if (statisticsData !== null) {
                    const { statistics } = statisticsData;
    
                    const sentimentOccurrencesByDate: { [date: string]: { [sentiment: string]: number } } = {};
                    statistics.forEach((dayStatistics: ApplicationDayStatisticsDTO) => {
                        const currentDate = new Date(dayStatistics.date).toISOString().split('T')[0];
                        if (!sentimentOccurrencesByDate[currentDate]) {
                            sentimentOccurrencesByDate[currentDate] = {};
                        }
                        dayStatistics.sentimentOccurrences.forEach((sentiment) => {
                            sentimentOccurrencesByDate[currentDate][sentiment.sentimentName] = (sentimentOccurrencesByDate[currentDate][sentiment.sentimentName] || 0) + sentiment.occurrences;
                        });
                    });
    
                    const uniqueSentiments = Array.from(new Set(statistics.flatMap((dayStatistics: ApplicationDayStatisticsDTO) => dayStatistics.sentimentOccurrences.map((sentiment) => sentiment.sentimentName))));
                    uniqueSentiments.sort();

    
                    const chartData = {
                        labels: Object.keys(sentimentOccurrencesByDate).sort(),
                        datasets: uniqueSentiments.map((sentiment) => ({
                            label: sentiment,
                            data: Object.keys(sentimentOccurrencesByDate)
                                .sort()
                                .map((date) => sentimentOccurrencesByDate[date][sentiment] || 0),
                            backgroundColor: generateColors([sentiment])[0],
                        })),
                    };
                    
                    setChartData(chartData);
                    setShowChart(true); // Show chart when data is fetched and processed
                }
            } catch (error) {
                console.error('Error fetching statistics data:', error);
            }
        } else {
            console.error('Please select an app, start date, and end date before adding to the chart.');
        }
    };

    return (
        <Container className="sentiment-histogram-container">
            <Row className="mt-4">
                <Col>
                    <label className="text-secondary mb-2">Emotion Histogram</label>
                </Col>
                <Col md={2} className="d-flex align-items-end">
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
            <Row className="mb-2">
                <Col md={6}>
                    <label className="form-label">App: </label>
                    <select
                        value={selectedApp || ''}
                        className="form-select"
                        onChange={(e) => setSelectedApp(e.target.value)}
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
                    {showChart && selectedApp && startDate && endDate && (
                        <Bar data={chartData} options={options} />
                    )}
                </Col>
            </Row>
            {isModalOpen && (
                <Modal show={isModalOpen} onHide={() => setIsModalOpen(false)} size="lg" centered style={{ maxWidth: '95vw', maxHeight: '95vh' }}>
                    <Modal.Header closeButton>
                        <Modal.Title>Sentiment Histogram</Modal.Title>
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

export default SentimentHistogramPerApp;
