import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import SentimentHistogram from '../components/visual/SentimentHistogram';
import PolarAreaChart from "../components/visual/PolarAreaChart";

const Dashboard = () => {
    return (
        <>
            <h1 className="text-secondary">Dashboard</h1>
            <Row className="mb-4">
                <Col className="col-md-6 mb-4 mr-5">
                    <PolarAreaChart />
                </Col>
                <Col className="col-md-6 mb-4 ml-5">
                    <SentimentHistogram />
                </Col>
            </Row>
            <Row>
                <Col className="col-md-6 mb-4 mr-5">
                    <SentimentHistogram />
                </Col>
                <Col className="col-md-6 mb-4 ml-5">
                    <SentimentHistogram />
                </Col>
            </Row>
        </>
    );
};

export default Dashboard;
