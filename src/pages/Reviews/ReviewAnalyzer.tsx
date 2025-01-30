import React, { useEffect, useState } from "react";
import ReviewService from "../../services/ReviewService";
import { ReviewDataDTO } from "../../DTOs/ReviewDataDTO";
import {useNavigate, useParams} from "react-router-dom";
import {Row, Col, OverlayTrigger, Tooltip, Button} from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import FileUploader from "../../components/files/FileUploader";

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
    return sentiments.map((sentiment) => defaultColors[sentiment] || '#d3d3d3');
};

const FeatureBadge: React.FC<{ feature: string }> = ({ feature }) => {
    const formatText = (text: string) => {
        return text.replace(/([A-Z])/g, ' $1').toLowerCase().trim();
    };

    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 10px',
                borderRadius: '12px',
                backgroundColor: '#F0F9FF',
                border: '1px solid #BAE6FD',
                color: '#0369A1',
                fontSize: '12px',
                fontWeight: 500,
                letterSpacing: '0.2px',
                margin: '2px',
            }}
        >
            {formatText(feature)}
        </div>
    );
};

const PolarityIcon: React.FC<{ polarity: string }> = ({ polarity }) => {
    if (polarity.toLowerCase() === 'positive') {
        return (
            <div className="d-inline-flex text-success">
                <i className="mdi mdi-emoticon-happy-outline me-1" style={{ fontSize: '24px' }} />
            </div>
        );
    } else if (polarity.toLowerCase() === 'negative') {
        return (
            <div className="d-inline-flex text-danger">
                <i className="mdi mdi-emoticon-sad-outline me-1" style={{ fontSize: '24px' }} />
            </div>
        );
    }
    return <span>{polarity || 'N/A'}</span>;
};

const Badge: React.FC<{ label: string, styles: any }> = ({ label, styles }) => (
    <div
        style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '4px 10px',
            borderRadius: '12px',
            backgroundColor: styles.bg,
            border: `1px solid ${styles.border}`,
            color: styles.color,
            fontSize: '12px',
            fontWeight: 500,
            letterSpacing: '0.2px',
            margin: '4px',
        }}
    >
        <i className={`${styles.icon} me-1`} style={{ fontSize: '14px' }} />
        {label.charAt(0).toUpperCase() + label.slice(1).toLowerCase()}
    </div>
);

const getTypeStyles = (type: string) => {
    switch (type.toLowerCase()) {
        case 'bug': return { icon: 'mdi mdi-bug-outline', bg: '#FFE6E6', color: '#D63031', border: '#FFB8B8' };
        case 'rating': return { icon: 'mdi mdi-star-outline', bg: '#FFF4E6', color: '#E67E22', border: '#FFD8A8' };
        case 'feature': return { icon: 'mdi mdi-puzzle-outline', bg: '#E6F6FF', color: '#0984E3', border: '#B8E2FF' };
        case 'userexperience': return { icon: 'mdi mdi-account-outline', bg: '#E6FFE6', color: '#00B894', border: '#B8FFB8' };
        default: return { icon: 'mdi mdi-help-circle-outline', bg: '#F5F5F5', color: '#666666', border: '#DDDDDD' };
    }
};

