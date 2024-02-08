import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    LinearScale,
    Tooltip,
    Legend,
    Title,
} from 'chart.js';
import ReviewService from '../../services/ReviewService';
import { ReviewDataDTO } from '../../DTOs/ReviewDataDTO';
import { Container, Row } from 'react-bootstrap';

// Register necessary components from chart.js
ChartJS.register(LinearScale, Tooltip, Legend, Title);

const Top5FeaturesHistogram = () => {
    const [data, setData] = useState<ReviewDataDTO[] | null>(null);
    const [labels, setLabels] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);

    useEffect(() => {
        const fetchDataFromApi = async () => {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsDetailed();
                if (response !== null) {
                    const reviews = response.reviews;
                    const topFeatures = extractTopFeaturesFromReviews(reviews, 5);
                    setData(reviews);
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchDataFromApi();
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

    const extractTopFeaturesFromReviews = (reviews: ReviewDataDTO[], limit: number = 5) => {
        const featureCounts: { [feature: string]: number } = {};

        // Count occurrences of each feature in all reviews
        reviews.forEach((review) => {
            if (review.features) {
                review.features.forEach((feature) => {
                    featureCounts[feature] = (featureCounts[feature] || 0) + 1;
                });
            }
        });

        // Sort features by count in descending order
        const sortedFeatures = Object.keys(featureCounts).sort(
            (a, b) => featureCounts[b] - featureCounts[a]
        );

        // Get the top features up to the specified limit
        const topFeatures = sortedFeatures.slice(0, limit);

        // Update labels and colors for the chart
        setLabels(topFeatures);
        setColors(generateColors(topFeatures.length));

        return topFeatures;
    };

    const chartData = () => {
        return {
            labels: labels,
            datasets: data
                ? [{
                    data: labels.map((feature) =>
                        data.reduce((count, review) =>
                                count + (review.features ? review.features.filter((f) => f === feature).length : 0),
                            0
                        )
                    ),
                    backgroundColor: colors,
                    barThickness: 'flex' as any,
                }]
                : [],
        };
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
            <Bar className="sentiment-histogram-chart" data={chartData()} options={options} />
        </Container>
    );
};

export default Top5FeaturesHistogram;
