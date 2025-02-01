import React, { useEffect, useState } from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    PolarAreaController,
    RadialLinearScale,
    TimeScale,
    Title,
    Tooltip,
} from 'chart.js';
import { Container, Row, Form, Col } from 'react-bootstrap';
import ApplicationService from '../../services/AppService';
import { TopDescriptorsDTO } from "../../DTOs/TopDescriptorsDTO";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    PolarAreaController,
    RadialLinearScale,
    LineElement,
    ArcElement
);

// Keep these colors for emotions.
const defaultEmotionColors: { [key: string]: string } = {
    happiness: 'rgba(255, 99, 132, 0.7)',
    sadness: 'rgba(54, 162, 235, 0.7)',
    anger: 'rgba(255, 206, 86, 0.7)',
    surprise: 'rgba(75, 192, 192, 0.7)',
    fear: 'rgba(153, 102, 255, 0.7)',
    disgust: 'rgba(255, 159, 64, 0.7)',
};

// Extended palette for descriptors other than emotions.
const extendedPalette: string[] = [
    'rgba(255, 99, 132, 0.7)',
    'rgba(54, 162, 235, 0.7)',
    'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)',
    'rgba(153, 102, 255, 0.7)',
    'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)',
    'rgba(83, 102, 255, 0.7)',
    'rgba(255, 203, 64, 0.7)',
    'rgba(100, 159, 64, 0.7)',
    'rgba(123, 99, 132, 0.7)',
    'rgba(154, 162, 235, 0.7)',
    'rgba(255, 156, 86, 0.7)',
    'rgba(75, 200, 192, 0.7)',
];

const generateColors = (labels: string[]): string[] =>
    labels.map(label => defaultEmotionColors[label] || 'rgba(100, 159, 64, 0.7)');

const generateDefaultColors = (labels: string[]): string[] =>
    labels.map((_, index) => extendedPalette[index % extendedPalette.length]);

const DescriptorPolarAreaChart = () => {
    const [chartLabels, setChartLabels] = useState<string[]>([]);
    const [chartDataValues, setChartDataValues] = useState<number[]>([]);
    const [chartColors, setChartColors] = useState<string[]>([]);
    const [descriptorData, setDescriptorData] = useState<TopDescriptorsDTO | null>(null);
    const [selectedDescriptor, setSelectedDescriptor] = useState<'' | 'emotions' | 'polarities' | 'types' | 'topics'>('');

    useEffect(() => {
        const fetchReviewData = async () => {
            const applicationService = new ApplicationService();
            try {
                const topDescriptors = await applicationService.fetchTopDescriptors();
                if (topDescriptors !== null) {
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

        // If no descriptor is selected, default to "emotions"
        const effectiveDescriptor = selectedDescriptor || "emotions";
        let currentData: { sentimentName: string; occurrences: number }[] = [];
        switch (effectiveDescriptor) {
            case 'emotions':
                currentData = descriptorData.topEmotions;
                break;
            case 'polarities':
                currentData = descriptorData.topPolarities;
                break;
            case 'types':
                currentData = descriptorData.topTypes;
                break;
            case 'topics':
                currentData = descriptorData.topOccurrences;
                break;
            default:
                currentData = descriptorData.topEmotions;
        }

        // Process labels and change "UserExperience" to "User Experience"
        const rawLabels = currentData.map(item => item.sentimentName);
        const processedLabels = rawLabels.map(label =>
            label === "UserExperience" ? "User Experience" : label
        );
        const dataValues = currentData.map(item => item.occurrences);
        const colors =
            effectiveDescriptor === 'emotions'
                ? generateColors(rawLabels)
                : generateDefaultColors(rawLabels);

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
                    centerPointLabels: true,
                    font: {
                        size: 18,
                    },
                },
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
                        <Form.Label className="fw-bold text-secondary me-2 mb-0">
                            Descriptor:
                        </Form.Label>
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