const getTopicStyles = (topic: string) => {
    switch (topic.toLowerCase().trim()) {
        case 'general': return { icon: 'mdi mdi-checkbox-multiple-blank-circle-outline', bg: '#F3F4F6', color: '#4B5563', border: '#D1D5DB' };
        case 'usability': return { icon: 'mdi mdi-gesture-tap', bg: '#EDE9FE', color: '#7C3AED', border: '#DDD6FE' };
        case 'effectiveness': return { icon: 'mdi mdi-target', bg: '#FCE7F3', color: '#DB2777', border: '#FBCFE8' };
        case 'efficiency': return { icon: 'mdi mdi-lightning-bolt', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
        default: return { icon: 'mdi mdi-help-circle-outline', bg: '#F3F4F6', color: '#6B7280', border: '#D1D5DB' };
    }
};

const ReviewAnalyzer = () => {
    const [data, setData] = useState<ReviewDataDTO | null>(null);
    const { reviewId, appId } = useParams();
    const [colors, setColors] = useState(generateColors(SENTIMENT_OPTIONS));
    const navigate = useNavigate();
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
        if (!data || !data.sentences || data.sentences.length === 0) {
            return {
                labels: [],
                datasets: [],
            };
        }

        const sentimentCounts: { [key: string]: number } = {};

        data.sentences.forEach((sentence) => {
            const sentimentKey = sentence?.sentimentData?.sentiment;
            if (sentimentKey) {
                sentimentCounts[sentimentKey] = (sentimentCounts[sentimentKey] || 0) + 1;
            }
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

        // Extract features to mark
        const detectedFeatures = Array.from(
            new Set(
                data.sentences
                    .filter(sentence => sentence.featureData?.feature)
                    .map(sentence => sentence.featureData!.feature.trim())
            )
        );

        // Split the review text into words
        const words = data.review.split(/\s+/);

        // Function to determine if a word is part of any detected feature
        const isFeatureWord = (word: string) => {
            return detectedFeatures.some(feature => feature.toLowerCase().includes(word.toLowerCase()));
        };

        // Render words with tooltips if they are part of a feature
        return (
            <p style={{ lineHeight: '1.6', wordWrap: 'break-word' }}>
                {words.map((word, index) => {
                    if (isFeatureWord(word)) {
                        const fullFeature = detectedFeatures.find(feature =>
                            feature.toLowerCase().includes(word.toLowerCase())
                        );

                        return (
                            <OverlayTrigger
                                key={index}
                                placement="top"
                                overlay={<Tooltip id={`tooltip-feature-${index}`}>{fullFeature}</Tooltip>}
                            >
                        <span
                            style={{
                                fontWeight: 'bold',
                                color: '#0369A1',
                                backgroundColor: '#E0F7FF',
                                borderRadius: '4px',
                                padding: '2px 6px',
                                margin: '0 2px',
                                display: 'inline',
                            }}
                        >
                            {word}
                        </span>
                            </OverlayTrigger>
                        );
                    }

                    return <span key={index} style={{ margin: '0 2px' }}>{word}</span>;
                })}
            </p>
        );

    };
    const markSentimentsInReview = () => {
        if (!data || !data.sentences || data.sentences.length === 0) {
            return <p>{data?.review}</p>;
        }

        return (
            <p>
                {data.sentences.map((sentence, index) => {
                    const sentiment = sentence?.sentimentData?.sentiment || "Not detected";
                    const color = colors[SENTIMENT_OPTIONS.indexOf(sentiment)] || "#d3d3d3";

                    return (
                        <React.Fragment key={index}>
                            <OverlayTrigger
                                placement="right"
                                overlay={<Tooltip id={`tooltip-${index}`}>{sentiment}</Tooltip>}
                            >
                                <span
                                    style={{
                                        backgroundColor: color,
                                        padding: "2px 4px",
                                        borderRadius: "4px",
                                        margin: "1px",
                                    }}
                                >
                                    {`${sentence.text}`}
                                </span>
                            </OverlayTrigger>
                            {index < data.sentences.length - 1 && <span style={{ color: "#aaa", margin: "0 5px" }}> | </span>}
                        </React.Fragment>
                    );
                })}
            </p>
        );
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
            <div className="mb-3">
                <Row className="align-content-center">
                    <Col className="col-md-8">
                        <h1 className="text-secondary">Review Analyzer</h1>
                    </Col>
                    <Col className="col-md-2"></Col>
                    <Col className="col-md-2 d-flex justify-content-end align-items-center">
                        <Button
                            className="btn-secondary p-1 m-0"
                            onClick={() => navigate('/reviews')}
                            style={{ padding: '4px 8px', margin: 0 }}
                        >
                            <i className="mdi mdi-arrow-left" /> Back
                        </Button>
                    </Col>
                </Row>


            </div>


            {data && (
                <Row>
                    <Col md={6}>
                        <div className="px-4 py-4 sentiment-histogram-container">
                            <Row>
                                <h2>App Review</h2>
                                <p>{data.app_name}</p>
                            </Row>
                            <Row>
                                <h2>Review Id</h2>
                                <p>{data.reviewId}</p>
                            </Row>
                            {data.sentences && data.sentences.length > 0 && (
                                <Row>
                                    <h2>Review Sentiments:</h2>
                                    {markSentimentsInReview()}
                                    <h2>Review Marked Features</h2>
                                    {markFeaturesInReview()}
                                </Row>
                            )}
                        </div>

                        <div className="px-4 py-4 sentiment-histogram-container mt-4">
                            <h2>Detected Topics</h2>
                            {data.sentences.some(sentence => sentence.topicData && sentence.topicData.topic) ? (
                                Array.from(new Set(data.sentences
                                    .map(sentence => sentence.topicData?.topic)
                                    .filter(Boolean))).map((topic, index) => (
                                    <Badge key={index} label={topic!} styles={getTopicStyles(topic!)}/>
                                ))
                            ) : (
                                <div className="text-center">
                                    <i className="mdi mdi-emoticon-sad-outline text-secondary"
                                       style={{fontSize: '5rem'}}/>
                                    <p className="mt-3 text-muted">No detected topics.</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-4 sentiment-histogram-container mt-4">
                            <h2>Detected Types</h2>
                            {data.sentences.some(sentence => sentence.typeData && sentence.typeData.type) ? (
                                Array.from(new Set(data.sentences
                                    .map(sentence => sentence.typeData?.type)
                                    .filter(Boolean))).map((type, index) => (
                                    <Badge key={index} label={type!} styles={getTypeStyles(type!)}/>
                                ))
                            ) : (
                                <div className="text-center">
                                    <i className="mdi mdi-emoticon-sad-outline text-secondary"
                                       style={{fontSize: '5rem'}}/>
                                    <p className="mt-3 text-muted">No detected types.</p>
                                </div>
                            )}
                        </div>
                    </Col>

                    <Col md={6}>

                        <div className="px-4 py-4 sentiment-histogram-container">
                            <h2>Review Sentiments</h2>
                            {data.sentences.length > 0 && chartData().datasets.length > 0 && chartData().datasets[0].data.some(count => count > 0) ? (
                                <Bar data={chartData()} options={options}/>
                            ) : (
                                <div className="text-center">
                                    <i className="mdi mdi-emoticon-sad text-secondary" style={{fontSize: '5rem'}}/>
                                    <h2 className="mt-3 text-muted">No sentiment data available.</h2>
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-4 sentiment-histogram-container mt-4">
                            <h2>Detected Features</h2>
                            {data.sentences.some(sentence => sentence.featureData && sentence.featureData.feature !== "") ? (
                                <div style={{display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center'}}>
                                    {data.sentences.map((sentence, index) => (
                                        sentence.featureData && sentence.featureData.feature !== "" && (
                                            <FeatureBadge key={index}
                                                          feature={sentence.featureData.feature.trim() || 'N/A'}/>
                                        )
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center">
                                    <i className="mdi mdi-emoticon-sad text-secondary" style={{fontSize: '5rem'}}/>
                                    <h2 className="mt-3 text-muted">No Feature data available.</h2>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-4 sentiment-histogram-container mt-4">
                            <h2>Detected Polarities</h2>
                            {data.sentences.some(sentence => sentence.polarityData && sentence.polarityData.polarity) ? (
                                Array.from(new Set(data.sentences
                                    .map(sentence => sentence.polarityData?.polarity)
                                    .filter(Boolean)
                                )).map((polarity, index) => (
                                    <PolarityIcon key={index} polarity={polarity!}/>
                                ))
                            ) : (
                                <div className="text-center">
                                    <i className="mdi mdi-emoticon-sad-outline text-secondary"
                                       style={{fontSize: '5rem'}}/>
                                    <p className="mt-3 text-muted">No detected polarities.</p>
                                </div>
                            )}
                        </div>
                    </Col>
                </Row>
            )}
        </>
    );
};

export default ReviewAnalyzer;
