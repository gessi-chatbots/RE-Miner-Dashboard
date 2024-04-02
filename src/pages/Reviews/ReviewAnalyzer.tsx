import React, { useEffect, useState } from "react";
import ReviewService from "../../services/ReviewService";
import { ReviewDataDTO, SentenceDTO } from "../../DTOs/ReviewDataDTO";
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
    const { appId } = useParams();
    const [labels, setLabels] = useState(SENTIMENT_OPTIONS);
    const [colors, setColors] = useState(generateColors(SENTIMENT_OPTIONS));
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    useEffect(() => {
        const fetchReviewFromApi = async () => {
            const reviewService = new ReviewService();
            try {
                if (reviewId) {
                    const response = await reviewService.fetchReview(appId as string, reviewId as string);
                    if (response !== null) {
                        setData(response.review);
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
    }, [reviewId]);

    const chartData = () => {
        if (!data) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const sentimentCounts: { [key: string]: number } = {};

        data.sentences.forEach((sentence) => {
            const sentimentKey = sentence.sentimentData.sentiment;
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
        if (!data || !data.sentences || data.sentences.length === 0) {
            return <p>{data?.review}</p>;
        }

        const sortedFeatures = data.sentences
            .filter(sentence => sentence.featureData !== null)
            .map(sentence => sentence.featureData!.feature)
            .sort((a, b) => b.length - a.length);

        let markedReview = data.review;

        sortedFeatures.forEach((feature) => {
            const marker = `<span class="feature-marker">${feature}<span class="feature-tag">Feature</span></span>`;
            markedReview = markedReview.replace(new RegExp(feature, 'gi'), marker);
        });

        return <p dangerouslySetInnerHTML={{ __html: markedReview }} />;
    };

    const markSentimentsInReview = () => {
        if (!data || !data.sentences || data.sentences.length === 0) {
            return <p>{data?.review}</p>;
        }

        const markedReview = data.sentences.map((sentence, index) => {
            const sentiment = sentence.sentimentData.sentiment;
            const color = sentiment === 'Not relevant' ? 'rgb(213,212,212)' : colors[SENTIMENT_OPTIONS.indexOf(sentiment)];

            return (
                <OverlayTrigger
                    key={index}
                    placement="right"
                    overlay={
                        <Tooltip id={`tooltip-right`}>
                            {`${sentiment}`}
                        </Tooltip>
                    }
                >
                    <span
                        style={{ backgroundColor: color }}
                    >
                        {`${sentence.text} `}
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
                                <h2>Review Marked Features</h2>
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
                                {data?.sentences?.map((sentence, index) => (
                                    sentence.featureData && sentence.featureData.feature !== "" && (
                                        <li key={index}>{sentence.featureData.feature}</li>
                                    )
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
