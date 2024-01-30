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
import ReviewService from '../../services/ReviewService';
import { ReviewDataDTO } from '../../DTOs/ReviewDataDTO';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title);

const StackedBarChart = () => {
    const [data, setData] = useState<ReviewDataDTO[] | null>(null);
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [selectedSentiments, setSelectedSentiments] = useState<string[]>([]);
    const SENTIMENT_OPTIONS = ['Happiness', 'Sadness', 'Anger', 'Surprise', 'Fear', 'Disgust'];

    useEffect(() => {
        const fetchDataFromApi = async () => {
            const reviewService = new ReviewService();
            try {
                const response = await reviewService.fetchAllReviewsDetailed();
                if (response !== null) {
                    const { reviews: mappedData } = response;
                    setData(mappedData);
                } else {
                    console.error('Response from fetch all reviews is null');
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchDataFromApi();
    }, []);

    const filterData = (reviews: ReviewDataDTO[]) => {
        return reviews.filter((review) => {
            const reviewDate = new Date(review.date);
            const startDateCondition = !startDate || reviewDate >= new Date(startDate);
            const endDateCondition = !endDate || reviewDate <= new Date(endDate);

            return (
                startDateCondition &&
                endDateCondition &&
                (!selectedSentiments.length ||
                    (review.sentiments || []).some((sentiment: string) =>
                        selectedSentiments.includes(sentiment)
                    ))
            );
        });
    };

    const countSentiments = (reviews: ReviewDataDTO[]) => {
        const sentimentCounts: Record<string, number> = {};

        reviews.forEach((review) => {
            (review.sentiments || []).forEach((sentiment: string) => {
                sentimentCounts[sentiment] =
                    (sentimentCounts[sentiment] || 0) + 1;
            });
        });

        return sentimentCounts;
    };

    const chartData = (reviews: ReviewDataDTO[] | null) => {
        const filteredReviews = filterData(reviews || []);
        const dateSentimentCounts = countSentimentsByDate(filteredReviews);
        const dates = Object.keys(dateSentimentCounts);

        const colors: { [key: string]: string } = {
            Happiness: 'rgba(255, 99, 132, 0.7)',
            Sadness: 'rgba(54, 162, 235, 0.7)',
            Anger: 'rgba(255, 206, 86, 0.7)',
            Surprise: 'rgba(75, 192, 192, 0.7)',
            Fear: 'rgba(153, 102, 255, 0.7)',
            Disgust: 'rgba(255, 159, 64, 0.7)',
        };

        const datasets = selectedSentiments.map((selectedSentiment) => {
            const dataPoints = dates.map((date) =>
                dateSentimentCounts[date][selectedSentiment] || 0
            );

            return {
                label: selectedSentiment,
                data: dataPoints,
                backgroundColor: colors[selectedSentiment],
                borderWidth: 1,
                key: selectedSentiment,
            };
        });

        return {
            labels: dates,
            datasets: datasets,
        };
    };

    const countSentimentsByDate = (reviews: ReviewDataDTO[]) => {
        const dateSentimentCounts: Record<string, Record<string, number>> = {};

        reviews.forEach((review) => {
            const reviewDate = new Date(review.date).toLocaleDateString('en-GB');
            dateSentimentCounts[reviewDate] = dateSentimentCounts[reviewDate] || {};

            (review.sentiments || []).forEach((sentiment: string) => {
                dateSentimentCounts[reviewDate][sentiment] =
                    (dateSentimentCounts[reviewDate][sentiment] || 0) + 1;
            });
        });

        return dateSentimentCounts;
    };

    const options = {
        plugins: {
            title: {
                display: true,
                text: 'Emotions per date',
            },
        },
        responsive: true,
        scales: {
            x: {
                stacked: true,
                title: {
                    display: true,
                    text: 'Dates',
                },
            },
            y: {
                stacked: true,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Count',
                },
            },
        },
    };

    return (
        <div>
            <div>
                <label>Start Date: </label>
                <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                />
            </div>
            <div>
                <label>End Date: </label>
                <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                />
            </div>
            <div>
                <label>Select Sentiments: </label>
                {SENTIMENT_OPTIONS.map((sentiment) => (
                    <div key={sentiment}>
                        <input
                            type="checkbox"
                            id={sentiment}
                            value={sentiment}
                            checked={selectedSentiments.includes(sentiment)}
                            onChange={(e) => {
                                const isChecked = e.target.checked;
                                setSelectedSentiments((prev) =>
                                    isChecked
                                        ? [...prev, sentiment]
                                        : prev.filter((s) => s !== sentiment)
                                );
                            }}
                        />
                        <label htmlFor={sentiment}>{sentiment}</label>
                    </div>
                ))}
            </div>
            {data ? (
                <Bar data={chartData(data)} options={options} />
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default StackedBarChart;
