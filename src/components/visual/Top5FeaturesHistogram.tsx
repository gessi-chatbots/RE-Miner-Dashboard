import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import ApplicationService from '../../services/AppService';
import { ReviewDataDTO } from '../../DTOs/ReviewDataDTO';
import { Container, Row } from 'react-bootstrap';

// Register necessary components from chart.js
ChartJS.register(LinearScale, Tooltip, Legend, Title);

const Top5FeaturesHistogram = () => {
    const [data, setData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);
    useEffect(() => {
        const fetchReviewData = async () => {
            const applicationService = new ApplicationService();
            try {
                const response = await applicationService.fetchAllAppsNames();
                if (response !== null) {
                    const applicationsNamesList = response.apps.map(app => app.app_name);
                    try {
                        const featureResponse = await applicationService.fetchTopFeatures(applicationsNamesList);
                        if (featureResponse !== null) {
                            const features: string[] = [];
                            const occurrences: number[] = [];
                            const topFeatures = featureResponse.topFeatures.topFeatures;
                            topFeatures.forEach(item => {
                                features.push(item.featureName);
                                occurrences.push(item.occurrences);
                            });
                            setLabels(features);
                            setData(occurrences);
                            setColors(generateColors(features.length));
                        } else {
                            console.error('Response from fetch top sentiments is null');
                        }
                    } catch (error) {
                        console.error('Error fetching review data:', error);
                    }
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching review data:', error);
            }
        };
        fetchReviewData();
    }, []);


    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    const generateColors = (count: number) => {
        const colors = [];
        for (let i = 0; i < count; i++) {
            colors.push(getRandomColor());
        }
        return colors;
    };



    const chartData = {
        labels: labels,
        datasets: [
            {
                data: data,
                backgroundColor: colors,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: false
            }
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Top Features',
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
        <Container className="sentiment-histogram-container py-3">
            <Row>
                <label className="text-secondary mb-2">Top 5 Features</label>
            </Row>
            <Bar className="sentiment-histogram-chart" data={chartData} options={options} />
        </Container>
    );
};

export default Top5FeaturesHistogram;
