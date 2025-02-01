import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SentimentHistogramPerApp from '../components/visual/SentimentHistogramPerApp';
import DescriptorPolarAreaChart from "../components/visual/DescriptorPolarAreaChart";
import TopFeaturesHistogram from "../components/visual/TopFeaturesHistogram";
import FeatureLineChart from "../components/visual/FeatureLineChart";
import CrossFeatureSentiments from "../components/visual/CrossFeatureSentiments";

const Dashboard = () => {
    return (
        <>
            <h1 className="text-secondary mb-4">Dashboard</h1>
            <Row className="gx-5">
                <Col className="col-md-6 mb-4 ml-3">
                    <Row className="mb-4">
                        <DescriptorPolarAreaChart />
                    </Row>
                    <Row>
                        <SentimentHistogramPerApp />
                    </Row>
                </Col>
                <Col className="col-md-6 mb-4 mr-3">
                    <Row className="mb-4">
                        <TopFeaturesHistogram />
                    </Row>
                    <Row className="mb-4">
                        <FeatureLineChart />
                    </Row>
                    <Row >
                        <CrossFeatureSentiments/>
                    </Row>
                </Col>
            </Row>
        </>
    );
};

export default Dashboard;
