import React, { useEffect, useState } from "react";
import ReviewService from "../../services/ReviewService";
import { ReviewDataDTO } from "../../DTOs/ReviewDataDTO";
import { useParams } from "react-router-dom";
import { Row, Col, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Bar } from "react-chartjs-2";

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

const ReviewAnalyzer = () => {
    const [data, setData] = useState<ReviewDataDTO | null>(null);
    const { reviewId } = useParams();
    const [labels, setLabels] = useState(SENTIMENT_OPTIONS);
    const [colors, setColors] = useState(generateColors(SENTIMENT_OPTIONS));
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchReviewFromApi = async () => {
            const reviewService = new ReviewService();
            try {
                if (reviewId) {
                    const response = await reviewService.fetchReview(reviewId);
                    if (response !== null) {
                        const { review: fetchedData } = response;
                        setData(fetchedData);
                    } else {
                        console.error("Response from fetch review is null");
                    }
                } else {
                    console.error("ReviewId is undefined");
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchReviewFromApi();
    }, [reviewId, setData]);

    const chartData = () => {
        if (!data) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const sentimentCounts: { [key: string]: number } = {};

        data?.sentiments?.forEach((sentiment) => {
            const sentimentKey = sentiment.sentiment;
            sentimentCounts[sentimentKey] = (sentimentCounts[sentimentKey] || 0) + 1;
        });

        const chartLabels = Object.keys(sentimentCounts);
        const chartDataValues = chartLabels.map((sentiment) => sentimentCounts[sentiment]);

        const dataset = {
            label: 'Sentiment',
            data: chartDataValues,
            backgroundColor: chartLabels.map(sentiment =>
                sentiment === 'Not relevant' ? 'rgb(213,212,212)' : colors[SENTIMENT_OPTIONS.indexOf(sentiment)]
            ),
        };


        return {
            labels: chartLabels,
            datasets: [dataset],
        };
    };
    const markFeaturesInReview = () => {
        if (!data || !data.features || data.features.length === 0) {
            return <p>{data?.review}</p>;
        }

        const sortedFeatures = data.features.sort((a, b) => b.length - a.length);
        let markedReview = data.review;

        sortedFeatures.forEach((feature) => {
            const marker = `<span class="feature-marker">${feature}<span class="feature-tag">Feature</span></span>`;
            markedReview = markedReview.replace(new RegExp(feature, 'gi'), marker);
        });

        return <p dangerouslySetInnerHTML={{ __html: markedReview }} />;
    };



    const markSentimentsInReview = () => {
        if (!data || !data.sentiments || data.sentiments.length === 0) {
            return <p>{data?.review}</p>;
        }

        const markedReview = data.sentiments.map((sentiment, index) => {
            let color: string
            color = colors[SENTIMENT_OPTIONS.indexOf(sentiment.sentiment)];
            if (sentiment.sentiment === 'Not relevant')
                color = 'rgb(213,212,212)'


            return (
                <OverlayTrigger
                    key={index}
                    placement="right"
                    overlay={
                        <Tooltip id={`tooltip-right`}>
                            {`${sentiment.sentiment}`}
                        </Tooltip>
                    }
                >
                <span
                    style={{ backgroundColor: color }}
                >
                    {`${sentiment.sentence} `}
                </span>
                </OverlayTrigger>
            );
        });

        return <p>{markedReview}</p>;
    };






    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Sentiments',
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
        <>
            <h1 className="text-secondary mb-4">Review Analyzer</h1>
            {data && (
                <Row>
                    <Col md={6}>
                        <div className="px-4 py-4 sentiment-histogram-container">
                            <Row>
                                <h2>App Review</h2>
                                <p>{data.app_name} </p>
                            </Row>
                            <Row>
                                <h2>Review Id</h2>
                                <p>{data.reviewId} </p>
                            </Row>
                            <Row>
                                <h2> Review Content: </h2>
                                {markSentimentsInReview()}
                            </Row>
                            <Row>
                                <h2> Review Marked Features: </h2>
                                {markFeaturesInReview()}
                            </Row>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="px-4 py-4 sentiment-histogram-container">
                            <h2>Review Sentiments</h2>
                            <Bar data={chartData()} options={options} />
                        </div>

                        <div className="px-4 py-4 mt-4 sentiment-histogram-container">
                            <h2>Detected Features</h2>
                            <ul>
                                {data?.features?.map((feature, index) => (
                                    <li key={index}>{feature}</li>
                                ))}
                            </ul>
                        </div>
                    </Col>
                </Row>
            )}
        </>
    );
};

export default ReviewAnalyzer;