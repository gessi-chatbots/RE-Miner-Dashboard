import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, LinearScale, Tooltip, Legend, Title } from 'chart.js';
import ApplicationService from '../../services/AppService';
import { Container, Row, Col, Form } from 'react-bootstrap';

ChartJS.register(LinearScale, Tooltip, Legend, Title);

const TopFeaturesHistogram = () => {
    // State for the visible chart data
    const [data, setData] = useState<number[]>([]);
    const [labels, setLabels] = useState<string[]>([]);
    const [colors, setColors] = useState<string[]>([]);

    // State to store the full dataset from the API
    const [allFeatures, setAllFeatures] = useState<string[]>([]);
    const [allOccurrences, setAllOccurrences] = useState<number[]>([]);

    // State for the selected top quantity (default is 5)
    const [topQuantity, setTopQuantity] = useState<number>(5);

    // State for slider filtering: min and max occurrences, plus a global maximum (rangeMax)
    const [sliderMin, setSliderMin] = useState<number>(0);
    const [sliderMax, setSliderMax] = useState<number>(0);
    const [rangeMax, setRangeMax] = useState<number>(0);

    // Fetch the full features data once on component mount
    useEffect(() => {
        const fetchReviewData = async () => {
            const applicationService = new ApplicationService();
            try {
                const featureResponse = await applicationService.fetchTopFeatures();
                if (featureResponse !== null) {
                    const features: string[] = [];
                    const occurrences: number[] = [];
                    const topFeatures = featureResponse.topFeatures.topFeatures;
                    topFeatures.forEach(item => {
                        const formattedFeatureName = item.featureName
                            .replace(/_/g, ' ')
                            .replace(/\b\w/g, c => c.toUpperCase());
                        features.push(formattedFeatureName);
                        occurrences.push(item.occurrences);
                    });
                    setAllFeatures(features);
                    setAllOccurrences(occurrences);
                } else {
                    console.error('Response from fetch top features is null');
                }
            } catch (error) {
                console.error('Error fetching feature data:', error);
            }
        };
        fetchReviewData();
    }, []);

    // When allOccurrences changes, update the global maximum and the current sliderMax
    useEffect(() => {
        if (allOccurrences.length > 0) {
            const maxOccurrence = Math.max(...allOccurrences);
            setRangeMax(maxOccurrence);
            setSliderMax(maxOccurrence);
        }
    }, [allOccurrences]);

    // Update the visible chart data whenever dependencies change
    useEffect(() => {
        // Filter features by occurrence range (between sliderMin and sliderMax)
        const filteredFeatures: string[] = [];
        const filteredOccurrences: number[] = [];
        for (let i = 0; i < allFeatures.length; i++) {
            const occ = allOccurrences[i];
            if (occ >= sliderMin && occ <= sliderMax) {
                filteredFeatures.push(allFeatures[i]);
                filteredOccurrences.push(occ);
            }
        }
        // Then slice the filtered arrays according to the selected top quantity
        const finalFeatures = filteredFeatures.slice(0, topQuantity);
        const finalOccurrences = filteredOccurrences.slice(0, topQuantity);
        setLabels(finalFeatures);
        setData(finalOccurrences);
        setColors(generateColors(Math.min(topQuantity, finalFeatures.length)));
    }, [topQuantity, allFeatures, allOccurrences, sliderMin, sliderMax]);

    // Utility: Generate a random hex color string
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Generate an array of random colors based on the number of items needed
    const generateColors = (count: number) => {
        const colorArray = [];
        for (let i = 0; i < count; i++) {
            colorArray.push(getRandomColor());
        }
        return colorArray;
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
                display: false,
            },
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

    // Handlers for slider changes
    const handleSliderMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMin = Number(e.target.value);
        if (newMin > sliderMax) {
            setSliderMax(newMin);
        }
        setSliderMin(newMin);
    };

    const handleSliderMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newMax = Number(e.target.value);
        if (newMax < sliderMin) {
            setSliderMin(newMax);
        }
        setSliderMax(newMax);
    };

    return (
        <Container className="sentiment-histogram-container py-3">
            <Row className="mb-4">
                <Col>
                    <h3 className="text-secondary text-center">Top Features</h3>
                </Col>
            </Row>

            <Row className="justify-content-center mb-4">

                <Bar data={chartData} options={options} />

            </Row>

            <Row className="row-cols-1 row-cols-md-2 g-3 justify-content-center mb-3">
                <Col className="ps-5">
                    <Form.Group controlId="topQuantity" className="d-flex align-items-center">
                        <Form.Label className="fw-bold text-secondary me-2 mb-0">
                            Show Top:
                        </Form.Label>
                        <Form.Select
                            value={topQuantity}
                            onChange={(e) => setTopQuantity(Number(e.target.value))}
                            style={{ width: 'auto' }}
                        >
                            <option value="" disabled>
                                Show Top
                            </option>
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                        </Form.Select>
                    </Form.Group>
                </Col>

                <Col>
                    <Form.Group controlId="minOccurrences">
                        <Form.Label className="fw-bold text-secondary">
                            Min Occurrences: {sliderMin}
                        </Form.Label>
                        <Form.Range
                            min={0}
                            max={sliderMax}
                            value={sliderMin}
                            onChange={handleSliderMinChange}
                        />
                    </Form.Group>
                </Col>

                <Col>
                    {/* This cell is intentionally left blank for spacing */}
                </Col>
                <Col>
                    <Form.Group controlId="maxOccurrences">
                        <Form.Label className="fw-bold text-secondary">
                            Max Occurrences: {sliderMax}
                        </Form.Label>
                        <Form.Range
                            min={sliderMin}
                            max={rangeMax}
                            value={sliderMax}
                            onChange={handleSliderMaxChange}
                        />
                    </Form.Group>
                </Col>
            </Row>
        </Container>
    );
};

export default TopFeaturesHistogram;
