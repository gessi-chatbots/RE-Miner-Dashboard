import React, { useEffect, useState } from 'react';
import { PolarArea } from 'react-chartjs-2';
import {
    ArcElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement, PolarAreaController, RadialLinearScale,
    TimeScale,
    Title,
    Tooltip
} from 'chart.js';
import ReviewService from '../../services/ReviewService';
import { ReviewDataDTO } from '../../DTOs/ReviewDataDTO';
import { Container, Row } from 'react-bootstrap';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    TimeScale,
    Title,
    Tooltip,
    Legend,
    PolarAreaController, RadialLinearScale, LineElement, ArcElement
);

const SENTIMENT_OPTIONS = ['happiness', 'sadness', 'anger', 'surprise', 'fear', 'disgust', 'Not relevant'];

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


const AllSentimentsPolarAreaChart = () => {
    const [data, setData] = useState<number[]>([]);
    const [labels, setLabels] = useState(SENTIMENT_OPTIONS);
    const [colors, setColors] = useState(generateColors(SENTIMENT_OPTIONS));

    useEffect(() => {
        const fetchReviewData = async () => {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsDetailed();
                if (response !== null) {
                    const reviews = response.reviews;
                    const sentiments = extractSentimentsFromReviews(reviews);
                    const filteredSentiments = sentiments.filter(sentiment =>
                        sentiment.toLowerCase() !== 'not relevant' && sentiment.toLowerCase() !== 'not-relevant'
                    );                    setLabels(filteredSentiments);
                    setData(countSentiments(reviews, filteredSentiments));
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching review data:', error);
            }
        };

        fetchReviewData();
    }, []);

    const extractSentimentsFromReviews = (reviews: ReviewDataDTO[]) => {
        const allSentiments = reviews.reduce(
            (sentiments, review) => sentiments.concat((review.sentiments || []).map(sentimentObj => sentimentObj.sentiment)),
            [] as string[]
        );
        return Array.from(new Set(allSentiments));
    };
    const countSentiments = (reviews: ReviewDataDTO[], sentiments: string[]) => {
        return sentiments.map((sentiment) =>
            reviews.reduce((count, review) =>
                count + (review.sentiments?.some(sentimentObj => sentimentObj.sentiment === sentiment) ? 1 : 0), 0)
        );
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

    return (
        <Container className="sentiment-histogram-container py-3">
            <Row>
                <label className="text-secondary mb-2">Sentiment polar area</label>
            </Row>
            <Row>
                <PolarArea data={chartData} options={options} />
            </Row>
        </Container>
    );
};

export default AllSentimentsPolarAreaChart;
