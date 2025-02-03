import React, { useEffect, useState } from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    PolarAreaController,
    RadialLinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import { Container, Row, Form, Col } from 'react-bootstrap';
import ApplicationService from '../../services/AppService';
import { TopDescriptorsDTO } from "../../DTOs/TopDescriptorsDTO";

ChartJS.register(
    CategoryScale,
    LinearScale,
    Title,
    Tooltip,
    Legend,
    PolarAreaController,
    RadialLinearScale,
    ArcElement
);

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

// Extended palette for fallback colors
const extendedPalette: string[] = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
];

// Generate colors based on labels and descriptor type
const generateColors = (labels: string[]): string[] => {
    return labels.map((label, index) => {
        const lowerLabel = label.toLowerCase();
        return descriptorColors[lowerLabel] || extendedPalette[index % extendedPalette.length];
    });
};

// Transform label names to be more readable
const transformLabel = (label: string): string => {
    switch (label.toLowerCase()) {
        case 'userexperience': return 'User Experience';
        default: return label.charAt(0).toUpperCase() + label.slice(1);
    }
};

const DescriptorPolarAreaChart = () => {
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [chartDataValues, setChartDataValues] = useState<number[]>([]);
    const [chartColors, setChartColors] = useState<string[]>([]);
    const [descriptorData, setDescriptorData] = useState<TopDescriptorsDTO | null>(null);
    const [selectedDescriptor, setSelectedDescriptor] = useState<'' | 'emotions' | 'polarities' | 'types' | 'topics'>('emotions');

    useEffect(() => {
        const fetchReviewData = async () => {
            const applicationService = new ApplicationService();
            try {
                const topDescriptors = await applicationService.fetchTopDescriptors();
                if (topDescriptors) {
                    setDescriptorData(topDescriptors);
                } else {
                    console.error('Response from fetchTopDescriptors is null');
                }
            } catch (error) {
                console.error('Error fetching review data:', error);
            }
        };

        fetchReviewData();
    }, []);

    useEffect(() => {
        if (!descriptorData) return;

        let currentData: { sentimentName: string; occurrences: number }[] = [];
        switch (selectedDescriptor) {
            case 'emotions':
                currentData = descriptorData.topEmotions?.map((item) => ({
                    sentimentName: item.emotion || '',
                    occurrences: item.occurrences || 0,
                })) || [];
                break;
            case 'polarities':
                currentData = descriptorData.topPolarities?.map((item) => ({
                    sentimentName: item.polarity || '',
                    occurrences: item.occurrences || 0,
                })) || [];
                break;
            case 'types':
                currentData = descriptorData.topTypes?.map((item) => ({
                    sentimentName: item.type || '',
                    occurrences: item.occurrences || 0,
                })) || [];
                break;
            case 'topics':
                currentData = descriptorData.topOccurrences?.map((item) => ({
                    sentimentName: item.topic || '',
                    occurrences: item.occurrences || 0,
                })) || [];
                break;
            default:
                console.warn('Invalid descriptor:', selectedDescriptor);
                currentData = [];
        }

        if (currentData.length === 0) {
            console.warn(`No data available for descriptor: ${selectedDescriptor}`);
            setChartLabels([]);
            setChartDataValues([]);
            setChartColors([]);
            return;
        }

        // Process labels and occurrences
        const rawLabels = currentData.map(item => item.sentimentName);
        const processedLabels = rawLabels.map(label =>
            label === "UserExperience" ? "User Experience" : label
        );
        const dataValues = currentData.map(item => item.occurrences);

        // Generate colors
        const colors = generateColors(rawLabels);

        setChartLabels(processedLabels);
        setChartDataValues(dataValues);
        setChartColors(colors);
    }, [descriptorData, selectedDescriptor]);

    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                data: chartDataValues,
                backgroundColor: chartColors,
            },
        ],
    };


    const options = {
        responsive: true,
        scales: {
            r: {
                pointLabels: {
                    display: true,
                    font: {
                        size: 14,
                    },
                },
                ticks: {
                    display: true, // Ensure ticks are displayed
                },
            },
        },
        plugins: {
            legend: {
                position: 'top' as const,
            },
        },
    };

    const handleDescriptorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedDescriptor(e.target.value as '' | 'emotions' | 'polarities' | 'types' | 'topics');
    };

    return (
        <Container className="sentiment-histogram-container py-3">
            <Row className="mb-4">
                <Col>
                    <h3 className="text-secondary text-center">Descriptor Analysis</h3>
                </Col>
            </Row>
            <Row className="justify-content-center">
                <PolarArea data={chartData} options={options} />
            </Row>
            <Row className="align-items-center mb-4">
                <Col xs="auto">
                    <Form.Group controlId="topQuantity" className="d-flex align-items-center">
                        <Form.Label className="fw-bold text-secondary me-2 mb-0">Descriptor:</Form.Label>
                        <Form.Select value={selectedDescriptor} onChange={handleDescriptorChange}>
                            <option value="" disabled>Select a descriptor</option>
                            <option value="emotions">Emotions</option>
                            <option value="polarities">Polarities</option>
                            <option value="types">Types</option>
                            <option value="topics">Topics</option>
                        </Form.Select>
                    </Form.Group>
                </Col>
            </Row>
        </Container>
    );
};

export default DescriptorPolarAreaChart;
